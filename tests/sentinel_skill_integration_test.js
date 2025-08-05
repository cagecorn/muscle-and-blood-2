import assert from 'assert';
import { mercenaryData } from '../src/game/data/mercenaries.js';
import { statEngine } from '../src/game/utils/StatEngine.js';
import { statusEffectManager } from '../src/game/utils/StatusEffectManager.js';
import { EFFECT_TYPES } from '../src/game/utils/EffectTypes.js';

console.log('--- 센티넬 클래스 통합 테스트 시작 ---');

// 1. 기본 데이터 및 스탯 검증
const sentinelBase = mercenaryData.sentinel;
assert(sentinelBase, '센티넬 기본 데이터가 존재해야 합니다.');

const finalStats = statEngine.calculateStats(sentinelBase, sentinelBase.baseStats, []);
assert.strictEqual(finalStats.movement, 3, '이동 거리가 3이어야 합니다.');
assert.strictEqual(finalStats.attackRange, 1, '공격 사거리가 1이어야 합니다.');
assert(finalStats.physicalDefense > 18, '물리 방어력이 높아야 합니다.'); // 15 * 1.2 = 18

console.log('✅ 기본 스탯 테스트 통과');

// 2. 클래스 패시브("전방 주시") 로직 검증
const sentinel = {
    uniqueId: 1,
    ...sentinelBase
};
const attacker = {
    uniqueId: 2,
    instanceName: 'Test Attacker'
};

// 가짜 공격 상황 시뮬레이션 (실제로는 BattleSimulatorEngine에서 처리)
const passiveEffect = sentinel.classPassive.effect;
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);

let attackerEffects = statusEffectManager.activeEffects.get(attacker.uniqueId) || [];
assert.strictEqual(attackerEffects.length, 1, '전방 주시 디버프가 적용되어야 합니다.');
assert.strictEqual(attackerEffects[0].id, 'sentryDutyDebuff', '디버프 ID가 올바해야 합니다.');

// 스택 중첩 테스트
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel);
statusEffectManager.addEffect(attacker, { name: sentinel.classPassive.name, effect: passiveEffect }, sentinel); // 4번째, 중첩 안되어야 함

attackerEffects = statusEffectManager.activeEffects.get(attacker.uniqueId) || [];
// 참고: 현재 StatusEffectManager는 스택을 별도로 관리하지 않고 덮어쓰므로, 길이는 1이 됩니다.
// 스택킹 로직은 CombatCalculationEngine에서 처리됩니다. 이 테스트는 디버프 적용 여부만 확인합니다.
assert.strictEqual(attackerEffects.length, 1, '디버프는 중첩되어도 하나만 존재해야 합니다.');

console.log('✅ 클래스 패시브 테스트 통과');
console.log('--- 모든 센티넬 테스트 완료 ---');
