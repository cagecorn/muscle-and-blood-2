import { pathfinderEngine } from './PathfinderEngine.js';
import { skillEngine } from './SkillEngine.js';
import { combatCalculationEngine } from './CombatCalculationEngine.js';
import { MBTI_ARCHETYPES } from '../../ai/mbti/MBTIArchetypes.js';
import { targetManager } from './TargetManager.js';
import { yinYangEngine } from './YinYangEngine.js';
import { statEngine } from './StatEngine.js';

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

    findBestDesperateMeasure(unit, allies, enemies) {
        console.log(`%c[CrisisEngine] ${unit.instanceName}의 궁여지책 탐색 시작...`, "color: #e11d48; font-weight: bold;");

        const possibleActions = this._generateAllPossibleActions(unit, allies, enemies);
        if (possibleActions.length === 0) {
            console.log(`%c[CrisisEngine] 궁여지책으로 실행할 행동을 찾지 못했습니다.`);
            return null;
        }

        const scoredActions = this._evaluateActions(possibleActions, unit, allies, enemies);
        const bestAction = this._selectBestActionByMBTI(unit, scoredActions);

        if (bestAction && bestAction.description) {
            console.log(`%c[CrisisEngine] ${unit.instanceName}(${unit.mbti}) 최종 결정: ${bestAction.description} (최종 점수: ${bestAction.finalScore.toFixed(2)})`, "color: #e11d48; font-weight: bold;");
        } else {
            console.log(`%c[CrisisEngine] 최종 행동을 결정하지 못했습니다.`);
            return null;
        }

        return bestAction;
    }

    _generateAllPossibleActions(unit, allies, enemies) {
        const actions = [];
        const reachableTiles = pathfinderEngine.findAllReachableTiles(unit);
        for (const tile of reachableTiles) {
            if (tile.col === unit.gridX && tile.row === unit.gridY) continue;
            actions.push({ type: 'MOVE', target: { col: tile.col, row: tile.row }, description: `(${tile.col}, ${tile.row}) 위치로 이동` });
        }
        const availableSkills = unit.skills.map(s => s.NORMAL || s).filter(skill => skillEngine.canUseSkill(unit, skill));
        for (const skill of availableSkills) {
            const targets = targetManager.findTargets(unit, skill.targetType, skill.range, allies, enemies);
            for (const target of targets) {
                actions.push({ type: 'SKILL', skill: skill, target: target, description: `[${target.instanceName}]에게 [${skill.name}] 스킬 사용` });
            }
        }
        console.log(`[CrisisEngine] ${unit.instanceName}이(가) 수행 가능한 ${actions.length}가지 행동 발견.`);
        return actions;
    }

    _evaluateActions(actions, unit, allies, enemies) {
        return actions.map(action => {
            const scores = { damage: 0, disruption: 0, support: 0, survival: 0 };
            if (action.type === 'SKILL') {
                const { skill, target } = action;
                const { damage } = combatCalculationEngine.calculateDamage(unit, target, skill);
                if (damage > 0 && target.team !== unit.team) {
                    scores.damage = Math.min(damage, target.currentHp) * 1.5;
                }
                if (skill.healMultiplier) {
                    const healAmount = statEngine.calculateHeal(unit, skill);
                    scores.support = healAmount;
                }
                if (skill.yinYangChange) {
                    const currentGauge = yinYangEngine.getGauge();
                    const futureGauge = currentGauge + skill.yinYangChange;
                    scores.disruption += Math.abs(50 - futureGauge) - Math.abs(50 - currentGauge);
                }
                if (skill.effect && (skill.effect.id === 'push' || skill.effect.id === 'pull')) {
                    scores.disruption += 20;
                }
            } else if (action.type === 'MOVE') {
                const { target } = action;
                const currentSafety = this._calculateSafetyScore(unit.gridX, unit.gridY, enemies);
                const futureSafety = this._calculateSafetyScore(target.col, target.row, enemies);
                scores.survival = futureSafety - currentSafety;
            }
            return { ...action, scores };
        });
    }

    _calculateSafetyScore(col, row, enemies) {
        if (enemies.length === 0) return 100;
        let totalDistance = 0;
        for (const enemy of enemies) {
            totalDistance += pathfinderEngine.getDistance(col, row, enemy.gridX, enemy.gridY);
        }
        return totalDistance / enemies.length;
    }

    _selectBestActionByMBTI(unit, scoredActions) {
        let mbtiKey = unit.mbti;
        if (typeof mbtiKey !== 'string' && mbtiKey) {
            mbtiKey = (mbtiKey.E > mbtiKey.I ? 'E' : 'I') +
                      (mbtiKey.S > mbtiKey.N ? 'S' : 'N') +
                      (mbtiKey.T > mbtiKey.F ? 'T' : 'F') +
                      (mbtiKey.J > mbtiKey.P ? 'J' : 'P');
        }
        const archetype = MBTI_ARCHETYPES[mbtiKey] || MBTI_ARCHETYPES['default'];
        const weights = archetype && archetype.crisisWeights;

        if (!weights) {
            console.error(`[CrisisEngine] ${mbtiKey}에 대한 crisisWeights가 정의되지 않았습니다.`);
            return scoredActions.length > 0 ? { ...scoredActions[0], finalScore: 0 } : null;
        }

        const weightedActions = scoredActions.map(action => {
            const finalScore =
                (action.scores.damage * weights.damage) +
                (action.scores.disruption * weights.disruption) +
                (action.scores.support * weights.support) +
                (action.scores.survival * weights.survival);
            return { ...action, finalScore };
        });

        if (weightedActions.length === 0) {
            return null;
        }

        return weightedActions.reduce((best, current) => (current.finalScore > best.finalScore) ? current : best);
    }
}

export const crisisEngine = new CrisisEngine();
