package com.offlineupi.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BankAccountResponse {
    private String accountNumber;
    private BigDecimal balance;
    private String ownerName;
}