# -*- coding: utf-8 -*-
"""
DeepSeek & Qwen API 配置文件
请在下方填入你的 API Key
"""

# 在这里填写你的 DeepSeek API Key
# 获取地址: https://platform.deepseek.com/
DEEPSEEK_API_KEY = "sk-bb418b38c8b6441991d7300ba4a93868"

# DeepSeek API 配置
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

# 在这里填写你的 Qwen API Key
# 获取地址: https://dashscope.console.aliyun.com/
QWEN_API_KEY = "sk-2ff588b935b64886b102dd8924168c64"

# Qwen API 配置
QWEN_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"

# 生成参数配置
TEMPERATURE = 0.75
MAX_TOKENS = 2000
TOP_P = 0.9
TIMEOUT = 60  # 请求超时时间（秒）


