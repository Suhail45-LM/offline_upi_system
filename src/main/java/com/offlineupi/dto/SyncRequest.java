package com.offlineupi.dto;

import lombok.Data;
import java.util.List;

@Data
public class SyncRequest {
    private List<OfflineTransactionDto> pendingTransactions;
}