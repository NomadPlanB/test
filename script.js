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
const cameraLoading = document.getElementById('camera-loading');

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
    'snake': '뱀',
    'rat': '쥐',
    'turtle': '거북이',
    'horse': '말',
    'pig': '돼지',
    'chicken': '닭',
    'cow': '소',
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
    '공룡': '공룡',
    '뱀': '뱀',
    '쥐': '쥐',
    '거북이': '거북이',
    '말': '말',
    '돼지': '돼지',
    '닭': '닭',
    '소': '소'
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
    '공룡': '🦖',
    '뱀': '🐍',
    '쥐': '🐭',
    '거북이': '🐢',
    '말': '🐴',
    '돼지': '🐷',
    '닭': '🐔',
    '소': '🐮'
};

// 동물 메시지 매핑 (1등 결과용)
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
    '공룡': '독특하고 개성 넘치는 공룡상이에요!',
    '뱀': '신비롭고 지혜로운 뱀상이에요!',
    '쥐': '똑똑하고 재치있는 쥐상이에요!',
    '거북이': '느긋하고 인내심 강한 거북이상이에요!',
    '말': '활기차고 자유로운 말상이에요!',
    '돼지': '복스럽고 인복 많은 돼지상이에요!',
    '닭': '부지런하고 책임감 있는 닭상이에요!',
    '소': '성실하고 믿음직한 소상이에요!'
};

