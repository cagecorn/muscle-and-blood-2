import { ownedSkillsManager } from '../utils/OwnedSkillsManager.js';
import { skillInventoryManager } from '../utils/SkillInventoryManager.js';

export const monsterData = {
    zombie: {
        name: '좀비',
        // ✨ 클래스를 '전사(임시)'로 설정
        className: '전사(임시)',
        battleSprite: 'zombie',
        baseStats: { hp: 50, valor: 0, strength: 5, endurance: 3, agility: 1, intelligence: 0, wisdom: 0, luck: 0 },
        // ✨ 좀비가 생성될 때 실행될 초기화 함수
        onSpawn: (unit) => {
            // 'attack' 스킬 인스턴스를 찾아 1번 슬롯(인덱스 0)에 장착
            const attackInstance = skillInventoryManager.findAndRemoveInstanceOfSkill('attack');
            if (attackInstance) {
                ownedSkillsManager.equipSkill(unit.uniqueId, 0, attackInstance.instanceId);
            }
        }
    }
};

export const getMonsterBase = (id) => monsterData[id];
