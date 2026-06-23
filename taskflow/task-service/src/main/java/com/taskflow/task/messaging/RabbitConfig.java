package com.taskflow.task.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String EXCHANGE    = "taskflow.exchange";
    public static final String TASK_QUEUE  = "task.events.queue";
    public static final String ROUTING_KEY = "task.created";

    @Bean
    TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    Queue taskQueue() {
        return new Queue(TASK_QUEUE, true);
    }

    @Bean
    Binding binding(Queue taskQueue, TopicExchange exchange) {
        return BindingBuilder.bind(taskQueue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    Jackson2JsonMessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(converter());
        return t;
    }
}
