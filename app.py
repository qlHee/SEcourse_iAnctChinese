from flask import Flask, request, jsonify
from flask_cors import CORS
import jieba

app = Flask(__name__)
CORS(app)  # 允许所有跨域请求

@app.route('/api/segment', methods=['POST'])
def segment():
    data = request.json
    text = data.get("text", "")
    words = list(jieba.cut(text))
    return jsonify({"words": words})

@app.route('/api/annotate', methods=['POST'])
def annotate():
    data = request.json
    print("收到标注数据：", data)
    return jsonify({"status": "ok", "message": "标注已保存"})

if __name__ == '__main__':
    app.run(debug=True)
