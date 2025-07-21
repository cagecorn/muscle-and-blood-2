export const mercenaryData = {
    warrior: {
        id: 'warrior',
        name: '전사',
        hireImage: 'assets/images/territory/warrior-hire.png',
        uiImage: 'assets/images/territory/warrior-ui.png',
        battleSprite: 'assets/images/unit/warrior.png',
        spriteKey: 'warrior',
        description: '"그는 단 한 사람을 지키기 위해 검을 든다."',
        baseStats: {
            hp: 120, valor: 10, strength: 15, endurance: 12,
            agility: 8, intelligence: 5, wisdom: 5, luck: 7
        }
    },
    gunner: {
        id: 'gunner',
        name: '거너',
        hireImage: 'assets/images/territory/gunner-hire.png',
        uiImage: 'assets/images/territory/gunner-ui.png',
        battleSprite: 'assets/images/unit/gunner.png',
        spriteKey: 'gunner',
        description: '"한 발, 한 발. 신중하게, 그리고 차갑게."',
        baseStats: {
            hp: 80, valor: 5, strength: 7, endurance: 6,
            agility: 15, intelligence: 8, wisdom: 10, luck: 12
        }
    }
};
