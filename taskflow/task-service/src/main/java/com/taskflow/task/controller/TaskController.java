package com.taskflow.task.controller;

import com.taskflow.task.dto.TaskWithCommentsDTO;
import com.taskflow.task.entity.Task;
import com.taskflow.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "Get all tasks")
    public ResponseEntity<List<Task>> getAll() {
        return ResponseEntity.ok(taskService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task with comments (Feign)")
    public ResponseEntity<TaskWithCommentsDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getWithComments(id));
    }

    @PostMapping
    @Operation(summary = "Create task (publishes RabbitMQ event)")
    public ResponseEntity<Task> create(@RequestBody Task task, @AuthenticationPrincipal Jwt jwt) {
        task.setCreatedBy(jwt.getClaimAsString("preferred_username"));
        return ResponseEntity.ok(taskService.create(task));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status (publishes Kafka event)")
    public ResponseEntity<Task> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(taskService.updateStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
