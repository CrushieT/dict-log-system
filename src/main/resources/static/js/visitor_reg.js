
let cvReady = false;
let faceCascade;

// Called only after <script src="opencv.js" onload="onOpenCvReady()">
function onOpenCvReady() {
    cv['onRuntimeInitialized'] = async () => {
        cvReady = true;
        console.log("OpenCV is ready.");

        await initFaceDetection();    // Wait for cascade to load
        console.log("Cascade loaded.");

        startCamera();                // Start camera AFTER cascade
    };
}

function initFaceDetection() {
    // Load cascade from new folder
    const cascadeFile = "models/haarcascade_frontalface_default.xml";

    return fetch(cascadeFile)
        .then(res => res.arrayBuffer())
        .then(buf => {
            // Create virtual file in OpenCV's filesystem
            cv.FS_createDataFile("/", "haarcascade_frontalface_default.xml", new Uint8Array(buf), true, false);
            faceCascade = new cv.CascadeClassifier();
            faceCascade.load("haarcascade_frontalface_default.xml"); // always load from root "/"
            console.log("Cascade loaded.");
        });
}

// ---------------------------
// CAMERA + FACE DETECTION
// ---------------------------

const video = document.getElementById("cameraVideo");
const capturedImage = document.getElementById("capturedImage");
const hiddenCanvas = document.getElementById("hiddenCanvas");
const statusText = document.getElementById("status");

const captureBtn = document.getElementById("captureBtn");
const recaptureBtn = document.getElementById("recaptureBtn");

let stream = null;
let detectInterval = null;

async function startCamera() {
    if (!cvReady || !faceCascade) {
        console.log("Waiting for OpenCV...");
        return;
    }

    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.onloadedmetadata = () => {
        video.play();
        startDetectionLoop();
    };
}

function startDetectionLoop() {
    if (detectInterval) clearInterval(detectInterval);

    hiddenCanvas.width = video.videoWidth;
    hiddenCanvas.height = video.videoHeight;

    const ctx = hiddenCanvas.getContext("2d");

    detectInterval = setInterval(() => {
        ctx.drawImage(video, 0, 0);

        const frame = cv.imread(hiddenCanvas);
        const gray = new cv.Mat();
        cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY, 0);

        const faces = new cv.RectVector();
        faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

        // Calculate mean brightness for "too dark" detection
        const meanBrightness = cv.mean(gray)[0];

        // ---------------------------
        // STATUS LOGIC
        // ---------------------------
        if (faces.size() === 0) {
            statusText.innerHTML = "No face detected ✗";
        } else if (faces.size() > 3) { // Too many people threshold
            statusText.innerHTML = "Too many people!";
        } else if (meanBrightness < 50) { // Too dark threshold
            statusText.innerHTML = "Too dark!";
        } else {
            statusText.innerHTML = "Face detected ✓";
        }

        frame.delete();
        gray.delete();
        faces.delete();
    }, 150);
}

// ---------------------------
// CAPTURE BUTTON
// ---------------------------

captureBtn.addEventListener("click", () => {
    const ctx = hiddenCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const frame = cv.imread(hiddenCanvas);
    const gray = new cv.Mat();
    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY, 0);

    const faces = new cv.RectVector();
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

    const meanBrightness = cv.mean(gray)[0];

    if (faces.size() === 0) {
        statusText.innerHTML = "❌ Cannot capture — No face detected.";
        frame.delete();
        gray.delete();
        faces.delete();
        return;
    }

    if (faces.size() > 2) {
        statusText.innerHTML = "❌ Cannot capture — Too many people.";
        frame.delete();
        gray.delete();
        faces.delete();
        return;
    }

    if (meanBrightness < 30) {
        statusText.innerHTML = "❌ Cannot capture — Too dark.";
        frame.delete();
        gray.delete();
        faces.delete();
        return;
    }

    // Capture allowed
    capturedImage.src = hiddenCanvas.toDataURL("image/png");

    capturedImage.style.width = `${video.clientWidth}px`;
    capturedImage.style.height = `${video.clientHeight}px`;
    capturedImage.style.objectFit = "cover";
    capturedImage.style.display = "block";
    capturedImage.style.margin = "0 auto";

    capturedImage.classList.remove("d-none");
    video.classList.add("d-none");

    captureBtn.classList.add("d-none");
    recaptureBtn.classList.remove("d-none");

    if (stream) stream.getTracks().forEach(t => t.stop());
    if (detectInterval) clearInterval(detectInterval);

    frame.delete();
    gray.delete();
    faces.delete();
});

// ---------------------------
// RECAPTURE
// ---------------------------

recaptureBtn.addEventListener("click", () => {
    capturedImage.classList.add("d-none");
    video.classList.remove("d-none");

    captureBtn.classList.remove("d-none");
    recaptureBtn.classList.add("d-none");

    startCamera();
});


/////////////////////////////////


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
