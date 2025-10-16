# API配置示例

## 📋 快速配置指南

在 `qwen.py` 文件顶部找到配置区域，根据您选择的API提供商进行配置。

---

## 示例1：OpenAI API（推荐）

### 适用场景
- 国际用户
- 追求最佳效果
- 有稳定的国际网络

### 配置代码
```python
# 在 qwen.py 文件中修改以下配置
API_TYPE = "openai"
API_KEY = "sk-proj-xxxxxxxxxxxxxxxxxxxxxx"  # ⚠️ 替换为您的OpenAI API Key
API_BASE_URL = "https://api.openai.com/v1"
MODEL_NAME = "gpt-3.5-turbo"  # 或 "gpt-4" 以获得更好效果

TEMPERATURE = 0.7
MAX_TOKENS = 1000
TIMEOUT = 60
```

### 获取API Key
1. 访问 https://platform.openai.com/
2. 注册/登录账号
3. 进入 API Keys 页面：https://platform.openai.com/api-keys
4. 点击 "Create new secret key"
5. 复制生成的 API Key（以 `sk-` 开头）

### 国内用户建议
如果无法直接访问OpenAI，可以使用国内的OpenAI API中转服务：

```python
API_TYPE = "openai"
API_KEY = "sk-xxxxxxxxxxxxx"  # 中转服务提供的Key
API_BASE_URL = "https://api.example.com/v1"  # 中转服务地址
MODEL_NAME = "gpt-3.5-turbo"
```

推荐的中转服务：
- https://api.chatanywhere.tech (ChatAnywhere)
- https://api.openai-proxy.com (OpenAI Proxy)
- 自建代理服务

---

## 示例2：阿里云通义千问（推荐国内用户）

### 适用场景
- 国内用户
- 需要稳定快速的服务
- 性价比高

### 配置代码
```python
# 在 qwen.py 文件中修改以下配置
API_TYPE = "qwen"
API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxx"  # ⚠️ 替换为您的通义千问API Key
API_BASE_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
MODEL_NAME = "qwen-turbo"  # 可选: qwen-turbo, qwen-plus, qwen-max

TEMPERATURE = 0.7
MAX_TOKENS = 1000
TIMEOUT = 60
```

### 获取API Key
1. 访问阿里云DashScope：https://dashscope.aliyun.com/
2. 注册/登录阿里云账号
3. 开通通义千问服务
4. 进入控制台：https://dashscope.console.aliyun.com/apiKey
5. 创建并复制API Key

### 模型选择
- `qwen-turbo`：最快最便宜，适合大量调用
- `qwen-plus`：平衡性能和价格
- `qwen-max`：最强效果

---

## 示例3：百度文心一言

### 适用场景
- 国内用户
- 有免费额度
- 追求中文理解能力

### 配置代码
```python
# 在 qwen.py 文件中修改以下配置
API_TYPE = "wenxin"
API_KEY = "xxxxxxxxxxxxxxxxxxxxx"  # ⚠️ 替换为您的API Key
SECRET_KEY = "xxxxxxxxxxxxxxxxxxxxx"  # ⚠️ 替换为您的Secret Key
MODEL_NAME = "ERNIE-Bot-turbo"  # 可选: ERNIE-Bot-turbo, ERNIE-Bot

TEMPERATURE = 0.7
MAX_TOKENS = 1000
TIMEOUT = 60
```

### 获取API Key
1. 访问百度智能云：https://cloud.baidu.com/
2. 注册/登录账号
3. 进入文心一言：https://cloud.baidu.com/product/wenxinworkshop
4. 创建应用：https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
5. 获取 API Key 和 Secret Key

### 注意事项
- 文心一言需要两个密钥：API_KEY 和 SECRET_KEY
- 确保在代码中同时配置：
  ```python
  API_KEY = "您的API Key"
  SECRET_KEY = "您的Secret Key"  # 在顶部配置区添加这行
  ```

---

## 示例4：智谱AI (ChatGLM)

### 适用场景
- 国内用户
- 有免费额度
- 开源友好

### 配置代码
```python
# 在 qwen.py 文件中修改以下配置
API_TYPE = "chatglm"
API_KEY = "xxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxx"  # ⚠️ 替换为您的智谱API Key
API_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
MODEL_NAME = "glm-4"  # 可选: glm-4, glm-3-turbo

TEMPERATURE = 0.7
MAX_TOKENS = 1000
TIMEOUT = 60
```

