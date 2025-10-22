# 使用教程

## Windows 操作流程

### 1. 环境配置

#### 1.1 安装 Python
从 [python.org](https://www.python.org/downloads/) 下载安装包，安装时勾选"Add Python to PATH"。

验证安装：
```cmd
python --version
```

#### 1.2 安装 Node.js
从 [nodejs.org](https://nodejs.org/) 下载安装包并安装。

验证安装：
```cmd
node --version
npm --version
```

### 2. 安装依赖

#### 2.1 安装 AI 服务依赖
打开命令提示符（cmd），执行：
```cmd
cd server\AI
pip install -r requirements.txt
```

#### 2.2 安装分词服务依赖
```cmd
cd ..\seg
pip install jieba flask flask-cors
```

#### 2.3 安装用户服务依赖
```cmd
cd ..\user
npm install
```

### 3. 配置 DeepSeek API Key

编辑文件 `server\AI\config.py`，将第 9 行的 `YOUR_API_KEY_HERE` 替换为你的 DeepSeek API Key：

```python
DEEPSEEK_API_KEY = "sk-xxxxxxxxxxxxx"
```

> 获取 API Key: https://platform.deepseek.com/

### 4. 启动服务

需要打开 **3 个命令提示符窗口**，分别启动 3 个后端服务。

#### 4.1 启动 AI 服务（窗口 1）
```cmd
cd server\AI
python ai.py
```
看到 `服务地址: http://0.0.0.0:5004` 表示启动成功。

#### 4.2 启动分词服务（窗口 2）
```cmd
cd server\seg
python seg_server.py
```
看到 `Running on http://0.0.0.0:5001` 表示启动成功。

#### 4.3 启动用户服务（窗口 3）
```cmd
cd server\user
npm start
```
看到 `用户管理服务已启动` 和 `端口: 5002` 表示启动成功。

### 5. 打开前端

在文件管理器中找到 `client\index.html`，双击用浏览器打开。

或在命令提示符中执行：
```cmd
start client\index.html
```

### 6. 验证运行

1. 浏览器打开后应显示登录/注册界面
2. 三个命令提示符窗口保持运行状态
3. 注册新用户并登录开始使用

---

## macOS 操作流程

### 1. 环境配置

#### 1.1 安装 Python
使用 Homebrew 安装：
```bash
brew install python3
```

验证安装：
```bash
python3 --version
```

#### 1.2 安装 Node.js
使用 Homebrew 安装：
```bash
brew install node
```

验证安装：
```bash
node --version
npm --version
```

### 2. 安装依赖

#### 2.1 安装 AI 服务依赖
打开终端，执行：
```bash
cd server/AI
pip3 install -r requirements.txt
```

#### 2.2 安装分词服务依赖
```bash
cd ../seg
pip3 install jieba flask flask-cors
```

#### 2.3 安装用户服务依赖
```bash
cd ../user
npm install
```

### 3. 配置 DeepSeek API Key

编辑文件 `server/AI/config.py`，将第 9 行的 `YOUR_API_KEY_HERE` 替换为你的 DeepSeek API Key：

```python
DEEPSEEK_API_KEY = "sk-xxxxxxxxxxxxx"
```

> 获取 API Key: https://platform.deepseek.com/

### 4. 启动服务

需要打开 **3 个终端窗口**，分别启动 3 个后端服务。

#### 4.1 启动 AI 服务（终端 1）
```bash
cd server/AI
python3 ai.py
```
看到 `服务地址: http://0.0.0.0:5004` 表示启动成功。

#### 4.2 启动分词服务（终端 2）
```bash
cd server/seg
python3 seg_server.py
```
看到 `Running on http://0.0.0.0:5001` 表示启动成功。

#### 4.3 启动用户服务（终端 3）
```bash
cd server/user
npm start
```
看到 `用户管理服务已启动` 和 `端口: 5002` 表示启动成功。

### 5. 打开前端

在访达中找到 `client/index.html`，双击用浏览器打开。

或在终端中执行：
```bash
open client/index.html
```

### 6. 验证运行

1. 浏览器打开后应显示登录/注册界面
2. 三个终端窗口保持运行状态
3. 注册新用户并登录开始使用

---

## 常见问题

**Q: 提示端口被占用**  
A: 修改对应服务的端口号，或关闭占用该端口的程序

**Q: AI 服务报错 API Key 无效**  
A: 检查 `server/AI/config.py` 中的 API Key 是否正确配置

**Q: 前端无法连接后端**  
A: 确认三个后端服务都已成功启动

**Q: Windows 下 Python 命令无法识别**  
A: 使用 `python` 代替 `python3`，或检查 Python 是否添加到系统环境变量
