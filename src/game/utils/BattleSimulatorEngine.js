import { formationEngine } from './FormationEngine.js';
import { OffscreenTextEngine } from './OffscreenTextEngine.js';
// 새로 만든 디버그 매니저를 가져옵니다.
import { debugDisplayLogManager } from '../debug/DebugDisplayLogManager.js';

/**
 * 전투의 전체 과정을 시뮬레이션하고 관리하는 엔진입니다.
 * 이 엔진은 특정 씬에 종속되지 않으며, 어떤 씬에서든 전투를 시작할 수 있습니다.
 */
export class BattleSimulatorEngine {
    /**
     * @param {Phaser.Scene} scene - 전투가 벌어질 Phaser 씬
     */
    constructor(scene) {
        this.scene = scene;
        this.textEngine = new OffscreenTextEngine(scene);
        this.allySprites = [];
        this.enemySprites = [];

        // 씬의 update 루프에 맞춰 텍스트 엔진을 갱신합니다.
        this.scene.events.on('update', this.textEngine.update, this.textEngine);
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

        console.log(`[BattleSimulatorEngine] 유닛 배치 완료. 아군: ${this.allySprites.length}명, 적군: ${this.enemySprites.length}명`);

        // 새 텍스트 엔진을 사용하여 이름표를 표시합니다.
        this._createNameLabels(this.allySprites, allies, '#63b1ff');
        this._createNameLabels(this.enemySprites, enemies, '#ff6363');
    }

    /**
     * 유닛 스프라이트에 이름표를 생성하고 부착합니다.
     * @private
     * @param {Array<Phaser.GameObjects.Image>} sprites - 대상 스프라이트 배열
     * @param {Array<object>} units - 유닛 데이터 배열
     * @param {string} color - 이름표 배경색
     */
    _createNameLabels(sprites, units, color) {
        // [수정된 부분]
        // 스프라이트 배열을 순회하며, 각 스프라이트의 고유 ID를 이용해
        // 올바른 유닛 정보를 찾습니다.
        sprites.forEach(sprite => {
            const unitId = sprite.getData('unitId');
            const unit = units.find(u => u.uniqueId === unitId);

            // 만약 해당 ID의 유닛을 찾지 못하면 아무것도 하지 않고 넘어갑니다.
            if (!unit) {
                console.warn(`[BattleSimulatorEngine] ID: ${unitId}에 해당하는 유닛 데이터를 찾을 수 없습니다.`);
                return;
            }

            // 올바른 유닛 정보로 이름표를 생성합니다.
            const label = this.textEngine.createLabel(sprite, unit.instanceName || unit.name, color);

            // [추가된 부분]
            // 새로 만든 디버그 매니저를 사용하여 콘솔에 좌표를 기록합니다.
            debugDisplayLogManager.logCreationPoint(sprite, label, unit);
        });
    }

    /**
     * 전투와 관련된 모든 리소스를 정리합니다.
     */
    shutdown() {
        this.scene.events.off('update', this.textEngine.update, this.textEngine);
        this.textEngine.shutdown();
        console.log('BattleSimulatorEngine이 종료되었습니다.');
    }
}
