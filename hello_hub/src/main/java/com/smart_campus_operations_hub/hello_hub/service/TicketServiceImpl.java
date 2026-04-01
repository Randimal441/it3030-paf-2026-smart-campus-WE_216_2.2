package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.TechnicianDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketResponseDTO;
import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.model.Ticket;
import com.smart_campus_operations_hub.hello_hub.model.UserRole;
import com.smart_campus_operations_hub.hello_hub.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketServise {

    private final TicketRepository ticketRepository;
    private final UserService userService;

    @Override
    public Ticket createTicket(TicketRequestDTO dto, String email) {
        AppUser user = userService.getByEmail(email);

        if (user.getRole() == null) {
            throw new RuntimeException("User role not assigned yet");
        }

        if (user.getRole() != UserRole.STUDENT &&
            user.getRole() != UserRole.LECTURER) {
            throw new RuntimeException("Only students or lecturers can raise tickets");
        }

        if (dto.getImageUrls() != null && dto.getImageUrls().size() > 3) {
        throw new RuntimeException("You can only upload up to 3 images per ticket");
    }
    

        Ticket ticket = Ticket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .location(dto.getLocation())
                .contact(dto.getContact())
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .role(user.getRole().name())
                .createdByName(user.getName())
                .createdByEmail(user.getEmail())
                .imageUrls(dto.getImageUrls())
                .build();

        return ticketRepository.save(ticket);
    }
    

    @Override
    public List<TicketResponseDTO> getAllTicketsForAdmin(String email) {
    AppUser user = userService.getByEmail(email);

    if (user.getRole() != UserRole.ADMIN) {
        throw new RuntimeException("Only admin can view all tickets");
    }

    return ticketRepository.findAll().stream().map(ticket -> {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setLocation(ticket.getLocation());
        dto.setContact(ticket.getContact());
        dto.setRole(ticket.getRole());
        dto.setCreatedByName(ticket.getCreatedByName());
        dto.setCreatedByEmail(ticket.getCreatedByEmail());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setImageUrls(ticket.getImageUrls());
        dto.setAssignedTechnicianEmail(ticket.getAssignedTechnicianEmail());
        dto.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setResolutionNote(ticket.getResolutionNote());
        return dto;
    }).toList();
}

    @Override
    public Ticket assignTechnician(String ticketId, String technicianEmail, String adminEmail) {

    AppUser admin = userService.getByEmail(adminEmail);
    if (admin.getRole() != UserRole.ADMIN) {
        throw new RuntimeException("Only admin can assign technicians");
    }

    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    AppUser technician = userService.getByEmail(technicianEmail);

    if (technician.getRole() != UserRole.TECHNICIAN) {
        throw new RuntimeException("Selected user is not a technician");
    }

    ticket.setAssignedTechnicianEmail(technician.getEmail());
    ticket.setAssignedTechnicianName(technician.getName());

    
    ticket.setStatus("IN_PROGRESS");

    return ticketRepository.save(ticket);
}

    @Override
    public List<TechnicianDTO> getAllTechnicians() {

    return userService.getAllUsers().stream()
            .filter(user -> user.getRole() == UserRole.TECHNICIAN)
            .map(user -> new TechnicianDTO(user.getName(), user.getEmail()))
            .toList();
    }


    @Override
    public List<TicketResponseDTO> getTicketsForTechnician(String technicianEmail) {
    AppUser technician = userService.getByEmail(technicianEmail);

    if (technician.getRole() != UserRole.TECHNICIAN) {
        throw new RuntimeException("Only technicians can view assigned tickets");
    }

    return ticketRepository.findAll().stream()
            .filter(ticket -> technicianEmail.equals(ticket.getAssignedTechnicianEmail()))
            .map(ticket -> {
                TicketResponseDTO dto = new TicketResponseDTO();
                dto.setId(ticket.getId());
                dto.setTitle(ticket.getTitle());
                dto.setDescription(ticket.getDescription());
                dto.setCategory(ticket.getCategory());
                dto.setPriority(ticket.getPriority());
                dto.setStatus(ticket.getStatus());
                dto.setLocation(ticket.getLocation());
                dto.setContact(ticket.getContact());
                dto.setRole(ticket.getRole());
                dto.setCreatedByName(ticket.getCreatedByName());
                dto.setCreatedByEmail(ticket.getCreatedByEmail());
                dto.setCreatedAt(ticket.getCreatedAt());
                dto.setImageUrls(ticket.getImageUrls());
                dto.setAssignedTechnicianEmail(ticket.getAssignedTechnicianEmail());
                dto.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
                dto.setRejectionReason(ticket.getRejectionReason());
                dto.setResolutionNote(ticket.getResolutionNote());
                return dto;
            }).toList();
    }

    @Override
    public List<TicketResponseDTO> getTicketsForUser(String email) {
    AppUser user = userService.getByEmail(email);

    // Only allow students or lecturers
    if (user.getRole() != UserRole.STUDENT && user.getRole() != UserRole.LECTURER) {
        throw new RuntimeException("Only students or lecturers can view their tickets");
    }

    return ticketRepository.findAll().stream()
            .filter(ticket -> email.equals(ticket.getCreatedByEmail())) // only own tickets
            .map(ticket -> {
                TicketResponseDTO dto = new TicketResponseDTO();
                dto.setId(ticket.getId());
                dto.setTitle(ticket.getTitle());
                dto.setDescription(ticket.getDescription());
                dto.setCategory(ticket.getCategory());
                dto.setPriority(ticket.getPriority());
                dto.setStatus(ticket.getStatus());
                dto.setLocation(ticket.getLocation());
                dto.setContact(ticket.getContact());
                dto.setRole(ticket.getRole());
                dto.setCreatedByName(ticket.getCreatedByName());
                dto.setCreatedByEmail(ticket.getCreatedByEmail());
                dto.setCreatedAt(ticket.getCreatedAt());
                dto.setImageUrls(ticket.getImageUrls());
                dto.setAssignedTechnicianEmail(ticket.getAssignedTechnicianEmail());
                dto.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
                dto.setRejectionReason(ticket.getRejectionReason());
                dto.setResolutionNote(ticket.getResolutionNote());
                return dto;
            }).toList();
    }

    @Override
    public Ticket rejectTicket(String ticketId, String adminEmail, String reason) {
    // Get admin
    AppUser admin = userService.getByEmail(adminEmail);
    if (admin.getRole() != UserRole.ADMIN) {
        throw new RuntimeException("Only admin can reject tickets");
    }

    // Find the ticket
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    // Set status and rejection reason
    ticket.setStatus("REJECTED");
    ticket.setRejectionReason(reason);

    return ticketRepository.save(ticket);
    }


    @Override
    public TicketResponseDTO getTicketById(String ticketId, String email) {

    AppUser user = userService.getByEmail(email);

    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    boolean isAdmin = user.getRole() == UserRole.ADMIN;
    boolean isCreator = email.equals(ticket.getCreatedByEmail());
    boolean isAssignedTechnician = email.equals(ticket.getAssignedTechnicianEmail());

    if (!(isAdmin || isCreator || isAssignedTechnician)) {
        throw new RuntimeException("You are not allowed to view this ticket");
    }

    TicketResponseDTO dto = new TicketResponseDTO();
    dto.setId(ticket.getId());
    dto.setTitle(ticket.getTitle());
    dto.setDescription(ticket.getDescription());
    dto.setCategory(ticket.getCategory());
    dto.setPriority(ticket.getPriority());
    dto.setStatus(ticket.getStatus());
    dto.setLocation(ticket.getLocation());
    dto.setContact(ticket.getContact());
    dto.setRole(ticket.getRole());
    dto.setCreatedByName(ticket.getCreatedByName());
    dto.setCreatedByEmail(ticket.getCreatedByEmail());
    dto.setCreatedAt(ticket.getCreatedAt());
    dto.setImageUrls(ticket.getImageUrls());
    dto.setAssignedTechnicianEmail(ticket.getAssignedTechnicianEmail());
    dto.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
    dto.setRejectionReason(ticket.getRejectionReason());
    dto.setResolutionNote(ticket.getResolutionNote());

    return dto;
    }

    @Override
    public Ticket resolveTicket(String ticketId, String technicianEmail, String note) {

    AppUser technician = userService.getByEmail(technicianEmail);

    if (technician.getRole() != UserRole.TECHNICIAN) {
        throw new RuntimeException("Only technicians can resolve tickets");
    }

    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    if (!technicianEmail.equals(ticket.getAssignedTechnicianEmail())) {
        throw new RuntimeException("You are not assigned to this ticket");
    }

    ticket.setStatus("RESOLVED");
    ticket.setResolutionNote(note);

    return ticketRepository.save(ticket);
    }

    

    @Override
    public Ticket closeTicket(String ticketId, String adminEmail) {

    // Check admin
    AppUser admin = userService.getByEmail(adminEmail);
    if (admin.getRole() != UserRole.ADMIN) {
        throw new RuntimeException("Only admin can close tickets");
    }

    // Get ticket
    Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

    // Check if already resolved
    if (!"RESOLVED".equals(ticket.getStatus())) {
        throw new RuntimeException("Only RESOLVED tickets can be closed");
    }

    // Update status
    ticket.setStatus("CLOSED");

    return ticketRepository.save(ticket);
    }
}