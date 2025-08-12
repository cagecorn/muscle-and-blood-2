import { createBehaviorTree } from './behaviors/createBehaviorTree.js'; // .js 확장자 추가!

/**
 * AI 로직을 총괄하는 관리자입니다.
 * 모든 유닛의 행동을 결정하고 실행을 요청합니다.
 */
export class AIManager {
    constructor(scene, allUnits = [], gridEngine, battleEngine) {
        this.scene = scene;
        this.allUnits = allUnits;
        this.gridEngine = gridEngine;
        this.battleEngine = battleEngine;

        this.behaviorTrees = new Map();
        this.unitData = new Map();
        this.aiEngines = null;

        // 초기 유닛이 존재한다면 등록합니다.
        this.allUnits.forEach(unit => this.registerUnit(unit));
    }

    clear() {
        this.allUnits = [];
        this.behaviorTrees.clear();
        this.unitData.clear();
    }

    registerUnit(unit, customTree) {
        const key = unit.uniqueId || unit.id;
        const tree = customTree || createBehaviorTree(unit.mbti, unit, this.scene, this);
        this.behaviorTrees.set(key, tree);
        this.unitData.set(key, { behaviorTree: tree });
        if (!this.allUnits.includes(unit)) {
            this.allUnits.push(unit);
        }
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
            if (unit.isDead && unit.isDead()) return; // 죽은 유닛은 건너뜁니다.

            const key = unit.uniqueId || unit.id;
            const behaviorTree = this.behaviorTrees.get(key);
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
        return allActions;
    }

    async executeTurn(unit, allUnits, enemies) {
        const key = unit.uniqueId || unit.id;
        const data = this.behaviorTrees.get(key);
        if (!data) return;

        data.blackboard.set('allUnits', allUnits);
        data.blackboard.set('enemies', enemies);
        await data.execute();
    }

    // 기존의 requestActionFor 메소드는 이제 사용되지 않습니다.
    requestActionFor(unit) {
        console.warn('[AIManager] requestActionFor는 더 이상 사용되지 않는 함수입니다.');
    }
}
