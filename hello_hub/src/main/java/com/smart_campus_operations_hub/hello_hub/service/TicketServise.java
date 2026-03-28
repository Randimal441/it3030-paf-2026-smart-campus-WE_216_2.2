package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.TechnicianDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketResponseDTO;
import com.smart_campus_operations_hub.hello_hub.model.Ticket;

import java.util.List;

public interface TicketServise {
    Ticket createTicket(TicketRequestDTO dto, String email);

    List<TicketResponseDTO> getAllTicketsForAdmin(String email);

    Ticket assignTechnician(String ticketId, String technicianEmail, String adminEmail);

    List<TechnicianDTO> getAllTechnicians();

    List<TicketResponseDTO> getTicketsForTechnician(String technicianEmail);

    List<TicketResponseDTO> getTicketsForUser(String email);
}
