package com.offlineupi.service;

import com.offlineupi.dto.PaymentRequest;
import com.offlineupi.dto.TransactionResponse;
import com.offlineupi.entity.BankAccount;
import com.offlineupi.entity.Merchant;
import com.offlineupi.entity.Transaction;
import com.offlineupi.entity.User;
import com.offlineupi.entity.enums.PaymentMode;
import com.offlineupi.entity.enums.TransactionStatus;
import com.offlineupi.repository.BankAccountRepository;
import com.offlineupi.repository.MerchantRepository;
import com.offlineupi.repository.TransactionRepository;
import com.offlineupi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final TransactionRepository transactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final MerchantRepository merchantRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public TransactionResponse processPayment(PaymentRequest request) {
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero.");
        }

        User sender = getAuthenticatedUser();

        Merchant merchant = merchantRepository.findById(request.getMerchantId())
                .orElseThrow(() -> new RuntimeException("Merchant not found."));

        BankAccount senderAccount = bankAccountRepository.findByUser(sender)
                .orElseThrow(() -> new RuntimeException("Sender bank account not found."));

        BankAccount merchantAccount = bankAccountRepository.findByUser(merchant.getUser())
                .orElseThrow(() -> new RuntimeException("Merchant bank account not found."));


        if (senderAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient bank balance for this transaction.");
        }


        String txnId = request.getTransactionId();
        if (txnId == null || txnId.trim().isEmpty()) {
            txnId = "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }


        if (transactionRepository.existsById(txnId)) {
            throw new RuntimeException("Duplicate Transaction: " + txnId + " already exists.");
        }


        senderAccount.setBalance(senderAccount.getBalance().subtract(request.getAmount()));
        bankAccountRepository.save(senderAccount);


        merchantAccount.setBalance(merchantAccount.getBalance().add(request.getAmount()));
        bankAccountRepository.save(merchantAccount);


        Transaction transaction = Transaction.builder()
                .transactionId(txnId)
                .sender(sender)
                .merchant(merchant)
                .amount(request.getAmount())
                .paymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : PaymentMode.ONLINE)
                .status(TransactionStatus.SETTLED)
                .createdAt(LocalDateTime.now())
                .syncedAt(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);

        return TransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .senderName(sender.getName())
                .merchantName(merchant.getBusinessName())
                .amount(transaction.getAmount())
                .paymentMode(transaction.getPaymentMode())
                .status(transaction.getStatus())
                .timestamp(transaction.getSyncedAt())
                .build();
    }
}