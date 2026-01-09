let deck = [];
let currentCard = null;
let stats = { P: 50, C: 50, S: 50, F: 50 };
let year = 1;

// DOM Elements
const cardText = document.getElementById('card-text');
const cardCat = document.getElementById('card-category');
const cardId = document.getElementById('card-id');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const bars = {
    P: document.getElementById('bar-public'),
    C: document.getElementById('bar-command'),
    S: document.getElementById('bar-safety'),
    F: document.getElementById('bar-flow')
};

// Initialize
window.onload = async () => {
    try {
        const response = await fetch('cards.json');
        deck = await response.json();
        startGame();
        registerSW();
    } catch (e) {
        cardText.innerText = "Error loading cards. Check cards.json format.";
    }
};

function startGame() {
    stats = { P: 50, C: 50, S: 50, F: 50 };
    year = 1;
    updateUI();
    document.getElementById('modal').classList.add('hidden');
    drawCard();
}

function drawCard() {
    if (deck.length === 0) return;
    // Pick random card
    const index = Math.floor(Math.random() * deck.length);
    currentCard = deck[index];
    
    // Update HTML
    cardCat.innerText = currentCard.category;
    cardText.innerText = currentCard.text;
    cardId.innerText = `#${currentCard.id}`;
    btnLeft.innerText = currentCard.leftLabel;
    btnRight.innerText = currentCard.rightLabel;
}

function handleChoice(choice) {
    const effect = choice === 'left' ? currentCard.leftEffect : currentCard.rightEffect;
    
    // Apply effects
    stats.P += (effect.P || 0);
    stats.C += (effect.C || 0);
    stats.S += (effect.S || 0);
    stats.F += (effect.F || 0);

    // Clamp between 0 and 100
    Object.keys(stats).forEach(key => {
        if (stats[key] > 100) stats[key] = 100;
        if (stats[key] < 0) stats[key] = 0;
    });

    updateUI();
    checkGameOver();
}

function updateUI() {
    bars.P.style.width = `${stats.P}%`;
    bars.C.style.width = `${stats.C}%`;
    bars.S.style.width = `${stats.S}%`;
    bars.F.style.width = `${stats.F}%`;
    
    // Optional: Change bar color if low
    Object.values(bars).forEach(bar => {
        const width = parseInt(bar.style.width);
        bar.style.background = width < 20 ? '#ef4444' : '#d4af37';
    });
}

function checkGameOver() {
    if (stats.P <= 0) return gameOver("Fired: Public Outcry", "You went viral for the wrong reasons. The Governor fired you.");
    if (stats.C <= 0) return gameOver("Fired: Insubordination", "Command took your badge. You're working security at the mall now.");
    if (stats.S <= 0) return gameOver("Killed in Line of Duty", "End of Watch. Troop 6 mourns.");
    if (stats.F <= 0) return gameOver("Gridlock Disaster", "The Lowcountry is paralyzed. You failed to keep traffic moving.");
    
    // If no game over, next card
    drawCard();
}

function gameOver(title, desc) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = desc;
    document.getElementById('modal').classList.remove('hidden');
}

// Event Listeners
btnLeft.addEventListener('click', () => handleChoice('left'));
btnRight.addEventListener('click', () => handleChoice('right'));
document.getElementById('btn-restart').addEventListener('click', startGame);

// Service Worker Registration
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('sw.js');
        } catch (e) {
            console.log('SW registration failed');
        }
    }
}
