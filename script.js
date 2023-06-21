document.addEventListener('keydown', function (e) {
    // Prevent zooming on Chrome (Ctrl + "+", Ctrl + "-", Ctrl + "0")
    if ((e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0')) || e.metaKey) {
        e.preventDefault();
    }
});

document.addEventListener('wheel', function (e) {
    // Prevent zooming on Chrome (mouse wheel)
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
    }
});


//GAMEMODE
let gameMode; // Add this variable

// GAME TIME
let countdownTime = 5; // Change the value to the desired countdown time in seconds
let countdownInterval; // Declare the countdownInterval variable
let countdownSeconds; // Add this variable

// Game constants
const canvasSize = 720;
const gridSize = 30;

//COLOR VARIABLES
const colorBox = document.getElementById('color-box');
const colorButtons = document.querySelectorAll('.color');
const colors = ["yellow", "green", "blue"];

// Snake variables
let snake = [{ x: 0, y: 0 }];
let dx = 0;
let dy = 0;
let foodX = getRandomCoordinate();
let foodY = getRandomCoordinate();
let currentScore = 0;
let maxScore = 0;
let isPaused = false;
let gameInterval; // Declare the gameInterval variable

// Snake color variable
let snakeColor = "green";

// Game speed
let gameSpeed = 5; // default speed

// Get the canvas and its 2D context
document.getElementById("menu").style.display = "block"; //show menu
document.getElementById("gameCanvas").style.display = "none"; //hide game canvas
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scorecanvas = document.getElementById("scores");

// Set canvas dimensions
canvas.width = canvasSize;
canvas.height = canvasSize;

// Add event listener to each color button
colorButtons.forEach(function (button, index) {
    button.style.backgroundColor = colors[index]; // Set the background color of each button
    button.addEventListener('click', function () {
        // Update snake color
        snakeColor = colors[index];
    });
});

// Handle keyboard events
document.addEventListener("keydown", changeDirection);

// Update game speed when the range slider value changes
const speedSlider = document.getElementById("speed-slider");
speedSlider.addEventListener("input", function () {
    gameSpeed = parseInt(speedSlider.value);
});

// Pause button
const pauseButton = document.getElementById("pause-button");
pauseButton.addEventListener("click", togglePause);

// Function to handle color button click
function handleColorButtonClick(event) {
    let color = event.target.style.backgroundColor;
    colorBox.style.backgroundColor = color;
    snakeColor = color;
}

// Start the game
function init() {


    document.addEventListener("keydown", function (event) {
        if (event.key === "p" || event.key === "P" || event.key === "Escape") {
            togglePause();
        }
    });

    var song = document.getElementById("song");
    song.currentTime = 0; // Reset the audio to the beginning
    song.play();

    document.getElementById("game-mode").style.display = "none"; //hide game mode menu
    document.getElementById("pause-menu").style.display = "none"; //hide pause menu
    document.getElementById("gameCanvas").style.display = "block"; //show game
    document.getElementById("score").style.display = "block"; //show score   

    // countdownSeconds = countdownTime; // Add this line

    if (gameOver()) {
        updateMaxScore();
        resetGame();
    }

    isPaused = false;
    resetGame();
    if (gameMode === "classic") {
        startGame();
    } else if (gameMode === "time-limited") {
        startGameWithTimeLimit();
    }
}

function updateScore() {
    const currentScoreElement = document.getElementById("current-score");
    const maxScoreElement = document.getElementById("max-score");
    const countdownElement = document.getElementById("countdown"); // Add this line

    currentScoreElement.textContent = currentScore;
    maxScoreElement.textContent = maxScore;
    countdownElement.textContent = countdownTime; // Display the countdown time
}

//function to start game with time orig
// function startGame() {
//     if (!isPaused) {
//         startCountdown();
//         gameInterval = setInterval(function () {
//             clearCanvas();
//             moveSnake();
//             drawSnake();
//             drawFood();
//             updateScore();

//             if (gameOver()) {
//                 updateMaxScore();
//                 resetGame();
//             }
//         }, 1000 / gameSpeed);
//     }
// }

function startGame() {

    if (!isPaused) {
        gameInterval = setInterval(function () {
            clearCanvas();
            moveSnake();
            drawSnake();
            drawFood();
            updateScore();

            if (gameOver()) {
                updateMaxScore();
                resetGame();
            }
        }, 1000 / gameSpeed);
    }
}

function startGameWithTimeLimit() {
    countdownSeconds = countdownTime;
    startCountdown();
    gameInterval = setInterval(function () {
        clearCanvas();
        moveSnake();
        drawSnake();
        drawFood();
        updateScore();

        if (gameOver()) {
            updateMaxScore();
            resetGame();
        }
    }, 1000 / gameSpeed);
}


// Function to start the countdown timer
function startCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(function () {
        countdownSeconds--;
        updateTimerDisplay();

        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            countdownSeconds = 0;
            gameOver(); // Add this line
        }
    }, 1000);
}

// Function to update the countdown timer display
function updateTimerDisplay() {
    const countdownElement = document.getElementById("countdown");
    countdownElement.textContent = countdownSeconds;
}


function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        // // Show pause menu
        document.getElementById("pause-menu").style.display = "block";
        document.getElementById("score").style.display = "none";
        document.getElementById("gameCanvas").style.display = "none";
        clearInterval(gameInterval);
        clearInterval(countdownInterval);
    } else {
        // Hide pause menu
        document.getElementById("gameCanvas").style.display = "block";
        document.getElementById("pause-menu").style.display = "none";
        document.getElementById("score").style.display = "block";

        startGame();
        startCountdown();
    }
}

