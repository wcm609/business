-- =============================================================
-- 可乐商城 数据库初始化脚本
--
-- 适用场景：全新空库（首次搭建）
-- 已有数据时：脚本会自动跳过商品、订单的演示数据写入，
--            仅在缺少 demo 账号时补充该账号，不会覆盖已有数据。
--
-- 使用方式（Windows / macOS / Linux 均可）：
--   mysql -u root -p < init-data.sql
--
-- 演示账号：demo / 123456
-- 商品展示图统一由前端 /images.jpg 提供，数据库不存储图片地址
-- =============================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS business
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE business;

-- ---------- 用户表 ----------
CREATE TABLE IF NOT EXISTS `user` (
  `user_id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户 ID',
  `user_name`          VARCHAR(50)  NOT NULL COMMENT '用户名',
  `user_password`      VARCHAR(255) NOT NULL COMMENT 'BCrypt 加密后的密码',
  `user_phone`         VARCHAR(20)  NOT NULL COMMENT '手机号',
  `user_register_time` DATETIME     DEFAULT NULL COMMENT '注册时间',
  PRIMARY KEY (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户表';

-- ---------- 商品表 ----------
CREATE TABLE IF NOT EXISTS `product` (
  `product_id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '商品 ID',
  `product_name`        VARCHAR(100)  NOT NULL COMMENT '商品名称',
  `product_price`       DECIMAL(10,2) DEFAULT NULL COMMENT '商品价格',
  `product_stock`       INT           DEFAULT NULL COMMENT '库存数量',
  `product_description` TEXT          NOT NULL COMMENT '商品描述',
  `product_create_time` DATETIME      DEFAULT NULL COMMENT '上架时间',
  PRIMARY KEY (`product_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '商品表';

-- ---------- 订单表 ----------
CREATE TABLE IF NOT EXISTS `order` (
  `order_id`          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '订单 ID',
  `user_id`           BIGINT        NOT NULL COMMENT '下单用户',
  `product_id`        BIGINT        NOT NULL COMMENT '商品 ID',
  `order_quantity`    INT           NOT NULL COMMENT '购买数量',
  `order_price`       DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `order_address`     VARCHAR(255)  NOT NULL COMMENT '收货地址',
  `order_status`      TINYINT       DEFAULT 0 COMMENT '0待付款 1已付款 3已完成 4已取消',
  `order_create_time` DATETIME      DEFAULT NULL COMMENT '下单时间',
  PRIMARY KEY (`order_id`),
  KEY `idx_order_user` (`user_id`),
  KEY `idx_order_product` (`product_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '订单表';

-- ---------- 演示账号（仅在不存在时插入，不覆盖已有用户） ----------
INSERT INTO `user` (`user_name`, `user_password`, `user_phone`, `user_register_time`)
SELECT 'demo', '$2a$10$GI576921rkUM6fqjp2XvoOaFaN0ouGIRmE939qePPFmiYzChqd8BG', '13800138000', NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE `user_name` = 'demo');

SET @demo_user_id := (SELECT `user_id` FROM `user` WHERE `user_name` = 'demo' LIMIT 1);
SET @product_empty := (SELECT COUNT(*) = 0 FROM `product`);
SET @order_empty := (SELECT COUNT(*) = 0 FROM `order`);

-- ---------- 商品数据（仅当商品表为空时写入） ----------
INSERT INTO `product`
  (`product_id`, `product_name`, `product_price`, `product_stock`, `product_description`, `product_create_time`)
SELECT * FROM (
  SELECT 1 AS product_id, 'iPhone 15 Pro 256GB' AS product_name, 8999.00 AS product_price, 36 AS product_stock,
         '钛金属机身，A17 Pro 芯片，4800 万像素主摄，轻至 187g。' AS product_description,
         NOW() - INTERVAL 1 DAY AS product_create_time
  UNION ALL SELECT 2, 'MacBook Air 13.6 英寸 M3', 9499.00, 18, 'M3 芯片，13.6 英寸 Liquid 视网膜屏，18 小时续航，无风扇静音设计。', NOW() - INTERVAL 2 DAY
  UNION ALL SELECT 3, '索尼 WH-1000XM5 头戴耳机', 2499.00, 45, '业界领先降噪，30 小时续航，佩戴轻盈，支持多点连接。', NOW() - INTERVAL 3 DAY
  UNION ALL SELECT 4, 'Apple Watch Series 9', 2999.00, 8, 'S9 芯片，全天候视网膜屏，支持血氧与睡眠监测。', NOW() - INTERVAL 4 DAY
  UNION ALL SELECT 5, 'Nike Air Force 1 经典白', 799.00, 120, '经典空军一号版型，百搭低帮，日常通勤与街头风格都能驾驭。', NOW() - INTERVAL 5 DAY
  UNION ALL SELECT 6, '戴森 V12 Detect 无线吸尘器', 3999.00, 22, '激光探测微尘，智能显示屏，整机 HEPA 过滤，轻量手持。', NOW() - INTERVAL 6 DAY
  UNION ALL SELECT 7, '三只松鼠 坚果礼盒 1.5kg', 128.00, 500, '年货坚果大礼包，夏威夷果、碧根果、巴旦木等混合搭配。', NOW() - INTERVAL 7 DAY
  UNION ALL SELECT 8, '罗技 MX Master 3S 鼠标', 699.00, 6, '8K DPI 传感器，静音按键，人体工学设计，多设备切换。', NOW() - INTERVAL 8 DAY
  UNION ALL SELECT 9, '任天堂 Switch OLED 主机', 2599.00, 30, '7 英寸 OLED 屏幕，64GB 存储，掌机与主机模式自由切换。', NOW() - INTERVAL 9 DAY
  UNION ALL SELECT 10, '小米 14 Ultra 16GB+512GB', 5999.00, 40, '骁龙 8 Gen 3，徕卡光学镜头，一英寸大底主摄。', NOW() - INTERVAL 10 DAY
  UNION ALL SELECT 11, 'ThinkPad X1 Carbon Gen12', 10999.00, 14, '14 英寸 2.8K OLED 屏，Ultra 7 处理器，1.09kg 镁合金机身。', NOW() - INTERVAL 11 DAY
  UNION ALL SELECT 12, '北鼎 K159 养生壶', 899.00, 60, '玻璃壶身，10 档智能程序，预约保温，办公室煮茶好搭档。', NOW() - INTERVAL 12 DAY
) AS seed
WHERE @product_empty = 1;

-- ---------- 订单数据（仅当订单表为空时写入，覆盖四种状态） ----------
INSERT INTO `order`
  (`user_id`, `product_id`, `order_quantity`, `order_price`, `order_address`, `order_status`, `order_create_time`)
SELECT * FROM (
  SELECT @demo_user_id AS user_id, 1 AS product_id, 1 AS order_quantity, 8999.00 AS order_price,
         '上海市浦东新区世纪大道 100 号 8 楼' AS order_address, 0 AS order_status,
         NOW() - INTERVAL 3 HOUR AS order_create_time
  UNION ALL SELECT @demo_user_id, 3, 2, 4998.00, '上海市浦东新区世纪大道 100 号 8 楼', 1, NOW() - INTERVAL 1 DAY
  UNION ALL SELECT @demo_user_id, 7, 3, 384.00, '杭州市西湖区文三路 90 号', 3, NOW() - INTERVAL 6 DAY
  UNION ALL SELECT @demo_user_id, 5, 1, 799.00, '杭州市西湖区文三路 90 号', 4, NOW() - INTERVAL 9 DAY
) AS seed
WHERE @order_empty = 1 AND @demo_user_id IS NOT NULL;
