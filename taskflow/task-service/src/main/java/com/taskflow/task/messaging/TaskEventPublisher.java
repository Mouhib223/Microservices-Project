package com.taskflow.task.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    /** RabbitMQ: notify comment-service that a task was created */
    public void publishTaskCreated(Long taskId, String title, String createdBy) {
        Map<String, Object> event = Map.of(
            "type", "TASK_CREATED",
            "taskId", taskId,
            "title", title,
            "createdBy", createdBy
        );
        log.info("RabbitMQ → TASK_CREATED: {}", event);
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY, event);
    }

    /** Kafka: broadcast task status change */
    public void publishTaskStatusChanged(Long taskId, String newStatus) {
        Map<String, Object> event = Map.of(
            "type", "TASK_STATUS_CHANGED",
            "taskId", taskId,
            "status", newStatus
        );
        log.info("Kafka → TASK_STATUS_CHANGED: {}", event);
        kafkaTemplate.send("task-status-topic", event);
    }
}
