import React, { useState } from 'react';
import { FiFolder, FiInfo, FiTrash2, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ModalForm from './ModalForm'; // 引入复用弹窗
import type { Field } from './ModalForm';
import './HomeContent.css';
import { useAppData } from '../context/AppDataContext';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

const HomeContent: React.FC = () => {
  const navigate = useNavigate();

  const { projects, addProject, updateProject, deleteProject } = useAppData();

  // 弹窗控制
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalFields, setModalFields] = useState<Field[]>([]);
  const [initialData, setInitialData] = useState<Record<string, any>>({});
  const [onSubmitCallback, setOnSubmitCallback] = useState<(data: Record<string, any>) => void>(() => () => {});

  // 打开项目详情
  const handleOpenDetails = (project: Project) => {
    setModalTitle('项目详情');
    setModalFields([
      { name: 'name', label: '项目名称', type: 'text' },
      { name: 'description', label: '项目描述', type: 'textarea' },
      { name: 'createdAt', label: '创建时间', type: 'text', readOnly: true },
      { name: 'updatedAt', label: '更新时间', type: 'text', readOnly: true },
    ]);
    setInitialData(project);
    setOnSubmitCallback(() => (data: Record<string, any>) => {
      updateProject(project.id, { name: data.name, description: data.description });
    });
    setModalOpen(true);
  };

  // 打开新建项目
  const handleOpenCreate = () => {
    setModalTitle('新建项目');
    setModalFields([
      { name: 'name', label: '项目名称', type: 'text' },
      { name: 'description', label: '项目描述', type: 'textarea' },
    ]);
    setInitialData({});
    setOnSubmitCallback(() => (data: Record<string, any>) => {
      addProject({ name: data.name, description: data.description });
    });
    setModalOpen(true);
  };

  // 删除项目
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('确定删除该项目吗？')) {
      deleteProject(projectId);
    }
  };

  return (
    <div className="home-content">
      {/* 标题和新建项目按钮 */}
      <div className="page-header">
        <h2 className="page-title">项目管理</h2>
        <button className="create-btn" onClick={handleOpenCreate}>
          <FiPlus className="icon" /> 新建项目
        </button>
      </div>

      {/* 项目列表 */}
      <div className="project-list">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-info">
              <div className="project-title-row">
                <span className="project-name">{project.name}</span>
                <span className="project-detail">{project.description}</span>
              </div>
              <span className="project-date">{project.createdAt}</span>
            </div>
            <div className="project-actions">
              <button
                className="action-btn"
                onClick={() => navigate(`/projects/${project.id}/documents`, { state: { projectName: project.name } })}
              >
                <FiFolder className="icon" /> 打开项目
              </button>
              <button
                className="action-btn"
                onClick={() => handleOpenDetails(project)}
              >
                <FiInfo className="icon" /> 项目详情
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDeleteProject(project.id)}
              >
                <FiTrash2 className="icon" /> 删除项目
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 复用弹窗 */}
      {modalOpen && (
        <ModalForm
          title={modalTitle}
          fields={modalFields}
          initialData={initialData}
            onClose={() => setModalOpen(false)}
            onSubmit={(data) => {
              onSubmitCallback(data);
              setModalOpen(false);
            }}
        />
      )}
    </div>
  );
};

export default HomeContent;
