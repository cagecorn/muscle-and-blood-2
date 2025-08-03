import { debugLogEngine } from './DebugLogEngine.js';
import { SKILL_TYPES } from './SkillEngine.js';
import { SKILL_TAGS } from './SkillTagManager.js';
import { statusEffectManager } from './StatusEffectManager.js';
// 새로 만든 점수 데이터 파일을 import 합니다.
import { SCORE_BY_TYPE, SCORE_BY_TAG } from '../data/skillScores.js';
// ✨ AIMemoryEngine과 Debug 매니저 추가
import { aiMemoryEngine } from './AIMemoryEngine.js';
import { debugAIMemoryManager } from '../debug/DebugAIMemoryManager.js';
// ✨ 1. YinYangEngine을 import 합니다.
import { yinYangEngine } from './YinYangEngine.js';
import { debugYinYangManager } from '../debug/DebugYinYangManager.js';

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
    async calculateScore(unit, skillData, target, allies, enemies) {
        if (!skillData || skillData.type === 'PASSIVE') {
            return 0;
        }

        // 가독성을 위해 계산 항목을 구분해 기록합니다.
        let baseScore = SCORE_BY_TYPE[skillData.type] || 0;
        let tagScore = 0;
        let situationScore = 0;
        // ✨ 2. 음양 보너스 점수를 위한 변수 추가
        let yinYangBonus = 0;
        // ✨ [신규] MBTI 성향 점수 변수
        let mbtiScore = 0;
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

        // ✨ [신규] INTP 성향 보너스
        if (unit.mbti) {
            const mbtiString = (unit.mbti.E > unit.mbti.I ? 'E' : 'I') +
                (unit.mbti.S > unit.mbti.N ? 'S' : 'N') +
                (unit.mbti.T > unit.mbti.F ? 'T' : 'F') +
                (unit.mbti.J > unit.mbti.P ? 'J' : 'P');
            if (mbtiString === 'INTP') {
                if (skillData.tags?.includes(SKILL_TAGS.COMBO)) {
                    mbtiScore += 15; // 콤보 스킬에 높은 추가 점수
                }
                if (skillData.tags?.includes(SKILL_TAGS.PRODUCTION)) {
                    mbtiScore += 10; // 생산 스킬에도 추가 점수
                }
            }

            // ✨ ENTP 성향 보너스
            if (mbtiString === 'ENTP') {
                const tags = skillData.tags || [];
                if (tags.includes(SKILL_TAGS.DELAY)) mbtiScore += 20;
                if (tags.includes(SKILL_TAGS.KINETIC)) mbtiScore += 20;
                if (tags.includes(SKILL_TAGS.BIND)) mbtiScore += 25; // 끌어당기기 스킬 선호
                if (skillData.type === 'DEBUFF') mbtiScore += 15;
            }
        }

        // ✨ 3. 음양 시스템 점수 계산 로직 추가
        if (target && skillData.yinYangValue) {
            const targetBalance = yinYangEngine.getBalance(target.uniqueId);
            const skillValue = skillData.yinYangValue;
            let efficiency = 0;

            if (Math.sign(targetBalance) !== Math.sign(skillValue) && targetBalance !== 0) {
                const currentImbalance = Math.abs(targetBalance);
                const potentialFutureImbalance = Math.abs(targetBalance + skillValue);
                efficiency = currentImbalance - potentialFutureImbalance;
            }

            if (efficiency > 0) {
                yinYangBonus = efficiency * 2;
                situationLogs.push(`음양 균형(${yinYangBonus.toFixed(0)})`);
            }
        }

        // ✨ 4. 최종 점수 계산에 음양 보너스 합산
        // ✨ 최종 점수 계산에 MBTI 보너스 합산
        const calculatedScore = baseScore + tagScore + situationScore + yinYangBonus + mbtiScore;

        // ✨ AI 기억 가중치 적용
        let finalScore = calculatedScore;
        if (target && target.team !== unit.team) {
            const memory = await aiMemoryEngine.getMemory(unit.uniqueId);
            const targetMemory = memory[`target_${target.uniqueId}`];
            if (targetMemory) {
                const attackType = this.getAttackTypeFromSkillTags(skillData.tags);
                if (attackType) {
                    const weight = targetMemory[`${attackType}_weight`] || 1.0;
                    if (weight !== 1.0) {
                        finalScore *= weight;
                        debugAIMemoryManager.logScoreModification(skillData.name, calculatedScore, weight, finalScore);
                    }
                }
            }
        }

        debugYinYangManager.logScoreModification(
            skillData.name,
            baseScore + tagScore + situationScore + mbtiScore,
            yinYangBonus,
            finalScore
        );

        debugLogEngine.log(
            this.name,
            `[${unit.instanceName}] 스킬 [${skillData.name}] 점수: ` +
                `기본(${baseScore}) + 태그(${tagScore}) + 상황(${situationScore}) + 음양(${yinYangBonus.toFixed(2)}) + MBTI(${mbtiScore}) = 최종 ${finalScore.toFixed(2)}` +
                (situationLogs.length > 0 ? ` (${situationLogs.join(', ')})` : '')
        );

        return finalScore;
    }

    // ✨ 스킬 태그로부터 공격 타입을 알아내는 헬퍼 함수
    getAttackTypeFromSkillTags(tags = []) {
        if (tags.includes(SKILL_TAGS.MELEE)) return 'melee';
        if (tags.includes(SKILL_TAGS.RANGED)) return 'ranged';
        if (tags.includes(SKILL_TAGS.MAGIC)) return 'magic';
        return null;
    }
}

export const skillScoreEngine = new SkillScoreEngine();
