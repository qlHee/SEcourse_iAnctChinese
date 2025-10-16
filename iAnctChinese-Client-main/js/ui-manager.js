// js/ui-manager.js
// UI management and DOM manipulation

class UIManager {
    constructor() {
        this.currentView = 'home';
        this.currentProjectId = null;
        this.currentProjectName = '';
        
        // DOM elements
        this.elements = {
            homeContent: document.getElementById('home-content'),
            documentListContainer: document.getElementById('document-list-container'),
            documentEditor: document.getElementById('document-editor'),
            projectList: document.getElementById('project-list'),
            documentListContent: document.getElementById('document-list-content'),
            documentListTitle: document.getElementById('document-list-title'),
            editorButtons: document.getElementById('editor-buttons'),
            editorTitle: document.getElementById('editor-title'),
            editorDocName: document.getElementById('editor-doc-name'),
            editorAuthor: document.getElementById('editor-author'),
            editorCreatedAt: document.getElementById('editor-created-at'),
            documentContent: document.getElementById('document-content'),
            analyzeBtn: document.getElementById('analyze-btn'),
            analysisSection: document.getElementById('analysis-section'),
            runAnalysisBtn: document.getElementById('run-analysis-btn'),
            analysisStatus: document.getElementById('analysis-status'),
            analysisResult: document.getElementById('analysis-result'),
            entityAnnotator: document.getElementById('entity-annotator'),
            entityLabelSelect: document.getElementById('entity-label-select'),
            addEntityBtn: document.getElementById('add-entity-btn'),
            entityList: document.getElementById('entity-list'),
            segSection: document.getElementById('segmentation-section'),
            runSegBtn: document.getElementById('run-seg-btn'),
            copySegBtn: document.getElementById('copy-seg-btn'),
            segStatus: document.getElementById('seg-status'),
            segList: document.getElementById('seg-list'),
            saveStatus: document.getElementById('save-status'),
            autoSaveToggle: document.getElementById('auto-save-toggle')
        };
        
        // 自动保存设置 - 彻底关闭
        this.autoSaveEnabled = false;
        this.autoSaveTimer = null;
        
        // 搜索状态
        this.currentProjectSearch = '';
        this.currentDocumentSearch = '';
        
        // Initialize
        this.initializeEventListeners();
        this.renderProjects();
    }
    
