/**
 * API 測試腳本
 * 用於驗證 POST /chat API 是否符合比賽要求
 */

const testAPI = async () => {
  const baseURL = 'http://localhost:3001';

  console.log('🧪 開始 API 測試...\n');

  // 測試 1: POST /chat - 基本測試
  console.log('📝 測試 1: POST /chat - 基本問題');
  try {
    const response1 = await fetch(`${baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 'test_user_001',
        pet_profile: {
          species: 'dog',
          age: '2',
          weight: '5',
        },
        message: '狗狗可以吃葡萄嗎？',
      }),
    });

    const data1 = await response1.json();
    console.log('✅ 回應狀態:', response1.status);
    console.log('📦 回應內容:');
    console.log(JSON.stringify(data1, null, 2));
    console.log('\n');

    // 驗證回應格式
    if (data1.answer && data1.citations && data1.risk_level && data1.suggested_next_actions) {
      console.log('✅ 回應格式符合比賽要求\n');
    } else {
      console.log('❌ 回應格式不符合要求\n');
    }
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }

  // 測試 2: GET /health
  console.log('📝 測試 2: GET /health - 健康檢查');
  try {
    const response2 = await fetch(`${baseURL}/health`);
    const data2 = await response2.json();
    console.log('✅ 回應狀態:', response2.status);
    console.log('📦 回應內容:');
    console.log(JSON.stringify(data2, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }

  // 測試 3: GET /knowledge
  console.log('📝 測試 3: GET /knowledge - 知識庫資訊');
  try {
    const response3 = await fetch(`${baseURL}/knowledge`);
    const data3 = await response3.json();
    console.log('✅ 回應狀態:', response3.status);
    console.log('📦 回應內容:');
    console.log(JSON.stringify(data3, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }

  // 測試 4: 錯誤處理 - 缺少必填欄位
  console.log('📝 測試 4: 錯誤處理 - 缺少 message 欄位');
  try {
    const response4 = await fetch(`${baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 'test_user',
      }),
    });

    const data4 = await response4.json();
    console.log('✅ 回應狀態:', response4.status);
    console.log('📦 回應內容:');
    console.log(JSON.stringify(data4, null, 2));
    console.log('\n');

    if (response4.status === 400) {
      console.log('✅ 錯誤處理正確\n');
    }
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }

  console.log('🎉 所有測試完成！');
};

// 執行測試
testAPI().catch(console.error);
