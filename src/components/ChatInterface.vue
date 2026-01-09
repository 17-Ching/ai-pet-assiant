<template>
  <div class="chat-container">
    <!-- 頂部標題 -->
    <header class="chat-header">
      <div class="header-content">
        <span class="material-symbols-rounded header-icon">pets</span>
        <h1>寵物健康助手</h1>
      </div>
    </header>

    <!-- 寵物資料設定 -->
    <div class="pet-profile-card bg-primary">
      <div class="profile-header">
        <h3 class="text-white">寵物資料</h3>
      </div>
      <div class="profile-form">
        <div class="form-group">
          <label>物種</label>
          <select v-model="petProfile.species">
            <option value="dog">狗狗</option>
            <option value="cat">貓咪</option>
          </select>
        </div>
        <div class="form-group">
          <label>年齡</label>
          <input v-model="petProfile.age" type="text" placeholder="例：2歲" />
        </div>
        <div class="form-group pr-4">
          <label>體重 (kg)</label>
          <input
            v-model="petProfile.weight"
            type="number"
            placeholder="例：5"
          />
        </div>
      </div>
    </div>

    <!-- 對話區域 -->
    <div class="chat-messages" ref="messagesContainer">
      <!-- 歡迎訊息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <span class="material-symbols-rounded welcome-icon">favorite</span>
        <h2>歡迎使用寵物健康助手</h2>
        <p>我可以回答關於寵物餵養、照護和健康的問題</p>
        <div class="quick-actions">
          <button
            v-for="q in quickQuestions"
            :key="q"
            @click="sendQuickQuestion(q)"
            class="quick-btn"
          >
            <span class="material-symbols-rounded">chat_bubble</span>
            {{ q }}
          </button>
        </div>
      </div>

      <!-- 訊息列表 -->
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="[
          'message',
          msg.role,
          {
            'high-risk': msg.risk_level === 'high',
            'medium-risk': msg.risk_level === 'medium',
          },
        ]"
      >
        <div class="message-avatar">
          <span class="material-symbols-rounded">
            {{ msg.role === "user" ? "person" : "smart_toy" }}
          </span>
        </div>
        <div class="message-content">
          <!-- 風險警告標籤 -->
          <div v-if="msg.risk_level === 'high'" class="risk-badge high">
            <span class="material-symbols-rounded blink">error</span>
            緊急警告
          </div>
          <div
            v-else-if="msg.risk_level === 'medium'"
            class="risk-badge medium"
          >
            <span class="material-symbols-rounded">warning</span>
            注意事項
          </div>

          <!-- 訊息文字 -->
          <div class="message-text" v-html="formatMessage(msg.content)"></div>

          <!-- 來源引用 -->
          <div
            v-if="msg.citations && msg.citations.length > 0"
            class="citations"
          >
            <div class="citations-card">
              <span class="material-symbols-rounded citations-icon"
                >menu_book</span
              >
              <div class="citations-content">
                <span class="citations-label">參考來源</span>
                <div class="citation-tags">
                  <span
                    v-for="(cite, i) in msg.citations"
                    :key="i"
                    class="citation-tag"
                  >
                    {{ cite }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 建議行動按鈕 -->
          <div
            v-if="
              msg.suggested_next_actions &&
              msg.suggested_next_actions.length > 0
            "
            class="action-buttons"
          >
            <button
              v-for="(action, i) in msg.suggested_next_actions"
              :key="i"
              @click="handleAction(action)"
              :class="['action-btn', { emergency: msg.risk_level === 'high' }]"
            >
              <span class="material-symbols-rounded">{{
                getActionMaterialIcon(action)
              }}</span>
              {{ action }}
            </button>
          </div>
        </div>
      </div>

      <!-- 載入中狀態 -->
      <div v-if="isLoading" class="message assistant loading">
        <div class="message-avatar">
          <span class="material-symbols-rounded">smart_toy</span>
        </div>
        <div class="message-content shadow-sm">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 輸入區域 -->
    <div class="chat-input-area bg-primary">
      <div class="input-wrapper bg-white">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="請輸入您的問題..."
          :disabled="isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="send-btn bg-CTA"
        >
          <span class="material-symbols-rounded text-text-100">
            {{ isLoading ? "hourglass_empty" : "send" }}
          </span>
        </button>
      </div>
      <p class="disclaimer">
        <span class="material-symbols-rounded">info</span>
        此 AI 助手僅供參考，如有緊急情況請立即就醫
      </p>

      <!-- 版本說明區塊 -->
      <div class="version-info">
        <button @click="toggleVersionModal" class="version-button">
          <span class="material-symbols-rounded">info</span>
          <span>版本 {{ versionInfo.version }}</span>
          <span class="update-date">{{ versionInfo.last_update }}</span>
        </button>
        <button
          @click="refreshKnowledge"
          class="refresh-button"
          title="重新載入知識庫"
        >
          <span class="material-symbols-rounded">refresh</span>
        </button>
      </div>

      <!-- 版本說明彈窗 -->
      <div
        v-if="showVersionModal"
        class="version-modal-overlay"
        @click="toggleVersionModal"
      >
        <div class="version-modal" @click.stop>
          <div class="modal-header">
            <h3>
              <span class="material-symbols-rounded">history</span>
              更新記錄
            </h3>
            <button @click="toggleVersionModal" class="close-btn">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
          <div class="modal-content">
            <div
              v-for="(record, index) in versionInfo.update_records"
              :key="index"
              class="update-record"
            >
              <div class="record-header">
                <span class="version-badge">v{{ record.version }}</span>
                <span class="record-date">{{ record.date }}</span>
              </div>
              <ul class="change-list">
                <li v-for="(change, i) in record.changes" :key="i">
                  {{ change }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { chat, loadKnowledgeBase } from "../services/geminiService";
import { getVersionInfo, clearCache } from "../services/knowledgeManager";

// 狀態
const messages = ref([]);
const inputMessage = ref("");
const isLoading = ref(false);
const messagesContainer = ref(null);

// 版本資訊
const versionInfo = ref({
  version: "Loading...",
  last_update: "",
  update_records: [],
});
const showVersionModal = ref(false);

// 寵物資料
const petProfile = ref({
  species: "dog",
  age: "",
  weight: "",
});

// 快速問題
const quickQuestions = [
  "幼犬一天要餵幾餐？",
  "狗可以吃葡萄嗎？",
  "貓咪多久洗一次澡？",
  "狗狗一直嘔吐怎麼辦？",
];

// 初始化
onMounted(async () => {
  try {
    // 載入動態知識庫
    await loadKnowledgeBase();
    console.log("✅ 知識庫已載入");

    // 載入版本資訊
    versionInfo.value = getVersionInfo();
    console.log("📌 當前版本:", versionInfo.value.version);
  } catch (error) {
    console.error("❌ 知識庫載入失敗:", error);
  }
});

// 發送訊息
async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const userMessage = inputMessage.value.trim();
  inputMessage.value = "";

  // 添加使用者訊息
  messages.value.push({
    role: "user",
    content: userMessage,
  });

  await scrollToBottom();
  isLoading.value = true;

  try {
    const response = await chat({
      pet_profile: petProfile.value,
      message: userMessage,
    });

    // 添加 AI 回應
    messages.value.push({
      role: "assistant",
      content: response.answer,
      citations: response.citations,
      risk_level: response.risk_level,
      suggested_next_actions: response.suggested_next_actions,
      isNew: true,
    });

    // 移除動畫標記
    setTimeout(() => {
      const lastMsg = messages.value[messages.value.length - 1];
      if (lastMsg) lastMsg.isNew = false;
    }, 1000);
  } catch (error) {
    console.error("發送訊息失敗:", error);
    messages.value.push({
      role: "assistant",
      content: "抱歉，發生錯誤。請稍後再試。",
      risk_level: "low",
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
}

// 版本資訊相關
function toggleVersionModal() {
  showVersionModal.value = !showVersionModal.value;
}

async function refreshKnowledge() {
  try {
    clearCache();
    await loadKnowledgeBase();
    versionInfo.value = getVersionInfo();
    alert("✅ 知識庫已重新載入！");
  } catch (error) {
    alert("❌ 重新載入失敗：" + error.message);
  }
}

// 快速問題
function sendQuickQuestion(question) {
  inputMessage.value = question;
  sendMessage();
}

// 格式化訊息（換行處理）
function formatMessage(text) {
  return text.replace(/\n/g, "<br>");
}

// 處理行動按鈕
function handleAction(action) {
  if (action.includes("撥打") || action.includes("電話")) {
    alert("📞 正在開啟撥號功能...\n建議撥打：動物急診專線或 119");
  } else if (action.includes("醫院") || action.includes("搜尋")) {
    window.open("https://www.google.com/maps/search/24小時動物醫院", "_blank");
  } else if (action.includes("諮詢")) {
    alert("建議諮詢專業獸醫師以獲得更準確的診斷。");
  } else {
    alert(`執行動作：${action}`);
  }
}

// 獲取 Material Icon 名稱
function getActionMaterialIcon(action) {
  if (action.includes("撥打") || action.includes("電話")) return "call";
  if (action.includes("醫院") || action.includes("搜尋")) return "location_on";
  if (action.includes("記錄")) return "edit_note";
  if (action.includes("觀察")) return "visibility";
  if (action.includes("諮詢")) return "medical_services";
  return "arrow_forward";
}

// 滾動到底部
async function scrollToBottom() {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}
</script>

<style scoped>
/* Google Fonts & Material Icons */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap");

/* 容器 */
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  font-family: "Noto Sans TC", sans-serif;
}

/* Material Icons 樣式 */
.material-symbols-rounded {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  vertical-align: middle;
}

/* ========== 頂部標題 ========== */
.chat-header {
  padding: 24px 20px 16px;
  text-align: center;
  background-color: var(--bg-secondary);
  border-bottom: 2px solid var(--border-light);
  box-shadow: var(--shadow-soft);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.header-icon {
  font-size: 28px;
  color: var(--primary);
}

.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

/* ========== 寵物資料卡 ========== */
.pet-profile-card {
  padding: 16px 20px;
  border-radius: 20px 20px 0 0;
  border: 2px solid var(--border-light);
  box-shadow: var(--shadow-soft);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.profile-icon {
  font-size: 20px;
  color: var(--text-40);
}

.pet-profile-card h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-10);
}

.profile-form {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 90px;
}

.form-group label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-10);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  background-color: #ffff;
  color: var(--text-primary);
  box-sizing: border-box;
  transition: all 0.25s ease-out;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(166, 123, 91, 0.15);
}

/* ========== 對話區域 ========== */
.chat-messages {
  background-color: #ffff;
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========== 歡迎訊息 ========== */
.welcome-message {
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 56px;
  color: var(--primary);
  opacity: 0.6;
  display: block;
  margin-bottom: 16px;
}

.welcome-message h2 {
  margin: 0 0 8px;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
}

.welcome-message p {
  color: var(--text-muted);
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  color: var(--text-secondary);
  padding: 10px 16px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.25s ease-out;
  font-size: 0.85rem;
  font-family: inherit;
}

.quick-btn .material-symbols-rounded {
  font-size: 18px;
  color: var(--text-muted);
}

.quick-btn:hover {
  background: var(--user-bubble);
  border-color: var(--primary);
  color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

/* ========== 訊息樣式 ========== */
.message {
  display: flex;
  gap: 12px;
  animation: messageSlideIn 0.35s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-soft);
}

.message-avatar .material-symbols-rounded {
  font-size: 20px;
  color: #ffff;
}

.message.user .message-avatar {
  background: var(--text-primary);
  border: 2px solid var(--primary-dark);
}

.message-content {
  max-width: 75%;
  padding: 14px 18px;
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  border: 2px solid var(--text-primary);
}

/* ========== 高風險訊息 ========== */
.message.high-risk .message-content {
  color: #ffff;
  background: var(--info);
  border: 3px solid var(--risk-high-border);
  box-shadow: 0 4px 12px rgba(87, 87, 87, 0.15);
}

/* ========== 風險標籤 ========== */
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 10px;
}

.risk-badge.high {
  background: var(--danger);
  color: var(--risk-high-text);
}

.risk-badge.high .material-symbols-rounded {
  font-size: 16px;
}

.risk-badge.medium {
  background: rgba(146, 64, 14, 0.1);
  color: var(--risk-medium-text);
}

.risk-badge.medium .material-symbols-rounded {
  font-size: 16px;
}

/* 閃爍動畫 */
.blink {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* ========== 訊息文字 ========== */
.message-text {
  line-height: 1.65;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.message.user .message-text {
  color: var(--primary-dark);
}

.message.high-risk .message-text {
  color: var(--risk-high-text);
}

.message.medium-risk .message-text {
  color: var(--risk-medium-text);
}

/* ========== 來源引用 - 紙條風格 ========== */
.citations {
  margin-top: 14px;
}

.citations-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--bg-color);
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  border-left: 4px solid var(--primary);
}

.citations-icon {
  font-size: 18px;
  color: var(--text-muted);
  margin-top: 2px;
}

.citations-content {
  flex: 1;
}

.citations-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-40);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.citation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.citation-tag {
  display: inline-block;
  background: var(--bg-secondary);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  border: 2px solid var(--border-light);
}

