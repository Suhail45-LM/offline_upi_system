package com.offlineupi.controller;

import com.offlineupi.service.OfflineCreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/credit")
@RequiredArgsConstructor
public class OfflineCreditController {

    private final OfflineCreditService offlineCreditService;


    @GetMapping("/my-credit")
    public ResponseEntity<?> getMyCredit() {

        return ResponseEntity.ok(offlineCreditService.refreshCreditLimit());
    }


    @PostMapping("/refresh")
    public ResponseEntity<?> refreshCredit() {
        return ResponseEntity.ok(offlineCreditService.refreshCreditLimit());
    }
}