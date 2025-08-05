import assert from 'assert';
import { combatCalculationEngine } from '../src/game/utils/CombatCalculationEngine.js';
import { SKILL_TAGS } from '../src/game/utils/SkillTagManager.js';
import { comboManager } from '../src/game/utils/ComboManager.js';

const attacker = {
    team: 'A',
    classPassive: { id: 'bravery' },
    gridX: 0,
    gridY: 0,
    finalStats: { physicalAttack: 100, physicalDefense: 0, hp: 100 },
    currentHp: 100,
    currentBarrier: 0,
    maxBarrier: 0,
    instanceName: 'Attacker',
};

const defender = {
    team: 'B',
    gridX: 1,
    gridY: 0,
    finalStats: { physicalDefense: 0, hp: 100 },
    currentHp: 100,
    currentBarrier: 0,
    maxBarrier: 0,
    instanceName: 'Defender',
};

const skill = {
    type: 'ACTIVE',
    tags: [SKILL_TAGS.PHYSICAL],
    damageMultiplier: 1,
    cost: 0,
    cooldown: 0,
};

combatCalculationEngine.battleSimulator = { turnQueue: [attacker, defender] };
comboManager.startTurn(attacker.uniqueId);
const resultNear = combatCalculationEngine.calculateDamage(attacker, defender, skill);

// 멀리 떨어졌을 때
combatCalculationEngine.battleSimulator.turnQueue[1].gridX = 10;
combatCalculationEngine.battleSimulator.turnQueue[1].gridY = 10;
comboManager.startTurn(attacker.uniqueId);
const resultFar = combatCalculationEngine.calculateDamage(attacker, defender, skill);

assert(resultNear.damage > resultFar.damage);
const ratio = resultNear.damage / resultFar.damage;
assert(Math.abs(ratio - 1.04) < 0.01);
console.log('Bravery passive test passed.');
