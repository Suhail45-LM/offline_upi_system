package com.offlineupi.service;

import com.offlineupi.dto.AuthRequest;
import com.offlineupi.dto.AuthResponse;
import com.offlineupi.dto.RegisterRequest;
import com.offlineupi.entity.User;
import com.offlineupi.entity.enums.UserStatus;
import com.offlineupi.repository.UserRepository;
import com.offlineupi.security.CustomUserDetails;
import com.offlineupi.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Removed the duplicate declaration
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;


    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));


        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);


        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Offline UPI - Password Reset OTP");
        message.setText("Your OTP for password reset is: " + otp + "\n\nDo not share this with anyone.");
        mailSender.send(message);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        String storedOtp = otpStorage.get(email);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);


        otpStorage.remove(email);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(new CustomUserDetails(user));
        return new AuthResponse(token, "User registered successfully");
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );


        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(new CustomUserDetails(user));
        return new AuthResponse(token, "Login successful");
    }
}