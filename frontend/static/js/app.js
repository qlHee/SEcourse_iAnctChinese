class iAnctChineseApp {
    constructor() {
        this.apiBase = '/api';
        this.currentDocument = null;
        this.tags = [];
        this.annotations = [];
        this.selectedRange = null;
        
        this.init();
    }

    async init() {
        await this.loadTags();
        await this.loadDocuments();
        this.setupEventListeners();
    }

    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showMessage('操作失败，请检查网络连接', 'error');
            throw error;
        }
    }

    async loadTags() {
        try {
            this.tags = await this.apiCall('/tags');
            this.renderTags();
        } catch (error) {
            console.error('Failed to load tags:', error);
        }
    }

    async loadDocuments() {
        try {
            const documents = await this.apiCall('/documents');
            this.renderDocumentList(documents);
        } catch (error) {
            console.error('Failed to load documents:', error);
        }
    }

    async loadDocumentAnnotations(documentId) {
        try {
            this.annotations = await this.apiCall(`/annotations/document/${documentId}`);
            this.renderText();
            this.updateStatistics();
        } catch (error) {
            console.error('Failed to load annotations:', error);
        }
    }

    renderTags() {
        const tagList = document.getElementById('tag-list');
        const tagButtons = document.getElementById('tag-buttons');
        
        tagList.innerHTML = '';
        tagButtons.innerHTML = '';

        this.tags.forEach(tag => {
            // 标签列表
            const tagElement = document.createElement('div');
            tagElement.className = 'stat-item';
            tagElement.innerHTML = `
                <span class="stat-color" style="background-color: ${tag.color}"></span>
                <span class="flex-grow-1">${tag.name}</span>
                <small class="text-muted tag-count" data-tag-id="${tag.id}">0</small>
            `;
            tagList.appendChild(tagElement);

            // 标注按钮
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-sm me-2';
            button.style.backgroundColor = tag.color;
            button.style.borderColor = tag.color;
            button.style.color = 'white';
            button.innerHTML = `<i class="fas fa-tag"></i> ${tag.name}`;
            button.onclick = () => this.createAnnotation(tag.id);
            tagButtons.appendChild(button);
        });
    }

    renderDocumentList(documents) {
        const listElement = document.getElementById('document-list');
        listElement.innerHTML = '';

        if (documents.length === 0) {
            listElement.innerHTML = '<p class="text-muted">暂无文档，请创建新文档</p>';
            return;
        }

        documents.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-item d-flex justify-content-between align-items-center p-2 border-bottom';
            docElement.innerHTML = `
                <div class="flex-grow-1">
                    <strong class="d-block">${doc.title}</strong>
                    <small class="text-muted">
                        ${new Date(doc.created_at).toLocaleDateString('zh-CN')}
                        · ${doc.content.length} 字
                    </small>
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="app.openDocument('${doc.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            `;
            listElement.appendChild(docElement);
        });
    }

    async openDocument(documentId) {
        try {
            this.currentDocument = await this.apiCall(`/documents/${documentId}`);
            document.getElementById('document-title').textContent = this.currentDocument.title;
            document.getElementById('annotation-toolbar').style.display = 'block';
            document.getElementById('annotation-stats').style.display = 'block';
            
            await this.loadDocumentAnnotations(documentId);
        } catch (error) {
            console.error('Failed to open document:', error);
        }
    }

    renderText() {
        const container = document.getElementById('text-container');
        if (!this.currentDocument) return;

        let html = '';
        const text = this.currentDocument.content;
        
        // 创建字符数组，每个字符一个span
        const chars = text.split('');
        
        chars.forEach((char, index) => {
            const annotations = this.annotations.filter(ann => 
                index >= ann.start_pos && index < ann.end_pos
            );
            
            if (annotations.length > 0) {
                const ann = annotations[0];
                html += `<span class="annotation" 
                            style="background-color: ${ann.tag.color}40; border-bottom-color: ${ann.tag.color}"
                            title="${ann.tag.name}: ${ann.text}${ann.note ? ' - ' + ann.note : ''}"
                            onclick="app.editAnnotation('${ann.id}')">${char}</span>`;
            } else {
                html += `<span class="segment" data-index="${index}">${char}</span>`;
            }
        });
        
        container.innerHTML = html;
        this.setupTextSelection();
    }

    setupTextSelection() {
        const container = document.getElementById('text-container');
        
        container.onmouseup = () => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText.length > 0) {
                this.handleTextSelection(selection);
            }
        };
    }

    handleTextSelection(selection) {
        const range = selection.getRangeAt(0);
        const container = document.getElementById('text-container');
        
        // 计算选中的起始和结束位置
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(container);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        
        const start = preSelectionRange.toString().length;
        const end = start + selection.toString().length;
        
        this.selectedRange = { start, end };
        
        document.getElementById('selected-text').textContent = `选中文本: "${selection.toString()}"`;
        document.getElementById('annotation-toolbar').style.display = 'flex';
        
        selection.removeAllRanges();
    }

    async createAnnotation(tagId) {
        if (!this.selectedRange || !this.currentDocument) return;

        const selectedText = this.currentDocument.content.slice(
            this.selectedRange.start, 
            this.selectedRange.end
        );

        try {
            await this.apiCall('/annotations', {
                method: 'POST',
                body: JSON.stringify({
                    document_id: this.currentDocument.id,
                    tag_id: tagId,
                    start_pos: this.selectedRange.start,
                    end_pos: this.selectedRange.end,
                    text: selectedText
                })
            });

            this.clearSelection();
            await this.loadDocumentAnnotations(this.currentDocument.id);
            this.showMessage('标注添加成功', 'success');
        } catch (error) {
            this.showMessage('标注添加失败', 'error');
        }
    }

    clearSelection() {
        this.selectedRange = null;
        document.getElementById('annotation-toolbar').style.display = 'none';
        document.getElementById('selected-text').textContent = '';
    }

    updateStatistics() {
        const stats = {};
        this.tags.forEach(tag => {
            stats[tag.id] = this.annotations.filter(ann => ann.tag_id === tag.id).length;
        });

        // 更新标签计数显示
        this.tags.forEach(tag => {
            const countElement = document.querySelector(`.tag-count[data-tag-id="${tag.id}"]`);
            if (countElement) {
                countElement.textContent = stats[tag.id] || 0;
            }
        });
    }

    async autoSegment() {
        if (!this.currentDocument) {
            this.showMessage('请先选择文档', 'warning');
            return;
        }

        try {
            const segments = await this.apiCall(`/documents/${this.currentDocument.id}/segment`, {
                method: 'POST'
            });
            this.showMessage(`自动分词完成，共识别出 ${segments.length} 个分词`, 'success');
            
            // 可以在控制台查看分词结果
            console.log('分词结果:', segments);
        } catch (error) {
            this.showMessage('自动分词失败', 'error');
        }
    }

    async editAnnotation(annotationId) {
        if (confirm('是否要删除这个标注？')) {
            try {
                await this.apiCall(`/annotations/${annotationId}`, {
                    method: 'DELETE'
                });
                await this.loadDocumentAnnotations(this.currentDocument.id);
                this.showMessage('标注已删除', 'success');
            } catch (error) {
                this.showMessage('删除标注失败', 'error');
            }
        }
    }

    showMessage(message, type = 'info') {
        // 使用Bootstrap的Toast或Alert来显示消息
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // 添加到页面顶部
        document.querySelector('.navbar').after(alertDiv);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }
}

