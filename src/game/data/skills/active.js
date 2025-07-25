import { EFFECT_TYPES } from '../../utils/StatusEffectManager.js';

// 액티브 스킬 데이터 정의
export const activeSkills = {
    // ✨ [신규] 모든 유닛이 사용할 공용 이동 스킬
    move: {
        id: 'move',
        name: '이동',
        type: 'ACTIVE',
        cost: 0, // 토큰 소모 없음
        actionPowerCost: 1, // 행동력 1 소모
        description: '행동력 1을 소모하여 유닛의 이동력만큼 이동합니다.',
        illustrationPath: 'assets/images/skills/move.png',
        cooldown: 0,
        range: 0, // 이동 자체는 range가 없음
    },
    // 기본 공격 스킬
    attack: {
        NORMAL: {
            id: 'attack',
            name: '공격',
            type: 'ACTIVE',
            cost: 1, // SKILL-SYSTEM.md 규칙에 따라 토큰 1개 소모
            description: '적을 {{damage}}% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: 'warrior',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
        },
        RARE: {
            id: 'attack',
            name: '공격 [R]',
            type: 'ACTIVE',
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: 'warrior',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
        },
        EPIC: {
            id: 'attack',
            name: '공격 [E]',
            type: 'ACTIVE',
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격하고, 50% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: 'warrior',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
            generatesToken: { chance: 0.5, amount: 1 }
        },
        LEGENDARY: {
            id: 'attack',
            name: '공격 [L]',
            type: 'ACTIVE',
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격하고, 100% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            requiredClass: 'warrior',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 1,
            generatesToken: { chance: 1.0, amount: 1 }
        }
    },
    charge: {
        NORMAL: {
            id: 'charge',
            name: '차지',
            type: 'ACTIVE',
            cost: 2,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 3,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        RARE: {
            id: 'charge',
            name: '차지 [R]',
            type: 'ACTIVE',
            cost: 2,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        EPIC: {
            id: 'charge',
            name: '차지 [E]',
            type: 'ACTIVE',
            cost: 1,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
            },
        },
        LEGENDARY: {
            id: 'charge',
            name: '차지 [L]',
            type: 'ACTIVE',
            cost: 1,
            description: '적을 {{damage}}%의 데미지로 공격하고, 2턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            requiredClass: 'warrior',
            damageMultiplier: 0.8,
            cooldown: 2,
            range: 1,
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 2,
            },
        }
    },
    knockbackShot: {
        NORMAL: {
            id: 'knockbackShot',
            name: '넉백샷',
            type: 'ACTIVE',
            cost: 2,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            requiredClass: 'gunner',
            damageMultiplier: 0.8,
            cooldown: 2,
            range: 3,
            push: 1
        },
        RARE: {
            id: 'knockbackShot',
            name: '넉백샷 [R]',
            type: 'ACTIVE',
            cost: 2,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            requiredClass: 'gunner',
            damageMultiplier: 0.8,
            cooldown: 1,
            range: 3,
            push: 1
        },
        EPIC: {
            id: 'knockbackShot',
            name: '넉백샷 [E]',
            type: 'ACTIVE',
            cost: 1,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            requiredClass: 'gunner',
            damageMultiplier: 0.8,
            cooldown: 1,
            range: 3,
            push: 1
        },
        LEGENDARY: {
            id: 'knockbackShot',
            name: '넉백샷 [L]',
            type: 'ACTIVE',
            cost: 1,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 2칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            requiredClass: 'gunner',
            damageMultiplier: 0.8,
            cooldown: 1,
            range: 3,
            push: 2
        }
    },

    // ✨ [신규] 원거리 공격 스킬 추가
    rangedAttack: {
        NORMAL: {
            id: 'rangedAttack',
            name: '원거리 공격',
            type: 'ACTIVE',
            cost: 1,
            description: '원거리의 적을 {{damage}}% 데미지로 공격합니다.',
            illustrationPath: 'assets/images/skills/gunner-attack-icon.png',
            requiredClass: 'gunner',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 3,
        },
        RARE: {
            id: 'rangedAttack',
            name: '원거리 공격 [R]',
            type: 'ACTIVE',
            cost: 0,
            description: '원거리의 적을 {{damage}}% 데미지로 공격합니다.',
            illustrationPath: 'assets/images/skills/gunner-attack-icon.png',
            requiredClass: 'gunner',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 3,
        },
        EPIC: {
            id: 'rangedAttack',
            name: '원거리 공격 [E]',
            type: 'ACTIVE',
            cost: 0,
            description: '원거리의 적을 {{damage}}% 데미지로 공격하고, 50% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/gunner-attack-icon.png',
            requiredClass: 'gunner',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 3,
            generatesToken: { chance: 0.5, amount: 1 }
        },
        LEGENDARY: {
            id: 'rangedAttack',
            name: '원거리 공격 [L]',
            type: 'ACTIVE',
            cost: 0,
            description: '원거리의 적을 {{damage}}% 데미지로 공격하고, 100% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/gunner-attack-icon.png',
            requiredClass: 'gunner',
            damageMultiplier: 1.0,
            cooldown: 0,
            range: 3,
            generatesToken: { chance: 1.0, amount: 1 }
        }
    }
};
