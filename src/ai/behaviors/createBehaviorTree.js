import { createISTJ_AI } from './createISTJ_AI.js';
import { createISFJ_AI } from './createISFJ_AI.js';
import { createINFJ_AI } from './createINFJ_AI.js';
import { createINTJ_AI } from './createINTJ_AI.js';
import { createISTP_AI } from './createISTP_AI.js';
import { createISFP_AI } from './createISFP_AI.js';
import { createINFP_AI } from './createINFP_AI.js';
import { createINTP_AI } from './createINTP_AI.js';
import { createESTP_AI } from './createESTP_AI.js';
import { createESFP_AI } from './createESFP_AI.js';
import { createENFP_AI } from './createENFP_AI.js';
import { createENTP_AI } from './createENTP_AI.js';
import { createESTJ_AI } from './createESTJ_AI.js';
import { createESFJ_AI } from './createESFJ_AI.js';
import { createENFJ_AI } from './createENFJ_AI.js';
import { createENTJ_AI } from './createENTJ_AI.js';
import { createFlyingmanAI } from './createFlyingmanAI.js';

/**
 * 유닛의 MBTI 유형에 따라 적절한 행동 트리를 생성하고 반환하는 공장 함수입니다.
 * @param {string} mbti - 유닛의 MBTI 유형 (예: 'ISTJ')
 * @param {Unit} unit - 행동 트리의 주체가 될 유닛
 * @param {Phaser.Scene} scene - 현재 씬
 * @param {AIManager} aiManager - AI 관리자
 * @returns {BehaviorTree} 생성된 행동 트리
 */
export function createBehaviorTree(mbti, unit, scene, aiManager) {
    // 유닛의 mbti 값에 따라 적절한 AI 생성 함수를 호출합니다.
    switch (mbti) {
        case 'ISTJ': return createISTJ_AI(unit, scene, aiManager);
        case 'ISFJ': return createISFJ_AI(unit, scene, aiManager);
        case 'INFJ': return createINFJ_AI(unit, scene, aiManager);
        case 'INTJ': return createINTJ_AI(unit, scene, aiManager);
        case 'ISTP': return createISTP_AI(unit, scene, aiManager);
        case 'ISFP': return createISFP_AI(unit, scene, aiManager);
        case 'INFP': return createINFP_AI(unit, scene, aiManager);
        case 'INTP': return createINTP_AI(unit, scene, aiManager);
        case 'ESTP': return createESTP_AI(unit, scene, aiManager);
        case 'ESFP': return createESFP_AI(unit, scene, aiManager);
        case 'ENFP': return createENFP_AI(unit, scene, aiManager);
        case 'ENTP': return createENTP_AI(unit, scene, aiManager);
        case 'ESTJ': return createESTJ_AI(unit, scene, aiManager);
        case 'ESFJ': return createESFJ_AI(unit, scene, aiManager);
        case 'ENFJ': return createENFJ_AI(unit, scene, aiManager);
        case 'ENTJ': return createENTJ_AI(unit, scene, aiManager);
        // MBTI가 아닌 특수 유닛 처리
        case 'Flyingman': return createFlyingmanAI(unit, scene, aiManager);
        default:
            console.warn(`[AI Factory] 알 수 없는 MBTI (${mbti}) 입니다. 기본 AI를 사용합니다.`);
            // 어떤 경우에도 대응할 수 있도록 기본 AI(예: ESTJ)를 반환합니다.
            return createESTJ_AI(unit, scene, aiManager);
    }
}
