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

  // 取得裝置列表函式
  async function getDevices() {
    try {
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
      statusTxt.textContent = '狀態：無法讀取裝置列表。';
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

    // 1. 強制請求相機與麥克風權限
    try {
      statusTxt.textContent = '狀態：正在請求媒體權限...';
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // 取得權限後重新載入硬體選單
      await getDevices();
    } catch (err) {
      console.error("無法取得權限：", err);
      alert("請允許相機與麥克風權限才能進行連線！");
      statusTxt.textContent = '狀態：未取得相機與麥克風權限。';
      return;
    }

    const selectedVideoId = videoSelect.value;
    const selectedAudioId = audioSelect.value;

    statusTxt.textContent = '狀態：正在準備連線設定...';

    try {
      // 2. 指定 LiveKit 伺服器網址與連線 Token
      const url = 'wss://my-project-qkcolvfe.livekit.cloud';
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlciIsInZpZGVvIjp7InJvb21Kb2luIjp0cnVlLCJyb29tIjoibWV0YS12aXNpb24tcm9vbSIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwiY2FuUHVibGlzaERhdGEiOnRydWV9LCJzdWIiOiJ1c2VyIiwiaXNzIjoiQVBJbW5tUDdMaHljMkg3IiwibmJmIjoxNzg5NzA0MTE2LCJleHAiOjE3ODk3MjU3MTZ9.tC3A8aOLKAiTnUC3qC8Ws-lfvynmHe_IZ7RcJjx9PwU';

      statusTxt.textContent = '狀態：正在連線至 LiveKit 房間...';

      // 3. 建立 LiveKit Room 實體
      const room = new livekitSDK.Room();
      currentRoom = room;

      // 監聽遠端 AI 語音音訊軌
      room.on(livekitSDK.RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === 'audio') {
          track.attach(remoteAudio);
          statusTxt.textContent = '狀態：AI 助理已語音連線！';
        }
      });

      // 4. 連線至 LiveKit 伺服器
      await room.connect(url, token);

      // 5. 發布選定的相機與麥克風 (若有選指定 ID 則帶入，否則啟動預設裝置)
      const videoOptions = selectedVideoId ? { deviceId: selectedVideoId } : true;
      const audioOptions = selectedAudioId ? { deviceId: selectedAudioId } : true;

      await room.localParticipant.setCameraEnabled(true, videoOptions);
      await room.localParticipant.setMicrophoneEnabled(true, audioOptions);

      statusTxt.textContent = '狀態：連線成功！AI 助理正在聆聽與分析中...';
      connectBtn.textContent = '斷開連線';
      connectBtn.style.background = '#ff3b30';

    } catch (err) {
      console.error(err);
      statusTxt.textContent = '狀態：連線失敗，請檢查網路或 Token 設定。';
    }
  });
});
