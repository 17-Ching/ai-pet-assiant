# 🚀 Vercel + Railway 部署指南

由於您的應用需要後端 API 來儲存知識庫，需要前後端分開部署。

---

## 📋 部署架構

```
前端（Vercel）─────API請求─────→ 後端（Railway）
   ↓                                    ↓
 靜態網站                          Node.js 服務器
 (HTML/CSS/JS)                    (api-server.js)
                                      ↓
                                  檔案系統讀寫
                                 (knowledge.json)
```

---

## 🎯 步驟一：部署後端到 Railway

### 1. 註冊 Railway 帳號

- 前往 https://railway.app/
- 使用 GitHub 帳號登入

### 2. 創建新專案

```bash
# 方式一：從 GitHub 部署（推薦）
1. 將程式碼推送到 GitHub
2. Railway → New Project → Deploy from GitHub repo
3. 選擇你的倉庫

# 方式二：本地部署
railway login
railway init
railway up
```

### 3. 配置環境變數

在 Railway 專案中設定：

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

### 4. 設定啟動指令

在 Railway 設定中確認：

- **Build Command**: `npm install`
- **Start Command**: `npm run api`

### 5. 獲取後端 URL

部署完成後，Railway 會提供一個 URL，例如：

```
https://pet-ai-assistant-production.up.railway.app
```

**記下這個 URL，等等會用到！**

---

## 🌐 步驟二：部署前端到 Vercel

### 1. 配置環境變數

在專案根目錄創建 `.env.production` 檔案：

```bash
# 後端 API 地址（填入 Railway 提供的 URL）
VITE_API_URL=https://your-backend.railway.app

# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# 管理員密碼
VITE_ADMIN_PASSWORD=your_secure_password
```

### 2. 推送到 Vercel

**方式一：使用 Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel
```

**方式二：使用 GitHub 連動**

1. 將程式碼推送到 GitHub
2. 前往 https://vercel.com/
3. 點擊「Import Project」
4. 選擇你的 GitHub 倉庫
5. 在「Environment Variables」中添加環境變數：
   - `VITE_API_URL` = Railway 後端 URL
   - `VITE_GEMINI_API_KEY` = 你的 Gemini API Key
   - `VITE_ADMIN_PASSWORD` = 管理員密碼

### 3. 部署設定

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## ✅ 驗證部署

1. **測試前端**：訪問 Vercel 提供的 URL
2. **測試聊天功能**：問一個問題，看能否正常回答
3. **測試後台**：
   - 點擊設定圖示進入後台
   - 新增一筆知識條目
   - 點擊「儲存知識庫」
   - 如果成功，表示前後端連接正常！

---

## 🔧 常見問題

### Q1: 儲存知識庫時出現 CORS 錯誤

**解決方法**：在 `api-server.js` 中確認 CORS 設定允許你的 Vercel 域名：

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-app.vercel.app", // 加入你的 Vercel 域名
    ],
  }),
);
```

### Q2: 後端 Railway 部署後無法訪問

檢查：

1. Railway 的環境變數是否正確設定
2. Start Command 是否為 `npm run api`
3. PORT 環境變數是否設定（Railway 會自動提供）

### Q3: 前端無法連接後端

檢查：

1. `.env.production` 中的 `VITE_API_URL` 是否正確
2. Vercel 的環境變數是否已設定
3. 瀏覽器開發者工具 Network 分頁查看 API 請求是否正確

---

## 📊 成本估算

- **Vercel**: 免費方案足夠使用
- **Railway**:
  - 免費方案：每月 $5 額度（約 500 小時運行）
  - Pro 方案：$5/月起

---

## 🔄 更新部署

**更新前端**：

```bash
git push origin main
# Vercel 會自動重新部署
```

**更新後端**：

```bash
git push origin main
# Railway 會自動重新部署
```

---

## 💡 其他部署選項

如果不想使用 Railway，也可以考慮：

1. **Render** (https://render.com/)
   - 免費方案
   - 部署簡單
   - 支援 Node.js

2. **Fly.io** (https://fly.io/)
   - 免費額度充足
   - 全球 CDN
   - 需要信用卡驗證

3. **Heroku** (不推薦)
   - 2022 年後取消免費方案
   - 需付費使用

---

## 📞 需要協助？

如果部署遇到問題，請提供：

1. 錯誤訊息截圖
2. 瀏覽器 Console 的錯誤訊息
3. Railway/Vercel 的部署日誌

祝部署順利！🎉
