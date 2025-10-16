# 数据存储说明

## 📄 data.json 结构

这是一个简单的 JSON 文件，存储所有用户数据。

### 数据结构

```json
{
  "users": [用户列表],
  "projects": [项目列表],
  "documents": [文档列表],
  "annotations": [标注列表]
}
```

## 👤 用户（users）

```json
{
  "id": 1,
  "username": "用户名",
  "email": "邮箱",
  "password": "密码（明文，实际应用需加密）",
  "created_at": "2025-10-15 12:00:00",
  "last_login": "最后登录时间",
  "is_active": true
}
```

## 📁 项目（projects）

```json
{
  "id": 1,
  "user_id": 1,
  "name": "项目名称",
  "description": "项目描述",
  "created_at": "2025-10-15 12:00:00",
  "updated_at": "2025-10-15 12:00:00"
}
```

## 📝 文档（documents）

```json
{
  "id": 1,
  "project_id": 1,
  "name": "文档名称",
  "content": "文档内容",
  "description": "文档描述",
  "author": "作者",
  "created_at": "2025-10-15 12:00:00",
  "updated_at": "2025-10-15 12:00:00"
}
```

## 🏷️ 标注（annotations）

```json
{
  "id": 1,
  "document_id": 1,
  "start_pos": 0,
  "end_pos": 2,
  "label": "人物",
  "created_at": "2025-10-15 12:00:00"
}
```

## 📖 完整示例

```json
{
  "users": [
    {
      "id": 1,
      "username": "张三",
      "email": "zhangsan@example.com",
      "password": "123456",
      "created_at": "2025-10-15 12:00:00",
      "last_login": "2025-10-15 14:30:00",
      "is_active": true
    }
  ],
  "projects": [
    {
      "id": 1,
      "user_id": 1,
      "name": "《论语》标注项目",
      "description": "研究论语",
      "created_at": "2025-10-15 12:00:00",
      "updated_at": "2025-10-15 14:00:00"
    }
  ],
  "documents": [
    {
      "id": 1,
      "project_id": 1,
      "name": "学而第一",
      "content": "子曰：学而时习之，不亦说乎？",
      "description": "论语第一章",
      "author": "张三",
      "created_at": "2025-10-15 13:00:00",
      "updated_at": "2025-10-15 14:00:00"
    }
  ],
  "annotations": [
    {
      "id": 1,
      "document_id": 1,
      "start_pos": 0,
      "end_pos": 2,
      "label": "人物",
      "created_at": "2025-10-15 14:00:00"
    },
    {
      "id": 2,
      "document_id": 1,
      "start_pos": 4,
      "end_pos": 5,
      "label": "概念",
      "created_at": "2025-10-15 14:00:00"
    }
  ]
}
```

## 🔧 使用方法

### 1. 添加新用户
直接编辑 `data.json`，在 `users` 数组中添加：

```json
{
  "id": 2,
  "username": "新用户名",
  "email": "email@example.com",
  "password": "密码",
  "created_at": "2025-10-15 15:00:00",
  "last_login": null,
  "is_active": true
}
```

**注意**: ID 要递增，不能重复！

### 2. 添加项目
在 `projects` 数组中添加：

```json
{
  "id": 2,
  "user_id": 1,
  "name": "项目名",
  "description": "描述",
  "created_at": "2025-10-15 15:00:00",
  "updated_at": "2025-10-15 15:00:00"
}
```

### 3. 备份数据
定期复制 `data.json` 到安全的地方！

## ⚠️ 注意事项

1. **备份**: 修改前先备份 `data.json`
2. **格式**: 确保 JSON 格式正确（可用在线工具检查）
3. **ID**: 每个 ID 必须唯一且递增
4. **关联**: 
   - `project_id` 必须对应存在的项目
   - `document_id` 必须对应存在的文档
   - `user_id` 必须对应存在的用户

## 🛠️ 推荐工具

- **VS Code**: 安装 JSON 插件，自动格式化
- **在线工具**: https://jsonlint.com/ （检查格式）
- **备份工具**: 定期用 Git 或云盘备份

## 📊 查看数据

可以用任何文本编辑器打开 `data.json` 查看和编辑数据。

建议使用 VS Code、Notepad++ 等支持 JSON 高亮的编辑器。