// 동물상 상세 설명 매핑
const animalDescriptionMap = {
    '강아지': '둥근 눈, 부드러운 인상, 친근하고 애교 있는 분위기',
    '고양이': '날카로운 눈매, 갸름한 얼굴형, 도도하고 신비로운 분위기',
    '토끼': '동그란 눈, 작은 얼굴, 청순하고 귀여운 분위기',
    '곰': '넓은 이마, 둥근 얼굴형, 푸근하고 믿음직한 분위기',
    '여우': '올라간 눈꼬리, 뾰족한 턱, 영리하고 섹시한 분위기',
    '사슴': '큰 눈, 긴 속눈썹, 순수하고 청초한 분위기',
    '늑대': '날카로운 눈빛, 강한 턱선, 시크하고 야성적인 분위기',
    '사자': '큰 이목구비, 강한 인상, 당당하고 리더십 있는 분위기',
    '호랑이': '강렬한 눈빛, 선명한 이목구비, 카리스마 넘치는 분위기',
    '햄스터': '볼록한 볼, 작은 이목구비, 앙증맞고 통통한 분위기',
    '공룡': '독특한 이목구비, 강한 개성, 범접하기 어려운 분위기',
    '뱀': '가늘고 긴 눈, 날카로운 인상, 신비롭고 차가운 분위기',
    '쥐': '작고 날카로운 눈, 뾰족한 코, 영리하고 재빠른 분위기',
    '거북이': '작은 눈, 둥근 얼굴, 느긋하고 평화로운 분위기',
    '말': '긴 얼굴형, 큰 눈, 늠름하고 자유로운 분위기',
    '돼지': '둥근 코, 통통한 볼, 복스럽고 친근한 분위기',
    '닭': '날카로운 눈, 뾰족한 이목구비, 날렵하고 민첩한 분위기',
    '소': '큰 눈, 넓은 얼굴, 온화하고 성실한 분위기'
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
        captureBtn.style.display = 'flex';
        cameraLoading.style.display = 'none';
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

    // 카메라 아래에 로딩 표시
    captureBtn.style.display = 'none';
    cameraLoading.style.display = 'block';

    // 모델 로드 확인
    if (!isModelLoaded) {
        await loadModel();
    }

    // AI 예측
    await predictFromCanvas(capturedCanvas);

    // 로딩 숨기고 결과 표시
    cameraLoading.style.display = 'none';
    cameraArea.style.display = 'none';
    faceImage.style.display = 'none';
    capturedCanvas.style.display = 'block';
    fileUploadContent.style.display = 'block';
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
    shareSection.style.display = 'none';

    if (currentMode === 'upload') {
        uploadArea.style.display = 'block';
    } else {
        cameraArea.style.display = 'block';
        captureBtn.style.display = 'flex';
        cameraLoading.style.display = 'none';
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

    // 디버깅: 모델이 반환하는 클래스명 확인
    console.log("=== 예측 결과 ===");
    sorted.forEach((p, i) => {
        console.log(`${i + 1}위: "${p.className}" (${(p.probability * 100).toFixed(1)}%)`);
    });

    // 1등 결과에서 한국어 이름 가져오기
    const topClassName = sorted[0].className.toLowerCase().trim();
    const topKoreanName = getKoreanName(topClassName);
    const topEmoji = animalEmojiMap[topKoreanName] || '🐾';
    const topMessage = animalMessageMap[topKoreanName] || `${topKoreanName}상이에요!`;

    resultMessage.innerHTML = `${topEmoji} ${topMessage}`;

    // 공유 섹션 표시
    const topPercent = (sorted[0].probability * 100).toFixed(1);
    showShareSection(topKoreanName, topEmoji, topPercent);

    // 결과 바 생성
    sorted.forEach((p, index) => {
        const className = p.className.toLowerCase().trim();
        const koreanName = getKoreanName(className);
        const emoji = animalEmojiMap[koreanName] || '🐾';
        const percent = (p.probability * 100).toFixed(1);
        const description = animalDescriptionMap[koreanName] || '';

        const div = document.createElement('div');
        div.className = 'animal-box';
        div.innerHTML = `
            <div class="animal-emoji">${emoji}</div>
            <div class="animal-info">
                <div class="animal-label">${koreanName}상</div>
                <div class="animal-percent">${percent}%</div>
                <div class="animal-description">${description}</div>
            </div>
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

// ========== SNS 공유 기능 ==========
const shareSection = document.getElementById('share-section');
const shareKakao = document.getElementById('share-kakao');
const shareFacebook = document.getElementById('share-facebook');
const shareTwitter = document.getElementById('share-twitter');
const shareCopy = document.getElementById('share-copy');

// 현재 결과 저장용 변수
let currentResult = {
    animal: '',
    emoji: '',
    percent: ''
};

// 사이트 정보
const SITE_URL = 'https://test-1f1.pages.dev/';
const SITE_NAME = 'AI 동물상 테스트';

// 카카오 SDK 초기화 (실제 배포 시 JavaScript 키로 변경 필요)
// Kakao Developers에서 앱 등록 후 JavaScript 키를 발급받아 사용하세요
try {
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
        // TODO: 실제 카카오 JavaScript 키로 교체 필요
        // Kakao.init('YOUR_KAKAO_JAVASCRIPT_KEY');
        console.log('카카오 SDK 초기화를 위해 JavaScript 키가 필요합니다.');
    }
} catch (e) {
    console.log('카카오 SDK 로드 중...');
}

// 공유 섹션 표시
function showShareSection(animal, emoji, percent) {
    currentResult = { animal, emoji, percent };
    shareSection.style.display = 'block';
}

// 공유 메시지 생성
function getShareMessage() {
    return `${currentResult.emoji} 나는 ${currentResult.animal}상! (${currentResult.percent}%)\n\nAI 동물상 테스트로 나의 동물상을 확인해보세요!`;
}

// 카카오톡 공유
shareKakao.addEventListener('click', () => {
    if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: `${currentResult.emoji} 나는 ${currentResult.animal}상!`,
                description: `AI 동물상 테스트 결과: ${currentResult.animal}상 ${currentResult.percent}%\n나도 동물상 테스트 해보기!`,
                imageUrl: 'https://test-1f1.pages.dev/og-image.png',
                link: {
                    mobileWebUrl: SITE_URL,
                    webUrl: SITE_URL
                }
            },
            buttons: [
                {
                    title: '나도 테스트하기',
                    link: {
                        mobileWebUrl: SITE_URL,
                        webUrl: SITE_URL
                    }
                }
            ]
        });
    } else {
        // 카카오 SDK가 초기화되지 않은 경우 카카오톡 공유 URL로 대체
        const message = encodeURIComponent(getShareMessage() + '\n' + SITE_URL);
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent(SITE_URL)}&text=${message}`, '_blank', 'width=600,height=400');
    }
});

// 페이스북 공유
shareFacebook.addEventListener('click', () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}&quote=${encodeURIComponent(getShareMessage())}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
});

// X(트위터) 공유
shareTwitter.addEventListener('click', () => {
    const text = `${currentResult.emoji} 나는 ${currentResult.animal}상! (${currentResult.percent}%)\n\nAI 동물상 테스트로 나의 동물상을 확인해보세요!`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE_URL)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
});

// 링크 복사
shareCopy.addEventListener('click', async () => {
    const textToCopy = getShareMessage() + '\n' + SITE_URL;

    try {
        await navigator.clipboard.writeText(textToCopy);
        showCopyToast('링크가 복사되었습니다!');

        // 버튼 상태 변경
        shareCopy.classList.add('copied');
        shareCopy.querySelector('span').textContent = '복사됨!';

        setTimeout(() => {
            shareCopy.classList.remove('copied');
            shareCopy.querySelector('span').textContent = '링크복사';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            showCopyToast('링크가 복사되었습니다!');
        } catch (e) {
            showCopyToast('복사에 실패했습니다.');
        }

        document.body.removeChild(textArea);
    }
});

// 토스트 메시지 표시
function showCopyToast(message) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 애니메이션
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}
