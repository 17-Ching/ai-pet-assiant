<template>
  <div class="knowledge-admin">
    <!-- 頂部標題欄 -->
    <div class="admin-header">
      <h1>
        <span class="material-symbols-outlined">database</span>
        知識庫管理後台
      </h1>
      <div class="header-actions">
        <span class="version-badge">版本 {{ currentVersion }}</span>
        <button @click="$emit('close')" class="btn-close">
          <span class="material-symbols-outlined">close</span>
          返回
        </button>
      </div>
    </div>

    <!-- 主要內容區 -->
    <div class="admin-content">
      <!-- 左側：檔案上傳區 -->
      <div class="upload-section">
        <h2>
          <span class="material-symbols-outlined">upload_file</span>
          匯入知識
        </h2>

        <!-- 拖放上傳區域 -->
        <div
          class="upload-dropzone"
          :class="{ dragover: isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
        >
          <span class="material-symbols-outlined upload-icon"
            >cloud_upload</span
          >
          <p class="upload-text">拖放檔案至此</p>
          <p class="upload-hint">或點擊下方按鈕選擇檔案</p>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv,.pdf"
            @change="handleFileSelect"
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="btn-select-file">
            <span class="material-symbols-outlined">attach_file</span>
            選擇檔案
          </button>
          <p class="upload-formats">
            支援格式：Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf)
          </p>
        </div>

        <!-- 處理狀態 -->
        <div
          v-if="uploadStatus"
          class="upload-status"
          :class="uploadStatus.type"
        >
          <span class="material-symbols-outlined">
            {{
              uploadStatus.type === "success"
                ? "check_circle"
                : uploadStatus.type === "error"
                  ? "error"
                  : "progress_activity"
            }}
          </span>
          {{ uploadStatus.message }}
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <button @click="downloadTemplate" class="btn-action">
            <span class="material-symbols-outlined">download</span>
            下載 Excel 範本
          </button>
          <button @click="exportToExcel" class="btn-action btn-primary">
            <span class="material-symbols-outlined">file_download</span>
            匯出知識庫
          </button>
          <button @click="addNewEntry" class="btn-action">
            <span class="material-symbols-outlined">add_circle</span>
            手動新增條目
          </button>
          <button @click="clearAll" class="btn-action btn-danger">
            <span class="material-symbols-outlined">delete_sweep</span>
            清空全部
          </button>
        </div>
      </div>

      <!-- 右側：知識條目編輯區 -->
      <div class="editor-section">
        <div class="editor-header">
          <h2>
            <span class="material-symbols-outlined">edit_note</span>
            知識條目編輯
            <span class="entry-count">({{ knowledgeEntries.length }} 筆)</span>
          </h2>
          <button @click="saveKnowledge" class="btn-save" :disabled="isSaving">
            <span class="material-symbols-outlined">save</span>
            {{ isSaving ? "儲存中..." : "儲存知識庫" }}
          </button>
        </div>

        <!-- 表格編輯器 -->
        <div class="table-container">
          <table class="knowledge-table">
            <thead>
              <tr>
                <th style="width: 50px">#</th>
                <th style="width: 100px">類別</th>
                <th style="width: 150px">標題</th>
                <th style="width: 200px">關鍵字</th>
                <th style="width: 300px">內容</th>
                <th style="width: 120px">來源</th>
                <th style="width: 100px">物種</th>
                <th style="width: 80px">風險</th>
                <th style="width: 80px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(entry, index) in knowledgeEntries"
                :key="entry.id"
                class="entry-row"
              >
                <td>{{ index + 1 }}</td>
                <td>
                  <select v-model="entry.category" class="input-select">
                    <option v-for="cat in categories" :key="cat">
                      {{ cat }}
                    </option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="entry.topic"
                    class="input-text"
                    placeholder="標題"
                  />
                </td>
                <td>
                  <input
                    v-model="entry.keywordsString"
                    class="input-text"
                    placeholder="以逗號分隔"
                    @blur="updateKeywordsArray(entry)"
                  />
                </td>
                <td>
                  <textarea
                    v-model="entry.content"
                    class="input-textarea"
                    rows="2"
                  ></textarea>
                </td>
                <td>
                  <input
                    v-model="entry.source"
                    class="input-text"
                    placeholder="資料來源"
                  />
                </td>
                <td>
                  <div class="species-checkboxes">
                    <label
                      ><input
                        type="checkbox"
                        v-model="entry.species"
                        value="dog"
                      />
                      狗</label
                    >
                    <label
                      ><input
                        type="checkbox"
                        v-model="entry.species"
                        value="cat"
                      />
                      貓</label
                    >
                  </div>
                </td>
                <td>
                  <select v-model="entry.risk_level" class="input-select">
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </td>
                <td>
                  <button
                    @click="deleteEntry(index)"
                    class="btn-delete"
                    title="刪除"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
              <tr v-if="knowledgeEntries.length === 0">
                <td colspan="9" class="empty-state">
                  <span class="material-symbols-outlined">inbox</span>
                  <p>尚無知識條目，請上傳檔案或手動新增</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 版本更新對話框 -->
    <div
      v-if="showVersionDialog"
      class="modal-overlay"
      @click.self="showVersionDialog = false"
    >
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>儲存知識庫</h3>
          <button @click="showVersionDialog = false" class="btn-close-modal">
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>新版本號 *</label>
            <input
              v-model="newVersion"
              type="text"
              placeholder="例如: 1.3.0"
              class="input-text"
            />
          </div>
          <div class="form-group">
            <label>更新說明 *</label>
            <textarea
              v-model="updateNotes"
              rows="4"
              placeholder="請輸入本次更新的內容說明，例如：&#10;- 新增犬隻營養知識&#10;- 更新急救處理流程&#10;- 修正錯誤資訊"
              class="input-textarea"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showVersionDialog = false" class="btn-cancel">
            取消
          </button>
          <button @click="confirmSave" class="btn-confirm">確認儲存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { clearCache } from "../services/knowledgeManager";