    initializeEventListeners() {
        // Header buttons
        document.getElementById('language-btn').addEventListener('click', () => this.toggleLanguageDropdown());
        document.getElementById('save-document-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveDocument();
        });
        document.getElementById('back-to-project-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.backToProject();
        });
        
        // 侧边栏保存按钮
        const sidebarSaveBtn = document.getElementById('save-document-sidebar-btn');
        if (sidebarSaveBtn) {
            sidebarSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveDocument();
            });
        }
        
        // 搜索功能
        const projectSearchInput = document.getElementById('project-search');
        if (projectSearchInput) {
            projectSearchInput.addEventListener('input', (e) => {
                this.currentProjectSearch = e.target.value;
                this.renderProjects();
            });
        }
        
        const documentSearchInput = document.getElementById('document-search');
        if (documentSearchInput) {
            documentSearchInput.addEventListener('input', (e) => {
                this.currentDocumentSearch = e.target.value;
                this.renderDocuments();
            });
        }
        
        // 自动保存已彻底关闭，移除切换功能
        if (this.elements.autoSaveToggle) {
            this.elements.autoSaveToggle.style.display = 'none';
        }
        
        // Home content buttons
        document.getElementById('create-project-btn').addEventListener('click', () => this.showCreateProjectModal());
        
        // Document list buttons
        document.getElementById('create-document-btn').addEventListener('click', () => this.showCreateDocumentModal());
        document.getElementById('import-document-btn').addEventListener('click', () => this.showImportDocumentModal());
        document.getElementById('back-to-projects-btn').addEventListener('click', () => this.showHomeView());
        
        // Editor content
        document.getElementById('document-content').addEventListener('input', (e) => {
            dataManager.setEditingContent(e.target.value);
            this.onContentChange();
        });
        
        document.getElementById('editor-author').addEventListener('input', (e) => {
            dataManager.setEditingAuthor(e.target.value);
            this.onContentChange();
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Analyze actions
        if (this.elements.analyzeBtn) {
            this.elements.analyzeBtn.addEventListener('click', () => this.runClassicalAnalysis());
        }
        if (this.elements.runAnalysisBtn) {
            this.elements.runAnalysisBtn.addEventListener('click', () => this.runClassicalAnalysis());
        }

        // Entity annotation actions
        if (this.elements.addEntityBtn) {
            this.elements.addEntityBtn.addEventListener('click', () => this.addSelectedEntity());
        }

        // Segmentation actions
        if (this.elements.runSegBtn) {
            this.elements.runSegBtn.addEventListener('click', () => this.runSegmentation());
        }
        if (this.elements.copySegBtn) {
            this.elements.copySegBtn.addEventListener('click', () => this.copySegmentation());
        }
        
        // Language dropdown
        document.querySelectorAll('.lang-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectLanguage(e.target.dataset.lang));
        });
        
        // Click outside to close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.lang-wrapper')) {
                this.closeLanguageDropdown();
            }
        });
        
        // Listen to data changes
        dataManager.on('projectsChanged', () => {
            // 只在主页视图时渲染项目列表
            if (this.currentView === 'home') {
                this.renderProjects();
            }
        });
        dataManager.on('documentsChanged', () => {
            // 只在文档列表视图时渲染文档列表
            if (this.currentView === 'documents') {
                this.renderDocuments();
            }
        });
        dataManager.on('editingStateChanged', (data) => this.updateEditorState(data));
    }
    
    // View management
    showHomeView() {
        this.currentView = 'home';
        this.currentProjectId = null;
        this.currentProjectName = '';
        
        // 清除搜索状态
        this.currentProjectSearch = '';
        this.currentDocumentSearch = '';
        const projectSearchInput = document.getElementById('project-search');
        if (projectSearchInput) projectSearchInput.value = '';
        const documentSearchInput = document.getElementById('document-search');
        if (documentSearchInput) documentSearchInput.value = '';
        
        this.elements.homeContent.style.display = 'block';
        this.elements.documentListContainer.style.display = 'none';
        this.elements.documentEditor.style.display = 'none';
        this.elements.editorButtons.style.display = 'none';
        
        this.renderProjects();
    }
    
    showDocumentListView(projectId, projectName) {
        this.currentView = 'documents';
        this.currentProjectId = projectId;
        this.currentProjectName = projectName;
        
        // 清除文档搜索状态
        this.currentDocumentSearch = '';
        const documentSearchInput = document.getElementById('document-search');
        if (documentSearchInput) documentSearchInput.value = '';
        
        this.elements.homeContent.style.display = 'none';
        this.elements.documentListContainer.style.display = 'block';
        this.elements.documentEditor.style.display = 'none';
        this.elements.editorButtons.style.display = 'none';
        
        this.elements.documentListTitle.textContent = `${projectName} 的文档列表`;
        this.renderDocuments();
    }
    
    showDocumentEditor(docId) {
        this.currentView = 'editor';
        
        this.elements.homeContent.style.display = 'none';
        this.elements.documentListContainer.style.display = 'none';
        this.elements.documentEditor.style.display = 'block';
        this.elements.editorButtons.style.display = 'flex';
        
        dataManager.setEditingDocId(docId);
        
        // 防止路由系统干扰编辑器
        window.history.replaceState({ view: 'editor', docId }, '', window.location.href);
    }
    
    // Project rendering
    renderProjects() {
        // 只在主页视图时渲染
        if (this.currentView !== 'home') return;
        
        // 使用搜索功能过滤项目
        const projects = dataManager.searchProjects(this.currentProjectSearch);
        const projectList = this.elements.projectList;
        
        if (projects.length === 0) {
            if (this.currentProjectSearch) {
                projectList.innerHTML = `
                    <div class="empty-state">
                        <h3>未找到匹配的项目</h3>
                        <p>没有找到包含 "${this.currentProjectSearch}" 的项目</p>
                        <div style="margin-top: 20px;">
                            <button class="action-btn" onclick="document.getElementById('project-search').value=''; uiManager.currentProjectSearch=''; uiManager.renderProjects();">
                                <i data-feather="x"></i> 清除搜索
                            </button>
                        </div>
                    </div>
                `;
            } else {
                projectList.innerHTML = `
                    <div class="empty-state">
                        <h3>欢迎使用 iAnctChinese-Client！</h3>
                        <p>您还没有创建任何项目，点击右上角的"新建项目"按钮开始创建您的第一个项目吧！</p>
                        <div style="margin-top: 20px;">
                            <button class="create-btn" onclick="uiManager.showCreateProjectModal()">
                                <i data-feather="plus"></i> 创建第一个项目
                            </button>
                        </div>
                    </div>
                `;
            }
            // Re-initialize feather icons for the empty state
            feather.replace();
            return;
        }
        
        projectList.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-info">
                    <div class="project-title-row">
                        <span class="project-name">${sanitizeHTML(project.name)}</span>
                        <span class="project-detail">${sanitizeHTML(project.description)}</span>
                    </div>
                    <span class="project-date">${project.createdAt}</span>
                </div>
                <div class="project-actions">
                    <button class="action-btn" onclick="uiManager.showDocumentListView('${project.id}', '${sanitizeHTML(project.name)}')">
                        <i data-feather="folder"></i> 打开项目
                    </button>
                    <button class="action-btn" onclick="uiManager.showProjectDetails('${project.id}')">
                        <i data-feather="info"></i> 项目详情
                    </button>
                    <button class="action-btn delete-btn" onclick="uiManager.deleteProject('${project.id}')">
                        <i data-feather="trash-2"></i> 删除项目
                    </button>
                </div>
            </div>
        `).join('');
        
        // Re-initialize feather icons
        feather.replace();
    }
    
    // Document rendering
    renderDocuments() {
        // 只在文档列表视图时渲染，避免在编辑器视图时干扰
        if (!this.currentProjectId || this.currentView !== 'documents') return;
        
        // 使用搜索功能过滤文档
        const documents = dataManager.searchDocuments(this.currentDocumentSearch, this.currentProjectId);
        const documentListContent = this.elements.documentListContent;
        
        if (documents.length === 0) {
            if (this.currentDocumentSearch) {
                documentListContent.innerHTML = `
                    <div class="empty-state">
                        <h3>未找到匹配的文档</h3>
                        <p>没有找到包含 "${this.currentDocumentSearch}" 的文档</p>
                        <div style="margin-top: 20px;">
                            <button class="action-btn" onclick="document.getElementById('document-search').value=''; uiManager.currentDocumentSearch=''; uiManager.renderDocuments();">
                                <i data-feather="x"></i> 清除搜索
                            </button>
                        </div>
                    </div>
                `;
            } else {
                documentListContent.innerHTML = `
                    <div class="empty-state">
                        <h3>项目还没有文档</h3>
                        <p>您可以通过以下方式添加文档：</p>
                        <ul style="text-align: left; margin: 20px 0;">
                            <li>点击"新建文档"创建空白文档</li>
                            <li>点击"导入文档"上传本地文件</li>
                        </ul>
                        <div style="margin-top: 20px;">
                            <button class="action-btn" onclick="uiManager.showCreateDocumentModal()">
                                <i data-feather="plus"></i> 新建文档
                            </button>
                            <button class="action-btn" onclick="uiManager.showImportDocumentModal()">
                                <i data-feather="upload"></i> 导入文档
                            </button>
                        </div>
                    </div>
                `;
            }
            // Re-initialize feather icons for the empty state
            feather.replace();
            return;
        }
        
        documentListContent.innerHTML = documents.map(doc => `
            <div class="document-card">
                <div class="document-info">
                    <div class="document-title-row">
                        <span class="document-title">${sanitizeHTML(doc.name)}</span>
                        <span class="document-detail">${sanitizeHTML(doc.description || '')}</span>
                    </div>
                    <span class="document-meta">${doc.createdAt}</span>
                </div>
                <div class="document-actions">
                    <button class="doc-btn" onclick="uiManager.showDocumentEditor('${doc.id}')">
                        <i data-feather="folder"></i> 打开文档
                    </button>
                    <button class="doc-btn" onclick="uiManager.showDocumentDetails('${doc.id}')">
                        <i data-feather="info"></i> 文档详情
                    </button>
                    <button class="doc-btn" onclick="uiManager.showCopyDocumentModal('${doc.id}')">
                        <i data-feather="copy"></i> 复制文档
                    </button>
                    <button class="doc-btn delete-btn" onclick="uiManager.deleteDocument('${doc.id}')">
                        <i data-feather="trash-2"></i> 删除文档
                    </button>
                </div>
            </div>
        `).join('');
        
        // Re-initialize feather icons
        feather.replace();
    }
    
    // Editor state management
    updateEditorState(data) {
        if (data.editingDocId) {
            const doc = dataManager.getDocument(data.editingDocId);
            if (doc) {
                this.elements.editorDocName.textContent = doc.name;
                this.elements.editorCreatedAt.textContent = doc.createdAt;
                this.elements.documentContent.value = doc.content || '';
                this.elements.editorAuthor.value = doc.author || '';
            }
        }
    }
    
    // Tab management
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        dataManager.setActiveTab(tabName);
        
        // Update editor content based on tab
        this.updateEditorContentForTab(tabName);
    }
    
    updateEditorContentForTab(tabName) {
        const content = this.elements.documentContent;
        
        switch (tabName) {
            case '实体标注':
                content.placeholder = '请输入实体标注内容...';
                this.toggleAnalysisSection(false);
                this.toggleEntitySection(true);
                this.toggleSegSection(false);  // 关闭自动分词面板
                break;
            case '古文解析':
                content.placeholder = '请输入需要解析的古文内容...';
                this.toggleAnalysisSection(true);
                this.toggleEntitySection(false);
                this.toggleSegSection(false);
                break;
            case '自动分词':
                content.placeholder = '请输入需要进行分词的内容...';
                this.toggleAnalysisSection(false);
                this.toggleEntitySection(false);
                this.toggleSegSection(true);
                break;
        }
    }

    toggleAnalysisSection(show) {
        if (!this.elements.analysisSection) return;
        this.elements.analysisSection.style.display = show ? 'block' : 'none';
        if (!show) {
            if (this.elements.analysisStatus) this.elements.analysisStatus.style.display = 'none';
        }
    }

    toggleSegSection(show) {
        if (!this.elements.segSection) return;
        this.elements.segSection.style.display = show ? 'block' : 'none';
        if (!show && this.elements.segStatus) this.elements.segStatus.style.display = 'none';
    }

    async runSegmentation() {
        const text = this.elements.documentContent?.value || '';
        if (!text.trim()) {
            this.showToast('请输入文本后再分词', 'warning');
            return;
        }
        if (this.elements.segStatus) this.elements.segStatus.style.display = 'block';
        if (this.elements.segList) this.elements.segList.innerHTML = '';
        try {
            const tokens = await this.callSegmentAPI(text);
            this.renderSegList(tokens);
            this.showToast('分词完成', 'success');
        } catch (err) {
            console.error(err);
            this.showToast(`分词失败：${err.message || err}`, 'error');
        } finally {
            if (this.elements.segStatus) this.elements.segStatus.style.display = 'none';
        }
    }

    async callSegmentAPI(text) {
        const endpoint = (window.IANCT_SEG_BASE || 'http://localhost:5001') + '/api/segment';
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!resp.ok) {
            let detail = '';
            try { detail = (await resp.json()).error || ''; } catch {}
            throw new Error(detail || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return Array.isArray(data.tokens) ? data.tokens : [];
    }

    renderSegList(tokens) {
        if (!this.elements.segList) return;
        if (!Array.isArray(tokens) || tokens.length === 0) {
            this.elements.segList.textContent = '（无分词结果）';
            return;
        }
        const html = tokens.map((t, i) => {
            const text = sanitizeHTML(t.text || '');
            const title = `起:${t.start} 止:${t.end}`;
            return `<span class="seg-token" title="${title}" data-start="${t.start}" data-end="${t.end}" style="display:inline-block;margin:3px 6px 3px 0;padding:2px 6px;border-radius:12px;background:#eef2ff;color:#1d4ed8;cursor:pointer;">${text}</span>`;
        }).join('');
        this.elements.segList.innerHTML = html;
        // click to copy token or future actions
        this.elements.segList.querySelectorAll('.seg-token').forEach(el => {
            el.addEventListener('click', () => {
                const token = el.textContent || '';
                navigator.clipboard.writeText(token).then(() => this.showToast(`已复制：${token}`, 'info'));
            });
        });
    }

    async copySegmentation() {
        if (!this.elements.segList) return;
        const tokens = Array.from(this.elements.segList.querySelectorAll('.seg-token')).map(el => el.textContent || '');
        if (tokens.length === 0) {
            this.showToast('暂无可复制的分词结果', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(tokens.join(' '));
            this.showToast('已复制分词序列', 'success');
        } catch (err) {
            this.showToast('复制失败', 'error');
        }
    }
    async runClassicalAnalysis() {
        const text = this.elements.documentContent?.value?.trim() || '';
        if (!text) {
            this.showToast('请输入需要解析的古文内容', 'warning');
            return;
        }
        if (this.elements.analysisStatus) this.elements.analysisStatus.style.display = 'block';
        if (this.elements.analysisResult) this.elements.analysisResult.textContent = '——';

        try {
            const result = await this.callAnalyzeAPI(text);
            if (this.elements.analysisResult) {
                this.elements.analysisResult.innerHTML = this.formatResultHTML(result);
            }
            this.showToast('解析完成', 'success');
        } catch (err) {
            console.error(err);
            this.showToast(`解析失败：${err.message || err}`, 'error');
        } finally {
            if (this.elements.analysisStatus) this.elements.analysisStatus.style.display = 'none';
        }
    }

    toggleEntitySection(show) {
        if (!this.elements.entityAnnotator) return;
        this.elements.entityAnnotator.style.display = show ? 'block' : 'none';
        if (show) {
            this.renderEntityList();
        }
    }

    addSelectedEntity() {
        const textarea = this.elements.documentContent;
        if (!textarea || !dataManager.editingDocId) return;
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        if (selectionEnd <= selectionStart) {
            this.showToast('请先选中文本再打标', 'warning');
            return;
        }
        const label = this.elements.entityLabelSelect ? this.elements.entityLabelSelect.value : '实体';
        const updated = dataManager.addEntityAnnotation(dataManager.editingDocId, { start: selectionStart, end: selectionEnd, label });
        if (updated) {
            this.renderEntityList();
            this.showToast('已添加实体标注', 'success');
        }
    }

    deleteEntity(index) {
        if (!dataManager.editingDocId) return;
        const updated = dataManager.deleteEntityAnnotation(dataManager.editingDocId, index);
        if (updated) {
            this.renderEntityList();
            this.showToast('已删除实体标注', 'success');
        }
    }

    renderEntityList() {
        if (!this.elements.entityList || !dataManager.editingDocId) return;
        const annotations = dataManager.getEntityAnnotations(dataManager.editingDocId);
        const text = this.elements.documentContent ? this.elements.documentContent.value : '';
        this.elements.entityList.innerHTML = annotations.map((ann, idx) => {
            const raw = text.slice(ann.start, ann.end);
            const snippet = sanitizeHTML(raw);
            const title = `起:${ann.start} 止:${ann.end}`;
            return `
                <div class="entity-item" style="display:flex;align-items:center;justify-content:space-between;margin:4px 0;padding:4px 6px;border-radius:6px;background:#fff;border:1px solid #e5e7eb;" title="${title}">
                    <div style="font-size:12px;color:#374151;">
                        <span style="background:#e0f2fe;color:#0369a1;border-radius:4px;padding:1px 4px;margin-right:6px;">${sanitizeHTML(ann.label)}</span>
                        <span style="background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 4px;">“${snippet}”</span>
                    </div>
                    <button class="doc-btn delete-btn" onclick="uiManager.deleteEntity(${idx})" style="margin-left:8px;">
                        <i data-feather="trash-2"></i>
                    </button>
                </div>
            `;
        }).join('');
        feather.replace();
    }
    async callAnalyzeAPI(text) {
        const endpoint = (window.IANCT_API_BASE || 'http://localhost:5007') + '/api/analyze';
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!resp.ok) {
            let detail = '';
            try { detail = (await resp.json()).error || ''; } catch {}
            throw new Error(detail || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return data.result || '';
    }

    formatResultHTML(text) {
        if (!text) return '';
        return text
            .replace(/(\d+\.\s+.+?)(?=\n\d+\.|$)/gs, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
    
    // Language management
    toggleLanguageDropdown() {
        const dropdown = document.getElementById('language-dropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
    
    closeLanguageDropdown() {
        document.getElementById('language-dropdown').style.display = 'none';
    }
    
    selectLanguage(lang) {
        document.getElementById('language-btn').textContent = lang;
        this.closeLanguageDropdown();
        // TODO: Implement actual language switching
    }
    
    // Project actions
    showCreateProjectModal() {
        this.showModal('新建项目', [
            { name: 'name', label: '项目名称', type: 'text', required: true },
            { name: 'description', label: '项目描述', type: 'textarea' }
        ], (data) => {
            dataManager.addProject(data);
            this.showToast('项目创建成功', 'success');
        });
    }
    
    showProjectDetails(projectId) {
        const project = dataManager.getProject(projectId);
        if (!project) return;
        
        this.showModal('项目详情', [
            { name: 'name', label: '项目名称', type: 'text' },
            { name: 'description', label: '项目描述', type: 'textarea' },
            { name: 'createdAt', label: '创建时间', type: 'text', readOnly: true },
            { name: 'updatedAt', label: '更新时间', type: 'text', readOnly: true }
        ], (data) => {
            dataManager.updateProject(projectId, data);
            this.showToast('项目更新成功', 'success');
        }, project);
    }
    
    deleteProject(projectId) {
        if (confirm('确定删除该项目吗？这将同时删除项目下的所有文档。')) {
            dataManager.deleteProject(projectId);
            this.showToast('项目删除成功', 'success');
            if (this.currentProjectId === projectId) {
                this.showHomeView();
            }
        }
    }
    
    // Document actions
    showCreateDocumentModal() {
        if (!this.currentProjectId) return;
        
        this.showModal('新建文档', [
            { name: 'name', label: '文档名称', type: 'text', required: true },
            { name: 'description', label: '文档描述', type: 'textarea' }
        ], (data) => {
            dataManager.addDocument({
                projectId: this.currentProjectId,
                ...data
            });
            this.showToast('文档创建成功', 'success');
        });
    }
    
    showDocumentDetails(docId) {
        const doc = dataManager.getDocument(docId);
        if (!doc) return;
        
        this.showModal('文档详情', [
            { name: 'name', label: '文档名称', type: 'text' },
            { name: 'description', label: '文档描述', type: 'textarea' },
            { name: 'createdAt', label: '创建时间', type: 'text', readOnly: true },
            { name: 'updatedAt', label: '更新时间', type: 'text', readOnly: true }
        ], (data) => {
            dataManager.updateDocument(docId, data);
            this.showToast('文档更新成功', 'success');
        }, doc);
    }
    
    showCopyDocumentModal(docId) {
        const doc = dataManager.getDocument(docId);
        if (!doc) return;
        
        this.showModal(`复制：${doc.name}`, [
            { name: 'name', label: '新名称', type: 'text', required: true }
        ], (data) => {
            dataManager.addDocument({
                projectId: doc.projectId,
                name: data.name,
                description: doc.description,
                content: doc.content,
                author: doc.author
            });
            this.showToast('文档复制成功', 'success');
        }, { name: `${doc.name} - 复制` });
    }
    
    deleteDocument(docId) {
        if (confirm('确定删除该文档吗？')) {
            dataManager.deleteDocument(docId);
            this.showToast('文档删除成功', 'success');
        }
    }
    
    showDocumentEditor(docId) {
        this.currentView = 'editor';
        
        this.elements.homeContent.style.display = 'none';
        this.elements.documentListContainer.style.display = 'none';
        this.elements.documentEditor.style.display = 'block';
        this.elements.editorButtons.style.display = 'flex';
        
        dataManager.setEditingDocId(docId);
    }
    
    async saveDocument() {
        try {
            // 确保当前在编辑器视图
            if (this.currentView !== 'editor') {
                console.warn('不在编辑器视图，跳过保存');
                return;
            }
            
            const savedDoc = await dataManager.saveEditingDocument();
            if (savedDoc) {
                this.showToast('文档保存成功', 'success');
                this.showSaveStatus();
                
                // 强制确保留在编辑器页面
                this.currentView = 'editor';
                this.elements.homeContent.style.display = 'none';
                this.elements.documentListContainer.style.display = 'none';
                this.elements.documentEditor.style.display = 'block';
                this.elements.editorButtons.style.display = 'flex';
            } else {
                this.showToast('保存失败', 'error');
            }
        } catch (error) {
            console.error('保存文档错误:', error);
            this.showToast('保存失败: ' + error.message, 'error');
        }
    }
    
    // 显示保存状态
    showSaveStatus() {
        if (this.elements.saveStatus) {
            this.elements.saveStatus.style.display = 'block';
            setTimeout(() => {
                this.elements.saveStatus.style.display = 'none';
            }, 2000);
        }
    }
    
    // 内容变化时的处理
    onContentChange() {
        // 隐藏保存状态
        if (this.elements.saveStatus) {
            this.elements.saveStatus.style.display = 'none';
        }
        
        // 自动保存已彻底关闭，仅显示保存提示
        // 用户需要手动点击保存按钮
    }
    
    // 自动保存功能已彻底移除
    
    async backToProject() {
        // 设置内部导航标志，避免触发弹窗
        if (window.app) {
            window.app.isNavigatingInternally = true;
        }
        
        // 保存当前编辑的内容
        if (dataManager.editingDocId) {
            await dataManager.saveEditingDocument();
        }
        this.showDocumentListView(this.currentProjectId, this.currentProjectName);
        
        // 重置内部导航标志
        setTimeout(() => {
            if (window.app) {
                window.app.isNavigatingInternally = false;
            }
        }, 100);
    }
    
    // Import document modal
    showImportDocumentModal() {
        const modal = document.getElementById('import-modal-overlay');
        modal.style.display = 'flex';
        
        // Setup file input
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        const fileList = document.getElementById('file-list');
        let selectedFiles = [];
        
        // File selection
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            selectedFiles = Array.from(e.target.files);
            this.updateFileList(selectedFiles);
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            selectedFiles = Array.from(e.dataTransfer.files);
            this.updateFileList(selectedFiles);
        });
        
        // Submit
        document.getElementById('import-submit').onclick = async () => {
            if (selectedFiles.length === 0) {
                this.showToast('请选择要导入的文件', 'warning');
                return;
            }
            
            const ids = await dataManager.importDocuments(selectedFiles, this.currentProjectId);
            this.showToast(`成功导入 ${ids.length} 个文档`, 'success');
            modal.style.display = 'none';
        };
        
        // Cancel
        document.getElementById('import-cancel').onclick = () => {
            modal.style.display = 'none';
        };
        
        // Close button
        document.getElementById('import-modal-close').onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    updateFileList(files) {
        const fileList = document.getElementById('file-list');
        
        if (files.length === 0) {
            fileList.style.display = 'none';
            return;
        }
        
        fileList.style.display = 'block';
        fileList.innerHTML = files.map(file => `
            <div class="file-item">
                <span class="file-name">${sanitizeHTML(file.name)}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
        `).join('');
    }
    
    // Modal management
    showModal(title, fields, onSubmit, initialData = {}) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = title;
        
        // Create form fields
        modalBody.innerHTML = fields.map(field => `
            <div class="modal-field">
                <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                ${field.type === 'textarea' 
                    ? `<textarea id="${field.name}" name="${field.name}" ${field.readOnly ? 'readonly' : ''} ${field.required ? 'required' : ''}>${initialData[field.name] || ''}</textarea>`
                    : `<input type="${field.type}" id="${field.name}" name="${field.name}" value="${initialData[field.name] || ''}" ${field.readOnly ? 'readonly' : ''} ${field.required ? 'required' : ''}>`
                }
            </div>
        `).join('');
        
        // Show modal
        modal.style.display = 'flex';
        
        // Setup submit handler
        const submitHandler = () => {
            const formData = {};
            let isValid = true;
            
            fields.forEach(field => {
                const element = document.getElementById(field.name);
                const value = field.type === 'textarea' ? element.value : element.value;
                
                if (field.required && !isRequired(value)) {
                    isValid = false;
                    element.style.borderColor = '#ef4444';
                } else {
                    element.style.borderColor = '#d1d5db';
                }
                
                formData[field.name] = value;
            });
            
            if (isValid) {
                onSubmit(formData);
                modal.style.display = 'none';
            } else {
                this.showToast('请填写所有必填字段', 'error');
            }
        };
        
        // Event listeners
        document.getElementById('modal-submit').onclick = submitHandler;
        document.getElementById('modal-cancel').onclick = () => {
            modal.style.display = 'none';
        };
        document.getElementById('modal-close').onclick = () => {
            modal.style.display = 'none';
        };
        
        // Enter key support
        modalBody.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                submitHandler();
            }
        });
    }
    
    // Toast notifications
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        toast.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 240);
        }, 3000);
        
        // Manual close
        document.getElementById('toast-close').onclick = () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 240);
        };
    }
}

// Create global instance after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});
