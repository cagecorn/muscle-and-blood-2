import assert from 'assert';
import { combatCalculationEngine } from '../src/game/utils/CombatCalculationEngine.js';
import { mercenaryData } from '../src/game/data/mercenaries.js';

console.log('--- 팔라딘 패시브 통합 테스트 시작 ---');

// Mock 객체 설정
const mockAttacker = {
    uniqueId: 1,
    finalStats: { physicalAttack: 20 },
};
const mockDefender = {
    uniqueId: 2,
    team: 'ally',
    gridX: 5,
    gridY: 5,
    finalStats: { physicalDefense: 0 },
    currentHp: 100,
};
const mockPaladin = {
    uniqueId: 3,
    team: 'ally',
    gridX: 8,
    gridY: 8, // 초기에는 멀리 떨어져 있어 오라가 적용되지 않습니다.
    classPassive: mercenaryData.paladin.classPassive,
    currentHp: 100,
};

// 가짜 BattleSimulator 참조 설정
combatCalculationEngine.battleSimulator = {
    turnQueue: [mockAttacker, mockDefender, mockPaladin]
};

// 1. 팔라딘이 멀리 있을 때의 기본 데미지 계산
let result = combatCalculationEngine.calculateDamage(mockAttacker, mockDefender, { damageMultiplier: 1.0 });
assert.strictEqual(result.damage, 20, '테스트 1 실패: 팔라딘이 멀리 있을 때 기본 데미지가 20이어야 합니다.');
console.log('✅ 테스트 1 통과: 팔라딘이 멀리 있을 때 정상 데미지 적용');

// 2. 팔라딘이 주변에 있을 때 데미지 감소 확인
mockPaladin.gridX = 5;
mockPaladin.gridY = 6; // 1칸 거리
result = combatCalculationEngine.calculateDamage(mockAttacker, mockDefender, { damageMultiplier: 1.0 });
// 예상 데미지: 20 * (1 - 0.10) = 18
assert.strictEqual(result.damage, 18, '테스트 2 실패: 팔라딘 오라의 피해량 감소(10%)가 적용되지 않았습니다.');
console.log('✅ 테스트 2 통과: 팔라딘 오라로 피해량 10% 감소');

// 3. 팔라딘이 너무 멀리 있을 때 효과 미적용 확인
mockPaladin.gridX = 8;
mockPaladin.gridY = 5; // 3칸 거리
result = combatCalculationEngine.calculateDamage(mockAttacker, mockDefender, { damageMultiplier: 1.0 });
assert.strictEqual(result.damage, 20, '테스트 3 실패: 팔라딘이 멀리 있을 때 오라가 적용되었습니다.');
console.log('✅ 테스트 3 통과: 거리가 멀 때 오라 미적용');

// 참조 초기화
combatCalculationEngine.battleSimulator = null;

console.log('--- 모든 팔라딘 패시브 테스트 완료 ---');
