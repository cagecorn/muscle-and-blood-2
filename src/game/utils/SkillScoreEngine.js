import { debugLogEngine } from './DebugLogEngine.js';
import { SKILL_TYPES } from './SkillEngine.js';
import { SKILL_TAGS } from './SkillTagManager.js';
import { statusEffectManager } from './StatusEffectManager.js';

/**
 * AI의 스킬 선택을 위해 각 스킬의 전략적 가치를 계산하는 엔진
 */
class SkillScoreEngine {
    constructor() {
        this.name = 'SkillScoreEngine';

        // 1. 스킬 유형별 기본 점수
        this.skillTypeScores = {
            [SKILL_TYPES.ACTIVE.name]: 2,
            [SKILL_TYPES.BUFF.name]: 3,
            [SKILL_TYPES.DEBUFF.name]: 2,
            [SKILL_TYPES.AID.name]: 4,
            [SKILL_TYPES.SUMMON.name]: 3,
            [SKILL_TYPES.STRATEGY.name]: 3,
        };

        // 2. 스킬 태그별 추가 점수
        this.skillTagScores = {
            [SKILL_TAGS.FIXED]: 10,
            [SKILL_TAGS.WILL_GUARD]: 9,
            [SKILL_TAGS.DELAY]: 8,
            [SKILL_TAGS.PROHIBITION]: 7,
            [SKILL_TAGS.HEAL]: 5,
            [SKILL_TAGS.CHARGE]: 4,
            [SKILL_TAGS.KINETIC]: 4,
        };

        debugLogEngine.register(this);
    }

    /**
     * 주어진 스킬 데이터와 전투 상황을 바탕으로 총점을 계산합니다.
     * @param {object} skillData - 점수를 계산할 스킬의 데이터
     * @param {object} unit - 스킬 사용 주체 유닛
     * @param {object} blackboard - AI 블랙보드
     * @returns {number} - 계산된 최종 점수
     */
    calculateScore(skillData, unit, blackboard) {
        if (!skillData || skillData.type === 'PASSIVE') {
            return 0;
        }

        // 1. 스킬 유형 기본 점수
        const skillTypeName = SKILL_TYPES[skillData.type]?.name;
        let totalScore = this.skillTypeScores[skillTypeName] || 0;
        const situationLogs = [];

        // 2. 스킬 태그 추가 점수
        if (skillData.tags && skillData.tags.length > 0) {
            skillData.tags.forEach(tag => {
                totalScore += this.skillTagScores[tag] || 0;
            });
        }

        // 3. 상황별 보너스/패널티
        const allies = blackboard.get('allyUnits') || [];
        const enemies = blackboard.get('enemyUnits') || [];

        const lowHealthAllies = allies.filter(a => a.currentHp / a.finalStats.hp <= 0.5).length;
        if (lowHealthAllies > 0 && (skillData.tags.includes(SKILL_TAGS.HEAL) || skillData.tags.includes(SKILL_TAGS.AID))) {
            const bonus = lowHealthAllies * 15;
            totalScore += bonus;
            situationLogs.push(`체력 낮은 아군 ${lowHealthAllies}명 발견, +${bonus}점`);
        }

        const buffedEnemy = enemies.find(e => {
            const effects = statusEffectManager.activeEffects.get(e.uniqueId) || [];
            return effects.some(effect => effect.id === 'battleCryBuff');
        });
        if (buffedEnemy) {
            if (skillData.tags.includes(SKILL_TAGS.DEBUFF)) {
                totalScore += 10;
                situationLogs.push('위협적인 버프를 받은 적 발견, 디버프 스킬에 +10점');
            }
            if (skillData.tags.includes(SKILL_TAGS.FIXED) || skillData.type === 'STRATEGY') {
                totalScore += 5;
                situationLogs.push('위협적인 버프를 받은 적 발견, 고위력 스킬에 +5점');
            }
        }

        const healthPercentage = unit.currentHp / unit.finalStats.hp;
        if (healthPercentage <= 0.4) {
            if (skillData.type === 'BUFF' || skillData.tags.includes(SKILL_TAGS.WILL_GUARD)) {
                totalScore += 12;
                situationLogs.push('자신 체력 낮음, 방어/지원 스킬에 +12점');
            }
        }

        if (situationLogs.length > 0) {
            debugLogEngine.log(this.name, `[${unit.instanceName}] 스킬 [${skillData.name}] 점수 보정: ${situationLogs.join(', ')}`);
        }

        return totalScore;
    }
}

export const skillScoreEngine = new SkillScoreEngine();
