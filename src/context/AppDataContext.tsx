import React, { createContext, useContext, useEffect, useState } from 'react';

// Use browser crypto.randomUUID when available, otherwise fallback to a small UUIDv4 generator.
const uuidv4 = () => {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      // @ts-ignore - lib.dom provides crypto.randomUUID in modern environments
      return (crypto as any).randomUUID();
    }
  } catch {}
  // fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  content?: string;
  author?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AppDataContextType {
  projects: Project[];
  documents: Document[];
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addDocument: (d: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  importDocuments: (files: File[], projectId: string) => Promise<string[]>;
  // Editor UI state (global)
  editingDocId: string | null;
  setEditingDocId: (id: string | null) => void;
  editingContent: string;
  setEditingContent: (c: string) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  editingAuthor: string;
  setEditingAuthor: (a: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const PROJECTS_KEY = 'appdata_projects_v1';
const DOCUMENTS_KEY = 'appdata_documents_v1';

const defaultProjects: Project[] = [
  { id: uuidv4(), name: '项目A', description: '描述A', createdAt: '2025-09-01', updatedAt: '2025-09-05' },
  { id: uuidv4(), name: '项目B', description: '描述B', createdAt: '2025-09-05', updatedAt: '2025-09-07' },
  { id: uuidv4(), name: '项目C', description: '描述C', createdAt: '2025-09-10', updatedAt: '2025-09-12' },
];

const defaultDocuments: Document[] = [
  { id: uuidv4(), projectId: defaultProjects[0].id, name: '文档1', description: '这是文档1', createdAt: '2025-09-01', updatedAt: '2025-09-03' },
  { id: uuidv4(), projectId: defaultProjects[0].id, name: '文档2', description: '这是文档2', createdAt: '2025-09-05', updatedAt: '2025-09-07' },
  { id: uuidv4(), projectId: defaultProjects[1].id, name: '文档3', description: '这是文档3', createdAt: '2025-09-10', updatedAt: '2025-09-12' },
];

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(PROJECTS_KEY);
      return raw ? JSON.parse(raw) : defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const raw = localStorage.getItem(DOCUMENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        // migrate: ensure projectId exists and types are string
        return parsed.map(p => ({
          ...p,
          id: typeof p.id === 'number' ? String(p.id) : p.id || uuidv4(),
          projectId: typeof p.projectId === 'number' ? String(p.projectId) : (p.projectId ?? (projects[0]?.id ?? uuidv4())),
        }));
      }
      return defaultDocuments;
    } catch {
      return defaultDocuments;
    }
  });

  // Global editor UI state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('结构标注');
  const [editingAuthor, setEditingAuthor] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    } catch {}
  }, [documents]);

  const addProject = (p: Omit<Project, 'id' | 'createdAt'>) => {
    setProjects(prev => {
      const newProject: Project = {
        id: uuidv4(),
        name: p.name,
        description: p.description,
        createdAt: new Date().toISOString().split('T')[0],
      };
      return [...prev, newProject];
    });
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addDocument = (d: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    setDocuments(prev => {
      const newDoc: Document = {
        id: uuidv4(),
        projectId: d.projectId,
        name: d.name,
        description: d.description,
        content: d.content ?? '',
        author: d.author ?? '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return [...prev, newDoc];
    });
  };

  const updateDocument = (id: string, data: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, ...data, updatedAt: new Date().toISOString().split('T')[0] } : doc));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const importDocuments = async (files: File[], projectId: string) => {
    try {
      const filePromises = Array.from(files).map(async (file) => {
        try {
          const text = await (file as any).text();
          return { file, text };
        } catch (e) {
          return new Promise<{ file: File; text: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ file, text: String(reader.result ?? '') });
            reader.onerror = () => resolve({ file, text: '' });
            reader.readAsText(file, 'utf-8');
          });
        }
      });

      const results = await Promise.all(filePromises);

      const next: Document[] = results.map(({ file, text }) => ({
        id: uuidv4(),
        projectId,
        name: file.name,
        description: '',
        content: text,
        author: '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }));

      // debug log each imported file
      next.forEach(n => console.debug('[importDocuments] created doc', n.id, n.name, 'len=', (n.content || '').length));

      setDocuments(prev => [...prev, ...next]);

      return next.map(n => n.id);
    } catch (e) {
      console.error('importDocuments error', e);
      return [];
    }
  };

  return (
    <AppDataContext.Provider value={{
      projects, documents, addProject, updateProject, deleteProject, addDocument, updateDocument, deleteDocument, importDocuments,
      editingDocId, setEditingDocId, editingContent, setEditingContent, activeTab, setActiveTab, editingAuthor, setEditingAuthor
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};

export default AppDataContext;
