/**
 * Vercel Serverless Function - 儲存知識庫
 *
 * ⚠️ 注意：Vercel 檔案系統是唯讀的，無法直接寫入 knowledge.json
 *
 * 解決方案選項：
 * 1. 使用 Vercel Blob Storage（需要付費方案）
 * 2. 使用 GitHub API 直接更新倉庫中的 knowledge.json（推薦）
 * 3. 使用外部資料庫（MongoDB、Supabase 等）
 *
 * 本範例使用 GitHub API 方案
 */

module.exports = async function handler(req, res) {
  // 只允許 POST 請求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { version, last_update, entries, updateNotes } = req.body;

    if (!version || !entries || !Array.isArray(entries)) {
      return res.status(400).json({
        error: "缺少必要欄位：version, entries",
      });
    }

    // 準備新的知識庫資料
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
      emergency_keywords: {
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

    // 方案：使用 GitHub API 更新知識庫
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // 格式: owner/repo

    if (!githubToken || !githubRepo) {
      // 如果沒有設定 GitHub，返回成功但說明需要手動更新
      console.log("⚠️ 未設定 GitHub Token，知識庫更新將在下次部署時生效");

      return res.status(200).json({
        success: true,
        message: "知識庫已接收，將在下次部署時生效",
        note: "由於 Vercel 限制，需要手動更新 public/knowledge.json 並重新部署",
        data: newKnowledgeBase,
        backupFile: `knowledge_backup_${new Date().toISOString().split("T")[0]}.json`,
      });
    }

    // 使用 GitHub API 更新檔案
    const [owner, repo] = githubRepo.split("/");
    const filePath = "public/knowledge.json";

    // 1. 獲取當前檔案的 SHA（GitHub 需要）
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    const fileData = await getFileResponse.json();

    // 2. 更新檔案
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `更新知識庫到版本 ${version}`,
          content: Buffer.from(
            JSON.stringify(newKnowledgeBase, null, 2),
          ).toString("base64"),
          sha: fileData.sha,
          branch: "main", // 或 'master'，根據你的分支名稱
        }),
      },
    );

    if (!updateResponse.ok) {
      throw new Error("GitHub API 更新失敗");
    }

    return res.status(200).json({
      success: true,
      message: "知識庫已成功更新到 GitHub",
      note: "Vercel 將自動重新部署，約 1-2 分鐘後生效",
      version: version,
      entries: entries.length,
    });
  } catch (error) {
    console.error("❌ 儲存失敗:", error);
    return res.status(500).json({
      error: "儲存失敗",
      message: error.message,
      hint: "請確認 GITHUB_TOKEN 和 GITHUB_REPO 環境變數已正確設定",
    });
  }
};
