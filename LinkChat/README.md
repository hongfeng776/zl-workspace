# 乐聊 (LeChat)

一个前后端分离的聊天应用，支持完整的用户认证系统。

## 功能特性

### 账号系统
- ✅ 手机号注册
- ✅ 验证码验证
- ✅ 设置登录密码
- ✅ 密码登录
- ✅ 验证码登录
- ✅ 第三方登录（微信 / QQ 模拟）
- ✅ 忘记密码找回
- ✅ 账号注销
- ✅ 安全验证（安全问题）
- ✅ 修改密码
- ✅ 个人资料管理

## 技术栈

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- bcryptjs 密码加密
- express-validator 参数校验

### 前端
- React 18
- Vite
- React Router
- Zustand 状态管理
- Axios HTTP 客户端

## 项目结构

```
LinkChat/
├── server/                 # 后端服务
│   ├── config/            # 配置文件
│   │   └── db.js         # 数据库连接
│   ├── middleware/        # 中间件
│   │   └── auth.js       # JWT 认证中间件
│   ├── models/            # 数据模型
│   │   ├── User.js       # 用户模型
│   │   └── VerificationCode.js  # 验证码模型
│   ├── routes/            # 路由
│   │   ├── auth.js       # 认证路由
│   │   └── user.js       # 用户路由
│   ├── .env              # 环境变量
│   ├── app.js            # 应用入口
│   └── package.json
├── client/                # 前端应用
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   │   └── Toast.jsx
│   │   ├── pages/         # 页面组件
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── SecurityVerify.jsx
│   │   │   └── DeleteAccount.jsx
│   │   ├── store/         # 状态管理
│   │   │   └── authStore.js
│   │   ├── styles/        # 样式文件
│   │   │   └── global.css
│   │   ├── utils/         # 工具函数
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json
└── README.md
```

## 快速开始

### 前置要求
- Node.js >= 16.0.0
- MongoDB >= 4.0

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有依赖（后端 + 前端）
npm run install:all
```

或者分别安装：

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 配置环境变量

编辑 `server/.env` 文件：

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lechat
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
SMS_API_KEY=your-sms-api-key
NODE_ENV=development
```

### 启动服务

#### 方式一：分别启动

```bash
# 启动后端服务（端口 3001）
cd server
npm run dev

# 启动前端服务（端口 3000）
cd ../client
npm run dev
```

#### 方式二：使用根目录命令

```bash
# 启动后端
npm run dev:server

# 启动前端
npm run dev:client
```

### 访问应用

- 前端地址：http://localhost:3000
- 后端地址：http://localhost:3001

## API 接口文档

### 认证接口

#### 发送验证码
```
POST /api/auth/send-code
Content-Type: application/json

{
  "phone": "13800138000",
  "type": "register"  // register | login | reset_password | delete_account | security
}
```

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456",
  "password": "123456"
}
```

#### 密码登录
```
POST /api/auth/login
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456"
}
```

#### 验证码登录
```
POST /api/auth/login-code
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}
```

#### 重置密码
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456",
  "password": "654321"
}
```

#### 第三方登录
```
POST /api/auth/third-party
Content-Type: application/json

{
  "platform": "wechat",  // wechat | qq
  "openId": "openid_xxx",
  "nickname": "微信用户",
  "avatar": ""
}
```

#### 获取用户信息
```
GET /api/auth/user-info
Authorization: Bearer <token>
```

### 用户接口

#### 修改密码
```
POST /api/user/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

#### 更新个人资料
```
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "新昵称",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 设置安全问题
```
POST /api/user/security-verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "questions": [
    { "question": "问题1", "answer": "答案1" },
    { "question": "问题2", "answer": "答案2" },
    { "question": "问题3", "answer": "答案3" }
  ]
}
```

#### 验证安全问题
```
POST /api/user/security-check
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": {
    "0": "答案1",
    "1": "答案2",
    "2": "答案3"
  }
}
```

#### 获取安全问题
```
GET /api/user/security-questions
Authorization: Bearer <token>
```

#### 注销账号
```
POST /api/user/delete-account
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}
```

## 开发说明

### 验证码
- 开发环境下，验证码会在控制台打印，方便测试
- 生产环境需要配置真实的短信服务

### 第三方登录
- 当前为模拟实现，直接生成 mock openId
- 生产环境需要对接真实的微信/QQ开放平台 API

### 数据库
- 默认使用本地 MongoDB，数据库名 `lechat`
- 可通过修改 `.env` 中的 `MONGODB_URI` 配置远程数据库

## License

MIT
