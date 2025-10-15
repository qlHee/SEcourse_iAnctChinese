let functionType = 'translate';
let isLoading = false;

const translateBtn = document.getElementById('translateBtn');
const inputText = document.getElementById('inputText');
const inputTitle = document.getElementById('inputTitle');
const outputTitle = document.getElementById('outputTitle');
const outputContent = document.getElementById('outputContent');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const sendIcon = document.getElementById('sendIcon');
const loadingIcon = document.getElementById('loadingIcon');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const copyIcon = document.getElementById('copyIcon');
const checkIcon = document.getElementById('checkIcon');
const copyText = document.getElementById('copyText');
const form = document.getElementById('translatorForm');
const errorMessage = document.getElementById('errorMessage');

function updatePlaceholders() {
  if (functionType === 'translate') {
    inputTitle.textContent = '输入古文';
    outputTitle.textContent = '解析结果';
    inputText.placeholder = '请输入需要解析的古文，例如：学而时习之...';
    submitText.textContent = '解析';
    if (outputContent.classList.contains('empty-state')) {
      outputContent.textContent = '解析结果将显示在这里...';
    }
  } 
}

async function callQianWenAPI(text) {
  try {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '未知错误' }));
      throw new Error(errorData.error || `HTTP错误! 状态: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('API调用出错:', error);
    throw error;
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  setTimeout(() => {
    errorMessage.classList.add('hidden');
  }, 5000);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const text = inputText.value.trim();
  if (!text || isLoading) return;
  
  isLoading = true;
  submitBtn.disabled = true;
  sendIcon.classList.add('hidden');
  loadingIcon.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  
  try {
    const result = await callQianWenAPI(text);
    
    outputContent.classList.remove('empty-state');
    outputContent.innerHTML = formatResponse(result);
    copyBtn.classList.remove('hidden');
  } catch (error) {
    outputContent.classList.remove('empty-state');
    outputContent.textContent = '处理出错，请稍后重试';
    showError('错误: ' + error.message);
  } finally {
    // 恢复状态
    isLoading = false;
    submitBtn.disabled = false;
    sendIcon.classList.remove('hidden');
    loadingIcon.classList.add('hidden');
  }
});

function formatResponse(text) {
  return text
  .replace(/(\d+\.\s+.+?)(?=\n\d+\.|\n?$)/gs, '<strong>$1</strong>')
  .replace(/\n/g, '<br>');
}

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  outputContent.classList.add('empty-state');
  outputContent.textContent = '解析结果将显示在这里...';
  copyBtn.classList.add('hidden');
  errorMessage.classList.add('hidden');
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputContent.textContent);
    
    copyIcon.classList.add('hidden');
    checkIcon.classList.remove('hidden');
    copyText.textContent = '已复制';
    
    setTimeout(() => {
      copyIcon.classList.remove('hidden');
      checkIcon.classList.add('hidden');
      copyText.textContent = '复制';
    }, 2000);
  } catch (error) {
    console.error('复制失败:', error);
    showError('复制失败: ' + error.message);
  }
});

updatePlaceholders();