// Touch event variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Add touch event listeners
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchend", handleTouchEnd, false);

// Touch start event handler
function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

// Touch move event handler
function handleTouchMove(event) {
    event.preventDefault(); // Prevent scrolling while swiping
}

// Touch end event handler
function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    handleSwipeGesture();
}

// Handle swipe gesture
function handleSwipeGesture() {
    const MIN_SWIPE_DISTANCE = 20; // Minimum distance required for a swipe gesture

    const swipeX = touchEndX - touchStartX;
    const swipeY = touchEndY - touchStartY;

    if (Math.abs(swipeX) > Math.abs(swipeY)) {
        // Horizontal swipe
        if (swipeX > MIN_SWIPE_DISTANCE) {
            // Swipe right
            changeDirection({ keyCode: 39 }); // Simulate right arrow key press
        } else if (swipeX < -MIN_SWIPE_DISTANCE) {
            // Swipe left
            changeDirection({ keyCode: 37 }); // Simulate left arrow key press
        }
    } else {
        // Vertical swipe
        if (swipeY > MIN_SWIPE_DISTANCE) {
            // Swipe down
            changeDirection({ keyCode: 40 }); // Simulate down arrow key press
        } else if (swipeY < -MIN_SWIPE_DISTANCE) {
            // Swipe up
            changeDirection({ keyCode: 38 }); // Simulate up arrow key press
        }
    }
}



function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingLeft = dx === -gridSize;
    const goingRight = dx === gridSize;
    

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -gridSize;
        dy = 0;
    }

    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -gridSize;
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = gridSize;
        dy = 0;
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = gridSize;
    }
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === foodX && head.y === foodY) {
        currentScore++;
        generateFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawSnakePart(snakePart) {
    context.fillStyle = snakeColor; // Use snakeColor for snake part color
    context.strokeStyle = "black";
    context.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);
    context.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

function drawFood() {
    context.fillStyle = "red";
    context.fillRect(foodX, foodY, gridSize, gridSize);
}

function clearCanvas() {
    context.fillStyle = "white";
    context.fillRect(0, 0, canvasSize, canvasSize);
}

function getRandomCoordinate() {
    return Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
}

function updateScore() {
    const currentScoreElement = document.getElementById("current-score");
    const maxScoreElement = document.getElementById("max-score");

    currentScoreElement.textContent = currentScore;
    maxScoreElement.textContent = maxScore;
}

function generateFood() {
    foodX = getRandomCoordinate();
    foodY = getRandomCoordinate();
    // Play the sound effect
    playBiteSound(); // Play the bite sound effect
    // Check if the food is generated on top of the snake, and if so, regenerate it
    for (let i = 0; i < snake.length; i++) {
        if (foodX === snake[i].x && foodY === snake[i].y) {
            generateFood();
            break;
        }
    }
}

function gameOver() {
    const head = snake[0];
    if (
        head.x < 0 ||
        head.x >= canvasSize ||
        head.y < 0 ||
        head.y >= canvasSize ||
        collision() ||
        countdownSeconds == 0
    ) {
        alert("Game Over!"); // temporary
        updateMaxScore();
        resetGame();
        return true;
    }
    return false;
}

function collision() {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            alert("Game Over!");
            return true;
        }
    }
    return false;
}

function updateMaxScore() {
    if (currentScore > maxScore) {
        maxScore = currentScore;
    }
}

function resetGame() {
    if (gameMode === "time-limited") {
        clearInterval(countdownInterval);
        countdownSeconds = countdownTime; // Reset countdownSeconds
        updateTimerDisplay();

        snake = [{ x: 0, y: 0 }];
        dx = 0;
        dy = 0;
        currentScore = 0;
        gameSpeed = parseInt(speedSlider.value);
        generateFood();
        startCountdown();
    } else {
        countdownSeconds = Infinity;
        updateTimerDisplay();
        snake = [{ x: 0, y: 0 }];
        dx = 0;
        dy = 0;
        currentScore = 0;
        gameSpeed = parseInt(speedSlider.value);
        generateFood();
    }
}

function rangeSlide(value) {
    document.getElementById('rangeValue').innerHTML = value;
}

function gameOPTION() {
    document.getElementById("option").style.display = "block"; //shows option menu
    document.getElementById("menu").style.display = "none"; //hide menu
}

function back() {
    document.getElementById("option").style.display = "none"; //hide option menu
    document.getElementById("menu").style.display = "block"; //show menu
}

function modes() {
    document.getElementById("menu").style.display = "none"; //hide menu
    document.getElementById("game-mode").style.display = "block"; //show game mode menu
}

function showmenu() {
    document.getElementById("pause-menu").style.display = "none"; //hide ingame menu
    document.getElementById("menu").style.display = "block "; //show menu
}

function menuingame() {
    // show options or exit to menu
    document.getElementById("pause-menu").style.display = "block"; //show option / exit
    document.getElementById("score").style.display = "none"; //hide game
    document.getElementById("gameCanvas").style.display = "none"; //hide score
}

function selectGameMode(mode) {
    gameMode = mode;
    init();
}

function playBiteSound() {
    var biteSound = document.getElementById("bite-sound");
    biteSound.currentTime = 0; // Reset the audio to the beginning
    biteSound.play();
}  