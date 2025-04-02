import { Application, Assets, AnimatedSprite, TilingSprite, Sprite, Text } from "../node_modules/pixi.js/dist/pixi.mjs";

(async () => {
    const app = new Application();
    await app.init({
        resizeTo: window,
        backgroundColor: 0xffffff,
        useContextAlpha: false,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
    });
    document.body.appendChild(app.canvas);
    globalThis.__PIXI_APP__ = app;

    try {
        // Define assets to preload
        const assets = {
            bgTexture: 'forest1.jpg',
            dinoTexture: 'dino.json',
            rockTexture: 'rocks.png',
            restart: 'restart.png',
        };

        // Preload assets
        console.log("Loading assets...");
        const [bgTexture, dinoTexture, rockTexture, restart] = await Promise.all([
            Assets.load(assets.bgTexture),
            Assets.load(assets.dinoTexture),
            Assets.load(assets.rockTexture),
            Assets.load(assets.restart),
        ]);
        console.log("Assets loaded!");


        // Load sound effects
        const backgroundMusic = new Howl({
            src: ['backgroundSound.mp3'], //background music 
            loop: true,
            volume: 0.3,
        });

        const runSound = new Howl({
            src: ['run.mp3'], // run sound effect 
            loop: true,
            volume: 0.5,
        });

        const jumpSound = new Howl({
            src: ['jump.mp3'], // jump sound effect
            volume: 0.7,
        });


        const gameOverSound = new Howl({
            src: ['gameOver.mp3'], //game over sound effect 
            volume: 0.8,
        });

        // Play background music
        backgroundMusic.play();
        runSound.play();

        // Variables
        let isDinoJumping = false;
        let jumpSpeed = 0;
        let gameSpeed = 6;
        const gravity = 1.5;
        const jumpStrength = -31;



        // Background setup
        let background = new TilingSprite(bgTexture);
        background.x = 0;
        background.y = 0;
        background.height = 1280;
        background.width = 1920;
        background.tileScale.set(1.95, 1.95);
        app.stage.addChild(background);

        function animateBackground() {
            background.tilePosition.x -= gameSpeed; // Adjust the speed of the background scroll



            requestAnimationFrame(animateBackground);
        }
        animateBackground();


        // Rock setup
        const obstacles = [];
        setInterval(() => {
            const rock = new Sprite(rockTexture);
            rock.x = app.screen.width;
            rock.y = 750;
            rock.width = 150;
            rock.height = 150;
            rock.anchor.set(0.4);
            app.stage.addChild(rock);
            obstacles.push(rock);
            console.log("rock count", obstacles.push(rock));
        }, 2000);


        // Dino setup
        const dinoJump = new AnimatedSprite(dinoTexture.animations.Jump);
        dinoJump.scale.set(0.5);
        dinoJump.x = 50;
        dinoJump.y = app.screen.height - 350;
        dinoJump.animationSpeed = 0.4;



        const dinoRun = new AnimatedSprite(dinoTexture.animations.Run);
        dinoRun.scale.set(0.5);
        dinoRun.x = 50;
        dinoRun.y = app.screen.height - 350; // Position the dino on the ground
        dinoRun.animationSpeed = 0.4;
        dinoRun.play();
        app.stage.addChild(dinoRun);



        // Handle jump
        window.addEventListener('keydown', (e) => {
            if ((e.key === 'ArrowUp' || e.key === ' ') && !isDinoJumping) {
                isDinoJumping = true;
                jumpSpeed = jumpStrength;
                jumpSound.play(); //play

                runSound.stop(); // it will be stop while jump
                // Switch to the jump sprite
                app.stage.removeChild(dinoRun);
                app.stage.addChild(dinoJump);
                dinoJump.play();

            }
        });


        let score = 0;
        let highScore = 0;
        let restartButton;

        // Display the score on the screen
        let scoreText = new Text(`Score: ${score}`, {
            fontFamily: 'Arial',
            fontSize: 36,
            fill: 0x000000,
        });
        scoreText.x = 20;
        scoreText.y = 20;
        app.stage.addChild(scoreText);




        // Function to create the restart button
        function createRestartButton() {
            if (restartButton) {
                return;
            }

            if (score > highScore) {
                highScore = score;

            }

            let gameOverText = new Text(`Game Over`, {
                fontFamily: 'Arial',
                fontSize: 50,
                fill: 0x000000, // black color
                align: 'center',

            });

            gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
            gameOverText.y = app.screen.height / 2 - gameOverText.height / 2 - app.screen.height * 0.3;

            app.stage.addChild(gameOverText);


            let scoreTextDisplay = new Text(`Score: ${score}`, {
                fontFamily: 'Arial',
                fontSize: 30,
                fill: 0x0000ff, // Blue color
                align: 'center',
            });

            scoreTextDisplay.x = app.screen.width / 2 - scoreTextDisplay.width / 2;
            scoreTextDisplay.y = gameOverText.y + 70;
            app.stage.addChild(scoreTextDisplay);

            const highScoreText = new Text(`High Score: ${highScore}`, {
                fontFamily: 'Arial',
                fontSize: 30,
                fill: 0x900C3F, // Green color
                align: 'center',
            });

            highScoreText.x = app.screen.width / 2 - highScoreText.width / 2;
            highScoreText.y = scoreTextDisplay.y + 60;
            app.stage.addChild(highScoreText);



            // Create the restart button using the PNG
            restartButton = new Sprite(restart);
            restartButton.anchor.set(0.1); // Center the button
            restartButton.scale.set(0.1); // Center the button
            restartButton.x = app.screen.width / 2; // Position in the center of the screen
            restartButton.y = highScoreText.y + highScoreText.height + 20; // Slightly below the center




            // Add interactivity to the button
            restartButton.interactive = true;
            restartButton.buttonMode = true;
            restartButton.cursor = 'pointer'

            // Add click event listener
            restartButton.on('pointerdown', () => {
                app.stage.removeChild(gameOverText, scoreTextDisplay, highScoreText, restartButton); // Remove the button from the stage
                restartButton = null; // the reference button will be reset here.
                restartGame(); // Restart the game
            });
            app.stage.addChild(restartButton);

        }


        // // Function to restart the game
        function restartGame() {
            // Reset variables
            score = 0;
            gameSpeed = 6;
            isDinoJumping = false;
            jumpSpeed = 0;

            // Clear all obstacles
            obstacles.forEach((rock) => app.stage.removeChild(rock));
            obstacles.length = 0;

            // Reset dino position to its initial position
            const initialDinoY = app.screen.height - 350; // Initial position of the dino
            dinoRun.y = initialDinoY;
            dinoJump.y = initialDinoY;

            // Reset score display
            scoreText.text = `Score: ${score}`;

            // Restart background music
            if (!backgroundMusic.playing()) {

                backgroundMusic.play();
            }

            // Restart the game loop
            app.ticker.start();
        }


        const scoreArray = [];
        // Function to update the score based on game speed
        function updateScore() {
            scoreArray.push(gameSpeed); // Store the current game speed in the array
            score++; // Increment the score
            scoreText.text = `Score: ${score}`; // Update the score display

            // Gradually increase the speed of the game
            if (score % 10 === 0) { // Increase speed every 20 points
                gameSpeed += 0.01; // Increment the speed
                // console.log('Velocity increased by', gameSpeed);
            }
        }


        setInterval(() => {

            updateScore();

        }, 100)

        // Game loop
        app.ticker.add((delta) => {
            // Dino jump logic
            if (isDinoJumping) {
                jumpSpeed += gravity; // Apply gravity
                dinoJump.y += jumpSpeed; // Update dino's position

                // Check if the dino has landed
                if (dinoJump.y >= app.screen.height - 350) {
                    dinoJump.y = app.screen.height - 350; // Reset position
                    isDinoJumping = false; // Dino has landed
                    jumpSpeed = 0;

                    // Switch back to the run sprite
                    app.stage.removeChild(dinoJump);
                    app.stage.addChild(dinoRun);
                    dinoRun.play();

                    runSound.play(); //it will resume after landing
                }
            }

            // Move rocks and check for collisions
            obstacles.forEach((rock, index) => {
                rock.x -= gameSpeed; // Move the rock to the left

                // Remove rocks that go off-screen
                if (rock.x + rock.width < 0) {
                    app.stage.removeChild(rock);
                    obstacles.splice(index, 1);



                }

                // Check for collision
                if (collisionDetection(dinoJump, rock) || collisionDetection(dinoRun, rock)) {
                    console.log('Collision detected!');
                    app.ticker.stop(); // Stop the game

                    //Stop all sounds here and play game over sound.
                    backgroundMusic.stop();
                    runSound.stop();
                    gameOverSound.play();
                    createRestartButton();
                }
            });
        });

        // Collision detection function
        function collisionDetection(obj1, obj2) {
            const bound1 = obj1.getBounds();
            const bound2 = obj2.getBounds();



            if (isDinoJumping || bound1.y + bound1.height / 2 < bound2.y ||
                bound1.y > bound2.y + bound2.height / 2) {
                return false; // Dino is above the rock, no collision
            }
            // Check if the dino is horizontally aligned with the rock
            if (
                bound1.x + bound1.width / 2.5 < bound2.x || // Dino is to the left of the rock
                bound1.x > bound2.x + bound2.width / 2.5    // Dino is to the right of the rock
            ) {
                return false; // Dino is not horizontally overlapping with the rock
            }


            // If both vertical and horizontal checks pass, it's a collision
            return true;

        }
    } catch (e) {
        console.error("Error:", e.message);
    }

    // app.ticker.start();
})();