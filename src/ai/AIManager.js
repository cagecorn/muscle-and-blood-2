import { createBehaviorTree } from './behaviors/createBehaviorTree';

/**
 * AI 로직을 총괄하는 관리자입니다.
 * 모든 유닛의 행동을 결정하고 실행을 요청합니다.
 * * [변경점]
 * - 이제 특정 유닛 하나가 아닌, 모든 유닛의 행동을 관리합니다.
 * - GlobalTurnClock의 신호를 받아 동시에 모든 유닛의 행동을 결정합니다.
 */
export class AIManager {
    constructor(scene, allUnits, gridEngine, battleEngine) {
        this.scene = scene;
        this.allUnits = allUnits;
        this.gridEngine = gridEngine;
        this.battleEngine = battleEngine;
        this.behaviorTrees = new Map();

        // 모든 유닛에 대해 행동 트리(Behavior Tree)를 생성합니다.
        this.allUnits.forEach(unit => {
            if (!unit.isDead()) {
                const tree = createBehaviorTree(unit.mbti, unit, this.scene, this);
                this.behaviorTrees.set(unit.id, tree);
            }
        });
    }

    /**
     * [신규] 새로운 글로벌 턴이 시작될 때 호출될 메소드입니다.
     * 살아있는 모든 유닛의 행동을 결정하고 BattleEngine에 실행을 요청합니다.
     */
    decideAndRequestActions() {
        console.log('[AIManager] 모든 유닛의 행동 결정을 시작합니다.');

        const allActions = [];

        // 모든 유닛(아군, 적군 포함)을 순회합니다.
        this.allUnits.forEach(unit => {
            if (unit.isDead()) return; // 죽은 유닛은 건너뜁니다.

            const behaviorTree = this.behaviorTrees.get(unit.id);
            if (behaviorTree) {
                // 행동 트리를 실행하여 이 턴에 할 행동을 결정합니다.
                behaviorTree.execute();
                const action = behaviorTree.blackboard.get('chosenAction');

                if (action) {
                    console.log(`[AIManager] ${unit.name}(${unit.id})의 행동:`, action);
                    allActions.push(action);
                } else {
                    // 행동이 결정되지 않은 경우, 기본적으로 '대기' 행동을 추가할 수 있습니다.
                    console.log(`[AIManager] ${unit.name}(${unit.id})는 행동을 결정하지 못했습니다. 대기합니다.`);
                    allActions.push({ type: 'wait', unit });
                }
            }
        });

        // 결정된 모든 행동을 BattleEngine에 넘겨 동시에 처리하도록 합니다.
        // 이 부분은 다음 단계에서 BattleEngine을 수정하면서 완성될 것입니다.
        // this.battleEngine.executeMultipleActions(allActions); 
    }

    // 기존의 requestActionFor 메소드는 이제 사용되지 않습니다.
    // 하지만 나중에 참고할 수 있도록 일단 남겨둡니다.
    requestActionFor(unit) {
        // 이 함수는 이전 턴제 시스템에서 사용되었습니다.
        console.warn('[AIManager] requestActionFor는 더 이상 사용되지 않는 함수입니다.');
    }
}

