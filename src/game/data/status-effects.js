import { statusEffectManager } from "../utils/StatusEffectManager.js";
import { stackManager } from "../utils/StackManager.js";
import { FIXED_DAMAGE_TYPES } from "../utils/FixedDamageManager.js";

/**
 * 모든 상태 효과의 정의를 담는 데이터베이스입니다.
 * StatusEffectManager는 이 데이터를 참조하여 효과를 적용하고 해제합니다.
 */
export const statusEffects = {
    stun: {
        id: 'stun',
        name: '기절',
        description: '이동, 공격, 스킬 사용이 불가능한 상태가 됩니다.',
        iconPath: 'assets/images/status-effects/stun.png',
        onApply: (unit) => {
            console.log(`${unit.instanceName}이(가) 기절했습니다!`);
            unit.isStunned = true;
        },
        onRemove: (unit) => {
            console.log(`${unit.instanceName}의 기절 효과 중 하나가 해제됩니다.`);
            // 현재 유닛에게 적용된 다른 'stun' 효과가 있는지 확인합니다.
            const remainingStuns = (statusEffectManager.activeEffects.get(unit.uniqueId) || [])
                .filter(effect => effect.id === 'stun').length;

            // 남아있는 기절 효과가 없다면, 그때 상태를 해제합니다.
            if (remainingStuns === 0) {
                console.log(`${unit.instanceName}의 모든 기절이 풀렸습니다.`);
                unit.isStunned = false;
                unit.justRecoveredFromStun = true;
            } else {
                console.log(`${unit.instanceName}에게 아직 ${remainingStuns}개의 기절 효과가 남아있습니다.`);
            }
        },
    },
    // ✨ [신규] 이동력 감소(slow) 및 속박(bind) 효과 추가
    slow: {
        id: 'slow',
        name: '둔화',
        description: '이동력이 감소합니다.',
        iconPath: 'assets/images/status-effects/slow.png',
    },
    bind: {
        id: 'bind',
        name: '속박',
        description: '이동할 수 없습니다.',
        iconPath: 'assets/images/status-effects/bind.png',
        onApply: (unit) => {
            unit.isBound = true;
        },
        onRemove: (unit) => {
            unit.isBound = false;
        },
    },
    // 전투의 함성: 일시적으로 근접 공격 등급을 상승시킵니다.
    battleCryBuff: {
        id: 'battleCryBuff',
        name: '전투의 함성',
        iconPath: 'assets/images/skills/battle_cry.png',
        // 등급 보정치 예시: 근접 공격 등급 +1
        modifiers: { stat: 'meleeAttack', type: 'flat', value: 1 }
    },
    // ✨ 스톤 스킨 효과 추가
    stoneSkin: {
        id: 'stoneSkin',
        name: '스톤 스킨',
        iconPath: 'assets/images/skills/ston-skin.png',
    },
    // ✨ 쉴드 브레이크 효과 추가
    shieldBreak: {
        id: 'shieldBreak',
        name: '쉴드 브레이크',
        iconPath: 'assets/images/skills/shield-break.png',
    },
    // ✨ 아이언 윌 효과 추가
    ironWill: {
        id: 'ironWill',
        name: '아이언 윌',
        iconPath: 'assets/images/skills/iron_will.png',
    },
    // ✨ 돌격 명령 버프 추가
    chargeOrderBuff: {
        id: 'chargeOrderBuff',
        name: '돌격 명령',
        iconPath: 'assets/images/skills/charge-order.png',
    },
    // ✨ 숯돌 갈기 버프 추가
    grindstoneBuff: {
        id: 'grindstoneBuff',
        name: '숯돌 갈기',
        iconPath: 'assets/images/skills/grindstone.png',
    },
    // 치료 불가 디버프
    stigma: {
        id: 'stigma',
        name: '낙인',
        description: '지원(AID) 스킬의 효과를 받을 수 없습니다.',
        iconPath: 'assets/images/skills/stigma.png',
        onApply: (unit) => {
            unit.isHealingProhibited = true;
            console.log(`${unit.instanceName}에게 [치료 금지] 효과가 적용됩니다.`);
        },
        onRemove: (unit) => {
            unit.isHealingProhibited = false;
            console.log(`${unit.instanceName}의 [치료 금지] 효과가 해제됩니다.`);
        },
    },
    // --- ▼ [신규] 윌 가드 효과 추가 ▼ ---
    willGuard: {
        id: 'willGuard',
        name: '의지 방패',
        description: '다음 공격을 확정적으로 [막기]로 판정합니다.',
        iconPath: 'assets/images/skills/shield-buff.png',
        onApply: (unit, effectData) => {
            if (effectData && effectData.stack) {
                stackManager.addStack(unit.uniqueId, FIXED_DAMAGE_TYPES.BLOCK, effectData.stack.amount);
            }
        },
        onRemove: (unit) => {
            // 스택은 자동 소모되므로 특별한 로직이 필요 없을 수 있습니다.
        },
    },
    // --- ▲ [신규] 윌 가드 효과 추가 ▲ ---

    // --- ▼ [신규] 마이티 쉴드 효과 추가 ▼ ---
    mightyShield: {
        id: 'mightyShield',
        name: '마이티 쉴드',
        description: '다음 공격의 피해를 완전히 무효화합니다.',
        iconPath: 'assets/images/skills/mighty-shield.png',
        onApply: (unit, effectData) => {
            if (effectData && effectData.stack) {
                stackManager.addStack(unit.uniqueId, FIXED_DAMAGE_TYPES.DAMAGE_IMMUNITY, effectData.stack.amount);
            }
        },
        onRemove: (unit) => {
            // 스택은 공격받을 때 자동으로 소모되므로 별도 로직 불필요
        },
    },
    // --- ▲ [신규] 마이티 쉴드 효과 추가 ▲ ---

    // --- ▼ [신규] 클래스 특화 보너스 효과 추가 ▼ ---
    warriorWillBonus: {
        id: 'warriorWillBonus',
        name: '투지',
        iconPath: 'assets/images/skills/battle_cry.png',
    },
    gunnerKineticBonus: {
        id: 'gunnerKineticBonus',
        name: '반동 제어',
        iconPath: 'assets/images/skills/knock-back-shot.png',
    },
    medicHealBonus: {
        id: 'medicHealBonus',
        name: '집중',
        iconPath: 'assets/images/skills/heal.png',
    },
    nanomancerProductionBonus: {
        id: 'nanomancerProductionBonus',
        name: '과부하',
        iconPath: 'assets/images/skills/nanobeam.png',
    },
    // ✨ 광대의 농담 버프 효과 추가
    clownsJokeBuff: {
        id: 'clownsJokeBuff',
        name: '광대의 농담',
        iconPath: 'assets/images/skills/clown-s-joke.png',
    },
    // ✨ [신규] 강화 학습 버프 효과 추가
    reinforcementLearningBuff: {
        id: 'reinforcementLearningBuff',
        name: '강화 학습',
        iconPath: 'assets/images/skills/reinforcement-learning.png',
        // 이 버프는 스택만 쌓고, 실제 스탯 보너스는 CombatCalculationEngine에서 동적으로 계산됩니다.
    },
    flyingmenChargeBonus: {
        id: 'flyingmenChargeBonus',
        name: '신속',
        iconPath: 'assets/images/skills/charge.png',
    },
    // --- ▼ [신규] 역병 의사 특화 보너스 효과 추가 ▼ ---
    poisonAttributeBonus: {
        id: 'poisonAttributeBonus',
        name: '맹독 확산',
        description: '상태이상 적용 확률이 증가합니다.',
        iconPath: 'assets/images/skills/antidote.png', // 임시 아이콘, 추후 전용 아이콘으로 교체 가능
    },
    // --- ▲ [신규] 역병 의사 특화 보너스 효과 추가 ▲ ---
    // --- ▲ [신규] 클래스 특화 보너스 효과 추가 ▲ ---
};
