# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io
import os
import requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app) 

# 导入配置
try:
    from config import DEEPSEEK_API_KEY, DEEPSEEK_API_URL, DEEPSEEK_MODEL, QWEN_API_KEY, QWEN_API_URL, TEMPERATURE, MAX_TOKENS, TOP_P, TIMEOUT
except ImportError:
    # 如果没有 config.py，尝试从环境变量读取
    DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')
    DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
    DEEPSEEK_MODEL = 'deepseek-chat'
    QWEN_API_KEY = os.environ.get('QWEN_API_KEY', '')
    QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    TEMPERATURE = 0.75
    MAX_TOKENS = 2000
    TOP_P = 0.9
    TIMEOUT = 60

def generate_response(prompt, model=None):
    """
    调用 DeepSeek 或 Qwen API 生成响应
    """
    # 确定使用的模型
    use_model = model or DEEPSEEK_MODEL
    
    # 判断是否使用 Qwen API
    is_qwen = use_model.startswith('qwen-')
    
    if is_qwen:
        print(f'使用 Qwen API, 模型: {use_model}')
        if not QWEN_API_KEY:
            raise ValueError('未设置 QWEN_API_KEY。请在 config.py 中设置后重启服务。')
        api_key = QWEN_API_KEY
        api_url = QWEN_API_URL
    else:
        print(f'使用 DeepSeek API, 模型: {use_model}')
        if not DEEPSEEK_API_KEY:
            raise ValueError('未设置 DEEPSEEK_API_KEY。请在 config.py 中设置后重启服务。')
        api_key = DEEPSEEK_API_KEY
        api_url = DEEPSEEK_API_URL
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        'model': use_model,
        'messages': [
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'temperature': TEMPERATURE,
        'max_tokens': MAX_TOKENS,
        'top_p': TOP_P
    }
    
    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        
        result = response.json()
        if 'choices' in result and len(result['choices']) > 0:
            return result['choices'][0]['message']['content'].strip()
        else:
            raise ValueError('API 返回格式异常')
            
    except requests.exceptions.RequestException as e:
        raise Exception(f'调用 API 失败: {str(e)}')

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': '请提供要分析的文本'}), 400
    
    input_text = data['text']
    model = data.get('model', DEEPSEEK_MODEL)  # 支持前端指定模型
    
    print(f'收到解析请求，使用模型: {model}')
    
    prompt = f"""
请对"{input_text}"进行详细解释。你的解释应该尽可能全面,包含以下方面:
1. 对其字面意思的解读。
2. 阐述其核心哲学思想。
3. 结合现代学习或工作场景,谈谈它的现实意义。
请直接给出解释,不要输出任何思考过程，并且必须分成上面那三点进行回答。
"""
    
    try:
        response = generate_response(prompt, model)
        return jsonify({'result': response})
    except Exception as e:
        return jsonify({'error': f'生成回复时出错: {str(e)}'}), 500

if __name__ == '__main__':
    print('=' * 60)
    print('古文解析服务启动中...')
    print('支持 DeepSeek 和 Qwen API')
    if DEEPSEEK_API_KEY:
        print(f'DeepSeek API Key: {DEEPSEEK_API_KEY[:8]}...{DEEPSEEK_API_KEY[-4:]}')
    else:
        print('警告: 未设置 DEEPSEEK_API_KEY!')
    if QWEN_API_KEY:
        print(f'Qwen API Key: {QWEN_API_KEY[:8]}...{QWEN_API_KEY[-4:]}')
    else:
        print('警告: 未设置 QWEN_API_KEY!')
    print('服务地址: http://0.0.0.0:5007')
    print('=' * 60)
    app.run(host='0.0.0.0', port=5007, debug=False)

