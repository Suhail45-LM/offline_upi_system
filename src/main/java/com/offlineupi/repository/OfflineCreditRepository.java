package com.offlineupi.repository;

import com.offlineupi.entity.OfflineCredit;
import com.offlineupi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OfflineCreditRepository extends JpaRepository<OfflineCredit, Long> {
    Optional<OfflineCredit> findByUser(User user);
}