package com.offlineupi.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OfflineTransactionDto {
    private String transactionId;
    private Long merchantId;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private String timestamp;
}