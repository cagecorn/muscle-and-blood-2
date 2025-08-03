import assert from 'assert';
import { statEngine } from '../src/game/utils/StatEngine.js';
import { statusEffectManager } from '../src/game/utils/StatusEffectManager.js';
import { EFFECT_TYPES } from '../src/game/utils/EffectTypes.js';

// 클라운 유닛과 주변 유닛을 설정합니다.
const clown = {
    uniqueId: 'clown1',
    gridX: 0,
    gridY: 0,
    currentHp: 10,
    classPassive: { id: 'clownsJoke' }
};
const ally = { uniqueId: 'ally1', gridX: 1, gridY: 0, currentHp: 10 };
const enemy = { uniqueId: 'enemy1', gridX: 2, gridY: 0, currentHp: 10 };

statusEffectManager.activeEffects.set('ally1', [{ id: 'testDebuff', type: EFFECT_TYPES.DEBUFF }]);
statusEffectManager.activeEffects.set('enemy1', [{ id: 'testDebuff', type: EFFECT_TYPES.DEBUFF }]);

statEngine.handleTurnStartPassives(clown, [clown, ally, enemy]);

const clownEffects = statusEffectManager.activeEffects.get('clown1') || [];
const buff = clownEffects.find(e => e.id === 'clownsJokeBuff');
assert(buff, 'clownsJokeBuff should be applied to the clown');
assert.strictEqual(buff.duration, 1);
const critMod = buff.modifiers.find(m => m.stat === 'criticalChance');
assert(critMod && critMod.value === 0.1);

console.log('Clown passive integration test passed.');
