# iAnctChinese 古汉语智能标注平台

## 📢 重要更新

✨ **AI功能已升级！** 从本地模型部署改为调用大模型API，无需GPU，使用更便捷。

---

## 🎯 项目简介

这是一个功能完整的**古汉语智能标注和分析平台**，包含：

### 核心功能
- ✅ 用户系统（注册/登录/数据隔离）
- ✅ 项目管理（创建/编辑/删除）
- ✅ 文档管理（创建/编辑/删除/导入）
- ✅ 实体标注（人物、地名、时间、器物等）
- ✅ 自动分词（基于jieba）
- ✅ **古文智能解析（基于大模型API）** 🆕
- ✅ 云端数据同步

### 技术架构
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **后端**: Node.js (Express) + Python (Flask)
- **AI**: 支持OpenAI、通义千问、文心一言等多种大模型API

---

## 🚀 快速开始

### 前置要求
- Node.js 14+
- Python 3.8+
- 网络连接

### 1️⃣ 启动必需服务

```bash
# 用户管理服务（端口5002）
cd "iAnctChinese-Client-main/server"
npm install && npm start

# 分词服务（端口5001）
cd "../"
pip install flask flask-cors jieba
python seg_server.py

# 打开前端页面
# 双击 iAnctChinese-Client-main/index.html
# 或运行：python -m http.server 8000
```

### 2️⃣ 启动AI服务（可选）

```bash
# 进入AI服务目录
cd "qwen-project-main/qwen-project-main"

# 安装依赖
pip install -r requirements.txt

# ⚠️ 重要：配置API密钥
# 编辑 qwen.py，在顶部配置区域填写：
#   API_TYPE = "openai"  # 或其他API类型
#   API_KEY = "your_api_key_here"  # ⚠️ 填写您的API密钥

# 测试配置（推荐）
python test_api.py

# 启动服务（端口5000）
python qwen.py
```

**详细配置教程**: [API配置示例.md](qwen-project-main/qwen-project-main/API配置示例.md)

---

## 📚 文档导航

### 必读文档
- **[快速启动指南.md](快速启动指南.md)** - 5分钟快速上手
- **[项目修改说明.md](项目修改说明.md)** - 了解本次修改内容

### AI服务配置（使用古文解析功能必读）
- **[API配置示例.md](qwen-project-main/qwen-project-main/API配置示例.md)** - 详细的API配置教程
- **[更新说明.md](qwen-project-main/qwen-project-main/更新说明.md)** - AI服务的更新说明
- **[项目说明文档.md](qwen-project-main/qwen-project-main/项目说明文档.md)** - 完整的使用指南

### 其他文档
- **[云端同步使用指南.md](iAnctChinese-Client-main/云端同步使用指南.md)** - 数据同步说明
- **[用户数据隔离说明.md](iAnctChinese-Client-main/用户数据隔离说明.md)** - 数据安全说明

---

## 🔑 API密钥配置（重要）

### 获取API密钥

#### 推荐方案1：阿里云通义千问（国内用户）

1. 访问 https://dashscope.aliyun.com/
2. 注册并登录
3. 开通通义千问服务
4. 获取API Key

**配置代码** (在 `qwen.py` 中)：
```python
API_TYPE = "qwen"
API_KEY = "sk-xxxxxxxxxxxxx"  # ⚠️ 填写您的API Key
MODEL_NAME = "qwen-turbo"
```

#### 推荐方案2：OpenAI API（国际用户）

1. 访问 https://platform.openai.com/
2. 注册并获取API Key

**配置代码**：
```python
API_TYPE = "openai"
API_KEY = "sk-proj-xxxxxxxxxxxxx"  # ⚠️ 填写您的API Key
MODEL_NAME = "gpt-3.5-turbo"
```

#### 其他选择
- **百度文心一言**: https://cloud.baidu.com/product/wenxinworkshop
- **智谱AI**: https://open.bigmodel.cn/
- **Claude**: https://www.anthropic.com/

**完整配置教程**: [API配置示例.md](qwen-project-main/qwen-project-main/API配置示例.md)

---

## 🧪 测试配置

配置完API密钥后，运行测试脚本验证：

```bash
cd qwen-project-main/qwen-project-main
python test_api.py
```

如果看到 `✅ API调用成功！` 说明配置正确。

---

## 📊 服务端口

| 服务 | 端口 | 必需 | 说明 |
|------|------|------|------|
| 前端页面 | 8000 | 可选 | 也可直接打开HTML |
| AI解析 | 5000 | 可选 | 需配置API Key |
| 分词服务 | 5001 | ✅ | jieba分词 |
| 用户服务 | 5002 | ✅ | 用户和数据管理 |

---

## 💡 功能说明

### 基础功能（无需AI服务）
启动用户服务(5002)和分词服务(5001)后即可使用：

- ✅ 用户注册/登录
- ✅ 项目管理
- ✅ 文档管理
- ✅ 实体标注
- ✅ 自动分词
- ✅ 数据云端同步

### AI功能（需启动AI服务）
额外启动AI服务(5000)后可使用：

- ✅ 古文智能解析
  - 字面意思解读
  - 哲学思想分析
  - 现实意义阐释

---

## 🆕 本次修改内容

### 核心改动
将AI功能从**本地模型部署**改为**调用大模型API**

### 优势对比

