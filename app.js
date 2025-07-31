document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const mainMenu = document.getElementById('mainMenu');
    const gameScreen = document.getElementById('gameScreen');
    const inventoryScreen = document.getElementById('inventoryScreen');
    const playBtn = document.getElementById('playBtn');
    const inventoryBtn = document.getElementById('inventoryBtn');
    const backBtn = document.getElementById('backBtn');
    const backBtnInventory = document.getElementById('backBtnInventory');
    const betBtn = document.getElementById('betBtn');
    const betModal = document.getElementById('betModal');
    const closeModal = document.getElementById('closeModal');
    const modalGifts = document.getElementById('modalGifts');
    const rouletteLine = document.getElementById('rouletteLine');
    const participantsList = document.getElementById('participants');
    const timer = document.getElementById('timer');
    const winModal = document.getElementById('winModal');
    const closeWinModal = document.getElementById('closeWinModal');
    const winText = document.getElementById('winText');
    const giftsGrid = document.getElementById('giftsGrid');

    // Данные игры
    const gifts = [
        { id: 1, name: 'Normal Gift', rarity: 'Normal', img: 'https://i.yapx.ru/aGMLa.png' },
        { id: 2, name: 'Rare Gift', rarity: 'Rare', img: 'https://i.yapx.ru/aGMei.png' },
        { id: 3, name: 'Epic Gift', rarity: 'Epic', img: 'https://i.yapx.ru/aGMe1.png' },
        { id: 4, name: 'Legendary Gift', rarity: 'Legendary', img: 'https://i.yapx.ru/aGMff.png' },
        { id: 5, name: 'Immortal Gift', rarity: 'Immortal', img: 'https://i.yapx.ru/aGMfO.png' }
    ];

    let userInventory = [];
    let participants = [];
    let gameInterval;
    let timerInterval;
    let timeLeft = 30;
    let isGameRunning = false;

    // Инициализация игры
    function initGame() {
        // Даем игроку по 5 подарков (по одному каждого типа)
        userInventory = [...gifts];
        renderInventory();
    }

    // Рендер инвентаря
    function renderInventory() {
        giftsGrid.innerHTML = '';
        userInventory.forEach(gift => {
            const giftItem = document.createElement('div');
            giftItem.className = 'gift-item';
            giftItem.innerHTML = `
                <img src="${gift.img}" alt="${gift.name}" class="gift-img">
                <div class="gift-name">${gift.name}</div>
                <div class="gift-rarity">${gift.rarity}</div>
            `;
            giftsGrid.appendChild(giftItem);
        });
    }

    // Показать модальное окно с подарками для ставки
    function showBetModal() {
        modalGifts.innerHTML = '';
        userInventory.forEach(gift => {
            const giftItem = document.createElement('div');
            giftItem.className = 'gift-item';
            giftItem.innerHTML = `
                <img src="${gift.img}" alt="${gift.name}" class="gift-img">
                <div class="gift-name">${gift.name}</div>
                <div class="gift-rarity">${gift.rarity}</div>
            `;
            giftItem.addEventListener('click', () => makeBet(gift));
            modalGifts.appendChild(giftItem);
        });
        betModal.style.display = 'flex';
    }

    // Сделать ставку
    function makeBet(gift) {
        // Удаляем подарок из инвентаря
        userInventory = userInventory.filter(item => item.id !== gift.id);
        renderInventory();
        
        // Добавляем участника
        const participant = {
            id: Date.now(),
            name: 'Игрок ' + (participants.length + 1),
            avatar: 'https://i.pravatar.cc/150?img=' + (participants.length + 1),
            gift: gift
        };
        
        participants.push(participant);
        renderParticipants();
        betModal.style.display = 'none';
        
        // Если участников больше 1, запускаем таймер
        if (participants.length >= 2 && !isGameRunning) {
            startGameTimer();
        }
    }

    // Рендер списка участников
    function renderParticipants() {
        participantsList.innerHTML = '';
        participants.forEach(participant => {
            const participantItem = document.createElement('div');
            participantItem.className = 'participant-item';
            participantItem.innerHTML = `
                <img src="${participant.avatar}" alt="${participant.name}" class="participant-avatar">
                <div class="participant-info">
                    <div class="participant-name">${participant.name}</div>
                    <div class="participant-gift">Ставка: ${participant.gift.name}</div>
                </div>
            `;
            participantsList.appendChild(participantItem);
        });
        
        // Также обновляем рулетку
        updateRoulette();
    }

    // Обновление рулетки
    function updateRoulette() {
        rouletteLine.innerHTML = '';
        participants.forEach(participant => {
            const avatar = document.createElement('img');
            avatar.src = participant.avatar;
            avatar.className = 'participant-avatar';
            avatar.alt = participant.name;
            rouletteLine.appendChild(avatar);
        });
        
        // Дублируем аватары для эффекта бесконечной ленты
        const clones = rouletteLine.cloneNode(true);
        rouletteLine.appendChild(clones);
    }

    // Запуск таймера игры
    function startGameTimer() {
        isGameRunning = true;
        timeLeft = 30;
        timer.style.display = 'block';
        timer.textContent = timeLeft;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                startRoulette();
            }
        }, 1000);
    }

    // Запуск рулетки
    function startRoulette() {
        const duration = 5000; // 5 секунд
        const startTime = Date.now();
        const startPosition = 0;
        const segmentWidth = 110; // Ширина сегмента (аватар + отступ)
        const segments = participants.length;
        
        // Вычисляем позицию остановки (случайный участник)
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const stopPosition = -(winnerIndex * segmentWidth + segmentWidth / 2 - rouletteLine.offsetWidth / 2);
        
        function animate() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Замедление в конце
            const easing = 1 - Math.pow(1 - progress, 3);
            
            // Позиция с замедлением
            const position = startPosition + (stopPosition - startPosition) * easing;
            rouletteLine.style.transform = `translateX(${position}px)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Рулетка остановилась, определяем победителя
                setTimeout(() => {
                    showWinner(winnerIndex);
                }, 1000);
            }
        }
        
        requestAnimationFrame(animate);
    }

    // Показать победителя
    function showWinner(winnerIndex) {
        const winner = participants[winnerIndex];
        isGameRunning = false;
        
        // Создаем конфетти
        createConfetti();
        
        // Показываем модальное окно
        winText.textContent = `${winner.name} выиграл все подарки!`;
        winModal.style.display = 'flex';
        
        // Очищаем участников
        participants = [];
        renderParticipants();
        timer.style.display = 'none';
    }

    // Создание эффекта конфетти
    function createConfetti() {
        const colors = ['#f8e9a1', '#ff6b6b', '#4ecdc4', '#ff8e53', '#a1c4fd'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(confetti);
            
            // Удаляем конфетти после анимации
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Обработчики событий
    playBtn.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        gameScreen.style.display = 'block';
    });

    inventoryBtn.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        inventoryScreen.style.display = 'block';
    });

    backBtn.addEventListener('click', () => {
        gameScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    backBtnInventory.addEventListener('click', () => {
        inventoryScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    betBtn.addEventListener('click', showBetModal);

    closeModal.addEventListener('click', () => {
        betModal.style.display = 'none';
    });

    closeWinModal.addEventListener('click', () => {
        winModal.style.display = 'none';
    });

    // Инициализация игры при загрузке
    initGame();
});