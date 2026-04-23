package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.CommentRequestDTO;
import com.smart_campus_operations_hub.hello_hub.model.*;
import com.smart_campus_operations_hub.hello_hub.repository.TicketCommentRepository;
import com.smart_campus_operations_hub.hello_hub.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor

public class TicketCommentImpl implements TicketCommentService {
     private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserService userService;
    private final NotificationService notificationService;

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

        TicketComment savedComment = commentRepository.save(comment);
        notifyTicketStakeholders(ticket, user, savedComment.getMessage());
        return savedComment;
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

    private void notifyTicketStakeholders(Ticket ticket, AppUser commenter, String message) {
        Set<String> recipientEmails = new HashSet<>();

        if (ticket.getCreatedByEmail() != null && !ticket.getCreatedByEmail().isBlank()) {
            recipientEmails.add(ticket.getCreatedByEmail());
        }

        if (ticket.getAssignedTechnicianEmail() != null && !ticket.getAssignedTechnicianEmail().isBlank()) {
            recipientEmails.add(ticket.getAssignedTechnicianEmail());
        }

        List<String> adminEmails = userService.getUsersByRole(UserRole.ADMIN).stream()
                .map(AppUser::getEmail)
                .toList();
        recipientEmails.addAll(adminEmails);

        recipientEmails.remove(commenter.getEmail());

        String preview = message == null ? "" : message.trim();
        if (preview.length() > 110) {
            preview = preview.substring(0, 107) + "...";
        }

        for (String email : recipientEmails) {
            AppUser recipient = null;
            try {
                recipient = userService.getByEmail(email);
            } catch (RuntimeException ex) {
                // Fall back to a default path when user lookup fails.
            }

            String actionUrl = resolveTicketActionUrl(recipient != null ? recipient.getRole() : null);

            notificationService.createNotificationForUser(
                    email,
                    NotificationType.COMMENT_ADDED,
                    "New Comment on Ticket",
                    commenter.getName() + ": " + preview,
                    ticket.getId(),
                    "TICKET",
                    actionUrl
            );
        }
    }

    private String resolveTicketActionUrl(UserRole role) {
        if (role == null) {
            return "/student/tickets";
        }

        return switch (role) {
            case ADMIN -> "/admin/tickets";
            case TECHNICIAN -> "/technician/tickets";
            case LECTURER -> "/lecturer/tickets";
            default -> "/student/tickets";
        };
    }

}
