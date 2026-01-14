<template>
  <div class="bg-[#C3D8E4] min-h-[100vh]" ref="mainContainer">
    <!-- 頂部標題 -->
    <header class="sticky top-0 left-0 w-full p-4 mb-10 z-10">
      <div
        class="bg-[#F3F7FA] rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] px-10 py-4 flex justify-between items-center"
      >
        <!-- logo -->
        <div class="flex gap-4 items-center font-bold">
          <img src="/ai-pet icon.svg" alt="logo" />
          <span class="text-text-primary text-[24px]">寵物 AI 智能助手</span>
        </div>

        <!-- 寵物資料設定 -->
        <button
          @click="togglePetProfileModal"
          class="bg-primary flex text-white px-4 py-2 rounded-full gap-3 items-center h-fit"
        >
          <div class="profile-summary">
            <span class="profile-text">
              {{ petProfile.species === "dog" ? "🐕 狗狗" : "🐱 貓咪" }}
              {{
                petProfile.age
                  ? ` · ${petProfile.age.toString().replace("歲", "")}歲`
                  : ""
              }}
              {{ petProfile.weight ? ` · ${petProfile.weight}kg` : "" }}
            </span>
          </div>
          <span class="material-symbols-outlined"> edit_square </span>
        </button>
      </div>
    </header>

    <!-- 對話區域 -->
    <div class="max-w-[800px] mx-auto space-y-4 pb-[200px]">
      <!-- 歡迎訊息 -->
      <div
        v-if="messages.length === 0"
        class="text-center flex flex-col justify-center items-center gap-6"
      >
        <span class="material-symbols-outlined text-[40px] text-white">
          favorite
        </span>
        <h2 class="text-text-primary text-[40px]">歡迎使用寵物健康助手</h2>
        <p>我可以回答關於寵物餵養、照護和健康的問題</p>
        <div class="quick-actions">
          <button
            v-for="q in quickQuestions"
            :key="q"
            @click="sendQuickQuestion(q)"
            class="quick-btn text-text-secondary bg-white rounded-full shadow-sm"
          >
            <span class="material-symbols-outlined"> chat_bubble </span>
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
          <span
            v-if="msg.role === 'user'"
            class="material-symbols-outlined text-white"
          >
            person
          </span>
          <div
            v-else
            class="w-9 h-9 bg-CTA rounded-full flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-white">
              smart_toy
            </span>
          </div>
        </div>
        <div class="message-content">
          <!-- 風險警告標籤 -->
          <div v-if="msg.risk_level === 'high'" class="risk-badge high">
            <span class="material-symbols-outlined text-sm blink">error</span>
            緊急警告
          </div>
          <div
            v-else-if="msg.risk_level === 'medium'"
            class="risk-badge medium"
          >
            <span class="material-symbols-outlined text-sm"> warning </span>
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
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined citations-icon"
                  >menu_book</span
                >
                <span class="citations-label">參考來源</span>
              </div>

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
              <span class="material-symbols-outlined text-sm">{{
                getActionMaterialIcon(action)
              }}</span>
              {{ action }}
            </button>
          </div>
        </div>
      </div>

      <!-- 載入中狀態 -->
      <div v-if="isLoading" class="message assistant loading">
        <div
          class="w-9 h-9 bg-CTA rounded-full flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-white"> smart_toy </span>
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
    <div
      class="chat-input-area max-w-[800px] mx-auto fixed left-1/2 -translate-x-1/2 bottom-0 w-full z-10"
    >
      <div class="input-wrapper bg-white mb-2">
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
          <span class="material-symbols-outlined text-white">
            {{ isLoading ? "hourglass_empty" : "send" }}
          </span>
        </button>
      </div>
      <p class="disclaimer text-text-60">
        <span class="material-symbols-outlined text-sm"> info </span>
        此 AI 助手僅供參考，如有緊急情況請立即就醫
      </p>

      <!-- 版本說明區塊 -->
      <div
        class="version-info text-text-80 flex justify-end gap-2 items-center"
      >
        <button @click="toggleVersionModal" class="version-button">
          <span>版本 {{ versionInfo.version }}</span>
          <span>{{ versionInfo.last_update }}</span>
        </button>
        <button
          @click="refreshKnowledge"
          class="refresh-button"
          title="重新載入知識庫"
        >
          <span
            class="material-symbols-outlined text-base text-text-80 hover:text-text-primary"
          >
            refresh
          </span>
        </button>
      </div>
    </div>
    <!-- 寵物資料設定彈窗 -->
    <div
      v-if="showPetProfileModal"
      class="pet-modal-overlay"
      @click="togglePetProfileModal"
    >
      <div class="pet-modal bg-primary" @click.stop>
        <div class="modal-header text-white">
          <h3>
            <span class="material-symbols-outlined"> pets </span>
            寵物資料設定
          </h3>
          <button @click="togglePetProfileModal" class="close-btn">
            <span class="material-symbols-outlined"> close_small </span>
          </button>
        </div>
        <div class="modal-content">
          <div class="profile-form-modal">
            <div class="form-group-modal">
              <label>物種</label>
              <select v-model="petProfile.species">
                <option value="dog">🐕 狗狗</option>
                <option value="cat">🐱 貓咪</option>
              </select>
            </div>
            <div class="form-group-modal">
              <label>年齡</label>
              <input
                v-model="petProfile.age"
                type="text"
                placeholder="例：2"
                @input="filterAgeInput"
              />
            </div>
            <div class="form-group-modal">
              <label>體重 (kg)</label>
              <input
                v-model="petProfile.weight"
                type="number"
                placeholder="例：5"
              />
            </div>
          </div>
          <div class="modal-actions">
            <button @click="togglePetProfileModal" class="confirm-btn">
              <span class="material-symbols-outlined">check</span>
              確定
            </button>
          </div>
        </div>
      </div>
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
            <span class="material-symbols-outlined"> history </span>
            更新記錄
          </h3>
          <button @click="toggleVersionModal" class="close-btn">
            <span class="material-symbols-outlined"> close_small </span>
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

    <!-- 底部遮罩 -->
    <div class="fixed bottom-0 w-full h-[200px] linear"></div>

    <!-- 頂部遮罩 -->
    <div class="fixed top-0 w-full h-[160px] linear-top"></div>
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
const mainContainer = ref(null);

