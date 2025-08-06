import { EFFECT_TYPES } from '../../utils/EffectTypes.js';
import { SKILL_TAGS } from '../../utils/SkillTagManager.js';
import { SHARED_RESOURCE_TYPES } from '../../utils/SharedResourceEngine.js';

// 액티브 스킬 데이터 정의
export const activeSkills = {
    // 기본 공격 스킬
    attack: {
        yinYangValue: -1,
        NORMAL: {
            id: 'attack',
            name: '공격',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 1, // SKILL-SYSTEM.md 규칙에 따라 토큰 1개 소모
            description: '적을 {{damage}}% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        RARE: {
            id: 'attack',
            name: '공격 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        EPIC: {
            id: 'attack',
            name: '공격 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격하고, 50% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 0.5, amount: 1 }
        },
        LEGENDARY: {
            id: 'attack',
            name: '공격 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE],
            cost: 0,
            description: '적을 {{damage}}% 공격력으로 공격하고, 100% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/rending_strike.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 1.0, amount: 1 }
        }
    },
    charge: {
        yinYangValue: -2,
        NORMAL: {
            id: 'charge',
            name: '차지',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 2,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
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
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 2,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
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
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 1,
            description: '적을 {{damage}}%의 데미지로 공격하고, 1턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
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
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.MELEE, SKILL_TAGS.CHARGE],
            cost: 1,
            description: '적을 {{damage}}%의 데미지로 공격하고, 2턴간 기절 시킵니다.',
            illustrationPath: 'assets/images/skills/charge.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
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
        yinYangValue: -2,
        NORMAL: {
            id: 'knockbackShot',
            name: '넉백샷',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 2,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 2,
            range: 3,
            push: 1
        },
        RARE: {
            id: 'knockbackShot',
            name: '넉백샷 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 2,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 1,
            range: 3,
            push: 1
        },
        EPIC: {
            id: 'knockbackShot',
            name: '넉백샷 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 1,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 1칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 1,
            range: 3,
            push: 1
        },
        LEGENDARY: {
            id: 'knockbackShot',
            name: '넉백샷 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.KINETIC],
            cost: 1,
            description: '적에게 {{damage}}% 데미지를 주고 뒤로 2칸 밀쳐냅니다. (쿨타임 1턴)',
            illustrationPath: 'assets/images/skills/knock-back-shot.png',
            damageMultiplier: { min: 0.7, max: 0.9 },
            cooldown: 1,
            range: 3,
            push: 2
        }
    },

    // --- ▼ [신규] 나노빔 스킬 추가 ▼ ---
    nanobeam: {
        yinYangValue: -1,
        NORMAL: {
            id: 'nanobeam',
            name: '나노빔',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 1,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        RARE: {
            id: 'nanobeam',
            name: '나노빔 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 0,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
        },
        EPIC: {
            id: 'nanobeam',
            name: '나노빔 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 0,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격하고, 50% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 0.5, amount: 1 }
        },
        LEGENDARY: {
            id: 'nanobeam',
            name: '나노빔 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC],
            cost: 0,
            description: '나노 입자 빔을 발사하여 적을 {{damage}}% 마법 공격력으로 공격하고, 100% 확률로 토큰 1개를 생성합니다.',
            illustrationPath: 'assets/images/skills/nanobeam.png',
            damageMultiplier: { min: 0.9, max: 1.1 },
            cooldown: 0,
            generatesToken: { chance: 1.0, amount: 1 }
        }
    },
    // --- ▲ [신규] 나노빔 스킬 추가 ▲ ---

    // --- ▼ [신규] 도끼 참격 스킬 추가 ▼ ---
    axeStrike: {
        yinYangValue: -2,
        NORMAL: {
            id: 'axeStrike',
            name: '도끼 참격',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 1,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 5%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.05
        },
        RARE: {
            id: 'axeStrike',
            name: '도끼 참격 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 0,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 5%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.05
        },
        EPIC: {
            id: 'axeStrike',
            name: '도끼 참격 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 0,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 7%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.07
        },
        LEGENDARY: {
            id: 'axeStrike',
            name: '도끼 참격 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.MELEE, SKILL_TAGS.PHYSICAL],
            cost: 0,
            description: '적을 {{damage}}% 위력으로 공격하고, 최대 용맹 배리어의 10%를 회복합니다.',
            illustrationPath: 'assets/images/skills/axe-strike.png',
            damageMultiplier: { min: 0.45, max: 0.55 },
            cooldown: 0,
            restoresBarrierPercent: 0.10
        }
    },
    // --- ▲ [신규] 도끼 참격 스킬 추가 ▲ ---
    // --- ▼ [신규] 제압 사격 스킬 추가 ▼ ---
    suppressShot: {
        yinYangValue: -3,
        NORMAL: {
            id: 'suppressShot',
            name: '제압 사격',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 80% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어냅니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.7, max: 0.9 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack'
        },
        RARE: {
            id: 'suppressShot',
            name: '제압 사격 [R]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 100% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어냅니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.9, max: 1.1 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack'
        },
        EPIC: {
            id: 'suppressShot',
            name: '제압 사격 [E]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 120% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어냅니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack'
        },
        LEGENDARY: {
            id: 'suppressShot',
            name: '제압 사격 [L]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.DELAY, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '적을 120% 데미지로 제압 사격하여, 턴 순서를 가장 마지막으로 밀어내고 1턴간 토큰 하나를 잃게 합니다. (소모 자원: 철 2)',
            illustrationPath: 'assets/images/skills/suppress-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 2 },
            turnOrderEffect: 'pushToBack',
            effect: {
                id: 'tokenLoss',
                duration: 1,
                applyOnce: true,
                tokenLoss: 1
            }
        }
    },
    // --- ▲ [신규] 제압 사격 스킬 추가 ▲ ---
    throwingAxe: {
        yinYangValue: -2,
        NORMAL: {
            id: 'throwingAxe',
            name: '도끼 던지기',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입힙니다. (소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 1,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 }
        },
        RARE: {
            id: 'throwingAxe',
            name: '도끼 던지기 [R]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입힙니다. (쿨타임 없음, 소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 0,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 }
        },
        EPIC: {
            id: 'throwingAxe',
            name: '도끼 던지기 [E]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입히고, 20% 확률로 기절시킵니다. (소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 0,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 },
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
                chance: 0.2
            }
        },
        LEGENDARY: {
            id: 'throwingAxe',
            name: '도끼 던지기 [L]',
            type: 'ACTIVE',
            // ✨ [마부] 물리 태그 추가
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.THROWING, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '3타일 거리의 적에게 도끼를 던져 120%의 피해를 입히고, 40% 확률로 기절시킵니다. (소모 자원: 철 1)',
            illustrationPath: 'assets/images/skills/throwing-axe.png',
            cooldown: 0,
            range: 3,
            damageMultiplier: { min: 1.1, max: 1.3 },
            resourceCost: { type: 'IRON', amount: 1 },
            effect: {
                type: EFFECT_TYPES.STATUS_EFFECT,
                id: 'stun',
                duration: 1,
                chance: 0.4
            }
        }
    },
    // --- ▼ [신규] 크리티컬 샷 스킬 추가 ▼ ---
    criticalShot: {
        yinYangValue: -3,
        NORMAL: {
            id: 'criticalShot',
            name: '크리티컬 샷',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 3,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 됩니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        },
        RARE: {
            id: 'criticalShot',
            name: '크리티컬 샷 [R]',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 됩니다. (쿨타임 3턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 3,
            range: 3,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        },
        EPIC: {
            id: 'criticalShot',
            name: '크리티컬 샷 [E]',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 됩니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 2,
            range: 4,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        },
        LEGENDARY: {
            id: 'criticalShot',
            name: '크리티컬 샷 [L]',
            type: 'ACTIVE',
            requiredClass: 'gunner',
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.PHYSICAL, SKILL_TAGS.FIXED],
            cost: 2,
            targetType: 'enemy',
            description: '적에게 {{damage}}% 데미지를 줍니다. 이 공격은 확정적으로 [치명타]가 되며, 대상의 방어력을 15% 무시합니다. (쿨타임 2턴)',
            illustrationPath: 'assets/images/skills/critical-shot.png',
            cooldown: 2,
            range: 4,
            damageMultiplier: { min: 0.9, max: 1.1 },
            fixedDamage: 'CRITICAL',
        armorPenetration: 0.15,
        },
    },
    // --- ▼ [신규] '낙인' 스킬을 DEBUFF에서 ACTIVE로 이동 및 수정 ▼ ---
    stigma: {
        yinYangValue: +2,
        NORMAL: {
            id: 'stigma',
            name: '낙인',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 5,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        RARE: {
            id: 'stigma',
            name: '낙인 [R]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 4턴, 소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 4,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        EPIC: {
            id: 'stigma',
            name: '낙인 [E]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 1명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 3턴, 소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 3,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        },
        LEGENDARY: {
            id: 'stigma',
            name: '낙인 [L]',
            type: 'ACTIVE',
            tags: [SKILL_TAGS.DEBUFF, SKILL_TAGS.RANGED, SKILL_TAGS.PROHIBITION, SKILL_TAGS.SPECIAL],
            cost: 0,
            targetType: 'enemy',
            description: '가장 멀리 있는 체력이 가장 낮은 적 2명에게 3턴간 [치료 금지] 디버프를 겁니다. (쿨타임 3턴, 소모 자원: 철 3)',
            illustrationPath: 'assets/images/skills/stigma.png',
            cooldown: 3,
            range: 10,
            resourceCost: { type: 'IRON', amount: 3 },
            numberOfTargets: 2,
            effect: { id: 'stigma', type: EFFECT_TYPES.DEBUFF, duration: 3 }
        }
    },
    // --- ▲ [신규] '낙인' 스킬을 DEBUFF에서 ACTIVE로 이동 및 수정 ▲ ---
    // --- ▲ [신규] 크리티컬 샷 스킬 추가 ▲ ---
    // --- ▼ [신규] 끌어당기기 스킬 추가 ▼ ---
    pulling: {
        yinYangValue: -3,
        NORMAL: {
            id: 'pulling',
            name: '끌어당기기',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 3,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어옵니다. (쿨타임 5턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 5,
            range: 5,
            pull: true
        },
        RARE: {
            id: 'pulling',
            name: '끌어당기기 [R]',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 3,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어오고, 1턴간 이동력을 1 감소시킵니다. (쿨타임 5턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 5,
            range: 5,
            pull: true,
            effect: {
                id: 'slow',
                type: EFFECT_TYPES.DEBUFF,
                duration: 1,
                modifiers: { stat: 'movement', type: 'flat', value: -1 }
            }
        },
        EPIC: {
            id: 'pulling',
            name: '끌어당기기 [E]',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 2,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어오고, 1턴간 이동력을 1 감소시킵니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 4,
            range: 5,
            pull: true,
            effect: {
                id: 'slow',
                type: EFFECT_TYPES.DEBUFF,
                duration: 1,
                modifiers: { stat: 'movement', type: 'flat', value: -1 }
            }
        },
        LEGENDARY: {
            id: 'pulling',
            name: '끌어당기기 [L]',
            type: 'ACTIVE',
            requiredClass: ['clown', 'hacker'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.PHYSICAL, SKILL_TAGS.BIND, SKILL_TAGS.KINETIC],
            cost: 2,
            targetType: 'enemy',
            description: '5타일 내의 적을 자신의 바로 앞으로 끌어오고, 2턴간 [속박](이동 불가) 상태로 만듭니다. (쿨타임 4턴)',
            illustrationPath: 'assets/images/skills/pulling.png',
            cooldown: 4,
            range: 5,
            pull: true,
            effect: {
                id: 'bind',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2
            }
        }
    },
    // --- ▲ [신규] 끌어당기기 스킬 추가 ▲ ---
    // --- ▼ [신규] 파이어볼 스킬 추가 ▼ ---
    fireball: {
        yinYangValue: -4,
        NORMAL: {
            id: 'fireball',
            name: '파이어볼',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 2턴간 [화상] 효과를 부여합니다.',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 3,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.0, max: 1.2 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            }
        },
        RARE: {
            id: 'fireball',
            name: '파이어볼 [R]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 2턴간 [화상] 효과를 부여합니다. (쿨타임 1 감소)',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 2,
            range: 4,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.1, max: 1.3 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 2,
            }
        },
        EPIC: {
            id: 'fireball',
            name: '파이어볼 [E]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 3턴간 [화상] 효과를 부여합니다.',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.2, max: 1.4 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
            }
        },
        LEGENDARY: {
            id: 'fireball',
            name: '파이어볼 [L]',
            type: 'ACTIVE',
            requiredClass: ['nanomancer', 'esper'],
            tags: [SKILL_TAGS.ACTIVE, SKILL_TAGS.RANGED, SKILL_TAGS.MAGIC, SKILL_TAGS.FIRE, SKILL_TAGS.SPECIAL],
            cost: 3,
            targetType: 'enemy',
            description: '지정한 위치에 거대한 화염구를 날려 십자(5칸) 범위의 적들에게 {{damage}}%의 마법 피해를 주고, 3턴간 [화상] 효과를 부여하며, 중심부의 적을 1턴간 기절시킵니다.',
            illustrationPath: 'assets/images/skills/fire-ball.png',
            cooldown: 2,
            range: 5,
            aoe: { shape: 'CROSS', radius: 1 },
            damageMultiplier: { min: 1.3, max: 1.5 },
            effect: {
                id: 'burn',
                type: EFFECT_TYPES.DEBUFF,
                duration: 3,
            },
            centerTargetEffect: {
                id: 'stun',
                type: EFFECT_TYPES.STATUS_EFFECT,
                duration: 1,
            }
        }
    },
    // --- ▲ [신규] 파이어볼 스킬 추가 ▲ ---
};
