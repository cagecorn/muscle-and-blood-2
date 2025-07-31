import assert from 'assert';
import { itemFactory } from '../src/game/utils/ItemFactory.js';
import { itemBaseData, itemAffixes } from '../src/game/data/items.js';

const prefixNames = itemAffixes.prefixes.map(p => p.name);
const suffixNames = itemAffixes.suffixes.map(s => s.name);
const baseRange = itemBaseData.baseballBat.baseStats.physicalAttack;

for (let i = 0; i < 5; i++) {
    const item = itemFactory.createItem('baseballBat');

    // 이름에 접두사와 접미사가 포함되어 있는지 확인
    const hasPrefix = prefixNames.some(name => item.name.startsWith(name));
    const hasSuffix = suffixNames.some(name => item.name.endsWith(name));
    assert(hasPrefix && hasSuffix, 'Prefix or suffix missing in item name');

    // 기본 스탯 범위 검증
    assert(item.stats.physicalAttack >= baseRange.min && item.stats.physicalAttack <= baseRange.max,
        'Base stat out of range');

    // 접두사와 접미사 스탯 적용 확인
    const prefixData = itemAffixes.prefixes.find(p => item.name.startsWith(p.name));
    const suffixData = itemAffixes.suffixes.find(s => item.name.endsWith(s.name));
    const prefixKey = prefixData.isPercentage ? `${prefixData.stat}Percentage` : prefixData.stat;
    const suffixKey = suffixData.isPercentage ? `${suffixData.stat}Percentage` : suffixData.stat;

    assert(item.stats[prefixKey] >= prefixData.value.min && item.stats[prefixKey] <= prefixData.value.max,
        'Prefix stat out of range');
    assert(item.stats[suffixKey] >= suffixData.value.min && item.stats[suffixKey] <= suffixData.value.max,
        'Suffix stat out of range');
}

console.log('Item factory tests passed.');
