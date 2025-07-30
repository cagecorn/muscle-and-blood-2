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

        // 가독성을 위해 계산 항목을 구분해 기록합니다.
        let baseScore = SCORE_BY_TYPE[skillData.type] || 0;
        let tagScore = 0;
        let situationScore = 0;
        const situationLogs = [];

        if (skillData.tags) {
            skillData.tags.forEach(tag => {
                tagScore += SCORE_BY_TAG[tag] || 0;
            });
        }

        const lowHealthAllies = allies.filter(a => a.currentHp / a.finalStats.hp <= 0.5).length;
        if (lowHealthAllies > 0 && (skillData.tags.includes(SKILL_TAGS.HEAL) || skillData.tags.includes(SKILL_TAGS.AID))) {
            const bonus = lowHealthAllies * 15;
            situationScore += bonus;
            situationLogs.push(`부상 아군(${lowHealthAllies}명):+${bonus}`);
        }

        const buffedEnemies = enemies.filter(e => {
            const effects = statusEffectManager.activeEffects.get(e.uniqueId) || [];
            return effects.some(effect => effect.id === 'battleCryBuff');
        });
        if (buffedEnemies.length > 0) {
            if (skillData.tags.includes(SKILL_TAGS.DEBUFF)) {
                situationScore += 10;
                situationLogs.push(`적 버프 대응:+10`);
            }
            if (skillData.tags.includes(SKILL_TAGS.FIXED) || skillData.type === 'STRATEGY') {
                situationScore += 5;
                situationLogs.push(`적 버프 대응(고위력):+5`);
            }
        }

        if (unit.currentHp < unit.finalStats.hp * 0.3) {
            if (skillData.tags.includes(SKILL_TAGS.WILL_GUARD) || skillData.type === 'BUFF') {
                situationScore += 10;
                situationLogs.push(`생존:+10`);
            }
        }

        const totalScore = baseScore + tagScore + situationScore;

        debugLogEngine.log(
            this.name,
            `[${unit.instanceName}] 스킬 [${skillData.name}] 점수: ` +
                `기본(${baseScore}) + 태그(${tagScore}) + 상황(${situationScore}) = 최종 ${totalScore}` +
                (situationLogs.length > 0 ? ` (${situationLogs.join(', ')})` : '')
        );

        return totalScore;
    }
}

export const skillScoreEngine = new SkillScoreEngine();
