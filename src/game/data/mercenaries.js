export const mercenaryData = {
    warrior: {
        id: 'warrior',
        name: '전사',
        ai_archetype: 'melee',
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
        ai_archetype: 'ranged',
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
        ai_archetype: 'healer',
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
        ai_archetype: 'ranged',
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
        },
        classPassive: {
            id: 'elementalManifest',
            name: '원소 구현',
            description: '스킬을 사용할 때마다 랜덤한 속성의 자원 하나를 생산합니다.',
            iconPath: 'assets/images/skills/elemental-manifest.png'
        }
    },
    flyingmen: {
        id: 'flyingmen',
        name: '플라잉맨',
        ai_archetype: 'assassin',
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
        ai_archetype: 'ranged',
        uiImage: 'assets/images/unit/esper-ui.png',
        battleSprite: 'esper',
        sprites: {
            idle: 'esper',
            attack: 'esper',
            hitted: 'esper',
            cast: 'esper',
            'status-effects': 'esper',
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
    },
    // ✨ [신규] 커맨더 클래스 데이터 추가
    commander: {
        id: 'commander',
        name: '커맨더',
        ai_archetype: 'melee',
        uiImage: 'assets/images/unit/commander-ui.png',
        battleSprite: 'commander',
        sprites: {
            idle: 'commander',
            attack: 'commander',
            hitted: 'commander',
            cast: 'commander',
            'status-effects': 'commander',
        },
        description: '"나의 방패는 동료를 위하고, 나의 검은 적을 향한다."',
        baseStats: {
            hp: 110, valor: 12, strength: 13, endurance: 11,
            agility: 9, intelligence: 7, wisdom: 8, luck: 7,
            attackRange: 2,
            movement: 3,
            weight: 18
        },
        classPassive: {
            id: 'commandersShout',
            name: '통솔자의 외침',
            description: '[전략] 태그가 붙은 스킬의 재사용 대기시간이 1/10로 감소합니다.',
            iconPath: 'assets/images/skills/commanders-shout.png'
        }
    },
    // ✨ [신규] 광대 클래스 데이터 추가
    clown: {
        id: 'clown',
        name: '광대',
        ai_archetype: 'assassin',
        uiImage: 'assets/images/unit/clown-ui.png',
        battleSprite: 'clown',
        sprites: {
            idle: 'clown',
            attack: 'clown',
            hitted: 'clown',
            cast: 'clown',
            'status-effects': 'clown',
        },
        description: '"가장 화려한 무대는 가장 큰 비극 위에 피어나는 법이지."',
        baseStats: {
            hp: 95, valor: 8, strength: 10, endurance: 7,
            agility: 16, intelligence: 10, wisdom: 8, luck: 15,
            attackRange: 2,
            movement: 4,
            weight: 9
        },
        // ✨ 클래스 패시브 정보 추가
        classPassive: {
            id: 'clownsJoke',
            name: '광대의 농담',
            description: '주위 3타일 내 디버프에 걸린 유닛 하나당 자신의 치명타율 5%, 약점 공격 확률 5%, 공격력 5%가 증가합니다 (아군, 적군 포함).',
            iconPath: 'assets/images/skills/clown-s-joke.png'
        }
    },
    android: {
        id: 'android',
        name: '안드로이드',
        ai_archetype: 'melee', // 기본 AI는 전사와 동일한 근접 타입
        uiImage: 'assets/images/unit/android-ui.png',
        battleSprite: 'android',
        sprites: {
            idle: 'android',
            attack: 'android',
            hitted: 'android',
            cast: 'android',
            'status-effects': 'android',
        },
        description: '"나의 파괴는, 모두의 생존을 위함이다."',
        baseStats: {
            hp: 110, valor: 12, strength: 14, endurance: 14,
            agility: 7, intelligence: 5, wisdom: 8, luck: 6,
            movement: 3,
            weight: 12
        },
        classPassive: {
            id: 'reinforcementLearning',
            name: '강화 학습',
            description: '자신이 [희생] 태그 스킬을 사용하거나, 아군이 사망할 때마다 [강화 학습] 버프를 1 얻습니다. 이 버프는 중첩될 때마다 모든 기본 스탯(힘, 인내 등)을 1씩 올려주며, 전투가 끝나면 사라집니다.',
            iconPath: 'assets/images/skills/reinforcement-learning.png'
        }
    },
    // --- ▼ [신규] 역병 의사 클래스 데이터 추가 ▼ ---
    plagueDoctor: {
        id: 'plagueDoctor',
        name: '역병 의사',
        ai_archetype: 'healer', // 기본 AI는 메딕과 유사한 'healer' 타입
        uiImage: 'assets/images/unit/plague-doctor-ui.png',
        battleSprite: 'plague-doctor',
        sprites: {
            idle: 'plague-doctor',
            attack: 'plague-doctor',
            hitted: 'plague-doctor',
            cast: 'plague-doctor',
            'status-effects': 'plague-doctor',
        },
        description: '"죽음이야말로 가장 확실한 치료법이지."',
        baseStats: {
            hp: 85, valor: 6, strength: 8, endurance: 7,
            agility: 11, intelligence: 14, wisdom: 13, luck: 11,
            attackRange: 1, // 사거리 1
            movement: 3,    // 이동거리 3
            weight: 13
        },
        // --- ▼ [신규] 클래스 패시브 정보 추가 ▼ ---
        classPassive: {
            id: 'antidote',
            name: '해독제',
            description: '스킬을 쓸 때마다, 자신 주위 3타일의 아군 1명의 디버프, 상태이상을 해제합니다. 해제할 대상이 없다면 자기 자신을 해독합니다.',
            iconPath: 'assets/images/skills/antidote.png'
        }
        // --- ▲ [신규] 클래스 패시브 정보 추가 ▲ ---
    }
    // --- ▲ [신규] 역병 의사 클래스 데이터 추가 ▲ ---
};
