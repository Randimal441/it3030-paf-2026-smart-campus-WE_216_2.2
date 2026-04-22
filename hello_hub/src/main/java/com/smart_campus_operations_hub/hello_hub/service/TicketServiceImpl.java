package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.TechnicianDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.TicketResponseDTO;
import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.model.NotificationType;
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
    private final NotificationService notificationService;

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

        Ticket savedTicket = ticketRepository.save(ticket);

        List<String> adminEmails = userService.getUsersByRole(UserRole.ADMIN).stream()
            .map(AppUser::getEmail)
            .toList();

        notificationService.createNotificationForUsers(
            adminEmails,
            NotificationType.TICKET_CREATED,
            "New Ticket Submitted",
            user.getName() + " submitted ticket: " + savedTicket.getTitle(),
            savedTicket.getId(),
            "TICKET",
            "/admin/tickets"
        );

        notificationService.createNotificationForUser(
            savedTicket.getCreatedByEmail(),
            NotificationType.TICKET_CREATED,
            "Ticket Created",
            "Your ticket was created successfully: " + savedTicket.getTitle(),
            savedTicket.getId(),
            "TICKET",
            user.getRole() == UserRole.LECTURER ? "/lecturer/tickets" : "/student/tickets"
        );

        return savedTicket;
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

    Ticket savedTicket = ticketRepository.save(ticket);

    notificationService.createNotificationForUser(
            technician.getEmail(),
            NotificationType.TICKET_ASSIGNED,
            "Ticket Assigned",
            "You have been assigned: " + savedTicket.getTitle(),
            savedTicket.getId(),
            "TICKET",
            "/technician/tickets"
    );

    if (savedTicket.getCreatedByEmail() != null && !savedTicket.getCreatedByEmail().isBlank()) {
        AppUser creator = userService.getByEmail(savedTicket.getCreatedByEmail());
        String creatorPath = creator.getRole() == UserRole.LECTURER ? "/lecturer/tickets" : "/student/tickets";

        notificationService.createNotificationForUser(
                savedTicket.getCreatedByEmail(),
                NotificationType.TICKET_ASSIGNED,
                "Technician Assigned",
                "A technician was assigned to your ticket: " + savedTicket.getTitle(),
                savedTicket.getId(),
                "TICKET",
                creatorPath
        );
    }

    return savedTicket;
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

    Ticket savedTicket = ticketRepository.save(ticket);

    if (savedTicket.getCreatedByEmail() != null && !savedTicket.getCreatedByEmail().isBlank()) {
        AppUser creator = userService.getByEmail(savedTicket.getCreatedByEmail());
        String creatorPath = creator.getRole() == UserRole.LECTURER ? "/lecturer/tickets" : "/student/tickets";

        notificationService.createNotificationForUser(
                savedTicket.getCreatedByEmail(),
                NotificationType.TICKET_REJECTED,
                "Ticket Rejected",
                "Your ticket was rejected. Reason: " + reason,
                savedTicket.getId(),
                "TICKET",
                creatorPath
        );
    }

    if (savedTicket.getAssignedTechnicianEmail() != null && !savedTicket.getAssignedTechnicianEmail().isBlank()) {
        notificationService.createNotificationForUser(
                savedTicket.getAssignedTechnicianEmail(),
                NotificationType.TICKET_REJECTED,
                "Assigned Ticket Rejected",
                "Ticket was rejected by admin: " + savedTicket.getTitle(),
                savedTicket.getId(),
                "TICKET",
                "/technician/tickets"
        );
    }

    return savedTicket;
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

        Ticket savedTicket = ticketRepository.save(ticket);

        if (savedTicket.getCreatedByEmail() != null && !savedTicket.getCreatedByEmail().isBlank()) {
        AppUser creator = userService.getByEmail(savedTicket.getCreatedByEmail());
        String creatorPath = creator.getRole() == UserRole.LECTURER ? "/lecturer/tickets" : "/student/tickets";

        notificationService.createNotificationForUser(
            savedTicket.getCreatedByEmail(),
            NotificationType.TICKET_RESOLVED,
            "Ticket Resolved",
            "Your ticket was resolved: " + savedTicket.getTitle(),
            savedTicket.getId(),
            "TICKET",
            creatorPath
        );
        }

        List<String> adminEmails = userService.getUsersByRole(UserRole.ADMIN).stream()
            .map(AppUser::getEmail)
            .toList();

        notificationService.createNotificationForUsers(
            adminEmails,
            NotificationType.TICKET_RESOLVED,
            "Ticket Resolved",
            "Technician resolved ticket: " + savedTicket.getTitle(),
            savedTicket.getId(),
            "TICKET",
            "/admin/tickets"
        );

        return savedTicket;
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

    Ticket savedTicket = ticketRepository.save(ticket);

    if (savedTicket.getCreatedByEmail() != null && !savedTicket.getCreatedByEmail().isBlank()) {
        AppUser creator = userService.getByEmail(savedTicket.getCreatedByEmail());
        String creatorPath = creator.getRole() == UserRole.LECTURER ? "/lecturer/tickets" : "/student/tickets";

        notificationService.createNotificationForUser(
                savedTicket.getCreatedByEmail(),
                NotificationType.TICKET_CLOSED,
                "Ticket Closed",
                "Your ticket was closed by admin: " + savedTicket.getTitle(),
                savedTicket.getId(),
                "TICKET",
                creatorPath
        );
    }

        if (savedTicket.getAssignedTechnicianEmail() != null && !savedTicket.getAssignedTechnicianEmail().isBlank()) {
        notificationService.createNotificationForUser(
            savedTicket.getAssignedTechnicianEmail(),
            NotificationType.TICKET_CLOSED,
            "Ticket Closed",
            "Ticket has been closed: " + savedTicket.getTitle(),
            savedTicket.getId(),
            "TICKET",
            "/technician/tickets"
        );
        }

        notificationService.createNotificationForUser(
            adminEmail,
            NotificationType.TICKET_CLOSED,
            "Ticket Closed",
            "You closed ticket: " + savedTicket.getTitle(),
            savedTicket.getId(),
            "TICKET",
            "/admin/tickets"
        );

    return savedTicket;
    }
}