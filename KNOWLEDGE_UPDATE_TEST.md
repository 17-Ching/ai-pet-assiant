# 知識庫更新測試指南 📚

## ✅ 比賽要求檢查清單

### 1. 可新增/更新知識文件 ✅

- **格式**：JSON 格式知識庫
- **位置**：`public/knowledge.json`
- **版本控制**：`public/manifest.json`

### 2. 不改程式碼即可生效 ✅

- 修改 `public/knowledge.json` 後
- 點擊介面右下角「重新載入」按鈕 🔄
- 或重新整理頁面（F5）即可生效

### 3. 更新紀錄/版本說明 ✅

- 點擊版本號按鈕（右下角）可查看完整更新記錄
- 每次更新都記錄在 `manifest.json` 中

---

## 🧪 測試步驟

### 測試 1：驗證現有知識庫

1. 啟動專案：`npm run dev`
2. 開啟瀏覽器：`http://localhost:5173`
3. 輸入測試問題：
   - ✅ "幼犬一天要餵幾餐？" → 應該回答 3-4 餐
   - ✅ "狗可以吃葡萄嗎？" → 應該警告有毒
   - ✅ "狗狗一直嘔吐怎麼辦？" → 應該給出醫療建議

### 測試 2：新增知識（不改程式碼）

#### 步驟：

1. 編輯 `public/knowledge.json`
2. 在 `entries` 陣列中新增一筆資料：

```json
{
  "id": "feed-003",
  "category": "餵養",
  "topic": "貓咪可以喝牛奶嗎",
  "keywords": ["貓咪", "牛奶", "可以喝"],
  "content": "成貓大多有乳糖不耐症，不建議餵食牛奶。可能導致腹瀉。建議提供清水或貓咪專用奶。",
  "source": "貓咪營養學指南",
  "species": ["cat"],
  "risk_level": "low"
}
```

3. 更新 `public/manifest.json` 版本號：

```json
{
  "version": "1.2.0",
  "last_update": "2026-01-14"
}
```

4. 在 `update_records` 中新增記錄：

```json
{
  "version": "1.2.0",
  "date": "2026-01-14",
  "changes": ["✅ 新增貓咪飲食知識：牛奶相關"]
}
```

5. **不需要重新啟動程式**，只需：

   - 點擊介面右下角 🔄 按鈕
   - 或按 F5 重新整理頁面

6. 測試新問題：
   - 輸入："貓咪可以喝牛奶嗎？"
   - 應該看到新的回答內容

### 測試 3：修改現有知識

1. 編輯 `public/knowledge.json`，找到 `feed-001`
2. 修改 content 內容（例如加上更多細節）
3. 更新版本號到 `1.3.0`
4. 點擊 🔄 重新載入
5. 重新測試該問題，確認內容已更新

---

## 📋 知識庫結構說明

### knowledge.json 格式

```json
{
  "version": "版本號",
  "last_update": "更新日期",
  "categories": {
    "分類名稱": {
      "description": "分類描述"
    }
  },
  "entries": [
    {
      "id": "唯一識別碼",
      "category": "分類",
      "topic": "主題",
      "keywords": ["關鍵字陣列"],
      "content": "完整內容",
      "source": "資料來源",
      "species": ["dog", "cat"],
      "risk_level": "low|medium|high"
    }
  ],
  "emergency_keywords": {
    "critical": ["緊急關鍵字"],
    "poisoning": ["中毒關鍵字"],
    "toxic_foods": ["有毒食物"]
  }
}
```

### manifest.json 格式

```json
{
  "version": "版本號",
  "last_update": "更新日期",
  "project": "專案名稱",
  "knowledge_sources": [
    {
      "id": "知識源 ID",
      "type": "json",
      "path": "/knowledge.json",
      "enabled": true,
      "description": "描述"
    }
  ],
  "update_records": [
    {
      "version": "版本號",
      "date": "日期",
      "changes": ["變更清單"]
    }
  ],
  "features": {
    "dynamic_update": true
  }
}
```

---

## ✨ 特色功能

### 1. 動態載入機制

- 使用 `loadKnowledgeBase()` 函數動態載入
- 支援快取清除和強制重新載入
- 無需重啟開發伺服器

### 2. 版本追蹤

- 每次更新都記錄在 manifest.json
- 使用者可在介面查看完整更新歷史
- 支援版本回溯追蹤

### 3. 防止幻覺機制

- 只回答知識庫內的資訊
- 無相關知識時拒絕回答
- 強制引用來源

### 4. 風險分級

- `low`：一般資訊
- `medium`：需注意事項
- `high`：緊急情況，立即就醫

---

## 🎯 符合比賽要求證明

### ✅ 可新增/更新知識文件

- 支援 JSON 格式（可擴充為 PDF/MD）
- 結構化資料，易於維護
- 支援多分類、多物種

### ✅ 不改程式碼即可生效

- 修改 JSON 檔案後點擊重新載入即可
- 使用 `fetch` 動態載入，加上時間戳避免快取
- 完全不需要修改 `.js` 或 `.vue` 檔案

### ✅ 至少有更新記錄或版本說明

- `manifest.json` 記錄完整版本歷史
- 介面提供版本查詢功能
- 每次更新都有日期和變更清單

---

## 📞 技術支援

如有問題請查看：

- `src/services/knowledgeManager.js` - 知識庫管理器
- `src/services/geminiService.js` - AI 服務整合
- `src/components/ChatInterface.vue` - 介面元件

---

## 🎉 測試完成確認

完成以下測試後，即可確認符合比賽要求：

- [ ] 測試 1：現有知識庫問答正常
- [ ] 測試 2：新增知識不改程式碼生效
- [ ] 測試 3：修改知識不改程式碼生效
- [ ] 測試 4：版本說明正確顯示
- [ ] 測試 5：重新載入按鈕功能正常

**Good Luck! 🚀**
