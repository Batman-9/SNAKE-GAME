document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const resetButton = document.getElementById('reset-btn');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Game variables
    const boxSize = 20;
    let snake = [];
    let direction = 'RIGHT';
    let food = {};
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150;
    let game;
    let isGameOver = false;
    
    // Initialize game
    function initGame() {
        snake = [
            {x: 9 * boxSize, y: 10 * boxSize},
            {x: 8 * boxSize, y: 10 * boxSize},
            {x: 7 * boxSize, y: 10 * boxSize}
        ];
        direction = 'RIGHT';
        score = 0;
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        generateFood();
        isGameOver = false;
        
        if (game) clearInterval(game);
        game = setInterval(draw, gameSpeed);
    }
    
    // Draw game elements
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            if (index === 0) {
                // Head - different color
                ctx.fillStyle = '#0fccce';
            } else {
                // Body - gradient color based on position
                const hue = (index * 10) % 360;
                ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            }
            ctx.fillRect(segment.x, segment.y, boxSize - 1, boxSize - 1);
            
            // Add eyes to the head
            if (index === 0) {
                ctx.fillStyle = 'white';
                // Eyes position based on direction
                if (direction === 'RIGHT' || direction === 'LEFT') {
                    ctx.fillRect(segment.x + (direction === 'RIGHT' ? boxSize - 6 : 2), segment.y + 3, 3, 3);
                    ctx.fillRect(segment.x + (direction === 'RIGHT' ? boxSize - 6 : 2), segment.y + boxSize - 6, 3, 3);
                } else {
                    ctx.fillRect(segment.x + 3, segment.y + (direction === 'DOWN' ? boxSize - 6 : 2), 3, 3);
                    ctx.fillRect(segment.x + boxSize - 6, segment.y + (direction === 'DOWN' ? boxSize - 6 : 2), 3, 3);
                }
            }
        });
        
        // Draw food
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        const centerX = food.x + boxSize / 2;
        const centerY = food.y + boxSize / 2;
        ctx.arc(centerX, centerY, boxSize / 2 - 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw sparkle on food
        ctx.fillStyle = 'white';
        ctx.fillRect(food.x + boxSize / 4, food.y + boxSize / 4, 2, 2);
        ctx.fillRect(food.x + boxSize / 1.5, food.y + boxSize / 3, 3, 3);
        
        // Move snake
        let head = {x: snake[0].x, y: snake[0].y};
        
        switch(direction) {
            case 'UP':
                head.y -= boxSize;
                break;
            case 'DOWN':
                head.y += boxSize;
                break;
            case 'LEFT':
                head.x -= boxSize;
                break;
            case 'RIGHT':
                head.x += boxSize;
                break;
        }
        
        // Check collision with walls or self
        if (
            head.x < 0 || 
            head.y < 0 || 
            head.x >= canvas.width || 
            head.y >= canvas.height ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameOver();
            return;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Increase speed slightly as score goes up
            if (score % 50 === 0 && gameSpeed > 50) {
                gameSpeed -= 5;
                clearInterval(game);
                game = setInterval(draw, gameSpeed);
            }
            
            generateFood();
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }
    }
    
    // Generate food at random position
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
            y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
        };
        
        // Make sure food doesn't appear on snake
        while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            food = {
                x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
                y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
            };
        }
    }
    
    // Game over function
    function gameOver() {
        clearInterval(game);
        isGameOver = true;
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#e94560';
        ctx.font = '30px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#0fccce';
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.fillStyle = '#f9f9f9';
        ctx.font = '12px "Press Start 2P", cursive';
        ctx.fillText('Press Reset to Play Again', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (isGameOver) return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (direction !== 'DOWN') direction = 'UP';
                break;
            case 'ArrowDown':
                if (direction !== 'UP') direction = 'DOWN';
                break;
            case 'ArrowLeft':
                if (direction !== 'RIGHT') direction = 'LEFT';
                break;
            case 'ArrowRight':
                if (direction !== 'LEFT') direction = 'RIGHT';
                break;
        }
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    canvas.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY || isGameOver) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && direction !== 'LEFT') direction = 'RIGHT';
            else if (dx < 0 && direction !== 'RIGHT') direction = 'LEFT';
        } else {
            if (dy > 0 && direction !== 'UP') direction = 'DOWN';
            else if (dy < 0 && direction !== 'DOWN') direction = 'UP';
        }
        
        touchStartX = 0;
        touchStartY = 0;
        e.preventDefault();
    }, false);
    
    // Reset button
    resetButton.addEventListener('click', initGame);
    
    // Start the game
    initGame();
});