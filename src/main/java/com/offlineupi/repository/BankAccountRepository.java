package com.offlineupi.repository;

import com.offlineupi.entity.BankAccount;
import com.offlineupi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    Optional<BankAccount> findByUser(User user);

    boolean existsByUser(User user);


    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Query("UPDATE BankAccount b SET b.balance = b.balance - :penalty WHERE b.user.id = :userId")
    void forcePenaltyDeduction(@Param("penalty") BigDecimal penalty, @Param("userId") Long userId);
}