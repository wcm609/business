# Business - 电商后端服务

基于 Spring Boot 3 的电商后端 RESTful API 项目，包含用户、商品、订单三大模块。

## 技术栈

- **框架**: Spring Boot 3.5 + MyBatis 3.0
- **语言**: Java 17
- **数据库**: MySQL 8
- **安全**: JWT 鉴权 + BCrypt 密码加密
- **构建**: Maven

## 快速启动

### 1. 创建数据库

```sql
CREATE DATABASE business CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置数据库连接

修改 `src/main/resources/application.yml` 中的数据库用户名和密码。

### 3. 运行

```bash
mvn spring-boot:run
```

服务启动在 `http://localhost:8080`

## API 接口

### 用户模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/user/register` | 注册 (JSON body) |
| POST | `/user/login` | 登录 (表单参数) |
| GET | `/user/info?userId=` | 获取用户信息 |

### 商品模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/product/list` | 商品列表 |
| GET | `/product/detail?productName=` | 按名称查询 |
| POST | `/product/add` | 新增商品 |

### 订单模块（需 JWT Token）
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/order/create` | 下单 |
| GET | `/order/list?userId=` | 我的订单 |
| PUT | `/order/pay?orderId=` | 付款 |
| PUT | `/order/confirm?orderId=` | 确认收货 |
| PUT | `/order/cancel?orderId=` | 取消订单 |

> 订单模块需要在 Header 中携带 `Authorization: Bearer <token>`

## 测试账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| admin | 123456 | 管理员 |
| zhangsan | 123456 | 普通用户 |
| lisi | 123456 | 普通用户 |
| manager | admin123 | 管理员 |

## 项目结构

```
src/main/java/com/ecommerce/
├── config/          # 配置类（JWT拦截器、全局异常处理、WebMVC）
├── constant/        # 常量定义
├── controller/      # 控制器层
├── dto/             # 数据传输对象
├── entity/          # 实体类
├── exception/       # 自定义异常
├── mapper/          # MyBatis 数据访问层
├── service/         # 业务逻辑层
├── util/            # 工具类（JWT）
└── vo/              # 视图对象
```
