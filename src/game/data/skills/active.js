// 액티브 스킬 데이터 정의
export const activeSkills = {
    charge: {
        id: 'charge',
        name: '차지',
        type: 'ACTIVE',
        cost: 2,
        description: '적에게 돌진하여 데미지를 주며 적을 2턴간 기절시킵니다.',
        illustrationPath: 'assets/images/skills/charge.png',
        requiredClass: 'warrior', // ✨ 전사 전용 설정
    },
};
