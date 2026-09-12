package com.offlineupi.dto;

import com.offlineupi.entity.enums.PaymentMode;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String transactionId; // Optional for online, mandatory for offline
    private Long merchantId;
    private BigDecimal amount;
    private PaymentMode paymentMode; // ONLINE or OFFLINE
}