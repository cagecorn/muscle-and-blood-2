import { pathfinderEngine } from './PathfinderEngine.js';
import { skillEngine } from './SkillEngine.js';
import { combatCalculationEngine } from './CombatCalculationEngine.js';
import { formationEngine } from './FormationEngine.js';
import { MBTI_ARCHETYPES } from '../../ai/mbti/MBTIArchetypes.js';
// ✨ targetManager를 import하여 스킬 대상 탐색에 사용합니다.
import { targetManager } from './TargetManager.js';

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

        const possibleActions = this._generateAllPossibleActions(unit, allies, enemies);
        if (possibleActions.length === 0) {
            console.log(`%c[CrisisEngine] 궁여지책으로 실행할 행동을 찾지 못했습니다.`);
            return null; // 정말 할 수 있는 게 아무것도 없으면 null 반환
        }

        const scoredActions = this._evaluateActions(possibleActions, unit, allies, enemies);
        const bestAction = this._selectBestActionByMBTI(unit, scoredActions);

        // bestAction이 null이 아닌지 확인 후 로그 출력
        if (bestAction && bestAction.description) {
            console.log(`%c[CrisisEngine] 최종 결정: ${bestAction.description}`, "color: #e11d48; font-weight: bold;");
        } else {
            console.log(`%c[CrisisEngine] 최종 행동을 결정하지 못했습니다.`);
            return null;
        }
        
        return bestAction;
    }

    /**
     * 이동, 스킬 사용 등 현재 유닛이 수행할 수 있는 모든 행동의 목록을 생성합니다.
     * @private
     */
    _generateAllPossibleActions(unit, allies, enemies) {
        const actions = [];

        // --- 1. 이동 액션 생성 ---
        const reachableTiles = pathfinderEngine.findAllReachableTiles(unit);
        for (const tile of reachableTiles) {
            // 자기 자신 위치로의 이동은 제외
            if (tile.col === unit.gridX && tile.row === unit.gridY) continue;

            actions.push({
                type: 'MOVE',
                target: { col: tile.col, row: tile.row },
                description: `(${tile.col}, ${tile.row}) 위치로 이동`
            });
        }

        // --- 2. 스킬 사용 액션 생성 ---
        const availableSkills = unit.skills
            .map(s => s.NORMAL || s) // 등급 객체가 있으면 일반 스킬 데이터를 가져옴
            .filter(skill => skillEngine.canUseSkill(unit, skill));

        for (const skill of availableSkills) {
            // 스킬의 대상 규칙에 따라 유효한 대상들을 찾음
            const targets = targetManager.findTargets(unit, skill.targetType, skill.range, allies, enemies);

            for (const target of targets) {
                // 스킬과 대상을 묶어 하나의 행동으로 추가
                actions.push({
                    type: 'SKILL',
                    skill: skill,
                    target: target,
                    description: `[${target.instanceName}]에게 [${skill.name}] 스킬 사용`
                });
            }
        }
        
        console.log(`[CrisisEngine] ${unit.instanceName}이(가) 수행 가능한 ${actions.length}가지 행동 발견.`);
        return actions;
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
