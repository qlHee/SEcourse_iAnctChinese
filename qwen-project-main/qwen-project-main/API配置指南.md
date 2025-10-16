# API 配置指南

本项目已改为调用大模型 API，支持 **阿里通义千问 (Qwen)** 和 **DeepSeek** 两种 API。

## 快速开始

### 1. 复制配置文件

```bash
cp config.example.json config.json
```

### 2. 获取 API Key

#### 使用阿里通义千问 (Qwen)

1. 访问阿里云 DashScope 控制台：https://dashscope.console.aliyun.com/
2. 注册/登录阿里云账号
3. 开通 DashScope 服务
4. 在「API-KEY管理」页面创建并复制 API Key

#### 使用 DeepSeek

1. 访问 DeepSeek 平台：https://platform.deepseek.com/
2. 注册/登录账号
3. 在控制台创建并复制 API Key

### 3. 配置 API Key

打开 `config.json` 文件，根据您选择的 API 提供商填入相应的 API Key：

```json
{
  "api_provider": "qwen",
  "api_config": {
    "qwen": {
      "api_key": "在这里填入您的通义千问 API Key",
      "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "model": "qwen-turbo"
    },
    "deepseek": {
      "api_key": "在这里填入您的 DeepSeek API Key",
      "base_url": "https://api.deepseek.com",
      "model": "deepseek-chat"
    }
  },
  "generation_params": {
    "max_tokens": 800,
    "temperature": 0.75,
    "top_p": 0.9
  }
}
```

### 4. 选择 API 提供商

在 `config.json` 中修改 `api_provider` 字段：
- 使用通义千问：`"api_provider": "qwen"`
- 使用 DeepSeek：`"api_provider": "deepseek"`

### 5. 安装依赖

```bash
pip install -r requirements.txt
```

### 6. 启动服务

```bash
python qwen.py
```

服务将在 `http://localhost:5000` 启动。

## 配置说明

### API 提供商配置

| 字段 | 说明 |
|------|------|
| `api_key` | **必填**，您的 API 密钥 |
| `base_url` | API 基础地址，通常不需要修改 |
| `model` | 使用的模型名称，可根据需要修改 |

### 通义千问可用模型

| 模型名称 | 说明 | 特点 |
|---------|------|------|
| `qwen-turbo` | 通义千问超大规模语言模型 | 平衡性能和成本 |
| `qwen-plus` | 通义千问增强版 | 更强的理解和生成能力 |
| `qwen-max` | 通义千问旗舰版 | 最强性能 |

更多模型请参考：https://help.aliyun.com/zh/dashscope/developer-reference/model-list

### DeepSeek 可用模型

| 模型名称 | 说明 |
|---------|------|
| `deepseek-chat` | DeepSeek 对话模型 |

### 生成参数配置

| 参数 | 说明 | 默认值 | 范围 |
|------|------|--------|------|
| `max_tokens` | 生成的最大 token 数 | 800 | 1-4096 |
| `temperature` | 温度参数，控制随机性 | 0.75 | 0-2 |
| `top_p` | 核采样参数 | 0.9 | 0-1 |

- **temperature**：值越高输出越随机，值越低输出越确定
- **top_p**：控制采样范围，值越小输出越集中

## 注意事项

1. **API Key 安全**：
   - ⚠️ 不要将包含真实 API Key 的 `config.json` 提交到版本控制系统
   - 项目已在 `.gitignore` 中排除 `config.json`

2. **费用说明**：
   - 调用 API 会产生费用，请查看各平台的定价策略
   - 通义千问：https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-metering-and-billing
   - DeepSeek：https://platform.deepseek.com/api-docs/pricing/

3. **网络要求**：
   - 需要能够访问相应的 API 服务
   - 如遇网络问题，请检查防火墙和代理设置

4. **错误处理**：
   - 如果启动时提示配置文件不存在，请确保已复制 `config.example.json` 为 `config.json`
   - 如果 API 调用失败，请检查 API Key 是否正确，账户余额是否充足

## 从本地模型迁移

原项目使用本地部署的 Qwen3-0.6B 模型，现已改为 API 调用方式：

### 优势对比

| 特性 | 本地模型 | API 调用 |
|------|---------|---------|
| 硬件要求 | 需要 GPU (≥2GB 显存) | 无特殊要求 |
| 启动速度 | 慢 (需加载模型) | 快 (即开即用) |
| 响应速度 | 取决于硬件 | 通常较快 |
| 模型质量 | 受限于本地模型 | 可使用更强大的模型 |
| 成本 | 硬件成本 | API 调用费用 |
| 维护成本 | 需管理模型文件和依赖 | 简单 |

### 功能保持不变

- ✅ 古文解析功能完全保持不变
- ✅ API 接口定义不变 (`/api/analyze`)
- ✅ 前端代码无需修改
- ✅ 返回数据格式一致

## 测试 API

启动服务后，可以使用 curl 测试：

```bash
# 健康检查
curl http://localhost:5000/health

# 测试古文解析
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "学而时习之，不亦说乎"}'
```

## 故障排查

### 问题 1：配置文件不存在

```
FileNotFoundError: 配置文件不存在: config.json
```

**解决方案**：运行 `cp config.example.json config.json`

### 问题 2：API Key 无效

```
API 调用失败: Invalid API Key
```

**解决方案**：
1. 检查 `config.json` 中的 `api_key` 是否正确
2. 确认 API Key 未过期
3. 确认账户余额充足

### 问题 3：网络连接失败

```
API 调用失败: Connection timeout
```

**解决方案**：
1. 检查网络连接
2. 确认可以访问 API 服务地址
3. 检查防火墙和代理设置

## 技术支持

如有问题，请参考：
- 阿里云 DashScope 文档：https://help.aliyun.com/zh/dashscope/
- DeepSeek API 文档：https://platform.deepseek.com/api-docs/

