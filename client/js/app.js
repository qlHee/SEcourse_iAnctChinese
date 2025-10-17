// js/app.js
// Main application initialization and routing

class App {
    constructor() {
        this.isNavigating = false; // 添加导航标志
        this.initializeApp();
    }
    
    initializeApp() {
        // Initialize Feather icons
        feather.replace();
        
        // Setup logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            if (confirm(t('confirm_logout'))) {
                authManager.logout();
            }
        });
        
        // Setup user info button
        document.getElementById('user-info-btn')?.addEventListener('click', () => {
            this.showUserProfile();
        });
        
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
        this.isNavigatingInternally = false;
        this.isPageMinimized = false;
        
        window.addEventListener('beforeunload', (e) => {
            // 只在真正离开网站时触发弹窗，不在内部导航或最小化时触发
            if (dataManager.editingDocId && dataManager.editingContent && !this.isNavigatingInternally && !this.isPageMinimized) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
                return e.returnValue;
            }
        });
        
        // 监听页面最小化/恢复
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isPageMinimized = true;
            } else {
                this.isPageMinimized = false;
            }
        });
        
        // 监听内部导航
        window.addEventListener('popstate', () => {
            this.isNavigatingInternally = true;
            setTimeout(() => { this.isNavigatingInternally = false; }, 100);
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
        // 如果当前在编辑器页面，不处理路由变化
        if (uiManager.currentView === 'editor') {
            return;
        }
        
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
    
    // 显示用户信息模态框
    showUserProfile() {
        const modal = document.getElementById('profile-modal-overlay');
        const user = authManager.getCurrentUser();
        
        if (!user) {
            this.showErrorToast('未找到用户信息');
            return;
        }
        
        // 填充用户信息
        document.getElementById('profile-username').value = user.username || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-new-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
        document.getElementById('profile-created-at').textContent = user.created_at || '-';
        document.getElementById('profile-last-login').textContent = user.last_login || '从未登录';
        
        // 显示模态框
        modal.style.display = 'flex';
        feather.replace();
        
        // 保存按钮
        const saveBtn = document.getElementById('profile-save');
        const cancelBtn = document.getElementById('profile-cancel');
        const closeBtn = document.getElementById('profile-modal-close');
        
        // 移除旧的事件监听器
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        newSaveBtn.addEventListener('click', async () => {
            const email = document.getElementById('profile-email').value.trim();
            const newPassword = document.getElementById('profile-new-password').value;
            const confirmPassword = document.getElementById('profile-confirm-password').value;
            
            // 验证邮箱
            if (!email || !isValidEmail(email)) {
                uiManager.showToast('请输入有效的邮箱地址', 'error');
                return;
            }
            
            // 如果要修改密码，验证密码
            if (newPassword || confirmPassword) {
                if (newPassword !== confirmPassword) {
                    uiManager.showToast('两次输入的密码不一致', 'error');
                    return;
                }
                if (newPassword.length < 6) {
                    uiManager.showToast('密码至少需要6个字符', 'error');
                    return;
                }
            }
            
            // 更新用户信息
            newSaveBtn.disabled = true;
            const updates = { email };
            if (newPassword) {
                updates.password = newPassword;
            }
            
            const result = await authManager.updateUserInfo(user.id, updates);
            
            if (result.success) {
                uiManager.showToast('个人信息更新成功', 'success');
                modal.style.display = 'none';
                
                // 如果修改了密码，提示重新登录
                if (newPassword) {
                    setTimeout(() => {
                        if (confirm('密码已修改，需要重新登录。现在跳转到登录页面吗？')) {
                            authManager.logout();
                        }
                    }, 1000);
                }
            } else {
                uiManager.showToast(result.error || '更新失败', 'error');
            }
            
            newSaveBtn.disabled = false;
        });
        
        // 取消按钮
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
        };
        
        // 关闭按钮
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
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
document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
        // Page is hidden, save any pending changes
        if (dataManager.editingDocId) {
            await dataManager.saveEditingDocument();
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
