package com.smart_campus_operations_hub.hello_hub.controller;

import com.smart_campus_operations_hub.hello_hub.dto.AuthLoginRequest;
import com.smart_campus_operations_hub.hello_hub.dto.AuthRegisterRequest;
import com.smart_campus_operations_hub.hello_hub.dto.AuthResponse;
import com.smart_campus_operations_hub.hello_hub.dto.RoleSelectionRequest;
import com.smart_campus_operations_hub.hello_hub.dto.UserDto;
import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.service.JwtService;
import com.smart_campus_operations_hub.hello_hub.service.UserMapper;
import com.smart_campus_operations_hub.hello_hub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final JwtService jwtService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication authentication) {
        AppUser user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(userMapper.toDto(user));
    }

    @PostMapping("/select-role")
    public ResponseEntity<AuthResponse> selectRole(Authentication authentication,
                                                   @Valid @RequestBody RoleSelectionRequest request) {
        AppUser updated = userService.assignRole(authentication.getName(), request.role());

        UserDetails userDetails = new User(
                updated.getEmail(),
                "N/A",
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + updated.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token, userMapper.toDto(updated)));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRegisterRequest request) {
        AppUser created = userService.registerLocalUser(request.name(), request.email(), request.password());
        UserDetails userDetails = new User(created.getEmail(), created.getPasswordHash(), Collections.emptyList());
        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token, userMapper.toDto(created)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthLoginRequest request) {
        AppUser user = userService.authenticateLocalUser(request.email(), request.password());

        UserDetails userDetails = new User(
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole() == null
                        ? Collections.emptyList()
                        : java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token, userMapper.toDto(user)));
    }
}
