package com.ecommerce.controller;

import com.ecommerce.dto.ChangePasswordDTO;
import com.ecommerce.dto.UserRegisterDTO;
import com.ecommerce.entity.User;
import com.ecommerce.service.UserService;
import com.ecommerce.util.JwtUtil;
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
    public Result<Map<String, Object>> login(@RequestParam String userName,
                                             @RequestParam String userPassword) {
        User user = userService.login(userName, userPassword);
        String token = JwtUtil.generateToken(user.getUserId());

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getUserId());
        data.put("userName", user.getUserName());
        return Result.success(data, "登录成功");
    }

    /**
     * 当前登录用户资料（用户身份从 Token 解析，避免越权查询他人信息）
     */
    @GetMapping("/info")
    public Result<User> info(HttpServletRequest request) {
        User user = userService.getUserById(currentUserId(request));
        user.setUserPassword(null);
        return Result.success(user, "查询成功");
    }

    /**
     * 修改密码
     */
    @PutMapping("/password")
    public Result<Void> changePassword(@RequestBody ChangePasswordDTO dto, HttpServletRequest request) {
        if (dto == null
                || dto.getOldPassword() == null || dto.getOldPassword().isBlank()
                || dto.getNewPassword() == null || dto.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("请填写完整的密码信息");
        }

        userService.changePassword(currentUserId(request), dto.getOldPassword(), dto.getNewPassword());
        return Result.ok("密码修改成功");
    }

    private Long currentUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        if (userId == null) {
            throw new IllegalArgumentException("未获取到登录用户");
        }
        return (Long) userId;
    }
}
