package com.ecommerce.controller;

import com.ecommerce.dto.UserRegisterDTO;
import com.ecommerce.entity.User;
import com.ecommerce.service.UserService;
import com.ecommerce.util.JwtUtil;
import com.ecommerce.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public Result<Void> register(@RequestBody UserRegisterDTO dto) {
        userService.register(dto);
        return Result.ok("注册成功");
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestParam String userName, @RequestParam String userPassword) {
        User user = userService.login(userName, userPassword);
        String token = JwtUtil.generateToken(user.getUserId());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getUserId());
        return Result.success(data, "登录成功");
    }

    @GetMapping("/info")
    public Result<User> info(@RequestParam Long userId) {
        User user = userService.getUserById(userId);
        user.setUserPassword(null);
        return Result.success(user, "查询成功");
    }
}
