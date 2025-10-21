// js/ui-manager.js
// UI management and DOM manipulation

class UIManager {
    constructor() {
        this.currentView = 'home';
        this.currentProjectId = null;
        this.currentProjectName = '';
        this.exportMode = false; // 导出模式标志
        this.currentLanguage = getCurrentLanguage(); // 当前语言
        
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
            autoSaveToggle: document.getElementById('auto-save-toggle'),
            qaInput: document.getElementById('qa-input'),
            qaSubmitBtn: document.getElementById('qa-submit-btn'),
            qaStatus: document.getElementById('qa-status'),
            qaHistory: document.getElementById('qa-history')
        };
        
        // 自动保存设置 - 彻底关闭
        this.autoSaveEnabled = false;
        this.autoSaveTimer = null;
        
        // 搜索状态
        this.currentProjectSearch = '';
        this.currentDocumentSearch = '';
        
        // Initialize
        this.initializeEventListeners();
        this.applyLanguage(); // 应用当前语言
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
        document.getElementById('select-all-docs-btn').addEventListener('click', () => this.toggleSelectAllDocs());
        document.getElementById('export-documents-btn').addEventListener('click', () => this.handleExportClick());
        document.getElementById('cancel-export-btn').addEventListener('click', () => this.cancelExportMode());
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

