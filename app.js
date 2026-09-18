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

  // 請求相機與麥克風權限
try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // 取得權限後重新載入硬體選單
    await populateDevices();
} catch (err) {
    console.error("無法取得權限：", err);
    alert("請允許相機與麥克風權限才能進行連線！");
    return;
}
 
    }

    statusTxt.textContent = '狀態：正在請求 AI 助理 Token...';

    try {
      // 1. 直接指定 LiveKit 伺服器網址與連線 Token
    const url = 'wss://my-project-qkcolvfe.livekit.cloud';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlciIsInZpZGVvIjp7InJvb21Kb2luIjp0cnVlLCJyb29tIjoi
bWV0YS12aXNpb24tcm9vbSIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRyd
WV9LCJzdWIiOiJ1c2VyIiwiaXNzIjoiQVBJbW5tUDdMaHljMkg3IiwibmJmIjoxNzg5NzA0MTE2LCJleHAiOjE3ODk3MjU3MTZ9.tC3A8aOLKAiTnUC3qC8Ws-lfvynmHe_IZ7RcJjx9PwU';

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
