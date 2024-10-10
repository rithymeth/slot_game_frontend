// Authentication Elements
const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');
const registerButton = document.getElementById('register-button');
const registerMessage = document.getElementById('register-message');

const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const loginMessage = document.getElementById('login-message');

const authContainer = document.getElementById('auth-container');
const slotMachine = document.querySelector('.slot-machine');

// Game Elements
const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3'),
    document.getElementById('reel4'),
    document.getElementById('reel5')
];
const spinButton = document.getElementById('spin-button');
const message = document.getElementById('message');
const balanceDisplay = document.getElementById('balance');
const betAmountInput = document.getElementById('bet-amount');
const spinSound = document.getElementById('spin-sound');
const winSound = document.getElementById('win-sound');
const bonusSound = document.getElementById('bonus-sound');
const backgroundMusic = document.getElementById('background-music');
const jackpotDisplay = document.getElementById('jackpot');
const themeSelector = document.getElementById('theme');

// Settings Elements
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsButton = document.getElementById('close-settings');
const soundToggle = document.getElementById('sound-toggle');
const musicToggle = document.getElementById('music-toggle');

// Bonus Game Elements
const bonusGameModal = document.getElementById('bonus-game-modal');
const spinBonusWheelButton = document.getElementById('spin-bonus-wheel');
const bonusGameMessage = document.getElementById('bonus-game-message');
const closeBonusGameButton = document.getElementById('close-bonus-game');

// Bet Multipliers
const betMultiplierButtons = document.querySelectorAll('.bet-multiplier');
const maxBetButton = document.getElementById('max-bet-button');

// Achievements Elements
const achievementsList = document.getElementById('achievements-list');

// Leaderboard Elements
const leaderboardList = document.getElementById('leaderboard-list');

let balance = 0;
let jackpot = 0;
let totalWinnings = 0;
let token = '';
let achievements = [];

const symbols = ['🍒', '🍋', '🍊', '🍉', '🍇', '⭐', '💎', '🔔', '🍀', '🎰'];
const wildSymbol = '🍀'; // Wild symbol
const scatterSymbol = '⭐'; // Scatter symbol
const bonusSymbol = '🎰'; // Bonus game symbol

let freeSpins = 0;

// Base URL for API endpoints
const BASE_URL = 'http://localhost:5000'; // Update this if your backend is hosted elsewhere

registerButton.addEventListener('click', register);
loginButton.addEventListener('click', login);
spinButton.addEventListener('click', spin);
themeSelector.addEventListener('change', changeTheme);

// Settings Event Listeners
settingsButton.addEventListener('click', openSettingsModal);
closeSettingsButton.addEventListener('click', closeSettingsModal);
soundToggle.addEventListener('change', toggleSound);
musicToggle.addEventListener('change', toggleMusic);

// Bet Multiplier Event Listeners
betMultiplierButtons.forEach(button => {
    button.addEventListener('click', setBetMultiplier);
});
maxBetButton.addEventListener('click', setMaxBet);

// Bonus Game Event Listeners
spinBonusWheelButton.addEventListener('click', spinBonusWheel);
closeBonusGameButton.addEventListener('click', closeBonusGameModal);

chests.forEach(chest => chest.addEventListener('click', selectChest));
closeBonusButton.addEventListener('click', closeBonusModal);

// Keyboard Accessibility for Chests
chests.forEach(chest => {
    chest.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            selectChest(event);
        }
    });
});

async function register() {
    const username = registerUsername.value.trim();
    const password = registerPassword.value.trim();

    if (!username || !password) {
        registerMessage.textContent = 'Please enter a username and password.';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            registerMessage.textContent = 'Registration successful! Please log in.';
            registerMessage.style.color = '#27ae60';
        } else {
            registerMessage.textContent = data.message || 'Registration failed.';
            registerMessage.style.color = '#e74c3c';
        }
    } catch (error) {
        registerMessage.textContent = 'An error occurred.';
        registerMessage.style.color = '#e74c3c';
    }
}

async function login() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
        loginMessage.textContent = 'Please enter your username and password.';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            balance = data.user.balance;
            jackpot = data.user.jackpot;
            totalWinnings = data.user.totalWinnings || 0;
            achievements = data.user.achievements || [];
            updateBalance();
            updateJackpot();
            updateAchievements();
            authContainer.style.display = 'none';
            slotMachine.style.display = 'block';
            fetchLeaderboard();
            loadUserSettings();
        } else {
            loginMessage.textContent = data.message || 'Login failed.';
            loginMessage.style.color = '#e74c3c';
        }
    } catch (error) {
        loginMessage.textContent = 'An error occurred.';
        loginMessage.style.color = '#e74c3c';
    }
}

