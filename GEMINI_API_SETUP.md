# Gemini API 設定說明

## 🔑 設定 API Key

要讓 API server 使用 Gemini AI 回答問題，需要設定 Gemini API Key。

### 方法 1：使用環境變數（推薦）

#### Windows (PowerShell)

```powershell
$env:GEMINI_API_KEY="您的_Gemini_API_Key"
node api-server.js
```

#### Windows (CMD)

```cmd
set GEMINI_API_KEY=您的_Gemini_API_Key
node api-server.js
```

### 方法 2：創建 .env 檔案

在專案根目錄創建 `.env` 檔案：

```
GEMINI_API_KEY=您的_Gemini_API_Key
```

然後使用 dotenv 載入（需要安裝 dotenv 套件）：

```bash
npm install dotenv
```

在 `api-server.js` 開頭加入：

```javascript
import "dotenv/config";
```

---

## 🧪 測試

設定完成後，重啟 API server：

```bash
node api-server.js
```

應該會看到：

```
✅ Gemini API 已初始化（使用環境變數）
```

測試問題：

```bash
node test-questions.js
```

---

## ⚠️ 沒有 API Key 的情況

如果沒有設定 API Key，系統會：

1. 顯示警告訊息
2. 使用內建知識庫回答
3. 對於知識庫中沒有的問題，會提供建議諮詢專業獸醫的回應

這樣仍然可以：

- ✅ API 正常運作
- ✅ 返回符合格式的回應
- ✅ 通過基本測試

---

## 📌 獲取 Gemini API Key

1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 點擊「Get API key」
3. 創建新的 API key
4. 複製並設定到環境變數

---

## 🎯 比賽展示建議

### 有 API Key

展示完整的 Gemini AI 回答功能

### 沒有 API Key

說明系統具備：

- 完整的 API 架構
- 降級機制（fallback）
- 內建知識庫支援

系統設計具備生產環境的容錯能力。
