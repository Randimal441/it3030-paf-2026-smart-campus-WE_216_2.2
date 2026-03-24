package com.smart_campus_operations_hub.hello_hub.controller;

import com.smart_campus_operations_hub.hello_hub.dto.UserDto;
import com.smart_campus_operations_hub.hello_hub.service.UserMapper;
import com.smart_campus_operations_hub.hello_hub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listUsers() {
        return ResponseEntity.ok(userService.getAllUsers().stream().map(userMapper::toDto).toList());
    }
}