async function spin() {
    let betAmount = parseInt(betAmountInput.value);

    if (isNaN(betAmount) || betAmount <= 0) {
        message.textContent = 'Invalid bet amount!';
        return;
    }

    if (freeSpins > 0) {
        betAmount = 0;
        freeSpins--;
        message.textContent = `Free Spin! ${freeSpins} remaining.`;
    } else if (betAmount > balance) {
        message.textContent = 'Insufficient balance!';
        return;
    } else {
        balance -= betAmount;
        jackpot += Math.floor(betAmount * 0.05); // 5% of bet goes to jackpot
    }

    spinButton.disabled = true;
    updateBalance();
    updateJackpot();

    // Play spin sound if enabled
    if (soundToggle.checked) {
        spinSound.play();
    }

    let count = 0;
    const maxSpins = 20;

    // Add spin animation to all symbols
    reelElements.forEach(reel => {
        reel.querySelectorAll('.symbol').forEach(symbol => {
            symbol.classList.add('spin-animation');
        });
    });

    // Start changing symbols during the spin
    const interval = setInterval(() => {
        reelElements.forEach(reel => {
            reel.querySelectorAll('.symbol').forEach(symbol => {
                symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            });
        });
        count++;

        if (count >= maxSpins) {
            clearInterval(interval);

            // Remove spin animation
            reelElements.forEach(reel => {
                reel.querySelectorAll('.symbol').forEach(symbol => {
                    symbol.classList.remove('spin-animation');
                });
            });

            // Set final symbols
            const finalGrid = [];
            reelElements.forEach(reel => {
                const symbolsInReel = [];
                reel.querySelectorAll('.symbol').forEach(symbol => {
                    const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                    symbol.textContent = finalSymbol;
                    symbolsInReel.push(finalSymbol);
                });
                finalGrid.push(symbolsInReel);
            });

            checkWin(betAmount, finalGrid);
            spinButton.disabled = false;
        }
    }, 100);
}

async function checkWin(betAmount, finalGrid) {
    let winAmount = 0;
    let winLines = [];

    // Define paylines (horizontal, diagonal, V-shaped)
    const paylines = [
        [ [0,0], [1,0], [2,0], [3,0], [4,0] ], // Top row
        [ [0,1], [1,1], [2,1], [3,1], [4,1] ], // Middle row
        [ [0,2], [1,2], [2,2], [3,2], [4,2] ], // Bottom row
        [ [0,0], [1,1], [2,2], [3,1], [4,0] ], // V shape
        [ [0,2], [1,1], [2,0], [3,1], [4,2] ], // Inverted V shape
        [ [0,0], [1,1], [2,1], [3,1], [4,2] ], // Diagonal top-left to bottom-right
        [ [0,2], [1,1], [2,1], [3,1], [4,0] ]  // Diagonal bottom-left to top-right
    ];

    // Clear previous win highlights
    clearWinHighlights();

    // Check each payline
    paylines.forEach((line, index) => {
        const symbolsInLine = line.map(([col, row]) => finalGrid[col][row]);
        const counts = {};
        symbolsInLine.forEach(symbol => {
            const sym = symbol === wildSymbol ? symbolsInLine[0] : symbol;
            counts[sym] = (counts[sym] || 0) + 1;
        });

        for (const symbol in counts) {
            if (counts[symbol] >= 3 && symbol !== scatterSymbol && symbol !== bonusSymbol) {
                const multiplier = getMultiplier(counts[symbol]);
                const lineWin = betAmount * multiplier;
                winAmount += lineWin;
                winLines.push({
                    line: index + 1,
                    symbol,
                    count: counts[symbol],
                    amount: lineWin,
                    positions: line
                });
            }
        }
    });

    // Highlight winning lines
    winLines.forEach(winLine => {
        winLine.positions.forEach(([col, row]) => {
            const reel = reelElements[col];
            const symbolElement = reel.querySelectorAll('.symbol')[row];
            symbolElement.classList.add('win');
        });
    });

    // Check for Scatter symbols across the grid
    let scatterCount = 0;
    let bonusSymbolCount = 0;
    finalGrid.forEach(column => {
        column.forEach(symbol => {
            if (symbol === scatterSymbol) {
                scatterCount++;
            }
            if (symbol === bonusSymbol) {
                bonusSymbolCount++;
            }
        });
    });

    if (scatterCount >= 3) {
        freeSpins += scatterCount;
        message.textContent += ` 🎁 You won ${scatterCount} free spins!`;
        unlockAchievement('Lucky Star');
    }

    if (bonusSymbolCount >= 3) {
        openBonusGameModal();
    }

    if (winAmount > 0) {
        balance += winAmount;
        totalWinnings += winAmount;
        updateBalance();

        // Create a message indicating the winning lines
        let winMessage = `🎉 You won $${winAmount} on the following paylines: `;
        winMessage += winLines.map(winLine => `Line ${winLine.line}`).join(', ');
        message.textContent = winMessage;

        // Play win animation
        gsap.fromTo('.slot-machine', { scale: 1 }, { scale: 1.05 + (winLines.length * 0.01), duration: 0.5, yoyo: true, repeat: 1 });

        // Play win sound if enabled
        if (soundToggle.checked) {
            winSound.play();
        }
    } else {
        message.textContent = '😞 No win. Try again!';
    }

    // Check for jackpot win (e.g., five 💎 symbols on a payline)
    const jackpotWon = winLines.some(winLine => winLine.symbol === '💎' && winLine.count === 5);
    if (jackpotWon) {
        balance += jackpot;
        message.textContent += ` 💰 JACKPOT! You won $${jackpot}! 💰`;
        jackpot = 500; // Reset jackpot
        updateJackpot();
        unlockAchievement('Jackpot Winner');
    }

    // Check for high roller achievement
    if (betAmount >= 100) {
        unlockAchievement('High Roller');
    }

    // Check for first spin achievement
    unlockAchievement('First Spin');

    if (balance <= 0 && freeSpins === 0) {
        message.textContent = 'Game over! You have no more balance.';
        spinButton.disabled = true;
    }

    // Update game state and leaderboard
    await updateGameState();
    fetchLeaderboard();
}

