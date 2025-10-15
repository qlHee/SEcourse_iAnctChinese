// js/app.js
// Main application initialization and routing

class App {
    constructor() {
        this.initializeApp();
    }
    
    initializeApp() {
        // Initialize Feather icons
        feather.replace();
        
        // Setup global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showErrorToast('发生了一个错误，请刷新页面重试');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showErrorToast('发生了一个错误，请刷新页面重试');
        });
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup beforeunload warning for unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (dataManager.editingDocId && dataManager.editingContent) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
                return e.returnValue;
            }
        });
        
        // Initialize URL routing
        this.initializeRouting();
        
        // Show welcome message
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 500);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Save document
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (dataManager.editingDocId) {
                    uiManager.saveDocument();
                }
            }
            
            // Ctrl/Cmd + N: New project/document
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (uiManager.currentView === 'home') {
                    uiManager.showCreateProjectModal();
                } else if (uiManager.currentView === 'documents') {
                    uiManager.showCreateDocumentModal();
                }
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl/Cmd + 1-3: Switch tabs
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
                e.preventDefault();
                const tabs = ['实体标注', '古文解析', '自动分词'];
                const tabIndex = parseInt(e.key) - 1;
                if (tabIndex < tabs.length) {
                    uiManager.switchTab(tabs[tabIndex]);
                }
            }
        });
    }
    
    initializeRouting() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange();
        });
        
        // Initial route handling
        this.handleRouteChange();
    }
    
    handleRouteChange() {
        const url = new URL(window.location);
        const path = url.pathname;
        const searchParams = url.searchParams;
        
        // Parse route
        if (path === '/' || path === '/index.html') {
            // Check for project parameter
            const projectId = searchParams.get('project');
            const projectName = searchParams.get('name');
            
            if (projectId) {
                uiManager.showDocumentListView(projectId, projectName || '项目');
            } else {
                uiManager.showHomeView();
            }
        } else if (path.startsWith('/projects/')) {
            // Handle project routes like /projects/123/documents
            const pathParts = path.split('/');
            if (pathParts.length >= 4 && pathParts[3] === 'documents') {
                const projectId = pathParts[2];
                const projectName = searchParams.get('name') || '项目';
                uiManager.showDocumentListView(projectId, projectName);
            }
        }
    }
    
    navigateToProject(projectId, projectName) {
        const url = new URL(window.location);
        url.searchParams.set('project', projectId);
        url.searchParams.set('name', projectName);
        window.history.pushState({}, '', url);
        uiManager.showDocumentListView(projectId, projectName);
    }
    
    navigateToHome() {
        const url = new URL(window.location);
        url.searchParams.delete('project');
        url.searchParams.delete('name');
        window.history.pushState({}, '', url);
        uiManager.showHomeView();
    }
    
    closeAllModals() {
        // Close all modals
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Close dropdowns
        document.getElementById('language-dropdown').style.display = 'none';
    }
    
    showWelcomeMessage() {
        // Check if this is first visit
        const isFirstVisit = !localStorage.getItem('app_visited');
        if (isFirstVisit) {
            localStorage.setItem('app_visited', 'true');
            uiManager.showToast('欢迎使用 iAnctChinese-Client！点击"新建项目"开始创建您的第一个项目', 'info');
        }
    }
    
    showErrorToast(message) {
        uiManager.showToast(message, 'error');
    }
    
    // Export functionality
    exportProject(projectId) {
        const project = dataManager.getProject(projectId);
        if (!project) return;
        
        const documents = dataManager.getDocumentsByProject(projectId);
        const exportData = {
            project,
            documents,
            exportDate: getCurrentDate(),
            version: '1.0'
        };
        
        const filename = `${project.name}_export_${getCurrentDate()}.json`;
        downloadTextFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
        uiManager.showToast('项目导出成功', 'success');
    }
    
    // Import functionality
    importProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.project && data.documents) {
                        // Import project
                        const newProject = dataManager.addProject({
                            name: `${data.project.name} (导入)`,
                            description: data.project.description
                        });
                        
                        // Import documents
                        data.documents.forEach(doc => {
                            dataManager.addDocument({
                                projectId: newProject.id,
                                name: doc.name,
                                description: doc.description,
                                content: doc.content,
                                author: doc.author
                            });
                        });
                        
                        uiManager.showToast('项目导入成功', 'success');
                        uiManager.renderProjects();
                    } else {
                        uiManager.showToast('无效的导入文件', 'error');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    uiManager.showToast('导入失败，文件格式错误', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Data backup and restore
    backupData() {
        const data = dataManager.exportData();
        const filename = `ianct_backup_${getCurrentDate()}.json`;
        downloadTextFile(JSON.stringify(data, null, 2), filename, 'application/json');
        uiManager.showToast('数据备份成功', 'success');
    }
    
    restoreData() {
        if (confirm('确定要恢复数据吗？这将覆盖当前所有数据。')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (dataManager.importData(data)) {
                            uiManager.showToast('数据恢复成功', 'success');
                            uiManager.renderProjects();
                        } else {
                            uiManager.showToast('数据恢复失败', 'error');
                        }
                    } catch (error) {
                        console.error('Restore error:', error);
                        uiManager.showToast('恢复失败，文件格式错误', 'error');
                    }
                };
                reader.readAsText(file);
            };
            
            input.click();
        }
    }
    
    // Clear all data
    clearAllData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
            dataManager.clearAllData();
            uiManager.showHomeView();
            uiManager.showToast('数据已清空', 'info');
        }
    }
    
    // Developer tools
    enableDeveloperMode() {
        // Add developer tools to window object
        window.dev = {
            dataManager,
            uiManager,
            app: this,
            exportData: () => dataManager.exportData(),
            importData: (data) => dataManager.importData(data),
            clearData: () => dataManager.clearAllData(),
            addTestData: () => this.addTestData()
        };
        
        console.log('Developer mode enabled. Use window.dev for debugging.');
    }
    
    addTestData() {
        // Add some test projects and documents
        const testProject = dataManager.addProject({
            name: '测试项目',
            description: '这是一个测试项目'
        });
        
        dataManager.addDocument({
            projectId: testProject.id,
            name: '测试文档1',
            description: '测试文档描述',
            content: '这是测试文档的内容\n\n包含多行文本。',
            author: '测试作者'
        });
        
        uiManager.showToast('测试数据已添加', 'success');
        uiManager.renderProjects();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for uiManager to be initialized
    const initApp = () => {
        if (window.uiManager) {
            window.app = new App();
            
            // Enable developer mode in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                window.app.enableDeveloperMode();
            }
        } else {
            // Retry after a short delay
            setTimeout(initApp, 10);
        }
    };
    
    initApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, save any pending changes
        if (dataManager.editingDocId) {
            dataManager.saveEditingDocument();
        }
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    uiManager.showToast('网络连接已恢复', 'success');
});

window.addEventListener('offline', () => {
    uiManager.showToast('网络连接已断开，数据将保存在本地', 'warning');
});
