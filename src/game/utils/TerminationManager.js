import { debugLogEngine } from './DebugLogEngine.js';
import { formationEngine } from './FormationEngine.js';

/**
 * 유닛 사망 등 특정 로직의 '종료'와 관련된 후처리를 담당하는 매니저
 */
class TerminationManager {
    constructor(scene, summoningEngine, battleSimulator) {
        this.scene = scene;
        this.summoningEngine = summoningEngine;
        this.battleSimulator = battleSimulator;
        debugLogEngine.log('TerminationManager', '종료 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛의 사망 처리를 수행합니다.
     * @param {object} deadUnit - 사망한 유닛
     */
    handleUnitDeath(deadUnit) {
        if (!deadUnit || !deadUnit.sprite || !deadUnit.sprite.active) return; // 이미 처리 중이면 중복 실행 방지

        debugLogEngine.log('TerminationManager', `${deadUnit.instanceName}의 사망 처리를 시작합니다.`);

        // 1. 논리적 데이터 처리 (즉시 실행)
        // 그리드에서 유닛을 제거하여 길막 현상을 방지합니다.
        const cell = formationEngine.grid.getCell(deadUnit.gridX, deadUnit.gridY);
        if (cell) {
            cell.isOccupied = false;
            cell.sprite = null;
            debugLogEngine.log('TerminationManager', `그리드 (${deadUnit.gridX}, ${deadUnit.gridY})의 점유 상태를 해제했습니다.`);
        }

        // 소환사가 사망한 경우 해당 소환수들도 정리합니다.
        const summons = this.summoningEngine.getSummons(deadUnit.uniqueId);
        if (summons && summons.size > 0) {
            debugLogEngine.log('TerminationManager', `${deadUnit.instanceName}의 소환수들을 함께 제거합니다.`);
            summons.forEach(id => {
                const summon = this.battleSimulator.turnQueue.find(u => u.uniqueId === id);
                if (summon && summon.currentHp > 0) {
                    this.handleUnitDeath(summon);
                }
            });
        }
        
        // 2. 시각적 처리 (애니메이션)
        // 유닛 스프라이트를 서서히 투명하게 만들어 사라지게 합니다.
        this.scene.tweens.add({
            targets: deadUnit.sprite,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // 3. 최종 비활성화 처리
                // 트윈이 끝난 후 스프라이트를 비활성화하여 UI(체력바, 이름표)가 완전히 사라지게 합니다.
                // BindingManager가 이 상태를 감지하고 종속된 요소들을 숨깁니다.
                deadUnit.sprite.setActive(false);
                deadUnit.sprite.setVisible(false); // 만약을 위해 보이지 않게 처리
                debugLogEngine.log('TerminationManager', `${deadUnit.instanceName}의 모든 객체가 비활성화되었습니다.`);
            }
        });
    }
}

// 이 엔진은 Scene에 종속적이므로, new 키워드를 통해 생성하여 사용합니다.
export { TerminationManager };
