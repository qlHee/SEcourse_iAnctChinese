# -*- coding: utf-8 -*-
"""
API配置测试脚本
用于验证API密钥配置是否正确
"""

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("=" * 60)
print("🧪 API配置测试脚本")
print("=" * 60)
print()

# 导入配置
try:
    from qwen import (
        API_TYPE, API_KEY, API_BASE_URL, MODEL_NAME,
        TEMPERATURE, MAX_TOKENS, TIMEOUT,
        generate_response
    )
    print("✅ 成功导入配置")
except Exception as e:
    print(f"❌ 导入配置失败: {e}")
    sys.exit(1)

print()
print("-" * 60)
print("📋 当前配置:")
print("-" * 60)
print(f"API类型: {API_TYPE}")
print(f"API地址: {API_BASE_URL}")
print(f"模型名称: {MODEL_NAME}")
print(f"温度参数: {TEMPERATURE}")
print(f"最大Token: {MAX_TOKENS}")
print(f"超时时间: {TIMEOUT}秒")
print()

# 检查API密钥
print("-" * 60)
print("🔑 API密钥检查:")
print("-" * 60)

if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
    print("❌ API密钥未配置！")
    print()
    print("请在 qwen.py 文件中配置API密钥：")
    print("  1. 打开 qwen.py 文件")
    print("  2. 找到配置区域（文件顶部）")
    print("  3. 将 API_KEY 改为您的实际API密钥")
    print()
    print("示例：")
    print("  API_KEY = 'sk-xxxxxxxxxxxxx'  # 替换为您的密钥")
    print()
    sys.exit(1)
else:
    # 脱敏显示
    if len(API_KEY) > 8:
        masked = API_KEY[:4] + "*" * (len(API_KEY) - 8) + API_KEY[-4:]
    else:
        masked = "*" * len(API_KEY)
    print(f"✅ API密钥已配置: {masked}")
    print()

# 检查特殊配置
if API_TYPE == "wenxin":
    try:
        from qwen import SECRET_KEY
        if not SECRET_KEY or SECRET_KEY == "YOUR_WENXIN_SECRET_KEY_HERE":
            print("⚠️  警告：百度文心一言需要配置 SECRET_KEY")
            print("请在 qwen.py 中添加：")
            print("  SECRET_KEY = 'your_secret_key'")
            print()
        else:
            print("✅ SECRET_KEY 已配置")
            print()
    except ImportError:
        print("⚠️  警告：使用百度文心一言需要配置 SECRET_KEY")
        print()

print("-" * 60)
print("🚀 开始测试API调用...")
print("-" * 60)
print()

# 测试用例
test_text = "学而时习之，不亦说乎"
print(f"📝 测试文本: {test_text}")
print()

# 构建提示词
prompt = f"""
请对"{test_text}"进行详细解释。你的解释应该尽可能全面,包含以下方面:
1. 对其字面意思的解读。
2. 阐述其核心哲学思想。
3. 结合现代学习或工作场景,谈谈它的现实意义。
请直接给出解释,不要输出任何思考过程，并且必须分成上面那三点进行回答。
"""

print("⏳ 正在调用API（请稍候）...")
print()

try:
    response = generate_response(prompt)
    
    print("=" * 60)
    print("✅ API调用成功！")
    print("=" * 60)
    print()
    print("📄 解析结果:")
    print("-" * 60)
    print(response)
    print("-" * 60)
    print()
    print("🎉 测试通过！您的API配置正确。")
    print()
    print("现在可以启动服务：")
    print("  python qwen.py")
    print()
    
except Exception as e:
    print("=" * 60)
    print("❌ API调用失败！")
    print("=" * 60)
    print()
    print(f"错误信息: {str(e)}")
    print()
    print("可能的原因：")
    print("  1. API密钥不正确或已过期")
    print("  2. 网络连接问题")
    print("  3. API账户余额不足")
    print("  4. API_BASE_URL 配置错误")
    print("  5. 模型名称错误")
    print()
    print("解决方案：")
    print("  1. 检查API密钥是否正确")
    print("  2. 检查网络连接（OpenAI可能需要代理）")
    print("  3. 检查API账户余额")
    print("  4. 查看详细错误信息并调整配置")
    print()
    print("如果是网络问题（国内访问OpenAI）：")
    print("  - 使用代理服务")
    print("  - 或改用国内API（通义千问、文心一言）")
    print()
    sys.exit(1)

print("=" * 60)
print("测试完成")
print("=" * 60)

