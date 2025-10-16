# iAnctChinese-Client 项目 - API版本

## 项目概述

这是一个古汉语文档管理和分析系统，包含以下核心功能：

1. **文档管理系统** (`iAnctChinese-Client-main/`)
   - 项目和文档管理
   - 文档编辑器
   - 实体标注
   - 古文解析（AI功能）
   - 自动分词

2. **古文解析服务** (`qwen-project-main/`)
   - AI古文解析后端服务
   - **已更新为 API 调用方式**

## 重要更新

### ✨ AI功能改造

原项目使用本地部署的 Qwen3-0.6B 模型，现已改为调用大模型 API：

- ✅ 支持**阿里通义千问 (Qwen)** API
- ✅ 支持 **DeepSeek** API
- ✅ 无需 GPU，普通电脑即可运行
- ✅ 启动速度快，响应效率高
- ✅ 使用更强大的模型，解析质量更高

### 📝 改动说明

1. **修改的文件**：
   - `qwen-project-main/qwen.py` - 改为 API 调用方式
   - `qwen-project-main/requirements.txt` - 精简依赖
   - `qwen-project-main/项目说明文档.md` - 更新说明
   
2. **新增的文件**：
   - `qwen-project-main/config.example.json` - API 配置示例
   - `qwen-project-main/API配置指南.md` - 详细配置说明
   - `qwen-project-main/test_api.py` - API 测试脚本

3. **未修改的功能**：
   - ✅ 前端界面完全不变
   - ✅ 文档管理功能不变
   - ✅ 分词功能不变（仍使用 jieba）
   - ✅ API 接口定义不变
   - ✅ 解析结果格式不变

## 快速开始

### 第一步：安装依赖

```bash
# 古文解析服务依赖
cd qwen-project-main/qwen-project-main
pip install -r requirements.txt

# 分词服务依赖
cd ../../iAnctChinese-Client-main
pip install flask flask-cors jieba
```

### 第二步：配置 API Key ⚠️ **重要**

**这是必须的步骤！**

1. 进入 qwen 项目目录：
   ```bash
   cd qwen-project-main/qwen-project-main
   ```

2. 复制配置文件：
   ```bash
   cp config.example.json config.json
   ```

3. 获取 API Key（二选一）：

   **选项A - 阿里通义千问（推荐）**：
   - 访问 https://dashscope.console.aliyun.com/
   - 注册并开通 DashScope 服务
   - 创建 API Key

   **选项B - DeepSeek**：
   - 访问 https://platform.deepseek.com/
   - 注册账号并创建 API Key

4. 编辑 `config.json`，填入您的 API Key：

   ```json
   {
     "api_provider": "qwen",
     "api_config": {
       "qwen": {
         "api_key": "【在这里填入您的通义千问 API Key】",
         "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
         "model": "qwen-turbo"
       },
       "deepseek": {
         "api_key": "【在这里填入您的 DeepSeek API Key】",
         "base_url": "https://api.deepseek.com",
         "model": "deepseek-chat"
       }
     }
   }
   ```

   **重要提示**：
   - 如果使用通义千问，在 `"qwen"` -> `"api_key"` 处填入
   - 如果使用 DeepSeek，在 `"deepseek"` -> `"api_key"` 处填入
   - 通过修改 `"api_provider"` 字段选择使用哪个 API

### 第三步：启动服务

需要启动两个后端服务：

**终端 1 - 古文解析服务（端口 5000）**：
```bash
cd qwen-project-main/qwen-project-main
python qwen.py
```

看到以下输出表示成功：
```
============================================================
古文解析 API 服务启动中...
API 提供商: qwen
使用模型: qwen-turbo
服务地址: http://0.0.0.0:5000
============================================================
```

**终端 2 - 分词服务（端口 5001）**：
```bash
cd iAnctChinese-Client-main
python seg_server.py
```

### 第四步：打开前端页面

用浏览器打开：
```
iAnctChinese-Client-main/index.html
```

或使用本地服务器（推荐）：
```bash
cd iAnctChinese-Client-main
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 功能验证

### 测试 API 服务

运行测试脚本：
```bash
cd qwen-project-main/qwen-project-main
python test_api.py
```

或手动测试：
```bash
# 健康检查
curl http://localhost:5000/health

