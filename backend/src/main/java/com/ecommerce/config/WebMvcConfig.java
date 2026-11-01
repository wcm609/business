package com.ecommerce.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 需要登录的接口：订单相关、个人信息、修改密码、商品新增
        // 登录、注册、商品浏览保持匿名可访问
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/order/**", "/user/info", "/user/password", "/product/add")
                .excludePathPatterns("/user/login", "/user/register");
    }
}
