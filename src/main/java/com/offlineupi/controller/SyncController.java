package com.offlineupi.controller;

import com.offlineupi.dto.OfflineTransactionDto;
import com.offlineupi.dto.SyncResponse;
import com.offlineupi.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    @PostMapping("/sync")
    public ResponseEntity<SyncResponse> syncTransactions(@RequestBody List<OfflineTransactionDto> pendingTransactions) {
        SyncResponse response = syncService.syncOfflineTransactions(pendingTransactions);
        return ResponseEntity.ok(response);
    }
}