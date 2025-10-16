# -*- coding: utf-8 -*-
"""
API 测试脚本
用于测试古文解析 API 是否正常工作
"""
import json
import sys

try:
    import requests
except ImportError:
    print("错误: 需要安装 requests 库")
    print("运行: pip install requests")
    sys.exit(1)

def test_health():
    """测试健康检查接口"""
    print("测试 1: 健康检查接口...")
    try:
        response = requests.get('http://localhost:5000/health', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✓ 健康检查通过")
            print(f"  API 提供商: {data.get('api_provider', 'N/A')}")
            print(f"  使用模型: {data.get('model', 'N/A')}")
            return True
        else:
            print(f"✗ 健康检查失败 (HTTP {response.status_code})")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ 无法连接到服务")
        print("  请确保后端服务已启动 (运行 python qwen.py)")
        return False
    except Exception as e:
        print(f"✗ 健康检查出错: {e}")
        return False

def test_analyze():
    """测试古文解析接口"""
    print("\n测试 2: 古文解析接口...")
    test_text = "学而时习之，不亦说乎"
    print(f"  输入文本: {test_text}")
    
    try:
        response = requests.post(
            'http://localhost:5000/api/analyze',
            json={'text': test_text},
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data.get('result', '')
            if result:
                print("✓ 古文解析成功")
                print("\n解析结果:")
                print("-" * 60)
                print(result)
                print("-" * 60)
                return True
            else:
                print("✗ 解析结果为空")
                return False
        else:
            print(f"✗ 解析失败 (HTTP {response.status_code})")
            try:
                error_data = response.json()
                print(f"  错误信息: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"  响应内容: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("✗ 请求超时")
        print("  API 调用可能需要较长时间，请稍后重试")
        return False
    except Exception as e:
        print(f"✗ 测试出错: {e}")
        return False

def test_error_handling():
    """测试错误处理"""
    print("\n测试 3: 错误处理...")
    try:
        # 测试空文本
        response = requests.post(
            'http://localhost:5000/api/analyze',
            json={},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✓ 空文本错误处理正确")
            return True
        else:
            print(f"✗ 预期状态码 400，实际: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 测试出错: {e}")
        return False

def main():
    """运行所有测试"""
    print("=" * 60)
    print("古文解析 API 测试")
    print("=" * 60)
    
    results = []
    
    # 测试 1: 健康检查
    results.append(("健康检查", test_health()))
    
    # 测试 2: 古文解析（只在健康检查通过时运行）
    if results[0][1]:
        results.append(("古文解析", test_analyze()))
        results.append(("错误处理", test_error_handling()))
    
    # 输出测试结果摘要
    print("\n" + "=" * 60)
    print("测试结果摘要")
    print("=" * 60)
    
    for name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        print(f"{name}: {status}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    print(f"\n总计: {passed_count}/{total_count} 测试通过")
    
    if passed_count == total_count:
        print("\n🎉 所有测试通过！API 工作正常。")
        return 0
    else:
        print("\n⚠️ 部分测试失败，请检查配置和服务状态。")
        return 1

if __name__ == '__main__':
    sys.exit(main())