        // Q&A actions
        if (this.elements.qaSubmitBtn) {
            this.elements.qaSubmitBtn.addEventListener('click', () => this.submitQuestion());
        }
        if (this.elements.qaInput) {
            this.elements.qaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.submitQuestion();
            });
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
        
        // 退出导出模式
        if (this.exportMode) {
            this.cancelExportMode();
        }
        
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
        
        // 退出导出模式
        if (this.exportMode) {
            this.cancelExportMode();
        }
        
        // 清除文档搜索状态
        this.currentDocumentSearch = '';
        const documentSearchInput = document.getElementById('document-search');
        if (documentSearchInput) documentSearchInput.value = '';
        
        this.elements.homeContent.style.display = 'none';
        this.elements.documentListContainer.style.display = 'block';
        this.elements.documentEditor.style.display = 'none';
        this.elements.editorButtons.style.display = 'none';
        
        this.elements.documentListTitle.textContent = `${projectName} ${t('document_list')}`;
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
                        <h3>${t('no_matching_projects')}</h3>
                        <p>${t('no_projects_found')} "${this.currentProjectSearch}" 的项目</p>
                        <div style="margin-top: 20px;">
                            <button class="action-btn" onclick="document.getElementById('project-search').value=''; uiManager.currentProjectSearch=''; uiManager.renderProjects();">
                                <i data-feather="x"></i> ${t('clear_search')}
                            </button>
                        </div>
                    </div>
                `;
            } else {
                projectList.innerHTML = `
                    <div class="empty-state">
                        <h3>${t('welcome_title')}</h3>
                        <p>${t('welcome_desc')}</p>
                        <div style="margin-top: 20px;">
                            <button class="create-btn" onclick="uiManager.showCreateProjectModal()">
                                <i data-feather="plus"></i> ${t('create_first_project')}
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
                        <i data-feather="folder"></i> ${t('open_project')}
                    </button>
                    <button class="action-btn" onclick="uiManager.showProjectDetails('${project.id}')">
                        <i data-feather="info"></i> ${t('project_details')}
                    </button>
                    <button class="action-btn delete-btn" onclick="uiManager.deleteProject('${project.id}')">
                        <i data-feather="trash-2"></i> ${t('delete_project')}
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
                        <h3>${t('no_matching_documents')}</h3>
                        <p>${t('no_documents_found')} "${this.currentDocumentSearch}" 的文档</p>
                        <div style="margin-top: 20px;">
                            <button class="action-btn" onclick="document.getElementById('document-search').value=''; uiManager.currentDocumentSearch=''; uiManager.renderDocuments();">
                                <i data-feather="x"></i> ${t('clear_search')}
                            </button>
                        </div>
                    </div>
                `;
            } else {
                documentListContent.innerHTML = `
                    <div class="empty-state">
                        <h3>${t('no_documents')}</h3>
                        <p>${t('document_tips')}</p>
                        <ul style="text-align: left; margin: 20px 0;">
                            <li>${t('create_blank_document')}</li>
                            <li>${t('upload_local_file')}</li>
                        </ul>
                        <div style="margin-top: 20px;">
                            <button class="action-btn" onclick="uiManager.showCreateDocumentModal()">
                                <i data-feather="plus"></i> ${t('new_document')}
                            </button>
                            <button class="action-btn" onclick="uiManager.showImportDocumentModal()">
                                <i data-feather="upload"></i> ${t('import_document')}
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
                        <input type="checkbox" class="doc-export-checkbox" data-doc-id="${doc.id}" style="margin-right: 8px; display: none;">
                        <span class="document-title">${sanitizeHTML(doc.name)}</span>
                        <span class="document-detail">${sanitizeHTML(doc.description || '')}</span>
                    </div>
                    <span class="document-meta">${doc.createdAt}</span>
                </div>
                <div class="document-actions">
                    <button class="doc-btn" onclick="uiManager.showDocumentEditor('${doc.id}')">
                        <i data-feather="folder"></i> ${t('open_document')}
                    </button>
                    <button class="doc-btn" onclick="uiManager.showDocumentDetails('${doc.id}')">
                        <i data-feather="info"></i> ${t('document_details')}
                    </button>
                    <button class="doc-btn" onclick="uiManager.showCopyDocumentModal('${doc.id}')">
                        <i data-feather="copy"></i> ${t('copy_document')}
                    </button>
                    <button class="doc-btn delete-btn" onclick="uiManager.deleteDocument('${doc.id}')">
                        <i data-feather="trash-2"></i> ${t('delete_document')}
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
        
        // 匹配当前语言的标签名
        const entityTab = t('entity_annotation');
        const analysisTab = t('classical_analysis');
        const segTab = t('auto_segmentation');
        
        if (tabName === entityTab || tabName === '实体标注') {
            content.placeholder = t('enter_entity_content');
            this.toggleAnalysisSection(false);
            this.toggleEntitySection(true);
            this.toggleSegSection(false);  // 关闭自动分词面板
        } else if (tabName === analysisTab || tabName === '古文解析') {
            content.placeholder = t('enter_analysis_content');
            this.toggleAnalysisSection(true);
            this.toggleEntitySection(false);
            this.toggleSegSection(false);
        } else if (tabName === segTab || tabName === '自动分词') {
            content.placeholder = t('enter_segmentation_content');
            this.toggleAnalysisSection(false);
            this.toggleEntitySection(false);
            this.toggleSegSection(true);
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
            this.showToast(t('input_text_first'), 'warning');
            return;
        }
        if (this.elements.segStatus) this.elements.segStatus.style.display = 'block';
        if (this.elements.segList) this.elements.segList.innerHTML = '';
        try {
            const tokens = await this.callSegmentAPI(text);
            this.renderSegList(tokens);
            this.showToast(t('segmentation_complete'), 'success');
        } catch (err) {
            console.error(err);
            this.showToast(`${t('segmentation_complete').replace('完成', '失败').replace('complete', 'failed')}：${err.message || err}`, 'error');
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
            const lang = getCurrentLanguage();
            const msg = lang === 'English' ? '(No segmentation result)' :
                       lang === '繁體中文' ? '（無分詞結果）' : '（无分词结果）';
            this.elements.segList.textContent = msg;
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
                navigator.clipboard.writeText(token).then(() => this.showToast(`${t('copied')}：${token}`, 'info'));
            });
        });
    }

    async copySegmentation() {
        if (!this.elements.segList) return;
        const tokens = Array.from(this.elements.segList.querySelectorAll('.seg-token')).map(el => el.textContent || '');
        if (tokens.length === 0) {
            this.showToast(t('no_segmentation_result'), 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(tokens.join(' '));
            this.showToast(t('segmentation_copied'), 'success');
        } catch (err) {
            this.showToast(t('copy_failed'), 'error');
        }
    }
    async runClassicalAnalysis() {
        const text = this.elements.documentContent?.value?.trim() || '';
        if (!text) {
            this.showToast(t('input_analysis_text'), 'warning');
            return;
        }
        
        // 显示模型选择框
        const model = await this.showModelSelectDialog();
        if (!model) return; // 用户取消
        
        if (this.elements.analysisStatus) this.elements.analysisStatus.style.display = 'block';
        if (this.elements.analysisResult) this.elements.analysisResult.textContent = '——';

        try {
            const result = await this.callAnalyzeAPI(text, model);
            if (this.elements.analysisResult) {
                this.elements.analysisResult.innerHTML = this.formatResultHTML(result);
            }
            this.showToast(t('analysis_complete'), 'success');
        } catch (err) {
            console.error(err);
            this.showToast(`${t('analysis_complete').replace('完成', '失败').replace('complete', 'failed')}：${err.message || err}`, 'error');
        } finally {
            if (this.elements.analysisStatus) this.elements.analysisStatus.style.display = 'none';
        }
    }
    
    showModelSelectDialog() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
            dialog.innerHTML = `
                <div style="background:white;border-radius:12px;padding:24px;min-width:320px;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
                    <h3 style="margin:0 0 16px 0;color:#1f2937;font-size:18px;">${t('select_model')}</h3>
                    <div style="margin-bottom:20px;">
                        <label style="display:block;margin-bottom:12px;cursor:pointer;padding:12px;border:2px solid #e5e7eb;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e5e7eb'">
                            <input type="radio" name="model" value="deepseek-chat" checked style="margin-right:8px;">
                            <strong>${t('model_v3')}</strong> <span style="color:#10b981;font-size:12px;">${t('recommended')}</span>
                            <div style="font-size:13px;color:#6b7280;margin-top:4px;margin-left:24px;">${t('model_v3_desc')}</div>
                        </label>
                        <label style="display:block;cursor:pointer;padding:12px;border:2px solid #e5e7eb;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e5e7eb'">
                            <input type="radio" name="model" value="deepseek-reasoner" style="margin-right:8px;">
                            <strong>${t('model_r1')}</strong>
                            <div style="font-size:13px;color:#6b7280;margin-top:4px;margin-left:24px;">${t('model_r1_desc')}</div>
                        </label>
                    </div>
                    <div style="display:flex;gap:12px;justify-content:flex-end;">
                        <button id="model-cancel" style="padding:8px 20px;border:1px solid #d1d5db;background:white;border-radius:6px;cursor:pointer;font-size:14px;">${t('cancel')}</button>
                        <button id="model-confirm" style="padding:8px 20px;border:none;background:#3b82f6;color:white;border-radius:6px;cursor:pointer;font-size:14px;">${t('confirm')}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
            
            dialog.querySelector('#model-confirm').onclick = () => {
                const selected = dialog.querySelector('input[name="model"]:checked');
                document.body.removeChild(dialog);
                resolve(selected ? selected.value : null);
            };
            dialog.querySelector('#model-cancel').onclick = () => {
                document.body.removeChild(dialog);
                resolve(null);
            };
            dialog.onclick = (e) => {
                if (e.target === dialog) {
                    document.body.removeChild(dialog);
                    resolve(null);
                }
            };
        });
    }

    async submitQuestion() {
        const question = this.elements.qaInput?.value?.trim() || '';
        if (!question) {
            this.showToast(t('input_question'), 'warning');
            return;
        }

        const text = this.elements.documentContent?.value?.trim() || '';
        if (!text) {
            this.showToast(t('input_classical_text_first'), 'warning');
            return;
        }

        // 显示模型选择框
        const model = await this.showModelSelectDialog();
        if (!model) return; // 用户取消

        if (this.elements.qaStatus) this.elements.qaStatus.style.display = 'block';

        try {
            const result = await this.callQAAPI(text, question, model);
            this.addQuestionToHistory(question, result);
            this.elements.qaInput.value = ''; // 清空输入框
            this.showToast(t('qa_complete'), 'success');
        } catch (err) {
            console.error(err);
            this.showToast(`${t('qa_complete').replace('完成', '失败').replace('complete', 'failed')}：${err.message || err}`, 'error');
        } finally {
            if (this.elements.qaStatus) this.elements.qaStatus.style.display = 'none';
        }
    }

    async callQAAPI(text, question, model) {
        const endpoint = (window.IANCT_API_BASE || 'http://localhost:5004') + '/api/qa';
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, question, model })
        });
        if (!resp.ok) {
            let detail = '';
            try { detail = (await resp.json()).error || ''; } catch {}
            throw new Error(detail || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        return data.result || '';
    }

    addQuestionToHistory(question, answer) {
        if (!this.elements.qaHistory) return;

        // 如果是首次提问，清空占位符
        const placeholder = this.elements.qaHistory.querySelector('div[style*="color:#9ca3af"]');
        if (placeholder) {
            this.elements.qaHistory.innerHTML = '';
        }

        const qaItem = document.createElement('div');
        qaItem.style.cssText = 'margin-bottom:12px;padding:8px;background:#fff;border-radius:6px;border:1px solid #e5e7eb;';
        qaItem.innerHTML = `
            <div style="font-size:13px;color:#3b82f6;font-weight:bold;margin-bottom:4px;">
                <i data-feather="message-circle" style="width:14px;height:14px;"></i> 问：${this.escapeHTML(question)}
            </div>
            <div style="font-size:13px;color:#374151;line-height:1.5;white-space:pre-wrap;">${this.escapeHTML(answer)}</div>
        `;
        this.elements.qaHistory.appendChild(qaItem);
        feather.replace();

        // 滚动到底部
        this.elements.qaHistory.scrollTop = this.elements.qaHistory.scrollHeight;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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
            this.showToast(t('select_text_first'), 'warning');
            return;
        }
        const label = this.elements.entityLabelSelect ? this.elements.entityLabelSelect.value : t('other');
        const updated = dataManager.addEntityAnnotation(dataManager.editingDocId, { start: selectionStart, end: selectionEnd, label });
        if (updated) {
            this.renderEntityList();
            this.showToast(t('entity_added'), 'success');
        }
    }

    deleteEntity(index) {
        if (!dataManager.editingDocId) return;
        const updated = dataManager.deleteEntityAnnotation(dataManager.editingDocId, index);
        if (updated) {
            this.renderEntityList();
            this.showToast(t('entity_deleted'), 'success');
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
    async callAnalyzeAPI(text, model) {
        const endpoint = (window.IANCT_API_BASE || 'http://localhost:5004') + '/api/analyze';
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, model })
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
        this.currentLanguage = lang;
        setCurrentLanguage(lang);
        document.getElementById('language-btn').textContent = lang;
        this.closeLanguageDropdown();
        this.applyLanguage();
    }
    
    // 应用语言设置
    applyLanguage() {
        const lang = getCurrentLanguage();
        
        // 更新语言按钮显示
        document.getElementById('language-btn').textContent = lang;
        
        // 更新Header
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) headerTitle.textContent = t('header_title');
        
        const saveDocBtn = document.getElementById('save-document-btn')?.querySelector('span');
        if (saveDocBtn) saveDocBtn.textContent = t('save_document');
        
        const backToProjectBtn = document.getElementById('back-to-project-btn')?.querySelector('span');
        if (backToProjectBtn) backToProjectBtn.textContent = t('back_to_project');
        
        const userInfoBtn = document.getElementById('user-info-btn');
        if (userInfoBtn) userInfoBtn.textContent = t('user_info');
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.textContent = t('logout');
        
        // 更新主页面
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) pageTitle.textContent = t('project_management');
        
        const projectSearchInput = document.getElementById('project-search');
        if (projectSearchInput) projectSearchInput.placeholder = t('search_project');
        
        const createProjectBtn = document.getElementById('create-project-btn');
        if (createProjectBtn) {
            const icon = createProjectBtn.querySelector('i');
            createProjectBtn.innerHTML = '';
            if (icon) createProjectBtn.appendChild(icon);
            createProjectBtn.appendChild(document.createTextNode(' ' + t('new_project')));
        }
        
        // 更新文档列表页面
        const documentSearchInput = document.getElementById('document-search');
        if (documentSearchInput) documentSearchInput.placeholder = t('search_document');
        
        const createDocBtn = document.getElementById('create-document-btn');
        if (createDocBtn) {
            const icon = createDocBtn.querySelector('i');
            createDocBtn.innerHTML = '';
            if (icon) createDocBtn.appendChild(icon);
            createDocBtn.appendChild(document.createTextNode(' ' + t('new_document')));
        }
        
        const importDocBtn = document.getElementById('import-document-btn');
        if (importDocBtn) {
            const icon = importDocBtn.querySelector('i');
            importDocBtn.innerHTML = '';
            if (icon) importDocBtn.appendChild(icon);
            importDocBtn.appendChild(document.createTextNode(' ' + t('import_document')));
        }
        
        const exportDocsBtn = document.getElementById('export-documents-btn');
        if (exportDocsBtn && !this.exportMode) {
            const icon = exportDocsBtn.querySelector('i');
            exportDocsBtn.innerHTML = '';
            if (icon) exportDocsBtn.appendChild(icon);
            exportDocsBtn.appendChild(document.createTextNode(' ' + t('export_documents')));
        }
        
        const backToProjectsBtn = document.getElementById('back-to-projects-btn');
        if (backToProjectsBtn) {
            const icon = backToProjectsBtn.querySelector('i');
            backToProjectsBtn.innerHTML = '';
            if (icon) backToProjectsBtn.appendChild(icon);
            backToProjectsBtn.appendChild(document.createTextNode(' ' + t('back_to_project_list')));
        }
        
        // 更新编辑器标签页
        const tabBtns = document.querySelectorAll('.tab-btn');
        if (tabBtns.length >= 3) {
            tabBtns[0].textContent = t('entity_annotation');
            tabBtns[0].dataset.tab = t('entity_annotation');
            tabBtns[1].textContent = t('classical_analysis');
            tabBtns[1].dataset.tab = t('classical_analysis');
            tabBtns[2].textContent = t('auto_segmentation');
            tabBtns[2].dataset.tab = t('auto_segmentation');
        }
        
        // 更新编辑器侧边栏
        const docInfoTitle = document.querySelector('.sidebar-section h3');
        if (docInfoTitle && docInfoTitle.textContent === '文档信息') {
            docInfoTitle.textContent = t('document_name').replace(':', '');
        }
        
        const docNameLabel = document.querySelector('label[for="editor-author"]')?.previousElementSibling;
        if (docNameLabel) docNameLabel.textContent = t('document_name');
        
        const authorLabel = document.querySelector('label');
        if (authorLabel && authorLabel.textContent.includes('作者')) {
            authorLabel.textContent = t('author');
        }
        
        const createdLabel = document.querySelector('label');
        if (createdLabel && createdLabel.textContent.includes('创建时间')) {
            createdLabel.textContent = t('created_at');
        }
        
        // 更新侧边栏保存按钮
        const sidebarSaveBtn = document.getElementById('save-document-sidebar-btn')?.querySelector('span');
        if (sidebarSaveBtn) sidebarSaveBtn.textContent = ' ' + t('save');
        
        // 更新已保存状态
        const saveStatus = document.getElementById('save-status');
        if (saveStatus) saveStatus.textContent = '✓ ' + t('saved');
        
        // 更新快捷键提示
        const shortcutHint = document.querySelector('.sidebar-section > div:last-child');
        if (shortcutHint && shortcutHint.textContent.includes('快捷键')) {
            shortcutHint.textContent = t('shortcut_key');
        }
        
        // 更新实体标注部分
        const entityTitle = document.querySelector('#entity-annotator h3');
        if (entityTitle) entityTitle.textContent = t('entity_annotation');
        
        const labelLabel = document.querySelector('label[for="entity-label-select"]');
        if (labelLabel) labelLabel.textContent = t('label');
        
        const entityLabelSelect = document.getElementById('entity-label-select');
        if (entityLabelSelect) {
            entityLabelSelect.options[0].text = t('person');
            entityLabelSelect.options[1].text = t('place');
            entityLabelSelect.options[2].text = t('time');
            entityLabelSelect.options[3].text = t('object');
            entityLabelSelect.options[4].text = t('concept');
            entityLabelSelect.options[5].text = t('other');
        }
        
        const addEntityBtn = document.getElementById('add-entity-btn');
        if (addEntityBtn) {
            const icon = addEntityBtn.querySelector('i');
            addEntityBtn.innerHTML = '';
            if (icon) addEntityBtn.appendChild(icon);
            addEntityBtn.appendChild(document.createTextNode(' ' + t('add_entity')));
        }
        
        // 更新分词部分
        const segTitle = document.querySelector('#segmentation-section h3');
        if (segTitle) segTitle.textContent = t('auto_segmentation');
        
        const runSegBtn = document.getElementById('run-seg-btn');
        if (runSegBtn) {
                const icon = runSegBtn.querySelector('i');
            runSegBtn.innerHTML = '';
            if (icon) runSegBtn.appendChild(icon);
            runSegBtn.appendChild(document.createTextNode(' ' + t('run_segmentation')));
        }
        
        const selectAllDocsBtn = document.getElementById('select-all-docs-btn');
        if (selectAllDocsBtn) {
            const icon = selectAllDocsBtn.querySelector('i');
            selectAllDocsBtn.innerHTML = '';
            if (icon) selectAllDocsBtn.appendChild(icon);
            selectAllDocsBtn.appendChild(document.createTextNode(' ' + t('select_all')));
        }
        
        const cancelExportBtn = document.getElementById('cancel-export-btn');
        if (cancelExportBtn) {
            const icon = cancelExportBtn.querySelector('i');
            cancelExportBtn.innerHTML = '';
            if (icon) cancelExportBtn.appendChild(icon);
            cancelExportBtn.appendChild(document.createTextNode(' ' + t('cancel')));
        }
        
        const copySegBtn = document.getElementById('copy-seg-btn');
        if (copySegBtn) {
            const icon = copySegBtn.querySelector('i');
            copySegBtn.innerHTML = '';
            if (icon) copySegBtn.appendChild(icon);
            copySegBtn.appendChild(document.createTextNode(' ' + t('copy_sequence')));
        }
        
        const segStatus = document.getElementById('seg-status');
        if (segStatus) segStatus.textContent = t('segmenting');
        
        // 更新古文解析部分
        const analysisTitle = document.querySelector('#analysis-section h3:first-child');
        if (analysisTitle) analysisTitle.textContent = t('classical_analysis');
        
        const runAnalysisBtn = document.getElementById('run-analysis-btn');
        if (runAnalysisBtn) {
            const icon = runAnalysisBtn.querySelector('i');
            runAnalysisBtn.innerHTML = '';
            if (icon) runAnalysisBtn.appendChild(icon);
            runAnalysisBtn.appendChild(document.createTextNode(' ' + t('run_analysis')));
        }
        
        const analysisStatus = document.getElementById('analysis-status');
        if (analysisStatus) analysisStatus.textContent = t('analyzing');
        
        // 更新古文答疑部分
        const qaTitle = document.querySelector('#analysis-section h3:last-of-type');
        if (qaTitle && qaTitle.textContent.includes('答疑')) {
            qaTitle.textContent = t('qa_title');
        }
        
        const qaInput = document.getElementById('qa-input');
        if (qaInput) qaInput.placeholder = t('qa_input_placeholder');
        
        const qaSubmitBtn = document.getElementById('qa-submit-btn');
        if (qaSubmitBtn) {
            const icon = qaSubmitBtn.querySelector('i');
            qaSubmitBtn.innerHTML = '';
            if (icon) qaSubmitBtn.appendChild(icon);
            qaSubmitBtn.appendChild(document.createTextNode(' ' + t('ask_question')));
        }
        
        const qaStatus = document.getElementById('qa-status');
        if (qaStatus) qaStatus.textContent = t('answering');
        
        // 更新placeholder
        const documentContent = document.getElementById('document-content');
        if (documentContent) {
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                const tabText = activeTab.textContent;
                if (tabText.includes('实体') || tabText.includes('Entity')) {
                    documentContent.placeholder = t('enter_entity_content');
                } else if (tabText.includes('解析') || tabText.includes('Analysis')) {
                    documentContent.placeholder = t('enter_analysis_content');
                } else if (tabText.includes('分词') || tabText.includes('Segmentation')) {
                    documentContent.placeholder = t('enter_segmentation_content');
                } else {
                    documentContent.placeholder = t('enter_content');
                }
            }
        }
        
        const editorAuthor = document.getElementById('editor-author');
        if (editorAuthor) editorAuthor.placeholder = t('enter_author');
        
        // 重新渲染当前视图以更新动态内容
        if (this.currentView === 'home') {
            this.renderProjects();
        } else if (this.currentView === 'documents') {
            this.renderDocuments();
        }
        
        // 重新初始化feather图标
        feather.replace();
    }
    
    // Project actions
    showCreateProjectModal() {
        this.showModal(t('create_project'), [
            { name: 'name', label: t('project_name'), type: 'text', required: true },
            { name: 'description', label: t('project_description'), type: 'textarea' }
        ], (data) => {
            dataManager.addProject(data);
            this.showToast(t('project_created'), 'success');
        });
    }
    
    showProjectDetails(projectId) {
        const project = dataManager.getProject(projectId);
        if (!project) return;
        
        this.showModal(t('project_details'), [
            { name: 'name', label: t('project_name'), type: 'text' },
            { name: 'description', label: t('project_description'), type: 'textarea' },
            { name: 'createdAt', label: t('created_at'), type: 'text', readOnly: true },
            { name: 'updatedAt', label: t('update_time'), type: 'text', readOnly: true }
        ], (data) => {
            dataManager.updateProject(projectId, data);
            this.showToast(t('project_updated'), 'success');
        }, project);
    }
    
    deleteProject(projectId) {
        if (confirm(t('confirm_delete_project'))) {
            dataManager.deleteProject(projectId);
            this.showToast(t('project_deleted'), 'success');
            if (this.currentProjectId === projectId) {
                this.showHomeView();
            }
        }
    }
    
    // Document actions
    showCreateDocumentModal() {
        if (!this.currentProjectId) return;
        
        this.showModal(t('create_document'), [
            { name: 'name', label: t('document_name').replace(':', ''), type: 'text', required: true },
            { name: 'description', label: t('document_description'), type: 'textarea' }
        ], (data) => {
            dataManager.addDocument({
                projectId: this.currentProjectId,
                ...data
            });
            this.showToast(t('document_created'), 'success');
        });
    }
    
    showDocumentDetails(docId) {
        const doc = dataManager.getDocument(docId);
        if (!doc) return;
        
        this.showModal(t('document_details'), [
            { name: 'name', label: t('document_name').replace(':', ''), type: 'text' },
            { name: 'description', label: t('document_description'), type: 'textarea' },
            { name: 'createdAt', label: t('created_at').replace(':', ''), type: 'text', readOnly: true },
            { name: 'updatedAt', label: t('update_time'), type: 'text', readOnly: true }
        ], (data) => {
            dataManager.updateDocument(docId, data);
            this.showToast(t('document_updated'), 'success');
        }, doc);
    }
    
    showCopyDocumentModal(docId) {
        const doc = dataManager.getDocument(docId);
        if (!doc) return;
        
        this.showModal(`${t('copy')}：${doc.name}`, [
            { name: 'name', label: t('new_name'), type: 'text', required: true }
        ], (data) => {
            dataManager.addDocument({
                projectId: doc.projectId,
                name: data.name,
                description: doc.description,
                content: doc.content,
                author: doc.author
            });
            this.showToast(t('document_created'), 'success');
        }, { name: `${doc.name} - ${t('copy')}` });
    }
    
    deleteDocument(docId) {
        if (confirm(t('confirm_delete_document'))) {
            dataManager.deleteDocument(docId);
            this.showToast(t('document_deleted'), 'success');
        }
    }
    
    // 进入/退出导出模式
    enterExportMode() {
        this.exportMode = true;
        // 显示所有复选框
        const checkboxes = document.querySelectorAll('.doc-export-checkbox');
        checkboxes.forEach(cb => cb.style.display = 'inline-block');
        
        // 显示全选和取消按钮
        document.getElementById('select-all-docs-btn').style.display = 'inline-block';
        document.getElementById('cancel-export-btn').style.display = 'inline-block';
        
        // 修改导出按钮文字
        const exportBtn = document.getElementById('export-documents-btn');
        exportBtn.innerHTML = `<i data-feather="check"></i> ${t('confirm_export')}`;
        feather.replace();
    }
    
    cancelExportMode() {
        this.exportMode = false;
        // 隐藏所有复选框
        const checkboxes = document.querySelectorAll('.doc-export-checkbox');
        checkboxes.forEach(cb => {
            cb.style.display = 'none';
            cb.checked = false;
        });
        
        // 隐藏全选和取消按钮
        document.getElementById('select-all-docs-btn').style.display = 'none';
        document.getElementById('cancel-export-btn').style.display = 'none';
        
        // 恢复导出按钮文字
        const exportBtn = document.getElementById('export-documents-btn');
        exportBtn.innerHTML = `<i data-feather="download"></i> ${t('export_documents')}`;
        feather.replace();
    }
    
    // 全选/取消全选文档
    toggleSelectAllDocs() {
        const checkboxes = document.querySelectorAll('.doc-export-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
        
        // 更新全选按钮文字
        const selectAllBtn = document.getElementById('select-all-docs-btn');
        if (allChecked) {
            selectAllBtn.innerHTML = `<i data-feather="check-square"></i> ${t('select_all')}`;
        } else {
            selectAllBtn.innerHTML = `<i data-feather="square"></i> ${t('deselect_all')}`;
        }
        feather.replace();
    }
    
    // 处理导出按钮点击
    handleExportClick() {
        if (!this.exportMode) {
            // 进入选择模式
            const documents = dataManager.getDocumentsByProject(this.currentProjectId);
            if (documents.length === 0) {
                const lang = getCurrentLanguage();
                const msg = lang === 'English' ? 'No documents to export in current project' :
                           lang === '繁體中文' ? '當前項目沒有文檔可導出' : '当前项目没有文档可导出';
                this.showToast(msg, 'warning');
                return;
            }
            this.enterExportMode();
        } else {
            // 执行导出
            this.executeExport();
        }
    }
    
    // 执行导出
    async executeExport() {
        if (!this.currentProjectId) {
            this.showToast('无法确定当前项目', 'error');
            return;
        }
        
        // 获取所有选中的文档复选框
        const checkboxes = document.querySelectorAll('.doc-export-checkbox:checked');
        
        if (checkboxes.length === 0) {
            const lang = getCurrentLanguage();
            const msg = lang === 'English' ? 'Please select documents to export first' :
                       lang === '繁體中文' ? '請先選擇要導出的文檔' : '请先选择要导出的文档';
            this.showToast(msg, 'warning');
            return;
        }
        
        // 获取选中的文档ID列表
        const selectedDocIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-doc-id'));
        
        try {
            const apiBase = dataManager.apiBase || 'http://localhost:5002';
            const response = await fetch(`${apiBase}/api/export-documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentIds: selectedDocIds })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const lang = getCurrentLanguage();
                const msg = lang === 'English' ? `${result.message}, files saved to exported data folder` :
                           lang === '繁體中文' ? `${result.message}，文件已保存到 exported data 文件夾` :
                           `${result.message}，文件已保存到 exported data 文件夹`;
                this.showToast(msg, 'success');
                // 退出导出模式
                this.cancelExportMode();
            } else {
                const lang = getCurrentLanguage();
                const prefix = lang === 'English' ? 'Export failed' :
                              lang === '繁體中文' ? '導出失敗' : '导出失败';
                this.showToast(`${prefix}: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('导出文档错误:', error);
            const lang = getCurrentLanguage();
            const prefix = lang === 'English' ? 'Export failed' :
                          lang === '繁體中文' ? '導出失敗' : '导出失败';
            this.showToast(`${prefix}: ` + error.message, 'error');
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
                this.showToast(t('document_saved'), 'success');
                this.showSaveStatus();
                
                // 强制确保留在编辑器页面
                this.currentView = 'editor';
                this.elements.homeContent.style.display = 'none';
                this.elements.documentListContainer.style.display = 'none';
                this.elements.documentEditor.style.display = 'block';
                this.elements.editorButtons.style.display = 'flex';
            } else {
                this.showToast(t('save_failed'), 'error');
            }
        } catch (error) {
            console.error('保存文档错误:', error);
            this.showToast(t('save_failed') + ': ' + error.message, 'error');
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
                const lang = getCurrentLanguage();
                const msg = lang === 'English' ? 'Please select files to import' :
                           lang === '繁體中文' ? '請選擇要導入的文件' : '请选择要导入的文件';
                this.showToast(msg, 'warning');
                return;
            }
            
            const ids = await dataManager.importDocuments(selectedFiles, this.currentProjectId);
            const lang = getCurrentLanguage();
            const msg = lang === 'English' ? `Successfully imported ${ids.length} documents` :
                       lang === '繁體中文' ? `成功導入 ${ids.length} 個文檔` : `成功导入 ${ids.length} 个文档`;
            this.showToast(msg, 'success');
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
                this.showToast(t('fill_required_fields'), 'error');
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
