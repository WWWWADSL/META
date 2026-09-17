// 初始化裝置選單
document.addEventListener('DOMContentLoaded', async () => {
  const videoSelect = document.getElementById('video-select');
  const audioSelect = document.getElementById('audio-select');
  const connectBtn = document.getElementById('connect-btn');
  const statusTxt = document.getElementById('status');

  // 取得 LiveKit 引用（同時相容 UMD CDN 與本地加載）
  const livekitSDK = window.LiveKitClient || window.LiveKit;

  async function getDevices() {
    if (!livekitSDK) {
      alert('LiveKit SDK 載入失敗，請檢查網路連線。');
      return;
    }

    try {
      // 請求媒體存取權限以取得完整裝置列表
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      videoSelect.innerHTML = '<option value="">請選擇相機</option>';
      audioSelect.innerHTML = '<option value="">請選擇麥克風</option>';

      devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        
        if (device.kind === 'videoinput') {
          option.text = device.label || `相機 ${videoSelect.length}`;
          videoSelect.appendChild(option);
        } else if (device.kind === 'audioinput') {
          option.text = device.label || `麥克風 ${audioSelect.length}`;
          audioSelect.appendChild(option);
        }
      });

      statusTxt.textContent = '狀態：已順利讀取鏡頭與麥克風列表';
    } catch (err) {
      console.error(err);
      statusTxt.textContent = '狀態：無法取得裝置權限，請確認瀏覽器授權。';
    }
  }

  // 綁定選單點擊事件
  videoSelect.addEventListener('click', getDevices, { once: true });
  audioSelect.addEventListener('click', getDevices, { once: true });
});
