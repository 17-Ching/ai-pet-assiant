# 🚀 Vercel 完整部署指南（含後端 API）

## ✅ 確認：Vercel 支援 Serverless Functions

你說得對！Vercel 確實可以運行後端 API。我已經將你的 API 改成 Vercel Serverless Functions 格式。

---

## 📁 專案結構

```
pet-ai-assistant/
├── api/                          # Vercel Serverless Functions
│   ├── save-knowledge.js         # 儲存知識庫 API
│   └── extract-knowledge.js      # PDF 提取 API (暫不支援)
├── src/                          # 前端程式碼
├── public/
│   └── knowledge.json            # 知識庫檔案
├── vercel.json                   # Vercel 配置
└── package.json
```

---

## ⚠️ 重要限制

**Vercel Serverless Functions 的檔案系統是唯讀的**

這表示無法像本機一樣直接寫入 `public/knowledge.json`。

### 解決方案（3 選 1）

#### 🌟 方案 1：使用 GitHub API（推薦）

自動將知識庫更新推送到 GitHub，Vercel 會自動重新部署。

**優點**：

- ✅ 完全免費
- ✅ 有版本控制
- ✅ 自動備份
- ✅ Vercel 自動部署

**設定步驟**：

1. **創建 GitHub Personal Access Token**

   ```
   1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   2. Generate new token (classic)
   3. 勾選權限：repo (完整 repo 權限)
   4. 複製 token (只會顯示一次！)
   ```

2. **在 Vercel 設定環境變數**

   ```
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_REPO=username/pet-ai-assistant
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_ADMIN_PASSWORD=your_password
   ```

3. **工作流程**
   ```
   儲存知識庫 → GitHub API 更新檔案 → Vercel 自動重新部署 (1-2分鐘) → 生效
   ```

---

#### 💾 方案 2：使用 Vercel Blob Storage

Vercel 的雲端存儲服務。

**優點**：

- ✅ 即時更新（無需重新部署）
- ✅ 整合簡單

**缺點**：

- ❌ 需要付費方案（Pro: $20/月）

**設定步驟**：

```bash
# 安裝依賴
npm install @vercel/blob

# 在 Vercel 控制台啟用 Blob Storage
# 然後修改 api/save-knowledge.js 使用 Blob API
```

---

#### 🗄️ 方案 3：使用外部資料庫

使用 MongoDB Atlas、Supabase 等免費資料庫。

**優點**：

- ✅ 即時更新
- ✅ 有免費方案

**缺點**：

- ❌ 需要額外設定
- ❌ 需要改寫程式碼

---

## 🚀 快速部署（使用方案 1 - GitHub API）

### 1. 推送程式碼到 GitHub

```bash
git add .
git commit -m "Add Vercel Serverless Functions"
git push origin main
```

### 2. 在 Vercel 導入專案

1. 前往 https://vercel.com/
2. New Project → Import Git Repository
3. 選擇你的倉庫

### 3. 設定環境變數

在 Vercel 專案設定中添加：

```env
# GitHub API (用於儲存知識庫)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=your-username/pet-ai-assistant

# Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# 管理員密碼
VITE_ADMIN_PASSWORD=your_secure_password
```

### 4. 部署設定

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. 部署

點擊 Deploy，等待 1-2 分鐘。

---

## 🧪 測試功能

### 測試知識庫儲存

1. 訪問你的 Vercel 網站
2. 進入管理後台
3. 新增一筆測試資料
4. 點擊「儲存知識庫」
5. 應該會看到：
   ```
   ✅ 知識庫已成功更新到 GitHub
   Vercel 將自動重新部署，約 1-2 分鐘後生效
   ```
6. 等待 1-2 分鐘，重新整理頁面
7. 新增的資料應該出現了！

### 查看部署日誌

Vercel 控制台 → 你的專案 → Deployments → 查看最新部署

---

## 📊 API 端點

部署後，你的 API 端點會是：

```
前端：https://your-app.vercel.app
API：
  - https://your-app.vercel.app/api/save-knowledge
  - https://your-app.vercel.app/api/extract-knowledge
```

---

## 🔧 本機開發

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 本機測試（模擬 Vercel 環境）
vercel dev

# 訪問
http://localhost:3000
```

---

## 🐛 常見問題

### Q1: 儲存後沒有生效？

**檢查**：

1. Vercel 環境變數中的 `GITHUB_TOKEN` 和 `GITHUB_REPO` 是否正確
2. GitHub Token 權限是否包含 `repo`
3. 分支名稱是否為 `main`（如果是 `master` 需要修改 `api/save-knowledge.js`）

**驗證方式**：

- 到 GitHub 倉庫查看 Commits，應該會看到自動提交的更新
- 到 Vercel 查看 Deployments，應該會觸發新的部署

### Q2: GitHub API 錯誤 403/404

**原因**：Token 權限不足或倉庫名稱錯誤

**解決**：

1. 重新生成 GitHub Token，確保勾選 `repo` 完整權限
2. 檢查 `GITHUB_REPO` 格式：`username/repository`（不是 URL）

### Q3: PDF 上傳不支援？

是的，Vercel Serverless Functions 處理檔案上傳比較複雜。

**替代方案**：

- 使用 Excel/CSV 格式匯入（完全支援）
- 直接在表格中手動新增和編輯

### Q4: 想要即時更新，不想等 1-2 分鐘？

**選項**：

- 升級到 Vercel Pro，使用 Vercel Blob Storage
- 使用外部資料庫（MongoDB Atlas、Supabase）

---

## 💡 開發提示

### 查看 Serverless Function 日誌

Vercel 控制台 → Functions → 選擇函數 → 查看 Logs

### 測試單個 API

```bash
# 測試儲存 API
curl -X POST https://your-app.vercel.app/api/save-knowledge \
  -H "Content-Type: application/json" \
  -d '{"version":"1.0.0","last_update":"2026-01-21","entries":[],"updateNotes":"測試"}'
```

---

## 📈 成本估算

**完全免費方案**：

- Vercel Hobby 方案：免費
- GitHub：免費
- Gemini API：免費額度 60 次/分鐘

**限制**：

- Serverless Function 執行時間：10 秒
- 每月 100GB 頻寬
- 部署次數不限

---

## 🎉 完成！

現在你的應用可以：

- ✅ 在 Vercel 上完整運行（前端 + API）
- ✅ 儲存知識庫到 GitHub
- ✅ 自動觸發重新部署
- ✅ 完全免費

有任何問題隨時問我！
