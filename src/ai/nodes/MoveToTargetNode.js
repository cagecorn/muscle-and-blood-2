import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { formationEngine } from '../../game/utils/FormationEngine.js';
import { delayEngine } from '../../game/utils/DelayEngine.js';
import { statusEffectManager } from '../../game/utils/StatusEffectManager.js';
import { EFFECT_TYPES } from '../../game/utils/EffectTypes.js';

class MoveToTargetNode extends Node {
    constructor(engines = {}) {
        super();
        this.formationEngine = engines.formationEngine || formationEngine;
        this.animationEngine = engines.animationEngine;
        this.delayEngine = engines.delayEngine || delayEngine;
        this.vfxManager = engines.vfxManager;
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const path = blackboard.get('movementPath');

        // 1. 이동할 경로가 없으면 즉시 성공 처리
        if (!path || path.length === 0) {
            debugAIManager.logNodeResult(NodeState.SUCCESS, "이동 경로 없음, 이동 불필요");
            return NodeState.SUCCESS;
        }
        
        // 2. 이동력이 충분한지 확인
        const moveRange = unit.finalStats.movement || 0;
        if (path.length > moveRange) {
             debugAIManager.logNodeResult(NodeState.FAILURE, `경로가 너무 김 (경로: ${path.length}, 이동력: ${moveRange})`);
             blackboard.set('movementPath', null); // 경로 초기화
             return NodeState.FAILURE;
        }

        // 3. 경로의 각 단계를 순차적으로 이동
        let movedTiles = 0;
        for (const step of path) {
            const success = await this.formationEngine.moveUnitOnGrid(
                unit,
                step,
                this.animationEngine,
                200 // 한 칸 이동에 걸리는 시간
            );
            if (!success) {
                debugAIManager.logNodeResult(NodeState.FAILURE, `(${step.col}, ${step.row})로 이동 중 장애물 발견`);
                blackboard.set('movementPath', null); // 경로 초기화
                return NodeState.FAILURE;
            }
            movedTiles++;
        }
        
        // 4. (보너스) 플라잉맨의 '저거너트' 패시브 효과 적용
        if (unit.classPassive?.id === 'juggernaut' && movedTiles > 0) {
            const bonus = 0.03 * movedTiles;
            const buffEffect = {
                id: 'juggernautBuff',
                type: EFFECT_TYPES.BUFF,
                duration: 1, // 1턴 동안 지속
                sourceSkillName: '저거너트',
                modifiers: [{ stat: 'physicalDefense', type: 'percentage', value: bonus }]
            };
            statusEffectManager.addEffect(unit, { name: '저거너트', effect: buffEffect }, unit);
            if(this.vfxManager) this.vfxManager.showEffectName(unit.sprite, `저거너트 (+${(bonus * 100).toFixed(0)}%)`, '#f59e0b');
        }

        // 5. 이동 완료 후 상태 업데이트
        blackboard.set('hasMovedThisTurn', true);
        blackboard.set('movementPath', null); // 이동 완료 후 경로 초기화
        
        await this.delayEngine.hold(100); // 이동 후 짧은 딜레이

        debugAIManager.logNodeResult(NodeState.SUCCESS, '경로 이동 완료');
        return NodeState.SUCCESS;
    }
}

export default MoveToTargetNode;

