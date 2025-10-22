# -*- coding: utf-8 -*-
"""
DeepSeek API 配置文件
请在下方填入你的 API Key
"""

# 在这里填写你的 DeepSeek API Key
# 获取地址: https://platform.deepseek.com/
DEEPSEEK_API_KEY = "YOUR_API_KEY_HERE"

# API 配置
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

# 生成参数配置
TEMPERATURE = 0.75
MAX_TOKENS = 2000
TOP_P = 0.9
TIMEOUT = 60  # 请求超时时间（秒）


