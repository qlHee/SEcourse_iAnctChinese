document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // 清除旧的状态
  document.querySelectorAll(".form-item").forEach(item => {
    item.classList.remove("error", "success");
    item.querySelector("small").textContent = "";
  });

  const validUser = "stu";
  const validPass = "123456";

  if (username === validUser && password === validPass) {
    // 成功样式
    usernameInput.parentElement.classList.add("success");
    passwordInput.parentElement.classList.add("success");

    localStorage.setItem("loggedIn", "true");
    window.location.href = "index.html"; // 登录成功跳首页
  } else {
    // 失败样式
    usernameInput.value = "";
    passwordInput.value = "";

    usernameInput.parentElement.classList.add("error");
    passwordInput.parentElement.classList.add("error");

    usernameInput.parentElement.querySelector("small").textContent = "用户不存在或密码错误";
  }
});