// 版本資訊
const versionInfo = ref({
  version: "Loading...",
  last_update: "",
  update_records: [],
});
const showVersionModal = ref(false);
const showPetProfileModal = ref(false);

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

    // 立即滾動到底部
    await scrollToBottom();

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

// 寵物資料彈窗
function togglePetProfileModal() {
  showPetProfileModal.value = !showPetProfileModal.value;
}

// 過濾年齡輸入，只允許數字
function filterAgeInput(event) {
  const value = event.target.value;
  petProfile.value.age = value.replace(/[^0-9]/g, "");
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
  setTimeout(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, 100);
}
</script>

<style scoped>
/* Google Fonts & Material Icons */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap");

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

/* ========== 寵物資料 - 簡潔版 ========== */
.pet-profile-compact {
  padding: 12px 20px;
  border-bottom: 2px solid var(--border-light);
}

.compact-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-10);
}

.compact-content > .material-symbols-rounded {
  font-size: 24px;
}

.profile-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: var(--text-10);
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.edit-btn .material-symbols-rounded {
  font-size: 20px;
}

/* ========== 寵物資料彈窗 ========== */
.pet-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.pet-modal {
  border-radius: 16px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.profile-form-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group-modal label {
  font-size: 0.85rem;
  color: #ffff;
  font-weight: 500;
}

.form-group-modal select,
.form-group-modal input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  background-color: #ffff;
  color: var(--text-primary);
  box-sizing: border-box;
  transition: all 0.25s ease-out;
}

.form-group-modal select:focus,
.form-group-modal input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(166, 123, 91, 0.15);
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(166, 123, 91, 0.3);
}

