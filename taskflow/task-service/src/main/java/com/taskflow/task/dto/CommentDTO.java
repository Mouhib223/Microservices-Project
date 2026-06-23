package com.taskflow.task.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private String id;
    private String content;
    private String author;
    private String taskId;
    private LocalDateTime createdAt;
}
