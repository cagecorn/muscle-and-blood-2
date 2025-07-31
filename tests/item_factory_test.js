import assert from 'assert';
import { itemFactory } from '../src/game/utils/ItemFactory.js';
import { itemBaseData, itemAffixes } from '../src/game/data/items.js';

const prefixNames = itemAffixes.prefixes.map(p => p.name);
const suffixNames = itemAffixes.suffixes.map(s => s.name);
const baseRange = itemBaseData.baseballBat.baseStats.physicalAttack;

for (let i = 0; i < 5; i++) {
    const item = itemFactory.createItem('baseballBat');

    // 등급 태그를 제거한 뒤 접두사, 접미사 확인
    const cleanedName = item.name.replace(/^\[[^\]]+\]\s*/, '');
    const hasPrefix = prefixNames.some(name => cleanedName.startsWith(name));
    const hasSuffix = suffixNames.some(name => cleanedName.endsWith(name));
    assert(hasPrefix && hasSuffix, 'Prefix or suffix missing in item name');

    // 기본 스탯 범위 검증
    assert(item.stats.physicalAttack >= baseRange.min && item.stats.physicalAttack <= baseRange.max,
        'Base stat out of range');

    // 접두사와 접미사 스탯 적용 확인
    const prefixData = itemAffixes.prefixes.find(p => cleanedName.startsWith(p.name));
    const suffixData = itemAffixes.suffixes.find(s => cleanedName.endsWith(s.name));
    const prefixKey = prefixData.isPercentage ? `${prefixData.stat}Percentage` : prefixData.stat;
    const suffixKey = suffixData.isPercentage ? `${suffixData.stat}Percentage` : suffixData.stat;

    assert(item.stats[prefixKey] >= prefixData.value.min && item.stats[prefixKey] <= prefixData.value.max,
        'Prefix stat out of range');
    assert(item.stats[suffixKey] >= suffixData.value.min && item.stats[suffixKey] <= suffixData.value.max,
        'Suffix stat out of range');

    // MBTI 효과 및 등급 확인
    assert.strictEqual(item.grade, 'NORMAL');
    assert.strictEqual(item.mbtiEffects.length, 1);
}

console.log('Item factory tests passed.');
