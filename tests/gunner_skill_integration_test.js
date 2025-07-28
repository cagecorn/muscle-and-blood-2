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

console.log('Gunner skill [Suppress Shot] integration test passed.');
