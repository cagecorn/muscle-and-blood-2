import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';
import { skillEngine } from '../src/game/utils/SkillEngine.js';
import { tokenEngine } from '../src/game/utils/TokenEngine.js';
import { cooldownManager } from '../src/game/utils/CooldownManager.js';

// ------- Base Skill Data -------
const attackBase = {
    NORMAL: { id: 'attack', type: 'ACTIVE', cost: 1, cooldown: 0, damageMultiplier: 1.0 },
    RARE: { id: 'attack', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: 1.0 },
    EPIC: { id: 'attack', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: 1.0, generatesToken: { chance: 0.5, amount: 1 } },
    LEGENDARY: { id: 'attack', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: 1.0, generatesToken: { chance: 1.0, amount: 1 } }
};

const chargeBase = {
    NORMAL: { id: 'charge', type: 'ACTIVE', cost: 2, cooldown: 3, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    RARE: { id: 'charge', type: 'ACTIVE', cost: 2, cooldown: 2, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    EPIC: { id: 'charge', type: 'ACTIVE', cost: 1, cooldown: 2, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 1 } },
    LEGENDARY: { id: 'charge', type: 'ACTIVE', cost: 1, cooldown: 2, damageMultiplier: 0.8, effect: { id: 'stun', type: 'STATUS_EFFECT', duration: 2 } }
};

const stoneSkinBase = {
    NORMAL: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 2,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.15 }
        }
    },
    RARE: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 1,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: { stat: 'damageReduction', type: 'percentage', value: 0.15 }
        }
    },
    EPIC: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 1,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: [
                { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                { stat: 'physicalDefense', type: 'percentage', value: 0.10 }
            ]
        }
    },
    LEGENDARY: {
        id: 'stoneSkin',
        type: 'BUFF',
        cost: 1,
        cooldown: 3,
        generatesResource: { type: 'EARTH', amount: 1 },
        effect: {
            id: 'stoneSkin',
            type: 'BUFF',
            duration: 4,
            modifiers: [
                { stat: 'damageReduction', type: 'percentage', value: 0.15 },
                { stat: 'physicalDefense', type: 'percentage', value: 0.15 }
            ]
        }
    }
};

const shieldBreakBase = {
    NORMAL: { id: 'shieldBreak', type: 'DEBUFF', cost: 2, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } } },
    RARE: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: { stat: 'damageIncrease', type: 'percentage', value: 0.15 } } },
    EPIC: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: [ { stat: 'damageIncrease', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: -0.05 } ] } },
    LEGENDARY: { id: 'shieldBreak', type: 'DEBUFF', cost: 1, cooldown: 2, effect: { id: 'shieldBreak', type: 'DEBUFF', duration: 3, modifiers: [ { stat: 'damageIncrease', type: 'percentage', value: 0.15 }, { stat: 'physicalDefense', type: 'percentage', value: -0.10 } ] } }
};

const grindstoneBase = {
    NORMAL: {
        id: 'grindstone', type: 'BUFF', cost: 1, cooldown: 2, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 1 }
    },
    RARE: {
        id: 'grindstone', type: 'BUFF', cost: 1, cooldown: 1, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 1 }
    },
    EPIC: {
        id: 'grindstone', type: 'BUFF', cost: 0, cooldown: 1, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 1 }
    },
    LEGENDARY: {
        id: 'grindstone', type: 'BUFF', cost: 0, cooldown: 1, effect: { id: 'grindstoneBuff', type: 'BUFF', duration: 1, modifiers: { stat: 'physicalAttack', type: 'percentage', value: 0.10 } }, generatesResource: { type: 'IRON', amount: 2 }
    }
};

const throwingAxeBase = {
    NORMAL: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 1, damageMultiplier: 1.2, resourceCost: { type: 'IRON', amount: 1 }
    },
    RARE: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: 1.2, resourceCost: { type: 'IRON', amount: 1 }
    },
    EPIC: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: 1.2, resourceCost: { type: 'IRON', amount: 1 }, effect: { type: 'STATUS_EFFECT', id: 'stun', duration: 1, chance: 0.2 }
    },
    LEGENDARY: {
        id: 'throwingAxe', type: 'ACTIVE', cost: 0, cooldown: 0, damageMultiplier: 1.2, resourceCost: { type: 'IRON', amount: 1 }, effect: { type: 'STATUS_EFFECT', id: 'stun', duration: 1, chance: 0.4 }
    }
};

const ironWillBase = {
    rankModifiers: [0.39, 0.36, 0.33, 0.30],
    NORMAL: { maxReduction: 0.30, hpRegen: 0 },
    RARE: { maxReduction: 0.30, hpRegen: 0.02 },
    EPIC: { maxReduction: 0.30, hpRegen: 0.04 },
    LEGENDARY: { maxReduction: 0.30, hpRegen: 0.06 }
};

