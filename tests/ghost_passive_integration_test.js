import assert from 'assert';
import SkillEffectProcessor from '../src/game/utils/SkillEffectProcessor.js';
import { SKILL_TAGS } from '../src/game/utils/SkillTagManager.js';
import { mercenaryData } from '../src/game/data/mercenaries.js';
import { statusEffectManager } from '../src/game/utils/StatusEffectManager.js';
import { tokenEngine } from '../src/game/utils/TokenEngine.js';
import { combatCalculationEngine } from '../src/game/utils/CombatCalculationEngine.js';

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

console.log('--- 고스트 패시브 및 특화 통합 테스트 시작 ---');

// 1. 투명화 패시브 발동 테스트
const ghostTarget = {
    uniqueId: 1,
    ...mercenaryData.ghost,
    classPassive: mercenaryData.ghost.classPassive,
    finalStats: { hp: mercenaryData.ghost.baseStats.hp },
    currentHp: mercenaryData.ghost.baseStats.hp,
    currentBarrier: 0,
    sprite: { x: 0, y: 0 },
    cumulativeDamageTaken: 0,
};
const attacker = { uniqueId: 2, sprite: { x: 0, y: 0 } };
const dummySkill = { type: 'ACTIVE', tags: [] };

combatCalculationEngine.calculateDamage = () => ({ damage: Math.ceil(ghostTarget.finalStats.hp * 0.20), hitType: 'normal', comboCount: 0 });
await processor._processOffensiveSkill(attacker, ghostTarget, dummySkill);
let effects = statusEffectManager.activeEffects.get(ghostTarget.uniqueId) || [];
assert(effects.some(e => e.id === 'ghostingBuff'), '투명화 버프가 적용되어야 합니다.');
console.log('✅ 투명화 패시브 발동 테스트 통과');

// 2. 처형 특화 토큰 회복 테스트
statusEffectManager.activeEffects.clear();
const ghostAttacker = {
    uniqueId: 3,
    ...mercenaryData.ghost,
    finalStats: { hp: mercenaryData.ghost.baseStats.hp },
    currentHp: mercenaryData.ghost.baseStats.hp,
    currentBarrier: 0,
    sprite: { x: 0, y: 0 }
};
const victim = { uniqueId: 4, finalStats: { hp: 10 }, currentHp: 10, currentBarrier: 0, sprite: { x: 0, y: 0 } };
const executeSkill = { type: 'ACTIVE', tags: [SKILL_TAGS.EXECUTE] };

tokenEngine.initializeUnits([ghostAttacker]);
combatCalculationEngine.calculateDamage = () => ({ damage: 15, hitType: 'normal', comboCount: 0 });
await processor._processOffensiveSkill(ghostAttacker, victim, executeSkill);
const tokens = tokenEngine.getTokens(ghostAttacker.uniqueId);
assert.strictEqual(tokens, 1, '처형 특화 발동 시 토큰이 1개 회복되어야 합니다.');
console.log('✅ 처형 특화 토큰 회복 테스트 통과');

console.log('--- 모든 고스트 패시브 및 특화 테스트 완료 ---');
