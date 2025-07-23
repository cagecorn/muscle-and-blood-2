// 버프 스킬 데이터 정의
export const buffSkills = {
    stoneSkin: {
        id: 'stoneSkin',
        name: '스톤 스킨',
        type: 'BUFF',
        cost: 1,
        description: '5턴간 자기 자신에게 데미지 감소 5%의 버프를 겁니다. 최대 중첩 25%',
        illustrationPath: 'assets/images/skills/ston-skin.png',
        requiredClass: 'warrior', // ✨ 전사 전용 설정
    },
};
