package com.offlineupi.controller;

import com.offlineupi.dto.MerchantProfileRequest;
import com.offlineupi.dto.MerchantProfileResponse;
import com.offlineupi.dto.QrDataResponse;
import com.offlineupi.service.MerchantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/merchant")
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantService merchantService;

    @PostMapping("/profile")
    public ResponseEntity<MerchantProfileResponse> createProfile(@RequestBody MerchantProfileRequest request) {
        return ResponseEntity.ok(merchantService.createProfile(request));
    }

    @GetMapping("/qr")
    public ResponseEntity<QrDataResponse> getQrData() {
        return ResponseEntity.ok(merchantService.generateQr());
    }
}