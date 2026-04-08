package com.smart_campus_operations_hub.hello_hub.controller;

import com.smart_campus_operations_hub.hello_hub.dto.CommentRequestDTO;
import com.smart_campus_operations_hub.hello_hub.model.TicketComment;
import com.smart_campus_operations_hub.hello_hub.service.TicketCommentService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin

public class TicketCommentController {
    private final TicketCommentService commentService;  

    @PostMapping
    public TicketComment addComment(@RequestBody CommentRequestDTO dto,
                              Authentication authentication) {

        String email = authentication.getName();
        return commentService.addComment(dto, email);
    }

    @GetMapping("/{ticketId}")
    public List<TicketComment> getComments(@PathVariable String ticketId,
                                     Authentication authentication) {

        String email = authentication.getName();
        return commentService.getCommentsByTicket(ticketId, email);
    }

    @PutMapping("/{commentId}")
    public TicketComment updateComment(@PathVariable String commentId,
                                   @RequestBody CommentRequestDTO dto,
                                   Authentication authentication) {

    String email = authentication.getName();
    return commentService.updateComment(commentId, dto, email);
    }

    @DeleteMapping("/{commentId}")
    public String deleteComment(@PathVariable String commentId,
                            Authentication authentication) {

    String email = authentication.getName();
    commentService.deleteComment(commentId, email);
    return "Comment deleted successfully";
    }
    
}
