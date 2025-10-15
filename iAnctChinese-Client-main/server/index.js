const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodejieba = require('nodejieba');

const app = express();
const PORT = process.env.PORT || 3000;

// Python 服务地址配置
const QWEN_SERVICE = process.env.QWEN_SERVICE || 'http://localhost:5000';

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('../')); // 静态文件服务，指向前端目录

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'iAnctChinese Server' });
});

// 古文解析接口（转发到 Python qwen 服务）
app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: '请提供要分析的文本' });
    }

    // 转发到 Python qwen 服务
    const response = await axios.post(`${QWEN_SERVICE}/api/analyze`, { text }, {
      timeout: 60000 // 60秒超时
    });

    res.json(response.data);
  } catch (error) {
    console.error('古文解析错误:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: '大模型服务未启动，请先运行 qwen.py' 
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json(
        error.response.data || { error: '解析服务出错' }
      );
    }
    
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 自动分词接口（使用 nodejieba）
app.post('/api/segment', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: '请提供要分词的文本' });
    }

    // 使用 nodejieba 进行分词（精确模式）
    const words = nodejieba.cut(text);
    
    // 计算每个词的起止位置
    const tokens = [];
    let cursor = 0;
    
    for (const word of words) {
      const pos = text.indexOf(word, cursor);
      if (pos !== -1) {
        tokens.push({
          text: word,
          start: pos,
          end: pos + word.length
        });
        cursor = pos + word.length;
      }
    }

    res.json({ tokens });
  } catch (error) {
    console.error('分词错误:', error.message);
    res.status(500).json({ error: '分词服务出错' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 iAnctChinese 服务器已启动`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🌐 前端地址: http://localhost:${PORT}`);
  console.log(`🔧 API 地址: http://localhost:${PORT}/api`);
  console.log(`⚙️  Qwen 服务: ${QWEN_SERVICE}`);
  console.log(`========================================\n`);
  console.log(`💡 提示:`);
  console.log(`   - 自动分词功能已内置，无需额外服务`);
  console.log(`   - 古文解析需要先启动 qwen.py 服务`);
  console.log(`   - 启动命令: cd qwen-project-main/qwen-project-main && python qwen.py\n`);
});

