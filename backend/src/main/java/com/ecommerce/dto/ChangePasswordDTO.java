package com.ecommerce.dto;

import lombok.Data;

/**
 * 修改密码请求体
 */
@Data
public class ChangePasswordDTO {
    private String oldPassword;
    private String newPassword;
}
