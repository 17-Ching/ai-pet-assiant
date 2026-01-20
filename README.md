# 🐾 Pet AI Assistant - 寵物健康智能助手

> **Gemini 寵物 AI 智能助手 MVP 挑戰賽** - 完整實作版本

一個基於 Google Gemini 的寵物健康諮詢智能助手，提供醫療、餵養、照護等全方位知識服務。

## ✨ 核心特色

- 🤖 **Gemini AI 驅動** - 使用 Google Gemini 2.0 Flash 模型
- 🛡️ **防胡說八道** - RAG 架構，無資料時明確拒答
- ⚠️ **醫療風險分流** - 自動偵測高風險情況並建議就醫
- 📚 **引用來源追蹤** - 所有回答都標示知識來源
- 🔄 **動態知識更新** - 不改程式碼即可更新知識庫
- 📱 **響應式設計** - 支援手機、平板、電腦
- 🎛️ **線上管理後台** - 完全不需寫程式的知識庫維護系統
  - 📤 支援 Excel/CSV 批次匯入
  - 📄 支援 PDF AI 自動提取
  - ✏️ 線上表格編輯
  - 💾 自動備份與版本控制

---

## 🚀 快速開始

### 1. 環境需求

- Node.js 18+
- npm 或 pnpm
- Gemini API Key（[免費取得](https://aistudio.google.com/apikey)）

### 2. 安裝步驟

```bash
# 1. 下載專案
git clone <repository-url>
cd pet-ai-assistant

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev
```

### 3. API Key 設定

#### 方式一：使用模擬模式（無需 API Key）

1. 開啟應用程式
2. 底部「API 設定」保持勾選「使用模擬 API」
3. ✅ 立即可以測試

#### 方式二：使用真實 Gemini API

1. 前往 [Google AI Studio](https://aistudio.google.com/apikey) 取得 API Key
2. 在應用程式底部「API 設定」中：
   - 取消勾選「使用模擬 API」
   - 輸入您的 API Key（格式：`AIza...`）
   - 點擊「保存 API Key」
3. ✅ 開始使用真實 AI 服務

---

## 📚 知識庫管理

### 查看當前版本

點擊頁面底部的「版本 x.x.x」按鈕，查看：

- 當前版本號
- 更新日期
- 完整更新記錄

### 更新知識庫（不需重新編譯）

#### 步驟 1: 修改知識內容

編輯 `public/knowledge.json`，添加新知識：

```json
{
  "id": "new-001",
  "category": "餵養",
  "topic": "新知識主題",
  "keywords": ["關鍵字1", "關鍵字2"],
  "content": "詳細知識內容...",
  "species": ["dog", "cat"],
  "risk_level": "low",
  "source": "資料來源"
}
```

#### 步驟 2: 更新版本資訊

編輯 `public/manifest.json`：

```json
{
  "version": "1.0.1", // 更新版本號
  "last_update": "2026-01-09", // 更新日期
  "update_records": [
    {
      "version": "1.0.1",
      "date": "2026-01-09",
      "changes": ["新增 xxx 知識", "優化 xxx 功能"]
    }
    // ... 保留舊記錄
  ]
}
```

#### 步驟 3: 重新載入

- 重新整理網頁（F5）
- 或點擊右下角重新整理按鈕 🔄
- ✅ 新知識立即生效！

---

## 🔌 API 使用說明

### 前端 Chat API

#### 模擬模式

```javascript
import { chatMock } from "./src/services/geminiService.js";

const response = await chatMock({
  pet_profile: {
    species: "dog", // "dog" | "cat"
    age: "2歲",
    weight: 10,
  },
  message: "幼犬一天要餵幾餐？",
});

console.log(response);
// {
//   answer: "...",
//   citations: ["來源1", "來源2"],
//   risk_level: "low",  // "low" | "medium" | "high"
//   suggested_next_actions: ["建議1", "建議2"]
// }
```

#### 真實 Gemini API

```javascript
import { chat } from "./src/services/geminiService.js";

const response = await chat({
  pet_profile: {
    species: "cat",
    age: "5歲",
    weight: 4.5,
  },
  message: "貓咪不吃飯怎麼辦？",
  apiKey: "YOUR_GEMINI_API_KEY",
});
```

### 後端 API（開發中）

**POST** `/api/chat`

**Request:**

```json
{
  "user_id": "user123",
  "pet_profile": {
    "species": "dog",
    "age": 2,
    "weight": 10
  },
  "message": "狗可以吃葡萄嗎？"
}
```

**Response:**

```json
{
  "answer": "⚠️ 緊急建議：絕對不可以！...",
  "citations": ["寵物醫療手冊 2024"],
  "risk_level": "high",
  "suggested_next_actions": ["立即撥打動物急診專線", "記錄攝食時間與數量"]
}
```

---

## 🧪 測試案例

### 執行測試

```bash
# 執行完整測試（20 題）
node tests/demo_cases.js

# 測試特定類別
node tests/demo_cases.js --category basic     # 基礎題
node tests/demo_cases.js --category toxic     # 禁忌題
node tests/demo_cases.js --category emergency # 緊急題
```

### 測試涵蓋範圍

✅ 20+ 題測試案例，包含：

| 類別         | 題數 | 說明                         |
| ------------ | ---- | ---------------------------- |
| **基礎知識** | 4 題 | 餵食、照護、驅蟲等常見問題   |
| **禁忌食物** | 3 題 | 葡萄、巧克力、洋蔥等中毒風險 |
| **拒答測試** | 2 題 | 無資料或可疑偏方應拒答       |
| **緊急就醫** | 6 題 | 抽搐、中毒、呼吸困難等       |
| **情境題**   | 5 題 | 換食拉肚子、老化、行為異常   |

### 測試範例

```javascript
// 測試：狗可以吃葡萄嗎？
const result = await chat({
  pet_profile: { species: "dog", age: "2歲", weight: 10 },
  message: "狗可以吃葡萄嗎？",
});

// 預期結果：
// ✅ risk_level: "high"
// ✅ answer 包含 "劇毒"、"腎衰竭"
// ✅ citations 不為空
// ✅ suggested_next_actions 包含就醫建議
```

---

## 📁 專案結構

```
pet-ai-assistant/
├── public/
│   ├── manifest.json          # 知識庫版本管理
│   └── knowledge.json         # 主要知識庫（278筆資料）
├── src/
│   ├── components/
│   │   └── ChatInterface.vue  # 聊天介面主組件
│   ├── services/
│   │   ├── geminiService.js   # Gemini API 封裝
│   │   └── knowledgeManager.js # 動態知識庫管理
│   ├── App.vue
│   └── main.js
├── tests/
│   └── demo_cases.js          # 20+ 測試案例
├── package.json
└── README.md
```

---

## 🎯 符合比賽規範檢查表

### ✅ 必要條件

- [x] **使用 Gemini API** - Gemini 2.0 Flash
- [x] **三大知識類別** - 醫療、餵養、照護 ✅
- [x] **Web Chat 展示** - Vue 3 + Vite
- [x] **顯示回答來源** - 每則回答都有 citations
- [x] **防胡說八道** - 無資料時明確拒答
- [x] **高風險分流** - 自動偵測並建議就醫
- [x] **知識庫可更新** - manifest.json + 不需重新編譯
- [x] **版本說明** - UI 顯示版本與更新記錄
- [x] **API 接口** - chat() 函數提供完整 API
- [x] **測試案例** - 20+ 題完整測試

### 📝 交付物

- [x] ✅ 可運作 Demo - `npm run dev`
- [x] ✅ 知識庫資料 - `public/knowledge.json` (278 筆)
- [x] ✅ 知識更新說明 - 本 README
- [x] ✅ API 文件 - 本 README
- [x] ✅ 部署說明 - 本 README
- [x] ✅ 測試案例 - `tests/demo_cases.js`

---

## 🏆 評分項目對照

| 項目               | 配分 | 實作狀態 | 說明                                |
| ------------------ | ---- | -------- | ----------------------------------- |
| **防幻覺與安全性** | 40%  | ✅ 完成  | RAG 架構 + 風險評估 + 拒答機制      |
| **知識庫更新設計** | 20%  | ✅ 完成  | manifest.json + 動態載入 + 版本控制 |
| **展示完成度**     | 15%  | ✅ 完成  | Web Chat + 響應式 UI + 來源顯示     |
| **API 與擴充性**   | 15%  | ✅ 完成  | 完整 chat API + 結構化回應          |
| **工程可維護性**   | 10%  | ✅ 完成  | 模組化設計 + 完整註解 + 測試案例    |

---

## 🔧 開發與部署

### 開發模式

```bash
npm run dev
# 在 http://localhost:5173 開啟
```

### 生產環境建置

```bash
npm run build
# 產生 dist/ 資料夾

# 預覽建置結果
npm run preview
```

### 部署到各平台

#### Vercel

```bash
npm install -g vercel
vercel --prod
```

#### Netlify

```bash
npm run build
# 將 dist/ 上傳到 Netlify
```

#### GitHub Pages

```bash
npm run build
# 設定 base: '/pet-ai-assistant/' in vite.config.js
```

---

## 📞 技術支援

### 常見問題

**Q: API Key 無效？**

- 確認 Key 格式正確（以 `AIza` 開頭）
- 檢查是否已啟用 Gemini API
- 查看控制台錯誤訊息

**Q: 知識更新沒有生效？**

- 點擊右下角重新整理按鈕 🔄
- 或按 Ctrl+Shift+R 強制重新載入
- 檢查 JSON 格式是否正確

**Q: 如何添加新的寵物種類？**

- 在 `knowledge.json` 的 `species` 欄位添加
- 更新 ChatInterface.vue 的物種選單

---

## 🎛️ 知識庫管理後台

### 為什麼需要管理後台？

**給完全不會寫程式的維運人員使用！**

傳統方式更新知識庫需要：

- ❌ 打開程式碼編輯器
- ❌ 手動編輯 JSON 檔案
- ❌ 擔心格式錯誤導致系統崩潰
- ❌ 沒有版本控制和備份

**現在只需要**：

- ✅ 登入網頁管理後台
- ✅ 上傳 Excel 或 PDF 檔案
- ✅ 在表格中直接編輯
- ✅ 一鍵儲存，自動備份

### 快速開始

#### 1. 啟動管理後台

```bash
# 設定管理員密碼（Windows PowerShell）
$env:VITE_ADMIN_PASSWORD="admin123"

# 啟動前端（必需）
npm run dev

# 啟動後端 API（PDF 處理需要）
npm run api
```

或使用同時啟動：

```bash
npm run start:all
```

#### 2. 訪問管理介面

1. 開啟 http://localhost:5173
2. 點擊右下角 **⚙️ 設定** 按鈕
3. 輸入密碼：`admin123`（預設）
4. 進入管理後台

### 功能說明

#### 📤 匯入 Excel/CSV

1. 點擊「📥 下載 Excel 範本」取得範本
2. 在範本中填寫知識資料（支援中英文欄位）
3. 拖放檔案到上傳區或點擊「選擇檔案」
4. 系統自動解析並顯示在表格中

**支援欄位**：

- 類別：餵養、禁忌、醫療急救、日常照護
- 標題：簡短明確的標題
- 關鍵字：用逗號分隔，例如「幼犬,餵養,頻率」
- 內容：詳細說明（支援多行）
- 來源：資料來源
- 物種：dog, cat 或 dog,cat
- 風險等級：low, medium, high

#### 📄 匯入 PDF（AI 自動提取）

1. 上傳 PDF 檔案（需啟動後端 API）
2. Gemini AI 自動分析內容
3. 提取結構化的知識條目
4. 人工確認並修正（AI 可能有誤）

**要求**：

- 檔案大小 < 10 MB
- 清晰的文字 PDF（非掃描檔）
- 需設定 `GEMINI_API_KEY`

#### ✏️ 線上表格編輯

- 直接在表格中修改內容
- 新增/刪除條目
- 選擇類別、物種、風險等級
- 即時預覽

#### 💾 儲存與備份

1. 點擊「💾 儲存知識庫」
2. 填寫版本號（例如：1.3.0）
3. 填寫更新說明
4. 確認儲存

系統會自動：

- 備份舊知識庫（帶時間戳）
- 更新 knowledge.json
- 更新 manifest.json
- 記錄版本歷史

### 詳細文檔

- 📘 [完整操作手冊（非技術人員）](./ADMIN_USER_GUIDE.md)
- 🚀 [部署指南（技術人員）](./DEPLOYMENT_GUIDE.md)
- ⚡ [快速啟動指南](./QUICK_START_ADMIN.md)

---

## 📄 授權

MIT License

---

## 👥 團隊

**專案**: Pet AI Assistant  
**比賽**: Gemini 寵物 AI 智能助手 MVP 挑戰賽  
**日期**: 2026-01-08  
**版本**: 1.0.0

---

## 🎉 立即體驗

```bash
npm install
npm run dev
```

開啟 http://localhost:5173，開始與 AI 助手對話！
