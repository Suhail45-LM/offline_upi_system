package com.offlineupi.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MerchantProfileResponse {
    private Long merchantId;
    private String businessName;
    private String ownerName;
}