package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.CommentRequestDTO;
import com.smart_campus_operations_hub.hello_hub.model.*;
import com.smart_campus_operations_hub.hello_hub.repository.TicketCommentRepository;
import com.smart_campus_operations_hub.hello_hub.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor

public class TicketCommentImpl implements TicketCommentService {
     private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserService userService;

    @Override
    public TicketComment addComment(CommentRequestDTO dto, String email) {

        AppUser user = userService.getByEmail(email);

        Ticket ticket = ticketRepository.findById(dto.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        boolean isCreator = email.equals(ticket.getCreatedByEmail());
        boolean isTechnician = email.equals(ticket.getAssignedTechnicianEmail());

        if (!(isAdmin || isCreator || isTechnician)) {
            throw new RuntimeException("You are not allowed to comment on this ticket");
        }

        TicketComment comment = TicketComment.builder()
                .ticketId(ticket.getId())
                .commenterEmail(user.getEmail())
                .commenterName(user.getName())
                .commenterRole(user.getRole().name())
                .message(dto.getMessage())
                .createdAt(LocalDateTime.now())
                .build();

        return commentRepository.save(comment);
    }

    @Override
    public List<TicketComment> getCommentsByTicket(String ticketId, String email) {

        AppUser user = userService.getByEmail(email);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        boolean isCreator = email.equals(ticket.getCreatedByEmail());
        boolean isTechnician = email.equals(ticket.getAssignedTechnicianEmail());

        if (!(isAdmin || isCreator || isTechnician)) {
            throw new RuntimeException("You are not allowed to view comments");
        }

        return commentRepository.findByTicketId(ticketId);
    }

    @Override
    public TicketComment updateComment(String commentId, CommentRequestDTO dto, String email) {

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        
        if (!email.equals(comment.getCommenterEmail())) {
            throw new RuntimeException("You can only update your own comment");
        }

        comment.setMessage(dto.getMessage());

        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(String commentId, String email) {

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!email.equals(comment.getCommenterEmail())) {
            throw new RuntimeException("You can only delete your own comment");
        }

        commentRepository.deleteById(commentId);
    }

}
