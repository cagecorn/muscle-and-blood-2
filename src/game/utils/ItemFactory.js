import { itemBaseData, itemAffixes, mbtiGradeEffects } from '../data/items.js';
import { uniqueIDManager } from './UniqueIDManager.js';
import { diceEngine } from './DiceEngine.js';
import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 아이템 데이터를 기반으로 고유한 아이템 인스턴스를 생성하는 공장 클래스
 */
class ItemFactory {
    constructor() {
        this.name = 'ItemFactory';
        // 등급별 MBTI 효과 개수 설정
        this.effectsPerGrade = {
            NORMAL: 1,
            RARE: 2,
            EPIC: 3,
            LEGENDARY: 4
        };
        debugLogEngine.register(this);
    }

    /**
     * 지정된 ID의 기본 아이템에 무작위 접두사/접미사를 붙여 새로운 아이템을 생성합니다.
     * @param {string} baseItemId - 생성할 아이템의 ID
     * @returns {object|null} - 생성된 아이템 인스턴스 또는 null
     */
    createItem(baseItemId, grade = 'NORMAL') {
        const baseData = itemBaseData[baseItemId];
        if (!baseData) {
            debugLogEngine.error(this.name, `'${baseItemId}'에 해당하는 아이템 기본 데이터를 찾을 수 없습니다.`);
            return null;
        }

        // 1. 랜덤 접두사, 접미사 선택
        const prefix = diceEngine.getRandomElement(itemAffixes.prefixes);
        const suffix = diceEngine.getRandomElement(itemAffixes.suffixes);

        // 2. 최종 아이템 객체 생성
        const newItem = {
            instanceId: uniqueIDManager.getNextId(),
            baseId: baseItemId,
            name: `[${grade}] ${prefix.name} ${baseData.name} ${suffix.name}`,
            type: baseData.type,
            grade,
            synergy: baseData.synergy || null,
            illustrationPath: baseData.illustrationPath,
            stats: {},
            mbtiEffects: [],
            sockets: [],
            weight: baseData.weight
        };

        // 3. 기본 스탯 적용 (범위 내에서 랜덤 값 부여)
        for (const [stat, range] of Object.entries(baseData.baseStats)) {
            newItem.stats[stat] = this._getRandomValue(range.min, range.max);
        }

        // 4. 접두사/접미사 스탯 적용
        [prefix, suffix].forEach(affix => {
            const value = this._getRandomValue(affix.value.min, affix.value.max);
            const statKey = affix.isPercentage ? `${affix.stat}Percentage` : affix.stat;
            newItem.stats[statKey] = (newItem.stats[statKey] || 0) + value;
        });

        // --- ▼ [신규] 등급 기반 MBTI 효과 부여 로직 ▼ ---
        const numberOfEffects = this.effectsPerGrade[grade] || 0;
        if (numberOfEffects > 0) {
            const allTraits = Object.keys(mbtiGradeEffects);
            const shuffledTraits = allTraits.sort(() => 0.5 - Math.random());
            const selectedTraits = shuffledTraits.slice(0, numberOfEffects);

            selectedTraits.forEach(trait => {
                const effectPool = mbtiGradeEffects[trait];
                const selectedEffect = diceEngine.getRandomElement(effectPool);

                const finalEffect = { ...selectedEffect };
                finalEffect.value = this._getRandomValue(selectedEffect.value.min, selectedEffect.value.max);

                newItem.mbtiEffects.push(finalEffect);
            });
        }

        // --- ▼ [신규] 무작위 소켓 생성 로직 ▼ ---
        const socketCount = Math.round(diceEngine.rollWithAdvantage(1, 3, 1));
        for (let i = 0; i < socketCount; i++) {
            newItem.sockets.push(null);
        }

        debugLogEngine.log(this.name, `새 아이템 생성: [${newItem.name}] (ID: ${newItem.instanceId})`);
        console.log(newItem);
        return newItem;
    }

    /**
     * 최소값과 최대값 사이의 랜덤 정수를 반환하는 헬퍼 함수
     * @private
     */
    _getRandomValue(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export const itemFactory = new ItemFactory();
