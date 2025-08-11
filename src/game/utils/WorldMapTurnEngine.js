import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';

/**
 * 월드맵에서 키보드 입력을 처리하는 간단한 턴 엔진
 */
export class WorldMapTurnEngine {
    constructor(scene, leaderEngine) {
        this.scene = scene;
        this.leaderEngine = leaderEngine;

        scene.input.keyboard.on('keydown-UP', () => this.leaderEngine.move(0, -1));
        scene.input.keyboard.on('keydown-DOWN', () => this.leaderEngine.move(0, 1));
        scene.input.keyboard.on('keydown-LEFT', () => this.leaderEngine.move(-1, 0));
        scene.input.keyboard.on('keydown-RIGHT', () => this.leaderEngine.move(1, 0));
    }
}
