import { pathfinderEngine } from './PathfinderEngine.js';
import { skillEngine } from './SkillEngine.js';
import { combatCalculationEngine } from './CombatCalculationEngine.js';
import { formationEngine } from './FormationEngine.js';
// TODO: MBTI 가중치 적용을 위한 아키타입 데이터는 추후 추가 예정
// import { MBTI_ARCHETYPES } from '../../ai/mbti/MBTIArchetypes.js';

/**
 * AI가 일반적인 행동 트리로는 유효한 행동을 찾지 못했을 때,
 * 최후의 수단(궁여지책)을 결정하는 엔진.
 *
 * 이 엔진은 현재 상황에서 가능한 모든 행동 조합(이동, 스킬)을 탐색하고,
 * 4가지 핵심 철학(피해, 교란, 지원, 생존)에 따라 각 행동의 가치를 평가합니다.
 * 마지막으로, 유닛의 MBTI 아키타입에 기반한 가중치를 적용하여
 * 자신의 성향에 가장 잘 맞는 단 하나의 '최선의 수'를 결정합니다.
 */
class CrisisEngine {
    constructor() {
        this.name = 'CrisisEngine';
    }

    /**
     * 현재 유닛에게 가장 적합한 '궁여지책'을 찾아 반환합니다.
     * @param {object} unit - 행동을 결정할 유닛
     * @param {object[]} allies - 모든 아군 유닛 배열
     * @param {object[]} enemies - 모든 적군 유닛 배열
     * @returns {object|null} - 결정된 최선의 행동 객체 또는 null
     */
    findBestDesperateMeasure(unit, allies, enemies) {
        console.log(`%c[CrisisEngine] ${unit.instanceName}의 궁여지책 탐색 시작...`, "color: #e11d48; font-weight: bold;");

        // 1. 가능한 모든 행동 생성 (이동, 스킬 사용 등)
        const possibleActions = this._generateAllPossibleActions(unit, allies, enemies);
        if (possibleActions.length === 0) {
            console.log(`%c[CrisisEngine] 궁여지책으로 실행할 행동을 찾지 못했습니다.`, "color: #e11d48;");
            return null;
        }

        // 2. 각 행동을 4대 철학에 따라 평가
        const scoredActions = this._evaluateActions(possibleActions, unit, allies, enemies);

        // 3. 유닛의 MBTI에 따라 최종 행동 결정
        const bestAction = this._selectBestActionByMBTI(unit, scoredActions);
        
        console.log(`%c[CrisisEngine] 최종 결정: ${bestAction.description}`, "color: #e11d48; font-weight: bold;");

        return bestAction;
    }

    /**
     * 이동, 스킬 사용 등 현재 유닛이 수행할 수 있는 모든 행동의 목록을 생성합니다.
     * @private
     */
    _generateAllPossibleActions(unit, allies, enemies) {
        // TODO: 구현 예정
        // 예: 이동 가능한 모든 타일, 사용 가능한 모든 스킬과 대상의 조합
        return []; 
    }

    /**
     * 생성된 행동 목록을 4대 행동 철학에 따라 점수를 매깁니다.
     * @private
     */
    _evaluateActions(actions, unit, allies, enemies) {
        // TODO: 구현 예정
        // 각 행동에 대해 피해량, 힐량, 위치 이동 거리 등을 계산하여 점수 부여
        return actions;
    }

    /**
     * 점수가 매겨진 행동들 중에서 유닛의 MBTI 아키타입에 가장 적합한 행동을 선택합니다.
     * @private
     */
    _selectBestActionByMBTI(unit, scoredActions) {
        // TODO: 구현 예정
        // MBTI 가중치를 적용하여 최종 점수가 가장 높은 행동을 선택
        return scoredActions[0];
    }
}

export const crisisEngine = new CrisisEngine();
