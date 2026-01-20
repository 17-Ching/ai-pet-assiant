/**
 * Gemini Pet AI Assistant Service
 * 封裝 Gemini API 與 RAG 檢索邏輯
 */

import { GoogleGenAI } from "@google/genai";
import {
  loadKnowledgeBase as loadKB,
  getKnowledgeBase,
} from "./knowledgeManager.js";

// 初始化 Gemini AI Client
let genAI = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("請在 .env 檔案中設定 VITE_GEMINI_API_KEY");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

/**
 * 載入知識庫（使用動態知識庫管理器）
 * @returns {Promise<Object>} 知識庫資料
 */
export async function loadKnowledgeBase() {
  return await loadKB();
}

/**
 * 高風險評估函數
 * 偵測緊急醫療關鍵字
 * @param {string} message 使用者訊息
 * @returns {Object} { isHighRisk: boolean, riskType: string, matchedKeywords: string[] }
 */
export function riskAssessment(message) {
  const knowledgeBase = getKnowledgeBase();

  // 從知識庫讀取緊急關鍵字，如果沒有則使用預設值
  const criticalKeywords = knowledgeBase?.emergency_keywords?.critical
    ?.keywords ||
    knowledgeBase?.emergency_keywords?.critical || [
      "抽搐",
      "發紫",
      "大量出血",
      "意識不清",
      "昏迷",
      "無法呼吸",
      "呼吸停止",
      "呼吸急促",
    ];
  const poisoningKeywords = knowledgeBase?.emergency_keywords?.poisoning
    ?.keywords ||
    knowledgeBase?.emergency_keywords?.poisoning || [
      "誤食",
      "中毒",
      "吃到清潔劑",
      "農藥",
      "殺蟲劑",
      "老鼠藥",
      "吃了",
      "吃到",
    ];
  const toxicFoods = knowledgeBase?.emergency_keywords?.toxic_foods?.keywords ||
    knowledgeBase?.emergency_keywords?.toxic_foods || [
      "葡萄",
      "巧克力",
      "洋蔥",
      "大蒜",
      "木糖醇",
      "酒精",
      "咖啡因",
    ];
  const severeSymptoms = [
    "持續嘔吐",
    "嘔吐超過",
    "24小時",
    "大量嘔血",
    "血便",
    "無法站立",
  ];

  // 檢查是否為詢問句（不是緊急情況）
  const isQuestion =
    message.includes("可以") ||
    message.includes("能不能") ||
    message.includes("？") ||
    message.includes("嗎") ||
    message.includes("是否");

  const matchedCritical = criticalKeywords.filter((kw) => message.includes(kw));
  const matchedPoisoning = poisoningKeywords.filter((kw) =>
    message.includes(kw),
  );
  const matchedToxic = toxicFoods.filter((kw) => message.includes(kw));
  const matchedSevere = severeSymptoms.filter((kw) => message.includes(kw));

  // 判定是否為高風險
  // 如果是詢問句且只匹配到有毒食物，不視為緊急情況
  const isHighRisk =
    matchedCritical.length > 0 ||
    matchedPoisoning.length > 0 ||
    (matchedToxic.length > 0 && !isQuestion) ||
    matchedSevere.length > 0;

  let riskType = "normal";
  if (matchedCritical.length > 0) riskType = "critical";
  else if (matchedPoisoning.length > 0) riskType = "poisoning";
  else if (matchedToxic.length > 0) riskType = "toxic_food";
  else if (matchedSevere.length > 0) riskType = "severe_symptom";

  return {
    isHighRisk,
    riskType,
    matchedKeywords: [
      ...matchedCritical,
      ...matchedPoisoning,
      ...matchedToxic,
      ...matchedSevere,
    ],
  };
}

/**
 * 在知識庫中搜尋相關內容
 * @param {string} query 查詢字串
 * @param {string} species 物種 (dog/cat)
 * @returns {Array} 匹配的知識條目
 */
