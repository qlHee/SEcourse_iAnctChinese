# -*- coding: utf-8 -*-
"""
古文解析 API 服务
支持调用 DeepSeek 和阿里 Qwen 大模型 API
"""
import os
import json
import sys
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app)

# ==================== 配置加载 ====================
def load_config():
    """加载配置文件"""
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    if not os.path.exists(config_path):
        raise FileNotFoundError(
            f"配置文件不存在: {config_path}\n"
            "请复制 config.example.json 为 config.json 并填入您的 API Key"
        )
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 加载配置
try:
    config = load_config()
    api_provider = config.get('api_provider', 'qwen')
    api_config = config['api_config'][api_provider]
    generation_params = config.get('generation_params', {})
    
    print(f"[配置] 使用 API 提供商: {api_provider}")
    print(f"[配置] 模型: {api_config['model']}")
except Exception as e:
    print(f"[错误] 配置加载失败: {e}")
    print("请检查 config.json 文件是否正确配置")
    sys.exit(1)

# ==================== API 密钥配置说明 ====================
# 
# 如果您还没有配置 API Key，请按以下步骤操作：
#
# 1. 复制 config.example.json 为 config.json
# 2. 在 config.json 中填入您的 API Key：
#
#    对于阿里通义千问 (Qwen)：
#    - 访问: https://dashscope.console.aliyun.com/
#    - 获取 API Key 后，填入 "qwen" -> "api_key"
#
#    对于 DeepSeek：
#    - 访问: https://platform.deepseek.com/
#    - 获取 API Key 后，填入 "deepseek" -> "api_key"
#
# 3. 选择要使用的 API 提供商，修改 "api_provider" 为 "qwen" 或 "deepseek"
#
# ==================== API 客户端初始化 ====================

# 初始化 OpenAI 兼容客户端
client = OpenAI(
    api_key=api_config['api_key'],
    base_url=api_config['base_url']
)

def generate_response(prompt):
    """
    调用大模型 API 生成响应
    
    Args:
        prompt: 用户输入的提示词
    
    Returns:
        str: 模型生成的响应文本
    """
    try:
        messages = [{"role": "user", "content": prompt}]
        
        # 调用 API
        response = client.chat.completions.create(
            model=api_config['model'],
            messages=messages,
            max_tokens=generation_params.get('max_tokens', 800),
            temperature=generation_params.get('temperature', 0.75),
            top_p=generation_params.get('top_p', 0.9)
        )
        
        # 提取响应内容
        result = response.choices[0].message.content
        return result.strip()
        
    except Exception as e:
        error_msg = f"API 调用失败: {str(e)}"
        print(f"[错误] {error_msg}")
        raise Exception(error_msg)

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    """古文解析 API 接口"""
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': '请提供要分析的文本'}), 400
    
    input_text = data['text']
    
    # 构建提示词
    prompt = f"""请对"{input_text}"进行详细解释。你的解释应该尽可能全面,包含以下方面:
1. 对其字面意思的解读。
2. 阐述其核心哲学思想。
3. 结合现代学习或工作场景,谈谈它的现实意义。
请直接给出解释,不要输出任何思考过程，并且必须分成上面那三点进行回答。"""
    
    try:
        response = generate_response(prompt)
        return jsonify({'result': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'api_provider': api_provider,
        'model': api_config['model']
    })

if __name__ == '__main__':
    print("=" * 60)
    print("古文解析 API 服务启动中...")
    print(f"API 提供商: {api_provider}")
    print(f"使用模型: {api_config['model']}")
    print("服务地址: http://0.0.0.0:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5007, debug=False)
