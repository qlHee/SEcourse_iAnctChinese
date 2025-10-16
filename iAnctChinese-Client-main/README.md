# iAnctChinese-Client (HTML+CSS+JS版本)

这是原React项目的纯HTML+CSS+JavaScript版本，保持了所有原有功能。

## 项目结构

```
├── index.html              # 主页面文件
├── styles/                 # CSS样式文件
│   ├── main.css           # 主样式
│   ├── header.css         # 头部样式
│   ├── home-content.css   # 首页内容样式
│   ├── document-list.css   # 文档列表样式
│   ├── document-editor.css # 文档编辑器样式
│   ├── modal-form.css      # 弹窗样式
│   ├── import-modal.css    # 导入弹窗样式
│   └── toast.css          # 提示消息样式
└── js/                    # JavaScript文件
    ├── utils.js           # 工具函数
    ├── data-manager.js    # 数据管理
    ├── ui-manager.js      # UI管理
    └── app.js            # 主应用逻辑
```

## 功能特性

### ✅ 已实现功能

1. **项目管理**
   - 项目列表展示
   - 新建项目
   - 编辑项目信息
   - 删除项目
   - 项目详情查看

2. **文档管理**
   - 文档列表展示
   - 新建文档
   - 编辑文档信息
   - 删除文档
   - 复制文档
   - 文档详情查看

3. **文档编辑**
   - 多标签页编辑界面
   - 实时内容保存
   - 作者信息编辑
   - 文档信息侧栏

4. **文件导入**
   - 支持拖拽上传
   - 支持点击选择文件
   - 多文件同时导入
   - 文件格式支持：.txt, .md, .doc, .docx

5. **数据持久化**
   - 本地存储（localStorage）
   - 数据自动保存
   - 数据导入/导出
   - 数据备份/恢复

6. **用户界面**
   - 响应式设计
   - 现代化UI风格
   - 弹窗交互
   - 提示消息
   - 语言切换界面

7. **键盘快捷键**
   - Ctrl/Cmd + S: 保存文档
   - Ctrl/Cmd + N: 新建项目/文档
   - Ctrl/Cmd + 1-5: 切换编辑标签页
   - Escape: 关闭弹窗

## 使用方法

### 直接打开
1. 下载所有文件到本地目录
2. 用浏览器打开 `index.html` 文件
3. 开始使用应用

### 本地服务器（推荐）
```bash
# 使用Python启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx http-server

# 然后在浏览器中访问 http://localhost:8000
```

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 开发调试

在本地开发环境中，应用会自动启用开发者模式：

```javascript
// 在浏览器控制台中使用
window.dev.exportData()     // 导出所有数据
window.dev.clearData()      // 清空所有数据
window.dev.addTestData()    // 添加测试数据
```

## 数据存储

所有数据都存储在浏览器的 `localStorage` 中：

- `appdata_projects_v1`: 项目数据
- `appdata_documents_v1`: 文档数据

## 与原React版本的差异

1. **技术栈**: 从React+TypeScript改为纯HTML+CSS+JavaScript
2. **状态管理**: 从React Context改为自定义事件系统
3. **路由**: 从React Router改为原生History API
4. **图标**: 从react-icons改为Feather Icons CDN
5. **构建**: 无需构建过程，直接运行

## 功能对比

| 功能 | React版本 | HTML版本 | 状态 |
|------|-----------|----------|------|
| 项目管理 | ✅ | ✅ | 完全实现 |
| 文档管理 | ✅ | ✅ | 完全实现 |
| 文档编辑 | ✅ | ✅ | 完全实现 |
| 文件导入 | ✅ | ✅ | 完全实现 |
| 数据持久化 | ✅ | ✅ | 完全实现 |
| 响应式设计 | ✅ | ✅ | 完全实现 |
| 语言切换 | 🔄 | 🔄 | 界面完成，功能待实现 |
| 文档标注 | 🔄 | 🔄 | 界面完成，功能待实现 |

## 注意事项

1. **文件导入**: 由于浏览器安全限制，只能导入文本文件
2. **数据安全**: 数据存储在本地，清除浏览器数据会丢失
3. **性能**: 大量数据时可能影响性能，建议定期导出备份
4. **兼容性**: 需要现代浏览器支持ES6+特性

## AI服务配置（古文解析功能）

本项目集成了古文智能解析功能，基于大模型API实现。

### 启动AI服务

AI服务位于 `../qwen-project-main/qwen-project-main/` 目录：

```bash
# 1. 进入AI服务目录
cd ../qwen-project-main/qwen-project-main/

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置API密钥（重要！）
# 编辑 qwen.py 文件，在顶部配置区域填写您的API Key
# 详见：API配置示例.md

# 4. 启动服务
python qwen.py
```

### 支持的AI平台

- ✅ OpenAI (GPT-3.5/GPT-4)
- ✅ 阿里云通义千问（推荐国内用户）
- ✅ 百度文心一言
- ✅ 智谱AI (ChatGLM)
- ✅ Anthropic Claude

**⚠️ 注意：** 使用AI功能需要：
1. 在 `qwen.py` 中配置有效的API密钥
2. 启动AI服务（端口5000）
3. 确保网络连接正常

详细配置方法请查看：`../qwen-project-main/qwen-project-main/API配置示例.md`

### 不使用AI功能

如果不需要古文解析功能，可以跳过AI服务的启动，其他功能（项目管理、文档编辑、实体标注、自动分词）仍可正常使用。

## 后续开发建议

1. **后端集成**: ✅ 已完成（用户服务）
2. **用户认证**: ✅ 已完成（登录/注册功能）
3. **协作功能**: 多用户协作编辑
4. **文档标注**: ✅ 已完成（实体标注功能）
5. **导出格式**: 支持更多导出格式
6. **离线支持**: 添加Service Worker支持

## 许可证

与原项目保持一致的许可证。
