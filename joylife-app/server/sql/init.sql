-- 乐活生活数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS joylife DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE joylife;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL COMMENT '昵称',
  phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  avatar VARCHAR(500) COMMENT '头像URL',
  wechat_open_id VARCHAR(100) UNIQUE COMMENT '微信OpenID',
  alipay_user_id VARCHAR(100) UNIQUE COMMENT '支付宝用户ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) COMMENT '手机号',
  email VARCHAR(100) COMMENT '邮箱',
  code VARCHAR(6) NOT NULL COMMENT '验证码',
  type ENUM('register', 'login', 'reset_password') NOT NULL COMMENT '类型',
  expires_at DATETIME NOT NULL COMMENT '过期时间',
  used BOOLEAN DEFAULT FALSE COMMENT '是否已使用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone_code_type (phone, code, type),
  INDEX idx_email_code_type (email, code, type),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码表';

-- 测试数据（可选）
-- INSERT INTO users (nickname, phone, email, password) VALUES
-- ('测试用户', '13800138000', 'test@example.com', SHA2('123456', 256));
