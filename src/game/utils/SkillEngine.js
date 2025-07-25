import { diceEngine } from './DiceEngine.js';
import { debugLogEngine } from './DebugLogEngine.js';
import { tokenEngine } from './TokenEngine.js';
// ✨ [신규] ActionPowerEngine을 import 합니다.
import { actionPowerEngine } from './ActionPowerEngine.js';
import { cooldownManager } from './CooldownManager.js';

// 스킬 종류와 해당 색상, 이름을 상수로 정의합니다.
export const SKILL_TYPES = {
    ACTIVE: { name: '액티브', color: '#FF8C00' }, // 주황색
    BUFF:   { name: '버프',   color: '#1E90FF' }, // 파랑색
    DEBUFF: { name: '디버프', color: '#DC143C' }, // 빨강색
    PASSIVE:{ name: '패시브', color: '#32CD32' },  // 초록색
    // ✨ [변경] AID 타입을 하얀색 계열로 변경합니다.
    AID:    { name: '지원',   color: '#F5F5F5' },  // 하얀색 (순백색(#FFF) 대신 약간의 회색을 섞어 배경과 구분되도록 함)
    // ✨ [신규] 소환 스킬 타입 추가
    SUMMON: { name: '소환',   color: '#9966CC' }   // 보라색 계열
};

/**
 * 용병의 스킬 사용, 우선순위 결정 등 스킬 관련 로직을 총괄하는 엔진
 */
class SkillEngine {
    constructor() {
        this.skillTypes = Object.keys(SKILL_TYPES);
        // ✨ 한 턴 동안 유닛별로 사용한 스킬을 추적합니다
        // key: unitId => Set<skillId>
        this.usedSkillsThisTurn = new Map();
        // ✨ 한 턴에 스킬을 사용한 횟수를 추적하는 Map
        this.skillUsesThisTurn = new Map();
        debugLogEngine.log('SkillEngine', '스킬 엔진이 초기화되었습니다.');
    }

    /**
     * 새로운 턴이 시작될 때 스킬 사용 기록을 초기화합니다.
     */
    resetTurnActions() {
        this.usedSkillsThisTurn.clear();
        this.skillUsesThisTurn.clear();
        debugLogEngine.log('SkillEngine', '턴 시작, 스킬 사용 기록 초기화 완료.');
    }

    /**
     * 용병이 특정 스킬을 사용할 수 있는지 확인합니다.
     * @param {object} unit - 스킬을 사용하려는 유닛
     * @param {object} skill - 사용하려는 스킬 데이터
     * @returns {boolean} - 스킬 사용 가능 여부
     */
    canUseSkill(unit, skill) {
        // 1. 토큰이 충분한가?
        const currentTokens = tokenEngine.getTokens(unit.uniqueId);
        // ✨ [변경] 행동력도 함께 확인합니다.
        const currentActionPower = actionPowerEngine.getActionPower(unit.uniqueId);
        if (currentTokens < (skill.cost || 0)) {
            return false;
        }
        if (currentActionPower < (skill.actionPowerCost || 0)) {
            return false;
        }

        // 2. 이번 턴에 해당 유닛이 이미 사용한 스킬인가?
        const unitUsed = this.usedSkillsThisTurn.get(unit.uniqueId);
        if (unitUsed && unitUsed.has(skill.id)) {
            return false;
        }

        // 3. 이번 턴에 다른 스킬을 이미 사용했더라도 토큰이 남아 있다면 추가 행동이 가능하다
        //    단, 같은 스킬은 한 번만 사용할 수 있도록 위에서 체크했다.

        // 4. 쿨타임이 지났는가?
        if (!cooldownManager.isReady(unit.uniqueId, skill.id)) {
            return false;
        }

        return true;
    }

    /**
     * 용병이 스킬을 사용하는 것을 기록합니다.
     * @param {object} unit - 스킬을 사용한 유닛
     * @param {object} skill - 사용한 스킬 데이터
     */
    recordSkillUse(unit, skill) {
        if (!this.canUseSkill(unit, skill)) return;

        // ✨ [변경] 토큰과 행동력 소모
        tokenEngine.spendTokens(unit.uniqueId, skill.cost || 0);
        actionPowerEngine.spend(unit.uniqueId, skill.actionPowerCost || 0);

        // 사용 기록
        let unitUsed = this.usedSkillsThisTurn.get(unit.uniqueId);
        if (!unitUsed) {
            unitUsed = new Set();
            this.usedSkillsThisTurn.set(unit.uniqueId, unitUsed);
        }
        unitUsed.add(skill.id);

        const currentUses = this.skillUsesThisTurn.get(unit.uniqueId) || 0;
        this.skillUsesThisTurn.set(unit.uniqueId, currentUses + 1);

        if (skill.cooldown && skill.cooldown > 0) {
            cooldownManager.setCooldown(unit.uniqueId, skill.id, skill.cooldown);
        }

        debugLogEngine.log('SkillEngine', `${unit.instanceName}이(가) 스킬 [${skill.name}] 사용 (토큰 ${skill.cost || 0}, 행동력 ${skill.actionPowerCost || 0} 소모).`);
    }

    /**
     * ✨ [수정] 3개의 무작위 스킬 슬롯 타입을 생성하여 반환합니다.
     * @param {Array<string>} [allowedTypes=this.skillTypes] - 무작위로 선택될 스킬 타입 배열
     * @returns {Array<string>} - 3개의 스킬 타입 문자열 배열 (예: ['ACTIVE', 'PASSIVE', 'BUFF'])
     */
    generateRandomSkillSlots(allowedTypes = this.skillTypes) {
        const slots = [];
        for (let i = 0; i < 3; i++) {
            const randomType = diceEngine.getRandomElement(allowedTypes);
            slots.push(randomType);
        }
        return slots;
    }
}

export const skillEngine = new SkillEngine();