export function searchKnowledge(query, species = null) {
  const knowledgeBase = getKnowledgeBase();
  if (!knowledgeBase || !knowledgeBase.entries) return [];

  const queryLower = query.toLowerCase();

  const results = knowledgeBase.entries
    .map((entry) => {
      let score = 0;

      // 完整標題匹配（最高分）
      if (entry.topic === query || entry.topic.toLowerCase() === queryLower) {
        score += 100;
      }
      // 標題包含查詢
      else if (entry.topic.includes(query) || query.includes(entry.topic)) {
        score += 50;
      }
      // 標題部分匹配
      else if (
        queryLower.includes(entry.topic.toLowerCase()) ||
        entry.topic.toLowerCase().includes(queryLower)
      ) {
        score += 30;
      }

      // 關鍵字精確匹配
      const keywordMatch = entry.keywords?.some(
        (kw) => query.includes(kw) || queryLower.includes(kw.toLowerCase()),
      );
      if (keywordMatch) score += 40;

      // 內容匹配
      if (query.length > 2 && entry.content.includes(query)) {
        score += 20;
      }

      // 物種過濾（不匹配則分數為0）
      if (species && entry.species && !entry.species.includes(species)) {
        score = 0;
      }

      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.entry);

  return results;
}

/**
 * 建構 Gemini Prompt
 * @param {Object} params 參數物件
 * @returns {string} 完整 Prompt
 */
function buildPrompt({ message, petProfile, relevantKnowledge, riskInfo }) {
  const knowledgeContext =
    relevantKnowledge.length > 0
      ? relevantKnowledge
          .map(
            (k, idx) =>
              `${idx + 1}. 【${k.topic}】\n   內容：${k.content}\n   來源：${k.source}`,
          )
          .join("\n\n")
      : "（知識庫中無相關資訊）";

  const hasKnowledge = relevantKnowledge.length > 0;

  const systemPrompt = `你是一個專業的寵物健康 AI 助手。請根據以下規則回答問題：

## 🚨 最重要規則
${
  hasKnowledge
    ? `1. **嚴格使用知識庫內容**：我已經為你檢索到 ${relevantKnowledge.length} 筆相關知識，你必須完全基於這些知識來回答，不要添加知識庫以外的資訊。
2. **直接回答**：用知識庫的內容直接回答問題，不要說「根據知識庫」或「資料顯示」這類開場白。
3. **必須引用來源**：回答結尾處標註「📚 資料來源：${relevantKnowledge.map((k) => k.source).join("、")}」`
    : `1. **專業建議**：知識庫中無相關資訊，請根據你的專業知識提供建議。
2. **提醒諮詢**：務必提醒飼主若有疑慮應諮詢專業獸醫師。`
}
4. **高風險優先**：若涉及緊急情況（抽搐、中毒、大量出血等），第一句話必須是「⚠️ 緊急建議：請立即就醫！」
5. **禁忌食物警告**：提及葡萄、巧克力、洋蔥等禁忌食物時，必須明確給出中毒風險警告。

## 寵物資料
- 物種：${
    petProfile.species === "dog"
      ? "狗"
      : petProfile.species === "cat"
        ? "貓"
        : petProfile.species || "未知"
  }
- 年齡：${petProfile.age || "未知"}
- 體重：${petProfile.weight || "未知"} 公斤

## 知識庫檢索結果
${knowledgeContext}

## 風險評估
${
  riskInfo.isHighRisk
    ? `⚠️ 偵測到高風險關鍵字：${riskInfo.matchedKeywords.join("、")}`
    : "無特殊風險"
}

## 使用者問題
${message}

${hasKnowledge ? "請直接使用上述知識庫內容回答，用親切專業的語氣，繁體中文。" : "請以繁體中文回答，語氣親切專業。"}`;

  return systemPrompt;
}

/**
 * 呼叫 Gemini API（使用官方 SDK）
 * @param {string} prompt 完整 Prompt
 * @returns {Promise<string>} AI 回應內容
 */
async function callGeminiAPI(prompt) {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    return response.text || "無法取得回應";
  } catch (error) {
    console.error("Gemini API 錯誤:", error);
    throw error;
  }
}

