import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';

class AttackTargetNode extends Node {
    constructor({ combatCalculationEngine, vfxManager, animationEngine, delayEngine, terminationManager }) {
        super();
        this.combatEngine = combatCalculationEngine;
        this.vfxManager = vfxManager;
        this.animationEngine = animationEngine;
        this.delayEngine = delayEngine;
        this.terminationManager = terminationManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);
        const target = blackboard.get('currentTargetUnit');
        if (!target) {
            debugAIManager.logNodeResult(NodeState.FAILURE);
            return NodeState.FAILURE;
        }

        // 공격 애니메이션
        await this.animationEngine.attack(unit.sprite, target.sprite);

        // 데미지 계산 및 적용
        const damage = this.combatEngine.calculateDamage(unit, target);
        target.currentHp -= damage;

        // 시각 효과
        this.vfxManager.updateHealthBar(target.healthBar, target.currentHp, target.finalStats.hp);
        this.vfxManager.createBloodSplatter(target.sprite.x, target.sprite.y);

        // 딜레이
        await this.delayEngine.hold(200);

        // 사망 처리
        if (target.currentHp <= 0) {
            this.terminationManager.handleUnitDeath(target);
            blackboard.set('currentTargetUnit', null); // 타겟이 죽었으므로 초기화
        }

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }
}
export default AttackTargetNode;
