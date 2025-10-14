import React from 'react';

type Props = {
  activeTab: string;
};

const Section: React.FC<{ title: string; className?: string; children?: React.ReactNode }> = ({ title, className, children }) => (
  <div className={`panel-section ${className || ''}`}>
    <div className="panel-header">{title}</div>
    <div className="panel-body">{children || <div className="placeholder">暂无内容</div>}</div>
  </div>
);

const LeftPanel: React.FC<Props> = ({ activeTab }) => {
  // 支持的 tab：'结构标注','实体标注','关系标注','知识图谱','导出数据'
  if (activeTab === '结构标注') {
    return (
      <div className="left-panel">
        <Section title="结构" className="single" />
      </div>
    );
  }

  if (activeTab === '实体标注' || activeTab === '知识图谱') {
    return (
      <div className="left-panel two">
        <Section title="实体类" className="section-top" />
        <Section title="实体实例" className="section-bottom" />
      </div>
    );
  }

  if (activeTab === '关系标注') {
    return (
      <div className="left-panel two">
        <Section title="关系类" className="section-top" />
        <Section title="关系实例" className="section-bottom" />
      </div>
    );
  }

  // 默认：显示空面板
  return (
    <div className="left-panel">
      <Section title="结构" className="single" />
    </div>
  );
};

export default LeftPanel;
