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
            console.log(`${unit.instanceName}의 기절이 풀렸습니다.`);
            unit.isStunned = false;
        },
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
    }
};
