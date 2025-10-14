# -*- coding: utf-8 -*-
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import io
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = Flask(__name__)
CORS(app) 

model_path = r"E:\work and file\2025\app-project\qwen"

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    dtype="auto",
    device_map="auto"
)

def generate_response(prompt):
    messages = [{"role": "user", "content": prompt}]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    inputs = tokenizer(text, return_tensors="pt").to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=800,
            do_sample=True,
            temperature=0.75,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.eos_token_id
        )

    full_response = tokenizer.decode(
        outputs[0][inputs.input_ids.shape[1] :], skip_special_tokens=True
    )

    cleaned = re.sub(r"<think>.*?</think>", "", full_response, flags=re.S).strip()
    return cleaned

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': '请提供要分析的文本'}), 400
    
    input_text = data['text']
    
    prompt = f"""
请对"{input_text}"进行详细解释。你的解释应该尽可能全面,包含以下方面:
1. 对其字面意思的解读。
2. 阐述其核心哲学思想。
3. 结合现代学习或工作场景,谈谈它的现实意义。
请直接给出解释,不要输出任何思考过程，并且必须分成上面那三点进行回答。
"""
    
    try:
        response = generate_response(prompt)
        return jsonify({'result': response})
    except Exception as e:
        return jsonify({'error': f'生成回复时出错: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

