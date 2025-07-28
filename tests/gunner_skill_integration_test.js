import assert from 'assert';
import { skillModifierEngine } from '../src/game/utils/SkillModifierEngine.js';
import { turnOrderManager } from '../src/game/utils/TurnOrderManager.js';
import { tokenEngine } from '../src/game/utils/TokenEngine.js';

const suppressShotBase = {
    NORMAL: { id: 'suppressShot', damageMultiplier: 0.8, turnOrderEffect: 'pushToBack' },
    RARE: { id: 'suppressShot', damageMultiplier: 1.0, turnOrderEffect: 'pushToBack' },
    EPIC: { id: 'suppressShot', damageMultiplier: 1.2, turnOrderEffect: 'pushToBack' },
    LEGENDARY: { id: 'suppressShot', damageMultiplier: 1.2, turnOrderEffect: 'pushToBack', effect: { tokenLoss: 1 } }
};

// --- ▼ [신규] 넉백샷 및 원거리 공격 테스트 데이터 추가 ▼ ---
const knockbackShotBase = {
    NORMAL: { id: 'knockbackShot', cost: 2, cooldown: 2, damageMultiplier: 0.8, push: 1 },
    RARE: { id: 'knockbackShot', cost: 2, cooldown: 1, damageMultiplier: 0.8, push: 1 },
    EPIC: { id: 'knockbackShot', cost: 1, cooldown: 1, damageMultiplier: 0.8, push: 1 },
    LEGENDARY: { id: 'knockbackShot', cost: 1, cooldown: 1, damageMultiplier: 0.8, push: 2 }
};

const rangedAttackBase = {
    NORMAL: { id: 'rangedAttack', cost: 1, cooldown: 0, damageMultiplier: 1.0 },
    RARE: { id: 'rangedAttack', cost: 0, cooldown: 0, damageMultiplier: 1.0 },
    EPIC: { id: 'rangedAttack', cost: 0, cooldown: 0, damageMultiplier: 1.0, generatesToken: { chance: 0.5, amount: 1 } },
    LEGENDARY: { id: 'rangedAttack', cost: 0, cooldown: 0, damageMultiplier: 1.0, generatesToken: { chance: 1.0, amount: 1 } }
};
// --- ▲ [신규] 넉백샷 및 원거리 공격 테스트 데이터 추가 ▲ ---

