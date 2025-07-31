import { itemBaseData, itemAffixes } from '../data/items.js';
import { uniqueIDManager } from './UniqueIDManager.js';
import { diceEngine } from './DiceEngine.js';
import { debugLogEngine } from './DebugLogEngine.js';

/**
 * 아이템 데이터를 기반으로 고유한 아이템 인스턴스를 생성하는 공장 클래스
 */
class ItemFactory {
    constructor() {
        this.name = 'ItemFactory';
        debugLogEngine.register(this);
    }

    /**
     * 지정된 ID의 기본 아이템에 무작위 접두사/접미사를 붙여 새로운 아이템을 생성합니다.
     * @param {string} baseItemId - 생성할 아이템의 ID
     * @returns {object|null} - 생성된 아이템 인스턴스 또는 null
     */
    createItem(baseItemId) {
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
            name: `${prefix.name} ${baseData.name} ${suffix.name}`,
            type: baseData.type,
            illustrationPath: baseData.illustrationPath,
            stats: {},
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

        debugLogEngine.log(this.name, `새 아이템 생성: [${newItem.name}] (ID: ${newItem.instanceId})`);
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
