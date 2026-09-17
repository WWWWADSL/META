// 請替換為你自身的 LiveKit WebSocket URL
const LIVEKIT_URL = "wss://your-instance.livekit.cloud";

// 提示：正式環境中，Token 應由後端生成，這裡展示前端建立與連接的架構
let room;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. 取得手機/眼鏡的相機與麥克風清單
  const devices = await LiveKit.Room.getLocalDevices();
  const videoSelect = document.getElementById("video-select");
  const audioSelect = document.getElementById("audio-select");

  devices.forEach(device => {
    const opt = document.createElement("option");
    opt.value = device.deviceId;
    opt.text = device.label || `${device.kind} (${device.deviceId.slice(0, 5)})`;
    if (device.kind === "videoinput") videoSelect.appendChild(opt);
    if (device.kind === "audioinput") audioSelect.appendChild(opt);
  });
});

document.getElementById("connect-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  statusEl.innerText = "連線中...";

  // 請填入你從 LiveKit 控制台或後端產生的 User Token
  const token = "YOUR_LIVEKIT_USER_TOKEN";

  room = new LiveKit.Room({
    adaptiveStream: true,
    dynacast: true,
  });

  // 監聽 AI 回傳的語音串流並自動播放
  room.on(LiveKit.RoomEvent.TrackSubscribed, (track, publication, participant) => {
    if (track.kind === LiveKit.Track.Kind.Audio) {
      const audioElement = document.getElementById("remote-audio");
      track.attach(audioElement);
    }
  });

  try {
    await room.connect(LIVEKIT_URL, token);
    statusEl.innerText = "已成功連線！AI 已上線。";

    // 發布指定裝置（如 Meta 眼鏡）的影音串流至 LiveKit 雲端
    const selectedVideoId = document.getElementById("video-select").value;
    const selectedAudioId = document.getElementById("audio-select").value;

    await room.localParticipant.enableCameraAndMicrophone({
      video: { deviceId: selectedVideoId, width: 1280, height: 720 },
      audio: { deviceId: selectedAudioId }
    });

  } catch (err) {
    statusEl.innerText = "連線失敗: " + err.message;
  }
});
