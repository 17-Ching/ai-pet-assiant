/**
 * 動態知識庫管理器
 * 支援不改程式碼即可更新知識的機制
 */

let manifest = null;
let knowledgeCache = null;

/**
 * 載入 manifest.json
 */
export async function loadManifest() {
  try {
    const response = await fetch("/manifest.json?t=" + Date.now());
    if (!response.ok) throw new Error("無法載入 manifest.json");

    manifest = await response.json();
    console.log("📋 Manifest 載入成功 v" + manifest.version);
    return manifest;
  } catch (error) {
    console.error("❌ Manifest 載入失敗:", error);
    throw error;
  }
}

/**
 * 載入知識庫
 */
export async function loadKnowledgeBase() {
  try {
    if (!manifest) {
      await loadManifest();
    }

    const mainSource = manifest.knowledge_sources.find(
      (s) => s.id === "main-knowledge" && s.enabled
    );
    if (!mainSource) {
      throw new Error("主要知識源未啟用");
    }

    const response = await fetch(mainSource.path + "?t=" + Date.now());
    if (!response.ok) throw new Error("無法載入知識庫");

    knowledgeCache = await response.json();
    console.log(
      `✅ 知識庫載入成功 v${knowledgeCache.version}，共 ${
        knowledgeCache.entries?.length || 0
      } 筆資料`
    );

    return knowledgeCache;
  } catch (error) {
    console.error("❌ 知識庫載入失敗:", error);
    throw error;
  }
}

/**
 * 獲取版本資訊
 */
export function getVersionInfo() {
  if (!manifest) {
    return {
      version: "Unknown",
      last_update: "",
      update_records: [],
    };
  }

  return {
    version: manifest.version,
    last_update: manifest.last_update,
    update_records: manifest.update_records || [],
    project: manifest.project,
  };
}

/**
 * 清除快取（強制重新載入）
 */
export function clearCache() {
  manifest = null;
  knowledgeCache = null;
  console.log("🔄 知識庫快取已清除");
}

/**
 * 獲取知識庫內容
 */
export function getKnowledgeBase() {
  return knowledgeCache;
}
