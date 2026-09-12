package com.offlineupi.service;

import com.offlineupi.dto.OfflineTransactionDto;
import com.offlineupi.dto.SyncResponse;
import com.offlineupi.entity.User;
import com.offlineupi.exception.DuplicateTransactionException;
import com.offlineupi.exception.InsufficientBalanceException;
import com.offlineupi.repository.BankAccountRepository;
import com.offlineupi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private static final BigDecimal SYNC_FAILURE_PENALTY = new BigDecimal("50.00");

    private final UserRepository userRepository;
    private final PenaltyService penaltyService;
    private final OfflineTransactionProcessor transactionProcessor;
    private final BankAccountRepository bankAccountRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public SyncResponse syncOfflineTransactions(List<OfflineTransactionDto> pendingTransactions) {
        User sender = getAuthenticatedUser();
        List<String> successful = new ArrayList<>();
        List<String> failed = new ArrayList<>();
        List<String> alreadySynced = new ArrayList<>();

        for (OfflineTransactionDto txnDto : pendingTransactions) {
            try {
                transactionProcessor.processSingleOfflineTransaction(sender, txnDto);
                successful.add(txnDto.getTransactionId());

            } catch (DuplicateTransactionException e) {
                alreadySynced.add(txnDto.getTransactionId());

            } catch (InsufficientBalanceException e) {
                applyOfflineSyncPenalty(sender, txnDto);
                failed.add(txnDto.getTransactionId()
                        + " - Reason: Insufficient balance. A ₹" + SYNC_FAILURE_PENALTY + " penalty was applied.");

            } catch (Exception e) {
                log.error("Failed to sync transaction {}", txnDto.getTransactionId(), e);
                failed.add(txnDto.getTransactionId() + " - Reason: " + e.getMessage());
            }
        }

        return new SyncResponse(successful, failed, alreadySynced);
    }

    private void applyOfflineSyncPenalty(User sender, OfflineTransactionDto txnDto) {
        try {
            bankAccountRepository.forcePenaltyDeduction(SYNC_FAILURE_PENALTY, sender.getId());
            penaltyService.createPenalty(sender, SYNC_FAILURE_PENALTY.doubleValue(),
                    "Failed Offline Sync: TXN " + txnDto.getTransactionId());
        } catch (Exception penaltyError) {

            log.error("Failed to apply sync penalty for user {} / txn {}",
                    sender.getId(), txnDto.getTransactionId(), penaltyError);
        }
    }
}