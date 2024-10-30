
let isPumping = false;
let balloonFlying = false;
let balloonIndex = 0;
let letterIndex = 0;
const balloons = [];
const letters = [];

const balloonImages = Array.from({ length: 10 }, (_, i) => `balloon${i + 1}`);
const letterImages = Array.from({ length: 26 }, (_, i) => `letter${i + 1}`);

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.image('background', 'assets/images/background.png');
        this.load.image('startButton', 'assets/images/start.png'); // Ensure start button image exists
    }

    create() {
        this.add.image(767.5, 345, 'background').setDisplaySize(1535, 690);
        const startButton = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'startButton').setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', 'assets/images/background.png');
        this.load.image('hedal', 'assets/images/hedal.png');
        this.load.image('paip', 'assets/images/paip.png');
        this.load.image('machine', 'assets/images/machine.png');
        this.load.image('thread', 'assets/images/dura.png');
        
        balloonImages.forEach((image, index) => this.load.image(image, `assets/images/color-${index + 1}.png`));
        letterImages.forEach((image, index) => this.load.image(image, `assets/images/${String.fromCharCode(65 + index)}.png`));
    }

    create() {
        this.add.image(767.5, 345, 'background').setDisplaySize(1535, 690);

        const paip = this.add.sprite(1255, 580, 'paip').setScale(0.5);
        paip.depth = 1.6;

        const pumpButton = this.add.sprite(1400, 450, 'hedal').setScale(0.5).setInteractive();
        pumpButton.depth = 1.8;

        const machine = this.add.sprite(1400, 600, 'machine').setScale(0.5);
        machine.depth = 2;

        pumpButton.on('pointerdown', () => {
            if (!isPumping) {
                isPumping = true;
                this.tweens.add({
                    targets: pumpButton,
                    y: pumpButton.y + 40,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1',
                    onComplete: () => { isPumping = false; }
                });
                this.tweens.add({
                    targets: machine,
                    scaleX: 0.53,
                    scaleY: 0.52,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1'
                });
                this.tweens.add({
                    targets: paip,
                    y: paip.y + 5,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1'
                });
            }
        });

        this.createBalloon();
    }

    update() {
        if (isPumping && letters.length > 0 && !balloonFlying) {
            const currentBalloonObj = balloons[balloons.length - 1];
            const currentBalloon = currentBalloonObj.balloon;
            const currentThread = currentBalloonObj.thread;
            const currentLetter = letters[letters.length - 1];

            if (currentBalloon.scaleX < 0.3) {
                currentBalloon.setScale(currentBalloon.scaleX + 0.0030);
                currentLetter.setScale(currentLetter.scaleX + 0.0015);
                currentBalloon.setPosition(currentBalloon.x, currentBalloon.y - 0.5);
                currentLetter.setPosition(currentBalloon.x, currentBalloon.y);
                currentThread.setPosition(currentBalloon.x, currentBalloon.y + 30);
            } else if (currentBalloon.scaleX >= 0.2 && !balloonFlying) {
                this.startFlying(currentBalloonObj, currentLetter);
                balloonFlying = true;
                this.createBalloon();
            }
        }

        balloons.forEach((balloonObj, index) => {
            const balloon = balloonObj.balloon;
            const thread = balloonObj.thread;
            const letter = letters[index];

            if (letter && balloon) {
                letter.setPosition(balloon.x, balloon.y);
                thread.setPosition(balloon.x, balloon.y + 90);
            }
        });
    }

    createBalloon() {
        const currentBalloonImage = balloonImages[balloonIndex];
        const currentLetterImage = letterImages[letterIndex];
        balloonIndex = (balloonIndex + 1) % balloonImages.length;
        letterIndex = (letterIndex + 1) % letterImages.length;

        const newThread = this.add.sprite(1255, 580, 'thread').setScale(0.3);
        newThread.depth = 1;
        newThread.visible = false;

        const newBalloon = this.physics.add.sprite(1192, 505, currentBalloonImage).setScale(0);
        newBalloon.setInteractive();
        newBalloon.depth = 1;

        const newLetter = this.physics.add.sprite(1255, 580, currentLetterImage).setScale(0);
        newLetter.depth = 1;

        balloons.push({ balloon: newBalloon, thread: newThread });
        letters.push(newLetter);
        balloonFlying = false;
    }

    startFlying(balloonObj, letter) {
        const balloon = balloonObj.balloon;
        const thread = balloonObj.thread;

        thread.visible = true;

        balloon.body.setVelocityY(-20);
        letter.body.setVelocityY(-20);
        balloon.body.setVelocityX(Phaser.Math.Between(-100, 100));
        letter.body.setVelocityX(balloon.body.velocity.x);

        this.tweens.add({
            targets: balloon.body.velocity,
            x: { from: balloon.body.velocity.x, to: balloon.body.velocity.x + Phaser.Math.Between(-20, 20) },
            duration: 1000,
            yoyo: true,
            ease: 'Sine.easeInOut',
            repeat: -1
        });

        this.tweens.add({
            targets: letter.body.velocity,
            x: { from: letter.body.velocity.x, to: letter.body.velocity.x + Phaser.Math.Between(-20, 20) },
            duration: 2000,
            yoyo: true,
            ease: 'Sine.easeInOut',
            repeat: -1
        });

        balloon.on('pointerdown', () => {
            this.burstBalloon(balloonObj, letter);
        });
    }

    burstBalloon(balloonObj, letter) {
        balloonObj.balloon.destroy();
        balloonObj.thread.destroy();
        letter.destroy();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1535,
    height: 690,
    scene: [MainMenuScene, GameScene],
    title: "Make a Balloon And burst On Tapr",
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

const game = new Phaser.Game(config);
