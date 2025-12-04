
const cameraVideo = document.getElementById('cameraVideo');
const capturedImage = document.getElementById('capturedImage');
const captureBtn = document.getElementById('captureBtn');
const recaptureBtn = document.getElementById('recaptureBtn');
let stream = null;

async function startCamera() {
  try {
      if (stream) stream.getTracks().forEach(track => track.stop());
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraVideo.srcObject = stream;
  } catch (err) {
      console.warn("Camera access denied or unavailable:", err.message);
  }
}

// Capture
captureBtn.addEventListener('click', () => {
  if (!stream) return;

  const canvas = document.createElement('canvas');
  // Match canvas size to video element size
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  canvas.getContext('2d').drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

  capturedImage.src = canvas.toDataURL('image/png');

  // Hide video, show captured image
  cameraVideo.classList.add('d-none');
  capturedImage.classList.remove('d-none');

  // Stop camera stream
  stream.getTracks().forEach(track => track.stop());

  captureBtn.classList.add('d-none');
  recaptureBtn.classList.remove('d-none');
});

// Recapture
recaptureBtn.addEventListener('click', async () => {
  capturedImage.classList.add('d-none');
  cameraVideo.classList.remove('d-none');
  captureBtn.classList.remove('d-none');
  recaptureBtn.classList.add('d-none');

  await startCamera();
});

// Initialize camera
startCamera();


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


const visitorForm = document.getElementById('visitorForm');
const purposeSelect = document.getElementById('purposeSelect');
const purposeInput = document.getElementById('purposeInput');

// Show/hide "Other" input
purposeSelect.addEventListener('change', () => {
    if (purposeSelect.value === 'Others') {
        purposeInput.classList.remove('d-none');
        purposeInput.setAttribute('required', 'required');
    } else {
        purposeInput.classList.add('d-none');
        purposeInput.removeAttribute('required');
    }
});

visitorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form
    if (!visitorForm.checkValidity()) {
        visitorForm.classList.add('was-validated');
        return;
    }

    if (!capturedImage.src) {
        alert("Please capture a photo first!");
        return;
    }

    const formData = new FormData();
    formData.append("firstName", visitorForm.firstName.value);
    formData.append("mi", visitorForm.mi.value);
    formData.append("lastName", visitorForm.lastName.value);
    formData.append("purpose", visitorForm.purpose.value === "Others" ? visitorForm.otherPurpose.value : visitorForm.purpose.value);

    // Convert captured image to Blob
    try {
        const res = await fetch(capturedImage.src);
        const blob = await res.blob();
        formData.append("imageFile", blob, "visitor.png");
    } catch (err) {
        alert("Failed to convert image for upload: " + err.message);
        return;
    }

    // Send to Spring Boot
    try {
        const response = await fetch("/api/visitor", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Visitor saved successfully!");
            visitorForm.reset();
            capturedImage.classList.add('d-none');
            cameraVideo.classList.remove('d-none');
            captureBtn.classList.remove('d-none');
            recaptureBtn.classList.add('d-none');
            startCamera();
        } else {
            const text = await response.text();
            alert("Error saving visitor: " + text);
        }
    } catch (err) {
        alert("Error sending request: " + err.message);
    }
});
