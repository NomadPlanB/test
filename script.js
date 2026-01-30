// Teachable Machine Model URL
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/pLx4H67IN/";

// DOM Elements
const fileInput = document.getElementById('file-input');
const uploadArea = document.getElementById('upload-area');
const cameraArea = document.getElementById('camera-area');
const fileUploadContent = document.querySelector('.file-upload-content');
const faceImage = document.getElementById('face-image');
const capturedCanvas = document.getElementById('captured-canvas');
const loading = document.getElementById('loading');
const labelContainer = document.getElementById('label-container');
const resultMessage = document.querySelector('.result-message');
const retryBtn = document.getElementById('retry-btn');
const themeBtn = document.getElementById('theme-btn');
const html = document.documentElement;
const navbar = document.querySelector('.navbar');
const uploadTab = document.getElementById('upload-tab');
const cameraTab = document.getElementById('camera-tab');
const captureBtn = document.getElementById('capture-btn');
const webcamContainer = document.getElementById('webcam-container');

// Global variables
let model = null;
let webcam = null;
let currentMode = 'upload';
let isModelLoaded = false;

// 동물 이름 한국어 매핑 (영어 클래스명 -> 한국어)
const animalNameMap = {
    // 일반적인 동물 이름들
    'dog': '강아지',
    'cat': '고양이',
    'rabbit': '토끼',
    'bear': '곰',
    'fox': '여우',
    'deer': '사슴',
    'wolf': '늑대',
    'lion': '사자',
    'tiger': '호랑이',
    'hamster': '햄스터',
    'dinosaur': '공룡',
    'dino': '공룡',
    'puppy': '강아지',
    'kitten': '고양이',
    'bunny': '토끼',
    // 한국어 이름은 그대로 유지
    '강아지': '강아지',
    '고양이': '고양이',
    '토끼': '토끼',
    '곰': '곰',
    '여우': '여우',
    '사슴': '사슴',
    '늑대': '늑대',
    '사자': '사자',
    '호랑이': '호랑이',
    '햄스터': '햄스터',
    '공룡': '공룡'
};

// 동물 이모지 매핑
const animalEmojiMap = {
    '강아지': '🐶',
    '고양이': '🐱',
    '토끼': '🐰',
    '곰': '🐻',
    '여우': '🦊',
    '사슴': '🦌',
    '늑대': '🐺',
    '사자': '🦁',
    '호랑이': '🐯',
    '햄스터': '🐹',
    '공룡': '🦖'
};

// 동물 메시지 매핑
const animalMessageMap = {
    '강아지': '귀엽고 순한 강아지상이에요!',
    '고양이': '도도하고 매력적인 고양이상이에요!',
    '토끼': '상큼하고 발랄한 토끼상이에요!',
    '곰': '포근하고 듬직한 곰상이에요!',
    '여우': '영리하고 섹시한 여우상이에요!',
    '사슴': '순수하고 청순한 사슴상이에요!',
    '늑대': '카리스마 넘치는 늑대상이에요!',
    '사자': '당당하고 위엄있는 사자상이에요!',
    '호랑이': '강인하고 매력적인 호랑이상이에요!',
    '햄스터': '앙증맞고 사랑스러운 햄스터상이에요!',
    '공룡': '독특하고 개성 넘치는 공룡상이에요!'
};

// 모델 로드
async function loadModel() {
    if (isModelLoaded) return;

    try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        isModelLoaded = true;
        console.log("모델 로드 완료");
    } catch (error) {
        console.error("모델 로드 실패:", error);
        alert("AI 모델을 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.");
    }
}

// 페이지 로드 시 모델 미리 로드
loadModel();

// 탭 전환 이벤트
uploadTab.addEventListener('click', () => switchMode('upload'));
cameraTab.addEventListener('click', () => switchMode('camera'));

// 모드 전환
async function switchMode(mode) {
    currentMode = mode;

    // 탭 스타일 업데이트
    uploadTab.classList.toggle('active', mode === 'upload');
    cameraTab.classList.toggle('active', mode === 'camera');

    // 영역 표시/숨김
    uploadArea.style.display = mode === 'upload' ? 'block' : 'none';
    cameraArea.style.display = mode === 'camera' ? 'block' : 'none';

    // 결과 영역 숨김
    fileUploadContent.style.display = 'none';

    // 카메라 모드일 때 웹캠 시작
    if (mode === 'camera') {
        await startWebcam();
    } else {
        stopWebcam();
    }
}

// 웹캠 시작
async function startWebcam() {
    try {
        webcamContainer.innerHTML = '<div class="camera-loading">카메라 연결 중...</div>';

        const flip = true;
        webcam = new tmImage.Webcam(320, 320, flip);
        await webcam.setup();
        await webcam.play();

        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);

        // 웹캠 프레임 업데이트
        requestAnimationFrame(updateWebcam);
    } catch (error) {
        console.error("웹캠 시작 실패:", error);
        webcamContainer.innerHTML = `
            <div class="camera-error">
                <p>카메라에 접근할 수 없습니다.</p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                    브라우저 설정에서 카메라 권한을 허용해주세요.
                </p>
            </div>
        `;
    }
}

// 웹캠 프레임 업데이트
function updateWebcam() {
    if (webcam && currentMode === 'camera') {
        webcam.update();
        requestAnimationFrame(updateWebcam);
    }
}

// 웹캠 정지
function stopWebcam() {
    if (webcam) {
        webcam.stop();
        webcam = null;
    }
}

// 촬영 버튼 이벤트
captureBtn.addEventListener('click', captureFromWebcam);

