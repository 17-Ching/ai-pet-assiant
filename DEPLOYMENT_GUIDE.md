# 🚀 管理後台部署指南

> **適用對象**：技術人員  
> **更新日期**：2026-01-20

本文件說明如何部署和配置知識庫管理後台系統。

---

## 📋 目錄

1. [系統需求](#系統需求)
2. [環境設定](#環境設定)
3. [部署選項](#部署選項)
4. [安全性配置](#安全性配置)
5. [故障排除](#故障排除)

---

## 系統需求

### 開發環境

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- 支援 ES Modules 的環境

### 生產環境

#### 選項 1：Vercel（僅前端，不支援 PDF 處理）

- 免費方案即可
- 自動 HTTPS
- 全球 CDN

#### 選項 2：Railway / Render（推薦，完整功能）

- 最低 $5/月
- 支援 Node.js 後端
- 支援檔案處理

#### 選項 3：VPS（完全控制）

- 自有伺服器或雲端主機
- 需要 1 GB RAM 以上
- 需要 Nginx/Apache 配置

---

## 環境設定

### 1. 複製環境變數範本

```bash
cp .env.example .env
```

### 2. 編輯 `.env` 檔案

```bash
# Google Gemini API 金鑰（必填，用於 PDF 處理）
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# 管理後台密碼（必填，建議使用強密碼）
VITE_ADMIN_PASSWORD=your_secure_password_here

# 伺服器端口（選填，預設 3001）
PORT=3001
```

### 3. 安裝依賴

```bash
npm install
```

### 4. 本地測試

#### 同時啟動前端和後端：

```bash
npm run start:all
```

- 前端：http://localhost:5173
- 後端 API：http://localhost:3001

#### 或分別啟動：

```bash
# 終端機 1：前端開發伺服器
npm run dev

# 終端機 2：後端 API 伺服器
npm run api
```

---

## 部署選項

### 選項 1：Vercel（靜態前端）

#### 功能限制

- ✅ 支援：Excel/CSV 前端解析
- ✅ 支援：線上表格編輯
- ❌ 不支援：PDF AI 提取
- ❌ 不支援：後端儲存 API

#### 部署步驟

1. **安裝 Vercel CLI**

```bash
npm install -g vercel
```

2. **設定環境變數**

在 Vercel 控制台設定：

```
VITE_ADMIN_PASSWORD=your_password
```

3. **部署**

```bash
vercel --prod
```

4. **限制說明**

由於 Vercel 不支援檔案寫入，知識庫儲存功能需要使用以下替代方案：

- 使用 GitHub API 寫入 repository
- 使用外部資料庫（Firebase/Supabase）
- 手動下載 JSON 並上傳到專案

---

### 選項 2：Railway（推薦）

#### 完整功能支援

- ✅ 前端靜態網站
- ✅ Node.js 後端 API
- ✅ PDF AI 提取
- ✅ 知識庫自動儲存

#### 部署步驟

1. **註冊 Railway**

前往 [railway.app](https://railway.app) 註冊帳號。

2. **連結 GitHub Repository**

- 點擊「New Project」
- 選擇「Deploy from GitHub repo」
- 授權並選擇 `pet-ai-assistant` repository

3. **設定環境變數**

在 Railway 專案設定中添加：

```
GEMINI_API_KEY=your_gemini_api_key
VITE_ADMIN_PASSWORD=your_admin_password
PORT=3001
```

4. **設定啟動命令**

在 `railway.json` 中配置（已包含在專案中）：

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npm run api",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

5. **部署**

Railway 會自動偵測並部署，或手動觸發：

```bash
railway up
```

---

### 選項 3：Render

#### 部署步驟

1. **註冊 Render**

前往 [render.com](https://render.com) 註冊。

2. **建立 Web Service**

- 連結 GitHub repository
- 選擇「Web Service」
- 設定：
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm run api`
  - **Environment**: Node

3. **設定環境變數**

```
GEMINI_API_KEY=your_key
VITE_ADMIN_PASSWORD=your_password
PORT=3001
```

4. **建立靜態網站**

- 建立另一個「Static Site」
- Build Command: `npm run build`
- Publish Directory: `dist`

---

### 選項 4：VPS（自有伺服器）

#### 系統需求

- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Node.js 18+
- Nginx / Apache
- PM2（程序管理）

#### 部署步驟

1. **安裝 Node.js**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 驗證安裝
node -v
npm -v
```

2. **複製專案**

```bash
cd /var/www
git clone https://github.com/your-username/pet-ai-assistant.git
cd pet-ai-assistant
```

3. **安裝依賴並建置**

```bash
npm install
npm run build
```

4. **設定環境變數**

```bash
nano .env
```

貼上：

```
GEMINI_API_KEY=your_key
VITE_ADMIN_PASSWORD=your_password
PORT=3001
```

5. **安裝 PM2**

```bash
sudo npm install -g pm2
```

6. **啟動後端服務**

```bash
pm2 start api-server.js --name pet-ai-api
pm2 save
pm2 startup
```

7. **設定 Nginx**

建立設定檔：

```bash
sudo nano /etc/nginx/sites-available/pet-ai-assistant
```

貼上：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端靜態檔案
    location / {
        root /var/www/pet-ai-assistant/dist;
        try_files $uri $uri/ /index.html;
    }

    # 後端 API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

8. **啟用網站**

```bash
sudo ln -s /etc/nginx/sites-available/pet-ai-assistant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **設定 SSL（Let's Encrypt）**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 安全性配置

### 1. 強化管理員密碼

**不要使用預設密碼！**

在 `.env` 中設定強密碼：

```bash
VITE_ADMIN_PASSWORD=$(openssl rand -base64 32)
```

### 2. IP 白名單（可選）

在 `api-server.js` 中添加 IP 限制：

```javascript
// 管理員 IP 白名單
const ADMIN_IPS = ["192.168.1.100", "203.0.113.5"];

app.post("/api/knowledge/save", (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!ADMIN_IPS.includes(clientIP)) {
    return res.status(403).json({ error: "無權限" });
  }
  next();
});
```

### 3. Rate Limiting

安裝限流中間件：

```bash
npm install express-rate-limit
```

在 `api-server.js` 中：

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 個請求
});

app.use("/api/", limiter);
```

### 4. HTTPS 強制

在生產環境務必使用 HTTPS：

```javascript
// 強制 HTTPS
app.use((req, res, next) => {
  if (
    req.header("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV === "production"
  ) {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});
```

---

## 故障排除

### 問題 1：PDF 上傳失敗

**錯誤訊息**：「PDF 處理失敗（請確保後端服務已啟動）」

**解決方法**：

1. 確認後端服務運行：

   ```bash
   pm2 list
   # 或
   npm run api
   ```

2. 檢查 Gemini API 金鑰：

   ```bash
   echo $GEMINI_API_KEY
   ```

3. 檢查 API 日誌：
   ```bash
   pm2 logs pet-ai-api
   ```

---

### 問題 2：知識庫儲存失敗

**錯誤訊息**：「知識庫儲存失敗」

**解決方法**：

1. 確認檔案權限：

   ```bash
   chmod 755 public/
   chmod 644 public/knowledge.json
   chmod 644 public/manifest.json
   ```

2. 確認磁碟空間：

   ```bash
   df -h
   ```

3. 檢查 JSON 格式：
   - 使用 JSON 驗證器檢查語法錯誤

---

### 問題 3：CORS 錯誤

**錯誤訊息**：「Access to fetch at ... has been blocked by CORS policy」

**解決方法**：

在 `api-server.js` 中正確設定 CORS：

```javascript
import cors from "cors";

app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-domain.com"],
    credentials: true,
  }),
);
```

---

### 問題 4：檔案上傳大小限制

**錯誤訊息**：「File too large」

**解決方法**：

調整 `multer` 限制：

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 增加到 20 MB
  },
});
```

---

## 監控與維護

### 日誌管理

#### PM2 日誌

```bash
# 查看即時日誌
pm2 logs pet-ai-api

# 清除舊日誌
pm2 flush
```

#### 自定義日誌

在 `api-server.js` 中添加：

```javascript
import fs from "fs";
import path from "path";

const logFile = path.join(__dirname, "logs", "api.log");

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage);
}
```

### 自動備份

建立 cron job 每日備份：

```bash
crontab -e
```

添加：

```bash
# 每天凌晨 2 點備份知識庫
0 2 * * * cp /var/www/pet-ai-assistant/public/knowledge.json /var/www/pet-ai-assistant/backups/knowledge_$(date +\%Y\%m\%d).json
```

---

## 效能優化

### 1. 啟用 Gzip 壓縮

```javascript
import compression from "compression";

app.use(compression());
```

### 2. 快取靜態資源

在 Nginx 中：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN 加速

將 `dist/` 目錄上傳到 CDN（Cloudflare、AWS CloudFront）。

---

## 擴展功能

### 整合資料庫（進階）

如需更強大的知識管理，可整合資料庫：

#### MongoDB

```bash
npm install mongodb
```

```javascript
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db("pet-ai");
const collection = db.collection("knowledge");

// 儲存知識庫
await collection.replaceOne(
  { type: "main" },
  { type: "main", data: knowledgeData },
  { upsert: true },
);
```

---

## 聯絡資訊

技術問題請參考：

- 主要文件：[README.md](../README.md)
- 用戶手冊：[ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md)
- GitHub Issues

---

**版本**：1.0.0  
**最後更新**：2026-01-20
