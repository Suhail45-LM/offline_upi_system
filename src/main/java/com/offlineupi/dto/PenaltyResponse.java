package com.offlineupi.dto;

import com.offlineupi.entity.enums.PenaltyStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PenaltyResponse {
    private Long penaltyId;
    private BigDecimal amount;
    private String reason;
    private PenaltyStatus status;
}