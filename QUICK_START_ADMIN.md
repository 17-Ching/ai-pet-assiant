# 快速啟動知識庫管理後台

## Windows PowerShell

```powershell
# 設定環境變數並啟動前端
$env:VITE_ADMIN_PASSWORD="admin123"
npm run dev

# 在另一個終端機啟動後端 API（用於 PDF 處理）
npm run api
```

## Linux / macOS

```bash
# 設定環境變數並啟動前端
VITE_ADMIN_PASSWORD=admin123 npm run dev

# 在另一個終端機啟動後端 API
npm run api
```

## 同時啟動前後端

```bash
npm run start:all
```

## 訪問管理後台

1. 開啟瀏覽器前往：http://localhost:5173（或終端顯示的端口）
2. 點擊右下角「⚙️ 設定」按鈕
3. 輸入密碼：`admin123`
4. 開始管理知識庫

## 首次使用必做

### 1. 建立 .env 檔案

```bash
cp .env.example .env
```

### 2. 編輯 .env 填入您的設定

```
GEMINI_API_KEY=your_actual_api_key_here
VITE_ADMIN_PASSWORD=your_secure_password_here
PORT=3001
```

### 3. 安裝依賴（如果還沒安裝）

```bash
npm install
```

## 功能說明

### ✅ 支援的操作（無需寫程式）

- 📤 上傳 Excel/CSV 批次匯入知識
- 📄 上傳 PDF 由 AI 自動提取知識（需啟動後端 API）
- ✏️ 線上表格編輯知識條目
- 💾 一鍵儲存並自動備份
- 📊 版本控制與更新記錄

### 📋 工作流程

1. **匯入知識**
   - 下載 Excel 範本
   - 填寫知識資料
   - 拖放檔案上傳

2. **線上編輯**
   - 在表格中直接修改
   - 新增/刪除條目
   - 調整類別和風險等級

3. **儲存發布**
   - 點擊「儲存知識庫」
   - 填寫版本號和更新說明
   - 自動備份舊版本
   - 立即生效

## 詳細文檔

- 📘 [完整操作手冊](./ADMIN_USER_GUIDE.md)
- 🚀 [部署指南](./DEPLOYMENT_GUIDE.md)
- 📖 [專案說明](./README.md)

## 常見問題

### Q: 無法登入管理後台？

A: 確認環境變數 `VITE_ADMIN_PASSWORD` 已設定，預設為 `admin123`

### Q: PDF 上傳失敗？

A: 需要同時啟動後端服務（`npm run api`）並設定 `GEMINI_API_KEY`

### Q: 儲存後沒反應？

A: 確認後端 API 正在運行（http://localhost:3001）

### Q: 如何修改密碼？

A: 在 `.env` 檔案中修改 `VITE_ADMIN_PASSWORD` 的值

## 安全提醒

⚠️ **生產環境部署前務必**：

- 修改預設密碼為強密碼
- 設定 HTTPS
- 限制管理後台訪問 IP
- 定期備份知識庫

## 技術支援

遇到問題請參考：

- [GitHub Issues](https://github.com/your-username/pet-ai-assistant/issues)
- [部署指南](./DEPLOYMENT_GUIDE.md)
