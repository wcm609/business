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
        User existing = userMapper.findByUserName(dto.getUserName());
        if (existing != null) {
            throw new IllegalArgumentException("用户名已存在");
        }

        User user = new User();
        user.setUserName(dto.getUserName());
        user.setUserPassword(passwordEncoder.encode(dto.getUserPassword()));
        user.setUserPhone(dto.getUserPhone());
        user.setUserRegisterTime(LocalDateTime.now());

        userMapper.insert(user);
    }

    @Override
    public User login(String userName, String userPassword) {
        User user = userMapper.findByUserName(userName);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        if (!passwordEncoder.matches(userPassword, user.getUserPassword())) {
            throw new IllegalArgumentException("密码错误");
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
}
