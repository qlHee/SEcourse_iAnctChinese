import jieba
import jieba.posseg as pseg
from typing import List
from .schemas import SegmentResult

class NLPProcessor:
    def __init__(self):
        # 初始化jieba，添加古籍词汇
        self._initialize_jieba()
    
    def _initialize_jieba(self):
        """初始化分词器，添加古籍专用词汇"""
        ancient_words = [
            '子曰', '诗云', '君子', '小人', '仁义', '礼智', '信', '忠恕', '孝悌',
            '吾日三省吾身', '不亦说乎', '不亦乐乎', '人不知而不愠', '曾子曰', '子贡曰'
        ]
        
        for word in ancient_words:
            jieba.add_word(word, freq=1000)
    
    def segment_text(self, text: str) -> List[SegmentResult]:
        """对文本进行分词"""
        words = pseg.cut(text)
        
        segments = []
        current_pos = 0
        
        for word, pos in words:
            start = text.find(word, current_pos)
            if start == -1:
                continue
                
            end = start + len(word)
            current_pos = end
            
            segments.append(SegmentResult(
                text=word,
                start=start,
                end=end,
                pos=pos
            ))
        
        return segments
    
    def auto_annotate(self, text: str) -> List[dict]:
        """自动标注（基于规则）"""
        annotations = []
        
        # 人名识别规则
        name_keywords = ['子曰', '曾子曰', '子贡曰', '颜渊曰', '孔子', '曾子']
        for keyword in name_keywords:
            start = text.find(keyword)
            while start != -1:
                end = start + len(keyword)
                annotations.append({
                    'start_pos': start,
                    'end_pos': end,
                    'text': keyword,
                    'tag_name': '人名',
                    'confidence': 0.9
                })
                start = text.find(keyword, end)
        
        # 核心概念识别
        concept_keywords = ['仁', '义', '礼', '智', '信', '忠', '恕', '孝', '悌', '君子', '小人']
        for keyword in concept_keywords:
            start = text.find(keyword)
            while start != -1:
                end = start + len(keyword)
                annotations.append({
                    'start_pos': start,
                    'end_pos': end,
                    'text': keyword,
                    'tag_name': '核心概念',
                    'confidence': 0.8
                })
                start = text.find(keyword, end)
        
        return annotations

# 全局NLP处理器实例
nlp_processor = NLPProcessor()