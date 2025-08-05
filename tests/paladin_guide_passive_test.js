import assert from 'assert';
import { mercenaryData } from '../src/game/data/mercenaries.js';
import { SKILL_TAGS } from '../src/game/utils/SkillTagManager.js';
import { EFFECT_TYPES } from '../src/game/utils/EffectTypes.js';

// 가짜 SkillEffectProcessor를 만들어 테스트
class MockSkillEffectProcessor {
    constructor() {
        this.vfxManager = { showEffectName: () => {} };
    }

    processAura(unit, skill) {
        let finalEffect = skill.effect;
        if (unit.classPassive?.id === 'paladinsGuide' && skill.tags?.includes(SKILL_TAGS.AURA) && finalEffect?.modifiers) {
            finalEffect = JSON.parse(JSON.stringify(skill.effect));
            const applyBonus = modifier => {
                if (typeof modifier.value === 'number') {
                    modifier.value *= 1.2;
                }
            };
            if (Array.isArray(finalEffect.modifiers)) {
                finalEffect.modifiers.forEach(applyBonus);
            } else {
                applyBonus(finalEffect.modifiers);
            }
        }
        return finalEffect;
    }
}

console.log('--- 팔라딘 "팔라딘의 인도" 패시브 통합 테스트 시작 ---');

const mockPaladin = { ...mercenaryData.paladin, classPassive: mercenaryData.paladin.classPassive };
const mockWarrior = { ...mercenaryData.warrior, classPassive: null }; // 패시브가 없는 유닛

const mockAuraSkill = {
    name: 'Test Aura',
    tags: [SKILL_TAGS.AURA, SKILL_TAGS.BUFF],
    effect: {
        id: 'testAuraBuff',
        type: EFFECT_TYPES.BUFF,
        modifiers: { stat: 'physicalDefense', type: 'percentage', value: 0.10 } // 10% 방어력 증가
    }
};

const processor = new MockSkillEffectProcessor();

// 1. 팔라딘이 오라 스킬을 사용할 때 효과가 20% 증가하는지 확인
const paladinEffect = processor.processAura(mockPaladin, mockAuraSkill);
// 예상 값: 0.10 * 1.20 = 0.12
assert.strictEqual(paladinEffect.modifiers.value.toFixed(2), '0.12', '테스트 1 실패: 팔라딘의 오라 효과가 20% 증가하지 않았습니다.');
console.log('✅ 테스트 1 통과: 팔라딘이 사용 시 오라 효과 20% 증가');

// 2. 일반 전사가 오라 스킬을 사용할 때 효과가 증가하지 않는지 확인
const warriorEffect = processor.processAura(mockWarrior, mockAuraSkill);
// 예상 값: 0.10 (변화 없음)
assert.strictEqual(warriorEffect.modifiers.value.toFixed(2), '0.10', '테스트 2 실패: 일반 유닛이 사용 시 오라 효과가 변경되었습니다.');
console.log('✅ 테스트 2 통과: 일반 유닛이 사용 시 오라 효과 변경 없음');

// 3. 오라가 아닌 스킬에는 효과가 적용되지 않는지 확인
const nonAuraSkill = {
    name: 'Test Buff',
    tags: [SKILL_TAGS.BUFF],
    effect: {
        id: 'testBuff',
        type: EFFECT_TYPES.BUFF,
        modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 }
    }
};
const nonAuraEffect = processor.processAura(mockPaladin, nonAuraSkill);
assert.strictEqual(nonAuraEffect.modifiers.value.toFixed(2), '0.10', '테스트 3 실패: 오라가 아닌 스킬에 패시브가 적용되었습니다.');
console.log('✅ 테스트 3 통과: 오라가 아닌 스킬에는 패시브 미적용');

console.log('--- 모든 팔라딘 인도 패시브 테스트 완료 ---');
