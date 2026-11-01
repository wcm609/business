package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.vo.OrderVO;

import java.util.List;

public interface OrderService {

    /**
     * 创建订单（校验商品与库存，金额以服务端商品价格为准）
     *
     * @param order  前端提交的订单信息（商品、数量、地址）
     * @param userId 当前登录用户
     */
    void createOrder(Order order, Long userId);

    /**
     * 查看指定用户的订单列表（含商品信息）
     */
    List<OrderVO> getMyOrders(Long userId);

    /**
     * 付款（0 → 1）
     */
    void pay(Long orderId, Long userId);

    /**
     * 确认收货（1 → 3）
     */
    void confirm(Long orderId, Long userId);

    /**
     * 取消订单（0 → 4）并回滚库存
     */
    void cancel(Long orderId, Long userId);
}
