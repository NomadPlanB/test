// DOM Elements
const fileInput = document.getElementById('file-input');
const imageUploadWrap = document.querySelector('.image-upload-wrap');
const fileUploadContent = document.querySelector('.file-upload-content');
const faceImage = document.getElementById('face-image');
const loading = document.getElementById('loading');
const labelContainer = document.getElementById('label-container');
const resultMessage = document.querySelector('.result-message');
const retryBtn = document.getElementById('retry-btn');
const themeBtn = document.getElementById('theme-btn');
const html = document.documentElement;
const navbar = document.querySelector('.navbar');

// 동물상 데이터
const animalData = {
    dog: {
        name: '강아지상',
        emoji: '🐶',
        message: '귀엽고 순한 강아지상이에요!',
        description: '친근하고 다정한 매력의 소유자'
    },
    cat: {
        name: '고양이상',
        emoji: '🐱',
        message: '도도하고 매력적인 고양이상이에요!',
        description: '신비롭고 우아한 분위기의 소유자'
    },
    rabbit: {
        name: '토끼상',
        emoji: '🐰',
        message: '상큼하고 발랄한 토끼상이에요!',
        description: '사랑스럽고 청순한 매력의 소유자'
    },
    bear: {
        name: '곰상',
        emoji: '🐻',
        message: '포근하고 듬직한 곰상이에요!',
        description: '따뜻하고 믿음직한 매력의 소유자'
    },
    dino: {
        name: '공룡상',
        emoji: '🦖',
        message: '독특하고 개성 넘치는 공룡상이에요!',
        description: '카리스마와 개성이 넘치는 소유자'
    }
};

// 파일 업로드 이벤트
fileInput.addEventListener('change', handleFileSelect);

// 드래그 앤 드롭 이벤트
imageUploadWrap.addEventListener('dragover', handleDragOver);
imageUploadWrap.addEventListener('dragleave', handleDragLeave);
imageUploadWrap.addEventListener('drop', handleDrop);

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
    imageUploadWrap.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    imageUploadWrap.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    imageUploadWrap.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    }
}

function processFile(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        // UI 전환
        imageUploadWrap.style.display = 'none';
        faceImage.src = e.target.result;
        fileUploadContent.style.display = 'block';

        // 로딩 표시
        loading.style.display = 'block';
        labelContainer.innerHTML = '';
        resultMessage.innerHTML = '';
        retryBtn.style.display = 'none';

        // AI 예측 시뮬레이션
        setTimeout(() => {
            predict();
            loading.style.display = 'none';
            retryBtn.style.display = 'flex';
        }, 1500);
    };

    reader.readAsDataURL(file);
}

function removeUpload() {
    fileInput.value = '';
    fileUploadContent.style.display = 'none';
    imageUploadWrap.style.display = 'block';
    labelContainer.innerHTML = '';
    resultMessage.innerHTML = '';
}

function predict() {
    // 동물 종류 배열
    const animals = ['dog', 'cat', 'rabbit', 'bear', 'dino'];

    // 랜덤 확률 생성
    let predictions = animals.map(animal => ({
        key: animal,
        ...animalData[animal],
        probability: Math.random()
    }));

    // 확률 정렬 (높은 순)
    predictions.sort((a, b) => b.probability - a.probability);

    // 전체 합 계산 (정규화용)
    const totalProb = predictions.reduce((sum, p) => sum + p.probability, 0);

    // 1등 결과 메시지 표시
    resultMessage.innerHTML = predictions[0].message;

    // 결과 바 생성
    predictions.forEach((p, index) => {
        const percent = (p.probability / totalProb) * 100;
        const percentFixed = percent.toFixed(1);

        const div = document.createElement('div');
        div.className = 'animal-box';
        div.innerHTML = `
            <div class="animal-emoji">${p.emoji}</div>
            <div class="animal-label">${p.name}</div>
            <div class="bar-container">
                <div class="progress">
                    <div class="progress-bar" role="progressbar"
                         style="width: 0%"
                         aria-valuenow="${percentFixed}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
            <div class="percent-text">${percentFixed}%</div>
        `;

        labelContainer.appendChild(div);

        // 애니메이션을 위해 약간의 딜레이 후 width 설정
        setTimeout(() => {
            div.querySelector('.progress-bar').style.width = `${percentFixed}%`;
        }, 100 + (index * 50));
    });
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
