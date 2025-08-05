const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Налаштування гри ---
const size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.75);
canvas.width = size;
canvas.height = size;
const box = Math.floor(size / 20);

// --- Список цитат ---
const quotes = [
    "Спробуй ще! Цього разу без стін.",
    "Змійка втомилася і вирішила поспати.",
    "Ти не програв, ти просто знайшов ще один спосіб, як не треба робити.",
    "Навіть найдовша змійка починається з одного яблука.",
    "Стіна 1:0 Гравець. Реванш?",
    "Ой. Здається, це була несуча стіна.",
    "Змійка вирішила стати колом. Невдало.",
    "Це не баг, це фіча - раптовий фінал.",
    "Наступного разу пощастить більше!",
    "Здається, змійка з'їла щось не те.",
    "Змійка пішла в офлайн. Повернеться пізніше.",
    "Рахунок анульовано. Стіна заплатила хабар.",
    "Ти був такий близький! .. до тієї стіни.",
    "Помилка 404: шлях не знайдено.",
    "Змійка практикує соціальне дистанціювання. Від самої себе.",
    "Це був неконтрольований зріст. Треба було зупинитись.",
    "Гадаєш, у тебе був поганий день? Подумай про цю змійку.",
    "Термінове гальмування. В стіну.",
    "Для такої довгої змійки потрібне більше поле.",
    "Добре, що змійки не мають страхових компаній.",
    "Це був стратегічний відступ. Прямо в себе.",
    "Не хвилюйся, пікселі не постраждали.",
    "Натисни \"Почати заново\", щоб зробити вигляд, що цього не було."
];

// --- Ігрові змінні ---
let score, gameOver, d, snake, food, explosionParticles;
const numParticles = 50;
let restartButtonArea; // Область для нашої намальованої кнопки

// --- Функція для ініціалізації/скидання гри ---
function initGame() {
    score = 0;
    gameOver = false;
    d = undefined;
    
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };

    food = { x: Math.floor(Math.random() * 20) * box, y: Math.floor(Math.random() * 20) * box };

    explosionParticles = [];
    restartButtonArea = null; // Скидаємо область кнопки

    if (game) clearInterval(game);
    game = setInterval(draw, 150);
}

// --- Керування ---
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', e => { e.preventDefault(); if (gameOver) { handleRestartClick(e.changedTouches[0]); } else { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; } }, { passive: false });
canvas.addEventListener('touchend', e => { e.preventDefault(); if (!gameOver) handleSwipe(e.changedTouches[0].screenX, e.changedTouches[0].screenY); }, { passive: false });
canvas.addEventListener('click', e => { if (gameOver) handleRestartClick(e); });

function handleSwipe(endX, endY) { const dx = endX - touchStartX; const dy = endY - touchStartY; if (Math.abs(dx) > Math.abs(dy)) { if (dx > 30 && d !== "LEFT") d = "RIGHT"; else if (dx < -30 && d !== "RIGHT") d = "LEFT"; } else { if (dy > 30 && d !== "UP") d = "DOWN"; else if (dy < -30 && d !== "DOWN") d = "UP"; } }
document.addEventListener("keydown", event => { if (gameOver) return; if (event.keyCode == 37 && d != "RIGHT") d = "LEFT"; else if (event.keyCode == 38 && d != "DOWN") d = "UP"; else if (event.keyCode == 39 && d != "LEFT") d = "RIGHT"; else if (event.keyCode == 40 && d != "UP") d = "DOWN"; });

// --- Логіка кліку по кнопці перезапуску ---
function handleRestartClick(event) {
    if (!restartButtonArea) return; // Якщо область кнопки ще не визначена
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Перевіряємо, чи клік був у межах нашої намальованої кнопки
    if (clickX > restartButtonArea.x && clickX < restartButtonArea.x + restartButtonArea.w &&
        clickY > restartButtonArea.y && clickY < restartButtonArea.y + restartButtonArea.h) {
        initGame();
    }
}


// --- Логіка зіткнень та вибуху ---
function collision(head, array) { for (let i = 0; i < array.length; i++) { if (head.x === array[i].x && head.y === array[i].y) return true; } return false; }
function initiateExplosion(x, y) { let pointX = x + box / 2; let pointY = y + box / 2; for (let i = 0; i < numParticles; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 4 + 1; explosionParticles.push({ x: pointX, y: pointY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: Math.random() * 3 + 2, alpha: 1 }); } animateExplosion(); }
function animateExplosion() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let hasParticles = false;
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        let p = explosionParticles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.02;
        if (p.alpha > 0) {
            hasParticles = true;
            ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 155 + 100)}, 0, ${p.alpha})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        }
    }
    if (hasParticles) {
        requestAnimationFrame(animateExplosion);
    } else {
        // --- МАЛЮЄМО ВЕСЬ ЕКРАН "ГРИ ЗАКІНЧЕНО" ---
        // Вибираємо цитату
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        // Малюємо "Гру закінчено"
        ctx.fillStyle = "white";
        ctx.font = `bold ${box * 2}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("Гру закінчено", canvas.width / 2, canvas.height / 2 - box * 3);

        // Малюємо цитату
        ctx.font = `${box * 1}px Arial`;
        ctx.fillText(randomQuote, canvas.width / 2, canvas.height / 2 - box * 1.5);

        // Малюємо кнопку
        restartButtonArea = { x: canvas.width / 2 - box * 5, y: canvas.height / 2, w: box * 10, h: box * 2.5 };
        ctx.fillStyle = "white";
        ctx.fillRect(restartButtonArea.x, restartButtonArea.y, restartButtonArea.w, restartButtonArea.h);
        ctx.fillStyle = "black";
        ctx.font = `bold ${box * 1.2}px Arial`;
        ctx.fillText("Почати заново", canvas.width / 2, restartButtonArea.y + restartButtonArea.h / 1.5);
    }
}

// --- Головний цикл гри ---
function draw() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? "green" : "lime";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
    ctx.fillStyle = "white";
    ctx.font = `${box * 1.5}px Arial`;
    ctx.textAlign = "left";
    ctx.fillText("Рахунок: " + score, box, box * 1.6);
    if (d) {
        let snakeX = snake[0].x, snakeY = snake[0].y;
        if (d === "LEFT") snakeX -= box; if (d === "UP") snakeY -= box; if (d === "RIGHT") snakeX += box; if (d === "DOWN") snakeY += box;
        let newHead = { x: snakeX, y: snakeY };
        if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
            gameOver = true;
            clearInterval(game);
            initiateExplosion(snakeX, snakeY);
            return;
        }
        if (snakeX === food.x && snakeY === food.y) {
            score++;
            food = { x: Math.floor(Math.random() * 20) * box, y: Math.floor(Math.random() * 20) * box };
        } else {
            snake.pop();
        }
        snake.unshift(newHead);
    }
}

// --- Запуск гри ---
let game;
initGame();