.confirm-btn .material-symbols-rounded {
  font-size: 18px;
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
  gap: 20px;
  justify-content: center;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.25s ease-out;
  font-size: 0.85rem;
}

.quick-btn .material-symbols-rounded {
  font-size: 18px;
  color: var(--text-muted);
}

.quick-btn:hover {
  background: #ffff;
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

.message.user .message-avatar {
  background: var(--text-primary);
  border: 2px solid var(--primary-dark);
}

.message-content {
  max-width: 75%;
  border: 2px solid var(--text-primary);
  margin-top: 16px;
}

/* 使用者對話框 - 獨特樣式 */
.message.user .message-content {
  background: #9dcde9;
  border: 2px solid var(--text-primary);
  box-shadow: 0 2px 8px rgba(166, 123, 91, 0.15);
  border-radius: 60px 0 60px 60px;
  padding: 12px 20px;
}

/* 機器人對話框 - 保持白色 */
.message.assistant .message-content {
  border-radius: 0 60px 60px 60px;
  border: 2px solid var(--text-primary);
  background: #ffff;
  padding: 12px 20px 36px;
}

/* ========== 高風險訊息 ========== */
.message.high-risk .message-content {
  color: #ffff;
  background: #ffcece;
  border: 2px solid var(--danger);
  box-shadow: 0 4px 12px rgba(87, 87, 87, 0.15);
}

/* ========== 載入訊息 ========== */
.message.loading .message-content {
  padding: 12px 20px;
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

.risk-badge.medium {
  background: var(--alert);
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
}

.message.user .message-text {
  color: var(--primary-100);
}

.message.high-risk .message-text {
  color: var(--text-100);
}

.message.medium-risk .message-text {
  color: var(--text-100);
}

/* ========== 來源引用 - 紙條風格 ========== */
.citations {
  margin-top: 14px;
}

.citations-card {
  align-items: flex-start;
  gap: 10px;
  background: var(--bg-color);
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  border-left: 4px solid var(--primary);
  background: rgb(255, 230, 167);
  border-left-color: white;
}

.citations-icon {
  font-size: 18px;
  color: var(--text-80);
  margin-top: 2px;
}

.citations-label {
  font-size: 0.7rem;
  color: var(--text-80);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  color: var(--text-primary);
  border: 2px solid var(--border-light);
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
  background: var(--info);
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  transition: all 0.25s ease-out;
}

.action-btn:hover {
  background: #2565b3;
  transform: translateY(-1px);
}

.action-btn.emergency {
  background: rgba(195, 71, 71, 0.8);
  border: 3px solid var(--risk-high-border);
  color: var(--risk-high-text);
  font-weight: 600;
}

.action-btn.emergency:hover {
  background: rgba(195, 71, 71, 0.6);
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

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid var(--text-primary);
  transition: all 0.25s ease-out;
}

.input-wrapper:focus-within {
  box-shadow: 0 0 6px rgba(3, 117, 216, 1);
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--text-80);
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--text-40);
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
}

.disclaimer .material-symbols-rounded {
  font-size: 14px;
}

/* ========== 版本說明 ========== */
.version-info {
  display: flex;
  align-items: center;
}

.version-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
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

.refresh-button {
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-40);
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button:hover {
  color: var(--text-primary);
  transform: rotate(180deg);
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
  background: #ffff;
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
  background: var(--text-primary);
  color: white;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.record-date {
  color: var(--text-80);
  font-size: 0.8rem;
}

.change-list {
  margin: 0;
  padding-left: 24px;
  color: var(--text-80);
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

  .message-content {
    max-width: 85%;
  }

  .pet-modal {
    max-width: 95%;
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

/*  底部遮罩漸層 */
.linear {
  background: linear-gradient(
    0deg,
    #c3d8e4 0%,
    rgba(195, 216, 228, 1) 60%,
    rgba(255, 255, 255, 0) 100%
  );
}

.linear-top {
  background: linear-gradient(
    0deg,
    #c3d8e4 0%,
    rgba(195, 216, 228, 1) 60%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(180deg);
}
</style>
