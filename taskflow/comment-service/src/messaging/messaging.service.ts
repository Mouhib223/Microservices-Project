import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class MessagingService implements OnModuleInit {
  private readonly logger = new Logger(MessagingService.name);
  private kafkaProducer: Producer;
  private kafkaConsumer: Consumer;

  async onModuleInit() {
    await this.initRabbitMQ();
    await this.initKafka();
  }

  // ── RabbitMQ: consume TASK_CREATED events from task-service ──
  private async initRabbitMQ() {
    const url = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
    for (let i = 0; i < 10; i++) {
      try {
        const conn = await amqp.connect(url);
        const ch = await conn.createChannel();
        const exchange = 'taskflow.exchange';
        const queue = 'task.events.queue';

        await ch.assertExchange(exchange, 'topic', { durable: true });
        await ch.assertQueue(queue, { durable: true });
        await ch.bindQueue(queue, exchange, 'task.created');

        ch.consume(queue, (msg) => {
          if (msg) {
            const event = JSON.parse(msg.content.toString());
            this.logger.log(
              `RabbitMQ received TASK_CREATED: taskId=${event.taskId}, title="${event.title}"`,
            );
            // In a real app: store notification, send email, etc.
            ch.ack(msg);
          }
        });

        this.logger.log('RabbitMQ consumer connected');
        return;
      } catch (e) {
        this.logger.warn(`RabbitMQ retry ${i + 1}/10... ${e.message}`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  // ── Kafka: producer + consumer ──────────────────────────────
  private async initKafka() {
    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
    const kafka = new Kafka({ clientId: 'comment-service', brokers });

    // Producer
    this.kafkaProducer = kafka.producer();
    for (let i = 0; i < 10; i++) {
      try {
        await this.kafkaProducer.connect();
        this.logger.log('Kafka producer connected');
        break;
      } catch (e) {
        this.logger.warn(`Kafka producer retry ${i + 1}/10... ${e.message}`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    // Consumer — listens for task-status-topic from task-service
    this.kafkaConsumer = kafka.consumer({ groupId: 'comment-service-group' });
    for (let i = 0; i < 10; i++) {
      try {
        await this.kafkaConsumer.connect();
        await this.kafkaConsumer.subscribe({ topic: 'task-status-topic', fromBeginning: false });
        await this.kafkaConsumer.run({
          eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value?.toString() || '{}');
            this.logger.log(
              `Kafka received TASK_STATUS_CHANGED: taskId=${event.taskId}, status=${event.status}`,
            );
          },
        });
        this.logger.log('Kafka consumer connected');
        break;
      } catch (e) {
        this.logger.warn(`Kafka consumer retry ${i + 1}/10... ${e.message}`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  async publishToKafka(topic: string, message: object) {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      this.logger.log(`Kafka sent to ${topic}: ${JSON.stringify(message)}`);
    } catch (e) {
      this.logger.error(`Kafka publish failed: ${e.message}`);
    }
  }
}
