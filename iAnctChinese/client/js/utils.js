// js/utils.js
// Utility functions for the application

/**
 * Generate a UUID v4
 * @returns {string} A UUID v4 string
 */
function generateUUID() {
    try {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }
    } catch {}
    
    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Format date to YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date string
 */
function getCurrentDate() {
    return formatDate(new Date());
}

/**
 * Get current timestamp in YYYY-MM-DD format (date only)
 * @returns {string} Current timestamp string
 */
function getCurrentTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 10);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Show loading state on an element
 * @param {HTMLElement} element - Element to show loading on
 * @param {string} text - Loading text
 */
function showLoading(element, text = 'Loading...') {
    element.innerHTML = `<div class="loading"></div> ${text}`;
    element.disabled = true;
}

/**
 * Hide loading state on an element
 * @param {HTMLElement} element - Element to hide loading on
 * @param {string} originalText - Original text to restore
 */
function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean} True if not empty
 */
function isRequired(value) {
    return value && value.trim().length > 0;
}

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content as text
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file, 'utf-8');
    });
}

/**
 * Download text as file
 * @param {string} content - Content to download
 * @param {string} filename - Filename for download
 * @param {string} mimeType - MIME type
 */
function downloadTextFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get query parameter from URL
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Set query parameter in URL
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
function setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
}

/**
 * Remove query parameter from URL
 * @param {string} name - Parameter name
 */
function removeQueryParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
}

/**
 * Language translations dictionary
 */
