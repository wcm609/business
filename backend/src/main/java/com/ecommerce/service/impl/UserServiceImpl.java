package com.ecommerce.service.impl;

import com.ecommerce.dto.UserRegisterDTO;
import com.ecommerce.entity.User;
import com.ecommerce.mapper.UserMapper;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void register(UserRegisterDTO dto) {
        if (dto == null || dto.getUserName() == null || dto.getUserName().isBlank()) {
            throw new IllegalArgumentException("请输入用户名");
        }
        if (dto.getUserPassword() == null || dto.getUserPassword().length() < 6) {
            throw new IllegalArgumentException("密码长度不能少于 6 位");
        }
        if (dto.getUserPhone() == null || !dto.getUserPhone().matches("^1[3-9]\\d{9}$")) {
            throw new IllegalArgumentException("请输入正确的手机号");
        }

        User existing = userMapper.findByUserName(dto.getUserName().trim());
        if (existing != null) {
            throw new IllegalArgumentException("用户名已存在");
        }

        User user = new User();
        user.setUserName(dto.getUserName().trim());
        user.setUserPassword(passwordEncoder.encode(dto.getUserPassword()));
        user.setUserPhone(dto.getUserPhone());
        user.setUserRegisterTime(LocalDateTime.now());

        userMapper.insert(user);
    }

    @Override
    public User login(String userName, String userPassword) {
        if (userName == null || userName.isBlank() || userPassword == null || userPassword.isBlank()) {
            throw new IllegalArgumentException("请输入用户名和密码");
        }
        User user = userMapper.findByUserName(userName);
        // 统一提示，避免暴露“用户名是否存在”
        if (user == null || !passwordEncoder.matches(userPassword, user.getUserPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        return user;
    }

    @Override
    public User findByUserName(String userName) {
        return userMapper.findByUserName(userName);
    }

    @Override
    public User getUserById(Long userId) {
        User user = userMapper.findByUserId(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        return user;
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(oldPassword, user.getUserPassword())) {
            throw new IllegalArgumentException("当前密码不正确");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("新密码长度不能少于 6 位");
        }
        if (passwordEncoder.matches(newPassword, user.getUserPassword())) {
            throw new IllegalArgumentException("新密码不能与当前密码相同");
        }

        userMapper.updatePassword(userId, passwordEncoder.encode(newPassword));
    }
}
