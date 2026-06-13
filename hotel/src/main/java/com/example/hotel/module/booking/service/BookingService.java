package com.example.hotel.module.booking.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hotel.User.User;
import com.example.hotel.User.repository.UserRepository;
import com.example.hotel.common.exception.BadRequestException;
import com.example.hotel.common.exception.ResourceNotFoundException;
import com.example.hotel.common.exception.UnauthorizedException;
import com.example.hotel.common.response.PageRequestDTO;
import com.example.hotel.common.response.PaginationResponse;
import com.example.hotel.common.security.SecurityUtils;
import com.example.hotel.common.security.UserDetailsImpl;
import com.example.hotel.enums.BookingStatus;
import com.example.hotel.enums.InvoiceItemType;
import com.example.hotel.enums.InvoiceStatus;
import com.example.hotel.enums.RoomStatus;
import com.example.hotel.module.booking.dto.BookingResponse;
import com.example.hotel.module.booking.dto.CreateBookingRequest;
import com.example.hotel.module.booking.entity.Booking;
import com.example.hotel.module.booking.repository.BookingRepository;
import com.example.hotel.module.booking.service.interfaces.IBookingService;
import com.example.hotel.module.invoice.dto.BookingWithInvoiceResponse;
import com.example.hotel.module.invoice.dto.InvoiceResponse;
import com.example.hotel.module.invoice.enitity.Invoice;
import com.example.hotel.module.invoice.enitity.InvoiceItem;
import com.example.hotel.module.invoice.repository.InvoiceItemRepository;
import com.example.hotel.module.invoice.repository.InvoiceRepository;
import com.example.hotel.module.room.entity.Room;
import com.example.hotel.module.room.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService implements IBookingService {
        private final BookingRepository bookingRepository;
        private final RoomRepository roomRepository;
        private final UserRepository userRepository;
        private final InvoiceRepository invoiceRepository;
        private final InvoiceItemRepository invoiceItemRepository;

        @Override
        @Transactional
        public BookingWithInvoiceResponse createBooking(
                        CreateBookingRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                if (currentUser == null) {
                        throw new UnauthorizedException(
                                        "401",
                                        "Unauthorized");
                }

                User user = userRepository.findById(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "User not found"));

                Room room = roomRepository.findByIdForUpdate(request.getRoomId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Room not found"));

                if (room.getStatus() == RoomStatus.MAINTENANCE) {
                        throw new BadRequestException(
                                        "400",
                                        "Room is under maintenance");
                }

                if (request.getCheckIn().isBefore(LocalDate.now())) {
                        throw new BadRequestException(
                                        "400",
                                        "Check-in date must be today or later");
                }

                if (!request.getCheckOut().isAfter(request.getCheckIn())) {
                        throw new BadRequestException(
                                        "400",
                                        "Check-out date must be after check-in date");
                }

                boolean hasConflict = bookingRepository.existsOverlappingBooking(
                                room.getId(),
                                request.getCheckIn(),
                                request.getCheckOut());

                if (hasConflict) {
                        throw new BadRequestException(
                                        "400",
                                        "Room has already been booked in this period");
                }
                // dùng ChronoUnit để tính số ngày giữa check-in và check-out, sau đó nhân với
                // giá phòng để tính tổng tiền
                long days = ChronoUnit.DAYS.between(
                                request.getCheckIn(),
                                request.getCheckOut());

                BigDecimal totalPrice = room.getPricePerNight()
                                .multiply(BigDecimal.valueOf(days));

                Booking booking = Booking.builder()
                                .user(user)
                                .room(room)
                                .checkIn(request.getCheckIn())
                                .checkOut(request.getCheckOut())
                                .totalPrice(totalPrice)
                                .status(BookingStatus.PENDING)
                                .build();

                booking = bookingRepository.save(booking);

                Invoice invoice = Invoice.builder()
                                .booking(booking)
                                .user(user)
                                .totalAmount(totalPrice)
                                .status(InvoiceStatus.PENDING)
                                .build();

                invoice = invoiceRepository.save(invoice);

                invoiceItemRepository.save(
                                InvoiceItem.builder()
                                                .invoice(invoice)
                                                .itemType(InvoiceItemType.ROOM)
                                                .itemName(room.getRoomType().name())
                                                .quantity((int) days)
                                                .unitPrice(room.getPricePerNight())
                                                .subtotal(totalPrice)
                                                .build());

                return BookingWithInvoiceResponse.builder()
                                .booking(BookingResponse.fromEntity(booking))
                                .invoice(InvoiceResponse.fromEntity(invoice))
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public PaginationResponse<BookingWithInvoiceResponse> getMyBookings(
                        PageRequestDTO pageRequestDTO) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                if (currentUser == null) {
                        throw new UnauthorizedException(
                                        "401",
                                        "Unauthorized");
                }

                Page<Invoice> invoicePage = invoiceRepository
                                .findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageRequestDTO.toPageable());

                Page<BookingWithInvoiceResponse> responsePage = invoicePage.map(invoice -> {
                        return BookingWithInvoiceResponse.builder()
                                        .booking(BookingResponse.fromEntity(invoice.getBooking()))
                                        .invoice(InvoiceResponse.fromEntity(invoice))
                                        .build();
                });

                return PaginationResponse.fromPage(responsePage);
        }

}
