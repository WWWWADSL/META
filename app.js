// 確保 DOM 與外部 SDK 完全載入後才執行
window.addEventListener('DOMContentLoaded', () => {
  const videoSelect = document.getElementById('video-select');
  const audioSelect = document.getElementById('audio-select');
  const connectBtn = document.getElementById('connect-btn');
  const statusText = document.getElementById('status');

  let currentRoom = null;

  async function getDevices() {
    // 檢查 LiveKit SDK 是否順利載入
    if (typeof LiveKit === 'undefined') {
      alert("LiveKit SDK 正在載入中，請稍微重試一次。");
      return;
    }

    try {
      // 請求相機與麥克風權限
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const devices = await LiveKit.Room.getLocalDevices();
      
      // 清空原有選單選項
      videoSelect.innerHTML = '<option value="">請選擇相機</option>';
      audioSelect.innerHTML = '<option value="">請選擇麥克風</option>';

      devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `${device.kind} (${device.deviceId.slice(0, 5)}...)`;
        
        if (device.kind === 'videoinput') {
          videoSelect.appendChild(option);
        } else if (device.kind === 'audioinput') {
          audioSelect.appendChild(option);
        }
      });

      statusText.innerText = "狀態：已取得裝置清單";
    } catch (err) {
      console.error(err);
      alert("無法取得相機或麥克風權限：" + err.message);
    }
  }

  videoSelect.addEventListener('focus', getDevices);
  audioSelect.addEventListener('focus', getDevices);

  connectBtn.addEventListener('click', async () => {
    if (typeof LiveKit === 'undefined') {
      alert("LiveKit SDK 未成功載入，請確認網路連線或重新整理頁面。");
      return;
    }

    const selectedVideoId = videoSelect.value;
    const selectedAudioId = audioSelect.value;

    if (!selectedVideoId || !selectedAudioId) {
      alert("請選擇相機與麥克風！");
      return;
    }

    statusText.innerText = "狀態：連線中...";

    try {
      // 請替換為你的 LiveKit Token 取得 API 或測試 Token
      const token = "YOUR_LIVEKIT_TOKEN_HERE";
      const wsUrl = "wss://YOUR_LIVEKIT_SERVER_URL";

      const room = new LiveKit.Room();
      currentRoom = room;

      room.on(LiveKit.RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === LiveKit.Track.Kind.Audio) {
          const audioElement = document.getElementById('remote-audio');
          track.attach(audioElement);
        }
      });

      await room.connect(wsUrl, token);

      // 發布選定的影像與聲音軌道
      await room.localParticipant.setCameraEnabled(true, { deviceId: selectedVideoId });
      await room.localParticipant.setMicrophoneEnabled(true, { deviceId: selectedAudioId });

      statusText.innerText = "狀態：連線成功！";
    } catch (err) {
      console.error(err);
      statusText.innerText = "狀態：連線失敗";
      alert("連線失敗：" + err.message);
    }
  });
});
