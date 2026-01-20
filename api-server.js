/**
 * 寵物 AI 助手 - API Server
 * 符合比賽要求的 REST API 實作
 */

import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化 Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;

if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log("✅ Gemini API 已初始化（使用環境變數）");
  } catch (error) {
    console.error("❌ Gemini API 初始化失敗:", error.message);
  }
} else {
  console.log("⚠️  未設定 GEMINI_API_KEY 環境變數");
  console.log("💡 提示：在 .env 檔案中設定 GEMINI_API_KEY=您的金鑰");
  console.log("🔄 將使用備援知識庫模式回答問題");
}

// 中間件
app.use(cors());
app.use(express.json());

// 設定檔案上傳（使用記憶體儲存）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
});

// 載入知識庫（模擬）
let knowledgeBase = null;
try {
  const knowledgePath = join(__dirname, "public", "knowledge.json");
  const content = readFileSync(knowledgePath, "utf-8");
  // 移除 BOM 標記
  const cleanContent = content.replace(/^\uFEFF/, "");
  knowledgeBase = JSON.parse(cleanContent);
  console.log(
    "✅ 知識庫載入成功:",
    knowledgeBase.entries?.length || 0,
    "筆資料",
  );
} catch (error) {
  console.error("❌ 知識庫載入失敗:", error.message);
  // 使用內建知識庫作為備援
  knowledgeBase = {
    version: "1.0.0",
    entries: [
      {
        id: "feed-001",
        question: "幼犬一天建議餵幾餐？",
        answer:
          "幼犬（2-6個月大）建議一天餵食3-4餐，6個月以上可減為2-3餐，成犬後改為每天1-2餐即可。少量多餐有助於幼犬消化吸收。",
        keywords: ["幼犬", "餵幾餐", "餵食", "一天"],
        risk_level: "low",
      },
      {
        id: "feed-002",
        question: "貓咪可以只喝牛奶不喝水嗎？",
        answer:
          "不可以！多數成貓有乳糖不耐症，喝牛奶可能導致腹瀉。貓咪需要充足的清水，不能用牛奶取代。建議每天提供新鮮乾淨的飲用水。",
        keywords: ["貓咪", "牛奶", "喝水", "不喝水"],
        risk_level: "medium",
      },
      {
        id: "health-001",
        question: "狗多久需要驅蟲一次？",
        answer:
          "體內驅蟲：幼犬每月一次，成犬每3個月一次。體外驅蟲：每月一次（特別是春夏季）。建議諮詢獸醫制定個別化驅蟲計劃。",
        keywords: ["驅蟲", "多久", "狗"],
        risk_level: "low",
      },
      {
        id: "health-002",
        question: "貓咪結紮後飲食要注意什麼？",
        answer:
          "結紮後代謝降低，容易發胖。建議：1) 改用結紮專用飼料 2) 控制食量，避免過量 3) 增加運動量 4) 定期監測體重。保持理想體態很重要。",
        keywords: ["結紮", "飲食", "注意", "貓咪"],
        risk_level: "low",
      },
      {
        id: "danger-001",
        question: "狗狗可以吃葡萄嗎？",
        answer:
          "絕對不可以！葡萄和葡萄乾對狗狗有劇毒，即使少量也可能導致急性腎衰竭。如果誤食請立即就醫！",
        keywords: ["葡萄", "吃", "狗"],
        risk_level: "high",
      },
    ],
  };
  console.log("⚠️  使用內建備援知識庫");
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
app.post("/chat", async (req, res) => {
  try {
    const { user_id, pet_profile, message } = req.body;

    // 驗證必填欄位
    if (!message) {
      return res.status(400).json({
        error: "message 為必填欄位",
      });
    }

    // 記錄請求（可選）
    console.log(`📨 收到訊息 [用戶: ${user_id || "匿名"}]: ${message}`);

    // 這裡應該調用 Gemini API，但為了示範先用模擬回應
    const response = await generateResponse(message, pet_profile);

    // 回傳符合格式的回應
    res.json(response);
  } catch (error) {
    console.error("❌ API 錯誤:", error);
    res.status(500).json({
      error: "伺服器錯誤",
      message: error.message,
    });
  }
});

/**
 * GET /health - 健康檢查
 */
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    version: knowledgeBase?.version || "unknown",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /knowledge - 獲取知識庫資訊
 */
app.get("/knowledge", (req, res) => {
  res.json({
    version: knowledgeBase?.version,
    last_update: knowledgeBase?.last_update,
    categories: knowledgeBase?.categories || [],
    entry_count: knowledgeBase?.entries?.length || 0,
  });
});

/**
 * API 端點：從 PDF 檔案提取知識條目
 */
app.post("/api/extract-knowledge", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "未上傳檔案" });
    }

    if (!genAI) {
      return res.status(503).json({
        error: "Gemini API 未初始化，無法處理 PDF 檔案",
        hint: "請設定 GEMINI_API_KEY 環境變數",
      });
    }

    const file = req.file;

    // 將檔案上傳到 Gemini File API
    console.log(
      `📄 正在處理 PDF: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`,
    );

    const uploadResult = await genAI.fileManager.uploadFile(file.buffer, {
      mimeType: file.mimetype,
      displayName: file.originalname,
    });

    console.log(`✅ 檔案已上傳到 Gemini: ${uploadResult.file.name}`);

    // 使用 Gemini 分析並提取知識
    const prompt = `
請分析這份寵物健康文件，並提取出結構化的知識條目。

請以 JSON 格式返回，包含以下欄位：
- id: 唯一識別碼（使用 "pdf-" 前綴加上序號）
- category: 類別（醫療急救、餵養、日常照護、禁忌 其中之一）
- topic: 標題（簡短明確）
- keywords: 關鍵字陣列（3-8個相關詞彙）
- content: 詳細內容（保留重要資訊）
- source: 來源（使用檔案名稱）
- species: 適用物種陣列（["dog"] 或 ["cat"] 或 ["dog", "cat"]）
- risk_level: 風險等級（"low", "medium", "high"）

請返回 JSON 陣列格式，例如：
[
  {
    "id": "pdf-001",
    "category": "餵養",
    "topic": "幼犬營養需求",
    "keywords": ["幼犬", "營養", "餵食", "成長"],
    "content": "詳細內容...",
    "source": "${file.originalname}",
    "species": ["dog"],
    "risk_level": "low"
  }
]
`;

    const model = genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        { text: prompt },
        {
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri,
          },
        },
      ],
    });

    const result = await model;
    const responseText = result.response.text();

    // 提取 JSON（移除可能的 markdown 標記）
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const entries = JSON.parse(jsonText);

    console.log(`✅ 成功提取 ${entries.length} 筆知識條目`);

    res.json({
      success: true,
      entries: entries,
      file_info: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      },
    });
  } catch (error) {
    console.error("❌ PDF 處理失敗:", error);
    res.status(500).json({
      error: "PDF 處理失敗",
      message: error.message,
    });
  }
});