const emit = defineEmits(["close"]);

// 狀態管理
const currentVersion = ref("");
const knowledgeEntries = ref([]);
const categories = ["醫療急救", "餵養", "日常照護", "禁忌"];
const isDragging = ref(false);
const uploadStatus = ref(null);
const isSaving = ref(false);
const showVersionDialog = ref(false);
const newVersion = ref("");
const updateNotes = ref("");
const fileInput = ref(null);

// 載入現有知識庫
onMounted(async () => {
  try {
    const response = await fetch("/knowledge.json?t=" + Date.now());
    const data = await response.json();
    currentVersion.value = data.version;

    // 轉換知識條目為可編輯格式
    knowledgeEntries.value = data.entries.map((entry) => ({
      ...entry,
      keywordsString: entry.keywords.join(", "),
      species: entry.species || [],
    }));

    uploadStatus.value = {
      type: "success",
      message: `已載入 ${knowledgeEntries.value.length} 筆知識條目`,
    };
  } catch (error) {
    uploadStatus.value = {
      type: "error",
      message: "載入知識庫失敗: " + error.message,
    };
  }
});

// 檔案拖放處理
function handleFileDrop(e) {
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

// 檔案選擇處理
function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

// 處理上傳的檔案
async function processFile(file) {
  uploadStatus.value = {
    type: "loading",
    message: `正在處理 ${file.name}...`,
  };

  try {
    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "xlsx" || fileType === "xls") {
      await parseExcel(file);
    } else if (fileType === "csv") {
      await parseCSV(file);
    } else if (fileType === "pdf") {
      await parsePDF(file);
    } else {
      throw new Error("不支援的檔案格式");
    }
  } catch (error) {
    uploadStatus.value = {
      type: "error",
      message: "檔案處理失敗: " + error.message,
    };
  }
}

// 解析 Excel 檔案
async function parseExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  const newEntries = jsonData.map((row, index) => {
    const keywords = row["關鍵字"] || row["keywords"] || "";
    const keywordArray =
      typeof keywords === "string"
        ? keywords
            .split(/[,、，]/)
            .map((k) => k.trim())
            .filter((k) => k)
        : [];

    const speciesStr = row["物種"] || row["species"] || "dog,cat";
    const speciesArray =
      typeof speciesStr === "string"
        ? speciesStr.split(",").map((s) => s.trim())
        : ["dog", "cat"];

    return {
      id: `import-${Date.now()}-${index}`,
      category: row["類別"] || row["category"] || "餵養",
      topic: row["標題"] || row["topic"] || "",
      keywords: keywordArray,
      keywordsString: keywordArray.join(", "),
      content: row["內容"] || row["content"] || "",
      source: row["來源"] || row["source"] || file.name,
      species: speciesArray,
      risk_level: row["風險等級"] || row["risk_level"] || "low",
    };
  });

  knowledgeEntries.value.push(...newEntries);

  uploadStatus.value = {
    type: "success",
    message: `✅ 成功匯入 ${newEntries.length} 筆知識條目`,
  };
}

