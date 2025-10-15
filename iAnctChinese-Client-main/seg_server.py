# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import jieba

app = Flask(__name__)
CORS(app)


@app.route('/api/segment', methods=['POST'])
def segment_text():
    data = request.get_json(silent=True) or {}
    text = data.get('text', '')
    if not isinstance(text, str) or len(text.strip()) == 0:
        return jsonify({'error': '请提供要分词的文本'}), 400

    # 使用精确模式分词
    tokens = list(jieba.cut(text, cut_all=False))

    # 计算起止偏移（基于顺序匹配，保证处理重复词）
    result = []
    cursor = 0
    for tok in tokens:
        pos = text.find(tok, cursor)
        if pos == -1:
            # 回退：全局搜索（极端重复或特殊字符场景）
            pos = text.find(tok)
            if pos == -1:
                continue
        start = pos
        end = pos + len(tok)
        cursor = end
        result.append({'text': tok, 'start': start, 'end': end})

    return jsonify({'tokens': result})


if __name__ == '__main__':
    # 运行在 5001 端口，避免与 qwen 服务冲突
    app.run(host='0.0.0.0', port=5001, debug=False)

