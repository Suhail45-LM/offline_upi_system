package com.offlineupi.repository;

import com.offlineupi.entity.Merchant;
import com.offlineupi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    Optional<Merchant> findByUser(User user);
    boolean existsByUser(User user);
}