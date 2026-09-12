package com.offlineupi.service;

import com.offlineupi.dto.TransactionResponse;
import com.offlineupi.entity.Merchant;
import com.offlineupi.entity.Transaction;
import com.offlineupi.entity.User;
import com.offlineupi.repository.MerchantRepository;
import com.offlineupi.repository.TransactionRepository;
import com.offlineupi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final MerchantRepository merchantRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<TransactionResponse> getMySentHistory() {
        User user = getAuthenticatedUser();
        return transactionRepository.findBySenderOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getMerchantReceivedHistory() {
        User user = getAuthenticatedUser();
        Merchant merchant = merchantRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("You do not have a merchant profile."));

        return transactionRepository.findByMerchantOrderByCreatedAtDesc(merchant)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .senderName(transaction.getSender().getName())
                .merchantName(transaction.getMerchant().getBusinessName())
                .amount(transaction.getAmount())
                .paymentMode(transaction.getPaymentMode())
                .status(transaction.getStatus())
                .timestamp(transaction.getCreatedAt())
                .build();
    }
}