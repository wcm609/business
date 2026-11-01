package com.ecommerce.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * JWT 工具类
 *
 * 说明：早期实现使用 Keys.secretKeyFor() 随机生成密钥，
 * 每次重启服务都会换密钥，导致之前签发的 Token 全部失效。
 * 现在改为固定密钥（可通过 JWT_SECRET 环境变量覆盖）。
 */
public final class JwtUtil {

    /** 默认开发密钥，生产环境请务必通过 JWT_SECRET 替换 */
    private static final String DEFAULT_SECRET =
            "cola-mall-demo-jwt-secret-key-please-change-in-production";

    /** HS256 要求密钥至少 32 字节 */
    private static final int MIN_SECRET_LENGTH = 32;

    /** Token 有效期：7 天 */
    private static final long EXPIRE = 1000L * 60 * 60 * 24 * 7;

    private static final Key KEY = Keys.hmacShaKeyFor(resolveSecret().getBytes(StandardCharsets.UTF_8));

    private JwtUtil() {
    }

    /**
     * 读取环境变量中的密钥，不合法时回退到默认值
     */
    private static String resolveSecret() {
        String secret = System.getenv("JWT_SECRET");
        if (secret != null && secret.getBytes(StandardCharsets.UTF_8).length >= MIN_SECRET_LENGTH) {
            return secret;
        }
        return DEFAULT_SECRET;
    }

    /**
     * 生成 Token（subject 为用户 ID）
     */
    public static String generateToken(Long userId) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE))
                .signWith(KEY)
                .compact();
    }

    /**
     * 解析 Token，返回用户 ID
     *
     * @throws io.jsonwebtoken.JwtException Token 无效或已过期
     */
    public static Long parseToken(String token) {
        String subject = Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
        return Long.valueOf(subject);
    }
}