// ------- Grade/Rank Tests -------
const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

// Attack
const attackExpectedDamage = [1.3, 1.2, 1.1, 1.0];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(attackBase[grade], rank, grade);
        assert.strictEqual(skill.damageMultiplier, attackExpectedDamage[rank - 1]);
        if (grade === 'NORMAL') {
            assert.strictEqual(skill.cost, 1);
        } else {
            assert.strictEqual(skill.cost, 0);
        }
        if (grade === 'EPIC') {
            assert(skill.generatesToken && skill.generatesToken.chance === 0.5);
        } else if (grade === 'LEGENDARY') {
            assert(skill.generatesToken && skill.generatesToken.chance === 1.0);
        } else {
            assert(!skill.generatesToken);
        }
    }
}

// Charge
const chargeExpectedDamage = [1.5, 1.2, 1.0, 0.8];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(chargeBase[grade], rank, grade);
        assert.strictEqual(skill.damageMultiplier, chargeExpectedDamage[rank - 1]);
        const expectedDuration = rank === 1 ? 1 : (grade === 'LEGENDARY' ? 2 : 1);
        assert.strictEqual(skill.effect.duration, expectedDuration);
    }
}

// Stone Skin
const stoneSkinExpectedReduction = [0.24, 0.21, 0.18, 0.15];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(stoneSkinBase[grade], rank, grade);
        const mods = skill.effect.modifiers;
        const reduction = Array.isArray(mods) ? mods.find(m => m.stat === 'damageReduction').value : mods.value;
        assert(Math.abs(reduction - stoneSkinExpectedReduction[rank - 1]) < 1e-6);
        if (grade === 'EPIC') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value - 0.10) < 1e-6);
        } else if (grade === 'LEGENDARY') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value - 0.15) < 1e-6);
        } else if (Array.isArray(mods)) {
            assert(!mods.some(m => m.stat === 'physicalDefense'));
        }
    }
}

// Shield Break
const shieldBreakExpectedIncrease = [0.24, 0.21, 0.18, 0.15];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(shieldBreakBase[grade], rank, grade);
        const mods = skill.effect.modifiers;
        const increase = Array.isArray(mods) ? mods.find(m => m.stat === 'damageIncrease').value : mods.value;
        assert(Math.abs(increase - shieldBreakExpectedIncrease[rank - 1]) < 1e-6);
        if (grade === 'EPIC') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value + 0.05) < 1e-6);
        } else if (grade === 'LEGENDARY') {
            const pd = mods.find(m => m.stat === 'physicalDefense');
            assert(pd && Math.abs(pd.value + 0.10) < 1e-6);
        } else if (Array.isArray(mods)) {
            assert(!mods.some(m => m.stat === 'physicalDefense'));
        }
    }
}

// Iron Will
function computeIronWillReduction(unit, rank) {
    const maxReduction = ironWillBase.rankModifiers[rank - 1] || ironWillBase.NORMAL.maxReduction;
    const lostRatio = 1 - (unit.currentHp / unit.finalStats.hp);
    return maxReduction * lostRatio;
}

for (let rank = 1; rank <= 4; rank++) {
    const testUnit = { finalStats: { hp: 100 }, currentHp: 50 };
    const reduction = computeIronWillReduction(testUnit, rank);
    assert(Math.abs(reduction - ironWillBase.rankModifiers[rank - 1] * 0.5) < 1e-6);
}

for (const grade of grades) {
    assert.strictEqual(typeof ironWillBase[grade].hpRegen, 'number');
}

// Grindstone
const grindstoneExpected = [0.25, 0.20, 0.15, 0.10];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(grindstoneBase[grade], rank, grade);
        const value = skill.effect.modifiers.value;
        assert(Math.abs(value - grindstoneExpected[rank - 1]) < 1e-6);
    }
}

// Throwing Axe
const throwingAxeExpected = [1.2, 1.2, 1.2, 1.2];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(throwingAxeBase[grade], rank, grade);
        assert.strictEqual(skill.damageMultiplier, throwingAxeExpected[rank - 1]);
    }
}

// ------- Skill Usage Integration Test -------
const soldier = { uniqueId: 1, instanceName: 'TestWarrior', finalStats: { hp: 100 }, currentHp: 100 };
const enemy = { uniqueId: 2, instanceName: 'Dummy', finalStats: { hp: 100 }, currentHp: 100 };

const soldierEffects = [];
const enemyEffects = [];
let firstStoneSkin = null;
let firstShieldBreak = null;

// Initialize token and cooldown systems
tokenEngine.initializeUnits([soldier, enemy]);
cooldownManager.reset();

const baseSkills = [
    { data: chargeBase.NORMAL, target: enemy },
    { data: stoneSkinBase.NORMAL, target: soldier },
    { data: shieldBreakBase.NORMAL, target: enemy },
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

console.log('Warrior skill integration test passed.');
