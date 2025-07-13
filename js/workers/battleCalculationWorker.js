// js/workers/battleCalculationWorker.js

self.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'CALCULATE_DAMAGE': {
            // ✨ payload에서 대상 유닛의 배리어 정보를 가져옵니다.
            const { attackerStats, targetStats, skillData, currentTargetHp, currentTargetBarrier, maxBarrier, preCalculatedDamageRoll } = payload;

            // 최종 적용될 데미지 (방어력 적용 후)
            let finalDamageToApply = preCalculatedDamageRoll - targetStats.defense;
            if (finalDamageToApply < 0) finalDamageToApply = 0; // 데미지는 0 미만이 될 수 없음

            let barrierDamageDealt = 0; // 배리어로 흡수된 데미지
            let hpDamageDealt = 0;      // HP로 들어간 데미지
            let newBarrier = currentTargetBarrier;
            let newHp = currentTargetHp;

            if (finalDamageToApply > 0) {
                if (newBarrier >= finalDamageToApply) {
                    // 배리어가 모든 데미지를 흡수
                    barrierDamageDealt = finalDamageToApply;
                    newBarrier -= finalDamageToApply;
                } else {
                    // 배리어가 일부를 흡수하고, 남은 데미지는 HP로
                    barrierDamageDealt = newBarrier; // 배리어가 흡수한 양
                    hpDamageDealt = finalDamageToApply - newBarrier; // HP로 들어갈 양
                    newBarrier = 0; // 배리어 소진
                    newHp -= hpDamageDealt;
                }
            }
            newHp = Math.max(0, newHp); // HP는 0 미만이 될 수 없음

            self.postMessage({
                type: 'DAMAGE_CALCULATED',
                unitId: payload.targetUnitId,
                newHp: newHp,
                newBarrier: newBarrier,          // ✨ 업데이트된 배리어 값 반환
                hpDamageDealt: hpDamageDealt,    // ✨ HP로 들어간 데미지 반환
                barrierDamageDealt: barrierDamageDealt // ✨ 배리어로 흡수된 데미지 반환
            });
            break;
        }
        default:
            console.warn(`[BattleCalculationWorker] Unknown message type received: ${type}`);
    }
};

console.log("[Worker] BattleCalculationWorker initialized. Ready for heavy calculations.");
