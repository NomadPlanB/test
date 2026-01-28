function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
            document.querySelector('.image-upload-wrap').style.display = 'none';
            var img = document.querySelector('.file-upload-image');
            img.src = e.target.result;
            document.querySelector('.file-upload-content').style.display = 'block';

            // 로딩 표시
            document.getElementById('loading').style.display = 'block';
            document.getElementById('label-container').innerHTML = ''; // 이전 결과 초기화
            document.querySelector('.result-message').innerHTML = '';

            // AI 예측 시뮬레이션 (3초 후 결과 표시)
            setTimeout(function() {
                predict();
                document.getElementById('loading').style.display = 'none';
            }, 1500);
        };

        reader.readAsDataURL(input.files[0]);
    } else {
        removeUpload();
    }
}

function removeUpload() {
    document.querySelector('.file-upload-input').value = ""; // input 초기화
    document.querySelector('.file-upload-content').style.display = 'none';
    document.querySelector('.image-upload-wrap').style.display = 'block';
    document.getElementById('label-container').innerHTML = '';
    document.querySelector('.result-message').innerHTML = '';
}

function predict() {
    // 실제 모델 대신 랜덤값 생성 (합이 100%가 되도록 로직 구성은 복잡하니, 단순 랜덤값 부여 후 정렬)
    // 실제 서비스에서는 model.predict() 등을 사용

    // 동물상 종류
    const classes = [
        { name: "강아지상", class: "dog" },
        { name: "고양이상", class: "cat" },
        { name: "토끼상", class: "rabbit" },
        { name: "곰상", class: "bear" },
        { name: "공룡상", class: "dino" }
    ];

    // 랜덤 확률 생성
    let predictions = classes.map(c => {
        return { 
            name: c.name, 
            class: c.class, 
            probability: Math.random() 
        };
    });

    // 확률 정렬 (높은 순)
    predictions.sort((a, b) => b.probability - a.probability);

    // 상위 1등 메시지
    var resultMessage;
    switch (predictions[0].name) {
        case "강아지상":
            resultMessage = "귀엽고 순한 강아지상입니다!";
            break;
        case "고양이상":
            resultMessage = "도도하고 매력적인 고양이상입니다!";
            break;
        case "토끼상":
            resultMessage = "상큼하고 발랄한 토끼상입니다!";
            break;
        case "곰상":
            resultMessage = "포근하고 듬직한 곰상입니다!";
            break;
        case "공룡상":
            resultMessage = "카리스마 넘치는 공룡상입니다!";
            break;
        default:
            resultMessage = "알 수 없는 동물상입니다.";
    }
    
    document.querySelector('.result-message').innerHTML = resultMessage;


    // 바 그래프 생성
    // 전체 합 구하기 (단순 정규화)
    let totalProb = predictions.reduce((sum, p) => sum + p.probability, 0);

    const labelContainer = document.getElementById('label-container');
    
    predictions.forEach(p => {
        // 백분율 계산
        let percent = (p.probability / totalProb) * 100;
        let percentFixed = percent.toFixed(1);

        // 색상 결정 (간단히)
        let colorClass = "bg-secondary";
        if(p.class === 'dog') colorClass = "bg-info";
        else if(p.class === 'cat') colorClass = "bg-warning";
        else if(p.class === 'rabbit') colorClass = "bg-danger";
        else if(p.class === 'bear') colorClass = "bg-success";
        else if(p.class === 'dino') colorClass = "bg-primary";


        const div = document.createElement('div');
        div.className = 'animal-box';
        div.innerHTML = `
            <div class="animal-label">${p.name}</div>
            <div class="bar-container w-100">
                <div class="progress">
                    <div class="progress-bar ${colorClass}" role="progressbar" style="width: ${percentFixed}%" aria-valuenow="${percentFixed}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div class="percent-text">${percentFixed}%</div>
        `;
        labelContainer.appendChild(div);
    });
}
