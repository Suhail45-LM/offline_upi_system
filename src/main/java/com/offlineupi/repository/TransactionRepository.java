package com.offlineupi.repository;

import com.offlineupi.entity.Merchant;
import com.offlineupi.entity.Transaction;
import com.offlineupi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, String> {

    List<Transaction> findBySenderOrderByCreatedAtDesc(User sender);


    List<Transaction> findByMerchantOrderByCreatedAtDesc(Merchant merchant);
}