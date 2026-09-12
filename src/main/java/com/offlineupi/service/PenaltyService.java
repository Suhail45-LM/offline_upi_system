package com.offlineupi.service;

import com.offlineupi.entity.BankAccount;
import com.offlineupi.entity.Penalty;
import com.offlineupi.entity.User;
import com.offlineupi.repository.BankAccountRepository;
import com.offlineupi.repository.PenaltyRepository;
import com.offlineupi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PenaltyService {

    @Autowired
    private PenaltyRepository penaltyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Penalty> getMyPenalties() {
        return penaltyRepository.findByUser(getAuthenticatedUser());
    }

    /**
     * Records a penalty for money that has ALREADY been force-collected via
     * BankAccountRepository.forcePenaltyDeduction(). Status is set to PAID
     * immediately so the user is never prompted (and never able) to pay it
     * a second time through payPenalty().
     */
    @Transactional
    public void createPenalty(User user, Double amount, String reason) {
        Penalty penalty = new Penalty();
        penalty.setUser(user);
        penalty.setAmount(amount);
        penalty.setReason(reason);
        penalty.setStatus("PAID");
        penaltyRepository.save(penalty);
    }

    @Transactional
    public void payPenalty(Long penaltyId) {
        User user = getAuthenticatedUser();

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new RuntimeException("Penalty not found"));

        if (!penalty.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if ("PAID".equals(penalty.getStatus())) {
            throw new RuntimeException("Penalty is already paid");
        }

        BankAccount account = bankAccountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));

        BigDecimal penaltyAmount = BigDecimal.valueOf(penalty.getAmount());

        if (account.getBalance().compareTo(penaltyAmount) < 0) {
            throw new RuntimeException("Insufficient bank balance to pay penalty");
        }

        account.setBalance(account.getBalance().subtract(penaltyAmount));
        bankAccountRepository.save(account);

        penalty.setStatus("PAID");
        penaltyRepository.save(penalty);
    }
}