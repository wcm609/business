package com.ecommerce.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单视图对象（包含商品信息）
 */
@Data
public class OrderVO {
    private Long orderId;
    private Long userId;
    private Long productId;
    private Integer orderQuantity;
    private BigDecimal orderPrice;
    private String orderAddress;
    private Integer orderStatus;
    private LocalDateTime orderCreateTime;

    // 商品信息
    private String productName;
    private BigDecimal productPrice;
    private String productDescription;
}
