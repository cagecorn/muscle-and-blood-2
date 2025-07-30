import { SKILL_TAGS } from './SkillTagManager.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { classProficiencies } from '../data/classProficiencies.js';

/**
 * 용병의 MBTI 성향에 따라 장착할 스킬 카드를 결정하는 엔진 (심화 버전)
 */
class MercenaryCardSelector {
    constructor() {
        this.name = 'MercenaryCardSelector';
    }

    /**
     * 용병 한 명에게 장착할 8개의 스킬을 선택합니다.
     * @param {object} mercenary - 스킬을 장착할 용병
     * @param {Array<object>} availableCards - 사용 가능한 스킬 카드 인스턴스 목록
     * @returns {{selectedCards: Array<object>, remainingCards: Array<object>}} - 선택된 카드와 남은 카드 목록
     */
    selectCardsForMercenary(mercenary, availableCards) {
        // 1. 주 스킬과 특수 스킬 후보군 분리
        const mainSkillCandidates = availableCards.filter(inst => {
            const data = this._getSkillData(inst);
            return data && data.type !== 'STRATEGY' && !data.tags?.includes(SKILL_TAGS.SPECIAL);
        });

        const specialSkillCandidates = availableCards.filter(inst => {
            const data = this._getSkillData(inst);
            return data && data.type !== 'STRATEGY' && data.tags?.includes(SKILL_TAGS.SPECIAL);
        });

        // 2. 주 스킬과 특수 스킬을 성향에 맞게 선택
        const selectedMainSkills = this._selectSkillsByMBTI(mercenary, mainSkillCandidates, 4);
        const remainingForSpecial = specialSkillCandidates.filter(inst => !selectedMainSkills.find(s => s.instanceId === inst.instanceId));
        const selectedSpecialSkills = this._selectSkillsByMBTI(mercenary, remainingForSpecial, 4);

        // 3. 최종 결과 조합 및 반환
        const selectedCards = [...selectedMainSkills, ...selectedSpecialSkills];
        const remainingCards = availableCards.filter(inst => !selectedCards.find(s => s.instanceId === inst.instanceId));

        return { selectedCards, remainingCards };
    }

    /**
     * MBTI 성향에 따라 스킬 목록을 필터링하고 가중치를 부여하여 스킬을 선택합니다.
     * @private
     */
    _selectSkillsByMBTI(mercenary, candidates, count) {
        let selected = [];
        let currentCandidates = [...candidates];

        for (let i = 0; i < count; i++) {
            if (currentCandidates.length === 0) break;

            // 각 카드에 대해 MBTI 기반 선호도 점수 계산
            const weightedCandidates = currentCandidates.map(inst => {
                const card = this._getSkillData(inst);
                const tags = card.tags || [];
                let score = 100; // 기본 점수

                // E vs I: 외향(공격/돌진) vs 내향(원거리/방어)
                if (tags.some(t => [SKILL_TAGS.CHARGE, SKILL_TAGS.MELEE].includes(t))) score += mercenary.mbti.E;
                if (tags.some(t => [SKILL_TAGS.RANGED, SKILL_TAGS.WILL_GUARD].includes(t)) || card.type === 'BUFF') score += mercenary.mbti.I;

                // S vs N: 감각(단순/확정) vs 직관(복합/상태이상)
                if (tags.includes(SKILL_TAGS.FIXED) || (!card.effect && (card.damageMultiplier || card.healMultiplier))) score += mercenary.mbti.S;
                if (card.effect || card.push || card.turnOrderEffect || tags.includes(SKILL_TAGS.PROHIBITION)) score += mercenary.mbti.N;

                // T vs F: 사고(자신 강화/적 약화) vs 감정(아군 지원/치유)
                if (card.type === 'DEBUFF' || (card.type === 'BUFF' && card.targetType === 'self')) score += mercenary.mbti.T;
                if (card.type === 'AID' || (card.effect && card.effect.isGlobal)) score += mercenary.mbti.F;

                // J vs P: 판단(정석/숙련) vs 인식(변칙/비숙련)
                const isConventional = this._isConventional(card, mercenary.id);
                if (isConventional) score += mercenary.mbti.J;
                if (!isConventional) score += mercenary.mbti.P;

                return { instance: inst, score };
            });

            // 점수에 기반한 가중치 랜덤 선택
            const totalScore = weightedCandidates.reduce((sum, c) => sum + c.score, 0);
            let random = Math.random() * totalScore;
            
            let choice = weightedCandidates[weightedCandidates.length - 1].instance; // fallback
            for (const candidate of weightedCandidates) {
                if (random < candidate.score) {
                    choice = candidate.instance;
                    break;
                }
                random -= candidate.score;
            }
            
            selected.push(choice);
            currentCandidates = currentCandidates.filter(c => c.instanceId !== choice.instanceId);
        }
        return selected;
    }

    // --- 헬퍼 함수들 ---

    _getSkillData(instance) {
        return skillInventoryManager.getSkillData(instance.skillId, instance.grade);
    }

    _isConventional(card, classId) {
        const proficiencies = classProficiencies[classId] || [];
        const tags = card.tags || [];
        return tags.some(tag => proficiencies.includes(tag));
    }
}

export const mercenaryCardSelector = new MercenaryCardSelector();
