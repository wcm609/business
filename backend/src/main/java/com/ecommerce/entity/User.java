package com.ecommerce.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long userId;
    private String userName;
    private String userPassword;
    private String userPhone;
    private LocalDateTime userRegisterTime;
}
