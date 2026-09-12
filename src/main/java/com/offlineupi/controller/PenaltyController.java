package com.offlineupi.controller;

import com.offlineupi.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/penalty")
@RequiredArgsConstructor
public class PenaltyController {

    private final PenaltyService penaltyService;


    @GetMapping("/my-penalties")
    public ResponseEntity<?> getMyPenalties() {
        return ResponseEntity.ok(penaltyService.getMyPenalties());
    }

    @PostMapping("/pay/{id}")
    public ResponseEntity<Void> payPenalty(@PathVariable Long id) {
        penaltyService.payPenalty(id);
        return ResponseEntity.ok().build();
    }
}