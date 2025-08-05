const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let score = 0;

// Створення змійки
let snake = [];
snake[0] = {
    x: 9 * box,
    y: 10 * box
};

// Створення їжі
let food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
}

// Управління
let d;
document.addEventListener("keydown", direction);

function direction(event) {
    if (event.keyCode == 37 && d != "RIGHT") {
        d = "LEFT";
    } else if (event.keyCode == 38 && d != "DOWN") {
        d = "UP";
    } else if (event.keyCode == 39 && d != "LEFT") {
        d = "RIGHT";
    } else if (event.keyCode == 40 && d != "UP") {
        d = "DOWN";
    }
}

// Перевірка зіткнення зі своїм тілом
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// Головна функція гри (малювання)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "lime";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Початкова позиція голови
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Рух
    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // Якщо змійка з'їла їжу
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        }
    } else {
        // Видалити хвіст
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    }

    // Кінець гри
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        alert("Гра закінчена! Ваш рахунок: " + score);
        document.location.reload();
    }

    snake.unshift(newHead);
}

// Запуск гри
let game = setInterval(draw, 150);
// Обробка екранних кнопок
document.getElementById('up').addEventListener('click', () => { if (d != "DOWN") d = "UP"; });
document.getElementById('down').addEventListener('click', () => { if (d != "UP") d = "DOWN"; });
document.getElementById('left').addEventListener('click', () => { if (d != "RIGHT") d = "LEFT"; });
document.getElementById('right').addEventListener('click', () => { if (d != "LEFT") d = "RIGHT"; });