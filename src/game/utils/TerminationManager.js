import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 유닛 사망 등 특정 로직의 '종료'와 관련된 후처리를 담당하는 매니저
 */
class TerminationManager {
    constructor(scene) {
        this.scene = scene;
        debugLogEngine.log('TerminationManager', '종료 매니저가 초기화되었습니다.');
    }

    /**
     * 유닛의 사망 처리를 수행합니다.
     * @param {object} deadUnit - 사망한 유닛
     */
    handleUnitDeath(deadUnit) {
        if (!deadUnit || !deadUnit.sprite) return;

        debugLogEngine.log('TerminationManager', `${deadUnit.instanceName}의 사망 처리를 시작합니다.`);
        
        // 유닛 스프라이트를 서서히 투명하게 만들어 사라지게 합니다.
        this.scene.tweens.add({
            targets: deadUnit.sprite,
            alpha: 0,
            duration: 1000,
            ease: 'Power2'
        });

        // 바인딩된 다른 요소들(체력바, 그림자 등)도 함께 사라지게 합니다.
        // (BindingManager에서 active가 false인 주 오브젝트의 요소들을 숨기도록 수정 필요)
    }
}

// 이 엔진은 Scene에 종속적이므로, new 키워드를 통해 생성하여 사용합니다.
export { TerminationManager };