.message.high-risk .citations-card {
  background: rgba(255, 255, 255, 0.647);
  border-left-color: var(--risk-high-text);
}

.message.medium-risk .citations-card {
  background: rgba(253, 230, 138, 0.3);
  border-left-color: var(--risk-medium-text);
}

/* ========== 行動按鈕 ========== */
.action-buttons {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 2px solid var(--border-light);
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  transition: all 0.25s ease-out;
}

.action-btn .material-symbols-rounded {
  font-size: 16px;
}

.action-btn:hover {
  background: var(--user-bubble);
  border-color: var(--primary);
  color: var(--primary-dark);
  transform: translateY(-1px);
}

.action-btn.emergency {
  background: rgba(153, 27, 27, 0.1);
  border: 3px solid var(--risk-high-border);
  color: var(--risk-high-text);
  font-weight: 600;
}

.action-btn.emergency:hover {
  background: rgba(153, 27, 27, 0.2);
}

/* ========== 載入中動畫 ========== */
.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0.4;
  animation: typingBounce 1.2s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typingBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* ========== 輸入區域 ========== */
.chat-input-area {
  padding: 16px;
  border-top: 2px solid var(--border-light);
  box-shadow: 0 -2px 8px rgba(166, 123, 91, 0.06);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 6px 6px 20px;
  border-radius: 28px;
  border: 2px solid var(--border-light);
  box-shadow: var(--shadow-soft);
  transition: all 0.25s ease-out;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: var(--shadow-medium), 0 0 0 3px rgba(166, 123, 91, 0.15);
}

