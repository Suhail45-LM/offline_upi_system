package com.offlineupi.service;

import com.offlineupi.dto.AmountRequest;
import com.offlineupi.dto.BankAccountResponse;
import com.offlineupi.entity.BankAccount;
import com.offlineupi.entity.User;
import com.offlineupi.repository.BankAccountRepository;
import com.offlineupi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;


    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public BankAccountResponse createAccount() {
        User user = getAuthenticatedUser();

        if (bankAccountRepository.existsByUser(user)) {
            throw new RuntimeException("Bank account already exists for this user");
        }


        String accNumber = "MOCK" + (1000000000L + new Random().nextInt(900000000));

        BankAccount account = BankAccount.builder()
                .user(user)
                .accountNumber(accNumber)
                .balance(BigDecimal.ZERO)
                .build();

        bankAccountRepository.save(account);
        return mapToResponse(account);
    }

    public BankAccountResponse getMyAccount() {
        User user = getAuthenticatedUser();
        BankAccount account = bankAccountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No bank account found. Please create one."));
        return mapToResponse(account);
    }

    @Transactional
    public BankAccountResponse deposit(AmountRequest request) {
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be greater than zero");
        }

        User user = getAuthenticatedUser();
        BankAccount account = bankAccountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No bank account found"));

        account.setBalance(account.getBalance().add(request.getAmount()));
        bankAccountRepository.save(account);

        return mapToResponse(account);
    }

    @Transactional
    public BankAccountResponse withdraw(AmountRequest request) {
        User user = getAuthenticatedUser();
        BankAccount account = bankAccountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No bank account found"));

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        bankAccountRepository.save(account);

        return mapToResponse(account);
    }

    private BankAccountResponse mapToResponse(BankAccount account) {
        return BankAccountResponse.builder()
                .accountNumber(account.getAccountNumber())
                .balance(account.getBalance())
                .ownerName(account.getUser().getName())
                .build();
    }
}