// 解析 CSV 檔案
async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      encoding: "UTF-8",
      complete: (results) => {
        try {
          const newEntries = results.data
            .filter((row) => row["標題"] || row["topic"])
            .map((row, index) => {
              const keywords = row["關鍵字"] || row["keywords"] || "";
              const keywordArray = keywords
                .split(/[,、，]/)
                .map((k) => k.trim())
                .filter((k) => k);

              const speciesStr = row["物種"] || row["species"] || "dog,cat";
              const speciesArray = speciesStr.split(",").map((s) => s.trim());

              return {
                id: `import-${Date.now()}-${index}`,
                category: row["類別"] || row["category"] || "餵養",
                topic: row["標題"] || row["topic"] || "",
                keywords: keywordArray,
                keywordsString: keywordArray.join(", "),
                content: row["內容"] || row["content"] || "",
                source: row["來源"] || row["source"] || file.name,
                species: speciesArray,
                risk_level: row["風險等級"] || row["risk_level"] || "low",
              };
            });

          knowledgeEntries.value.push(...newEntries);

          uploadStatus.value = {
            type: "success",
            message: `✅ 成功匯入 ${newEntries.length} 筆知識條目`,
          };
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
}

// 解析 PDF 檔案（使用後端 API）
async function parsePDF(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "http://localhost:3001/api/extract-knowledge",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("PDF 處理失敗");
    }

    const result = await response.json();

    if (result.entries && result.entries.length > 0) {
      const newEntries = result.entries.map((entry) => ({
        ...entry,
        keywordsString: entry.keywords.join(", "),
      }));

      knowledgeEntries.value.push(...newEntries);

      uploadStatus.value = {
        type: "success",
        message: `✅ 成功從 PDF 提取 ${newEntries.length} 筆知識條目`,
      };
    } else {
      throw new Error("無法從 PDF 提取知識條目");
    }
  } catch (error) {
    uploadStatus.value = {
      type: "error",
      message: "PDF 處理失敗: " + error.message + "（請確保後端服務已啟動）",
    };
  }
}

// 更新關鍵字陣列
function updateKeywordsArray(entry) {
  entry.keywords = entry.keywordsString
    .split(/[,，、]/)
    .map((k) => k.trim())
    .filter((k) => k);
}

// 新增條目
function addNewEntry() {
  knowledgeEntries.value.push({
    id: `manual-${Date.now()}`,
    category: "餵養",
    topic: "",
    keywords: [],
    keywordsString: "",
    content: "",
    source: "手動新增",
    species: ["dog", "cat"],
    risk_level: "low",
  });
}

// 刪除條目
function deleteEntry(index) {
  if (confirm("確定要刪除這個知識條目嗎？")) {
    knowledgeEntries.value.splice(index, 1);
  }
}

// 清空全部
function clearAll() {
  if (confirm("確定要清空所有知識條目嗎？此操作無法復原！")) {
    knowledgeEntries.value = [];
  }
}

