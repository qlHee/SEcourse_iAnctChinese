/**
 * 用户管理服务器 - Express 版本
 * 提供用户注册、登录、信息更新 API
 * 自动保存到 data/data.json 文件
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5002;

// 数据文件路径
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');

// 中间件
app.use(cors());
app.use(express.json());

// 加载数据
async function loadData() {
    try {
        const content = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.log('加载数据失败，使用空数据');
        return { users: [], projects: [], documents: [], annotations: [] };
    }
}

// 保存数据
async function saveData(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

// 获取当前时间戳
function getTimestamp() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

// ============ API 路由 ============

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'User Management Server (Express)' });
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: '请提供用户名和密码' 
            });
        }
        
        const data = await loadData();
        const user = data.users.find(u => u.username === username);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: '用户名不存在' 
            });
        }
        
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                error: '密码错误' 
            });
        }
        
        if (!user.is_active) {
            return res.status(403).json({ 
                success: false, 
                error: '账号已被禁用' 
            });
        }
        
        // 更新最后登录时间
        user.last_login = getTimestamp();
        await saveData(data);
        
        // 返回用户信息（不含密码）
        const { password: _, ...userInfo } = user;
        
        res.json({ success: true, user: userInfo });
        
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ 
            success: false, 
            error: '服务器错误' 
        });
    }
});

// 用户注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 验证输入
        if (!username || username.length < 3 || username.length > 20) {
            return res.status(400).json({ 
                success: false, 
                error: '用户名长度应在3-20个字符之间' 
            });
        }
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ 
                success: false, 
                error: '请提供有效的邮箱地址' 
            });
        }
        
        if (!password || password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: '密码至少需要6个字符' 
            });
        }
        
        const data = await loadData();
        
        // 检查用户名是否已存在
        if (data.users.some(u => u.username === username)) {
            return res.status(409).json({ 
                success: false, 
                error: '用户名已被注册' 
            });
        }
        
        // 检查邮箱是否已存在
        if (data.users.some(u => u.email === email)) {
            return res.status(409).json({ 
                success: false, 
                error: '邮箱已被注册' 
            });
        }
        
        // 获取新的用户ID
        const newId = data.users.length > 0 
            ? Math.max(...data.users.map(u => u.id)) + 1 
            : 1;
        
        // 创建新用户
        const newUser = {
            id: newId,
            username,
            email,
            password,
            created_at: getTimestamp(),
            last_login: null,
            is_active: true
        };
        
        data.users.push(newUser);
        
        // 保存到文件
        const saved = await saveData(data);
        
        if (saved) {
            // 返回用户信息（不含密码）
            const { password: _, ...userInfo } = newUser;
            
            res.status(201).json({ 
                success: true, 
                user: userInfo 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: '保存用户数据失败' 
            });
        }
        
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ 
            success: false, 
            error: '服务器错误' 
        });
    }
});

// 更新用户信息
app.patch('/api/users/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { email, password } = req.body;
        
        if (!email && !password) {
            return res.status(400).json({ 
                success: false, 
                error: '没有需要更新的信息' 
            });
        }
        
        const data = await loadData();
        const user = data.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: '用户不存在' 
            });
        }
        
        // 检查邮箱是否被其他用户使用
        if (email && data.users.some(u => u.id !== userId && u.email === email)) {
            return res.status(409).json({ 
                success: false, 
                error: '邮箱已被其他用户使用' 
            });
        }
        
        // 更新用户信息
        if (email) {
            user.email = email;
        }
        
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false, 
                    error: '密码至少需要6个字符' 
                });
            }
            user.password = password;
        }
        
        // 保存到文件
        const saved = await saveData(data);
        
        if (saved) {
            // 返回更新后的用户信息（不含密码）
            const { password: _, ...userInfo } = user;
            
            res.json({ 
                success: true, 
                user: userInfo 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: '保存用户数据失败' 
            });
        }
        
    } catch (error) {
        console.error('更新用户信息错误:', error);
        res.status(500).json({ 
            success: false, 
            error: '服务器错误' 
        });
    }
});

// 获取所有用户（管理功能，可选）
app.get('/api/users', async (req, res) => {
    try {
        const data = await loadData();
        
        // 返回用户列表（不含密码）
        const users = data.users.map(({ password, ...user }) => user);
        
        res.json({ success: true, users });
        
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ 
            success: false, 
            error: '服务器错误' 
        });
    }
});

// ============ 项目管理 API ============

// 获取用户的所有项目
app.get('/api/projects', async (req, res) => {
    try {
        const userId = parseInt(req.query.userId);
        if (!userId) {
            return res.status(400).json({ success: false, error: '缺少用户ID' });
        }
        
        const data = await loadData();
        const projects = data.projects.filter(p => p.userId === userId);
        
        res.json({ success: true, projects });
    } catch (error) {
        console.error('获取项目列表错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// 创建项目
app.post('/api/projects', async (req, res) => {
    try {
        const { userId, name, description } = req.body;
        
        if (!userId || !name) {
            return res.status(400).json({ success: false, error: '缺少必要参数' });
        }
        
        const data = await loadData();
        
        const newProject = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId,
            name,
            description: description || '',
            createdAt: getTimestamp(),
            updatedAt: getTimestamp()
        };
        
        data.projects.push(newProject);
        await saveData(data);
        
        res.status(201).json({ success: true, project: newProject });
    } catch (error) {
        console.error('创建项目错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// 更新项目
app.put('/api/projects/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        
        const data = await loadData();
        const project = data.projects.find(p => p.id === projectId);
        
        if (!project) {
            return res.status(404).json({ success: false, error: '项目不存在' });
        }
        
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        project.updatedAt = getTimestamp();
        
        await saveData(data);
        
        res.json({ success: true, project });
    } catch (error) {
        console.error('更新项目错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// 删除项目
app.delete('/api/projects/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const data = await loadData();
        const index = data.projects.findIndex(p => p.id === projectId);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: '项目不存在' });
        }
        
        data.projects.splice(index, 1);
        // 同时删除该项目下的所有文档
        data.documents = data.documents.filter(d => d.projectId !== projectId);
        
        await saveData(data);
        
        res.json({ success: true });
    } catch (error) {
        console.error('删除项目错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// ============ 文档管理 API ============

// 获取用户的所有文档
app.get('/api/documents', async (req, res) => {
    try {
        const userId = parseInt(req.query.userId);
        const projectId = req.query.projectId;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: '缺少用户ID' });
        }
        
        const data = await loadData();
        let documents = data.documents.filter(d => d.userId === userId);
        
        if (projectId) {
            documents = documents.filter(d => d.projectId === projectId);
        }
        
        res.json({ success: true, documents });
    } catch (error) {
        console.error('获取文档列表错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// 创建文档
app.post('/api/documents', async (req, res) => {
    try {
        const { userId, projectId, name, description, content, author } = req.body;
        
        if (!userId || !projectId || !name) {
            return res.status(400).json({ success: false, error: '缺少必要参数' });
        }
        
        const data = await loadData();
        
        const newDocument = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId,
            projectId,
            name,
            description: description || '',
            content: content || '',
            author: author || '',
            entityAnnotations: [],
            relationAnnotations: [],
            createdAt: getTimestamp(),
            updatedAt: getTimestamp()
        };
        
        data.documents.push(newDocument);
        await saveData(data);
        
        res.status(201).json({ success: true, document: newDocument });
    } catch (error) {
        console.error('创建文档错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// 更新文档
app.put('/api/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const updates = req.body;
        
        const data = await loadData();
        const document = data.documents.find(d => d.id === documentId);
        
        if (!document) {
            return res.status(404).json({ success: false, error: '文档不存在' });
        }
        
        // 更新允许的字段
        const allowedFields = ['name', 'description', 'content', 'author', 'entityAnnotations', 'relationAnnotations'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                document[field] = updates[field];
            }
        });
        
        document.updatedAt = getTimestamp();
        
        await saveData(data);
        
        res.json({ success: true, document });
    } catch (error) {
        console.error('更新文档错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// 删除文档
app.delete('/api/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        
        const data = await loadData();
        const index = data.documents.findIndex(d => d.id === documentId);
        
        if (index === -1) {
            return res.status(404).json({ success: false, error: '文档不存在' });
        }
        
        data.documents.splice(index, 1);
        
        await saveData(data);
        
        res.json({ success: true });
    } catch (error) {
        console.error('删除文档错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// ============ 导出管理 API ============

// 导出选中的文档与标注
app.post('/api/export-documents', async (req, res) => {
    try {
        const { documentIds } = req.body;
        
        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            return res.status(400).json({ success: false, error: '请提供要导出的文档ID列表' });
        }
        
        const data = await loadData();
        const documents = data.documents.filter(d => documentIds.includes(d.id));
        
        if (documents.length === 0) {
            return res.status(404).json({ success: false, error: '未找到指定的文档' });
        }
        
        // 导出文件夹路径
        const exportDir = path.join(__dirname, '..', '..', 'exported data');
        
        // 确保导出文件夹存在
        try {
            await fs.access(exportDir);
        } catch {
            await fs.mkdir(exportDir, { recursive: true });
        }
        
        const exportTime = getTimestamp();
        const exportedFiles = [];
        
        // 为每个文档生成txt和csv文件
        for (const doc of documents) {
            // 生成txt文件
            const txtContent = `文档名称: ${doc.name}
文档描述: ${doc.description || '无'}
创建时间: ${doc.createdAt}
更新时间: ${doc.updatedAt}
导出时间: ${exportTime}

文档内容（古文原文）:
${doc.content || ''}`;
            
            const txtFileName = `${doc.name.replace(/\.(txt|md)$/i, '')}.txt`;
            const txtFilePath = path.join(exportDir, txtFileName);
            await fs.writeFile(txtFilePath, txtContent, 'utf-8');
            exportedFiles.push(txtFileName);
            
            // 生成csv文件
            const csvLines = ['number,label,Instance'];
            const annotations = doc.entityAnnotations || [];
            
            annotations.forEach((ann, index) => {
                const number = index + 1;
                const label = ann.label || '';
                const instance = doc.content ? doc.content.slice(ann.start, ann.end) : '';
                // CSV格式：如果字段包含逗号或引号，需要用引号包裹
                const escapedInstance = instance.includes(',') || instance.includes('"') 
                    ? `"${instance.replace(/"/g, '""')}"` 
                    : instance;
                csvLines.push(`${number},${label},${escapedInstance}`);
            });
            
            const csvContent = csvLines.join('\n');
            const csvFileName = `${doc.name.replace(/\.(txt|md)$/i, '')}+实体标注.csv`;
            const csvFilePath = path.join(exportDir, csvFileName);
            await fs.writeFile(csvFilePath, csvContent, 'utf-8');
            exportedFiles.push(csvFileName);
        }
        
        res.json({ 
            success: true, 
            message: `成功导出 ${documents.length} 个文档`,
            exportedFiles,
            exportCount: documents.length
        });
        
    } catch (error) {
        console.error('导出文档错误:', error);
        res.status(500).json({ success: false, error: '服务器错误: ' + error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 用户管理服务已启动 (Express)');
    console.log('📡 端口:', PORT);
    console.log('📁 数据文件:', DATA_FILE);
    console.log('='.repeat(50));
    console.log('✅ 功能: 用户注册、登录、信息更新');
    console.log('✅ 数据: 自动保存到 data.json');
    console.log('='.repeat(50) + '\n');
});

