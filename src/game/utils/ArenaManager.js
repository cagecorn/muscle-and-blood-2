import { mercenaryEngine } from './MercenaryEngine.js';
import { mercenaryData } from '../data/mercenaries.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { mercenaryCardSelector } from './MercenaryCardSelector.js';

/**
 * 아레나 컨텐츠와 관련된 로직(적 생성, 보상 등)을 관리하는 엔진
 */
class ArenaManager {
    constructor() {
        this.name = 'ArenaManager';
        this.enemyTeam = [];
    }

    /**
     * 12명의 랜덤한 적 용병 팀을 생성하고 MBTI에 따라 스킬을 장착시킵니다.
     */
    generateEnemyTeam() {
        this.enemyTeam = [];
        let availableCards = [...skillInventoryManager.getInventory()];
        const mercenaryTypes = Object.values(mercenaryData);

        for (let i = 0; i < 12; i++) {
            // 1. 랜덤 클래스의 적 용병 생성
            const randomType = mercenaryTypes[Math.floor(Math.random() * mercenaryTypes.length)];
            const enemyMercenary = mercenaryEngine.hireMercenary(randomType, 'enemy');

            // 2. MBTI에 따라 스킬 선택 (강화된 로직 사용)
            const { selectedCards, remainingCards } = mercenaryCardSelector.selectCardsForMercenary(enemyMercenary, availableCards);

            // 3. 선택된 스킬을 용병에게 장착
            selectedCards.forEach((cardInstance, index) => {
                ownedSkillsManager.equipSkill(enemyMercenary.uniqueId, index, cardInstance.instanceId);
            });
            
            console.log(`[ArenaManager] ${enemyMercenary.instanceName}(${enemyMercenary.mbti.E > 50 ? 'E' : 'I'}...)에게 스킬 ${selectedCards.length}개 장착 완료.`);

            this.enemyTeam.push(enemyMercenary);
            availableCards = remainingCards; // 남은 카드 풀 업데이트
        }
        
        console.log('[ArenaManager] 아레나 적 팀 생성이 완료되었습니다.', this.enemyTeam);
        return this.enemyTeam;
    }

    getEnemyTeam() {
        return this.enemyTeam;
    }
}

export const arenaManager = new ArenaManager();
