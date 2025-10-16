# -*- coding: utf-8 -*-
"""
古文解析服务 - 基于大模型API
支持多种主流大模型API：OpenAI、通义千问、文心一言、ChatGLM等
"""
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app)

# ============ 配置区域 ============
# 请在这里填写您的API配置

# 方式1：OpenAI API (推荐 - 也支持兼容OpenAI格式的国内API)
API_TYPE = "openai"  # 可选值: "openai", "qwen", "wenxin", "chatglm", "claude"
API_KEY = "YOUR_API_KEY_HERE"  # ⚠️ 必填：请填写您的API密钥
API_BASE_URL = "https://api.openai.com/v1"  # OpenAI官方地址，国内可改为代理地址
MODEL_NAME = "gpt-3.5-turbo"  # 模型名称

# 方式2：阿里云通义千问API
# API_TYPE = "qwen"
# API_KEY = "YOUR_QWEN_API_KEY_HERE"  # ⚠️ 必填：通义千问API-KEY
# API_BASE_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
# MODEL_NAME = "qwen-turbo"

# 方式3：百度文心一言API
# API_TYPE = "wenxin"
# API_KEY = "YOUR_WENXIN_API_KEY_HERE"  # ⚠️ 必填：百度API Key
# SECRET_KEY = "YOUR_WENXIN_SECRET_KEY_HERE"  # ⚠️ 必填：百度Secret Key
# MODEL_NAME = "ERNIE-Bot-turbo"

# 方式4：智谱AI (ChatGLM)
# API_TYPE = "chatglm"
# API_KEY = "YOUR_CHATGLM_API_KEY_HERE"  # ⚠️ 必填：智谱AI API-KEY
# API_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
# MODEL_NAME = "glm-4"

# 方式5：Anthropic Claude API
# API_TYPE = "claude"
# API_KEY = "YOUR_CLAUDE_API_KEY_HERE"  # ⚠️ 必填：Claude API-KEY
# API_BASE_URL = "https://api.anthropic.com/v1/messages"
# MODEL_NAME = "claude-3-sonnet-20240229"

# 高级配置
TEMPERATURE = 0.7  # 温度参数 (0-1)，越高越随机
MAX_TOKENS = 1000  # 最大生成token数
TIMEOUT = 60  # 请求超时时间（秒）

# ============ API调用函数 ============

def call_openai_api(prompt):
    """
    调用OpenAI格式的API（包括OpenAI官方、国内兼容API等）
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS
    }
    
    response = requests.post(
        f"{API_BASE_URL}/chat/completions",
        headers=headers,
        json=payload,
        timeout=TIMEOUT
    )
    response.raise_for_status()
    
    result = response.json()
    return result['choices'][0]['message']['content'].strip()


def call_qwen_api(prompt):
    """
    调用阿里云通义千问API
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "input": {
            "messages": [
                {"role": "user", "content": prompt}
            ]
        },
        "parameters": {
            "temperature": TEMPERATURE,
            "max_tokens": MAX_TOKENS
        }
    }
    
    response = requests.post(
        API_BASE_URL,
        headers=headers,
        json=payload,
        timeout=TIMEOUT
    )
    response.raise_for_status()
    
    result = response.json()
    return result['output']['text'].strip()


def call_wenxin_api(prompt):
    """
    调用百度文心一言API
    """
    # 第一步：获取access_token
    token_url = "https://aip.baidubce.com/oauth/2.0/token"
    token_params = {
        "grant_type": "client_credentials",
        "client_id": API_KEY,
        "client_secret": SECRET_KEY
    }
    token_response = requests.post(token_url, params=token_params, timeout=TIMEOUT)
    token_response.raise_for_status()
    access_token = token_response.json()['access_token']
    
    # 第二步：调用文心一言
    api_url = f"https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/{MODEL_NAME.lower()}"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": TEMPERATURE,
        "max_output_tokens": MAX_TOKENS
    }
    
    response = requests.post(
        f"{api_url}?access_token={access_token}",
        headers=headers,
        json=payload,
        timeout=TIMEOUT
    )
    response.raise_for_status()
    
    result = response.json()
    return result['result'].strip()


