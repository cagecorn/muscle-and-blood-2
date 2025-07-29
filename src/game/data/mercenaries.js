export const mercenaryData = {
    warrior: {
        id: 'warrior',
        name: '전사',
        hireImage: 'assets/images/territory/warrior-hire.png',
        uiImage: 'assets/images/territory/warrior-ui.png',
        battleSprite: 'warrior',
        // ✨ 전사 스프라이트 정보 업데이트
        sprites: {
            idle: 'warrior',
            attack: 'warrior-attack',
            hitted: 'warrior-hitted',
            cast: 'warrior-cast',
            'status-effects': 'warrior-status-effects', // 상태이상 이미지 키 추가
        },
        description: '"그는 단 한 사람을 지키기 위해 검을 든다."',
        baseStats: {
            hp: 120, valor: 10, strength: 15, endurance: 12,
            agility: 8, intelligence: 5, wisdom: 5, luck: 7,
            movement: 3,
            weight: 10 // ✨ 전사 무게 추가
        }
    },
    gunner: {
        id: 'gunner',
        name: '거너',
        hireImage: 'assets/images/territory/gunner-hire.png',
        uiImage: 'assets/images/territory/gunner-ui.png',
        battleSprite: 'gunner',
        // ✨ 거너 스프라이트 정보 업데이트
        sprites: {
            idle: 'gunner',
            attack: 'gunner-attack',
            hitted: 'gunner-hitted',
            cast: 'gunner-cast', // 버프(시전) 이미지 키 추가
            'status-effects': 'gunner-status-effects', // 상태이상 이미지 키 추가
        },
        description: '"한 발, 한 발. 신중하게, 그리고 차갑게."',
        baseStats: {
            hp: 80, valor: 5, strength: 7, endurance: 6,
            agility: 15, intelligence: 8, wisdom: 10, luck: 12,
            attackRange: 3,
            movement: 3,
            weight: 12 // ✨ 거너 무게 추가
        }
    },
    // --- ▼ [신규] 메딕 클래스 데이터 추가 ▼ ---
    medic: {
        id: 'medic',
        name: '메딕',
        hireImage: 'assets/images/territory/medic-hire.png',
        uiImage: 'assets/images/territory/medic-ui.png',
        battleSprite: 'medic',
        sprites: {
            idle: 'medic',
            attack: 'medic-attack',
            hitted: 'medic-hitted',
            cast: 'medic-cast',
            'status-effects': 'medic-status-effects',
        },
        description: '"치유의 빛으로 아군을 보호하고, 적에게는 심판을 내린다."',
        baseStats: {
            hp: 90, valor: 8, strength: 6, endurance: 8,
            agility: 10, intelligence: 12, wisdom: 15, luck: 9,
            attackRange: 2,
            movement: 2,
            weight: 18 // ✨ 메딕 무게 추가
        }
    },
    // --- ▲ [신규] 메딕 클래스 데이터 추가 ▲ ---
    nanomancer: {
        id: 'nanomancer',
        name: '나노맨서',
        hireImage: 'assets/images/unit/nanomancer-hire.png',
        uiImage: 'assets/images/unit/nanomancer-ui.png',
        battleSprite: 'nanomancer',
        sprites: {
            idle: 'nanomancer',
            attack: 'nanomancer-attack',
            hitted: 'nanomancer-hitted',
            cast: 'nanomancer-cast',
            'status-effects': 'nanomancer-status-effects',
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
    // --- ▼ [신규] 플라잉맨 클래스 데이터 추가 ▼ ---
    flyingmen: {
        id: 'flyingmen',
        name: '플라잉맨',
        hireImage: 'assets/images/unit/flyingmen-hire.png',
        uiImage: 'assets/images/unit/flyingmen-ui.png',
        battleSprite: 'flyingmen',
        sprites: {
            idle: 'flyingmen',
            attack: 'flyingmen-attack',
            hitted: 'flyingmen-hitted',
            cast: 'flyingmen-cast',
            'status-effects': 'flyingmen-status-effects',
        },
        description: '"바람을 가르는 소리만이 그의 유일한 흔적이다."',
        baseStats: {
            hp: 100, valor: 15, strength: 14, endurance: 8,
            agility: 14, intelligence: 5, wisdom: 5, luck: 10,
            attackRange: 1,
            movement: 5,
            weight: 11
        }
    }
    // --- ▲ [신규] 플라잉맨 클래스 데이터 추가 ▲ ---
};
