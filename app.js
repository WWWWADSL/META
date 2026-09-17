function getLiveKitSDK() {
  return window.LiveKitClient || window.LivekitClient || window.LiveKit || (window.livekit ? window.livekit : null);
}

document.addEventListener('DOMContentLoaded', () => {
  const videoSelect = document.getElementById('video-select');
  const audioSelect = document.getElementById('audio-select');
  const connectBtn = document.getElementById('connect-btn');
  const statusTxt = document.getElementById('status');
  const remoteAudio = document.getElementById('remote-audio');

  let currentRoom = null;

  async function getDevices() {
    try {
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
      statusTxt.textContent = '狀態：無法取得裝置權限，請確認授權。';
    }
  }

  videoSelect.addEventListener('click', getDevices, { once: true });
  audioSelect.addEventListener('click', getDevices, { once: true });

  // 點擊連線按鈕
  connectBtn.addEventListener('click', async () => {
    const livekitSDK = getLiveKitSDK();
    if (!livekitSDK) {
      alert('LiveKit SDK 載入失敗，請重新整理頁面。');
      return;
    }

    const selectedVideoId = videoSelect.value;
    const selectedAudioId = audioSelect.value;

    if (!selectedVideoId || !selectedAudioId) {
      alert('請先選擇相機與麥克風來源！');
      return;
    }

    statusTxt.textContent = '狀態：正在請求 AI 助理 Token...';

    try {
      // 1. 向後端 Token 伺服器請求認證 (請確認後端 API 網址，範例預設使用本地/雲端後端)
      // 若已有部署好的 Token API 網址，請更換下方的 URL
      const response = await fetch('https://your-livekit-backend.com/api/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'meta-vision-room', participantName: 'user' })
      });
      
      const data = await response.json();
      const { url, token } = data; // 需包含 livekit ws 網址與 token

      statusTxt.textContent = '狀態：正在連線至 LiveKit 房間...';

      // 2. 建立 LiveKit Room 實體
      const room = new livekitSDK.Room();
      currentRoom = room;

      // 監聽遠端 AI 語音音訊軌
      room.on(livekitSDK.RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === 'audio') {
          track.attach(remoteAudio);
          statusTxt.textContent = '狀態：AI 助理已語音連線！';
        }
      });

      // 3. 連線至 LiveKit 伺服器
      await room.connect(url, token);

      // 4. 發布選定的相機與麥克风
      await room.localParticipant.setCameraEnabled(true, { deviceId: selectedVideoId });
      await room.localParticipant.setMicrophoneEnabled(true, { deviceId: selectedAudioId });

      statusTxt.textContent = '狀態：連線成功！AI 助理正在聆聽與分析中...';
      connectBtn.textContent = '斷開連線';
      connectBtn.style.background = '#ff3b30';

    } catch (err) {
      console.error(err);
      statusTxt.textContent = '狀態：連線失敗，請檢查後端 Token 伺服器網址。';
    }
  });
});
