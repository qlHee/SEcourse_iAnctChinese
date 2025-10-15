# iAnctChinese Express 后端服务

## 功能说明

本服务是 iAnctChinese 的统一后端，提供以下功能：

1. **静态文件服务** - 托管前端页面
2. **自动分词** - 使用 nodejieba 实现中文分词
3. **古文解析** - 转发请求到 Python Qwen 大模型服务

## 安装依赖

### 使用 npm
```bash
cd server
npm install
```

### 使用 yarn
```bash
cd server
yarn install
```

## 启动服务

### 开发模式（自动重启）
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

## 完整启动流程

### 1. 启动 Qwen 大模型服务（必需）
```bash
# 打开第一个终端
cd qwen-project-main/qwen-project-main
pip install -r requirements.txt
python qwen.py
```

### 2. 启动 Express 服务器
```bash
# 打开第二个终端
cd server
npm install
npm start
```

### 3. 访问前端
打开浏览器访问: `http://localhost:3000`

## API 接口

### 1. 古文解析
- **URL**: `POST /api/analyze`
- **请求体**:
  ```json
  {
    "text": "学而时习之，不亦说乎"
  }
  ```
- **响应**:
  ```json
  {
    "result": "解析结果..."
  }
  ```

### 2. 自动分词
- **URL**: `POST /api/segment`
- **请求体**:
  ```json
  {
    "text": "学而时习之，不亦说乎"
  }
  ```
- **响应**:
  ```json
  {
    "tokens": [
      {"text": "学", "start": 0, "end": 1},
      {"text": "而", "start": 1, "end": 2}
    ]
  }
  ```

### 3. 健康检查
- **URL**: `GET /api/health`
- **响应**:
  ```json
  {
    "status": "ok",
    "service": "iAnctChinese Server"
  }
  ```

## 环境变量配置

创建 `.env` 文件（可选）：

```env
PORT=3000
QWEN_SERVICE=http://localhost:5000
```

## 注意事项

1. **分词功能** 已内置在 Express 中，无需额外的 Python 分词服务
2. **古文解析功能** 需要先启动 `qwen.py` 服务
3. 前端代码会自动使用 Express 服务器的 API
4. 如果修改端口，需要同步修改前端配置

## 故障排查

### 问题：古文解析失败
- 确认 qwen.py 是否正在运行
- 检查端口 5000 是否被占用
- 查看 qwen.py 的日志输出

### 问题：分词失败
- 检查 nodejieba 是否正确安装
- Windows 用户可能需要安装 Visual Studio Build Tools

### 问题：前端无法访问
- 确认 Express 服务器已启动
- 检查端口 3000 是否被占用
- 查看浏览器控制台错误信息

