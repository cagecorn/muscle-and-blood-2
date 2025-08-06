import StartGame from './game/main.js';
import { archetypeMemoryEngine } from './game/utils/ArchetypeMemoryEngine.js';

// [2차 강화학습 데이터] - 2025-08-06 로그 기반
const learnedData_v2 = {
    // ESTJ: 메딕/거너 선호도는 유지하되, 자신을 공격하는 전사/다크나이트에 대한 대응 가중치 소폭 상향
    'ESTJ': {
        'target_medic': { 'melee_weight': 1.4 },
        'target_gunner': { 'melee_weight': 1.3 },
        'target_warrior': { 'melee_weight': 1.1 }, // 근접 위협 대응력 +10%
        'target_darkKnight': { 'melee_weight': 1.1 }
    },
    // ESFJ: 탱커(센티넬, 전사) 공격 선호도를 낮추고, 지원가(메딕, 역병의사) 공격 선호도 상향
    'ESFJ': {
        'target_sentinel': { 'melee_weight': 0.7 }, // 탱커 공격 가중치 -30%
        'target_warrior': { 'melee_weight': 0.75 },
        'target_medic': { 'melee_weight': 1.2 }, // 지원가 공격 가중치 +20%
        'target_plagueDoctor': { 'melee_weight': 1.2 }
    },
    // INFP: 적 메딕과 팔라딘을 상대로 마법(디버프, 특히 '치료 금지') 사용 선호도 대폭 상향
    'INFP': {
        'target_warrior': { 'magic_weight': 1.25 },
        'target_medic': { 'magic_weight': 1.5 }, // 메딕 대상 마법(치료 금지) 가중치 +50%
        'target_paladin': { 'magic_weight': 1.4 }  // 팔라딘 대상 마법 가중치 +40%
    },
    // ENFP(거너): 원거리에서 이미 멀리 있는 적에 대한 공격 선호도를 낮춰, 불필요한 KINETIC 스킬 낭비 방지
    'ENFP': {
        'target_nanomancer': { 'ranged_weight': 0.8 }, // 원거리 딜러 대상 원거리 공격 가중치 -20%
        'target_esper': { 'ranged_weight': 0.8 }
    }
};

// 학습 데이터 적용 함수 (기존과 동일)
async function applyLearnedData() {
    console.log('AI 강화학습 v2 데이터를 적용합니다...');
    for (const [mbti, memory] of Object.entries(learnedData_v2)) {
        await archetypeMemoryEngine.updateMemory(mbti, memory);
    }
    console.log('모든 아키타입의 집단 기억이 성공적으로 업데이트되었습니다!');
}

document.addEventListener('DOMContentLoaded', async () => {
    await applyLearnedData();
    StartGame('game-container');
});

