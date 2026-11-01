package com.ecommerce.service.impl;

import com.ecommerce.constant.OrderStatus;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Product;
import com.ecommerce.mapper.OrderMapper;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.service.OrderService;
import com.ecommerce.vo.OrderVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public void createOrder(Order order, Long userId) {
        if (order == null || order.getProductId() == null) {
            throw new IllegalArgumentException("请选择要购买的商品");
        }

        Integer quantity = order.getOrderQuantity();
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("购买数量必须大于 0");
        }

        String address = order.getOrderAddress();
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("请填写收货地址");
        }

        Product product = productMapper.findById(order.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("商品不存在或已下架");
        }
        if (product.getProductStock() == null || product.getProductStock() < quantity) {
            throw new IllegalArgumentException("商品库存不足");
        }

        // 条件更新库存，避免并发超卖
        if (productMapper.decreaseStock(product.getProductId(), quantity) == 0) {
            throw new IllegalArgumentException("商品库存不足");
        }

        // 金额、状态、用户均以服务端为准，不信任前端传值
        order.setOrderId(null);
        order.setUserId(userId);
        order.setOrderQuantity(quantity);
        order.setOrderPrice(product.getProductPrice().multiply(BigDecimal.valueOf(quantity)));
        order.setOrderAddress(address.trim());
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
        order.setOrderCreateTime(LocalDateTime.now());

        orderMapper.insert(order);
        log.info("创建订单, userId={}, productId={}, quantity={}", userId, order.getProductId(), quantity);
    }

    @Override
    public List<OrderVO> getMyOrders(Long userId) {
        return orderMapper.findByUserId(userId);
    }

    @Override
    @Transactional
    public void pay(Long orderId, Long userId) {
        Order order = requireOwnedOrder(orderId, userId);
        transit(order, OrderStatus.PENDING_PAYMENT, OrderStatus.PAID);
        log.info("订单付款, orderId={}", orderId);
    }

    @Override
    @Transactional
    public void confirm(Long orderId, Long userId) {
        Order order = requireOwnedOrder(orderId, userId);
        transit(order, OrderStatus.PAID, OrderStatus.RECEIVED);
        log.info("确认收货, orderId={}", orderId);
    }

    @Override
    @Transactional
    public void cancel(Long orderId, Long userId) {
        Order order = requireOwnedOrder(orderId, userId);
        transit(order, OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED);

        // 只有未付款订单会占用库存，取消后需要归还
        productMapper.increaseStock(order.getProductId(), order.getOrderQuantity());
        log.info("取消订单并回滚库存, orderId={}, productId={}", orderId, order.getProductId());
    }

    /**
     * 校验订单归属，防止通过订单 ID 操作他人订单
     */
    private Order requireOwnedOrder(Long orderId, Long userId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }
        if (!Objects.equals(order.getUserId(), userId)) {
            throw new IllegalArgumentException("无权操作该订单");
        }
        return order;
    }

    /**
     * 状态流转：仅允许 currentStatus → nextStatus，避免重复支付 / 重复取消
     */
    private void transit(Order order, int currentStatus, int nextStatus) {
        if (!Objects.equals(order.getOrderStatus(), currentStatus)) {
            throw new IllegalArgumentException("当前订单状态不支持该操作");
        }
        if (orderMapper.updateStatus(order.getOrderId(), currentStatus, nextStatus) == 0) {
            throw new IllegalArgumentException("订单状态已变化，请刷新后重试");
        }
    }
}
