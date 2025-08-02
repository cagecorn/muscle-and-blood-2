export const mercenaryData = {
    warrior: {
        id: 'warrior',
        name: '전사',
        hireImage: 'assets/images/territory/warrior-hire.png',
        uiImage: 'assets/images/territory/warrior-ui.png',
        battleSprite: 'warrior',
        // ✨ 모든 행동 스프라이트를 기본(idle)으로 통일
        sprites: {
            idle: 'warrior',
            attack: 'warrior',
            hitted: 'warrior',
            cast: 'warrior',
            'status-effects': 'warrior',
        },
        description: '"그는 단 한 사람을 지키기 위해 검을 든다."',
        baseStats: {
            hp: 120, valor: 10, strength: 15, endurance: 12,
            agility: 8, intelligence: 5, wisdom: 5, luck: 7,
            movement: 3,
            weight: 10
        }
    },
    gunner: {
        id: 'gunner',
        name: '거너',
        hireImage: 'assets/images/territory/gunner-hire.png',
        uiImage: 'assets/images/territory/gunner-ui.png',
        battleSprite: 'gunner',
        // ✨ 모든 행동 스프라이트를 기본(idle)으로 통일
        sprites: {
            idle: 'gunner',
            attack: 'gunner',
            hitted: 'gunner',
            cast: 'gunner',
            'status-effects': 'gunner',
        },
        description: '"한 발, 한 발. 신중하게, 그리고 차갑게."',
        baseStats: {
            hp: 80, valor: 5, strength: 7, endurance: 6,
            agility: 15, intelligence: 8, wisdom: 10, luck: 12,
            attackRange: 3,
            movement: 3,
            weight: 12
        }
    },
    medic: {
        id: 'medic',
        name: '메딕',
        hireImage: 'assets/images/territory/medic-hire.png',
        uiImage: 'assets/images/territory/medic-ui.png',
        battleSprite: 'medic',
        // ✨ 모든 행동 스프라이트를 기본(idle)으로 통일
        sprites: {
            idle: 'medic',
            attack: 'medic',
            hitted: 'medic',
            cast: 'medic',
            'status-effects': 'medic',
        },
        description: '"치유의 빛으로 아군을 보호하고, 적에게는 심판을 내린다."',
        baseStats: {
            hp: 90, valor: 8, strength: 6, endurance: 8,
            agility: 10, intelligence: 12, wisdom: 15, luck: 9,
            attackRange: 2,
            movement: 2,
            weight: 18
        }
    },
    nanomancer: {
        id: 'nanomancer',
        name: '나노맨서',
        hireImage: 'assets/images/unit/nanomancer-hire.png',
        uiImage: 'assets/images/unit/nanomancer-ui.png',
        battleSprite: 'nanomancer',
        // ✨ 모든 행동 스프라이트를 기본(idle)으로 통일
        sprites: {
            idle: 'nanomancer',
            attack: 'nanomancer',
            hitted: 'nanomancer',
            cast: 'nanomancer',
            'status-effects': 'nanomancer',
        },
        description: '"가장 작은 것이 가장 강력한 힘을 지녔다."',
        baseStats: {
            hp: 75, valor: 7, strength: 5, endurance: 5,
            agility: 12, intelligence: 18, wisdom: 14, luck: 10,
            attackRange: 2,
            movement: 2,
            weight: 14
        }
    },
    flyingmen: {
        id: 'flyingmen',
        name: '플라잉맨',
        hireImage: 'assets/images/unit/flyingmen-hire.png',
        uiImage: 'assets/images/unit/flyingmen-ui.png',
        battleSprite: 'flyingmen',
        // ✨ 모든 행동 스프라이트를 기본(idle)으로 통일
        sprites: {
            idle: 'flyingmen',
            attack: 'flyingmen',
            hitted: 'flyingmen',
            cast: 'flyingmen',
            'status-effects': 'flyingmen',
        },
        description: '"바람을 가르는 소리만이 그의 유일한 흔적이다."',
        baseStats: {
            hp: 100, valor: 15, strength: 14, endurance: 8,
            agility: 14, intelligence: 5, wisdom: 5, luck: 10,
            attackRange: 1,
            movement: 5,
            weight: 11
        }
    },
    esper: {
        id: 'esper',
        name: '에스퍼',
        hireImage: 'assets/images/unit/esper-hire.png',
        uiImage: 'assets/images/unit/esper-ui.png',
        battleSprite: 'esper',
        sprites: {
            idle: 'esper',
            attack: 'esper-attack',
            hitted: 'esper-hitted',
            cast: 'esper-cast',
            'status-effects': 'esper-status-effects',
        },
        description: '"당신의 정신은 제 손바닥 위에서 춤추게 될 겁니다."',
        baseStats: {
            hp: 85, valor: 8, strength: 5, endurance: 6,
            agility: 11, intelligence: 18, wisdom: 15, luck: 12,
            attackRange: 3,
            movement: 3,
            weight: 15
        },
        classPassive: {
            id: 'mindExplosion',
            name: '정신 폭발',
            description: '자신의 주위 3타일 내에 [마법] 숙련도를 가진 아군 유닛의 수만큼 자신의 지능이 3%씩 증가합니다.',
            iconPath: 'assets/images/skills/mind-explosion.png'
        }
    }
};
