# 乐活生活

前后端分离的用户认证系统，支持手机号注册登录、第三方登录等功能。

## 项目结构

```
joylife-app/
├── server/                 # 后端服务 (Express + TypeScript + MySQL)
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # 类型定义
│   │   └── app.ts         # 入口文件
│   ├── sql/               # 数据库脚本
│   └── package.json
├── client/                # 前端应用 (React + TypeScript + Vite)
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── store/         # 状态管理
│   │   ├── App.tsx        # 应用入口
│   │   └── main.tsx       # 渲染入口
│   └── package.json
└── package.json
```

## 功能特性

- 手机号接收验证码完成注册
- 账号密码登录 / 验证码快速登录
- 手机号/邮箱找回重置密码
- 微信/支付宝第三方账号一键登录
- 登录状态自动保存（可手动退出）
- 注册时需填写基础昵称与手机号验证

## 技术栈

### 后端
- Node.js + Express
- TypeScript
- MySQL + Sequelize ORM
- JWT 认证

### 前端
- React 18 + TypeScript
- Vite
- Ant Design
- React Router

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

或分别安装：

```bash
cd server && npm install
cd ../client && npm install
```

### 2. 初始化数据库

```bash
# 创建数据库并导入表结构
mysql -u root -p < server/sql/init.sql
```

### 3. 配置环境变量

修改 `server/.env` 文件，配置数据库连接、短信、邮箱等信息。

### 4. 启动服务

**启动后端服务：**
```bash
cd server && npm run dev
```

**启动前端开发服务器：**
```bash
cd client && npm run dev
```

### 5. 访问应用

- 前端地址: http://localhost:5173
- 后端API: http://localhost:3001

## API 接口

### 认证相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/send-code | 发送验证码 |
| POST | /api/auth/reset-password | 重置密码 |
| POST | /api/auth/third-party-login | 第三方登录 |
| POST | /api/auth/bind-third-party | 绑定第三方账号 |
| GET | /api/auth/profile | 获取用户信息 |
| POST | /api/auth/logout | 退出登录 |

## 默认配置

- 后端端口: 3001
- 前端端口: 5173
- 数据库: MySQL (默认 localhost:3306)

## 注意事项

1. 短信和邮件服务默认使用模拟模式，实际部署需配置真实的服务商
2. 第三方登录（微信/支付宝）默认使用模拟模式，实际使用需配置对应的 AppID 和密钥
3. 生产环境请修改 `.env` 中的 JWT_SECRET

## License

MIT
