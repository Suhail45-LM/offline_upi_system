package com.offlineupi.service;

import com.offlineupi.dto.OfflineCreditResponse;
import com.offlineupi.entity.BankAccount;
import com.offlineupi.entity.OfflineCredit;
import com.offlineupi.entity.User;
import com.offlineupi.repository.BankAccountRepository;
import com.offlineupi.repository.OfflineCreditRepository;
import com.offlineupi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class OfflineCreditService {

    private final OfflineCreditRepository offlineCreditRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public OfflineCreditResponse refreshCreditLimit() {
        User user = getAuthenticatedUser();

        BankAccount account = bankAccountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Bank account not found. Create one first."));


        BigDecimal limit = account.getBalance().multiply(new BigDecimal("0.25")).setScale(2, RoundingMode.HALF_UP);

        OfflineCredit credit = offlineCreditRepository.findByUser(user).orElse(
                OfflineCredit.builder()
                        .user(user)
                        .usedCredit(BigDecimal.ZERO)
                        .build()
        );

        credit.setCreditLimit(limit);


        BigDecimal available = limit.subtract(credit.getUsedCredit());


        if (available.compareTo(BigDecimal.ZERO) < 0) {
            available = BigDecimal.ZERO;
        }

        credit.setAvailableCredit(available);
        offlineCreditRepository.save(credit);

        return mapToResponse(account.getBalance(), credit);
    }

    public OfflineCreditResponse getMyCredit() {
        User user = getAuthenticatedUser();

        BankAccount account = bankAccountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Bank account not found."));

        OfflineCredit credit = offlineCreditRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Offline credit not initialized. Please refresh."));

        return mapToResponse(account.getBalance(), credit);
    }

    private OfflineCreditResponse mapToResponse(BigDecimal bankBalance, OfflineCredit credit) {
        return OfflineCreditResponse.builder()
                .bankBalance(bankBalance)
                .creditLimit(credit.getCreditLimit())
                .usedCredit(credit.getUsedCredit())
                .availableCredit(credit.getAvailableCredit())
                .build();
    }
}