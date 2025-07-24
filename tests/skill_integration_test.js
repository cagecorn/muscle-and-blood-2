import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';
import { skillEngine } from '../src/game/utils/SkillEngine.js';
import { tokenEngine } from '../src/game/utils/TokenEngine.js';
import { cooldownManager } from '../src/game/utils/CooldownManager.js';

// Minimal skill data definitions to avoid circular imports
const chargeBase = {
    id: 'charge',
    name: '차지',
    type: 'ACTIVE',
    cost: 2,
    cooldown: 3,
    damageMultiplier: 0.8,
    range: 1,
    effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 }
};

const stoneSkinBase = {
    id: 'stoneSkin',
    name: '스톤 스킨',
    type: 'BUFF',
    cost: 2,
    cooldown: 3,
    effect: { id: 'stoneSkin', type: 'BUFF', duration: 4, modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.15 } }
};

const shieldBreakBase = {
    id: 'shieldBreak',
    name: '쉴드 브레이크',
    type: 'DEBUFF',
    cost: 2,
    cooldown: 2,
    effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } }
};

const ironWillBase = {
    id: 'ironWill',
    name: '아이언 윌',
    type: 'PASSIVE',
    cost: 0,
    rankModifiers: [0.39, 0.36, 0.33, 0.30],
    NORMAL: { maxReduction: 0.30, hpRegen: 0 }
};

const soldier = { uniqueId: 1, instanceName: 'TestWarrior', finalStats: { hp: 100 }, currentHp: 100 };
const enemy = { uniqueId: 2, instanceName: 'Dummy', finalStats: { hp: 100 }, currentHp: 100 };

const soldierEffects = [];
const enemyEffects = [];
let firstStoneSkin = null;
let firstShieldBreak = null;

tokenEngine.initializeUnits([soldier, enemy]);
cooldownManager.reset();

const baseSkills = [
    { data: chargeBase, target: enemy },
    { data: stoneSkinBase, target: soldier },
    { data: shieldBreakBase, target: enemy },
    { data: ironWillBase, target: soldier }
];

const rankedSkills = baseSkills.map((entry, idx) => {
    const rank = idx + 1;
    const modified = skillModifierEngine.getModifiedSkill(entry.data, rank, 'NORMAL');
    return { ...modified, target: entry.target, rank };
});

const usedOrder = [];
const tokenHistory = [];

for (let turn = 1; turn <= 5; turn++) {
    skillEngine.resetTurnActions();
    tokenEngine.addTokensForNewTurn();

    for (const skill of rankedSkills) {
        if (skill.type === 'PASSIVE') continue;
        if (skillEngine.canUseSkill(soldier, skill)) {
            skillEngine.recordSkillUse(soldier, skill);
            if (skill.effect) {
                const effectCopy = JSON.parse(JSON.stringify(skill.effect));
                effectCopy.remaining = effectCopy.duration;
                if (skill.id === 'stoneSkin' && !firstStoneSkin) firstStoneSkin = effectCopy;
                if (skill.id === 'shieldBreak' && !firstShieldBreak) firstShieldBreak = effectCopy;
                (skill.target === soldier ? soldierEffects : enemyEffects).push(effectCopy);
            }
            usedOrder.push(skill.id);
            break;
        }
    }

    tokenHistory.push(tokenEngine.getTokens(soldier.uniqueId));
    cooldownManager.reduceCooldowns(soldier.uniqueId);

    for (const list of [soldierEffects, enemyEffects]) {
        for (let i = list.length - 1; i >= 0; i--) {
            const e = list[i];
            e.remaining -= 1;
            if (e.remaining <= 0) list.splice(i, 1);
        }
    }
}

assert.deepStrictEqual(usedOrder, ['charge', 'stoneSkin', 'shieldBreak', 'charge', 'stoneSkin']);
assert(tokenHistory.every(t => t === 1));

assert(firstStoneSkin && Math.abs((firstStoneSkin.modifiers.value ?? firstStoneSkin.modifiers.find(m => m.stat === 'damageReduction').value) - 0.21) < 1e-6);
assert(firstShieldBreak && Math.abs((firstShieldBreak.modifiers.value ?? firstShieldBreak.modifiers.find(m => m.stat === 'damageIncrease').value) - 0.18) < 1e-6);

function computeIronWillReduction(unit, rank) {
    const maxReduction = ironWillBase.rankModifiers[rank - 1] || ironWillBase.NORMAL.maxReduction;
    const lostHpRatio = 1 - (unit.currentHp / unit.finalStats.hp);
    return maxReduction * lostHpRatio;
}

soldier.currentHp = 50;
assert(Math.abs(computeIronWillReduction(soldier, 4) - 0.15) < 1e-6);

console.log('Integration test passed.');