def call_chatglm_api(prompt):
    """
    调用智谱AI (ChatGLM) API
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS
    }
    
    response = requests.post(
        API_BASE_URL,
        headers=headers,
        json=payload,
        timeout=TIMEOUT
    )
    response.raise_for_status()
    
    result = response.json()
    return result['choices'][0]['message']['content'].strip()


def call_claude_api(prompt):
    """
    调用Anthropic Claude API
    """
    headers = {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS
    }
    
    response = requests.post(
        API_BASE_URL,
        headers=headers,
        json=payload,
        timeout=TIMEOUT
    )
    response.raise_for_status()
    
    result = response.json()
    return result['content'][0]['text'].strip()


def generate_response(prompt):
    """
    统一的AI调用接口，根据配置的API_TYPE选择对应的API
    """
    try:
        if API_TYPE == "openai":
            return call_openai_api(prompt)
        elif API_TYPE == "qwen":
            return call_qwen_api(prompt)
        elif API_TYPE == "wenxin":
            return call_wenxin_api(prompt)
        elif API_TYPE == "chatglm":
            return call_chatglm_api(prompt)
        elif API_TYPE == "claude":
            return call_claude_api(prompt)
        else:
            raise ValueError(f"不支持的API类型: {API_TYPE}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"API调用失败: {str(e)}")


# ============ Flask路由 ============

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    """
    古文解析接口
    输入: {"text": "古文内容"}
    输出: {"result": "解析结果"} 或 {"error": "错误信息"}
    """
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': '请提供要分析的文本'}), 400
    
    input_text = data['text']
    
    # 构建提示词（与原来的保持一致）
    prompt = f"""
请对"{input_text}"进行详细解释。你的解释应该尽可能全面,包含以下方面:
1. 对其字面意思的解读。
2. 阐述其核心哲学思想。
3. 结合现代学习或工作场景,谈谈它的现实意义。
请直接给出解释,不要输出任何思考过程，并且必须分成上面那三点进行回答。
"""
    
    try:
        # 调用大模型API
        response = generate_response(prompt)
        return jsonify({'result': response})
    except Exception as e:
        error_msg = f'生成回复时出错: {str(e)}'
        print(f"错误: {error_msg}")
        return jsonify({'error': error_msg}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    健康检查接口
    """
    return jsonify({
        'status': 'ok',
        'service': '古文解析服务 (基于大模型API)',
        'api_type': API_TYPE,
        'model': MODEL_NAME
    })


# ============ 启动服务 ============

if __name__ == '__main__':
    # 检查API配置
    if API_KEY == "YOUR_API_KEY_HERE" or not API_KEY:
        print("\n" + "="*60)
        print("⚠️  警告：未配置API密钥！")
        print("="*60)
        print("请在 qwen.py 文件顶部的配置区域填写您的API密钥：")
        print("  1. 找到 API_KEY = 'YOUR_API_KEY_HERE'")
        print("  2. 将 'YOUR_API_KEY_HERE' 替换为您的实际API密钥")
        print("  3. 根据需要选择API类型 (API_TYPE)")
        print("="*60 + "\n")
        print("支持的API类型：")
        print("  - openai: OpenAI API (推荐)")
        print("  - qwen: 阿里云通义千问")
        print("  - wenxin: 百度文心一言")
        print("  - chatglm: 智谱AI")
        print("  - claude: Anthropic Claude")
        print("="*60 + "\n")
    else:
        print("\n" + "="*60)
        print("🚀 古文解析服务已启动 (基于大模型API)")
        print("="*60)
        print(f"📡 端口: 5000")
        print(f"🤖 API类型: {API_TYPE}")
        print(f"📝 模型: {MODEL_NAME}")
        print(f"🔗 接口: POST http://localhost:5000/api/analyze")
        print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