.input-wrapper input {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-primary);
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.send-btn {
  width: 44px;
  height: 44px;

  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease-out;
  box-shadow: 0 2px 8px rgba(166, 123, 91, 0.25);
}

.send-btn .material-symbols-rounded {
  font-size: 20px;
}

.send-btn:hover:not(:disabled) {
  background: var(--gradient-primary);
  border-color: var(--primary);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(166, 123, 91, 0.35);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.disclaimer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 12px 0 0;
}

.disclaimer .material-symbols-rounded {
  font-size: 14px;
}

/* ========== 版本說明 ========== */
.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-color);
  border-top: 1px solid var(--border-light);
}

.version-button {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-40);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.version-button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.version-button .material-symbols-rounded {
  font-size: 16px;
}

.update-date {
  margin-left: auto;
  opacity: 0.7;
}

.refresh-button {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-40);
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  background: var(--bg-secondary);
  color: var(--primary);
  transform: rotate(180deg);
}

.refresh-button .material-symbols-rounded {
  font-size: 18px;
}

/* 版本彈窗 */
.version-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.version-modal {
  background: var(--bg-secondary);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid var(--border-light);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.modal-header .material-symbols-rounded {
  font-size: 24px;
  color: var(--primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-color);
  color: var(--text-primary);
}

.modal-content {
  padding: 20px 24px;
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}

.update-record {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-light);
}

.update-record:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.version-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--gradient-primary);
  color: white;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.record-date {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.change-list {
  margin: 0;
  padding-left: 24px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.8;
}

.change-list li {
  margin-bottom: 4px;
}

/* ========== 響應式設計 ========== */
@media (max-width: 600px) {
  .chat-container {
    height: 100vh;
    height: 100dvh;
  }

  .profile-form {
    flex-direction: column;
  }

  .form-group {
    min-width: 100%;
  }

  .message-content {
    max-width: 85%;
  }

  .quick-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-btn {
    justify-content: center;
  }
}

/* 滾動條美化 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
