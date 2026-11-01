package com.ecommerce.config;

import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT 登录校验拦截器
 *
 * 校验通过后把用户 ID 放入 request attribute，
 * 控制器从此处取当前用户，避免信任前端传入的 userId。
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 非控制器请求（如静态资源、错误页）直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("未登录或登录已过期");
        }

        try {
            Long userId = JwtUtil.parseToken(token.substring(7));
            request.setAttribute("userId", userId);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token 被篡改、过期或格式错误，统一按未授权处理
            throw new UnauthorizedException("登录已过期，请重新登录");
        }
    }
}
