package com.taskflow.task.feign;

import com.taskflow.task.dto.CommentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "comment-service", url = "${comment-service.url:http://comment-service:3000}")
public interface CommentServiceClient {

    @GetMapping("/api/comments/task/{taskId}")
    List<CommentDTO> getCommentsByTaskId(@PathVariable("taskId") String taskId);
}
