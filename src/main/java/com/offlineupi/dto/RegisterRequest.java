package com.offlineupi.dto;
import com.offlineupi.entity.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private Role role; // USER or MERCHANT
}