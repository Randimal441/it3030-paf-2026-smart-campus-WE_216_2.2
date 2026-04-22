package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.exception.ResourceNotFoundException;
import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.model.AuthProvider;
import com.smart_campus_operations_hub.hello_hub.model.UserRole;
import com.smart_campus_operations_hub.hello_hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public AppUser findOrCreateGoogleUser(String name, String email) {
        var existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        AppUser newUser = AppUser.builder()
                .name(name)
                .email(email)
                .provider(AuthProvider.GOOGLE)
                .role(null)
                .createdAt(Instant.now())
                .build();

        return Objects.requireNonNull(userRepository.save(newUser));
    }

    public AppUser getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public AppUser assignRole(String email, UserRole role) {
        AppUser user = getByEmail(email);
        user.setRole(role);
        return userRepository.save(user);
    }

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public List<AppUser> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
}
