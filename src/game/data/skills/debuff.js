// 디버프 스킬 데이터 정의
export const debuffSkills = {
    shieldBreak: {
        id: 'shieldBreak',
        name: '쉴드 브레이크',
        type: 'DEBUFF',
        cost: 2,
        description: '적에게 5턴간 물리방어력 감소 5%의 디버프를 겁니다. 최대 중첩 25%',
        illustrationPath: 'assets/images/skills/shield-break.png',
        requiredClass: 'warrior', // ✨ 전사 전용 설정
    },
};
