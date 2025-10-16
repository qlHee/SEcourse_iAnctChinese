// js/auth.js
// 用户认证管理

class AuthManager {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.apiBase = window.USER_API_BASE || 'http://localhost:5002';
    }
    
    // 加载当前登录用户
    loadCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
    
    // 保存当前登录用户
    saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }
    
    // 登出
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        window.location.href = 'login.html';
    }
    
    // 检查是否已登录
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }
    
    // 登录验证
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.saveCurrentUser(result.user);
                return { success: true, user: result.user };
            } else {
                return { success: false, error: result.error || '登录失败' };
            }
        } catch (error) {
            console.error('登录错误:', error);
            return { success: false, error: '无法连接服务器，请确保用户服务已启动（cd server && npm start）' };
        }
    }
    
    // 注册新用户
    async register(username, email, password) {
        try {
            const response = await fetch(`${this.apiBase}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                return { success: true, user: result.user };
            } else {
                return { success: false, error: result.error || '注册失败' };
            }
        } catch (error) {
            console.error('注册错误:', error);
            return { success: false, error: '无法连接服务器，请确保用户服务已启动（cd server && npm start）' };
        }
    }
    
    // 更新用户信息
    async updateUserInfo(userId, updates) {
        try {
            const response = await fetch(`${this.apiBase}/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 更新当前登录用户信息
                if (this.currentUser && this.currentUser.id === userId) {
                    this.currentUser.email = result.user.email;
                    this.saveCurrentUser(this.currentUser);
                }
                return { success: true, user: result.user };
            } else {
                return { success: false, error: result.error || '更新失败' };
            }
        } catch (error) {
            console.error('更新用户信息错误:', error);
            return { success: false, error: '无法连接服务器，请确保用户服务已启动（cd server && npm start）' };
        }
    }
    
    // 要求登录（用于保护页面）
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// 创建全局实例
window.authManager = new AuthManager();

// 登录页面逻辑
if (document.getElementById('login-form')) {
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginBtn = document.getElementById('login-btn');
    const loginText = document.getElementById('login-text');
    const loginLoading = document.getElementById('login-loading');
    const errorMessage = document.getElementById('error-message');
    
    // 检查是否有记住的用户名
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        usernameInput.value = rememberedUsername;
        rememberMeCheckbox.checked = true;
    }
    
    // 表单提交
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;
        
        if (!username || !password) {
            showError('请填写用户名和密码');
            return;
        }
        
        // 显示加载状态
        loginBtn.disabled = true;
        loginText.style.display = 'none';
        loginLoading.style.display = 'inline-flex';
        errorMessage.style.display = 'none';
        
        // 执行登录
        const result = await authManager.login(username, password);
        
        if (result.success) {
            // 记住用户名
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
            
            // 跳转到主页
            window.location.href = 'index.html';
        } else {
            // 显示错误
            showError(result.error);
            
            // 恢复按钮状态
            loginBtn.disabled = false;
            loginText.style.display = 'inline';
            loginLoading.style.display = 'none';
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
    
    // Enter 键提交
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });
}

