package com.ecommerce.service.impl;

import com.ecommerce.constant.OrderStatus;
import com.ecommerce.entity.Order;
import com.ecommerce.mapper.OrderMapper;
import com.ecommerce.service.OrderService;
import com.ecommerce.vo.OrderVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;

    @Override
    public List<OrderVO> getMyOrders(Long userId) {
        return orderMapper.findByUserId(userId);
    }

    @Override
    public void createOrder(Order order) {
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
        order.setOrderCreateTime(LocalDateTime.now());
        orderMapper.insert(order);
        log.info("创建订单, userId={}", order.getUserId());
    }

    @Override
    public void pay(Long orderId) {
        orderMapper.update(orderId, OrderStatus.PAID);
        log.info("订单付款, orderId={}", orderId);
    }

    @Override
    public void confirm(Long orderId) {
        orderMapper.update(orderId, OrderStatus.RECEIVED);
        log.info("确认收货, orderId={}", orderId);
    }

    @Override
    public void cancel(Long orderId) {
        orderMapper.update(orderId, OrderStatus.CANCELLED);
        log.info("取消订单, orderId={}", orderId);
    }
}
