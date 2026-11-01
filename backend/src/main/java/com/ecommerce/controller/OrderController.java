package com.ecommerce.controller;

import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import com.ecommerce.vo.OrderVO;
import com.ecommerce.vo.Result;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    public Result<Void> createOrder(@RequestBody Order order, HttpServletRequest request) {
        orderService.createOrder(order, currentUserId(request));
        return Result.ok("下单成功");
    }

    /**
     * 当前登录用户的订单列表（不再接收 userId 参数，杜绝越权查看）
     */
    @GetMapping("/list")
    public Result<List<OrderVO>> getMyOrders(HttpServletRequest request) {
        List<OrderVO> orders = orderService.getMyOrders(currentUserId(request));
        return Result.success(orders, "查询成功");
    }

    @PutMapping("/pay")
    public Result<Void> pay(@RequestParam Long orderId, HttpServletRequest request) {
        orderService.pay(orderId, currentUserId(request));
        return Result.ok("付款成功");
    }

    @PutMapping("/confirm")
    public Result<Void> confirm(@RequestParam Long orderId, HttpServletRequest request) {
        orderService.confirm(orderId, currentUserId(request));
        return Result.ok("确认收货成功");
    }

    @PutMapping("/cancel")
    public Result<Void> cancel(@RequestParam Long orderId, HttpServletRequest request) {
        orderService.cancel(orderId, currentUserId(request));
        return Result.ok("取消成功");
    }

    private Long currentUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new IllegalArgumentException("未获取到登录用户");
        }
        return (Long) userId;
    }
}