function clearWinHighlights() {
    reelElements.forEach(reel => {
        reel.querySelectorAll('.symbol').forEach(symbol => {
            symbol.classList.remove('win');
        });
    });
}

function getMultiplier(count) {
    switch (count) {
        case 3:
            return 5;
        case 4:
            return 15;
        case 5:
            return 50;
        default:
            return 0;
    }
}

function updateBalance() {
    balanceDisplay.textContent = balance;
}

function updateJackpot() {
    jackpotDisplay.textContent = jackpot;
}

function changeTheme() {
    const theme = themeSelector.value;
    document.body.className = ''; // Reset class names
    document.body.classList.add(theme);
}

function openSettingsModal() {
    settingsModal.style.display = 'block';
}

function closeSettingsModal() {
    settingsModal.style.display = 'none';
    saveUserSettings();
}

function toggleSound() {
    if (!soundToggle.checked) {
        spinSound.pause();
        winSound.pause();
        bonusSound.pause();
    }
}

function toggleMusic() {
    if (musicToggle.checked) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

function setBetMultiplier(event) {
    const multiplier = parseInt(event.target.getAttribute('data-multiplier'));
    const baseBet = parseInt(betAmountInput.value);
    betAmountInput.value = baseBet * multiplier;
}

function setMaxBet() {
    betAmountInput.value = balance;
}

function openBonusGameModal() {
    bonusGameModal.style.display = 'block';
    bonusGameMessage.textContent = '';
}

function closeBonusGameModal() {
    bonusGameModal.style.display = 'none';
}

function spinBonusWheel() {
    const prizes = [100, 200, 300, 500, 0];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    if (prize > 0) {
        balance += prize;
        totalWinnings += prize;
        updateBalance();
        bonusGameMessage.textContent = `🎉 You won $${prize}!`;
        if (soundToggle.checked) {
            bonusSound.play();
        }
    } else {
        bonusGameMessage.textContent = '😞 No prize this time.';
    }
}

function selectChest(event) {
    // Existing chest selection logic
}

window.onclick = function(event) {
    if (event.target == bonusModal) {
        closeBonusModal();
    }
    if (event.target == settingsModal) {
        closeSettingsModal();
    }
    if (event.target == bonusGameModal) {
        closeBonusGameModal();
    }
};

async function updateGameState() {
    try {
        await fetch(`${BASE_URL}/game/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ balance, jackpot, totalWinnings, achievements })
        });
    } catch (error) {
        console.error('Error updating game state:', error);
    }
}

function updateAchievements() {
    achievementsList.innerHTML = '';
    achievements.forEach(achievement => {
        const li = document.createElement('li');
        li.textContent = achievement.name + ': ' + achievement.description;
        if (achievement.achieved) {
            li.classList.add('achieved');
        }
        achievementsList.appendChild(li);
    });
}

function unlockAchievement(name) {
    const achievement = achievements.find(a => a.name === name);
    if (achievement && !achievement.achieved) {
        achievement.achieved = true;
        message.textContent += ` 🏆 Achievement Unlocked: ${name}!`;
        updateAchievements();
    }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch(`${BASE_URL}/game/leaderboard`);
        const data = await response.json();
        leaderboardList.innerHTML = '';
        data.forEach((player, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${player.username} - $${player.totalWinnings}`;
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

function loadUserSettings() {
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    soundToggle.checked = soundEnabled;
    musicToggle.checked = musicEnabled;
    if (musicEnabled) {
        backgroundMusic.play();
    }
}

function saveUserSettings() {
    localStorage.setItem('soundEnabled', soundToggle.checked);
    localStorage.setItem('musicEnabled', musicToggle.checked);
    if (!musicToggle.checked) {
        backgroundMusic.pause();
    }
}

// Accessibility: Keyboard Navigation for Spin Button
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && document.activeElement === spinButton) {
        spin();
    }
});

// Set initial focus on login username input
loginUsername.focus();
