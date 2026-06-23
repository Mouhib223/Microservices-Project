"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MessagingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const amqp = require("amqplib");
const kafkajs_1 = require("kafkajs");
let MessagingService = MessagingService_1 = class MessagingService {
    constructor() {
        this.logger = new common_1.Logger(MessagingService_1.name);
    }
    async onModuleInit() {
        await this.initRabbitMQ();
        await this.initKafka();
    }
    async initRabbitMQ() {
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
                        this.logger.log(`RabbitMQ received TASK_CREATED: taskId=${event.taskId}, title="${event.title}"`);
                        ch.ack(msg);
                    }
                });
                this.logger.log('RabbitMQ consumer connected');
                return;
            }
            catch (e) {
                this.logger.warn(`RabbitMQ retry ${i + 1}/10... ${e.message}`);
                await new Promise((r) => setTimeout(r, 3000));
            }
        }
    }
    async initKafka() {
        const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
        const kafka = new kafkajs_1.Kafka({ clientId: 'comment-service', brokers });
        this.kafkaProducer = kafka.producer();
        for (let i = 0; i < 10; i++) {
            try {
                await this.kafkaProducer.connect();
                this.logger.log('Kafka producer connected');
                break;
            }
            catch (e) {
                this.logger.warn(`Kafka producer retry ${i + 1}/10... ${e.message}`);
                await new Promise((r) => setTimeout(r, 3000));
            }
        }
        this.kafkaConsumer = kafka.consumer({ groupId: 'comment-service-group' });
        for (let i = 0; i < 10; i++) {
            try {
                await this.kafkaConsumer.connect();
                await this.kafkaConsumer.subscribe({ topic: 'task-status-topic', fromBeginning: false });
                await this.kafkaConsumer.run({
                    eachMessage: async ({ message }) => {
                        const event = JSON.parse(message.value?.toString() || '{}');
                        this.logger.log(`Kafka received TASK_STATUS_CHANGED: taskId=${event.taskId}, status=${event.status}`);
                    },
                });
                this.logger.log('Kafka consumer connected');
                break;
            }
            catch (e) {
                this.logger.warn(`Kafka consumer retry ${i + 1}/10... ${e.message}`);
                await new Promise((r) => setTimeout(r, 3000));
            }
        }
    }
    async publishToKafka(topic, message) {
        try {
            await this.kafkaProducer.send({
                topic,
                messages: [{ value: JSON.stringify(message) }],
            });
            this.logger.log(`Kafka sent to ${topic}: ${JSON.stringify(message)}`);
        }
        catch (e) {
            this.logger.error(`Kafka publish failed: ${e.message}`);
        }
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = MessagingService_1 = __decorate([
    (0, common_1.Injectable)()
], MessagingService);
//# sourceMappingURL=messaging.service.js.map