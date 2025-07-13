// tests/unit/uiEngineUnitTests.js

import { UIEngine } from '../../js/managers/UIEngine.js';
import { MeasureManager } from '../../js/managers/MeasureManager.js';
import { EventManager } from '../../js/managers/EventManager.js';

export function runUIEngineUnitTests() {
    console.log("--- UIEngine Unit Test Start ---");

    let testCount = 0;
    let passCount = 0;

    const mockRenderer = {
        canvas: { width: 1280, height: 720, getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        ctx: {
            fillRect: function() { this.fillRectCalled = true; },
            fillText: function() { this.fillTextCalled = true; },
            clearRect: () => {}, save: () => {}, restore: () => {},
            font: '', textAlign: '', textBaseline: '', fillStyle: '',
            fillRectCalled: false, fillTextCalled: false
        }
    };
    const mockMeasureManager = new MeasureManager();
    const mockEventManager = new EventManager();

    // 테스트 1: 초기화 확인
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        if (uiEngine.renderer === mockRenderer && uiEngine.getUIState() === 'mapScreen') {
            console.log("UIEngine: Initialized correctly. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: Initialization failed. [FAIL]", uiEngine);
        }
    } catch (e) {
        console.error("UIEngine: Error during initialization. [FAIL]", e);
    }

    // 테스트 2: recalculateUIDimensions 호출 후 버튼 위치 확인
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        uiEngine.recalculateUIDimensions();

        const expectedButtonX = (mockRenderer.canvas.width - uiEngine.buttonWidth) / 2;
        const expectedButtonY = mockRenderer.canvas.height - uiEngine.buttonHeight - uiEngine.buttonMargin;

        if (uiEngine.battleStartButton.x === expectedButtonX && uiEngine.battleStartButton.y === expectedButtonY) {
            console.log("UIEngine: Recalculated UI dimensions and button position correctly. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: Button position recalculation failed. [FAIL]", uiEngine.battleStartButton);
        }
    } catch (e) {
        console.error("UIEngine: Error during recalculation. [FAIL]", e);
    }

    // 테스트 3: setUIState 및 getUIState
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        uiEngine.setUIState('combatScreen');
        if (uiEngine.getUIState() === 'combatScreen') {
            console.log("UIEngine: UI state set and retrieved correctly. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: Failed to set UI state. [FAIL]");
        }
    } catch (e) {
        console.error("UIEngine: Error setting/getting UI state. [FAIL]", e);
    }

    // 테스트 4: isClickOnButton - 버튼 클릭 성공
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        uiEngine.setUIState('mapScreen');
        const button = uiEngine.battleStartButton;
        const clickX = button.x + button.width / 2;
        const clickY = button.y + button.height / 2;

        if (uiEngine.isClickOnButton(clickX, clickY)) {
            console.log("UIEngine: isClickOnButton returned true for valid click. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: isClickOnButton failed for valid click. [FAIL]");
        }
    } catch (e) {
        console.error("UIEngine: Error during isClickOnButton success test. [FAIL]", e);
    }

    // 테스트 5: isClickOnButton - 버튼 클릭 실패 (다른 UI 상태)
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        uiEngine.setUIState('combatScreen');
        const button = uiEngine.battleStartButton;
        const clickX = button.x + button.width / 2;
        const clickY = button.y + button.height / 2;

        if (!uiEngine.isClickOnButton(clickX, clickY)) {
            console.log("UIEngine: isClickOnButton returned false for incorrect UI state. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: isClickOnButton failed for incorrect UI state. [FAIL]");
        }
    } catch (e) {
        console.error("UIEngine: Error during isClickOnButton (wrong state) test. [FAIL]", e);
    }

    // 테스트 6: handleBattleStartClick - 이벤트 발생 확인 (간접)
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        let eventEmitted = false;
        mockEventManager.subscribe('battleStart', () => { eventEmitted = true; });

        uiEngine.handleBattleStartClick();

        if (eventEmitted) {
            console.log("UIEngine: handleBattleStartClick emitted 'battleStart' event. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: handleBattleStartClick failed to emit 'battleStart' event. [FAIL]");
        }
    } catch (e) {
        console.error("UIEngine: Error during handleBattleStartClick test. [FAIL]", e);
    }

    // 테스트 7: draw 메서드 (mapScreen)
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        uiEngine.setUIState('mapScreen');
        mockRenderer.ctx.fillRectCalled = false;
        mockRenderer.ctx.fillTextCalled = false;

        uiEngine.draw(mockRenderer.ctx);

        if (mockRenderer.ctx.fillRectCalled && mockRenderer.ctx.fillTextCalled) {
            console.log("UIEngine: draw (mapScreen) called fillRect and fillText. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: draw (mapScreen) failed to call expected drawing ops. [FAIL]", { fillRect: mockRenderer.ctx.fillRectCalled, fillText: mockRenderer.ctx.fillTextCalled });
        }
    } catch (e) {
        console.error("UIEngine: Error during draw (mapScreen) test. [FAIL]", e);
    }

    // 테스트 8: draw 메서드 (combatScreen)
    testCount++;
    try {
        const uiEngine = new UIEngine(mockRenderer, mockMeasureManager, mockEventManager);
        uiEngine.setUIState('combatScreen');
        mockRenderer.ctx.fillRectCalled = false;
        mockRenderer.ctx.fillTextCalled = false;

        uiEngine.draw(mockRenderer.ctx);

        if (!mockRenderer.ctx.fillRectCalled && mockRenderer.ctx.fillTextCalled) {
            console.log("UIEngine: draw (combatScreen) called fillText. [PASS]");
            passCount++;
        } else {
            console.error("UIEngine: draw (combatScreen) failed to call expected drawing ops. [FAIL]", { fillRect: mockRenderer.ctx.fillRectCalled, fillText: mockRenderer.ctx.fillTextCalled });
        }
    } catch (e) {
        console.error("UIEngine: Error during draw (combatScreen) test. [FAIL]", e);
    }

    console.log(`--- UIEngine Unit Test End: ${passCount}/${testCount} tests passed ---`);
}
