export const monsterData = {
    zombie: {
        name: '좀비',
        battleSprite: 'zombie',
        baseStats: { hp: 50, valor: 0, strength: 5, endurance: 3, agility: 1, intelligence: 0, wisdom: 0, luck: 0 }
    }
};

export const getMonsterBase = (id) => monsterData[id];
