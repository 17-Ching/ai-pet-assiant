# Gemini API Key 設定指南

## 📌 取得 API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/apikey)
2. 使用 Google 帳號登入
3. 點擊 **Create API Key** 或 **Get API key**
4. 選擇一個 Google Cloud 專案（或建立新專案）
5. 複製產生的 API Key（格式：`AIza...`）

## 🔧 設定 API Key

### 方式一：使用介面設定（推薦）

1. 開啟應用程式
2. 在底部找到 **API 設定** 區塊
3. 取消勾選 **使用模擬 API**
4. 在輸入框貼上您的 API Key
5. 點擊 **保存 API Key** 按鈕
6. 看到 **✓ 已設定** 狀態即表示成功

### 方式二：直接修改程式碼

在 `src/components/ChatInterface.vue` 中修改：

```javascript
const apiKey = ref("YOUR_API_KEY_HERE");
const useMockApi = ref(false);
```

## 💾 資料持久化

- API Key 會自動儲存在瀏覽器的 localStorage 中
- 下次開啟應用程式時會自動載入
- 點擊 **清除** 按鈕可以刪除已儲存的 API Key

## 🔒 安全性提醒

⚠️ **重要**：

- 不要將 API Key 公開分享或提交到 Git
- 建議將 `.env` 檔案加入 `.gitignore`
- 定期更新和輪換 API Key
- 在 Google Cloud Console 設定 API 使用限制

## 🧪 測試模式

如果暫時沒有 API Key，可以：

1. 勾選 **使用模擬 API** 選項
2. 使用內建的模擬回應進行測試
3. 模擬模式不會呼叫真實的 Gemini API

## ❓ 常見問題

### Q: API Key 無效？

- 確認 Key 格式正確（以 `AIza` 開頭）
- 檢查是否完整複製（包含所有字元）
- 確認 API Key 已啟用 Gemini API

### Q: 出現配額錯誤？

- 檢查 Google Cloud 專案的配額限制
- 可能需要啟用計費帳戶
- 查看 [定價說明](https://ai.google.dev/pricing)

### Q: 如何切換回模擬模式？

- 勾選 **使用模擬 API** 即可
- 已保存的 API Key 不會被刪除

## 📚 相關資源

- [Gemini API 文件](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [API 定價](https://ai.google.dev/pricing)
- [安全性最佳實踐](https://ai.google.dev/docs/safety_setting)
