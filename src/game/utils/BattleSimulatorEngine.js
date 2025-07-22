import { formationEngine } from './FormationEngine.js';
import { OffscreenTextEngine } from './OffscreenTextEngine.js';
// 새로 만든 디버그 매니저를 가져옵니다.
import { debugDisplayLogManager } from '../debug/DebugDisplayLogManager.js';
// --- ⬇️ 새로 만든 매니저들을 가져옵니다. ---
import { shadowManager } from './ShadowManager.js';
import { BindingManager } from './BindingManager.js';
// 새로 만든 VFXManager를 가져옵니다.
import { VFXManager } from './VFXManager.js';
// --- ⬆️ 여기까지 ---

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

        // --- ⬇️ 매니저들을 초기화합니다. ---
        this.shadowManager = shadowManager(scene);
        this.bindingManager = new BindingManager(scene);
        this.vfxManager = new VFXManager(scene);
        // --- ⬆️ 여기까지 ---

        // 씬의 update 루프에 맞춰 텍스트 엔진을 갱신합니다.
        this.scene.events.on('update', this.textEngine.update, this.textEngine);
    }

    /**
     * 지정된 아군 및 적군 유닛으로 전투를 시작합니다.
     * @param {Array<object>} allies - 아군 유닛 데이터 배열
     * @param {Array<object>} enemies - 적군 유닛 데이터 배열
     */
    start(allies, enemies) {
        // 1. 아군을 진형에 맞춰 배치하고, 이름표와 그림자를 바인딩합니다.
        this.allySprites = formationEngine.applyFormation(this.scene, allies);
        this._setupUnits(this.allySprites, allies, '#63b1ff');

        // 2. 적군을 무작위 위치에 배치하고, 이름표와 그림자를 바인딩합니다.
        this.enemySprites = formationEngine.placeMonsters(this.scene, enemies, 8);
        this._setupUnits(this.enemySprites, enemies, '#ff6363');

        console.log(`[BattleSimulatorEngine] 유닛 배치 완료. 아군: ${this.allySprites.length}명, 적군: ${this.enemySprites.length}명`);
    }

    /**
     * 유닛 스프라이트에 이름표와 그림자를 생성하고 바인딩합니다.
     * @private
     * @param {Array<Phaser.GameObjects.Image>} sprites 대상 스프라이트 배열
     * @param {Array<object>} units 유닛 데이터 배열
     * @param {string} color 이름표 배경색
     */
    _setupUnits(sprites, units, color) {
        sprites.forEach(sprite => {
            const unitId = sprite.getData('unitId');
            const unit = units.find(u => u.uniqueId === unitId);

            if (!unit) {
                console.warn(`[BattleSimulatorEngine] ID: ${unitId}에 해당하는 유닛 데이터를 찾을 수 없습니다.`);
                return;
            }

            // 1. 이름표 생성 (발밑에 표시됩니다)
            const nameLabel = this.textEngine.createLabel(sprite, unit.instanceName || unit.name, color);

            // 2. 그림자 생성 (더 길고 오른쪽에 위치)
            const shadow = this.shadowManager.createShadow(sprite);

            // 3. 체력바 생성 및 초기화
            const healthBar = this.vfxManager.createHealthBar(sprite);
            const initialHealthPercentage = 1; // 현재는 풀피로 시작
            healthBar.foreground.width = healthBar.background.width * initialHealthPercentage;

            // 4. 모든 요소를 바인딩하여 스프라이트와 함께 움직이도록 합니다
            this.bindingManager.bind(sprite, [
                nameLabel,
                shadow,
                healthBar.background,
                healthBar.foreground
            ]);

            debugDisplayLogManager.logCreationPoint(sprite, nameLabel, unit);
        });
    }

    /**
     * 전투와 관련된 모든 리소스를 정리합니다.
     */
    shutdown() {
        this.scene.events.off('update', this.textEngine.update, this.textEngine);
        this.textEngine.shutdown();

        // --- ⬇️ 새로 추가된 매니저들의 종료 처리를 호출합니다. ---
        if (this.shadowManager) this.shadowManager.shutdown();
        if (this.bindingManager) this.bindingManager.shutdown();
        if (this.vfxManager) this.vfxManager.shutdown();
        // --- ⬆️ 여기까지 ---

        console.log('BattleSimulatorEngine이 종료되었습니다.');
    }
}
