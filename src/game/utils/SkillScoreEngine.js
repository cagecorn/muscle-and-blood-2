import { debugLogEngine } from './DebugLogEngine.js';
import { SKILL_TYPES } from './SkillEngine.js';
import { SKILL_TAGS } from './SkillTagManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
// 새로 만든 점수 데이터 파일을 import 합니다.
import { SCORE_BY_TYPE, SCORE_BY_TAG } from '../data/skillScores.js';

/**
 * AI의 스킬 선택을 위해 각 스킬의 전략적 가치를 계산하는 엔진
 */
class SkillScoreEngine {
    constructor() {
        this.name = 'SkillScoreEngine';

        debugLogEngine.register(this);
    }

    /**
     * 주어진 스킬 데이터와 현재 전투 상황을 바탕으로 총점을 계산합니다.
     * @param {object} unit - 스킬 사용 주체 유닛
     * @param {object} skillData - 점수를 계산할 스킬의 데이터
     * @param {Array<object>} allies - 모든 아군 유닛 목록
     * @param {Array<object>} enemies - 모든 적군 유닛 목록
     * @returns {number} - 계산된 최종 점수
     */
    calculateScore(unit, skillData, allies, enemies) {
        if (!skillData || skillData.type === 'PASSIVE') {
            return 0;
        }

        let totalScore = 0;
        const situationLogs = [];

        // 1. 스킬 타입별 기본 점수 추가
        totalScore += SCORE_BY_TYPE[skillData.type] || 0;

        // 2. 스킬 태그별 점수 추가 (누적)
        if (skillData.tags) {
            for (const tag of skillData.tags) {
                totalScore += SCORE_BY_TAG[tag] || 0;
            }
        }

        // 3. 상황별 점수 보정

        const lowHealthAllies = allies.filter(a => a.currentHp / a.finalStats.hp <= 0.5).length;
        if (lowHealthAllies > 0 && skillData.tags?.includes(SKILL_TAGS.HEAL)) {
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

        // 3-3. 방어/버프 스킬: 자신의 체력이 낮을 때 가산
        if (skillData.tags?.includes(SKILL_TAGS.WILL_GUARD) || skillData.type === 'BUFF') {
            if (unit.currentHp < unit.finalStats.hp * 0.3) {
                totalScore += 10;
                situationLogs.push(`자신 체력 30% 미만, 생존 스킬에 +10점`);
            }
        }

        if (situationLogs.length > 0) {
            debugLogEngine.log(this.name, `[${unit.instanceName}] 스킬 [${skillData.name}] 점수 보정: ${situationLogs.join(', ')}`);
        }

        return totalScore;
    }
}

export const skillScoreEngine = new SkillScoreEngine();
