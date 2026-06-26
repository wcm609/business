package com.ecommerce.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Order {
    private Long orderId;
    private Long userId;
    private Long productId;
    private Integer orderQuantity;
    private BigDecimal orderPrice;
    private String orderAddress;
    private Integer orderStatus;
    private LocalDateTime orderCreateTime;
}
