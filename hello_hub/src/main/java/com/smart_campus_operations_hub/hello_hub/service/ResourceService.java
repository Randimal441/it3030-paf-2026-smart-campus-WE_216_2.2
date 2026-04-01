package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.dto.ResourceRequestDTO;
import com.smart_campus_operations_hub.hello_hub.dto.ResourceResponseDTO;
import com.smart_campus_operations_hub.hello_hub.exception.ResourceNotFoundException;
import com.smart_campus_operations_hub.hello_hub.model.Resource;
import com.smart_campus_operations_hub.hello_hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = mapToEntity(dto);
        Resource savedResource = resourceRepository.save(resource);
        return mapToResponseDTO(savedResource);
    }

    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponseDTO(resource);
    }

    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        existingResource.setName(dto.getName());
        existingResource.setType(dto.getType());
        existingResource.setCapacity(dto.getCapacity());
        existingResource.setLocation(dto.getLocation());
        existingResource.setAvailabilityStartTime(dto.getAvailabilityStartTime());
        existingResource.setAvailabilityEndTime(dto.getAvailabilityEndTime());
        existingResource.setStatus(dto.getStatus());

        Resource updatedResource = resourceRepository.save(existingResource);
        return mapToResponseDTO(updatedResource);
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    private Resource mapToEntity(ResourceRequestDTO dto) {
        return Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .availabilityStartTime(dto.getAvailabilityStartTime())
                .availabilityEndTime(dto.getAvailabilityEndTime())
                .status(dto.getStatus())
                .build();
    }

    private ResourceResponseDTO mapToResponseDTO(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .availabilityStartTime(resource.getAvailabilityStartTime())
                .availabilityEndTime(resource.getAvailabilityEndTime())
                .status(resource.getStatus())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