// 웹캠에서 캡처
async function captureFromWebcam() {
    if (!webcam) return;

    // 캔버스에 현재 웹캠 프레임 복사
    const ctx = capturedCanvas.getContext('2d');
    capturedCanvas.width = webcam.canvas.width;
    capturedCanvas.height = webcam.canvas.height;
    ctx.drawImage(webcam.canvas, 0, 0);

    // UI 전환
    cameraArea.style.display = 'none';
    faceImage.style.display = 'none';
    capturedCanvas.style.display = 'block';
    fileUploadContent.style.display = 'block';

    // 로딩 표시
    loading.style.display = 'block';
    labelContainer.innerHTML = '';
    resultMessage.innerHTML = '';
    retryBtn.style.display = 'none';

    // 모델 로드 확인
    if (!isModelLoaded) {
        await loadModel();
    }

    // AI 예측
    await predictFromCanvas(capturedCanvas);

    loading.style.display = 'none';
    retryBtn.style.display = 'flex';
}

// 파일 업로드 이벤트
fileInput.addEventListener('change', handleFileSelect);

// 드래그 앤 드롭 이벤트
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

// 재시도 버튼
retryBtn.addEventListener('click', removeUpload);

// 스크롤 이벤트 (navbar 스타일 변경)
window.addEventListener('scroll', handleScroll);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    }
}

async function processFile(file) {
    const reader = new FileReader();

    reader.onload = async function(e) {
        // UI 전환
        uploadArea.style.display = 'none';
        capturedCanvas.style.display = 'none';
        faceImage.style.display = 'block';
        faceImage.src = e.target.result;
        fileUploadContent.style.display = 'block';

        // 로딩 표시
        loading.style.display = 'block';
        labelContainer.innerHTML = '';
        resultMessage.innerHTML = '';
        retryBtn.style.display = 'none';

        // 이미지 로드 완료 후 예측
        faceImage.onload = async function() {
            // 모델 로드 확인
            if (!isModelLoaded) {
                await loadModel();
            }

            // AI 예측
            await predictFromImage(faceImage);

            loading.style.display = 'none';
            retryBtn.style.display = 'flex';
        };
    };

    reader.readAsDataURL(file);
}

function removeUpload() {
    fileInput.value = '';
    fileUploadContent.style.display = 'none';
    labelContainer.innerHTML = '';
    resultMessage.innerHTML = '';

    if (currentMode === 'upload') {
        uploadArea.style.display = 'block';
    } else {
        cameraArea.style.display = 'block';
        startWebcam();
    }
}

// 이미지에서 예측
async function predictFromImage(imgElement) {
    if (!model) {
        console.error("모델이 로드되지 않았습니다.");
        return;
    }

    const predictions = await model.predict(imgElement);
    displayResults(predictions);
}

// 캔버스에서 예측
async function predictFromCanvas(canvas) {
    if (!model) {
        console.error("모델이 로드되지 않았습니다.");
        return;
    }

    const predictions = await model.predict(canvas);
    displayResults(predictions);
}

// 결과 표시
function displayResults(predictions) {
    // 확률 정렬 (높은 순)
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);

    // 1등 결과에서 한국어 이름 가져오기
    const topClassName = sorted[0].className.toLowerCase().trim();
    const topKoreanName = getKoreanName(topClassName);
    const topMessage = animalMessageMap[topKoreanName] || `${topKoreanName}상이에요!`;

    resultMessage.innerHTML = topMessage;

    // 결과 바 생성
    sorted.forEach((p, index) => {
        const className = p.className.toLowerCase().trim();
        const koreanName = getKoreanName(className);
        const emoji = animalEmojiMap[koreanName] || '🐾';
        const percent = (p.probability * 100).toFixed(1);

        const div = document.createElement('div');
        div.className = 'animal-box';
        div.innerHTML = `
            <div class="animal-emoji">${emoji}</div>
            <div class="animal-label">${koreanName}상</div>
            <div class="bar-container">
                <div class="progress">
                    <div class="progress-bar" role="progressbar"
                         style="width: 0%"
                         aria-valuenow="${percent}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
            <div class="percent-text">${percent}%</div>
        `;

        labelContainer.appendChild(div);

        // 애니메이션을 위해 약간의 딜레이 후 width 설정
        setTimeout(() => {
            div.querySelector('.progress-bar').style.width = `${percent}%`;
        }, 100 + (index * 50));
    });
}

// 한국어 이름 가져오기
function getKoreanName(className) {
    // 먼저 매핑에서 찾기
    if (animalNameMap[className]) {
        return animalNameMap[className];
    }

    // 매핑에 없으면 원본 반환 (이미 한국어일 수 있음)
    // 숫자가 포함된 경우 (class1, class2 등) 처리
    if (className.includes('class')) {
        return className;
    }

    // 첫 글자 대문자로
    return className.charAt(0).toUpperCase() + className.slice(1);
}

function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// ========== 다크모드 토글 ==========
const themeIcon = themeBtn.querySelector('.theme-icon');
const themeText = themeBtn.querySelector('.theme-text');

// 시스템 다크모드 감지
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// 초기화: 저장된 테마 또는 시스템 설정 적용
function initTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark.matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

function setTheme(theme) {
    html.setAttribute('data-bs-theme', theme);
    updateThemeBtn(theme);

    // 테마 색상 메타 태그 업데이트
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#1A1814' : '#FF7B54');
    }
}

function updateThemeBtn(theme) {
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = '라이트모드';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = '다크모드';
    }
}

themeBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
});

// 시스템 다크모드 변경 감지
prefersDark.addEventListener('change', (e) => {
    // 저장된 테마가 없을 때만 시스템 설정 따르기
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// 페이지 로드 시 테마 초기화
initTheme();
