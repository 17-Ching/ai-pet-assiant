/**
 * Vercel Serverless Function - PDF 知識提取
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "Gemini API 未初始化",
        hint: "請在 Vercel 環境變數中設定 VITE_GEMINI_API_KEY",
      });
    }

    // 在 Vercel Serverless Function 中，檔案上傳處理需要不同方式
    // 這裡需要使用 formidable 或其他 multipart 處理庫

    return res.status(501).json({
      error: "PDF 上傳功能在 Vercel 上需要特殊處理",
      message: "建議使用 Excel/CSV 格式匯入，或直接在表格中編輯",
    });
  } catch (error) {
    console.error("❌ PDF 處理失敗:", error);
    return res.status(500).json({
      error: "PDF 處理失敗",
      message: error.message,
    });
  }
}
