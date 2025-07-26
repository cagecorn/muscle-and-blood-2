
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export const summonData = {
    ancestorPeor: {
        name: '선조 페오르',
        className: '전사',
        battleSprite: 'ancestor-peor',
        baseStats: {
            hp: 80, valor: 5, strength: 10, endurance: 8,
            agility: 6, intelligence: 3, wisdom: 3, luck: 5,
            movement: 3,
            attackRange: 1,
            weight: 12
        },
        onSpawn: (unit) => {
            const { ownedSkillsManager } = require('../utils/OwnedSkillsManager.js');
            const { skillInventoryManager } = require('../utils/SkillInventoryManager.js');
            const skillId = 'attack';
            const grade = 'NORMAL';
            const newInstance = skillInventoryManager.addSkillById(skillId, grade);
            ownedSkillsManager.equipSkill(unit.uniqueId, 3, newInstance.instanceId);
            skillInventoryManager.removeSkillFromInventoryList(newInstance.instanceId);
        }
    }
};

export const getSummonBase = (id) => summonData[id];
