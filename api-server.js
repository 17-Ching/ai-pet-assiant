/**
 * 寵物 AI 助手 - API Server
 * 符合比賽要求的 REST API 實作
 */

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 載入知識庫（模擬）
let knowledgeBase = null;
try {
  const knowledgePath = join(__dirname, 'public', 'knowledge.json');
  knowledgeBase = JSON.parse(readFileSync(knowledgePath, 'utf-8'));
  console.log('✅ 知識庫載入成功');
} catch (error) {
  console.error('❌ 知識庫載入失敗:', error.message);
}

/**
 * POST /chat - 主要聊天 API
 * 
 * 請求格式：
 * {
 *   "user_id": "string",
 *   "pet_profile": {
 *     "species": "dog | cat",
 *     "age": "number",
 *     "weight": "number"
 *   },
 *   "message": "string"
 * }
 * 
 * 回應格式：
 * {
 *   "answer": "string",
 *   "citations": ["string"],
 *   "risk_level": "low | medium | high",
 *   "suggested_next_actions": ["string"]
 * }
 */
app.post('/chat', async (req, res) => {
  try {
    const { user_id, pet_profile, message } = req.body;

    // 驗證必填欄位
    if (!message) {
      return res.status(400).json({
        error: 'message 為必填欄位'
      });
    }

    // 記錄請求（可選）
    console.log(`📨 收到訊息 [用戶: ${user_id || '匿名'}]: ${message}`);

    // 這裡應該調用 Gemini API，但為了示範先用模擬回應
    const response = await generateResponse(message, pet_profile);

    // 回傳符合格式的回應
    res.json(response);

  } catch (error) {
    console.error('❌ API 錯誤:', error);
    res.status(500).json({
      error: '伺服器錯誤',
      message: error.message
    });
  }
});

/**
 * GET /health - 健康檢查
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: knowledgeBase?.version || 'unknown',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /knowledge - 獲取知識庫資訊
 */
app.get('/knowledge', (req, res) => {
  res.json({
    version: knowledgeBase?.version,
    last_update: knowledgeBase?.last_update,
    categories: knowledgeBase?.categories || [],
    entry_count: knowledgeBase?.entries?.length || 0
  });
});

/**
 * 生成回應（模擬智能回覆）
 */
async function generateResponse(message, petProfile) {
  // 這裡可以整合真實的 Gemini API
  // 目前使用知識庫進行簡單匹配

  const lowerMessage = message.toLowerCase();
  let answer = '';
  let citations = [];
  let risk_level = 'low';
  let suggested_next_actions = [];

  // 搜尋知識庫
  if (knowledgeBase && knowledgeBase.entries) {
    for (const entry of knowledgeBase.entries) {
      // 簡單的關鍵字匹配
      const keywords = entry.keywords || [];
      const hasMatch = keywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (hasMatch) {
        answer = entry.answer || entry.content;
        citations = entry.source ? [entry.source] : [];
        risk_level = entry.risk_level || 'low';
        
        // 根據風險等級提供建議
        if (risk_level === 'high') {
          suggested_next_actions = [
            '立即聯繫獸醫',
            '搜尋附近24小時動物醫院',
            '記錄症狀時間'
          ];
        } else if (risk_level === 'medium') {
          suggested_next_actions = [
            '持續觀察症狀',
            '諮詢專業獸醫',
            '記錄飲食狀況'
          ];
        } else {
          suggested_next_actions = [
            '繼續保持良好習慣',
            '定期健康檢查'
          ];
        }
        break;
      }
    }
  }

  // 如果沒有匹配，回傳預設回應
  if (!answer) {
    answer = `關於「${message}」的問題，建議您諮詢專業獸醫師以獲得更準確的建議。`;
    citations = ['建議諮詢專業獸醫'];
    suggested_next_actions = ['尋找專業獸醫諮詢', '搜尋相關資訊'];
  }

  // 個性化回應（根據寵物資料）
  if (petProfile) {
    const { species, age, weight } = petProfile;
    const speciesName = species === 'dog' ? '狗狗' : '貓咪';
    
    if (age || weight) {
      answer = `針對您的${speciesName}${age ? `（${age}歲）` : ''}${weight ? `（${weight}kg）` : ''}：\n\n${answer}`;
    }
  }

  return {
    answer,
    citations,
    risk_level,
    suggested_next_actions
  };
}

// 啟動服務器
app.listen(PORT, () => {
  console.log(`
🚀 寵物 AI 助手 API Server 已啟動
📡 監聽端口: ${PORT}
🌐 API 端點:
   - POST http://localhost:${PORT}/chat
   - GET  http://localhost:${PORT}/health
   - GET  http://localhost:${PORT}/knowledge

📝 API 文件範例:
curl -X POST http://localhost:${PORT}/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "user123",
    "pet_profile": {
      "species": "dog",
      "age": "2",
      "weight": "5"
    },
    "message": "狗狗可以吃葡萄嗎？"
  }'
  `);
});

export default app;