// 全局函数供HTML调用
function createNewDocument() {
    // 重置表单
    document.getElementById('docTitle').value = '';
    document.getElementById('docContent').value = '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"';
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('documentModal'));
    modal.show();
}

async function saveDocument() {
    const title = document.getElementById('docTitle').value;
    const content = document.getElementById('docContent').value;

    if (!title || !content) {
        app.showMessage('请填写标题和内容', 'warning');
        return;
    }

    try {
        await app.apiCall('/documents', {
            method: 'POST',
            body: JSON.stringify({ title, content })
        });

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('documentModal'));
        modal.hide();

        // 重新加载文档列表
        await app.loadDocuments();
        app.showMessage('文档创建成功', 'success');
    } catch (error) {
        app.showMessage('文档创建失败', 'error');
    }
}

function showAddTagForm() {
    // 显示标签模态框
    const modal = new bootstrap.Modal(document.getElementById('tagModal'));
    modal.show();
}

async function saveTag() {
    const name = document.getElementById('tagName').value;
    const color = document.getElementById('tagColor').value;
    const description = document.getElementById('tagDescription').value;

    if (!name) {
        app.showMessage('请填写标签名称', 'warning');
        return;
    }

    try {
        await app.apiCall('/tags', {
            method: 'POST',
            body: JSON.stringify({ name, color, description })
        });

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('tagModal'));
        modal.hide();

        // 重新加载标签
        await app.loadTags();
        app.showMessage('标签创建成功', 'success');
    } catch (error) {
        app.showMessage('标签创建失败', 'error');
    }
}

function autoSegment() {
    app.autoSegment();
}

function clearSelection() {
    app.clearSelection();
}

function exportAnnotations() {
    if (!app.currentDocument) {
        app.showMessage('请先选择文档', 'warning');
        return;
    }
    
    const data = {
        document: app.currentDocument,
        annotations: app.annotations
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${app.currentDocument.title}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    app.showMessage('标注数据已导出', 'success');
}

// 初始化应用
const app = new iAnctChineseApp();