/**
 * 主要對話函數 - POST /chat
 * @param {Object} params
 * @param {Object} params.pet_profile - { species, age, weight }
 * @param {string} params.message - 使用者訊息
 * @returns {Promise<Object>} API 回應格式
 */
export async function chat({ pet_profile, message }) {
  // 1. 確保知識庫已載入
  await loadKnowledgeBase();

  // 2. 風險評估
  const riskInfo = riskAssessment(message);

  // 3. 搜尋相關知識
  const relevantKnowledge = searchKnowledge(message, pet_profile?.species);

  // 調試日誌
  console.log("🔍 檢索結果:", {
    message,
    species: pet_profile?.species,
    foundCount: relevantKnowledge.length,
    topics: relevantKnowledge.map((k) => k.topic),
  });

  // 4. 如果找到知識庫內容，直接使用不要問 AI
  if (relevantKnowledge.length > 0 && !riskInfo.isHighRisk) {
    console.log("✅ 使用知識庫直接回答");
    const primaryKnowledge = relevantKnowledge[0];
    const answer = primaryKnowledge.content;
    const citations = relevantKnowledge.map((k) => k.source);

    return {
      answer: answer + `\n\n📚 資料來源：${citations.join("、")}`,
      citations: citations,
      risk_level: primaryKnowledge.risk_level || "low",
      suggested_next_actions: ["定期觀察寵物狀況", "如有疑慮請諮詢獸醫"],
    };
  }

  // 5. 決定風險等級
  let risk_level = "low";
  if (riskInfo.isHighRisk) {
    risk_level = "high";
  } else if (relevantKnowledge.some((k) => k.risk_level === "medium")) {
    risk_level = "medium";
  } else if (relevantKnowledge.some((k) => k.risk_level === "high")) {
    risk_level = "high";
  }

  // 6. 建構 Prompt
  const prompt = buildPrompt({
    message,
    petProfile: pet_profile || {},
    relevantKnowledge,
    riskInfo,
  });

  // 7. 高風險情況強制回應
  if (riskInfo.isHighRisk) {
    const toxicKnowledge = relevantKnowledge.filter(
      (k) => k.risk_level === "high",
    );

    // 只使用第一個最相關的高風險條目，避免回答過長
    const primaryKnowledge = toxicKnowledge[0];
    const citations = primaryKnowledge
      ? [primaryKnowledge.source]
      : ["寵物急診臨床規範"];
    const additionalInfo = primaryKnowledge
      ? primaryKnowledge.content
      : "這是高風險情況";

    return {
      answer: `⚠️ 緊急建議：請立即就醫！\n\n${additionalInfo}\n\n這是緊急情況，請立即聯繫最近的動物醫院。時間就是生命，請不要延誤！`,
      citations: citations,
      risk_level: "high",
      suggested_next_actions: [
        "立即撥打動物急診專線",
        "搜尋附近 24 小時動物醫院",
        "記錄發病時間與症狀",
        "準備就醫所需資料",
      ],
    };
  }

  // 7. 一般情況呼叫 Gemini API（包含無知識庫匹配的情況）
  try {
    const aiResponse = await callGeminiAPI(prompt);
    const citations = relevantKnowledge.map((k) => k.source);

    // 如果沒有知識庫資料，說明這是 Gemini 的純 AI 回應
    if (citations.length === 0) {
      citations.push("Gemini AI 助手");
    }

    // 根據知識庫內容決定建議行動
    let suggested_next_actions = ["定期觀察寵物狀況"];
    if (risk_level === "medium") {
      suggested_next_actions = [
        "持續觀察症狀變化",
        "若情況惡化請就醫",
        "記錄症狀發生時間",
      ];
    } else if (relevantKnowledge.length === 0) {
      // 沒有知識庫匹配時，建議諮詢獸醫
      suggested_next_actions = [
        "建議諮詢專業獸醫師",
        "定期觀察寵物狀況",
        "如有疑慮請立即就醫",
      ];
    }

    return {
      answer: aiResponse,
      citations: [...new Set(citations)],
      risk_level,
      suggested_next_actions,
    };
  } catch (error) {
    console.warn("⚠️ Gemini API 呼叫失敗，使用本地知識庫回應:", error.message);

    // API 失敗時使用本地知識庫回應
    if (relevantKnowledge.length > 0) {
      const knowledgeAnswer = relevantKnowledge
        .map((k) => k.content)
        .join("\n\n");
      const fallbackMessage = error.message.includes("429")
        ? "ℹ️ 目前 API 請求繁忙，以下是來自本地知識庫的資訊：\n\n"
        : "ℹ️ 以下是來自本地知識庫的資訊：\n\n";

      return {
        answer: fallbackMessage + knowledgeAnswer,
        citations: [...new Set(relevantKnowledge.map((k) => k.source))],
        risk_level,
        suggested_next_actions:
          risk_level === "medium"
            ? ["持續觀察症狀變化", "若情況惡化請就醫"]
            : ["定期觀察寵物狀況", "如有疑慮請諮詢獸醫"],
      };
    }

    // 完全沒有知識庫資料且 API 失敗時，返回無法回應訊息
    return {
      answer:
        "⚠️ 抱歉，目前無法連接 AI 服務，且知識庫中沒有相關資訊。為了寵物安全，建議您直接諮詢專業獸醫師。",
      citations: [],
      risk_level: "low",
      suggested_next_actions: [
        "諮詢專業獸醫師",
        "搜尋官方寵物照護資源",
        "記錄寵物症狀以便就醫時提供",
      ],
    };
  }
}

