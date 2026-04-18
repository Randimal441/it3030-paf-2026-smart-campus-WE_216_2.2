package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.Resource;
import com.smart_campus_operations_hub.hello_hub.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends MongoRepository<Resource, Long> {
    Optional<Resource> findTopByOrderByIdDesc();

    List<Resource> findByType(ResourceType type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByTypeAndLocationContainingIgnoreCase(ResourceType type, String location);

    List<Resource> findByTypeAndCapacityGreaterThanEqual(ResourceType type, Integer capacity);

    List<Resource> findByLocationContainingIgnoreCaseAndCapacityGreaterThanEqual(String location, Integer capacity);

    List<Resource> findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqual(
            ResourceType type,
            String location,
            Integer capacity
    );
}
