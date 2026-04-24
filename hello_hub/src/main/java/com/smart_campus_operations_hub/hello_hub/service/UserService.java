package com.smart_campus_operations_hub.hello_hub.service;

import com.smart_campus_operations_hub.hello_hub.exception.ResourceNotFoundException;
import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.model.AuthProvider;
import com.smart_campus_operations_hub.hello_hub.model.UserRole;
import com.smart_campus_operations_hub.hello_hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                .approved(false)
                .createdAt(Instant.now())
                .build();

        return Objects.requireNonNull(userRepository.save(newUser));
    }

    public AppUser registerLocalUser(String name, String email, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered.");
        }

        AppUser newUser = AppUser.builder()
                .name(name)
                .email(email)
                .provider(AuthProvider.LOCAL)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(null)
                .approved(false)
                .createdAt(Instant.now())
                .build();

        return Objects.requireNonNull(userRepository.save(newUser));
    }

    public AppUser authenticateLocalUser(String email, String rawPassword) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));

        if (user.getPasswordHash() == null || user.getProvider() != AuthProvider.LOCAL) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }

        if (!isApproved(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account pending admin approval.");
        }

        return user;
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

    public boolean isApproved(AppUser user) {
        return user.getApproved() == null || Boolean.TRUE.equals(user.getApproved());
    }

    public List<AppUser> getPendingUsers() {
        return userRepository.findByApproved(false);
    }

    public AppUser approveUser(String id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setApproved(true);
        return userRepository.save(user);
    }

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public List<AppUser> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
}
