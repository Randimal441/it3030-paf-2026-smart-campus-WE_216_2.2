package com.smart_campus_operations_hub.hello_hub.repository;

import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);
}
