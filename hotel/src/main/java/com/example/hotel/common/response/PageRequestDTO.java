package com.example.hotel.common.response;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageRequestDTO {
        private int page = 0;
        private int size = 10;
        private String sortBy = "id";
        private String sortDirection = "asc";

        public Pageable toPageable() {
                Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                                : Sort.Direction.ASC;
                return PageRequest.of(page, size, Sort.by(direction, sortBy));
        }

        public static PageRequestDTO of(int page, int size) {
                return new PageRequestDTO(page, size, "id", "asc");
        }

        public static PageRequestDTO of(int page, int size, String sortBy) {
                return new PageRequestDTO(page, size, sortBy, "asc");
        }

        public static PageRequestDTO of(int page, int size, String sortBy, String sortDirection) {
                return new PageRequestDTO(page, size, sortBy, sortDirection);
        }

}
