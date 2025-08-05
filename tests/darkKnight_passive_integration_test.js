import assert from 'assert';
import './setup-indexeddb.js';
import SkillEffectProcessor from '../src/game/utils/SkillEffectProcessor.js';
import { SKILL_TAGS } from '../src/game/utils/SkillTagManager.js';
import { mercenaryData } from '../src/game/data/mercenaries.js';
import { statusEffectManager } from '../src/game/utils/StatusEffectManager.js';

class StubVFX {
    createDamageNumber() {}
    showEffectName() {}
    showComboCount() {}
    createBloodSplatter() {}
}

const stubEngines = {
    vfxManager: new StubVFX(),
    animationEngine: { attack: async () => {} },
    terminationManager: { handleUnitDeath: () => {} },
    summoningEngine: { getSummons: () => new Set() },
    battleSimulator: { turnQueue: [] }
};

statusEffectManager.setBattleSimulator(stubEngines.battleSimulator);
const processor = new SkillEffectProcessor(stubEngines);

console.log('--- 다크나이트 패시브 및 특화 통합 테스트 시작 ---');

// 1. 절망의 오라 디버프 적용 테스트
const darkKnight = {
    uniqueId: 1,
    ...mercenaryData.darkKnight,
    instanceName: '다크나이트',
    sprite: { x: 0, y: 0 }
};
const enemy = { uniqueId: 2, instanceName: '적 유닛', sprite: { x: 0, y: 0 } };
statusEffectManager.addEffect(enemy, darkKnight.classPassive, darkKnight);
let debuff = statusEffectManager.getModifierValue(enemy, 'physicalAttackPercentage');
assert.strictEqual(debuff, -0.05, '물리 공격력 5% 감소가 적용되어야 합니다.');
console.log('✅ 절망의 오라 디버프 적용 테스트 통과');

// 2. 어둠 특화 보너스 테스트
statusEffectManager.activeEffects.clear();
const darkSkill = { type: 'ACTIVE', tags: [SKILL_TAGS.DARK] };
processor._applySpecializationBonuses(darkKnight, darkSkill);
const lifeStealBonus = statusEffectManager.getModifierValue(darkKnight, 'lifeSteal');
assert.strictEqual(lifeStealBonus, 0.05, '어둠 특화 보너스로 생명력 흡수율 5% 증가해야 합니다.');
console.log('✅ 어둠 특화 보너스 테스트 통과');

console.log('--- 모든 다크나이트 패시브 및 특화 테스트 완료 ---');
