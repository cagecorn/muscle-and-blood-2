// js/managers/GuardianManager.js

// 커스텀 오류 클래스 정의 (Python의 ImmutableRuleError와 유사)
class ImmutableRuleViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ImmutableRuleViolationError";
    }
}

export class GuardianManager {
    // ✨ resolutionEngine 인스턴스를 받도록 생성자 수정
    constructor(resolutionEngine = null) {
        console.log("🛡️ GuardianManager is now monitoring the system. 🛡️");
        this.resolutionEngine = resolutionEngine; // ✨ resolutionEngine 저장
    }

    /**
     * '작은 엔진': 게임 데이터의 불변 규칙을 검증합니다.
     * 현재는 간단한 예시 규칙을 검증합니다.
     * @param {object} gameData - 검증할 게임 데이터 (예: 유닛 데이터, 스탯 데이터 등)
     * @returns {boolean} - 모든 규칙이 준수되었으면 true, 아니면 오류 발생.
     * @throws {ImmutableRuleViolationError} - 불변 규칙이 위반되었을 때 발생.
     */
    enforceRules(gameData) {
        console.log("[GuardianManager] Enforcing rules on provided game data...");

        // --- 불변 규칙 예시 (작은 엔진의 역할) ---

        // 규칙 1: 모든 유닛의 체력은 0보다 커야 한다.
        if (gameData && gameData.units) {
            for (const unit of gameData.units) {
                if (unit.hp <= 0) {
                    throw new ImmutableRuleViolationError(
                        `Rule Violation: Unit '${unit.name}' (ID: ${unit.id}) has non-positive HP (${unit.hp}).`
                    );
                }
            }
        } else {
            console.warn("[GuardianManager] No unit data provided for HP rule enforcement.");
        }

        // 규칙 2: 게임의 최소 해상도는 800x600 이상이어야 한다.
        // ✨ 이제 resolutionEngine을 통해 기준 해상도를 검증합니다.
        if (this.resolutionEngine) {
            const baseWidth = this.resolutionEngine.baseWidth;
            const baseHeight = this.resolutionEngine.baseHeight;
            const minRequiredWidth = 800; // 최소 요구 너비
            const minRequiredHeight = 600; // 최소 요구 높이

            if (baseWidth < minRequiredWidth || baseHeight < minRequiredHeight) {
                throw new ImmutableRuleViolationError(
                    `Rule Violation: Base resolution requirement not met (${baseWidth}x${baseHeight}). Must be at least ${minRequiredWidth}x${minRequiredHeight}.`
                );
            }
        } else if (gameData && gameData.config && gameData.config.resolution) {
            // resolutionEngine이 없는 경우 (예: 초기 테스트 등) 기존 gameData의 해상도 정보로 폴백
            const { width, height } = gameData.config.resolution;
            if (width < 800 || height < 600) {
                throw new ImmutableRuleViolationError(
                    `Rule Violation: Minimum resolution requirement not met (${width}x${height}). Must be at least 800x600.`
                );
            }
        } else {
            console.warn("[GuardianManager] No resolution config or ResolutionEngine provided for rule enforcement.");
        }

        // --- 모든 규칙이 준수됨 ---
        console.log("[GuardianManager] All rules checked and respected. ✅");
        return true;
    }
}
