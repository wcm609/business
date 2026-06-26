package com.ecommerce.service;

import com.ecommerce.dto.UserRegisterDTO;
import com.ecommerce.entity.User;

public interface UserService {

    /**
     * 用户注册
     */
    void register(UserRegisterDTO dto);

    /**
     * 用户登录，返回用户信息
     */
    User login(String userName, String userPassword);

    /**
     * 根据用户名查找用户
     */
    User findByUserName(String userName);

    /**
     * 根据用户 ID 查找用户
     */
    User getUserById(Long userId);
}
