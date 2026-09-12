package com.offlineupi.controller;

import com.offlineupi.dto.AmountRequest;
import com.offlineupi.dto.BankAccountResponse;
import com.offlineupi.service.BankAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bank")
@RequiredArgsConstructor
public class BankAccountController {

    private final BankAccountService bankAccountService;

    @PostMapping("/create")
    public ResponseEntity<BankAccountResponse> createAccount() {
        return ResponseEntity.ok(bankAccountService.createAccount());
    }

    @GetMapping("/my-account")
    public ResponseEntity<BankAccountResponse> getMyAccount() {
        return ResponseEntity.ok(bankAccountService.getMyAccount());
    }

    @PostMapping("/deposit")
    public ResponseEntity<BankAccountResponse> deposit(@RequestBody AmountRequest request) {
        return ResponseEntity.ok(bankAccountService.deposit(request));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<BankAccountResponse> withdraw(@RequestBody AmountRequest request) {
        return ResponseEntity.ok(bankAccountService.withdraw(request));
    }
}