package com.offlineupi.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QrDataResponse {
    private Long merchantId;
    private String merchantName;
    private String simulatedQrString;
}