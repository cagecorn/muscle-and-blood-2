import { createBehaviorTree } from '../../ai/behaviors/createBehaviorTree.js';

/**
 * @typedef {Object} Unit
 * @property {string} id - 유닛의 고유 식별자
 * @property {string} name - 유닛 이름
 * @property {string} mbti - AI 행동 트리를 결정하는 MBTI
 */

/**
 * 소환수 관련 로직을 처리하는 엔진입니다.
 * 소환수를 생성하고, 전장에 배치하며, AI를 설정합니다.
 */
export class SummoningEngine {
    /**
     * @param {Phaser.Scene} scene
     * @param {Unit[]} allUnits
     * @param {SpriteEngine} spriteEngine
     * @param {CombatUIManager} combatUIManager
     * @param {AIManager} aiManager - [변경점] AIManager 인스턴스를 직접 전달받습니다.
     */
    constructor(scene, allUnits, spriteEngine, combatUIManager, aiManager) { // [변경점] aiManager 추가
        this.scene = scene;
        this.allUnits = allUnits;
        this.spriteEngine = spriteEngine;
        this.combatUIManager = combatUIManager;
        this.aiManager = aiManager; // [변경점] 전달받은 aiManager를 저장
    }

    summonUnit(summoner, skill) {
        // ... (기존 소환 로직은 그대로 유지) ...
        let newUnit;

        // [변경점] 새로 생성된 소환수에게도 AI 행동 트리를 만들어줍니다.
        if (newUnit) {
            const tree = createBehaviorTree(newUnit.mbti, newUnit, this.scene, this.aiManager);
            this.aiManager.behaviorTrees.set(newUnit.id, tree);
            console.log(`[SummoningEngine] 새로 소환된 유닛 ${newUnit.name}에게 AI를 할당했습니다.`);
        }

        return newUnit;
    }
}