### 获取API Key
1. 访问智谱AI开放平台：https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台：https://open.bigmodel.cn/usercenter/apikeys
4. 创建并复制API Key

### 免费额度
- 新用户赠送免费tokens
- 适合个人学习和小规模使用

---

## 示例5：Anthropic Claude

### 适用场景
- 国际用户
- 追求安全性和准确性
- 需要处理长文本

### 配置代码
```python
# 在 qwen.py 文件中修改以下配置
API_TYPE = "claude"
API_KEY = "sk-ant-xxxxxxxxxxxxxxxxxxxxx"  # ⚠️ 替换为您的Claude API Key
API_BASE_URL = "https://api.anthropic.com/v1/messages"
MODEL_NAME = "claude-3-sonnet-20240229"  # 可选: claude-3-opus, claude-3-sonnet, claude-3-haiku

TEMPERATURE = 0.7
MAX_TOKENS = 1000
TIMEOUT = 60
```

### 获取API Key
1. 访问 Anthropic：https://www.anthropic.com/
2. 申请API访问权限
3. 进入控制台：https://console.anthropic.com/
4. 创建并复制API Key

---

## ⚙️ 参数说明

### API_TYPE
选择使用哪个API提供商，必须与其他配置匹配。

可选值：
- `"openai"` - OpenAI GPT系列
- `"qwen"` - 阿里云通义千问
- `"wenxin"` - 百度文心一言
- `"chatglm"` - 智谱AI
- `"claude"` - Anthropic Claude

### API_KEY
API密钥，从各平台获取。

**⚠️ 安全提示：**
- 不要分享您的API Key
- 不要将包含API Key的代码提交到公开仓库
- 建议使用环境变量存储（高级用法）

### API_BASE_URL
API的基础地址。

- 通常使用默认值即可
- 国内用户使用OpenAI时可能需要改为代理地址

### MODEL_NAME
要使用的具体模型名称。

- 不同模型效果和价格不同
- 建议先用较便宜的模型测试

### TEMPERATURE
控制输出的随机性 (0-1)。

- `0.0` - 完全确定性，输出固定
- `0.7` - 推荐值，平衡创造力和准确性
- `1.0` - 最大随机性，输出多样

### MAX_TOKENS
最大生成token数量。

- 太小可能导致回答不完整
- 太大会增加费用
- 推荐值：`800-1500`

### TIMEOUT
API请求超时时间（秒）。

- 网络较慢时可以增大
- 推荐值：`60`

---

## 🔒 安全最佳实践

### 方法1：使用环境变量（推荐）

创建 `.env` 文件：
```bash
# .env 文件
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

修改 `qwen.py`：
```python
import os
from dotenv import load_dotenv

load_dotenv()

API_TYPE = "openai"
API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_API_KEY_HERE")
API_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
```

安装依赖：
```bash
pip install python-dotenv
```

### 方法2：配置文件

创建 `config.json`：
```json
{
  "api_type": "openai",
  "api_key": "sk-proj-xxxxxxxxxxxxx",
  "api_base_url": "https://api.openai.com/v1",
  "model_name": "gpt-3.5-turbo"
}
```

添加到 `.gitignore`：
```
config.json
.env
```

---

## 🧪 测试配置

配置完成后，启动服务并测试：

```bash
# 1. 启动服务
python qwen.py

# 2. 测试健康检查
curl http://localhost:5000/api/health

# 3. 测试古文解析
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"学而时习之，不亦说乎"}'
```

如果返回正常的解析结果，说明配置成功！

---

## 💡 常见配置错误

### 错误1：API Key格式错误
```python
# ❌ 错误
API_KEY = "YOUR_API_KEY_HERE"  # 忘记替换

# ✅ 正确
API_KEY = "sk-proj-xxxxxxxxxxxxx"
```

### 错误2：API_TYPE与配置不匹配
```python
# ❌ 错误
API_TYPE = "openai"
API_KEY = "通义千问的Key"  # Key类型不匹配

# ✅ 正确
API_TYPE = "qwen"
API_KEY = "通义千问的Key"
```

### 错误3：缺少必要配置
```python
# ❌ 错误 - 使用文心一言时只配置了API_KEY
API_TYPE = "wenxin"
API_KEY = "xxxxx"
# 缺少 SECRET_KEY

# ✅ 正确
API_TYPE = "wenxin"
API_KEY = "xxxxx"
SECRET_KEY = "xxxxx"  # 必须添加这行
```

---

**配置完成后，记得重启服务使配置生效！** 🚀