/**
 * API 端點：儲存知識庫
 */
app.post("/api/knowledge/save", async (req, res) => {
  try {
    const { version, last_update, entries, updateNotes } = req.body;

    if (!version || !entries || !Array.isArray(entries)) {
      return res.status(400).json({
        error: "缺少必要欄位：version, entries",
      });
    }

    // 準備新的知識庫資料
    const knowledgePath = join(__dirname, "public", "knowledge.json");
    const manifestPath = join(__dirname, "public", "manifest.json");

    // 1. 備份現有知識庫
    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const backupPath = join(
      __dirname,
      "public",
      `knowledge_backup_${timestamp}.json`,
    );

    try {
      copyFileSync(knowledgePath, backupPath);
      console.log(`✅ 已備份知識庫: knowledge_backup_${timestamp}.json`);
    } catch (backupError) {
      console.warn("⚠️  備份失敗（檔案可能不存在）:", backupError.message);
    }

    // 2. 載入現有的 manifest
    let manifest = {};
    try {
      const manifestContent = readFileSync(manifestPath, "utf-8");
      manifest = JSON.parse(manifestContent.replace(/^\uFEFF/, ""));
    } catch (error) {
      console.warn("⚠️  無法載入 manifest，將建立新的");
      manifest = {
        version: "1.0.0",
        project: "Pet AI Assistant - 寵物健康智能助手",
        knowledge_sources: [
          {
            id: "main-knowledge",
            type: "json",
            path: "/knowledge.json",
            enabled: true,
            description: "主要寵物健康知識庫",
          },
        ],
        update_records: [],
        features: {
          risk_assessment: true,
          citation_tracking: true,
          anti_hallucination: true,
          dynamic_update: true,
          multi_species: ["dog", "cat"],
          categories: ["醫療急救", "餵養", "日常照護", "禁忌"],
        },
      };
    }

    // 3. 更新 manifest
    manifest.version = version;
    manifest.last_update = last_update;

    // 添加更新記錄
    const changes = updateNotes
      ? updateNotes.split("\n").filter((line) => line.trim())
      : [`更新知識庫，共 ${entries.length} 筆條目`];

    manifest.update_records.unshift({
      version: version,
      date: last_update,
      changes: changes,
    });

    // 保留最近 10 筆更新記錄
    if (manifest.update_records.length > 10) {
      manifest.update_records = manifest.update_records.slice(0, 10);
    }

    // 4. 準備新的知識庫資料
    const newKnowledgeBase = {
      version: version,
      last_update: last_update,
      categories: {
        醫療急救: { description: "寵物醫療急救相關知識" },
        餵養: { description: "寵物餵養與營養相關" },
        日常照護: { description: "日常清潔照護與環境管理" },
        禁忌: { description: "寵物飲食與行為禁忌事項" },
      },
      entries: entries,
      emergency_keywords: knowledgeBase?.emergency_keywords || {
        critical: {
          keywords: [
            "抽搐",
            "發紫",
            "大量出血",
            "意識不清",
            "昏迷",
            "無法呼吸",
          ],
          risk_level: "high",
        },
        poisoning: {
          keywords: ["誤食", "中毒", "吃到", "農藥", "清潔劑"],
          risk_level: "high",
        },
        toxic_foods: {
          keywords: ["葡萄", "巧克力", "洋蔥", "大蒜", "木糖醇"],
          risk_level: "high",
        },
      },
    };

    // 5. 寫入新的知識庫和 manifest
    writeFileSync(
      knowledgePath,
      JSON.stringify(newKnowledgeBase, null, 2),
      "utf-8",
    );
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

    // 6. 重新載入知識庫到記憶體
    knowledgeBase = newKnowledgeBase;

    console.log(
      `✅ 知識庫已更新: 版本 ${version}, 共 ${entries.length} 筆條目`,
    );

    res.json({
      success: true,
      message: "知識庫儲存成功",
      version: version,
      entry_count: entries.length,
      backupFile: `knowledge_backup_${timestamp}.json`,
    });
  } catch (error) {
    console.error("❌ 知識庫儲存失敗:", error);
    res.status(500).json({
      error: "知識庫儲存失敗",
      message: error.message,
    });
  }
});

