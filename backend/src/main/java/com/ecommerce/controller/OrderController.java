package com.ecommerce.controller;

import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import com.ecommerce.vo.OrderVO;
import com.ecommerce.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    public Result<Void> createOrder(@RequestBody Order order) {
        orderService.createOrder(order);
        return Result.ok("下单成功");
    }

    @GetMapping("/list")
    public Result<List<OrderVO>> getMyOrders(@RequestParam Long userId) {
        List<OrderVO> orders = orderService.getMyOrders(userId);
        return Result.success(orders, "查询成功");
    }

    @PutMapping("/pay")
    public Result<Void> pay(@RequestParam Long orderId) {
        orderService.pay(orderId);
        return Result.ok("付款成功");
    }

    @PutMapping("/confirm")
    public Result<Void> confirm(@RequestParam Long orderId) {
        orderService.confirm(orderId);
        return Result.ok("确认收货成功");
    }

    @PutMapping("/cancel")
    public Result<Void> cancel(@RequestParam Long orderId) {
        orderService.cancel(orderId);
        return Result.ok("取消成功");
    }
}
