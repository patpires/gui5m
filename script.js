// Configuração do jogo
const gameConfig = {
    images: [
        'bahia_image_1.png', // Farol da Barra
        'bahia_image_2.png', // Pelourinho
        'bahia_image_3.png', // Porto Seguro
        'bahia_image_4.png', // Morro de São Paulo
        'bahia_image_5.png', // Cachoeira da Fumaça
        'bahia_image_6.png'  // Ponta do Mutá
    ],
    backImage: 'toy_baby_cover.png'
};

// Estado do jogo
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    gameStarted: false,
    gameEnded: false
};

// Elementos DOM
const gameBoard = document.getElementById('gameBoard');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const pairsElement = document.getElementById('pairs');
const restartBtn = document.getElementById('restartBtn');
const victoryModal = document.getElementById('victoryModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalMovesElement = document.getElementById('finalMoves');
const finalTimeElement = document.getElementById('finalTime');

// Inicialização do jogo
function initGame() {
    resetGameState();
    createCards();
    shuffleCards();
    renderCards();
    setupEventListeners();
}

// Reset do estado do jogo
function resetGameState() {
    gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: 0,
        timerInterval: null,
        gameStarted: false,
        gameEnded: false
    };
    
    updateUI();
    hideVictoryModal();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
}

// Criar cartas (2 de cada imagem)
function createCards() {
    gameState.cards = [];
    
    gameConfig.images.forEach((image, index) => {
        // Criar duas cartas idênticas para cada imagem
        gameState.cards.push({
            id: index * 2,
            image: image,
            isFlipped: false,
            isMatched: false
        });
        
        gameState.cards.push({
            id: index * 2 + 1,
            image: image,
            isFlipped: false,
            isMatched: false
        });
    });
}

// Embaralhar cartas
function shuffleCards() {
    for (let i = gameState.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.cards[i], gameState.cards[j]] = [gameState.cards[j], gameState.cards[i]];
    }
}

// Renderizar cartas no DOM
function renderCards() {
    gameBoard.innerHTML = '';
    
    gameState.cards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        gameBoard.appendChild(cardElement);
    });
}

// Criar elemento de carta
function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.index = index;
    
    cardDiv.innerHTML = `
        <div class="card-face card-back">
            <img src="${gameConfig.backImage}" alt="Carta virada" class="card-back-image">
        </div>
        <div class="card-face card-front">
            <img src="${card.image}" alt="Imagem da Bahia" class="card-image">
        </div>
    `;
    
    cardDiv.addEventListener('click', () => handleCardClick(index));
    
    return cardDiv;
}

// Manipular clique na carta
function handleCardClick(index) {
    const card = gameState.cards[index];
    
    // Verificar se a carta pode ser virada
    if (card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2 || gameState.gameEnded) {
        return;
    }
    
    // Iniciar timer no primeiro clique
    if (!gameState.gameStarted) {
        startTimer();
        gameState.gameStarted = true;
    }
    
    // Virar carta
    flipCard(index);
    
    // Verificar se duas cartas estão viradas
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateUI();
        
        setTimeout(() => {
            checkForMatch();
        }, 1000);
    }
}

// Virar carta
function flipCard(index) {
    const card = gameState.cards[index];
    const cardElement = document.querySelector(`[data-index="${index}"]`);
    
    card.isFlipped = true;
    cardElement.classList.add('flipped');
    gameState.flippedCards.push(index);
}

// Verificar se há match
function checkForMatch() {
    const [firstIndex, secondIndex] = gameState.flippedCards;
    const firstCard = gameState.cards[firstIndex];
    const secondCard = gameState.cards[secondIndex];
    
    if (firstCard.image === secondCard.image) {
        // Match encontrado!
        handleMatch(firstIndex, secondIndex);
    } else {
        // Não há match, virar cartas de volta
        handleNoMatch(firstIndex, secondIndex);
    }
    
    gameState.flippedCards = [];
}

// Manipular match
function handleMatch(firstIndex, secondIndex) {
    const firstCard = gameState.cards[firstIndex];
    const secondCard = gameState.cards[secondIndex];
    const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
    const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
    
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    
    firstElement.classList.add('matched');
    secondElement.classList.add('matched');
    
    gameState.matchedPairs++;
    updateUI();
    
    // Criar efeito de partículas
    createCelebrationParticles(firstElement);
    createCelebrationParticles(secondElement);
    
    // Verificar se o jogo terminou
    if (gameState.matchedPairs === gameConfig.images.length) {
        setTimeout(() => {
            endGame();
        }, 500);
    }
}

// Manipular quando não há match
function handleNoMatch(firstIndex, secondIndex) {
    const firstCard = gameState.cards[firstIndex];
    const secondCard = gameState.cards[secondIndex];
    const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
    const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
    
    firstCard.isFlipped = false;
    secondCard.isFlipped = false;
    
    firstElement.classList.remove('flipped');
    secondElement.classList.remove('flipped');
}

// Criar partículas de celebração
function createCelebrationParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.background = ['#FFD23F', '#FF6B35', '#06D6A0', '#118AB2'][Math.floor(Math.random() * 4)];
        
        // Posição aleatória
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        particle.style.setProperty('--end-x', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--end-y', Math.sin(angle) * distance + 'px');
        
        document.body.appendChild(particle);
        
        // Remover partícula após animação
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

// Iniciar timer
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateUI();
    }, 1000);
}

// Parar timer
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Atualizar interface
function updateUI() {
    movesElement.textContent = gameState.moves;
    pairsElement.textContent = `${gameState.matchedPairs}/${gameConfig.images.length}`;
    
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Terminar jogo
function endGame() {
    gameState.gameEnded = true;
    stopTimer();
    showVictoryModal();
}

// Mostrar modal de vitória
function showVictoryModal() {
    finalMovesElement.textContent = gameState.moves;
    finalTimeElement.textContent = timerElement.textContent;
    victoryModal.style.display = 'flex';
}

// Esconder modal de vitória
function hideVictoryModal() {
    victoryModal.style.display = 'none';
}

// Configurar event listeners
function setupEventListeners() {
    restartBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
    
    // Fechar modal clicando fora dele
    victoryModal.addEventListener('click', (e) => {
        if (e.target === victoryModal) {
            hideVictoryModal();
        }
    });
    
    // Suporte a teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && victoryModal.style.display === 'flex') {
            hideVictoryModal();
        }
        
        if (e.key === 'r' || e.key === 'R') {
            initGame();
        }
    });
}

// Adicionar suporte a touch para dispositivos móveis
function addTouchSupport() {
    let touchStartTime = 0;
    
    gameBoard.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
    });
    
    gameBoard.addEventListener('touchend', (e) => {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        // Considerar como clique se o toque for rápido
        if (touchDuration < 200) {
            e.preventDefault();
        }
    });
}

// Precarregar imagens
function preloadImages() {
    const imagesToLoad = [...gameConfig.images, gameConfig.backImage];
    let loadedImages = 0;
    
    imagesToLoad.forEach(imageSrc => {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            if (loadedImages === imagesToLoad.length) {
                // Todas as imagens foram carregadas
                console.log('Todas as imagens foram carregadas!');
            }
        };
        img.onerror = () => {
            console.error(`Erro ao carregar imagem: ${imageSrc}`);
        };
        img.src = imageSrc;
    });
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    addTouchSupport();
    initGame();
});

// Adicionar animação de entrada suave
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

