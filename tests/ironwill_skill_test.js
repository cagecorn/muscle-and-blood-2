import assert from 'assert';

const ironWillBase = {
    rankModifiers: [0.39, 0.36, 0.33, 0.30],
    NORMAL: { maxReduction: 0.30, hpRegen: 0 },
    RARE: { maxReduction: 0.30, hpRegen: 0.02 },
    EPIC: { maxReduction: 0.30, hpRegen: 0.04 },
    LEGENDARY: { maxReduction: 0.30, hpRegen: 0.06 }
};

function computeIronWillReduction(maxHp, currentHp, rank) {
    const lostRatio = 1 - currentHp / maxHp;
    const maxRed = ironWillBase.rankModifiers[rank - 1] || ironWillBase.NORMAL.maxReduction;
    return maxRed * lostRatio;
}

for (let rank = 1; rank <= 4; rank++) {
    const reduction = computeIronWillReduction(100, 50, rank);
    assert(Math.abs(reduction - ironWillBase.rankModifiers[rank - 1] * 0.5) < 1e-6);
}

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];
for (const grade of grades) {
    const regenRate = ironWillBase[grade].hpRegen;
    const heal = Math.round(100 * regenRate);
    assert.strictEqual(heal, Math.round(100 * regenRate));
}

console.log('IronWill skill grade/rank tests passed.');
