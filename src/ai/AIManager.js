import { createBehaviorTree } from './behaviors/createBehaviorTree.js'; // .js 확장자 추가!

/**
 * AI 로직을 총괄하는 관리자입니다.
 * 모든 유닛의 행동을 결정하고 실행을 요청합니다.
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
     * 새로운 글로벌 턴이 시작될 때 호출될 메소드입니다.
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
                    allActions.push(action);
                } else {
                    // 행동이 결정되지 않은 경우, 기본적으로 '대기' 행동을 추가합니다.
                    allActions.push({ type: 'wait', unit });
                }
            }
        });

        // 결정된 모든 행동을 BattleEngine에 넘겨 동시에 처리하도록 합니다.
        // 다음 단계에서 이 부분의 주석을 풀고 실제로 작동시킬 것입니다.
        // this.battleEngine.executeMultipleActions(allActions); 
        console.log('[AIManager] 결정된 행동 목록:', allActions);
    }

    // 기존의 requestActionFor 메소드는 이제 사용되지 않습니다.
    requestActionFor(unit) {
        console.warn('[AIManager] requestActionFor는 더 이상 사용되지 않는 함수입니다.');
    }
}
