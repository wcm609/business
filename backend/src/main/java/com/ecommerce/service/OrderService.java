package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.vo.OrderVO;

import java.util.List;

public interface OrderService {

    /**
     * 下单
     */
    void createOrder(Order order);

    /**
     * 查看我的订单列表（含商品信息）
     */
    List<OrderVO> getMyOrders(Long userId);

    /**
     * 付款（状态从 0 改为 1）
     */
    void pay(Long orderId);

    /**
     * 确认收货（状态改为 3）
     */
    void confirm(Long orderId);

    /**
     * 取消订单（状态改为 4）
     */
    void cancel(Long orderId);
}
