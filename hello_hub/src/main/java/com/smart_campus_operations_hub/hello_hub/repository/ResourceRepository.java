package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.Resource;
import com.smart_campus_operations_hub.hello_hub.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}
