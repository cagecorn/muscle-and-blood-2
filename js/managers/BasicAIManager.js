// js/managers/BasicAIManager.js

export class BasicAIManager {
    constructor(battleSimulationManager) {
        console.log("\ud83c\udfa5 BasicAIManager initialized. Ready to provide fundamental AI behaviors. \ud83c\udfa5");
        this.battleSimulationManager = battleSimulationManager;
    }

    /**
     * \uc720\ub2c8\ud2b8\uc758 \uae30\ubcf8\uc801\uc778 \uc774\ub3d9 \ubc0f \uacf5\uaca9/\uc2a4\ud0ac \ubaa9\ud45c\ub97c \uacb0\uc815\ud569\ub2c8\ub2e4.
     * \uba38\ub9ac \ud074\ub798\uc2a4 AI\uac00 \uacf5\ud1b5\uc73c\ub85c \uc0ac\uc6a9\ud560 \uc218 \uc788\ub294 \ub85c\uc9c1\uc785\ub2c8\ub2e4.
     * @param {object} unit - \ud604\uc7ac \ud130\ub110 \uc9c4\ud589\uc911\uc778 \uc720\ub2c8\ud2b8 (fullUnitData \ud3ec\ud568)
     * @param {object[]} allUnits - \ud604\uc7ac \uc804\uc7c1\uc5d0 \uc788\ub294 \ubaa8\ub4e0 \uc720\ub2c8\ud2b8
     * @param {number} moveRange - \uc720\ub2c8\ud2b8\uc758 \uc774\ub3d9 \uac00\ub2a5 \uac70\ub9ac
     * @param {number} attackRange - \uc720\ub2c8\ud2b8\uc758 \uacf5\uaca9 \uc0ac\uac70\ub9ac
     * @returns {{actionType: string, targetId?: string, moveTargetX?: number, moveTargetY?: number} | null}
     */
    determineMoveAndTarget(unit, allUnits, moveRange, attackRange) {
        const enemies = allUnits.filter(u => u.type !== unit.type && u.currentHp > 0);
        if (enemies.length === 0) {
            console.log(`[BasicAIManager] Unit ${unit.name}: No valid targets to attack.`);
            return null;
        }

        let closestEnemy = null;
        let minDistance = Infinity;

        for (const enemy of enemies) {
            const dist = Math.abs(unit.gridX - enemy.gridX) + Math.abs(unit.gridY - enemy.gridY);
            if (dist < minDistance) {
                minDistance = dist;
                closestEnemy = enemy;
            }
        }

        if (!closestEnemy) {
            return null;
        }

        const isTargetInAttackRange = (unitX, unitY, targetX, targetY, range) => {
            const dx = Math.abs(unitX - targetX);
            const dy = Math.abs(unitY - targetY);
            return (dx <= range && dy <= range && dx + dy <= range * 2);
        };

        if (isTargetInAttackRange(unit.gridX, unit.gridY, closestEnemy.gridX, closestEnemy.gridY, attackRange)) {
            console.log(`[BasicAIManager] Unit ${unit.name}: Target ${closestEnemy.name} is in attack range.`);
            return { actionType: 'attack', targetId: closestEnemy.id };
        } else {
            console.log(`[BasicAIManager] Unit ${unit.name}: Moving towards ${closestEnemy.name}.`);
            let currentX = unit.gridX;
            let currentY = unit.gridY;

            let finalMoveX = currentX;
            let finalMoveY = currentY;

            for (let i = 0; i < moveRange; i++) {
                let movedThisStep = false;
                let nextX = finalMoveX;
                let nextY = finalMoveY;

                const dxToTarget = closestEnemy.gridX - finalMoveX;
                const dyToTarget = closestEnemy.gridY - finalMoveY;

                let preferredXMove = 0;
                if (dxToTarget > 0) preferredXMove = 1;
                else if (dxToTarget < 0) preferredXMove = -1;

                let preferredYMove = 0;
                if (dyToTarget > 0) preferredYMove = 1;
                else if (dyToTarget < 0) preferredYMove = -1;

                if (preferredXMove !== 0) {
                    const potentialX = finalMoveX + preferredXMove;
                    if (!this.battleSimulationManager.isTileOccupied(potentialX, finalMoveY, unit.id)) {
                        nextX = potentialX;
                        movedThisStep = true;
                    }
                }

                if (!movedThisStep && preferredYMove !== 0) {
                    const potentialY = finalMoveY + preferredYMove;
                    if (!this.battleSimulationManager.isTileOccupied(finalMoveX, potentialY, unit.id)) {
                        nextY = potentialY;
                        movedThisStep = true;
                    }
                } else if (movedThisStep && preferredYMove !== 0) {
                    const potentialY = finalMoveY + preferredYMove;
                    if (!this.battleSimulationManager.isTileOccupied(nextX, potentialY, unit.id)) {
                        nextY = potentialY;
                    }
                }

                if (movedThisStep) {
                    finalMoveX = nextX;
                    finalMoveY = nextY;
                } else {
                    break;
                }

                if (isTargetInAttackRange(finalMoveX, finalMoveY, closestEnemy.gridX, closestEnemy.gridY, attackRange)) {
                    console.log(`[BasicAIManager] Unit ${unit.name}: Moved to (${finalMoveX},${finalMoveY}) and now in attack range.`);
                    return { actionType: 'moveAndAttack', targetId: closestEnemy.id, moveTargetX: finalMoveX, moveTargetY: finalMoveY };
                }
            }

            if (finalMoveX !== unit.gridX || finalMoveY !== unit.gridY) {
                console.log(`[BasicAIManager] Unit ${unit.name}: Only moved to (${finalMoveX},${finalMoveY}), not in attack range.`);
                return { actionType: 'move', moveTargetX: finalMoveX, moveTargetY: finalMoveY };
            } else {
                console.log(`[BasicAIManager] Unit ${unit.name}: Could not move closer to enemy.`);
                return null;
            }
        }
    }
}
