package com.ecommerce.constant;

/**
 * 订单状态常量
 */
public final class OrderStatus {

    private OrderStatus() {}

    /** 待付款 */
    public static final int PENDING_PAYMENT = 0;

    /** 已付款 */
    public static final int PAID = 1;

    /** 已确认收货 */
    public static final int RECEIVED = 3;

    /** 已取消 */
    public static final int CANCELLED = 4;
}