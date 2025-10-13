const camera = document.getElementById('camera');
const captureBtn = document.getElementById('captureBtn');

// Start camera
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
  } catch (err) {
    alert("Camera access denied or unavailable: " + err.message);
  }
}

// Stop camera and close card
function closeCard() {
  const stream = camera.srcObject;
  if (stream) stream.getTracks().forEach(track => track.stop());
  document.querySelector('.visitor-card').style.display = 'none';
}

// Capture snapshot
captureBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
  const image = canvas.toDataURL('image/png');
  alert("Photo captured! (Base64 stored in variable)");
  console.log(image);
});

startCamera();
