package com.example.hotel.common.response;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginationResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean empty;

    public static <T> PaginationResponse<T> fromPage(Page<T> page) {

        return new PaginationResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty());

    }

    public static <T> PaginationResponse<T> fromList(List<T> content, int pageNumber, int pageSize,
            long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        return new PaginationResponse<>(
                content,
                pageNumber,
                pageSize,
                totalElements,
                totalPages,
                pageNumber == 0,
                pageNumber >= totalPages - 1,
                content.isEmpty());
    }
}