// 下載範本
function downloadTemplate() {
  const templateData = [
    {
      類別: "餵養",
      標題: "幼犬餵養頻率",
      關鍵字: "幼犬,餵養,頻率,次數",
      內容: "幼犬（1-4個月）建議每天餵食3-4餐，少量多餐。",
      來源: "獸醫師協會照護指南",
      物種: "dog",
      風險等級: "low",
    },
    {
      類別: "禁忌",
      標題: "葡萄禁忌",
      關鍵字: "葡萄,禁忌,不能吃",
      內容: "❌ 絕對不建議！狗狗不可以吃葡萄或葡萄乾，具有高度中毒風險。",
      來源: "寵物毒物學臨床指南",
      物種: "dog,cat",
      風險等級: "high",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "知識庫範本");
  XLSX.writeFile(wb, "寵物知識庫範本.xlsx");
}

// 匯出知識庫為 Excel
function exportToExcel() {
  if (knowledgeEntries.value.length === 0) {
    alert("目前沒有知識條目可以匯出");
    return;
  }

  // 轉換資料格式
  const exportData = knowledgeEntries.value.map((entry) => ({
    ID: entry.id,
    類別: entry.category,
    標題: entry.topic,
    關鍵字: entry.keywords.join(","),
    內容: entry.content,
    來源: entry.source,
    物種: entry.species.join(","),
    風險等級: entry.risk_level,
  }));

  // 建立工作表
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // 設定欄位寬度
  ws["!cols"] = [
    { wch: 25 }, // ID
    { wch: 12 }, // 類別
    { wch: 20 }, // 標題
    { wch: 30 }, // 關鍵字
    { wch: 50 }, // 內容
    { wch: 25 }, // 來源
    { wch: 10 }, // 物種
    { wch: 10 }, // 風險等級
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "知識庫");

  // 生成檔案名稱（包含版本和日期）
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `寵物知識庫_v${currentVersion.value}_${timestamp}.xlsx`;

  XLSX.writeFile(wb, filename);

  uploadStatus.value = {
    type: "success",
    message: `✅ 已匯出 ${knowledgeEntries.value.length} 筆知識條目`,
  };
}

// 儲存知識庫
function saveKnowledge() {
  // 驗證資料
  const hasInvalidEntry = knowledgeEntries.value.some(
    (entry) => !entry.topic || !entry.content || !entry.category,
  );

  if (hasInvalidEntry) {
    alert("❌ 部分條目缺少必填欄位（標題、內容、類別），請檢查！");
    return;
  }

  showVersionDialog.value = true;

  // 自動生成版本號建議
  const versionParts = currentVersion.value.split(".");
  if (versionParts.length === 3) {
    versionParts[1] = parseInt(versionParts[1]) + 1;
    newVersion.value = versionParts.join(".");
  }
}

// 確認儲存
async function confirmSave() {
  if (!newVersion.value || !updateNotes.value) {
    alert("請填寫版本號和更新說明");
    return;
  }

  isSaving.value = true;
  showVersionDialog.value = false;

  try {
    // 準備要儲存的資料
    const knowledgeData = {
      version: newVersion.value,
      last_update: new Date().toISOString().split("T")[0],
      entries: knowledgeEntries.value.map((entry) => ({
        id: entry.id,
        category: entry.category,
        topic: entry.topic,
        keywords: entry.keywords,
        content: entry.content,
        source: entry.source,
        species: entry.species,
        risk_level: entry.risk_level,
      })),
      updateNotes: updateNotes.value,
    };

    // 呼叫後端 API 儲存
    const response = await fetch("http://localhost:3001/api/knowledge/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(knowledgeData),
    });

    if (!response.ok) {
      throw new Error("儲存失敗");
    }

    const result = await response.json();

    // 清除前端知識庫快取，強制重新載入
    clearCache();

    alert(
      `✅ 知識庫儲存成功！\n\n版本：${newVersion.value}\n備份檔：${result.backupFile}\n\n✨ 聊天介面將自動使用新知識`,
    );

    currentVersion.value = newVersion.value;
    newVersion.value = "";
    updateNotes.value = "";
  } catch (error) {
    alert(
      "❌ 儲存失敗: " +
        error.message +
        "\n\n請確保後端服務已啟動（npm run api）",
    );
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.knowledge-admin {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  padding-bottom: 40px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.admin-header h1 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.version-badge {
  background: #667eea;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.btn-close {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: #e0e0e0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-close:hover {
  background: #d0d0d0;
}

.admin-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  min-height: calc(100vh - 140px);
}

/* 上傳區 */
.upload-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.upload-section h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #333;
  margin: 0 0 20px 0;
}

.upload-dropzone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: #f9f9f9;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-dropzone.dragover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-icon {
  font-size: 64px;
  color: #667eea;
  display: block;
  margin: 0 auto 20px;
}

.upload-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

.btn-select-file {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-select-file:hover {
  background: #5568d3;
}

.upload-formats {
  font-size: 12px;
  color: #999;
  margin: 15px 0 0 0;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 14px;
}

.upload-status.success {
  background: #d4edda;
  color: #155724;
}

.upload-status.error {
  background: #f8d7da;
  color: #721c24;
}

.upload-status.loading {
  background: #d1ecf1;
  color: #0c5460;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  justify-content: center;
}

.btn-action:hover {
  background: #f5f5f5;
  border-color: #667eea;
}

.btn-danger {
  color: #dc3545;
}

.btn-danger:hover {
  border-color: #dc3545;
  background: #fff5f5;
}

.btn-primary {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-primary:hover {
  background: #5568d3;
  border-color: #5568d3;
}

/* 編輯區 */
.editor-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #333;
  margin: 0;
}

.entry-count {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-save:hover:not(:disabled) {
  background: #218838;
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.table-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.knowledge-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.knowledge-table thead {
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
}

.knowledge-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.knowledge-table td {
  padding: 8px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.entry-row:hover {
  background: #f8f9fa;
}

.input-text,
.input-select,
.input-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
}

.input-textarea {
  resize: vertical;
  min-height: 50px;
}

.species-checkboxes {
  display: flex;
  gap: 8px;
}

.species-checkboxes label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-delete {
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state .material-symbols-outlined {
  font-size: 64px;
  display: block;
  margin: 0 auto 20px;
}

/* 對話框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-cancel {
  background: #e0e0e0;
  color: #333;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-confirm {
  background: #667eea;
  color: white;
}

.btn-confirm:hover {
  background: #5568d3;
}
</style>
