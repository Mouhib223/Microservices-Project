package com.taskflow.task.service;

import com.taskflow.task.dto.CommentDTO;
import com.taskflow.task.dto.TaskWithCommentsDTO;
import com.taskflow.task.entity.Task;
import com.taskflow.task.feign.CommentServiceClient;
import com.taskflow.task.messaging.TaskEventPublisher;
import com.taskflow.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final CommentServiceClient commentClient;
    private final TaskEventPublisher publisher;

    public Task create(Task task) {
        Task saved = taskRepository.save(task);
        // RabbitMQ event
        publisher.publishTaskCreated(saved.getId(), saved.getTitle(), saved.getCreatedBy());
        return saved;
    }

    public List<Task> getAll() {
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    public TaskWithCommentsDTO getWithComments(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found: " + id));

        List<CommentDTO> comments;
        try {
            // Feign call → comment-service
            comments = commentClient.getCommentsByTaskId(id.toString());
        } catch (Exception e) {
            log.warn("Could not fetch comments via Feign: {}", e.getMessage());
            comments = Collections.emptyList();
        }

        return new TaskWithCommentsDTO(task, comments, comments.size());
    }

    public Task updateStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        Task updated = taskRepository.save(task);
        // Kafka event
        publisher.publishTaskStatusChanged(id, status);
        return updated;
    }

    public void delete(Long id) {
        taskRepository.deleteById(id);
    }
}
