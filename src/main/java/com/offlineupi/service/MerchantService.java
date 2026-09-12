package com.offlineupi.service;

import com.offlineupi.dto.MerchantProfileRequest;
import com.offlineupi.dto.MerchantProfileResponse;
import com.offlineupi.dto.QrDataResponse;
import com.offlineupi.entity.Merchant;
import com.offlineupi.entity.User;
import com.offlineupi.entity.enums.Role;
import com.offlineupi.repository.BankAccountRepository;
import com.offlineupi.repository.MerchantRepository;
import com.offlineupi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantRepository merchantRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public MerchantProfileResponse createProfile(MerchantProfileRequest request) {
        User user = getAuthenticatedUser();

        if (user.getRole() != Role.MERCHANT) {
            throw new RuntimeException("Only users registered with MERCHANT role can create a business profile.");
        }

        if (!bankAccountRepository.existsByUser(user)) {
            throw new RuntimeException("Please create a bank account first to receive payments.");
        }

        if (merchantRepository.existsByUser(user)) {
            throw new RuntimeException("Merchant profile already exists.");
        }

        Merchant merchant = Merchant.builder()
                .user(user)
                .businessName(request.getBusinessName())
                .build();

        merchantRepository.save(merchant);

        return MerchantProfileResponse.builder()
                .merchantId(merchant.getId())
                .businessName(merchant.getBusinessName())
                .ownerName(user.getName())
                .build();
    }

    public QrDataResponse generateQr() {
        User user = getAuthenticatedUser();
        Merchant merchant = merchantRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Merchant profile not found."));


        String qrString = String.format("offlineupi://pay?mid=%d&mname=%s",
                merchant.getId(),
                merchant.getBusinessName().replaceAll(" ", "%20"));

        return QrDataResponse.builder()
                .merchantId(merchant.getId())
                .merchantName(merchant.getBusinessName())
                .simulatedQrString(qrString)
                .build();
    }
}