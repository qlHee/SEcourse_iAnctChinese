// js/data-manager.js
// Data management and local storage functionality

class DataManager {
    constructor() {
        this.PROJECTS_KEY = 'appdata_projects_v1';
        this.DOCUMENTS_KEY = 'appdata_documents_v1';
        
        // Initialize empty data - let users create their own projects and documents
        this.defaultProjects = [];
        this.defaultDocuments = [];
        
        // Load data from localStorage
        this.projects = this.loadProjects();
        this.documents = this.loadDocuments();
        
        // Editor state
        this.editingDocId = null;
        this.editingContent = '';
        this.editingAuthor = '';
        this.activeTab = '结构标注';
        
        // Event listeners
        this.listeners = new Map();
    }
    
    // Project management
    loadProjects() {
        try {
            const raw = localStorage.getItem(this.PROJECTS_KEY);
            return raw ? JSON.parse(raw) : [...this.defaultProjects];
        } catch (error) {
            console.error('Error loading projects:', error);
            return [...this.defaultProjects];
        }
    }
    
    saveProjects() {
        try {
            localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(this.projects));
            this.emit('projectsChanged', this.projects);
        } catch (error) {
            console.error('Error saving projects:', error);
        }
    }
    
    addProject(projectData) {
        const newProject = {
            id: generateUUID(),
            name: projectData.name,
            description: projectData.description,
            createdAt: getCurrentDate(),
            updatedAt: getCurrentDate()
        };
        
        this.projects.push(newProject);
        this.saveProjects();
        return newProject;
    }
    
    updateProject(id, data) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects[index] = {
                ...this.projects[index],
                ...data,
                updatedAt: getCurrentDate()
            };
            this.saveProjects();
            return this.projects[index];
        }
        return null;
    }
    
    deleteProject(id) {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projects.splice(index, 1);
            // Also delete related documents
            this.documents = this.documents.filter(d => d.projectId !== id);
            this.saveProjects();
            this.saveDocuments();
            return true;
        }
        return false;
    }
    
    getProject(id) {
        return this.projects.find(p => p.id === id);
    }
    
    // Document management
    loadDocuments() {
        try {
            const raw = localStorage.getItem(this.DOCUMENTS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Migrate: ensure projectId exists and types are string
                return parsed.map(doc => ({
                    ...doc,
                    id: typeof doc.id === 'number' ? String(doc.id) : doc.id || generateUUID(),
                    projectId: typeof doc.projectId === 'number' ? String(doc.projectId) : (doc.projectId ?? this.projects[0]?.id ?? generateUUID()),
                    entityAnnotations: Array.isArray(doc.entityAnnotations) ? doc.entityAnnotations : [],
                    relationAnnotations: Array.isArray(doc.relationAnnotations) ? doc.relationAnnotations : []
                }));
            }
            return [...this.defaultDocuments];
        } catch (error) {
            console.error('Error loading documents:', error);
            return [...this.defaultDocuments];
        }
    }
    
    saveDocuments() {
        try {
            localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(this.documents));
            this.emit('documentsChanged', this.documents);
        } catch (error) {
            console.error('Error saving documents:', error);
        }
    }
    
    addDocument(documentData) {
        const newDocument = {
            id: generateUUID(),
            projectId: documentData.projectId,
            name: documentData.name,
            description: documentData.description || '',
            content: documentData.content || '',
            author: documentData.author || '',
            entityAnnotations: [],
            relationAnnotations: [],
            createdAt: getCurrentDate(),
            updatedAt: getCurrentDate()
        };
        
        this.documents.push(newDocument);
        this.saveDocuments();
        return newDocument;
    }
    
    updateDocument(id, data) {
        const index = this.documents.findIndex(d => d.id === id);
        if (index !== -1) {
            this.documents[index] = {
                ...this.documents[index],
                ...data,
                updatedAt: getCurrentDate()
            };
            this.saveDocuments();
            return this.documents[index];
        }
        return null;
    }
    
    deleteDocument(id) {
        const index = this.documents.findIndex(d => d.id === id);
        if (index !== -1) {
            this.documents.splice(index, 1);
            this.saveDocuments();
            return true;
        }
        return false;
    }
    
    getDocument(id) {
        return this.documents.find(d => d.id === id);
    }
    
    getDocumentsByProject(projectId) {
        return this.documents.filter(d => d.projectId === projectId);
    }
    
    // Document import
    async importDocuments(files, projectId) {
        try {
            const filePromises = Array.from(files).map(async (file) => {
                try {
                    const text = await readFileAsText(file);
                    return { file, text };
                } catch (error) {
                    console.error('Error reading file:', file.name, error);
                    return { file, text: '' };
                }
            });
            
            const results = await Promise.all(filePromises);
            
            const newDocuments = results.map(({ file, text }) => ({
                id: generateUUID(),
                projectId,
                name: file.name,
                description: '',
                content: text,
                author: '',
                createdAt: getCurrentDate(),
                updatedAt: getCurrentDate()
            }));
            
            this.documents.push(...newDocuments);
            this.saveDocuments();
            
            return newDocuments.map(doc => doc.id);
        } catch (error) {
            console.error('Error importing documents:', error);
            return [];
        }
    }
    
    // Editor state management
    setEditingDocId(id) {
        this.editingDocId = id;
        if (id) {
            const doc = this.getDocument(id);
            if (doc) {
                this.editingContent = doc.content || '';
                this.editingAuthor = doc.author || '';
            }
        } else {
            this.editingContent = '';
            this.editingAuthor = '';
        }
        this.emit('editingStateChanged', { editingDocId: id });
    }
    
    setEditingContent(content) {
        this.editingContent = content;
        this.emit('editingContentChanged', content);
    }
    
    setEditingAuthor(author) {
        this.editingAuthor = author;
        this.emit('editingAuthorChanged', author);
    }
    
    setActiveTab(tab) {
        this.activeTab = tab;
        this.emit('activeTabChanged', tab);
    }
    
    saveEditingDocument() {
        if (this.editingDocId) {
            return this.updateDocument(this.editingDocId, {
                content: this.editingContent,
                author: this.editingAuthor
            });
        }
        return null;
    }

    // Entity annotations
    addEntityAnnotation(docId, annotation) {
        const doc = this.getDocument(docId);
        if (!doc) return null;
        const start = Math.max(0, Math.min(annotation.start, annotation.end));
        const end = Math.max(annotation.start, annotation.end);
        if (end <= start) return null;
        const normalized = {
            start,
            end,
            label: annotation.label || '实体'
        };
        doc.entityAnnotations = Array.isArray(doc.entityAnnotations) ? doc.entityAnnotations : [];
        doc.entityAnnotations.push(normalized);
        return this.updateDocument(docId, { entityAnnotations: doc.entityAnnotations });
    }

    deleteEntityAnnotation(docId, index) {
        const doc = this.getDocument(docId);
        if (!doc || !Array.isArray(doc.entityAnnotations)) return null;
        if (index < 0 || index >= doc.entityAnnotations.length) return null;
        doc.entityAnnotations.splice(index, 1);
        return this.updateDocument(docId, { entityAnnotations: doc.entityAnnotations });
    }

    getEntityAnnotations(docId) {
        const doc = this.getDocument(docId);
        return (doc && Array.isArray(doc.entityAnnotations)) ? doc.entityAnnotations : [];
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event callback:', error);
                }
            });
        }
    }
    
    // Utility methods
    exportData() {
        return {
            projects: this.projects,
            documents: this.documents,
            exportDate: getCurrentDate()
        };
    }
    
    importData(data) {
        try {
            if (data.projects && Array.isArray(data.projects)) {
                this.projects = data.projects;
                this.saveProjects();
            }
            if (data.documents && Array.isArray(data.documents)) {
                this.documents = data.documents;
                this.saveDocuments();
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    clearAllData() {
        this.projects = [...this.defaultProjects];
        this.documents = [...this.defaultDocuments];
        this.saveProjects();
        this.saveDocuments();
        this.setEditingDocId(null);
    }
}

// Create global instance
window.dataManager = new DataManager();
