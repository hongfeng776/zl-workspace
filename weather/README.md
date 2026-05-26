# 晴景天气 (Qingjing Weather)

基于前后端分离架构的天气应用，包含完整的用户账号系统。

## 技术栈

### 后端
- Node.js + Express + TypeScript
- Prisma ORM + SQLite
- JWT 认证
- bcryptjs 密码加密

### 前端
- React 18 + TypeScript + Vite
- Ant Design 5
- React Router v6
- Axios

## 功能特性

- 手机号验证码注册/登录
- 微信/QQ/微博 第三方账号快捷登录
- 忘记密码 - 短信/邮箱验证重置
- 绑定/解绑多个社交账号
- 个人资料编辑（昵称、头像、生日、性别）
- 点击头像选择"登出"退出登录
- 操作即时生效并同步

## 项目结构

```
weather/
├── server/           # 后端服务
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── client/           # 前端应用
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 快速开始

### 后端

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

后端服务运行在 http://localhost:3000

### 前端

```bash
cd client
npm install
npm run dev
```

前端应用运行在 http://localhost:5173

## API 接口

### 认证接口
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/register` - 手机号注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/request-reset` - 请求密码重置
- `POST /api/auth/reset-password` - 重置密码

### 用户接口
- `GET /api/user/profile` - 获取个人资料
- `PUT /api/user/profile` - 更新个人资料

### 社交账号接口
- `GET /api/social/:provider/url` - 获取第三方登录URL
- `GET /api/social/:provider/callback` - 第三方登录回调
- `GET /api/social/accounts` - 获取已绑定的社交账号
- `POST /api/social/:provider/bind` - 绑定社交账号
- `DELETE /api/social/:provider/unbind` - 解绑社交账号

## 配置

在 `server/.env` 中配置：

- `JWT_SECRET` - JWT密钥
- 短信服务配置
- 邮件服务配置
- 微信/QQ/微博 OAuth配置
