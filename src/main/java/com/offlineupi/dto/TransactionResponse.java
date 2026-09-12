package com.offlineupi.dto;

import com.offlineupi.entity.enums.PaymentMode;
import com.offlineupi.entity.enums.TransactionStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private String transactionId;
    private String senderName;
    private String merchantName;
    private BigDecimal amount;
    private PaymentMode paymentMode;
    private TransactionStatus status;
    private LocalDateTime timestamp;
}