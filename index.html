// 請替換為你的 LiveKit WebSocket URL
const LIVEKIT_URL = "wss://your-instance.livekit.cloud";

let room;

// 觸發請求相機與麥克風權限，並載入選項清單
async function loadDevices() {
  const videoSelect = document.getElementById("video-select");
  const audioSelect = document.getElementById("audio-select");

  try {
    // 先主動向使用者請求相機與麥克風權限（會跳出 iOS 授權彈窗）
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // 成功授權後取得裝置清單
    const devices = await LiveKit.Room.getLocalDevices();
    videoSelect.innerHTML = "";
    audioSelect.innerHTML = "";

    devices.forEach(device => {
      const opt = document.createElement("option");
      opt.value = device.deviceId;
      opt.text = device.label || `${device.kind === 'videoinput' ? '相機' : '麥克風'} (${device.deviceId.slice(0, 5)})`;
      if (device.kind === "videoinput") videoSelect.appendChild(opt);
      if (device.kind === "audioinput") audioSelect.appendChild(opt);
    });

    // 關閉臨時抓取的串流以釋放鏡頭
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    alert("請確定已允許相機與麥克風權限：" + err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 當使用者點擊選單時，自動載入裝置清單
  document.getElementById("video-select").addEventListener("focus", loadDevices, { once: true });
  document.getElementById("audio-select").addEventListener("focus", loadDevices, { once: true });
});

document.getElementById("connect-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  statusEl.innerText = "連線中...";

  // 避免未載入裝置就連線
  const selectedVideoId = document.getElementById("video-select").value;
  const selectedAudioId = document.getElementById("audio-select").value;

  if (!selectedVideoId) {
    await loadDevices();
  }

  // 請填入你從 LiveKit 產生的 User Token
  const token = "YOUR_LIVEKIT_USER_TOKEN";

  room = new LiveKit.Room({
    adaptiveStream: true,
    dynacast: true,
  });

  room.on(LiveKit.RoomEvent.TrackSubscribed, (track, publication, participant) => {
    if (track.kind === LiveKit.Track.Kind.Audio) {
      const audioElement = document.getElementById("remote-audio");
      track.attach(audioElement);
    }
  });

  try {
    await room.connect(LIVEKIT_URL, token);
    statusEl.innerText = "已成功連線！AI 已上線。";

    await room.localParticipant.enableCameraAndMicrophone({
      video: { deviceId: document.getElementById("video-select").value, width: 1280, height: 720 },
      audio: { deviceId: document.getElementById("audio-select").value }
    });

  } catch (err) {
    statusEl.innerText = "連線失敗: " + err.message;
  }
});