/**
 * 生成回應（使用 Gemini API）
 */
async function generateResponse(message, petProfile) {
  const lowerMessage = message.toLowerCase();
  let risk_level = "low";
  let suggested_next_actions = [];
  let citations = ["Gemini AI 寵物助手"];

  // 風險評估
  const criticalKeywords = [
    "抽搐",
    "發紫",
    "大量出血",
    "意識不清",
    "昏迷",
    "無法呼吸",
  ];
  const toxicFoods = ["葡萄", "巧克力", "洋蔥", "大蒜", "木糖醇"];
  const mediumKeywords = ["嘔吐", "拉肚子", "不吃", "精神不好"];

  if (
    criticalKeywords.some((kw) => lowerMessage.includes(kw)) ||
    toxicFoods.some((kw) => lowerMessage.includes(kw))
  ) {
    risk_level = "high";
    suggested_next_actions = [
      "立即聯繫獸醫",
      "搜尋附近24小時動物醫院",
      "記錄症狀時間",
    ];
  } else if (mediumKeywords.some((kw) => lowerMessage.includes(kw))) {
    risk_level = "medium";
    suggested_next_actions = ["持續觀察症狀", "諮詢專業獸醫", "記錄飲食狀況"];
  } else {
    suggested_next_actions = ["繼續保持良好習慣", "定期健康檢查"];
  }

  // 構建提示詞（使用知識庫作為 context）
  let contextInfo = "";
  console.log(`🔍 搜尋問題: "${message}"`);
  console.log(`🔍 小寫訊息: "${lowerMessage}"`);

  if (knowledgeBase && knowledgeBase.entries) {
    // 找到相關的知識庫內容
    const relevantEntries = knowledgeBase.entries.filter((entry) => {
      const keywords = entry.keywords || [];
      // 對中文關鍵字，直接用原始 message 匹配
      // 對英文關鍵字，使用 lowerMessage 匹配
      const matched = keywords.some(
        (kw) => message.includes(kw) || lowerMessage.includes(kw.toLowerCase()),
      );
      if (matched) {
        console.log(`✅ 匹配到知識庫項目: ${entry.topic || entry.question}`);
        console.log(`   關鍵字: [${keywords.join(", ")}]`);
      }
      return matched;
    });

    console.log(`📊 找到 ${relevantEntries.length} 個匹配項目`);

    if (relevantEntries.length > 0) {
      // 只使用第一個最相關的條目
      const bestEntry = relevantEntries[0];
      contextInfo =
        "\n\n參考知識庫：\n" +
        `- ${bestEntry.topic || bestEntry.question || bestEntry.title}: ${
          bestEntry.content || bestEntry.answer
        }`;
      citations = [bestEntry.source || "寵物健康知識庫"];
      console.log(`📚 知識庫內容長度: ${contextInfo.length} 字元`);

      // 同步風險等級（使用知識庫中的風險等級）
      if (bestEntry.risk_level) {
        risk_level = bestEntry.risk_level;
      }
    }
  }

  // 個性化前綴
  let petInfo = "";
  if (petProfile) {
    const { species, age, weight } = petProfile;
    const speciesName =
      species === "dog" ? "狗狗" : species === "cat" ? "貓咪" : "寵物";
    petInfo = `針對您的${speciesName}${age ? `（${age}歲）` : ""}${
      weight ? `（${weight}kg）` : ""
    }：\n\n`;
  }

  // 調用 Gemini API
  let answer = "";
  try {
    console.log(`🤖 處理問題: "${message}"`);
    console.log(`📊 genAI 狀態: ${genAI ? "已初始化" : "未初始化"}`);
    console.log(`📚 找到相關知識庫: ${contextInfo ? "是" : "否"}`);

    if (genAI) {
      const prompt = `你是專業的寵物健康助手。請用繁體中文回答以下問題，要專業、準確、易懂。

寵物資料：${JSON.stringify(petProfile || {})}
用戶問題：${message}
${contextInfo}

請提供：
1. 專業且實用的建議
2. 如果涉及健康風險，請明確說明
3. 保持回答在200字內，條列式呈現
4. 語氣友善專業`;

      console.log(`🚀 調用 Gemini API...`);
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      answer = response.text || "無法取得回應";
      console.log(`✅ Gemini 回應成功`);

      // 加上個性化前綴
      if (petInfo) {
        answer = petInfo + answer;
      }
    } else {
      throw new Error("Gemini API 未初始化");
    }
  } catch (error) {
    console.error("❌ Gemini API 調用失敗:", error.message);
    console.log(`🔄 使用降級回應`);

    // 如果有找到知識庫內容，使用知識庫回答
    if (contextInfo) {
      console.log(`📋 使用知識庫回答，contextInfo 長度: ${contextInfo.length}`);
      // 從 contextInfo 中提取答案，支援多行內容
      const match = contextInfo.match(/- [^:]+: (.+)/s);
      if (match) {
        const knowledgeAnswer = match[1].trim();
        answer = petInfo + knowledgeAnswer;
        console.log(
          `✅ 成功提取知識庫答案: ${knowledgeAnswer.substring(0, 50)}...`,
        );
      } else {
        console.log(`❌ 無法從 contextInfo 提取答案，使用預設回應`);
        answer = `${petInfo}建議您諮詢專業獸醫師以獲得更準確的建議。`;
      }
    } else {
      // 降級到預設回應
      console.log(`📋 沒有知識庫匹配，使用預設回應`);
      answer = `${petInfo}建議您諮詢專業獸醫師以獲得更準確的建議。`;
    }
    citations = contextInfo ? citations : ["建議諮詢專業獸醫"];
  }

  return {
    answer,
    citations: Array.from(new Set(citations)), // 去重
    risk_level,
    suggested_next_actions,
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
