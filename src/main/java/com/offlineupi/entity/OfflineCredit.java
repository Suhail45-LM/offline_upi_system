package com.offlineupi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offline_credits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OfflineCredit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private BigDecimal creditLimit;
    private BigDecimal usedCredit;
    private BigDecimal availableCredit;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}