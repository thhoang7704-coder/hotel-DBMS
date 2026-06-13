package com.example.hotel.module.payment.service.interfaces;

import java.util.List;
import java.util.UUID;

import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.module.payment.dto.PaymentAdminResponse;
import com.example.hotel.module.wallet.dto.PaymentResponse;

public interface IPaymentService {
    PaymentResponse pay(UUID bookingId);

    List<PaymentResponse> getMyPayments();

    PaginationResponse<PaymentAdminResponse> getAllPayments(
            PageRequestDTO pageRequestDTO);
}
