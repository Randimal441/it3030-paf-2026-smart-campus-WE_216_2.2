package com.smart_campus_operations_hub.hello_hub.controller;

import com.smart_campus_operations_hub.hello_hub.dto.TechnicianDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketAssignDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketRejectDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketResolutionDTO;
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

    @PostMapping("/reject/{ticketId}")
    public Ticket rejectTicket(@PathVariable String ticketId,
                           @RequestBody TicketRejectDTO dto,
                           Authentication authentication) {

    String adminEmail = authentication.getName();

    return ticketService.rejectTicket(
            ticketId,
            adminEmail,
            dto.getReason()
    );
    }

    @PostMapping("/resolve/{ticketId}")
    public Ticket resolveTicket(@PathVariable String ticketId,
                            @RequestBody TicketResolutionDTO dto,
                            Authentication authentication) {

    String technicianEmail = authentication.getName();

    return ticketService.resolveTicket(
            ticketId,
            technicianEmail,
            dto.getResolutionNote()
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
    public List<TicketResponseDTO> getTicketsForTechnician(Authentication authentication) {
    String email = authentication.getName();
    return ticketService.getTicketsForTechnician(email);
    }

    @GetMapping("/my-tickets")
    public List<TicketResponseDTO> getMyTickets(Authentication authentication) {
    String email = authentication.getName();
    return ticketService.getTicketsForUser(email);
}

    @GetMapping("oneticketdetail/{ticketId}")
    public TicketResponseDTO getTicketById(@PathVariable String ticketId,Authentication authentication) {
    String email = authentication.getName();
    return ticketService.getTicketById(ticketId, email);
    }


    @PatchMapping("/close/{ticketId}")
    public Ticket closeTicket(@PathVariable String ticketId,
                          Authentication authentication) {

    String adminEmail = authentication.getName();

    return ticketService.closeTicket(ticketId, adminEmail);
    }
    


}