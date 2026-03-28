package com.smart_campus_operations_hub.hello_hub.controller;

import com.smart_campus_operations_hub.hello_hub.dto.TechnicianDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketAssignDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketResponseDTO;
import com.smart_campus_operations_hub.hello_hub.model.Ticket;
import com.smart_campus_operations_hub.hello_hub.service.TicketServise;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin
public class TicketController {

    private final TicketServise ticketService;

    @PostMapping
    public Ticket createTicket(@RequestBody TicketRequestDTO dto,Authentication authentication) {

        String email = authentication.getName();

        return ticketService.createTicket(dto, email);
    }

    @PostMapping("/assign")
    public Ticket assignTechnician(@RequestBody TicketAssignDTO dto,Authentication authentication) {

    String adminEmail = authentication.getName();

    return ticketService.assignTechnician(
            dto.getTicketId(),
            dto.getTechnicianEmail(),
            adminEmail
    );
    }
    
    @GetMapping("/admin")
    public List<TicketResponseDTO> getAllTicketsForAdmin(Authentication authentication) {
    String email = authentication.getName();
    return ticketService.getAllTicketsForAdmin(email);
    }

    @GetMapping("/technicians")
    public List<TechnicianDTO> getAllTechnicians() {
    return ticketService.getAllTechnicians();
    }

    @GetMapping("/technician/tickets")
    public List<TicketResponseDTO> getTicketsForTechnician(@RequestParam String email) {
    return ticketService.getTicketsForTechnician(email);
    }

    @GetMapping("/my-tickets")
    public List<TicketResponseDTO> getMyTickets(Authentication authentication) {
    String email = authentication.getName();
    return ticketService.getTicketsForUser(email);
}
}