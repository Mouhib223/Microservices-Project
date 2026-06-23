package com.taskflow.task.repository;

import com.taskflow.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    List<Task> findAllByOrderByCreatedAtDesc();
}
