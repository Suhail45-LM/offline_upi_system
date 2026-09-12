package com.offlineupi.service;

import com.offlineupi.dto.OfflineTransactionDto;
import com.offlineupi.entity.*;
import com.offlineupi.entity.enums.PaymentMode;
import com.offlineupi.entity.enums.TransactionStatus;
import com.offlineupi.exception.DuplicateTransactionException;
import com.offlineupi.exception.InsufficientBalanceException;
import com.offlineupi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OfflineTransactionProcessor {

    private final TransactionRepository transactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final MerchantRepository merchantRepository;
    private final OfflineCreditRepository offlineCreditRepository;


    @Transactional(noRollbackFor = InsufficientBalanceException.class)
    public void processSingleOfflineTransaction(User sender, OfflineTransactionDto txnDto) {
        if (transactionRepository.existsById(txnDto.getTransactionId())) {
            throw new DuplicateTransactionException("Transaction already synced.");
        }

        Merchant merchant = merchantRepository.findById(txnDto.getMerchantId())
                .orElseThrow(() -> new RuntimeException("Merchant not found."));

        BankAccount senderAccount = bankAccountRepository.findByUser(sender)
                .orElseThrow(() -> new RuntimeException("Sender bank account not found."));

        BankAccount merchantAccount = bankAccountRepository.findByUser(merchant.getUser())
                .orElseThrow(() -> new RuntimeException("Merchant bank account not found."));

        if (senderAccount.getId().equals(merchantAccount.getId())) {
            saveTransaction(txnDto, sender, merchant, TransactionStatus.FAILED);
            throw new RuntimeException("Fraud Prevention: You cannot pay your own merchant account.");
        }

        OfflineCredit credit = offlineCreditRepository.findByUser(sender)
                .orElseThrow(() -> new RuntimeException("Offline credit profile not found."));


        if (senderAccount.getBalance().compareTo(txnDto.getAmount()) < 0) {
            saveTransaction(txnDto, sender, merchant, TransactionStatus.FAILED);
            throw new InsufficientBalanceException("Insufficient actual bank balance.");
        }


        if (credit.getAvailableCredit().compareTo(txnDto.getAmount()) < 0) {
            throw new RuntimeException("Exceeded offline credit limit.");
        }

        senderAccount.setBalance(senderAccount.getBalance().subtract(txnDto.getAmount()));

        merchantAccount.setBalance(merchantAccount.getBalance().add(txnDto.getAmount()));

        credit.setAvailableCredit(credit.getAvailableCredit().subtract(txnDto.getAmount()));
        credit.setUsedCredit(credit.getUsedCredit().add(txnDto.getAmount()));

        bankAccountRepository.save(senderAccount);
        bankAccountRepository.save(merchantAccount);
        offlineCreditRepository.save(credit);

        saveTransaction(txnDto, sender, merchant, TransactionStatus.SETTLED);
    }

    private void saveTransaction(OfflineTransactionDto txnDto, User sender, Merchant merchant, TransactionStatus status) {
        Transaction transaction = Transaction.builder()
                .transactionId(txnDto.getTransactionId())
                .sender(sender)
                .merchant(merchant)
                .amount(txnDto.getAmount())
                .paymentMode(PaymentMode.OFFLINE)
                .status(status)

                .createdAt(txnDto.getTimestamp() != null ? LocalDateTime.parse(txnDto.getTimestamp().replace("Z", "")) : LocalDateTime.now())
                .syncedAt(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);
    }
}