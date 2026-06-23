package com.taskflow.task.dto;

import com.taskflow.task.entity.Task;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskWithCommentsDTO {
    private Task task;
    private List<CommentDTO> comments;
    private int commentCount;
}
