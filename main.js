
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function(event) {
    event.preventDefault();
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
  });
}


const localFiles = [
  { id: "doc1", name: "doc1.txt", content: "工程：在一定时间内，一定成本下，完成一定质量的项目" },
  { id: "doc2", name: "doc2.txt", content: "增量开发：在原有的基础上开发增加新的功能部件，分成多个阶段，迭代开发：在原有的基础上，把原来有的部分更新，提升该部分的性能，在把这件事情做到最佳之前，可能会做错。" }
];

function getFileById(id) {
  return localFiles.find(f => f.id === id);
}
window.getFileById = getFileById;


const loadLocalBtn = document.getElementById("loadLocalBtn");
if (loadLocalBtn) {
  loadLocalBtn.addEventListener("click", function() {
    const display = document.getElementById("localFileDisplay");
    display.innerHTML = "";

    localFiles.forEach(file => {
      const fileBox = document.createElement("div");
      fileBox.className = "local-file-box";
      fileBox.innerHTML = `
        <a href="doc.html?id=${file.id}">
          <strong>${file.name}</strong>
        </a>
      `;
      display.appendChild(fileBox);
    });
  });
}


const uploadFile = document.getElementById("uploadFile");
if (uploadFile) {
  uploadFile.addEventListener("change", function() {
    const file = this.files[0];
    const display = document.getElementById("uploadFileDisplay");
    const commentList = document.getElementById("commentList");

    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;

        // 拆行显示，每行用 <p> 包裹
        display.innerHTML = text
          .split("\n")
          .map(line => `<p>${line}</p>`)
          .join("");

        // 清空批注列表
        if (commentList) commentList.innerHTML = "";
      }
      reader.readAsText(file);
    }
  });
}

//高光标注
function setupHighlight(displayArea, highlightBtnId, highlightColorId, clearBtnId) {
  const highlightBtn = document.getElementById(highlightBtnId);
  const clearBtn = document.getElementById(clearBtnId);
  const colorSelect = document.getElementById(highlightColorId);

  if (highlightBtn) {
    highlightBtn.addEventListener("click", () => {
      const selection = window.getSelection();
      if (!selection.toString()) { alert("请先选择一些文字！"); return; }
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className = "highlight";
      span.style.backgroundColor = colorSelect.value;
      range.surroundContents(span);
      selection.removeAllRanges();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const highlights = displayArea.querySelectorAll("span.highlight");
      highlights.forEach(span => {
        const parent = span.parentNode;
        while(span.firstChild) parent.insertBefore(span.firstChild, span);
        span.remove();
      });
    });
  }
}


function setupComment(displayArea, commentBtnId, commentListId) {
  const commentBtn = document.getElementById(commentBtnId);
  const commentList = document.getElementById(commentListId);

  if (!commentBtn || !commentList) return;

  commentBtn.addEventListener("click", () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text) { alert("请先选择一些文字！"); return; }

    const commentDiv = document.createElement("div");
    commentDiv.className = "comment-item";
    commentDiv.innerHTML = `
      <div class="comment-selected">选中内容：<strong>${text}</strong></div>
      <textarea placeholder="输入你的批注"></textarea>
      <button class="deleteCommentBtn">删除批注</button>
    `;
    commentList.appendChild(commentDiv);

    // 删除按钮
    commentDiv.querySelector(".deleteCommentBtn").addEventListener("click", () => {
      commentDiv.remove();
    });

    selection.removeAllRanges();
  });
}


function setupDownload(displayArea, downloadBtnId, commentListId) {
  const downloadBtn = document.getElementById(downloadBtnId);
  if (!downloadBtn) return;

  downloadBtn.addEventListener("click", () => {
    let contentHtml = displayArea.innerHTML;

    const commentList = document.getElementById(commentListId);
    if (commentList) {
      const commentHtml = commentList.innerHTML;
      contentHtml += `<hr><h3>批注列表</h3>${commentHtml}`;
    }

    const blob = new Blob([contentHtml], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "标注文档.html";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}


const docContent = document.getElementById("docContent");
if (docContent) {
  setupHighlight(docContent, "highlightBtn", "highlightColor", "clearHighlightBtn");
  setupComment(docContent, "addCommentBtn", "commentList");
  setupDownload(docContent, "downloadBtn", "commentList");
}


const uploadDisplay = document.getElementById("uploadFileDisplay");
if (uploadDisplay) {
  setupHighlight(uploadDisplay, "highlightBtn", "highlightColor", "clearHighlightBtn");
  setupComment(uploadDisplay, "addCommentBtn", "commentList");
  setupDownload(uploadDisplay, "downloadBtn", "commentList");
}

