package com.offlineupi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class SyncResponse {
    private List<String> successfulTransactions;
    private List<String> failedTransactions;
    private List<String> alreadySyncedTransactions;
}