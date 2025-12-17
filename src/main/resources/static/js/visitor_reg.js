// ===========================
// OPENCV INIT
// ===========================

let cvReady = false;
let faceCascade;

function onOpenCvReady() {
    cv["onRuntimeInitialized"] = async () => {
        cvReady = true;
        console.log("OpenCV is ready.");

        await initFaceDetection();
        console.log("Cascade loaded.");

        startCamera();
    };
}

function initFaceDetection() {
    const cascadeFile = "models/haarcascade_frontalface_default.xml";

    return fetch(cascadeFile)
        .then(res => res.arrayBuffer())
        .then(buf => {
            cv.FS_createDataFile(
                "/",
                "haarcascade_frontalface_default.xml",
                new Uint8Array(buf),
                true,
                false
            );
            faceCascade = new cv.CascadeClassifier();
            faceCascade.load("haarcascade_frontalface_default.xml");
        });
}

// ===========================
// CAMERA + FACE DETECTION
// ===========================

const video = document.getElementById("cameraVideo");
const capturedImage = document.getElementById("capturedImage");
const hiddenCanvas = document.getElementById("hiddenCanvas");
const statusText = document.getElementById("status");

const captureBtn = document.getElementById("captureBtn");
const recaptureBtn = document.getElementById("recaptureBtn");

let stream = null;
let detectInterval = null;
let pendingCapture = null; // TEMP image until consent

async function startCamera() {
    if (!cvReady || !faceCascade) return;

    if (stream) stream.getTracks().forEach(t => t.stop());

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
        cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

        const faces = new cv.RectVector();
        faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

        const brightness = cv.mean(gray)[0];

        if (faces.size() === 0) {
            statusText.innerHTML = "No face detected ✗";
        } else if (faces.size() > 3) {
            statusText.innerHTML = "Too many people!";
        } else if (brightness < 50) {
            statusText.innerHTML = "Too dark!";
        } else {
            statusText.innerHTML = "Face detected ✓";
        }

        cleanup(frame, gray, faces);
    }, 150);
}

// ===========================
// CAPTURE (WITH CONSENT FLOW)
// ===========================

captureBtn.addEventListener("click", () => {
    const ctx = hiddenCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const frame = cv.imread(hiddenCanvas);
    const gray = new cv.Mat();
    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

    const faces = new cv.RectVector();
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);

    const brightness = cv.mean(gray)[0];

    if (faces.size() === 0) {
        statusText.innerHTML = "❌ No face detected.";
        cleanup(frame, gray, faces);
        return;
    }

    if (faces.size() > 2) {
        statusText.innerHTML = "❌ Too many people.";
        cleanup(frame, gray, faces);
        return;
    }

    if (brightness < 30) {
        statusText.innerHTML = "❌ Too dark.";
        cleanup(frame, gray, faces);
        return;
    }

    // TEMP CAPTURE
    pendingCapture = hiddenCanvas.toDataURL("image/png");
    capturedImage.src = pendingCapture;
    capturedImage.classList.remove("d-none");
    capturedImage.style.width = video.clientWidth + "px"; // full video width
    capturedImage.style.height = video.clientHeight + "px";
    capturedImage.style.display = "block";
    capturedImage.style.margin = "0 auto";
    capturedImage.style.objectFit = "cover";
    video.classList.add("d-none");

    captureBtn.classList.add("d-none");
    recaptureBtn.classList.remove("d-none");

    if (stream) stream.getTracks().forEach(t => t.stop());
    if (detectInterval) clearInterval(detectInterval);

    cleanup(frame, gray, faces);

    showPrivacyModal();
});

// ===========================
// PRIVACY CONSENT
// ===========================

function showPrivacyModal() {
    new bootstrap.Modal(
        document.getElementById("privacyModal"),
        { backdrop: "static", keyboard: false }
    ).show();
}

document.getElementById("agreeBtn").addEventListener("click", () => {
    bootstrap.Modal.getInstance(
        document.getElementById("privacyModal")
    ).hide();

    statusText.innerHTML = "✅ Photo Captured";
    // pendingCapture is now FINAL
});

document.getElementById("disagreeBtn").addEventListener("click", () => {
    pendingCapture = null;

    bootstrap.Modal.getInstance(
        document.getElementById("privacyModal")
    ).hide();

    statusText.innerHTML = "❌ Capture cancelled — consent required.";

    recaptureBtn.click();
});

// ===========================
// RECAPTURE
// ===========================

recaptureBtn.addEventListener("click", () => {
    pendingCapture = null;
    capturedImage.classList.add("d-none");
    video.classList.remove("d-none");

    captureBtn.classList.remove("d-none");
    recaptureBtn.classList.add("d-none");

    startCamera();
});

// ===========================
// CLEANUP HELPER
// ===========================

function cleanup(frame, gray, faces) {
    frame.delete();
    gray.delete();
    faces.delete();
}



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




async function fetchSuggestions() {
    let input = document.getElementById("purposeInput").value;
    if (input.length < 2) return;

    let res = await fetch("/api/predict?input=" + encodeURIComponent(input));
    let suggestions = await res.json();

    let ul = document.getElementById("suggestions");
    ul.innerHTML = "";
    suggestions.forEach(item => {
        let li = document.createElement("li");
        li.textContent = item;
        li.onclick = () => document.getElementById("purposeInput").value = item;
        ul.appendChild(li);
    });
}