// --- ▼ [신규] 사냥꾼의 감각 테스트 데이터 추가 ▼ ---
const huntSenseBase = {
    NORMAL: {
        id: 'huntSense',
        cost: 2,
        cooldown: 4,
        effect: { duration: 3, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    },
    RARE: {
        id: 'huntSense',
        cost: 1,
        cooldown: 4,
        effect: { duration: 3, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    },
    EPIC: {
        id: 'huntSense',
        cost: 1,
        cooldown: 3,
        effect: { duration: 3, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    },
    LEGENDARY: {
        id: 'huntSense',
        cost: 1,
        cooldown: 3,
        effect: { duration: 4, modifiers: [ { stat: 'rangedAttack', type: 'flat', value: 1 }, { stat: 'criticalChance', type: 'percentage', value: 0.15 } ] }
    }
};
// --- ▲ [신규] 사냥꾼의 감각 테스트 데이터 추가 ▲ ---

const grades = ['NORMAL', 'RARE', 'EPIC', 'LEGENDARY'];

// 1. 데미지 계수 테스트
for (const grade of grades) {
    const skill = skillModifierEngine.getModifiedSkill(suppressShotBase[grade], 1, grade);
    assert.strictEqual(skill.damageMultiplier, suppressShotBase[grade].damageMultiplier, `Damage multiplier failed for grade ${grade}`);
}

// 2. 턴 순서 변경 테스트
let testQueue = [
    { uniqueId: 1, instanceName: 'A' },
    { uniqueId: 2, instanceName: 'B' },
    { uniqueId: 3, instanceName: 'C' }
];
const target = testQueue[1];
testQueue = turnOrderManager.pushToBack(testQueue, target);
assert.deepStrictEqual(testQueue.map(u => u.instanceName), ['A', 'C', 'B'], 'Turn order pushToBack failed');

// 3. 토큰 감소 효과 테스트
const testUnit = { uniqueId: 10, instanceName: 'TestDummy' };
tokenEngine.initializeUnits([testUnit]);
tokenEngine.addTokensForNewTurn();
assert.strictEqual(tokenEngine.getTokens(testUnit.uniqueId), 3, 'Initial token setup failed');

tokenEngine.spendTokens(testUnit.uniqueId, 1, '제압 사격 효과');
assert.strictEqual(tokenEngine.getTokens(testUnit.uniqueId), 2, 'Token loss effect failed');

// --- ▼ [신규] 넉백샷 테스트 로직 추가 ▼ ---
const knockbackExpectedDamage = [1.4, 1.2, 1.0, 0.8];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(knockbackShotBase[grade], rank, grade);
        assert.strictEqual(skill.damageMultiplier, knockbackExpectedDamage[rank - 1], `Knockback damage failed for ${grade} rank ${rank}`);

        const expectedCost = (grade === 'EPIC' || grade === 'LEGENDARY') ? 1 : 2;
        const expectedCooldown = grade === 'NORMAL' ? 2 : 1;
        const expectedPush = grade === 'LEGENDARY' ? 2 : 1;

        assert.strictEqual(skill.cost, expectedCost, `Knockback cost failed for ${grade}`);
        assert.strictEqual(skill.cooldown, expectedCooldown, `Knockback cooldown failed for ${grade}`);
        assert.strictEqual(skill.push, expectedPush, `Knockback push failed for ${grade}`);
    }
}
// --- ▲ [신규] 넉백샷 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 원거리 공격 테스트 로직 추가 ▼ ---
const rangedAttackExpectedDamage = [1.3, 1.2, 1.1, 1.0];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(rangedAttackBase[grade], rank, grade);
        assert.strictEqual(skill.damageMultiplier, rangedAttackExpectedDamage[rank - 1], `Ranged attack dmg failed for ${grade} rank ${rank}`);

        if (grade === 'NORMAL') {
            assert.strictEqual(skill.cost, 1, `Ranged attack cost failed for ${grade}`);
        } else {
            assert.strictEqual(skill.cost, 0, `Ranged attack cost failed for ${grade}`);
        }

        if (grade === 'EPIC') {
            assert(skill.generatesToken && skill.generatesToken.chance === 0.5, `Token generation failed for ${grade}`);
        } else if (grade === 'LEGENDARY') {
            assert(skill.generatesToken && skill.generatesToken.chance === 1.0, `Token generation failed for ${grade}`);
        } else {
            assert(!skill.generatesToken, `Unexpected token generation for ${grade}`);
        }
    }
}
// --- ▲ [신규] 원거리 공격 테스트 로직 추가 ▲ ---

// --- ▼ [신규] 사냥꾼의 감각 테스트 로직 추가 ▼ ---
const huntSenseExpectedCrit = [0.30, 0.25, 0.20, 0.15];
for (const grade of grades) {
    for (let rank = 1; rank <= 4; rank++) {
        const skill = skillModifierEngine.getModifiedSkill(huntSenseBase[grade], rank, grade);
        const critMod = skill.effect.modifiers.find(m => m.stat === 'criticalChance');
        const rangedMod = skill.effect.modifiers.find(m => m.stat === 'rangedAttack');

        assert.strictEqual(skill.cost, huntSenseBase[grade].cost, `Hunt Sense cost failed for grade ${grade}`);
        assert.strictEqual(skill.cooldown, huntSenseBase[grade].cooldown, `Hunt Sense cooldown failed for grade ${grade}`);
        assert.strictEqual(skill.effect.duration, huntSenseBase[grade].effect.duration, `Hunt Sense duration failed for grade ${grade}`);
        assert(rangedMod && rangedMod.value === 1, `Ranged attack modifier failed for grade ${grade}`);
        assert(Math.abs(critMod.value - huntSenseExpectedCrit[rank - 1]) < 1e-6, `Crit chance modifier failed for grade ${grade} rank ${rank}`);
    }
}
// --- ▲ [신규] 사냥꾼의 감각 테스트 로직 추가 ▲ ---

console.log('Gunner skills integration test passed.');