# 测试古文解析
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "学而时习之，不亦说乎"}'
```

### 测试前端功能

1. 登录系统（或注册新用户）
2. 创建项目
3. 创建文档
4. 在"古文解析"标签页输入古文
5. 点击"解析"按钮
6. 查看解析结果

## 项目结构

```
iAnctChinese-Client-main 3_B/
├── iAnctChinese-Client-main/     # 前端和文档管理系统
│   ├── index.html                # 主页面
│   ├── login.html                # 登录页面
│   ├── js/                       # JavaScript 文件
│   │   ├── app.js               # 主应用逻辑
│   │   ├── ui-manager.js        # UI 管理（包含 AI 调用）
│   │   ├── data-manager.js      # 数据管理
│   │   └── ...
│   ├── styles/                   # CSS 样式
│   ├── seg_server.py            # 分词服务（未修改）
│   └── server/                   # 用户服务器（未修改）
│
└── qwen-project-main/            # AI 古文解析服务
    └── qwen-project-main/
        ├── qwen.py               # 【已修改】API 调用实现
        ├── requirements.txt      # 【已修改】精简依赖
        ├── config.example.json   # 【新增】配置示例
        ├── config.json           # 【需创建】实际配置
        ├── API配置指南.md       # 【新增】配置说明
        ├── test_api.py          # 【新增】测试脚本
        ├── 项目说明文档.md      # 【已更新】
        └── web/                  # 独立测试页面（未修改）
```

## API Key 配置位置标注

需要填入 API Key 的位置：

### 文件：`qwen-project-main/qwen-project-main/config.json`

```json
{
  "api_provider": "qwen",  // 或 "deepseek"
  "api_config": {
    "qwen": {
      "api_key": "👉 在这里填入阿里通义千问的 API Key 👈",
      "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "model": "qwen-turbo"
    },
    "deepseek": {
      "api_key": "👉 在这里填入 DeepSeek 的 API Key 👈",
      "base_url": "https://api.deepseek.com",
      "model": "deepseek-chat"
    }
  }
}
```

**如何获取 API Key**：

1. **阿里通义千问**：https://dashscope.console.aliyun.com/
2. **DeepSeek**：https://platform.deepseek.com/

## 常见问题

### Q1: 启动时提示"配置文件不存在"

```bash
cd qwen-project-main/qwen-project-main
cp config.example.json config.json
# 然后编辑 config.json 填入 API Key
```

### Q2: API 调用失败

检查项：
- ✓ API Key 是否正确填写
- ✓ 网络连接是否正常
- ✓ 账户余额是否充足
- ✓ 选择的 `api_provider` 与填写的 API Key 是否对应

### Q3: 前端无法连接后端

确认：
- ✓ 两个后端服务都已启动
- ✓ 端口 5000 和 5001 没有被占用
- ✓ 浏览器控制台没有跨域错误

### Q4: 需要切换 API 提供商

编辑 `config.json`，修改 `api_provider` 字段：
- 使用通义千问：`"api_provider": "qwen"`
- 使用 DeepSeek：`"api_provider": "deepseek"`

## 费用说明

⚠️ **调用大模型 API 会产生费用**

- **阿里通义千问**：查看定价 https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-metering-and-billing
- **DeepSeek**：查看定价 https://platform.deepseek.com/api-docs/pricing/

建议：
1. 在测试阶段控制调用次数
2. 设置费用预警和上限
3. 定期检查账户余额

## 与原版本对比

| 特性 | 原版本（本地模型） | 新版本（API调用） |
|------|------------------|------------------|
| 硬件要求 | 需要 GPU (≥2GB) | 无特殊要求 |
| 模型下载 | 需要（几GB） | 不需要 |
| 启动速度 | 慢（加载模型） | 快（即开即用） |
| 模型性能 | 0.6B 参数 | 更强大的模型 |
| 使用成本 | 硬件成本 | API 费用 |
| 网络要求 | 不需要 | 需要 |
| 维护难度 | 较高 | 简单 |

## 文档索引

- 📖 [API配置指南.md](qwen-project-main/qwen-project-main/API配置指南.md) - 详细的配置说明
- 📖 [项目说明文档.md](qwen-project-main/qwen-project-main/项目说明文档.md) - 项目使用说明
- 📖 [iAnctChinese README](iAnctChinese-Client-main/README.md) - 文档管理系统说明

## 技术支持

- 阿里云 DashScope 文档：https://help.aliyun.com/zh/dashscope/
- DeepSeek API 文档：https://platform.deepseek.com/api-docs/
- 项目问题：请查看各文档的"故障排查"部分

## 许可证

与原项目保持一致的许可证。

