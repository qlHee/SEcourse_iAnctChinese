# 用户管理服务器 - Express 版本

## 🎯 功能说明

这是一个基于 Express (Node.js) 的用户管理后端，完全替代 Python 版本的 `user_server.py`。

**功能：**
- ✅ 用户注册
- ✅ 用户登录
- ✅ 信息更新
- ✅ 自动保存到 `data/data.json`

## 🚀 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 启动服务

**生产模式：**
```bash
npm start
```

**开发模式（自动重启）：**
```bash
npm run dev
```

服务将在 **端口 5002** 启动。

## 📋 API 接口

### 1. 健康检查
```
GET /api/health
```

### 2. 用户登录
```
POST /api/login
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码"
}
```

### 3. 用户注册
```
POST /api/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}
```

### 4. 更新用户信息
```
PATCH /api/users/:userId
Content-Type: application/json

{
  "email": "新邮箱",
  "password": "新密码"  // 可选
}
```

### 5. 获取所有用户
```
GET /api/users
```

## 💡 与 Python 版本对比

| 特性 | Express 版本 | Python 版本 |
|------|-------------|------------|
| 语言 | JavaScript | Python |
| 依赖 | Node.js | Python + Flask |
| 安装 | `npm install` | `pip install` |
| 启动 | `npm start` | `python user_server.py` |
| 端口 | 5002 | 5002 |
| 功能 | ✅ 完全相同 | ✅ 完全相同 |

**优势：**
- 🚀 更快的启动速度
- 📦 更简单的依赖管理
- 🔄 自动重启（开发模式）
- 💻 与前端同一技术栈

## 🔧 配置

### 修改端口

编辑 `user-server.js`：
```javascript
const PORT = process.env.PORT || 你的端口;
```

或使用环境变量：
```bash
PORT=8080 npm start
```

### 修改数据文件路径

编辑 `user-server.js`：
```javascript
const DATA_FILE = path.join(__dirname, '你的路径', 'data.json');
```

## ✅ 测试

### 启动服务后测试注册
```bash
curl -X POST http://localhost:5002/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@qq.com","password":"123456"}'
```

### 测试登录
```bash
curl -X POST http://localhost:5002/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

## 🐛 常见问题

### Q: npm install 失败？
**A**: 切换到国内镜像
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Q: 端口被占用？
**A**: 修改端口或关闭占用进程
```bash
# Windows
netstat -ano | findstr :5002

# Mac/Linux
lsof -i :5002
```

### Q: 前端无法连接？
**A**: 检查 CORS 是否正常，确保服务已启动

## 📝 注意事项

1. **数据文件位置**：确保 `data/data.json` 存在且可写
2. **端口占用**：默认 5002，与 Python 版本相同
3. **前端配置**：无需修改，前端会自动连接 5002 端口
4. **生产部署**：建议使用 PM2 管理进程

## 🎯 与前端集成

前端 `js/auth.js` 已配置好，无需修改：

```javascript
this.apiBase = window.USER_API_BASE || 'http://localhost:5002';
```

## 📦 生产部署

### 使用 PM2
```bash
npm install -g pm2
pm2 start user-server.js --name user-service
pm2 save
pm2 startup
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5002
CMD ["npm", "start"]
```

---

**现在你可以用 Express 代替 Python 来管理用户了！** 🎉

