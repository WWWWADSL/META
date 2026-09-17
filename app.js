// 自動尋找全域載入的 LiveKit 物件
function getLiveKitSDK() {
  return window.LiveKitClient || window.LivekitClient || window.LiveKit || (window.livekit ? window.livekit : null);
}

document.addEventListener('DOMContentLoaded', () => {
  const videoSelect = document.getElementById('video-select');
  const audioSelect = document.getElementById('audio-select');
  const connectBtn = document.getElementById('connect-btn');
  const statusTxt = document.getElementById('status');

  async function getDevices() {
    const livekitSDK = getLiveKitSDK();

    if (!livekitSDK) {
      alert('LiveKit SDK 載入中，請稍候 3 秒再試一次。');
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
