export class WorldMapTurnEngine {
    /**
     * @param {Phaser.Scene} scene
     * @param {LeaderEngine} leaderEngine
     */
    constructor(scene, leaderEngine) {
        this.scene = scene;
        this.leader = leaderEngine;
        this.isPlayerTurn = true;

        this.setupKeyboardControls();
    }

    /**
     * 키보드 방향키 입력을 설정합니다.
     */
    setupKeyboardControls() {
        this.scene.input.keyboard.on('keydown-UP', () => this.handleMove('up'));
        this.scene.input.keyboard.on('keydown-DOWN', () => this.handleMove('down'));
        this.scene.input.keyboard.on('keydown-LEFT', () => this.handleMove('left'));
        this.scene.input.keyboard.on('keydown-RIGHT', () => this.handleMove('right'));
    }

    /**
     * 이동을 처리하고 턴을 넘깁니다.
     * @param {'up' | 'down' | 'left' | 'right'} direction
     */
    handleMove(direction) {
        if (!this.isPlayerTurn) return;

        this.isPlayerTurn = false;
        this.leader.move(direction);

        this.scene.events.emit('turnTaken');

        this.scene.time.delayedCall(200, () => {
            this.isPlayerTurn = true;
        });
    }
}

