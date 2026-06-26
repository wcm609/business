package com.ecommerce.config;

import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 登录校验拦截器
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 非控制器请求（如静态资源）直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("未登录或 Token 已过期");
        }

        token = token.substring(7);
        Long userId = JwtUtil.parseToken(token);
        request.setAttribute("userId", userId);
        return true;
    }
}