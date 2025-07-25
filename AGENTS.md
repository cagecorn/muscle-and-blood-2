YAGNI 원칙 ("You Ain't Gonna Need It") "야그니"라고 읽으며, "어차피 그거 필요 없을걸" 이라는 뜻입니다. 이는 반복적 개발의 핵심 철학 중 하나입니다.

내용: "나중에 필요할지도 모르는" 기능을 미리 예측해서 만들지 말라는 원칙입니다. 지금 당장 필요한 가장 단순한 기능에만 집중하고, 미래의 기능은 정말로 그것이 필요해지는 시점에 가서 구현하라는 의미입니다.

장점: 쓸데없는 기능을 만드는 데 시간을 낭비하지 않게 해줍니다. 코드가 불필요하게 복잡해지는 것을 막아주어 초보자에게 특히 유용합니다.

"나중에 상황 판단 AI가 필요할지 모르니 미리 복잡하게 만들자"가 아니라, "지금은 슬롯머신 기능만 필요하니 그것부터 만들자" 라고 접근하는 것이 바로 YAGNI 원칙을 따르는 것입니다.

대규모 패치(여러 모듈을 수정하거나 게임의 주요 기능을 추가하는 경우)를 적용한 뒤에는 항상 debug.html을 실행하여 기본 동작 여부를 확인합니다. GUI 브라우저를 사용할 수 없으므로, 다음 예시와 같이 로컬 서버를 띄운 후 curl로 내용을 읽어 확인합니다.

python3 -m http.server 8000 &
curl http://localhost:8000/debug.html | head -n 20
이 과정을 통해 에러가 없는지 살펴본 뒤에 PR을 제출해 주세요.

모듈화를 최우선적으로 고려하며 게임을 만들어주십시오.

각 클래스의 새로운 스킬이 추가될 때마다, 각 클래스의 스킬을 통합적으로 테스트하는 곳에 새로 추가 후 테스트할 것.
