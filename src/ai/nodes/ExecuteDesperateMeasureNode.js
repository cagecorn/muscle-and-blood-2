import Node, { NodeState } from './Node.js';
import { crisisEngine } from '../../game/utils/CrisisEngine.js';
import { skillEngine } from '../../game/utils/SkillEngine.js';
import { pathfinderEngine } from '../../game/utils/PathfinderEngine.js';

/**
 * 행동 트리의 다른 모든 노드가 실패했을 때 최후의 수단을 실행하는 노드.
 * CrisisEngine을 호출하여 현재 상황에 가장 적합한 행동을 받아와 실행합니다.
 */
class ExecuteDesperateMeasureNode extends Node {
    constructor() {
        super();
    }

    async evaluate(unit, blackboard) {
        const allies = blackboard.get('allyUnits') || [];
        const enemies = blackboard.get('enemyUnits') || [];
        const bestAction = crisisEngine.findBestDesperateMeasure(unit, allies, enemies);

        if (!bestAction) {
            // 크라이시스 엔진조차 할 일을 찾지 못하면 최종적으로 실패(대기) 처리
            return NodeState.FAILURE;
        }

        // 크라이시스 엔진이 제안한 행동 실행
        try {
            switch (bestAction.type) {
                case 'MOVE':
                    await pathfinderEngine.moveUnitTo(unit, bestAction.target.col, bestAction.target.row);
                    break;
                case 'SKILL':
                    console.log(`${unit.instanceName}이(가) ${bestAction.target.instanceName}에게 ${bestAction.skill.name} 스킬 사용!`);
                    skillEngine.recordSkillUse(unit, bestAction.skill);
                    // 임시로 이펙트만 표시
                    const vfxManager = blackboard.get('vfxManager');
                    if (vfxManager) {
                        vfxManager.showSkillName(unit.sprite, bestAction.skill.name);
                    }
                    break;
                // 추후 다른 타입의 행동 추가 가능
            }
            return NodeState.SUCCESS;
        } catch (error) {
            console.error('[ExecuteDesperateMeasureNode] 행동 실행 중 오류:', error);
            return NodeState.FAILURE;
        }
    }
}

export default ExecuteDesperateMeasureNode;
