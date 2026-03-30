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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin
public class TicketController {

    private final TicketServise ticketService;
        private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024L * 1024L;
        private static final int MAX_IMAGE_COUNT = 3;

    @PostMapping
    public Ticket createTicket(@RequestBody TicketRequestDTO dto,Authentication authentication) {

        String email = authentication.getName();

        return ticketService.createTicket(dto, email);
    }

        @PostMapping(value = "/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<Map<String, List<String>>> uploadImages(@RequestParam("files") List<MultipartFile> files)
                        throws IOException {
                if (files == null || files.isEmpty()) {
                        throw new RuntimeException("Please select at least one image");
                }

                if (files.size() > MAX_IMAGE_COUNT) {
                        throw new RuntimeException("You can only upload up to 3 images per ticket");
                }

                Path uploadDir = Paths.get("frontend", "public", "uploads").toAbsolutePath().normalize();
                Files.createDirectories(uploadDir);

                List<String> imageUrls = files.stream().map(file -> {
                        if (file.isEmpty()) {
                                throw new RuntimeException("One of the selected files is empty");
                        }

                        String contentType = file.getContentType();
                        if (contentType == null || !contentType.startsWith("image/")) {
                                throw new RuntimeException("Only image files are allowed");
                        }

                        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
                                throw new RuntimeException("Image size must be less than 5MB");
                        }

                        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
                        String sanitizedName = originalName
                                        .replaceAll("\\s+", "-")
                                        .replaceAll("[^a-zA-Z0-9._-]", "");

                        if (!StringUtils.hasText(sanitizedName)) {
                                sanitizedName = "image";
                        }

                        String storedName = UUID.randomUUID() + "_" + sanitizedName;
                        Path destination = uploadDir.resolve(storedName).normalize();

                        if (!destination.startsWith(uploadDir)) {
                                throw new RuntimeException("Invalid file path");
                        }

                        try {
                                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                        } catch (IOException ex) {
                                throw new RuntimeException("Failed to save uploaded image", ex);
                        }

                        return "/uploads/" + storedName;
                }).collect(Collectors.toList());

                return ResponseEntity.ok(Map.of("imageUrls", imageUrls));
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