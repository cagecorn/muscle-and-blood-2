import { SkillEngine } from './SkillEngine.js';
import { CombatCalculationEngine } from './CombatCalculationEngine.js';
import { StatusEffectManager } from './StatusEffectManager.js';
import { SummoningEngine } from './SummoningEngine.js';

/**
 * 전투의 모든 행동(이동, 공격, 스킬)을 처리하고 실행하는 핵심 엔진입니다.
 */
export class BattleEngine {
    /**
     * @param {Phaser.Scene} scene
     * @param {Unit[]} allUnits
     * @param {GridEngine} gridEngine
     * @param {SpriteEngine} spriteEngine
     * @param {CombatUIManager} combatUIManager
     * @param {AnimationEngine} animationEngine
     * @param {AIManager} aiManager - [변경점] AIManager 인스턴스를 전달받습니다.
     */
    constructor(scene, allUnits, gridEngine, spriteEngine, combatUIManager, animationEngine, aiManager) { // [변경점] aiManager 추가
        this.scene = scene;
        this.allUnits = allUnits;
        this.gridEngine = gridEngine;
        this.spriteEngine = spriteEngine;
        this.combatUIManager = combatUIManager;
        this.animationEngine = animationEngine;
        this.aiManager = aiManager; // [변경점] aiManager 저장

        // 다른 엔진들에게도 필요한 부품들을 전달하며 생성합니다.
        this.combatCalculationEngine = new CombatCalculationEngine(this.gridEngine);
        this.statusEffectManager = new StatusEffectManager(this.scene, this.allUnits, this.combatUIManager);
        this.summoningEngine = new SummoningEngine(this.scene, this.allUnits, this.spriteEngine, this.combatUIManager, this.aiManager); // [변경점] aiManager 전달
        this.skillEngine = new SkillEngine(this, this.gridEngine, this.combatCalculationEngine, this.statusEffectManager, this.summoningEngine, this.animationEngine, this.combatUIManager);
    }
    
    /**
     * [신규] 여러 행동을 동시에 실행하기 위한 메소드
     * @param {Object[]} actions - AI가 결정한 행동 객체들의 배열
     */
    async executeMultipleActions(actions) {
        console.log('[BattleEngine] 여러 행동을 동시에 실행합니다:', actions);
        
        // 행동들을 우선순위에 따라 정렬 (예: 민첩성 높은 순)
        actions.sort((a, b) => b.unit.getCurrentStat('agility') - a.unit.getCurrentStat('agility'));

        // 모든 행동을 동시에 시작
        const actionPromises = actions.map(action => this.executeAction(action));
        
        // 모든 행동이 끝날 때까지 기다림
        await Promise.all(actionPromises);

        console.log('[BattleEngine] 모든 동시 행동이 완료되었습니다.');
        this.scene.events.emit('all-actions-completed');
    }
    
    /**
     * 단일 행동을 실행합니다.
     * @param {Object} action - 실행할 행동 객체
     */
    async executeAction(action) {
        const { type, unit, target, skill, path } = action;
        
        switch (type) {
            case 'move':
                await this.spriteEngine.moveUnitAlongPath(unit, path);
                break;
            case 'skill':
                await this.skillEngine.useSkill(unit, target, skill);
                break;
            case 'wait':
                // 대기는 아무것도 하지 않지만, 약간의 딜레이를 주어 자연스럽게 보이게 할 수 있습니다.
                await new Promise(resolve => setTimeout(resolve, 100));
                break;
        }
    }
}
