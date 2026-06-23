import { OnModuleInit } from '@nestjs/common';
export declare class MessagingService implements OnModuleInit {
    private readonly logger;
    private kafkaProducer;
    private kafkaConsumer;
    onModuleInit(): Promise<void>;
    private initRabbitMQ;
    private initKafka;
    publishToKafka(topic: string, message: object): Promise<void>;
}
