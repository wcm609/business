package com.ecommerce.exception;

/**
 * 未授权/未登录异常
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}