const translations = {
    '简体中文': {
        // Header
        'header_title': '汉语智能标注平台',
        'save_document': '保存文档',
        'back_to_project': '返回项目',
        'user_info': '个人信息',
        'logout': '登出',
        
        // Home page
        'project_management': '项目管理',
        'search_project': '搜索项目...',
        'new_project': '新建项目',
        'welcome_title': '欢迎使用 iAnctChinese-Client！',
        'welcome_desc': '您还没有创建任何项目，点击右上角的"新建项目"按钮开始创建您的第一个项目吧！',
        'create_first_project': '创建第一个项目',
        'open_project': '打开项目',
        'project_details': '项目详情',
        'delete_project': '删除项目',
        'no_matching_projects': '未找到匹配的项目',
        'no_projects_found': '没有找到包含',
        'clear_search': '清除搜索',
        
        // Document list
        'document_list': '的文档列表',
        'search_document': '搜索文档...',
        'new_document': '新建文档',
        'import_document': '导入文档',
        'select_all': '全选',
        'export_documents': '导出文档与标注',
        'cancel': '取消',
        'back_to_project_list': '返回项目列表',
        'no_documents': '项目还没有文档',
        'document_tips': '您可以通过以下方式添加文档：',
        'create_blank_document': '点击"新建文档"创建空白文档',
        'upload_local_file': '点击"导入文档"上传本地文件',
        'open_document': '打开文档',
        'document_details': '文档详情',
        'copy_document': '复制文档',
        'delete_document': '删除文档',
        'no_matching_documents': '未找到匹配的文档',
        'no_documents_found': '没有找到包含',
        
        // Editor
        'document_editor': '文档编辑器',
        'entity_annotation': '实体标注',
        'classical_analysis': '古文解析',
        'auto_segmentation': '自动分词',
        'document_name': '文档名称:',
        'author': '作者:',
        'created_at': '创建时间:',
        'save': '保存文档',
        'saved': '已保存',
        'shortcut_key': '快捷键: Ctrl/Cmd + S',
        
        // Entity annotation
        'label': '标签:',
        'person': '人物',
        'place': '地名',
        'time': '时间',
        'object': '器物',
        'concept': '概念',
        'other': '其他',
        'add_entity': '对选中文本打标',
        'annotation_list': '标注列表',
        
        // Segmentation
        'run_segmentation': '对当前内容分词',
        'copy_sequence': '复制词序列',
        'segmenting': '正在分词...',
        
        // Analysis
        'run_analysis': '解析当前内容',
        'analyzing': '正在解析...',
        'qa_title': '古文答疑',
        'qa_input_placeholder': '输入您的疑问...',
        'ask_question': '提问',
        'answering': '正在答疑...',
        'no_qa_history': '暂无提问记录',
        
        // Modals
        'create_project': '新建项目',
        'project_name': '项目名称',
        'project_description': '项目描述',
        'update_time': '更新时间',
        'create_document': '新建文档',
        'document_description': '文档描述',
        'import_documents': '导入文档',
        'select_file': '点击选择文件或拖拽文件到此处',
        'import': '导入',
        'copy': '复制',
        'new_name': '新名称',
        'confirm': '确认',
        
        // Profile
        'username': '用户名',
        'email': '邮箱',
        'new_password': '新密码（可选）',
        'confirm_password': '确认新密码',
        'registered_at': '注册时间',
        'last_login': '最后登录',
        'save_changes': '保存修改',
        
        // Messages
        'confirm_logout': '确定要登出吗？',
        'confirm_delete_project': '确定删除该项目吗？这将同时删除项目下的所有文档。',
        'confirm_delete_document': '确定删除该文档吗？',
        'project_created': '项目创建成功',
        'project_updated': '项目更新成功',
        'project_deleted': '项目删除成功',
        'document_created': '文档创建成功',
        'document_updated': '文档更新成功',
        'document_deleted': '文档删除成功',
        'document_saved': '文档保存成功',
        'save_failed': '保存失败',
        'fill_required_fields': '请填写所有必填字段',
        'select_text_first': '请先选中文本再打标',
        'entity_added': '已添加实体标注',
        'entity_deleted': '已删除实体标注',
        'segmentation_complete': '分词完成',
        'analysis_complete': '解析完成',
        'qa_complete': '答疑完成',
        'input_text_first': '请输入文本后再分词',
        'input_analysis_text': '请输入需要解析的古文内容',
        'input_question': '请输入您的疑问',
        'input_classical_text_first': '请先输入古文内容',
        
        // Login page
        'login_title': 'iAnctChinese',
        'login_subtitle': '古汉语智能标注平台',
        'login': '登录',
        'logging_in': '登录中...',
        'remember_me': '记住我',
        'no_account': '还没有账号？',
        'register_now': '立即注册',
        'default_account': '默认账号：zontiks / 123456',
        'input_username': '请输入用户名',
        'input_password': '请输入密码',
        
        // Register page
        'register_title': '注册账号',
        'register_subtitle': '加入古汉语智能标注平台',
        'register': '注册',
        'registering': '注册中...',
        'has_account': '已有账号？',
        'login_now': '立即登录',
        'input_email': '请输入邮箱地址',
        'username_length': '3-20个字符',
        'password_length': '至少6个字符',
        'reinput_password': '再次输入密码',
        
        // Placeholders
        'enter_content': '请输入文档内容...',
        'enter_entity_content': '请输入实体标注内容...',
        'enter_analysis_content': '请输入需要解析的古文内容...',
        'enter_segmentation_content': '请输入需要进行分词的内容...',
        'enter_author': '请输入作者',
        
        // Others
        'deselect_all': '取消全选',
        'confirm_export': '确认导出',
        'copied': '已复制',
        'copy_failed': '复制失败',
        'no_segmentation_result': '暂无可复制的分词结果',
        'segmentation_copied': '已复制分词序列',
        'select_model': '选择解析模型',
        'model_v3': 'DeepSeek-V3',
        'model_v3_desc': '最新V3模型，速度快，效果好',
        'model_r1': 'DeepSeek-R1',
        'model_r1_desc': '推理模型，深度分析，速度较慢',
        'recommended': '(推荐)'
    },
    '繁體中文': {
        // Header
        'header_title': '漢語智能標注平台',
        'save_document': '保存文檔',
        'back_to_project': '返回項目',
        'user_info': '個人信息',
        'logout': '登出',
        
        // Home page
        'project_management': '項目管理',
        'search_project': '搜索項目...',
        'new_project': '新建項目',
        'welcome_title': '歡迎使用 iAnctChinese-Client！',
        'welcome_desc': '您還沒有創建任何項目，點擊右上角的"新建項目"按鈕開始創建您的第一個項目吧！',
        'create_first_project': '創建第一個項目',
        'open_project': '打開項目',
        'project_details': '項目詳情',
        'delete_project': '刪除項目',
        'no_matching_projects': '未找到匹配的項目',
        'no_projects_found': '沒有找到包含',
        'clear_search': '清除搜索',
        
        // Document list
        'document_list': '的文檔列表',
        'search_document': '搜索文檔...',
        'new_document': '新建文檔',
        'import_document': '導入文檔',
        'select_all': '全選',
        'export_documents': '導出文檔與標注',
        'cancel': '取消',
        'back_to_project_list': '返回項目列表',
        'no_documents': '項目還沒有文檔',
        'document_tips': '您可以通過以下方式添加文檔：',
        'create_blank_document': '點擊"新建文檔"創建空白文檔',
        'upload_local_file': '點擊"導入文檔"上傳本地文件',
        'open_document': '打開文檔',
        'document_details': '文檔詳情',
        'copy_document': '複製文檔',
        'delete_document': '刪除文檔',
        'no_matching_documents': '未找到匹配的文檔',
        'no_documents_found': '沒有找到包含',
        
        // Editor
        'document_editor': '文檔編輯器',
        'entity_annotation': '實體標注',
        'classical_analysis': '古文解析',
        'auto_segmentation': '自動分詞',
        'document_name': '文檔名稱:',
        'author': '作者:',
        'created_at': '創建時間:',
        'save': '保存文檔',
        'saved': '已保存',
        'shortcut_key': '快捷鍵: Ctrl/Cmd + S',
        
        // Entity annotation
        'label': '標籤:',
        'person': '人物',
        'place': '地名',
        'time': '時間',
        'object': '器物',
        'concept': '概念',
        'other': '其他',
        'add_entity': '對選中文本打標',
        'annotation_list': '標注列表',
        
        // Segmentation
        'run_segmentation': '對當前內容分詞',
        'copy_sequence': '複製詞序列',
        'segmenting': '正在分詞...',
        
        // Analysis
        'run_analysis': '解析當前內容',
        'analyzing': '正在解析...',
        'qa_title': '古文答疑',
        'qa_input_placeholder': '輸入您的疑問...',
        'ask_question': '提問',
        'answering': '正在答疑...',
        'no_qa_history': '暫無提問記錄',
        
        // Modals
        'create_project': '新建項目',
        'project_name': '項目名稱',
        'project_description': '項目描述',
        'update_time': '更新時間',
        'create_document': '新建文檔',
        'document_description': '文檔描述',
        'import_documents': '導入文檔',
        'select_file': '點擊選擇文件或拖拽文件到此處',
        'import': '導入',
        'copy': '複製',
        'new_name': '新名稱',
        'confirm': '確認',
        
        // Profile
        'username': '用戶名',
        'email': '郵箱',
        'new_password': '新密碼（可選）',
        'confirm_password': '確認新密碼',
        'registered_at': '註冊時間',
        'last_login': '最後登錄',
        'save_changes': '保存修改',
        
        // Messages
        'confirm_logout': '確定要登出嗎？',
        'confirm_delete_project': '確定刪除該項目嗎？這將同時刪除項目下的所有文檔。',
        'confirm_delete_document': '確定刪除該文檔嗎？',
        'project_created': '項目創建成功',
        'project_updated': '項目更新成功',
        'project_deleted': '項目刪除成功',
        'document_created': '文檔創建成功',
        'document_updated': '文檔更新成功',
        'document_deleted': '文檔刪除成功',
        'document_saved': '文檔保存成功',
        'save_failed': '保存失敗',
        'fill_required_fields': '請填寫所有必填字段',
        'select_text_first': '請先選中文本再打標',
        'entity_added': '已添加實體標注',
        'entity_deleted': '已刪除實體標注',
        'segmentation_complete': '分詞完成',
        'analysis_complete': '解析完成',
        'qa_complete': '答疑完成',
        'input_text_first': '請輸入文本後再分詞',
        'input_analysis_text': '請輸入需要解析的古文內容',
        'input_question': '請輸入您的疑問',
        'input_classical_text_first': '請先輸入古文內容',
        
        // Login page
        'login_title': 'iAnctChinese',
        'login_subtitle': '古漢語智能標注平台',
        'login': '登錄',
        'logging_in': '登錄中...',
        'remember_me': '記住我',
        'no_account': '還沒有賬號？',
        'register_now': '立即註冊',
        'default_account': '默認賬號：zontiks / 123456',
        'input_username': '請輸入用戶名',
        'input_password': '請輸入密碼',
        
        // Register page
        'register_title': '註冊賬號',
        'register_subtitle': '加入古漢語智能標注平台',
        'register': '註冊',
        'registering': '註冊中...',
        'has_account': '已有賬號？',
        'login_now': '立即登錄',
        'input_email': '請輸入郵箱地址',
        'username_length': '3-20個字符',
        'password_length': '至少6個字符',
        'reinput_password': '再次輸入密碼',
        
        // Placeholders
        'enter_content': '請輸入文檔內容...',
        'enter_entity_content': '請輸入實體標注內容...',
        'enter_analysis_content': '請輸入需要解析的古文內容...',
        'enter_segmentation_content': '請輸入需要進行分詞的內容...',
        'enter_author': '請輸入作者',
        
        // Others
        'deselect_all': '取消全選',
        'confirm_export': '確認導出',
        'copied': '已複製',
        'copy_failed': '複製失敗',
        'no_segmentation_result': '暫無可複製的分詞結果',
        'segmentation_copied': '已複製分詞序列',
        'select_model': '選擇解析模型',
        'model_v3': 'DeepSeek-V3',
        'model_v3_desc': '最新V3模型，速度快，效果好',
        'model_r1': 'DeepSeek-R1',
        'model_r1_desc': '推理模型，深度分析，速度較慢',
        'recommended': '(推薦)'
    },
    'English': {
        // Header
        'header_title': 'Classical Chinese Annotation Platform',
        'save_document': 'Save Document',
        'back_to_project': 'Back to Project',
        'user_info': 'User Info',
        'logout': 'Logout',
        
        // Home page
        'project_management': 'Project Management',
        'search_project': 'Search projects...',
        'new_project': 'New Project',
        'welcome_title': 'Welcome to iAnctChinese-Client!',
        'welcome_desc': 'You haven\'t created any projects yet. Click the "New Project" button in the upper right corner to create your first project!',
        'create_first_project': 'Create First Project',
        'open_project': 'Open Project',
        'project_details': 'Project Details',
        'delete_project': 'Delete Project',
        'no_matching_projects': 'No matching projects found',
        'no_projects_found': 'No projects containing',
        'clear_search': 'Clear Search',
        
        // Document list
        'document_list': ' Document List',
        'search_document': 'Search documents...',
        'new_document': 'New Document',
        'import_document': 'Import Document',
        'select_all': 'Select All',
        'export_documents': 'Export Documents & Annotations',
        'cancel': 'Cancel',
        'back_to_project_list': 'Back to Project List',
        'no_documents': 'No documents in this project',
        'document_tips': 'You can add documents by:',
        'create_blank_document': 'Click "New Document" to create a blank document',
        'upload_local_file': 'Click "Import Document" to upload a local file',
        'open_document': 'Open Document',
        'document_details': 'Document Details',
        'copy_document': 'Copy Document',
        'delete_document': 'Delete Document',
        'no_matching_documents': 'No matching documents found',
        'no_documents_found': 'No documents containing',
        
        // Editor
        'document_editor': 'Document Editor',
        'entity_annotation': 'Entity Annotation',
        'classical_analysis': 'Classical Analysis',
        'auto_segmentation': 'Auto Segmentation',
        'document_name': 'Document Name:',
        'author': 'Author:',
        'created_at': 'Created At:',
        'save': 'Save Document',
        'saved': 'Saved',
        'shortcut_key': 'Shortcut: Ctrl/Cmd + S',
        
        // Entity annotation
        'label': 'Label:',
        'person': 'Person',
        'place': 'Place',
        'time': 'Time',
        'object': 'Object',
        'concept': 'Concept',
        'other': 'Other',
        'add_entity': 'Tag Selected Text',
        'annotation_list': 'Annotation List',
        
        // Segmentation
        'run_segmentation': 'Segment Current Content',
        'copy_sequence': 'Copy Sequence',
        'segmenting': 'Segmenting...',
        
        // Analysis
        'run_analysis': 'Analyze Current Content',
        'analyzing': 'Analyzing...',
        'qa_title': 'Classical Text Q&A',
        'qa_input_placeholder': 'Enter your question...',
        'ask_question': 'Ask',
        'answering': 'Answering...',
        'no_qa_history': 'No Q&A history',
        
        // Modals
        'create_project': 'Create Project',
        'project_name': 'Project Name',
        'project_description': 'Project Description',
        'update_time': 'Update Time',
        'create_document': 'Create Document',
        'document_description': 'Document Description',
        'import_documents': 'Import Documents',
        'select_file': 'Click to select files or drag files here',
        'import': 'Import',
        'copy': 'Copy',
        'new_name': 'New Name',
        'confirm': 'Confirm',
        
        // Profile
        'username': 'Username',
        'email': 'Email',
        'new_password': 'New Password (optional)',
        'confirm_password': 'Confirm New Password',
        'registered_at': 'Registered At',
        'last_login': 'Last Login',
        'save_changes': 'Save Changes',
        
        // Messages
        'confirm_logout': 'Are you sure you want to logout?',
        'confirm_delete_project': 'Are you sure to delete this project? This will also delete all documents in the project.',
        'confirm_delete_document': 'Are you sure to delete this document?',
        'project_created': 'Project created successfully',
        'project_updated': 'Project updated successfully',
        'project_deleted': 'Project deleted successfully',
        'document_created': 'Document created successfully',
        'document_updated': 'Document updated successfully',
        'document_deleted': 'Document deleted successfully',
        'document_saved': 'Document saved successfully',
        'save_failed': 'Save failed',
        'fill_required_fields': 'Please fill in all required fields',
        'select_text_first': 'Please select text first',
        'entity_added': 'Entity annotation added',
        'entity_deleted': 'Entity annotation deleted',
        'segmentation_complete': 'Segmentation complete',
        'analysis_complete': 'Analysis complete',
        'qa_complete': 'Q&A complete',
        'input_text_first': 'Please enter text first',
        'input_analysis_text': 'Please enter classical text to analyze',
        'input_question': 'Please enter your question',
        'input_classical_text_first': 'Please enter classical text first',
        
        // Login page
        'login_title': 'iAnctChinese',
        'login_subtitle': 'Classical Chinese Annotation Platform',
        'login': 'Login',
        'logging_in': 'Logging in...',
        'remember_me': 'Remember Me',
        'no_account': 'Don\'t have an account?',
        'register_now': 'Register Now',
        'default_account': 'Default Account: zontiks / 123456',
        'input_username': 'Enter username',
        'input_password': 'Enter password',
        
        // Register page
        'register_title': 'Register Account',
        'register_subtitle': 'Join Classical Chinese Annotation Platform',
        'register': 'Register',
        'registering': 'Registering...',
        'has_account': 'Already have an account?',
        'login_now': 'Login Now',
        'input_email': 'Enter email address',
        'username_length': '3-20 characters',
        'password_length': 'At least 6 characters',
        'reinput_password': 'Re-enter password',
        
        // Placeholders
        'enter_content': 'Enter document content...',
        'enter_entity_content': 'Enter content for entity annotation...',
        'enter_analysis_content': 'Enter classical text to analyze...',
        'enter_segmentation_content': 'Enter content for segmentation...',
        'enter_author': 'Enter author',
        
        // Others
        'deselect_all': 'Deselect All',
        'confirm_export': 'Confirm Export',
        'copied': 'Copied',
        'copy_failed': 'Copy failed',
        'no_segmentation_result': 'No segmentation result to copy',
        'segmentation_copied': 'Segmentation sequence copied',
        'select_model': 'Select Analysis Model',
        'model_v3': 'DeepSeek-V3',
        'model_v3_desc': 'Latest V3 model, fast and effective',
        'model_r1': 'DeepSeek-R1',
        'model_r1_desc': 'Reasoning model, in-depth analysis, slower',
        'recommended': '(Recommended)'
    }
};

/**
 * Get current language from localStorage or default to simplified Chinese
 * @returns {string} Current language
 */
function getCurrentLanguage() {
    return localStorage.getItem('app_language') || '简体中文';
}

/**
 * Set current language in localStorage
 * @param {string} lang - Language to set
 */
function setCurrentLanguage(lang) {
    localStorage.setItem('app_language', lang);
}

/**
 * Get translation for a key in the current language
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
function t(key) {
    const lang = getCurrentLanguage();
    return translations[lang]?.[key] || translations['简体中文'][key] || key;
}