package com.offlineupi.repository;

import com.offlineupi.entity.Penalty;
import com.offlineupi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    List<Penalty> findByUser(User user);
}