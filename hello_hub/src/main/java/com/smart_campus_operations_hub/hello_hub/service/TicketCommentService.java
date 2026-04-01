package com.smart_campus_operations_hub.hello_hub.service;

import java.util.List;
import com.smart_campus_operations_hub.hello_hub.model.TicketComment;

import com.smart_campus_operations_hub.hello_hub.dto.CommentRequestDTO;

public interface TicketCommentService {
     TicketComment addComment(CommentRequestDTO dto, String email);

    List<TicketComment> getCommentsByTicket(String ticketId, String email);
}
