package com.offlineupi.controller;

import com.offlineupi.dto.TransactionResponse;
import com.offlineupi.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getMySentHistory() {
        return ResponseEntity.ok(transactionService.getMySentHistory());
    }

    @GetMapping("/merchant-history")
    public ResponseEntity<List<TransactionResponse>> getMerchantReceivedHistory() {
        return ResponseEntity.ok(transactionService.getMerchantReceivedHistory());
    }
}