| 特性 | 旧版本（本地） | 新版本（API） |
|------|-------------|--------------|
| GPU需求 | 需要RTX 4060+ | ❌ 无需 |
| 模型下载 | 1-2GB | ❌ 无需 |
| 启动时间 | 1-3分钟 | ✅ 1秒 |
| 响应速度 | 几分钟 | ✅ 3-10秒 |
| 硬件成本 | ¥3000+ | ✅ ¥0 |
| 使用成本 | 电费 | 按次计费 |
| 模型效果 | Qwen3-0.6B | ✅ GPT级别 |

### 修改的文件
- `qwen.py` - 改为API调用方式
- `requirements.txt` - 简化依赖
- 相关文档更新

### 未修改的部分
- ✅ 前端代码（完全不变）
- ✅ 用户服务
- ✅ 分词服务
- ✅ 其他所有功能

**详细说明**: [项目修改说明.md](项目修改说明.md)

---

## 💰 使用成本

### API调用费用（参考）

| API提供商 | 费用 | 每次解析成本 |
|----------|------|------------|
| OpenAI GPT-3.5 | $0.002/1K tokens | 约¥0.01-0.03 |
| 通义千问 Turbo | ¥0.008/1K tokens | 约¥0.01 |
| 文心一言 | 有免费额度 | 新用户免费 |
| 智谱AI | 有免费额度 | 新用户免费 |

**月度成本估算**（每天使用10次）：
- GPT-3.5: 约¥3-10/月
- 通义千问: 约¥3/月
- 文心一言/智谱AI: 免费额度内可能¥0

---

## 🛠️ 故障排除

### 问题1：API调用失败

**症状**: 点击"解析当前内容"无响应或报错

**解决方案**:
1. 检查API密钥是否正确配置
2. 运行 `python test_api.py` 测试
3. 检查网络连接
4. 查看API账户余额

### 问题2：端口被占用

**症状**: 启动服务时报错 `EADDRINUSE`

**解决方案**:
```bash
# Mac/Linux
lsof -i :5002  # 查看占用进程
kill -9 <PID>  # 终止进程

# Windows
netstat -ano | findstr :5002
taskkill /PID <PID> /F
```

### 问题3：依赖安装失败

**解决方案**:
```bash
# npm安装失败 - 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install

# pip安装失败 - 使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

**更多问题**: 查看 [快速启动指南.md](快速启动指南.md) 的故障排除章节

---

## 🔒 安全提示

⚠️ **API密钥安全**:
- ❌ 不要将API密钥上传到公开仓库
- ❌ 不要分享您的API密钥
- ✅ 建议使用环境变量存储
- ✅ 添加包含密钥的文件到 `.gitignore`

---

## 🎯 项目结构

```
├── iAnctChinese-Client-main/        # 主应用
│   ├── index.html                   # 前端页面
│   ├── js/                          # 前端脚本
│   ├── styles/                      # 样式文件
│   ├── server/                      # 用户管理服务(5002)
│   │   └── user-server.js
│   ├── seg_server.py                # 分词服务(5001)
│   └── data/                        # 数据存储
│
├── qwen-project-main/               # AI服务
│   └── qwen-project-main/
│       ├── qwen.py                  # AI服务(5000) ⚠️ 需配置API Key
│       ├── test_api.py              # 配置测试脚本
│       ├── requirements.txt         # 依赖
│       ├── API配置示例.md           # 配置教程 ⭐
│       └── 项目说明文档.md
│
├── 快速启动指南.md                  # ⭐ 必读
├── 项目修改说明.md                  # 修改详情
└── README.md                        # 本文件
```

---

## 🌟 使用示例

1. **注册/登录**
2. **创建项目**: "古文研究"
3. **创建文档**: 输入 "学而时习之，不亦说乎"
4. **实体标注**: 选中文字，标注为"概念"
5. **自动分词**: 切换到"自动分词"，点击分词按钮
6. **AI解析**: 切换到"古文解析"，点击解析按钮 ⭐

---

## 📞 获取帮助

- **配置问题**: 查看 [API配置示例.md](qwen-project-main/qwen-project-main/API配置示例.md)
- **启动问题**: 查看 [快速启动指南.md](快速启动指南.md)
- **功能问题**: 查看各服务的README文档

---

## 📝 更新日志

### v2.0 (2025-10-16) - 当前版本
- ✨ AI功能改为大模型API调用
- ✅ 支持5种主流大模型API
- ✅ 无需GPU和本地模型
- ✅ 启动和响应速度显著提升
- ✅ 前端和其他功能保持不变

### v1.0
- ✅ 基于Qwen3-0.6B本地部署
- ✅ 完整的项目和文档管理
- ✅ 实体标注和自动分词

---

## 📄 许可证

与原项目保持一致的许可证。

---

## 🎉 开始使用

```bash
# 1. 克隆或下载项目
# 2. 阅读快速启动指南
open 快速启动指南.md

# 3. 配置API密钥（如需AI功能）
# 编辑 qwen-project-main/qwen-project-main/qwen.py

# 4. 启动服务并访问
```

**祝您使用愉快！** 🚀

---

**项目地址**: `/Users/tuxol/Documents/DataVault/#CST/SE02/iAnctChinese-Client-main 3_A`  
**更新日期**: 2025-10-16  
**版本**: v2.0

