import Node, { NodeState } from './Node.js';
import { debugAIManager } from '../../game/debug/DebugAIManager.js';
import { skillEngine, SKILL_TYPES } from '../../game/utils/SkillEngine.js';
import { skillInventoryManager } from '../../game/utils/SkillInventoryManager.js';
import { skillModifierEngine } from '../../game/utils/SkillModifierEngine.js';
import { debugSkillExecutionManager } from '../../game/debug/DebugSkillExecutionManager.js';
import { classProficiencies } from '../../game/data/classProficiencies.js';
import { diceEngine } from '../../game/utils/DiceEngine.js';
import SkillEffectProcessor from '../../game/utils/SkillEffectProcessor.js'; // 새로 만든 클래스를 import
import { debugLogEngine } from '../../game/utils/DebugLogEngine.js';

class UseSkillNode extends Node {
    constructor(engines = {}) {
        super();
        this.delayEngine = engines.delayEngine;
        this.skillEngine = engines.skillEngine || skillEngine;
        this.vfxManager = engines.vfxManager;
        this.narrationEngine = engines.narrationEngine;
        // SkillEffectProcessor를 초기화합니다.
        this.skillEffectProcessor = new SkillEffectProcessor(engines);
    }

    async evaluate(unit, blackboard) {
        debugAIManager.logNodeEvaluation(this, unit);

        const skillTarget = blackboard.get('skillTarget');
        const instanceId = blackboard.get('currentSkillInstanceId');

        if (!instanceId || !skillTarget) {
            debugAIManager.logNodeResult(NodeState.FAILURE, '스킬 인스턴스 또는 대상 없음');
            return NodeState.FAILURE;
        }

        const instanceData = skillInventoryManager.getInstanceData(instanceId);
        const baseSkillData = skillInventoryManager.getSkillData(instanceData.skillId, instanceData.grade);
        const modifiedSkill = skillModifierEngine.getModifiedSkill(baseSkillData, instanceData.grade);

        if (!modifiedSkill || !this.skillEngine.canUseSkill(unit, modifiedSkill)) {
            debugAIManager.logNodeResult(NodeState.FAILURE, `스킬 [${modifiedSkill?.name}] 사용 조건 미충족`);
            return NodeState.FAILURE;
        }

        // MBTI 스택 버프 시스템 제거로 관련 로직을 삭제합니다.

        debugSkillExecutionManager.logSkillExecution(unit, baseSkillData, modifiedSkill, instanceData.grade);

        // 최종 사용할 스킬 데이터를 준비합니다 (숙련도 보너스 적용)
        const finalSkill = this._applyProficiency(unit, modifiedSkill);

        if (this.narrationEngine) {
            this.narrationEngine.show(`${unit.instanceName}이(가) [${skillTarget.instanceName}]에게 [${finalSkill.name}]을(를) 사용합니다.`);
        }

        // 스킬 사용 기록
        this.skillEngine.recordSkillUse(unit, finalSkill);
        const usedSkills = blackboard.get('usedSkillsThisTurn') || new Set();
        usedSkills.add(instanceId);
        blackboard.set('usedSkillsThisTurn', usedSkills);

        // 스킬 이름 VFX 표시
        this.vfxManager.showSkillName(unit.sprite, finalSkill.name, SKILL_TYPES[finalSkill.type].color);

        // ✨ SkillEffectProcessor에 모든 처리를 위임합니다.
        await this.skillEffectProcessor.process({
            unit,
            target: skillTarget,
            skill: finalSkill,
            instanceId,
            grade: instanceData.grade,
            blackboard
        });

        // 처리 후 블랙보드 정리
        blackboard.set('currentSkillData', null);
        blackboard.set('currentSkillInstanceId', null);
        blackboard.set('skillTarget', null);

        await this.delayEngine.hold(500);

        debugAIManager.logNodeResult(NodeState.SUCCESS);
        return NodeState.SUCCESS;
    }

    /**
     * 숙련도에 따라 스킬의 최종 계수를 결정하여 반환합니다.
     * @private
     */
    _applyProficiency(unit, skill) {
        const finalSkill = { ...skill };
        const proficiencies = classProficiencies[unit.id] || [];
        const matchingTags = skill.tags.filter(t => proficiencies.includes(t)).length;
        const rolls = Math.max(1, matchingTags);

        if (typeof skill.damageMultiplier === 'object') {
            finalSkill.damageMultiplier = diceEngine.rollWithAdvantage(
                skill.damageMultiplier.min, skill.damageMultiplier.max, rolls
            );
            debugLogEngine.log('UseSkillNode', `${unit.instanceName}의 [${skill.name}] 숙련도 체크. ${rolls}번 굴림 -> 최종 계수: ${finalSkill.damageMultiplier.toFixed(2)}`);
        }

        if (typeof skill.healMultiplier === 'object') {
            finalSkill.healMultiplier = diceEngine.rollWithAdvantage(
                skill.healMultiplier.min, skill.healMultiplier.max, rolls
            );
        }

        return finalSkill;
    }

}

export default UseSkillNode;