/**
 * 模擬 API（開發測試用）
 * 不需要真實 API Key
 */
export async function chatMock({ pet_profile, message }) {
  await loadKnowledgeBase();

  const riskInfo = riskAssessment(message);
  const relevantKnowledge = searchKnowledge(message, pet_profile?.species);

  // 決定風險等級
  let risk_level = "low";
  if (riskInfo.isHighRisk) {
    risk_level = "high";
  } else if (relevantKnowledge.some((k) => k.risk_level === "medium")) {
    risk_level = "medium";
  } else if (relevantKnowledge.some((k) => k.risk_level === "high")) {
    risk_level = "high";
  }

  // 無匹配知識 - 拒答
  if (relevantKnowledge.length === 0 && !riskInfo.isHighRisk) {
    return {
      answer:
        "抱歉，目前知識庫中沒有相關資訊，為了寵物安全，我不提供未經證實的建議。建議您諮詢專業獸醫師。",
      citations: [],
      risk_level: "low",
      suggested_next_actions: ["諮詢專業獸醫師", "查閱官方寵物照護資源"],
    };
  }

  // 高風險情況
  if (riskInfo.isHighRisk) {
    const toxicKnowledge = relevantKnowledge.filter(
      (k) => k.risk_level === "high",
    );
    const citations = toxicKnowledge.map((k) => k.source);
    const additionalInfo =
      toxicKnowledge.length > 0
        ? toxicKnowledge.map((k) => k.content).join(" ")
        : "請立即就醫，這是緊急情況！";

    return {
      answer: `⚠️ 緊急建議：請立即就醫！\n\n${additionalInfo}\n\n這是緊急情況，請立即聯繫最近的動物醫院。時間就是生命，請不要延誤！`,
      citations: citations.length > 0 ? citations : ["寵物急診臨床規範"],
      risk_level: "high",
      suggested_next_actions: [
        "立即撥打動物急診專線",
        "搜尋附近 24 小時動物醫院",
        "記錄發病時間與症狀",
        "準備就醫所需資料",
      ],
    };
  }

  // 一般情況
  return {
    answer:
      relevantKnowledge.map((k) => k.content).join("\n\n") +
      "\n\n📚 資料來源：" +
      relevantKnowledge.map((k) => k.source).join("、"),
    citations: [...new Set(relevantKnowledge.map((k) => k.source))],
    risk_level,
    suggested_next_actions:
      risk_level === "medium"
        ? ["持續觀察症狀變化", "若情況惡化請就醫", "記錄症狀發生時間"]
        : ["定期觀察寵物狀況", "維持正常飲食作息"],
  };
}

export default {
  loadKnowledgeBase,
  riskAssessment,
  searchKnowledge,
  chat,
  chatMock,
};
