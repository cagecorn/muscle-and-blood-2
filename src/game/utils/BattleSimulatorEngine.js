import { formationEngine } from './FormationEngine.js';
import { createNameLabelCanvas } from './NameLabelFactory.js';
import { debugCoordinateManager } from '../debug/DebugCoordinateManager.js';

/**
 * 전투의 전체 과정을 시뮬레이션하고 관리하는 엔진입니다.
 * 이 엔진은 특정 씬에 종속되지 않으며, 어떤 씬에서든 전투를 시작할 수 있습니다.
 */
export class BattleSimulatorEngine {
    /**
     * @param {Phaser.Scene} scene - 전투가 벌어질 Phaser 씬
     * @param {DOMEngine} domEngine - 이름표 등 DOM 요소를 관리할 DOM 엔진
     */
    constructor(scene, domEngine) {
        this.scene = scene;
        this.domEngine = domEngine;
        this.allySprites = [];
        this.enemySprites = [];
    }

    /**
     * 지정된 아군 및 적군 유닛으로 전투를 시작합니다.
     * @param {Array<object>} allies - 아군 유닛 데이터 배열
     * @param {Array<object>} enemies - 적군 유닛 데이터 배열
     */
    start(allies, enemies) {
        // 1. 아군을 진형에 맞춰 배치합니다.
        this.allySprites = formationEngine.applyFormation(this.scene, allies);

        // 2. 적군을 무작위 위치에 배치합니다.
        this.enemySprites = formationEngine.placeMonsters(this.scene, enemies, 8); // 8번 열부터 적군 지역

        // 3. 모든 유닛에 대해 이름표를 생성하고 디버그 로그를 기록합니다.
        this._createNameLabels(this.allySprites, allies, 'rgba(0,0,255,0.7)');
        this._createNameLabels(this.enemySprites, enemies, 'rgba(255,0,0,0.7)');
    }

    /**
     * 유닛 스프라이트에 이름표를 생성하고 부착합니다.
     * @private
     * @param {Array<Phaser.GameObjects.Image>} sprites - 대상 스프라이트 배열
     * @param {Array<object>} units - 유닛 데이터 배열
     * @param {string} color - 이름표 배경색
     */
    _createNameLabels(sprites, units, color) {
        sprites.forEach((sprite, idx) => {
            const unit = units[idx];
            if (!unit) return;

            const label = createNameLabelCanvas(unit.instanceName || unit.name, color);

            const labelWidth = parseFloat(label.style.width) || 0;
            const labelHeight = parseFloat(label.style.height) || 0;
            label.style.marginLeft = `-${labelWidth / 2}px`;
            label.style.marginTop = `${sprite.displayHeight / 2 - labelHeight}px`;

            const syncedElement = this.domEngine.syncElement(sprite, label);

            // 디버그 좌표 기록
            const imageCoord = { x: sprite.x, y: sprite.y };
            const labelRect = syncedElement.getBoundingClientRect();
            const gameRect = this.scene.sys.game.canvas.getBoundingClientRect();
            const labelCoord = {
                x: labelRect.left - gameRect.left,
                y: labelRect.top - gameRect.top,
            };
            debugCoordinateManager.logCoordinates(unit.instanceName || unit.name, imageCoord, labelCoord);
        });
    }

    /**
     * 전투와 관련된 모든 리소스를 정리합니다.
     */
    shutdown() {
        // 나중에 전투 관련 객체들이 추가되면 여기서 정리합니다.
        console.log('BattleSimulatorEngine이 종료되었습니다.');
    }
}
