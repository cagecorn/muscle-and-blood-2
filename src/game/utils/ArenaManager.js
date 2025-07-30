import { mercenaryEngine } from './MercenaryEngine.js';
import { mercenaryData } from '../data/mercenaries.js';
import { skillInventoryManager } from './SkillInventoryManager.js';
import { ownedSkillsManager } from './OwnedSkillsManager.js';
import { mercenaryCardSelector } from './MercenaryCardSelector.js';
import { formationEngine } from './FormationEngine.js';
import { mbtiPositioningEngine } from './MBTIPositioningEngine.js';

/**
 * 아레나 컨텐츠와 관련된 로직(적 생성, 보상 등)을 관리하는 엔진
 */
class ArenaManager {
    constructor() {
        this.name = 'ArenaManager';
        this.enemyTeam = [];
    }

    /**
     * 12명의 랜덤한 적 용병 팀을 생성하고, 스킬과 위치를 MBTI에 따라 결정합니다.
     */
    generateEnemyTeam() {
        this.enemyTeam = [];
        let availableCards = [...skillInventoryManager.getInventory()];
        const mercenaryTypes = Object.values(mercenaryData);

        // --- 아레나 적 진영의 모든 빈 셀 목록을 미리 준비 ---
        const ALLY_COLS = 8;
        const ALLY_ROWS = 9;
        let availableCells = [];
        for (let r = 0; r < ALLY_ROWS; r++) {
            for (let c = 0; c < ALLY_COLS; c++) {
                // formationEngine의 grid가 로드되었다고 가정.
                // BattleStageManager에서 그리드를 생성하므로, 이 시점에서는 셀 정보를 직접 생성.
                availableCells.push({ col: c, row: r, isOccupied: false });
            }
        }

        const placedAllies = [];

        for (let i = 0; i < 12; i++) {
            if (availableCells.length === 0) break; // 배치할 공간이 없으면 중단

            // 1. 랜덤 클래스의 적 용병 생성
            const randomType = mercenaryTypes[Math.floor(Math.random() * mercenaryTypes.length)];
            const enemyMercenary = mercenaryEngine.hireMercenary(randomType, 'enemy');

            // 2. MBTI에 따라 스킬 선택
            const { selectedCards, remainingCards } = mercenaryCardSelector.selectCardsForMercenary(enemyMercenary, availableCards);
            selectedCards.forEach((cardInstance, index) => {
                ownedSkillsManager.equipSkill(enemyMercenary.uniqueId, index, cardInstance.instanceId);
            });
            availableCards = remainingCards;

            // 3. MBTI에 따라 위치 결정
            const chosenCell = mbtiPositioningEngine.determinePosition(enemyMercenary, availableCells, placedAllies);

            if (chosenCell) {
                // 4. 결정된 위치 정보 저장
                enemyMercenary.gridX = chosenCell.col;
                enemyMercenary.gridY = chosenCell.row;
                // formationEngine에 DOM이 아닌 논리적 위치를 저장합니다.
                // ArenaDOMEngine은 이 정보를 사용하게 됩니다.
                formationEngine.setPosition(enemyMercenary.uniqueId, (chosenCell.row * ALLY_COLS) + chosenCell.col);

                placedAllies.push(enemyMercenary);
                // 사용된 셀은 후보에서 제거
                availableCells = availableCells.filter(c => c.col !== chosenCell.col || c.row !== chosenCell.row);
            }

            this.enemyTeam.push(enemyMercenary);
        }

        console.log('[ArenaManager] 아레나 적 팀 생성 및 자동 배치가 완료되었습니다.');
        return this.enemyTeam;
    }

    getEnemyTeam() {
        return this.enemyTeam;
    }
}

export const arenaManager = new ArenaManager();
