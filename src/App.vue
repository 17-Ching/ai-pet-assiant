<script setup>
import { ref, computed } from "vue";
import ChatInterface from "./components/ChatInterface.vue";
import KnowledgeAdmin from "./components/KnowledgeAdmin.vue";

// 路由狀態
const currentRoute = ref(window.location.hash.slice(1) || "/");
const isAuthenticated = ref(sessionStorage.getItem("adminAuth") === "true");
const passwordInput = ref("");
const showPasswordDialog = ref(false);

// 監聽路由變化
window.addEventListener("hashchange", () => {
  currentRoute.value = window.location.hash.slice(1) || "/";
});

// 計算當前組件
const currentComponent = computed(() => {
  if (currentRoute.value === "/admin") {
    return isAuthenticated.value ? "admin" : "login";
  }
  return "chat";
});

// 嘗試進入管理後台
function tryAccessAdmin() {
  currentRoute.value = "/admin";
  window.location.hash = "/admin";

  if (!isAuthenticated.value) {
    showPasswordDialog.value = true;
  }
}

// 驗證密碼
function verifyPassword() {
  // 簡單密碼驗證（生產環境應使用環境變數）
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "123";

  if (passwordInput.value === correctPassword) {
    isAuthenticated.value = true;
    sessionStorage.setItem("adminAuth", "true");
    showPasswordDialog.value = false;
    passwordInput.value = "";
  } else {
    alert("❌ 密碼錯誤！");
    passwordInput.value = "";
  }
}

// 登出
function logout() {
  isAuthenticated.value = false;
  sessionStorage.removeItem("adminAuth");
  currentRoute.value = "/";
  window.location.hash = "/";
}

// 關閉管理後台
function closeAdmin() {
  currentRoute.value = "/";
  window.location.hash = "/";
  showPasswordDialog.value = false;
}
</script>

<template>
  <div class="app">
    <!-- 主聊天介面 -->
    <ChatInterface
      v-if="currentComponent === 'chat'"
      @openAdmin="tryAccessAdmin"
    />

    <!-- 管理後台 -->
    <KnowledgeAdmin
      v-else-if="currentComponent === 'admin'"
      @close="closeAdmin"
    />

    <!-- 密碼驗證對話框 -->
    <div
      v-if="currentComponent === 'login'"
      class="password-overlay"
      @click.self="closeAdmin"
    >
      <div class="password-dialog">
        <div class="dialog-header">
          <h3>🔐 管理員登入</h3>
          <button @click="closeAdmin" class="btn-close-dialog">×</button>
        </div>
        <div class="dialog-body">
          <p class="dialog-hint">請輸入管理員密碼以繼續</p>
          <input
            v-model="passwordInput"
            type="password"
            placeholder="請輸入密碼"
            class="password-input"
            @keyup.enter="verifyPassword"
            autofocus
          />
        </div>
        <div class="dialog-footer">
          <button @click="closeAdmin" class="btn-cancel">取消</button>
          <button @click="verifyPassword" class="btn-verify">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
}

/* 密碼對話框 */
.password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.password-dialog {
  background: white;
  border-radius: 16px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-close-dialog {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  transition: color 0.3s;
}

.btn-close-dialog:hover {
  color: #333;
}

.dialog-body {
  padding: 24px;
}

.dialog-hint {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.password-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.password-input:focus {
  outline: none;
  border-color: #667eea;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-verify {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-verify {
  background: #667eea;
  color: white;
}

.btn-verify:hover {
  background: #5568d3;
}
</style>
