// 文字貪食蛇 - 聖誕祝福版 v1.0
const GAME_CONFIG = {
    // 固定網格設定 - 優化移動端可讀性
    GRID_COLS: 16,
    GRID_ROWS: 22,

    // 遊戲核心參數
    DEFAULT_SPEED: 8,
    GAME_DURATION: 60,
    FOOD_CHANGE_INTERVAL: 7500,              // 延長字符變換間隔，增加收集機會
    FRAME_RATE: 16,

    // 聖誕字符系統配置 - 優化任務完成機會
    INITIAL_FOOD_COUNT: 8,                    // 調整字符數量以適應縮小的網格
    MAX_SPAWN_ATTEMPTS: 100,
    CORE_CHRISTMAS_PROBABILITY: 0.55,         // 提高核心聖誕字符出現概率

    // 響應式設計
    RESPONSIVE_TEXT_RATIO: 0.7,
    MOBILE_BREAKPOINT: 480,
    TABLET_BREAKPOINT: 768,

    // 聖誕夜空背景顏色配置 - 透明度設定以不干擾 CSS 漸層背景
    CANVAS_BACKGROUND_ALPHA: 0,                  // 透明背景讓CSS控制
    DEFAULT_BACKGROUND_COLOR: 'transparent',      // 使用透明背景
    BORDER_COLOR: [1, 51, 51],                   // 深藍邊框色 #013333

    // Canvas 邊距
    CANVAS_PADDING: 40
};

// 遊戲狀態變數
let cell, cols = GAME_CONFIG.GRID_COLS, rows = GAME_CONFIG.GRID_ROWS;
let snake, dir = 'RIGHT', foods = [], speed = 8, t = 0, timer = 60;
let stat = { faith: 0, love: 0, hope: 0, peace: 0, joy: 0, praise: 0, wisdom: 0, trust: 0 }, ate = [];
let completedPhrases = []; // 存儲完成的詞句
let phraseHintShown = false; // 是否已顯示詞句提示
let effectUntil = 0, postEffect = null;
let collectedChars = [];
let collectedCharTypes = [];
let foodChangeTimer = 0;
let gameFont = 'sans-serif';
let responsiveTextRatio = GAME_CONFIG.RESPONSIVE_TEXT_RATIO;
let gameState = 'START';
let isPaused = false;
let gameBackgroundTransparent = true; // 使用透明背景讓CSS控制
let previousScreen = 'START';
let difficulty = 'easy';

// 連擊系統變數
let comboCount = 0;
let lastCharTime = 0;
let comboTimeWindow = 3000; // 3秒內的連續收集算連擊

// 蛇頭動態變色系統
let snakeHeadColor = 'default';  // 目前蛇頭顏色狀態
let colorChangeStartTime = 0;    // 變色開始時間
let colorChangeDuration = 2000;  // 變色持續時間 (2秒)

// 箭頭蛇頭顏色配置
const ARROW_HEAD_COLORS = {
    default: {
        fill: [255, 215, 0],      // 聖誕金色
        stroke: [184, 134, 11],   // 深金色邊框
        accent: [255, 255, 255]   // 白色裝飾
    },
    faith: {
        fill: [255, 235, 59],     // 明亮金黃 - 信仰光芒
        stroke: [230, 126, 34],   // 橙金色邊框
        accent: [255, 255, 255]   // 白色十字裝飾
    },
    christmas: {
        fill: [244, 67, 54],      // 聖誕紅
        stroke: [183, 28, 28],    // 深紅邊框  
        accent: [255, 255, 255]   // 白色雪花裝飾
    },
    blessing: {
        fill: [156, 39, 176],     // 祝福紫
        stroke: [106, 27, 154],   // 深紫邊框
        accent: [255, 215, 0]     // 金色愛心裝飾
    },
    praise: {
        fill: [255, 255, 255],    // 純白 - 讚美光輝
        stroke: [189, 189, 189],  // 銀色邊框
        accent: [255, 215, 0]     // 金色星星裝飾
    },
    sharing: {
        fill: [255, 105, 180],    // 溫暖粉紅
        stroke: [219, 39, 119],   // 深粉邊框
        accent: [255, 255, 255]   // 白色心形裝飾
    }
};

// 伯利恆之星系統
let bethlehemStar = {
    x: 0, y: 0,                    // 當前位置
    targetX: 0, targetY: 0,        // 目標位置
    brightness: 1.0,               // 亮度 (0-1)
    haloSize: 0,                   // 光暈大小
    moveSpeed: 0.002,              // 基礎移動速度
    currentMoveSpeed: 0.002,       // 當前移動速度（可變）
    breatheSpeed: 0.01,            // 呼吸頻率
    phase: 0,                      // 動畫相位
    lastTargetChange: 0,           // 上次改變目標的時間
    enabled: true,                 // 是否啟用星星
    specialEffect: false,          // 特殊效果狀態
    specialEffectEnd: 0            // 特殊效果結束時間
};
const DIFFICULTY_SETTINGS = {
    easy: {
        name: '平安夜',
        speedMultiplier: 0.6,
        description: '緩慢享受聖誕寧靜',
        color: '#4CAF50'
    },
    normal: {
        name: '聖誕晨',
        speedMultiplier: 0.8,
        description: '正常的慶祝節奏',
        color: '#FF9800'
    },
    hard: {
        name: '報佳音',
        speedMultiplier: 1.1,
        description: '積極傳揚喜訊的速度',
        color: '#F44336'
    }
};

// 實用工具函數
const Utils = {
    // 安全的數學運算
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // 隨機整數
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 檢查位置是否在邊界內
    isValidPosition(x, y, cols, rows) {
        return x >= 0 && x < cols && y >= 0 && y < rows;
    },

    // 檢查兩個位置是否相同
    isSamePosition(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    },

    // 將十六進制顏色轉換為 RGB 陣列
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }
};

// DOM 元素管理器
const DOMManager = {
    elements: {},

    // 初始化時快取所有常用元素
    init() {
        this.elements = {
            // HUD 元素
            time: select('#time'),
            len: select('#len'),
            fontInfo: select('#font-info'),

            // 畫面元素
            startScreen: select('#start-screen'),
            countdownScreen: select('#countdown-screen'),
            countdownNumber: select('#countdown-number'),
            directionHint: select('#direction-hint'),
            helpScreen: select('#help-screen'),
            overScreen: select('#over'),

            // 按鈕元素
            startButton: select('#start-button'),
            helpButton: select('#help-button'),
            helpFromEndButton: select('#help-from-end-button'),
            helpBackButton: select('#help-back-button'),

            // 內容容器
            foodCategories: select('#food-categories'),
            list: select('#list'),
            report: select('#report'),
            nutritionChart: select('#nutritionChart')
        };

        // 移除不存在的元素
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                console.warn(`DOM元素不存在: #${key}`);
                delete this.elements[key];
            }
        });
    },

    // 安全獲取元素
    get(elementKey) {
        return this.elements[elementKey] || null;
    },

    // 設定元素內容
    setContent(elementKey, content) {
        const element = this.get(elementKey);
        if (element) {
            element.html(content);
        }
    },

    // 設定元素樣式
    setStyle(elementKey, property, value) {
        const element = this.get(elementKey);
        if (element) {
            element.style(property, value);
        }
    },

    // 顯示/隱藏元素
    show(elementKey) {
        this.setStyle(elementKey, 'display', 'flex');
    },

    hide(elementKey) {
        this.setStyle(elementKey, 'display', 'none');
    }
};

// 聖誕祝福主題色彩系統 - 優化對比度版本
const FOOD_COLORS = {
    // 📿 信仰核心：金色系（優化對比度）
    faith: {
        background: '#FFE55C',  // 更深的金黃色背景
        border: '#B8860B',      // 深金色邊框
        text: '#4A4A00'         // 深棕色文字（高對比度）
    },
    // ⭐ 聖誕慶典：亮黃系（優化對比度）
    christmas: {
        background: '#FFF570',  // 鮮明黃色背景
        border: '#FF8C00',      // 橙色邊框
        text: '#8B4500'         // 深棕橙色文字
    },
    // 🎁 祝福話語：紅色系（優化對比度）
    blessing: {
        background: '#FFB3BA',  // 柔和粉紅背景
        border: '#DC143C',      // 深紅色邊框
        text: '#8B0000'         // 深紅色文字（保持）
    },
    // 🕊️ 讚美敬拜：白銀系（優化對比度）
    praise: {
        background: '#E8E8E8',  // 淺灰背景
        border: '#708090',      // 石板灰邊框
        text: '#2F2F2F'         // 深灰色文字（提高對比度）
    },
    // ❤️ 愛的分享：粉紅系（優化對比度）
    sharing: {
        background: '#FFCCCB',  // 淺珊瑚粉背景
        border: '#FF1493',      // 深粉紅邊框
        text: '#8B008B'         // 深洋紅文字（保持）
    },
    // 預設（其他類型）- 優化對比度
    default: {
        background: '#DCDCDC',  // 淺灰色背景
        border: '#708090',      // 石板灰邊框
        text: '#2F2F2F'         // 深灰色文字
    }
};

// 根據字符判斷聖誕祝福類型
function getFoodType(char) {
    // 直接從 ITEMS.effects 中獲取 kind 屬性
    const effect = ITEMS.effects[char];
    if (!effect || !effect.kind) return 'default';

    return effect.kind; // 返回 faith, christmas, blessing, praise, sharing 等
}

// 取得食物顏色
function getFoodColor(char) {
    const type = getFoodType(char);
    const color = FOOD_COLORS[type] || FOOD_COLORS.default;

    // 確保顏色物件完整
    if (!color || !color.background || !color.border || !color.text) {
        console.warn(`食物顏色不完整: char=${char}, type=${type}`, color);
        return FOOD_COLORS.default;
    }

    return color;
}

// 聖誕祝福字符選擇函數 - 智能化生成系統
function getWeightedFood() {
    // 智能字符生成：優先生成玩家需要的字符
    const neededChars = getNeededCharacters();
    
    // 如果有需要的字符且隨機數滿足條件，優先生成需要的字符
    if (neededChars.length > 0 && random() < 0.4) {
        return random(neededChars);
    }
    
    // 定義核心信仰字符（更高出現機率）
    const coreChristmasChars = ['聖', '誕', '快', '樂', '主', '神', '愛', '信'];

    // 使用配置中的核心字符出現機率
    if (random() < GAME_CONFIG.CORE_CHRISTMAS_PROBABILITY) {
        return random(coreChristmasChars);
    } else {
        // 從所有聖誕字符池中選擇
        return random(ITEMS.pool);
    }
}

// 獲取玩家當前需要的字符
function getNeededCharacters() {
    const progressData = analyzePhraseProgress();
    const neededChars = new Set();
    
    // 收集所有進度中缺少的字符
    progressData.forEach(data => {
        if (data.progress >= 0.25) { // 只考慮已有進度的詞句
            data.missingChars.forEach(char => neededChars.add(char));
        }
    });
    
    return Array.from(neededChars);
}

// 初始化系統
function initializeDependencies() {
    if (!window.ITEMS) {
        console.error('ITEMS 物件未載入，請檢查 items.js');
        return false;
    }
    if (!window.Ending) {
        console.error('Ending 物件未載入，請檢查 ending.js');
        return false;
    }
    return true;
}

function initializeCanvas() {
    const canvasSize = calculateOptimalCanvasSize();
    createCanvas(canvasSize.width, canvasSize.height);
    frameRate(GAME_CONFIG.FRAME_RATE);

    // 使用透明背景讓 CSS 聖誕夜空漸層顯示
    clear();

    // 使用計算後的實際網格尺寸和cell大小
    cell = canvasSize.cellSize;
    cols = canvasSize.gridCols;
    rows = canvasSize.gridRows;

    console.log(`Canvas初始化: ${canvasSize.width}x${canvasSize.height}, Cell大小: ${cell}, 網格: ${cols}x${rows}`);
    console.log(`Cell驗證: 每個cell為 ${cell}x${cell}px 正方形`);
}

function calculateOptimalCanvasSize() {
    // 檢測設備類型
    const isMobile = windowWidth <= GAME_CONFIG.MOBILE_BREAKPOINT;
    const isTablet = windowWidth > GAME_CONFIG.MOBILE_BREAKPOINT && windowWidth <= GAME_CONFIG.TABLET_BREAKPOINT;
    const isDesktop = windowWidth > GAME_CONFIG.TABLET_BREAKPOINT;

    // 根據設備類型設定邊距和可用空間
    let horizontalPadding, verticalReduction, maxCellSize, minCellSize;

    if (isMobile) {
        // 手機：預留更多垂直空間給控制按鈕和 HUD
        horizontalPadding = windowWidth <= 375 ? 8 : 12; // iPhone SE使用8px，其他手機12px
        verticalReduction = windowHeight <= 667 ? 320 : 340; // 增加垂直空間預留，避免遊戲內容與控制按鈕重疊
        maxCellSize = 35;  // 提高最大cell大小以改善可讀性
        minCellSize = 16;  // 提高最小cell大小確保更好的可讀性
    } else if (isTablet) {
        // 平板：適中邊距，預留控制按鈕空間
        horizontalPadding = 20;
        verticalReduction = 260; // 增加垂直空間預留
        maxCellSize = 32;
        minCellSize = 16;
    } else {
        // 桌面：標準邊距，預留控制按鈕空間
        horizontalPadding = GAME_CONFIG.CANVAS_PADDING;
        verticalReduction = 240; // 增加垂直空間預留
        maxCellSize = 28;
        minCellSize = 18;
    }

    const availableWidth = windowWidth - (horizontalPadding * 2);
    const availableHeight = windowHeight - verticalReduction;

    // 確定最終網格尺寸（考慮小螢幕優化）
    let finalGridCols = GAME_CONFIG.GRID_COLS;
    let finalGridRows = GAME_CONFIG.GRID_ROWS;
    
    if (isMobile && windowHeight <= 700) {
        // 小螢幕設備調整網格行數，保持遊戲平衡
        const heightReduction = 0.75;
        finalGridRows = Math.floor(GAME_CONFIG.GRID_ROWS * heightReduction);
        console.log(`小螢幕網格優化: 行數從 ${GAME_CONFIG.GRID_ROWS} 調整為 ${finalGridRows}`);
    }

    // 基於最終網格尺寸計算cell大小
    const cellSizeByWidth = Math.floor(availableWidth / finalGridCols);
    const cellSizeByHeight = Math.floor(availableHeight / finalGridRows);

    // 智能選擇cell大小：確保正方形cell
    let optimalCellSize = Math.min(cellSizeByWidth, cellSizeByHeight);
    
    if (isMobile) {
        // 手機：如果寬度能提供更大的cell但仍在合理範圍內，優先考慮寬度
        if (cellSizeByWidth <= maxCellSize && cellSizeByWidth > optimalCellSize) {
            optimalCellSize = cellSizeByWidth;
        }
    }

    // 確保cell大小在合理範圍內
    optimalCellSize = Math.max(minCellSize, Math.min(maxCellSize, optimalCellSize));

    // 計算最終Canvas尺寸（基於實際網格和cell大小）
    const finalCanvasWidth = optimalCellSize * finalGridCols;
    const finalCanvasHeight = optimalCellSize * finalGridRows;

    const deviceType = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';
    const screenUtilization = ((finalCanvasWidth / windowWidth) * 100).toFixed(1);

    console.log(`Canvas計算 - 設備：${deviceType}`);
    console.log(`  視窗：${windowWidth}x${windowHeight}px`);
    console.log(`  邊距：H${horizontalPadding}px, V-${verticalReduction}px`);
    console.log(`  可用空間：${availableWidth}x${availableHeight}px`);
    console.log(`  最終網格：${finalGridCols}x${finalGridRows}`);
    console.log(`  Cell計算：寬度${cellSizeByWidth}px, 高度${cellSizeByHeight}px, 選用${optimalCellSize}px`);
    console.log(`  最終Canvas：${finalCanvasWidth}x${finalCanvasHeight}px`);
    console.log(`  Cell驗證：寬度比=${(finalCanvasWidth/finalGridCols).toFixed(1)}px, 高度比=${(finalCanvasHeight/finalGridRows).toFixed(1)}px`);
    console.log(`  螢幕寬度利用率：${screenUtilization}%`);

    // 提供設備特定的優化建議和警告
    if (isMobile) {
        if (optimalCellSize < 16) {
            console.warn('⚠️  手機cell大小偏小，可能影響操作體驗');
        } else if (optimalCellSize >= 25) {
            console.info('✅ 手機cell大小良好，遊戲體驗佳');
        }

        if (screenUtilization < 80) {
            console.warn(`⚠️  螢幕寬度利用率偏低(${screenUtilization}%)，建議檢查邊距設置`);
        } else {
            console.info(`✅ 螢幕利用率良好(${screenUtilization}%)`);
        }

        // 驗證cell是否為正方形
        const widthRatio = finalCanvasWidth / finalGridCols;
        const heightRatio = finalCanvasHeight / finalGridRows;
        if (Math.abs(widthRatio - heightRatio) < 0.1) {
            console.info('✅ Cell為完美正方形');
        } else {
            console.warn(`⚠️  Cell可能拉伸: 寬${widthRatio.toFixed(1)}px vs 高${heightRatio.toFixed(1)}px`);
        }
    }

    return {
        width: finalCanvasWidth,
        height: finalCanvasHeight,
        cellSize: optimalCellSize,
        gridCols: finalGridCols,
        gridRows: finalGridRows
    };
}

function initializeGameSettings() {
    gameFont = detectAndSetFont();

    // 使用透明背景讓 CSS 聖誕夜空漸層顯示
    clear();

    console.log('使用字體：', gameFont);
    console.log('聖誕夜空背景：由 CSS 控制');

    DOMManager.setContent('fontInfo', gameFont);
}

function setupControls() {
    setupVirtualButtons();
    setupKeyboardControls();
    setupGameButtons();
    setupDifficultySelector();
    // 設置 Canvas 事件過濾器防止攔截按鈕事件
    setupCanvasEventFilter();
    // 設置全域觸控事件委託作為備用方案
    setupGlobalTouchDelegate();
}

// 智能觸控事件管理器
function setupCanvasEventFilter() {
    const canvas = document.querySelector('canvas:not(#nutritionChart)');
    if (!canvas) return;

    // 獲取按鈕區域信息
    function getButtonAreas() {
        const pad = document.getElementById('pad');
        if (!pad) return [];
        
        const padRect = pad.getBoundingClientRect();
        const buttonIds = ['L', 'R', 'U', 'D'];
        
        return buttonIds.map(id => {
            const button = document.getElementById(id);
            if (!button) return null;
            
            const rect = button.getBoundingClientRect();
            return {
                id,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2,
                radius: Math.max(rect.width, rect.height) / 2 + 10 // 增加10px緩衝區
            };
        }).filter(Boolean);
    }

    // 檢查觸控點是否在按鈕區域內
    function isTouchInButtonArea(x, y) {
        const buttonAreas = getButtonAreas();
        return buttonAreas.some(area => {
            const distance = Math.sqrt(
                Math.pow(x - area.centerX, 2) + Math.pow(y - area.centerY, 2)
            );
            return distance <= area.radius;
        });
    }

    // 攔截 Canvas 上可能影響按鈕的觸控事件
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            if (isTouchInButtonArea(touch.clientX, touch.clientY)) {
                e.preventDefault();
                e.stopPropagation();
                console.log('⚠️ Canvas 觸控事件被攔截，保護按鈕區域');
            }
        }
    }, { passive: false });

    console.log('✅ Canvas 事件過濾器已啟用');
}

// 全域觸控事件委託系統（備用方案）
function setupGlobalTouchDelegate() {
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length === 0) return;
        
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // 檢查是否觸控到虛擬按鈕
        if (target && target.closest('#pad')) {
            const button = target.closest('button');
            if (button && button.id) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                const directionMap = {
                    'L': 'LEFT',
                    'R': 'RIGHT', 
                    'U': 'UP',
                    'D': 'DOWN'
                };
                
                const direction = directionMap[button.id];
                if (direction) {
                    changeDirection(direction);
                    
                    // 視覺反饋
                    button.classList.add('touched');
                    setTimeout(() => {
                        button.classList.remove('touched');
                    }, 150);
                    
                    console.log(`🎯 全域委託觸發方向: ${direction}`);
                }
            }
        }
    }, { passive: false, capture: true });
    
    console.log('✅ 全域觸控事件委託已啟用');
}

function setupVirtualButtons() {
    const buttonMappings = [
        { id: 'L', direction: 'LEFT' },
        { id: 'R', direction: 'RIGHT' },
        { id: 'U', direction: 'UP' },
        { id: 'D', direction: 'DOWN' }
    ];

    buttonMappings.forEach(({ id, direction }) => {
        const button = document.getElementById(id);
        if (button) {
            // 使用原生 JavaScript 事件以提供更好的跨平台支持
            const handleDirection = (e) => {
                e.preventDefault(); // 防止預設行為（如滾動）
                e.stopPropagation(); // 防止事件冒泡
                changeDirection(direction);
                console.log(`方向鍵觸發: ${direction}`); // 調試用
            };

            // 添加多種事件類型以確保跨設備兼容性
            // 使用 capture 模式確保按鈕事件優先處理
            button.addEventListener('click', handleDirection, { passive: false, capture: true });
            button.addEventListener('touchstart', (e) => {
                // 強制停止事件冒泡，防止被 Canvas 攔截
                e.stopImmediatePropagation();
                e.preventDefault();
                
                // 添加視覺反饋
                button.classList.add('touched');
                handleDirection(e);
                
                console.log(`🎯 按鈕 ${id} touchstart 事件成功觸發`);
            }, { passive: false, capture: true });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 移除視覺反饋
                setTimeout(() => {
                    button.classList.remove('touched');
                }, 150);
            }, { passive: false });
            
            // 防止 iOS 上的雙擊縮放和意外滾動
            button.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });

            // 防止 iOS 上的長按選單
            button.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });

            console.log(`✅ 按鈕 ${id} 事件已綁定`);
        } else {
            console.warn(`找不到按鈕元素: ${id}`);
        }
    });
}

function setupKeyboardControls() {
    window.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    // 暫停功能
    if (event.key === 'p' || event.key === 'P') {
        if (gameState === 'PLAYING') {
            event.preventDefault();
            togglePause();
        }
        return;
    }

    // 方向鍵控制
    if (gameState === 'PLAYING' && !isPaused) {
        const keyDirectionMap = {
            'ArrowLeft': 'LEFT',
            'ArrowRight': 'RIGHT',
            'ArrowUp': 'UP',
            'ArrowDown': 'DOWN'
        };

        if (keyDirectionMap[event.key]) {
            event.preventDefault();
            changeDirection(keyDirectionMap[event.key]);
        }
    }
}

function setupGameButtons() {
    const startButton = DOMManager.get('startButton');
    if (startButton) {
        startButton.mousePressed(startGame);
    }

    setupHelpButtons();
}

function setup() {
    try {
        if (!initializeDependencies()) return;

        console.log('Setup開始 - 聖誕夜空背景由 CSS 控制');

        DOMManager.init();
        initializeCanvas(); // 這裡會設定 cell 變數
        initializeGameSettings();
        resetGame();
        setupControls();
        initializeBethlehemStar();

        // 使用透明背景讓 CSS 聖誕夜空顯示
        clear();

        // 啟用持續繪製以顯示動畫效果
        loop();

        console.log('遊戲初始化完成 - 聖誕夜空背景');
        validateGameConfig();
    } catch (error) {
        console.error('遊戲初始化時發生錯誤:', error);
    }
}

// 驗證配置常數是否正確載入
function validateGameConfig() {
    console.log('=== 遊戲配置驗證 ===');

    const requiredConfigs = [
        'GRID_COLS', 'GRID_ROWS', 'DEFAULT_SPEED', 'GAME_DURATION', 'FOOD_CHANGE_INTERVAL',
        'RESPONSIVE_TEXT_RATIO', 'DEFAULT_BACKGROUND_COLOR', 'FRAME_RATE',
        'INITIAL_FOOD_COUNT', 'MAX_SPAWN_ATTEMPTS', 'CORE_CHRISTMAS_PROBABILITY',
        'MOBILE_BREAKPOINT', 'TABLET_BREAKPOINT', 'CANVAS_PADDING'
    ];

    requiredConfigs.forEach(config => {
        if (GAME_CONFIG[config] !== undefined) {
            console.log(`✓ ${config}: ${GAME_CONFIG[config]}`);
        } else {
            console.error(`✗ 缺少配置: ${config}`);
        }
    });

    // 驗證響應式畫布配置
    console.log('=== 響應式畫布配置驗證 ===');
    const canvasSize = calculateOptimalCanvasSize();
    console.log(`✓ 計算出的畫布大小: ${canvasSize.width}x${canvasSize.height}`);
    console.log(`✓ Cell 大小: ${canvasSize.cellSize}px`);
    console.log(`✓ 文字大小: ${getResponsiveTextSize()}px`);

    // 驗證設備檢測
    const isMobile = windowWidth <= GAME_CONFIG.MOBILE_BREAKPOINT;
    const isTablet = windowWidth > GAME_CONFIG.MOBILE_BREAKPOINT && windowWidth <= GAME_CONFIG.TABLET_BREAKPOINT;
    const deviceType = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';
    console.log(`✓ 設備類型: ${deviceType} (視窗: ${windowWidth}x${windowHeight})`);

    console.log('=== 配置驗證完成 ===');
}

function startGame() {
    // 先重置遊戲狀態確定最終佈局（在倒數前）
    resetGame();
    
    // 隱藏起始視窗
    DOMManager.hide('startScreen');

    // 顯示倒數視窗（此時玩家看到的就是最終遊戲佈局）
    DOMManager.show('countdownScreen');
    DOMManager.setContent('countdownNumber', 5);
    
    // 設置方向提示
    const directionText = {
        'UP': '⬆️ 向上開始',
        'DOWN': '⬇️ 向下開始', 
        'LEFT': '⬅️ 向左開始',
        'RIGHT': '➡️ 向右開始'
    };
    DOMManager.setContent('directionHint', directionText[dir]);

    // GA4 事件追蹤：遊戲開始
    if (typeof gtag !== 'undefined') {
        gtag('event', 'game_start', {
            'event_category': 'engagement',
            'event_label': 'christmas_snake_game',
            'difficulty': difficulty
        });
    }

    let count = 5;
    let countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            DOMManager.setContent('countdownNumber', count);
        } else {
            clearInterval(countdownInterval);
            DOMManager.hide('countdownScreen');
            // 設置遊戲狀態為正在遊戲（不再重複 resetGame）
            gameState = 'PLAYING';
            // 使用透明背景讓 CSS 控制
            clear();
            loop();
            console.log('遊戲開始！遊戲佈局與倒數預覽一致');
        }
    }, 1000);

    // 如果找不到倒數視窗元素則直接開始
    if (!DOMManager.get('countdownScreen') || !DOMManager.get('countdownNumber')) {
        gameState = 'PLAYING';
        // 使用透明背景讓 CSS 控制
        clear();
        loop();
        console.log('遊戲開始！');
    }
}

// 伯利恆之星初始化
function initializeBethlehemStar() {
    // 檢查無障礙設計偏好和性能設置
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowPerformance = window.reducedAnimations || false;
    
    if (prefersReducedMotion) {
        bethlehemStar.enabled = false;
        console.log('⚠️ 偵測到用戶偏好減少動畫，伯利恆之星已停用');
        return;
    }
    
    if (!bethlehemStar.enabled) return;
    
    // 根據設備性能調整參數
    if (isLowPerformance) {
        bethlehemStar.moveSpeed = 0.003;     // 提高低性能設備移動速度
        bethlehemStar.breatheSpeed = 0.02;   // 提高低性能設備呼吸速度
    } else {
        bethlehemStar.moveSpeed = 0.006;     // 提高正常移動速度
        bethlehemStar.breatheSpeed = 0.03;   // 提高正常呼吸速度
    }
    
    bethlehemStar.currentMoveSpeed = bethlehemStar.moveSpeed;
    
    // 設定隨機初始位置（整個天空區域）
    const skyAreaWidth = cols * cell;
    const skyAreaHeight = rows * cell * 0.6; // 天空區域為上60%
    
    bethlehemStar.x = random(skyAreaWidth * 0.1, skyAreaWidth * 0.9);
    bethlehemStar.y = random(skyAreaHeight * 0.05, skyAreaHeight * 0.8);
    bethlehemStar.targetX = bethlehemStar.x;
    bethlehemStar.targetY = bethlehemStar.y;
    bethlehemStar.lastTargetChange = millis();
    bethlehemStar.phase = random(0, TWO_PI); // 隨機初始相位
    bethlehemStar.brightness = 0.7 + random(0.2); // 隨機初始亮度
    bethlehemStar.haloSize = 12 + random(8); // 隨機初始光暈大小
    bethlehemStar.specialEffect = false;
    bethlehemStar.specialEffectEnd = 0;
    
    console.log('✨ 伯利恆之星已初始化 - 增強效果');
}

// 伯利恆之星更新邏輯
function updateBethlehemStar() {
    if (!bethlehemStar.enabled) return;
    
    // 根據遊戲狀態調整行為
    let moveSpeedMultiplier = 1;
    let breatheSpeedMultiplier = 1;
    
    switch(gameState) {
        case 'START':
            moveSpeedMultiplier = 1.5;  // 開始頁面較活躍
            break;
        case 'PLAYING':
            if (isPaused) {
                moveSpeedMultiplier = 0;  // 暫停時不移動
                breatheSpeedMultiplier = 0.3;  // 緩慢呼吸
            } else {
                moveSpeedMultiplier = 0.8;  // 遊戲中較溫和
            }
            break;
        case 'OVER':
            moveSpeedMultiplier = 0.5;  // 結束時緩慢
            // 移動到祝福位置（中上方）
            bethlehemStar.targetX = cols * cell * 0.5;
            bethlehemStar.targetY = rows * cell * 0.15;
            break;
    }
    
    // 特殊效果處理
    if (bethlehemStar.specialEffect && millis() < bethlehemStar.specialEffectEnd) {
        breatheSpeedMultiplier = 3;  // 特殊效果時快速閃爍
    } else {
        bethlehemStar.specialEffect = false;
    }
    
    // 每4-8秒隨機選擇新的目標位置（正常狀態下）- 更頻繁的移動
    if (gameState !== 'OVER' && millis() - bethlehemStar.lastTargetChange > random(4000, 8000)) {
        // 選擇新的目標位置（更廣闊的天空區域移動）
        const skyAreaWidth = cols * cell;
        const skyAreaHeight = rows * cell * 0.7; // 擴大天空區域到70%
        
        // 完全隨機的位置選擇
        bethlehemStar.targetX = random(skyAreaWidth * 0.05, skyAreaWidth * 0.95);
        bethlehemStar.targetY = random(skyAreaHeight * 0.02, skyAreaHeight * 0.85);
        bethlehemStar.lastTargetChange = millis();
        
        // 隨機調整移動速度，讓每次移動都有不同感覺
        const speedVariation = random(0.8, 1.4);
        bethlehemStar.currentMoveSpeed = bethlehemStar.moveSpeed * speedVariation;
    }
    
    // 移動到目標位置（使用可變速度）
    if (moveSpeedMultiplier > 0) {
        const currentSpeed = bethlehemStar.currentMoveSpeed || bethlehemStar.moveSpeed;
        bethlehemStar.x = lerp(bethlehemStar.x, bethlehemStar.targetX, currentSpeed * moveSpeedMultiplier);
        bethlehemStar.y = lerp(bethlehemStar.y, bethlehemStar.targetY, currentSpeed * moveSpeedMultiplier);
    }
    
    // 增強的呼吸般亮度變化
    bethlehemStar.phase += bethlehemStar.breatheSpeed * breatheSpeedMultiplier;
    
    // 更明顯的呼吸效果：亮度變化範圍從 0.3-1.0
    bethlehemStar.brightness = 0.3 + 0.7 * (0.5 + 0.5 * sin(bethlehemStar.phase));
    
    // 更明顯的光暈大小變化：從 8 到 28
    bethlehemStar.haloSize = 8 + 20 * (0.5 + 0.5 * sin(bethlehemStar.phase * 0.8));
    
    // 添加額外的閃爍效果
    const flickerPhase = bethlehemStar.phase * 2.3;
    const flickerIntensity = 0.1 + 0.1 * sin(flickerPhase);
    bethlehemStar.brightness += flickerIntensity;
}

// 伯利恆之星繪製函數
function drawBethlehemStar() {
    if (!bethlehemStar.enabled) return;
    
    push();
    
    const starX = bethlehemStar.x;
    const starY = bethlehemStar.y;
    const alpha = bethlehemStar.brightness;
    const baseHaloSize = bethlehemStar.haloSize;
    
    // 檢查性能優化設置和響應式調整
    const isLowPerformance = window.reducedAnimations || false;
    const isMobile = windowWidth <= GAME_CONFIG.MOBILE_BREAKPOINT;
    const haloLayers = isLowPerformance ? 3 : (isMobile ? 5 : 8);
    
    // 響應式大小調整
    const sizeMultiplier = isMobile ? 0.7 : 1.0;
    const adjustedHaloSize = baseHaloSize * sizeMultiplier;
    
    // 外層大光暈（溫柔擴散）- 多層繪製營造柔和效果
    for (let i = 0; i < haloLayers; i++) {
        const r = adjustedHaloSize * (1.5 - i * 0.15);
        const haloAlpha = alpha * (1 - i / haloLayers) * 0.08;
        
        fill(255, 215, 0, haloAlpha * 255);
        noStroke();
        ellipse(starX, starY, r * 2);
    }
    
    // 中層光暈（金色核心）
    fill(255, 215, 0, alpha * 80);
    noStroke();
    ellipse(starX, starY, 12 * sizeMultiplier);
    
    // 星星光芒（十字形 + 對角線）- 響應式調整
    const rayLength = 10 * sizeMultiplier;
    const rayShort = 7 * sizeMultiplier;
    const rayVeryShort = 6 * sizeMultiplier;
    
    stroke(255, 255, 255, alpha * 200);
    strokeWeight(1.5 * sizeMultiplier);
    
    // 主十字光芒
    line(starX, starY - rayLength, starX, starY + rayLength);  // 垂直
    line(starX - rayLength, starY, starX + rayLength, starY);  // 水平
    
    // 對角光芒
    line(starX - rayShort, starY - rayShort, starX + rayShort, starY + rayShort);  // 左上到右下
    line(starX - rayShort, starY + rayShort, starX + rayShort, starY - rayShort);  // 左下到右上
    
    // 較短的次要光芒
    stroke(255, 255, 255, alpha * 150);
    strokeWeight(1 * sizeMultiplier);
    line(starX, starY - rayVeryShort, starX, starY + rayVeryShort);    // 短垂直
    line(starX - rayVeryShort, starY, starX + rayVeryShort, starY);    // 短水平
    
    // 星星核心（白色亮點）
    fill(255, 255, 255, alpha * 255);
    noStroke();
    ellipse(starX, starY, 3 * sizeMultiplier);
    
    // 特殊效果：當有特殊事件時閃爍外圈
    if (bethlehemStar.specialEffect) {
        const flashAlpha = alpha * sin(frameCount * 0.5) * 0.3;
        stroke(255, 215, 0, flashAlpha * 255);
        strokeWeight(2 * sizeMultiplier);
        noFill();
        ellipse(starX, starY, adjustedHaloSize * 2);
        ellipse(starX, starY, adjustedHaloSize * 2.5);
    }
    
    pop();
}

// 觸發伯利恆之星特殊效果
function triggerBethlehemStarEffect(duration = 3000) {
    if (!bethlehemStar.enabled) return;
    
    bethlehemStar.specialEffect = true;
    bethlehemStar.specialEffectEnd = millis() + duration;
    
    console.log('✨ 伯利恆之星特殊效果觸發');
}

// 聖誕燈彩色邊框系統
function drawChristmasLightBorder() {
    // 確保變數已正確初始化
    if (!cell || !cols || !rows) {
        console.warn('Canvas 變數未正確初始化:', { cell, cols, rows });
        return;
    }
    
    // 設備檢測
    const isMobile = windowWidth <= GAME_CONFIG.MOBILE_BREAKPOINT;
    
    // 聖誕燈顏色配置
    const christmasColors = [
        [255, 85, 85],    // 紅色
        [85, 255, 85],    // 綠色  
        [85, 85, 255],    // 藍色
        [255, 255, 85],   // 黃色
        [255, 85, 255],   // 粉紅色
        [85, 255, 255],   // 青色
        [255, 165, 85],   // 橙色
        [255, 255, 255]   // 白色
    ];
    
    // 簡化的燈泡設定 - 直接基於Canvas尺寸
    const canvasWidth = cols * cell;   // Canvas實際寬度
    const canvasHeight = rows * cell;  // Canvas實際高度
    const lightSize = Math.max(8, cell * 0.3);  // 燈泡大小
    const spacing = lightSize * 2.5;  // 燈泡間距
    const margin = lightSize;  // 邊界邊距
    
    // 計算燈泡數量 - 直接基於Canvas邊界
    const horizontalLights = Math.floor((canvasWidth - margin * 2) / spacing);
    const verticalLights = Math.floor((canvasHeight - margin * 2) / spacing);
    
    // 聖誕燈數量計算完成
    
    // 聖誕燈閃爍動畫
    const time = millis() * 0.001;
    const baseBlinkSpeed = 1.2;
    const waveSpeed = 0.8;
    
    // 上邊框燈泡 - 沿著Canvas頂部邊界
    for (let i = 0; i < horizontalLights; i++) {
        const x = margin + (i + 0.5) * spacing;
        const y = lightSize; // 直接貼著Canvas頂部
        
        const colorIndex = i % christmasColors.length;
        const currentColor = christmasColors[colorIndex];
        const phase = time * baseBlinkSpeed + i * 0.3;
        
        drawChristmasLight(x, y, lightSize, currentColor, phase);
    }
    
    // 下邊框燈泡 - 沿著Canvas底部邊界  
    for (let i = 0; i < horizontalLights; i++) {
        const x = margin + (i + 0.5) * spacing;
        const y = canvasHeight - lightSize; // 直接貼著Canvas底部
        
        const colorIndex = (i + 2) % christmasColors.length;
        const currentColor = christmasColors[colorIndex];
        const phase = time * baseBlinkSpeed + i * 0.3 + PI;
        
        drawChristmasLight(x, y, lightSize, currentColor, phase);
    }
    
    // 左邊框燈泡 - 沿著Canvas左側邊界
    for (let i = 0; i < verticalLights; i++) {
        const x = lightSize; // 直接貼著Canvas左側
        const y = margin + (i + 0.5) * spacing;
        
        const colorIndex = (i + 4) % christmasColors.length;
        const currentColor = christmasColors[colorIndex];
        const phase = time * baseBlinkSpeed + i * 0.4 + PI * 0.5;
        
        drawChristmasLight(x, y, lightSize, currentColor, phase);
    }
    
    // 右邊框燈泡 - 沿著Canvas右側邊界
    for (let i = 0; i < verticalLights; i++) {
        const x = canvasWidth - lightSize; // 直接貼著Canvas右側
        const y = margin + (i + 0.5) * spacing;
        
        const colorIndex = (i + 6) % christmasColors.length;
        const currentColor = christmasColors[colorIndex];
        const phase = time * baseBlinkSpeed + i * 0.4 + PI * 1.5;
        
        drawChristmasLight(x, y, lightSize, currentColor, phase);
    }
    
    // 繪製邊框線（連接燈泡的電線）- 直接沿著Canvas邊界
    stroke(80, 80, 80, 100);
    strokeWeight(1.5);
    noFill();
    rect(0, 0, canvasWidth, canvasHeight);
}

// 繪製單個聖誕燈泡 - 真實聖誕燈呼吸閃爍效果
function drawChristmasLight(x, y, size, baseColor, phase) {
    // 安全檢查：確保 baseColor 是有效的陣列
    if (!baseColor || !Array.isArray(baseColor) || baseColor.length < 3) {
        console.warn('drawChristmasLight: baseColor 無效，使用預設顏色');
        baseColor = [255, 85, 85]; // 預設紅色
    }
    
    push();
    
    // 增強的呼吸燈效果 - 模擬真實聖誕燈
    const breatheCycle = sin(phase);
    const brightness = 0.4 + 0.6 * (0.5 + 0.5 * breatheCycle); // 0.4 到 1.0 的亮度範圍
    
    // 添加隨機閃爍效果（模擬電流不穩定）
    const flickerIntensity = 0.95 + 0.05 * sin(phase * 3.7); // 輕微閃爍
    const finalBrightness = brightness * flickerIntensity;
    
    // 多層光暈效果 - 真實聖誕燈的光暈
    for (let i = 0; i < 4; i++) {
        const glowRadius = size * (2.5 - i * 0.4);
        const glowAlpha = finalBrightness * (80 - i * 15) + (20 - i * 5);
        fill(baseColor[0], baseColor[1], baseColor[2], glowAlpha);
        noStroke();
        ellipse(x, y, glowRadius);
    }
    
    // 燈泡主體 - 動態顏色強度
    const enhancedR = Math.min(255, baseColor[0] * finalBrightness * 1.3);
    const enhancedG = Math.min(255, baseColor[1] * finalBrightness * 1.3);
    const enhancedB = Math.min(255, baseColor[2] * finalBrightness * 1.3);
    
    // 燈泡邊框（模擬塑膠外殼）
    fill(enhancedR, enhancedG, enhancedB);
    stroke(baseColor[0] * 0.4, baseColor[1] * 0.4, baseColor[2] * 0.4, 180);
    strokeWeight(1.5);
    ellipse(x, y, size);
    
    // 內層發光核心 - 呼吸效果
    const coreAlpha = finalBrightness * 220 + 35;
    fill(255, 255, 255, coreAlpha);
    noStroke();
    ellipse(x, y, size * 0.6);
    
    // 高亮反光點
    fill(255, 255, 255, finalBrightness * 180 + 75);
    ellipse(x - size * 0.15, y - size * 0.15, size * 0.25);
    
    // 燈泡頂部金屬螺紋帽
    fill(120, 120, 120, 200);
    stroke(80, 80, 80, 150);
    strokeWeight(1);
    ellipse(x, y - size * 0.4, size * 0.4, size * 0.15);
    
    // 強亮度時的十字光芒效果
    if (finalBrightness > 0.7) {
        const rayLength = size * 0.8;
        const rayAlpha = (finalBrightness - 0.7) * 300;
        
        stroke(255, 255, 255, rayAlpha);
        strokeWeight(2);
        // 主十字光芒
        line(x - rayLength, y, x + rayLength, y);
        line(x, y - rayLength, x, y + rayLength);
        
        stroke(baseColor[0], baseColor[1], baseColor[2], rayAlpha * 0.8);
        strokeWeight(1);
        // 對角光芒
        const diagLength = rayLength * 0.7;
        line(x - diagLength, y - diagLength, x + diagLength, y + diagLength);
        line(x - diagLength, y + diagLength, x + diagLength, y - diagLength);
    }
    
    pop();
}

function resetGame() {
    // 隨機選擇初始方向
    dir = getRandomDirection();

    // 計算遊戲區域中心位置並初始化蛇的位置
    initializeSnake();

    // 重置遊戲狀態
    resetGameState();

    // 初始化食物
    initializeFoods();

    console.log(`遊戲重置 - 網格: ${cols}x${rows}, 初始方向: ${dir}, 蛇頭位置: (${snake[0].x}, ${snake[0].y}), 蛇身位置: (${snake[1].x}, ${snake[1].y})`);
}

function initializeSnake() {
    const centerX = floor(cols / 2);
    const centerY = floor(rows / 2);
    snake = getInitialSnakePosition(dir, centerX, centerY);
}

function resetGameState() {
    collectedChars = [];
    collectedCharTypes = [];
    speed = GAME_CONFIG.DEFAULT_SPEED;
    t = 0;
    timer = GAME_CONFIG.GAME_DURATION;
    stat = { faith: 0, love: 0, hope: 0, peace: 0, joy: 0, praise: 0, wisdom: 0, trust: 0 };
    ate = [];
    effectUntil = 0;
    postEffect = null;
    foodChangeTimer = millis();
    isPaused = false;
    completedPhrases = [];
    phraseHintShown = false;
    
    // 重置連擊系統
    comboCount = 0;
    lastCharTime = 0;
    
    // 重置蛇頭變色系統
    snakeHeadColor = 'default';
    colorChangeStartTime = 0;
}

// 詞句檢測系統 - 彈性亂序檢測
function checkForCompletedPhrases() {
    if (!window.ITEMS || !window.ITEMS.phrases) return [];
    
    const newCompletedPhrases = [];
    const collectedCharCounts = {};
    
    // 統計收集到的每個字符數量
    collectedChars.forEach(char => {
        collectedCharCounts[char] = (collectedCharCounts[char] || 0) + 1;
    });
    
    // 檢查所有可能的詞句
    Object.keys(ITEMS.phrases).forEach(phrase => {
        // 如果還沒完成過這個詞句
        if (!completedPhrases.includes(phrase)) {
            const phraseChars = phrase.split('');
            const requiredCounts = {};
            
            // 統計詞句需要的每個字符數量
            phraseChars.forEach(char => {
                requiredCounts[char] = (requiredCounts[char] || 0) + 1;
            });
            
            // 檢查是否收集了足夠的字符（不要求順序）
            const canComplete = Object.keys(requiredCounts).every(char => {
                return collectedCharCounts[char] >= requiredCounts[char];
            });
            
            if (canComplete) {
                newCompletedPhrases.push(phrase);
                
                // GA4 事件追蹤：完成詞句
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'phrase_completed', {
                        'event_category': 'achievement',
                        'event_label': phrase,
                        'phrase_length': phrase.length,
                        'total_completed': completedPhrases.length + newCompletedPhrases.length
                    });
                }
                completedPhrases.push(phrase);
                
                // 應用詞句特殊效果
                applyPhraseEffect(phrase);
                
                console.log(`🎯 完成詞句：${phrase} (彈性匹配)`);
            }
        }
    });
    
    return newCompletedPhrases;
}

// 詞句進度分析系統
function analyzePhraseProgress() {
    if (!window.ITEMS || !window.ITEMS.phrases) return [];
    
    const collectedCharCounts = {};
    const progressData = [];
    
    // 統計收集到的每個字符數量
    collectedChars.forEach(char => {
        collectedCharCounts[char] = (collectedCharCounts[char] || 0) + 1;
    });
    
    // 分析每個詞句的進度
    Object.keys(ITEMS.phrases).forEach(phrase => {
        if (!completedPhrases.includes(phrase)) {
            const phraseChars = phrase.split('');
            const requiredCounts = {};
            let collectedCount = 0;
            let missingChars = [];
            
            // 統計詞句需要的每個字符數量
            phraseChars.forEach(char => {
                requiredCounts[char] = (requiredCounts[char] || 0) + 1;
            });
            
            // 計算進度
            Object.keys(requiredCounts).forEach(char => {
                const collected = collectedCharCounts[char] || 0;
                const required = requiredCounts[char];
                
                if (collected >= required) {
                    collectedCount += required;
                } else {
                    collectedCount += collected;
                    // 添加缺少的字符
                    for (let i = 0; i < (required - collected); i++) {
                        missingChars.push(char);
                    }
                }
            });
            
            const progress = collectedCount / phraseChars.length;
            
            // 只顯示有進度的詞句（至少收集了25%）
            if (progress >= 0.25) {
                const phraseData = ITEMS.phrases[phrase];
                progressData.push({
                    phrase: phrase,
                    progress: progress,
                    collectedCount: collectedCount,
                    totalCount: phraseChars.length,
                    missingChars: missingChars,
                    bonus: phraseData ? phraseData.bonus : 0
                });
            }
        }
    });
    
    // 按進度排序，進度高的在前
    return progressData.sort((a, b) => b.progress - a.progress);
}

// 更新詞句進度顯示
function updatePhraseProgressDisplay() {
    const progressElement = document.getElementById('phrase-progress');
    if (!progressElement) return;
    
    const progressData = analyzePhraseProgress();
    
    if (progressData.length === 0) {
        progressElement.style.display = 'none';
        return;
    }
    
    progressElement.style.display = 'flex';
    progressElement.innerHTML = '';
    
    // 只顯示前3個進度最高的詞句，避免HUD過於擁擠
    progressData.slice(0, 3).forEach(data => {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        
        const progressPercentage = Math.round(data.progress * 100);
        const missingText = data.missingChars.length > 0 ? 
            `缺: ${[...new Set(data.missingChars)].join('')}` : '完成!';
        
        progressItem.innerHTML = `
            <span style="font-weight: bold;">${data.phrase}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <span class="missing-chars">${missingText}</span>
        `;
        
        progressElement.appendChild(progressItem);
    });
}

// 字符詞句分析函數 - 檢查每個字符屬於哪個完成的詞句（順序無關版本）
function getCharPhraseInfo(charIndex) {
    if (!completedPhrases || completedPhrases.length === 0) {
        return null;
    }
    
    const char = ate[charIndex];
    
    // 檢查這個字符是否屬於任何完成的詞句（使用字符計數方式）
    for (const phrase of completedPhrases) {
        // 檢查這個字符是否在詞句中
        if (phrase.includes(char)) {
            const phraseData = ITEMS.phrases[phrase];
            
            return {
                phrase: phrase,
                character: char,
                phraseLength: phrase.length,
                bonus: phraseData ? phraseData.bonus : 0,
                effect: phraseData ? phraseData.effect : null,
                // 移除位置相關的屬性，因為順序已不重要
                belongsToPhrase: true
            };
        }
    }
    
    return null;
}

// 應用詞句特殊效果
function applyPhraseEffect(phrase) {
    const phraseData = ITEMS.phrases[phrase];
    if (!phraseData) return;
    
    const effect = phraseData.effect;
    
    switch (effect) {
        case 'goldenGlow':
            // 金色光芒效果 - 全螢幕閃爍
            triggerGoldenGlow();
            break;
        case 'stableSpeed':
            // 穩定速度效果
            applyMul({ speedMul: 1.0, durationMs: 8000 });
            break;
        case 'doubleFood':
            // 雙倍食物效果
            triggerDoubleFoodSpawn();
            break;
        case 'timeExtend':
            // 延長時間效果
            timer += 10;
            console.log('⏰ 時間延長10秒！');
            break;
        case 'calmMovement':
            // 平靜移動效果
            applyMul({ speedMul: 0.8, durationMs: 6000 });
            break;
        case 'speedBoost':
            // 速度提升效果
            applyMul({ speedMul: 1.3, durationMs: 4000 });
            break;
        case 'slowTime':
            // 時間減緩效果
            applyMul({ speedMul: 0.6, durationMs: 5000 });
            break;
        default:
            // 基礎獎勵效果
            applyMul({ speedMul: 1.1, durationMs: 3000 });
            break;
    }
}

// 特殊效果函數
function triggerGoldenGlow() {
    console.log('✨ 金色光芒效果觸發！');
    
    // 創建全螢幕金色光芒特效
    createGoldenGlowEffect();
    
    // 暫時的 Canvas 閃爍效果
    let originalAlpha = 1;
    let glowFrames = 0;
    const maxGlowFrames = 30;
    
    const glowEffect = setInterval(() => {
        glowFrames++;
        const alpha = 0.8 + 0.2 * Math.sin(glowFrames * 0.3);
        
        // 在遊戲區域添加金色光暈
        push();
        fill(255, 215, 0, alpha * 100);
        noStroke();
        rect(0, 0, cols * cell, rows * cell);
        pop();
        
        if (glowFrames >= maxGlowFrames) {
            clearInterval(glowEffect);
        }
    }, 50);
}

// 創建全螢幕金色光芒DOM效果
function createGoldenGlowEffect() {
    const glowDiv = document.createElement('div');
    glowDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
        pointer-events: none;
        z-index: 999;
        animation: goldenPulse 2s ease-out forwards;
    `;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes goldenPulse {
            0% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(glowDiv);
    
    // 2秒後移除效果
    setTimeout(() => {
        if (glowDiv.parentNode) {
            glowDiv.parentNode.removeChild(glowDiv);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 2000);
}

function triggerDoubleFoodSpawn() {
    // 生成額外食物
    for (let i = 0; i < 3; i++) {
        spawnFood();
    }
    console.log('🍎 雙倍食物效果！新增3個食物');
    
    // 創建食物爆發特效
    createFoodBurstEffect();
}

// 創建食物爆發特效
function createFoodBurstEffect() {
    const burstDiv = document.createElement('div');
    burstDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3em;
        color: #FFD700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        pointer-events: none;
        z-index: 999;
        animation: foodBurst 1.5s ease-out forwards;
    `;
    burstDiv.textContent = '🍎✨🎁✨🍯';
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes foodBurst {
            0% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.3) rotate(0deg); 
            }
            50% { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1.2) rotate(180deg); 
            }
            100% { 
                opacity: 0; 
                transform: translate(-50%, -50%) scale(0.8) rotate(360deg); 
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(burstDiv);
    
    // 1.5秒後移除效果
    setTimeout(() => {
        if (burstDiv.parentNode) {
            burstDiv.parentNode.removeChild(burstDiv);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 1500);
}

function initializeFoods() {
    foods = [];
    for (let i = 0; i < GAME_CONFIG.INITIAL_FOOD_COUNT; i++) {
        spawnFood();
    }
}

function draw() {
    try {
        // 使用透明背景讓 CSS 聖誕夜空漸層顯示
        clear();

        // 伯利恆之星特效（在所有其他元素之前繪製，作為背景）
        updateBethlehemStar();
        drawBethlehemStar();

        // 聖誕燈彩色邊框（優化後的座標系統）
        drawChristmasLightBorder();

        // 僅在前10幀顯示調試信息
        if (frameCount <= 10) {
            console.log('Frame', frameCount, '聖誕夜空背景：由 CSS 控制');
            console.log('Canvas 尺寸:', cols * cell, 'x', rows * cell, ', cell:', cell);
            console.log('遊戲狀態:', gameState);
        }
        
        // 只有在遊戲進行中且未暫停才執行遊戲邏輯
        if (gameState === 'PLAYING' && !isPaused) {
            // 倒數 & HUD - 添加安全檢查
            if (frameCount % 16 === 0 && timer > 0) timer--;
            // 使用 DOMManager 更新 HUD 元素
            DOMManager.setContent('time', timer);
            DOMManager.setContent('len', snake.length);
            
            // 更新詞句進度顯示
            updatePhraseProgressDisplay();

            // 更新速度（結合難度與效果）
            const baseSpeed = speed * DIFFICULTY_SETTINGS[difficulty].speedMultiplier;
            let curSpeed = baseSpeed;
            if (millis() < effectUntil) curSpeed = baseSpeed * (window.currentMul || 1);
            else if (postEffect) { applyMul(postEffect); postEffect = null; }

            // 以速度決定移動節奏
            t += curSpeed / 16;
            if (t >= 1) { t = 0; stepForward(); }

            // 檢查食物變換計時器
            if (millis() - foodChangeTimer >= GAME_CONFIG.FOOD_CHANGE_INTERVAL) {
                changeFoodRandomly();
                foodChangeTimer = millis(); // 重置計時器
            }

            // 結束
            if (timer <= 0) return gameOver();
        }

        // 繪製食物
        if (foods && foods.length > 0) {
            const neededChars = getNeededCharacters();
            
            foods.forEach(f => {
                if (f && typeof f.x === 'number' && typeof f.y === 'number' && f.char) {
                    const foodColor = getFoodColor(f.char);
                    const isNeeded = neededChars.includes(f.char);
                    
                    // 如果是需要的字符，添加特殊光效
                    if (isNeeded) {
                        // 繪製外層光暈
                        push();
                        const glowSize = 8 + 4 * sin(frameCount * 0.1);
                        fill(255, 215, 0, 60 + 30 * sin(frameCount * 0.15));
                        noStroke();
                        ellipse(f.x * cell + cell / 2, f.y * cell + cell / 2, cell + glowSize);
                        
                        // 繪製內層光暈
                        fill(255, 255, 255, 40 + 20 * sin(frameCount * 0.2));
                        ellipse(f.x * cell + cell / 2, f.y * cell + cell / 2, cell + glowSize * 0.6);
                        pop();
                    }

                    // 繪製食物背景（帶顏色）
                    fill(foodColor.background);
                    stroke(foodColor.border);
                    strokeWeight(isNeeded ? 3 : 2);
                    
                    // 需要的字符使用特殊邊框顏色
                    if (isNeeded) {
                        stroke(255, 215, 0);
                    }
                    
                    rect(f.x * cell + 1, f.y * cell + 1, cell - 2, cell - 2, 4);

                    // 繪製食物文字
                    fill(foodColor.text);
                    noStroke();
                    textAlign(CENTER, CENTER);
                    textSize(getResponsiveTextSize());
                    textFont(gameFont);
                    
                    // 需要的字符文字有輕微跳動效果
                    const textY = isNeeded ? 
                        f.y * cell + cell / 2 + sin(frameCount * 0.12) * 1.5 :
                        f.y * cell + cell / 2;
                    
                    text(f.char, f.x * cell + cell / 2, textY);
                }
            });
        }

        // 繪製蛇
        if (snake && snake.length > 0) {
            snake.forEach((s, i) => {
                if (s && typeof s.x === 'number' && typeof s.y === 'number') {
                    if (i === 0) {
                        // 蛇頭：動態變色箭頭設計（放大版，與方塊連接）
                        const centerX = s.x * cell + cell / 2;
                        const centerY = s.y * cell + cell / 2;
                        const headSize = cell * 0.6;  // 從 0.4 增加到 0.6
                        
                        push();
                        
                        // 根據方向調整蛇頭朝向
                        translate(centerX, centerY);
                        if (dir === 'RIGHT') {
                            // 向右：默認方向
                        } else if (dir === 'LEFT') {
                            rotate(PI);
                        } else if (dir === 'UP') {
                            rotate(-PI/2);
                        } else if (dir === 'DOWN') {
                            rotate(PI/2);
                        }
                        
                        // 獲取當前蛇頭顏色（根據變色狀態）
                        const currentColor = getCurrentSnakeHeadColor();
                        const colors = ARROW_HEAD_COLORS[currentColor];
                        
                        // 繪製箭頭主體
                        fill(colors.fill[0], colors.fill[1], colors.fill[2]);
                        stroke(colors.stroke[0], colors.stroke[1], colors.stroke[2]);
                        strokeWeight(3);
                        
                        const arrowLength = headSize * 1.0;  // 增加長度讓箭頭更延展
                        const arrowWidth = headSize * 0.7;   // 稍微增加寬度
                        const shaftWidth = headSize * 0.4;   // 增加桿身寬度，更好連接
                        
                        // 箭頭形狀（使用三角形和矩形組合，延伸連接設計）
                        // 箭頭尖端
                        triangle(
                            arrowLength * 0.5, 0,                // 箭頭尖（向前延伸）
                            arrowLength * 0.2, -arrowWidth,      // 上角
                            arrowLength * 0.2, arrowWidth        // 下角
                        );
                        
                        // 箭頭桿身（延伸到幾乎填滿格子）
                        rect(
                            -arrowLength * 0.5, -shaftWidth,    // 向後延伸更多
                            arrowLength * 0.7, shaftWidth * 2   // 更長的桿身
                        );
                        
                        // 繪製裝飾元素（根據顏色類型）
                        drawArrowAccent(currentColor, colors.accent, headSize);
                        
                        // 如果正在變色，添加閃爍效果
                        if (millis() - colorChangeStartTime < colorChangeDuration) {
                            const glowIntensity = 50 + 30 * sin(frameCount * 0.3);
                            fill(colors.fill[0], colors.fill[1], colors.fill[2], glowIntensity);
                            noStroke();
                            
                            // 外圍光暈
                            triangle(
                                arrowLength * 1.1, 0,
                                arrowLength * 0.3, -arrowWidth * 1.1,
                                arrowLength * 0.3, arrowWidth * 1.1
                            );
                            rect(
                                -arrowLength * 0.5, -shaftWidth * 1.1,
                                arrowLength * 0.9, shaftWidth * 2.2
                            );
                        }
                        
                        pop();
                    } else {
                        // 蛇身：根據字詞類型顯示顏色
                        const charIndex = i - 1; // 修正索引計算：i=1對應collectedChars[0]
                        if (charIndex >= 0 && charIndex < collectedChars.length && collectedChars[charIndex]) {
                            const char = collectedChars[charIndex];
                            const charType = collectedCharTypes[charIndex];
                            const foodColor = FOOD_COLORS[charType] || FOOD_COLORS.default;

                            // 繪製蛇身背景（帶顏色）
                            fill(foodColor.background);
                            stroke(foodColor.border);
                            strokeWeight(1);
                            rect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2, 2);

                            // 繪製字詞
                            fill(foodColor.text);
                            noStroke();
                            textSize(getResponsiveTextSize());
                            textAlign(CENTER, CENTER);
                            textFont(gameFont);
                            text(char, s.x * cell + cell / 2, s.y * cell + cell / 2);
                        } else {
                            // 沒有對應字詞的蛇身（聖誕銀白主題）
                            fill(220, 220, 220);  // 淺灰色填充
                            stroke(169, 169, 169);  // 深灰色邊框
                            strokeWeight(2);
                            rect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2, 2);
                            
                            // 添加內部高亮
                            fill(255, 255, 255, 120);  // 半透明白色高亮
                            noStroke();
                            rect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4, 1);
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('繪製過程中發生錯誤:', error);
        // 確保遊戲不會因為繪製錯誤而停止
    }
}

// 獲取當前蛇頭顏色狀態
function getCurrentSnakeHeadColor() {
    // 如果正在變色期間，返回特殊顏色
    if (millis() - colorChangeStartTime < colorChangeDuration) {
        return snakeHeadColor;
    }
    // 否則返回預設顏色
    return 'default';
}

// 觸發蛇頭變色
function triggerSnakeHeadColorChange(foodType) {
    snakeHeadColor = foodType;
    colorChangeStartTime = millis();
    console.log(`🎨 蛇頭變色為: ${foodType}`);
}

// 繪製箭頭裝飾元素
function drawArrowAccent(colorType, accentColor, headSize) {
    fill(accentColor[0], accentColor[1], accentColor[2]);
    noStroke();
    
    const accentSize = headSize * 0.15;
    
    switch (colorType) {
        case 'faith':
            // 十字裝飾
            rect(-accentSize * 0.3, -accentSize, accentSize * 0.6, accentSize * 2);  // 垂直
            rect(-accentSize, -accentSize * 0.3, accentSize * 2, accentSize * 0.6);  // 水平
            break;
            
        case 'christmas':
            // 雪花裝飾（簡化版）
            for (let i = 0; i < 6; i++) {
                push();
                rotate(i * PI / 3);
                rect(-accentSize * 0.1, -accentSize, accentSize * 0.2, accentSize * 2);
                pop();
            }
            break;
            
        case 'blessing':
            // 愛心裝飾（簡化）
            ellipse(-accentSize * 0.3, -accentSize * 0.2, accentSize, accentSize);
            ellipse(accentSize * 0.3, -accentSize * 0.2, accentSize, accentSize);
            triangle(-accentSize * 0.6, 0, accentSize * 0.6, 0, 0, accentSize * 0.8);
            break;
            
        case 'praise':
            // 星星裝飾
            drawStar(0, 0, accentSize, 5);
            break;
            
        case 'sharing':
            // 心形裝飾（更小）
            ellipse(-accentSize * 0.2, -accentSize * 0.1, accentSize * 0.8, accentSize * 0.8);
            ellipse(accentSize * 0.2, -accentSize * 0.1, accentSize * 0.8, accentSize * 0.8);
            triangle(-accentSize * 0.4, accentSize * 0.1, accentSize * 0.4, accentSize * 0.1, 0, accentSize * 0.6);
            break;
            
        default:
            // 預設聖誕裝飾：小聖誕星和雪花點
            // 中心聖誕星
            drawStar(0, 0, accentSize * 0.6, 4);
            
            // 周圍的雪花點（簡化版）
            for (let i = 0; i < 4; i++) {
                const angle = i * PI / 2;
                const x = cos(angle) * accentSize * 0.8;
                const y = sin(angle) * accentSize * 0.8;
                ellipse(x, y, accentSize * 0.3, accentSize * 0.3);
            }
            break;
    }
}

// 繪製星星的輔助函數
function drawStar(x, y, radius, points) {
    push();
    translate(x, y);
    const angle = TWO_PI / points;
    const halfAngle = angle / 2;
    
    beginShape();
    for (let i = 0; i < points; i++) {
        const outerAngle = i * angle;
        const innerAngle = outerAngle + halfAngle;
        
        const outerX = cos(outerAngle) * radius;
        const outerY = sin(outerAngle) * radius;
        const innerX = cos(innerAngle) * radius * 0.5;
        const innerY = sin(innerAngle) * radius * 0.5;
        
        vertex(outerX, outerY);
        vertex(innerX, innerY);
    }
    endShape(CLOSE);
    pop();
}

function stepForward() {
    const newHead = calculateNewHeadPosition();

    if (isCollision(newHead)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    const eatenFood = checkFoodCollision(newHead);
    if (eatenFood) {
        handleFoodConsumption(eatenFood);
    } else {
        maintainSnakeLength();
    }
}

function calculateNewHeadPosition() {
    const head = { ...snake[0] };

    const movementMap = {
        'UP': { x: 0, y: -1 },
        'DOWN': { x: 0, y: 1 },
        'LEFT': { x: -1, y: 0 },
        'RIGHT': { x: 1, y: 0 }
    };

    const movement = movementMap[dir];
    head.x += movement.x;
    head.y += movement.y;

    return head;
}

function isCollision(position) {
    // 檢查邊界碰撞
    if (!Utils.isValidPosition(position.x, position.y, cols, rows)) {
        return true;
    }

    // 檢查自身碰撞（排除蛇頭）
    return snake.slice(1).some(segment =>
        Utils.isSamePosition(position, segment)
    );
}

function checkFoodCollision(position) {
    const foodIndex = foods.findIndex(food =>
        Utils.isSamePosition(position, food)
    );

    if (foodIndex !== -1) {
        const food = foods[foodIndex];
        foods.splice(foodIndex, 1);
        return food;
    }

    return null;
}

function handleFoodConsumption(food) {
    const char = food.char;
    const foodType = getFoodType(char);
    const currentTime = millis();

    // 連擊系統邏輯
    if (currentTime - lastCharTime <= comboTimeWindow) {
        comboCount++;
    } else {
        comboCount = 1; // 重置連擊
    }
    lastCharTime = currentTime;

    // 記錄收集到的食物
    collectedChars.push(char);
    collectedCharTypes.push(foodType);

    // 觸發蛇頭變色效果
    triggerSnakeHeadColorChange(foodType);

    // 檢測完成的詞句
    const newPhrases = checkForCompletedPhrases();

    // 生成新食物
    spawnFood();

    // 應用食物效果
    onEat(char);
    
    // 連擊獎勵：每5連擊獲得1秒時間獎勵
    if (comboCount >= 5 && comboCount % 5 === 0) {
        timer += 1;
        createComboEffect(comboCount);
        console.log(`🔥 ${comboCount}連擊！獲得時間獎勵！`);
    }

    // 如果完成新詞句，顯示提示和特效
    if (newPhrases.length > 0) {
        newPhrases.forEach(phrase => {
            console.log(`🎉 恭喜完成詞句：${phrase}！`);
            createPhraseCompletionEffect(phrase);
            
            // 觸發伯利恆之星特殊效果
            triggerBethlehemStarEffect();
            
            // 特殊聖誕詞句有更長的星星特效
            if (['聖誕快樂', '耶穌愛我', '哈利路亞', '以馬內利'].includes(phrase)) {
                triggerBethlehemStarEffect(5000); // 5秒特效
            }
        });
    }
}

function maintainSnakeLength() {
    // 保持蛇的長度：初始長度2 + 收集的字符數
    const targetLength = 2 + collectedChars.length;
    while (snake.length > targetLength) {
        snake.pop();
    }
}

function onEat(ch) {
    // 屬靈成長統計
    const spiritualGrowth = (ITEMS.spiritualGrowth[ch] || {});
    for (const k in spiritualGrowth) {
        stat[k] = (stat[k] || 0) + spiritualGrowth[k];
    }
    ate.push(ch);

    // 即時效果
    const fx = ITEMS.effects[ch];
    if (fx) {
        applyMul({ speedMul: fx.speedMul, durationMs: fx.durationMs });
        if (fx.after) postEffect = fx.after;
    }

    // 調試信息：記錄特殊祝福食物的攝取
    if (['哈', '利', '路', '亞'].includes(ch)) {
        console.log(`收集到讚美字符: ${ch}, 類型: ${getFoodType(ch)}, 總讚美值: ${stat.praise || 0}`);
    }
}

function applyMul({ speedMul = 1, durationMs = 1000 }) {
    window.currentMul = speedMul;
    effectUntil = millis() + durationMs;
}

function spawnFood() {
    try {
        // 檢查 ITEMS 物件是否可用
        if (!window.ITEMS || !window.ITEMS.pool || !Array.isArray(window.ITEMS.pool) || window.ITEMS.pool.length === 0) {
            console.error('ITEMS.pool 不可用，無法生成食物');
            return;
        }

        // 檢查網格大小是否有效
        if (!cols || !rows || cols <= 0 || rows <= 0) {
            console.error('網格大小無效，無法生成食物');
            return;
        }

        const char = getWeightedFood();
        let p;
        let attempts = 0;
        const maxAttempts = GAME_CONFIG.MAX_SPAWN_ATTEMPTS; // 防止無限迴圈

        // 定義安全區域邊距，避免與聖誕燈重疊
        const safeMargin = 1; // 距離邊緣至少1格
        const safeMinX = safeMargin;
        const safeMaxX = cols - 1 - safeMargin;
        const safeMinY = safeMargin;
        const safeMaxY = rows - 1 - safeMargin;

        do {
            // 在安全區域內生成食物
            p = { 
                x: floor(random(safeMinX, safeMaxX + 1)), 
                y: floor(random(safeMinY, safeMaxY + 1)), 
                char 
            };
            attempts++;

            if (attempts > maxAttempts) {
                console.warn('食物生成達到最大嘗試次數，可能網格空間不足');
                break;
            }
        } while (
            snake.some(s => s.x === p.x && s.y === p.y) ||
            foods.some(f => f.x === p.x && f.y === p.y) ||
            // 額外檢查：確保不在邊緣安全區域
            p.x < safeMinX || p.x > safeMaxX ||
            p.y < safeMinY || p.y > safeMaxY ||
            // 避免出現在四個角落
            (p.x === 0 && p.y === 0) ||         // 左上角
            (p.x === cols - 1 && p.y === 0) || // 右上角
            (p.x === 0 && p.y === rows - 1) || // 左下角
            (p.x === cols - 1 && p.y === rows - 1) // 右下角
        );

        if (p && typeof p.x === 'number' && typeof p.y === 'number' && p.char) {
            foods.push(p);
        } else {
            console.error('食物生成失敗');
        }
    } catch (error) {
        console.error('食物生成過程中發生錯誤:', error);
    }
}

function changeDirection(newDirection) {
    // 只有在遊戲進行中且未暫停才允許轉向
    if (gameState !== 'PLAYING' || isPaused) return;

    // 防止反方向移動的映射
    const oppositeDirections = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT'
    };

    // 防止反方向移動，無論蛇的長度
    if (oppositeDirections[newDirection] !== dir) {
        dir = newDirection;
    }
}

function gameOver() {
    noLoop();
    gameState = 'OVER';
    isPaused = false; // 重置暫停狀態

    // GA4 事件追蹤：遊戲結束
    if (typeof gtag !== 'undefined') {
        gtag('event', 'game_end', {
            'event_category': 'engagement',
            'event_label': 'christmas_snake_game',
            'score': snake ? snake.length : 0,
            'completed_phrases': completedPhrases ? completedPhrases.length : 0,
            'game_duration': GAME_CONFIG.GAME_DURATION - timer,
            'difficulty': difficulty
        });
    }

    try {
        // 安全地分析屬靈成長結果
        let tag, msg;
        try {
            tag = Ending.analyze(stat, completedPhrases);
            msg = Ending.generateGrowthReport(stat, completedPhrases, collectedChars);
        } catch (error) {
            console.error('屬靈成長分析過程中發生錯誤:', error);
            // 使用備用分析邏輯
            const faith = stat.faith || 0, love = stat.love || 0, hope = stat.hope || 0;
            const peace = stat.peace || 0, joy = stat.joy || 0;
            const totalGrowth = faith + love + hope + peace + joy;
            
            if (completedPhrases.length > 0) tag = "christmasBlessing";
            else if (totalGrowth > 50) tag = "abundant";
            else if (love > faith && love > hope) tag = "highLove";
            else if (faith > love && faith > hope) tag = "highFaith";
            else tag = "balanced";

            msg = Ending.getBlessingLine(tag);
        }

        // 列表 - 使用詞句分組顯示
        const listEl = document.getElementById('list');
        if (listEl) {
            listEl.innerHTML = '';
            
            // 創建詞句分組映射（順序無關版本）
            const phraseGroups = new Map();
            const usedCharIndexes = new Set();
            
            // 按詞句長度排序 (長的優先，效果更好)
            const sortedPhrases = completedPhrases.sort((a, b) => b.length - a.length);
            
            // 為每個完成的詞句創建分組（使用字符計數方式）
            sortedPhrases.forEach(phrase => {
                const phraseData = ITEMS.phrases[phrase];
                const phraseChars = phrase.split('');
                const requiredCounts = {};
                
                // 統計詞句需要的每個字符數量
                phraseChars.forEach(char => {
                    requiredCounts[char] = (requiredCounts[char] || 0) + 1;
                });
                
                const phraseGroup = {
                    phrase: phrase,
                    chars: [],
                    bonus: phraseData ? phraseData.bonus : 0
                };
                
                // 從收集的字符中找出屬於這個詞句的字符
                const tempRequiredCounts = { ...requiredCounts };
                ate.forEach((char, index) => {
                    if (!usedCharIndexes.has(index) && tempRequiredCounts[char] > 0) {
                        phraseGroup.chars.push({
                            char: char,
                            index: index,
                            belongsToPhrase: phrase
                        });
                        tempRequiredCounts[char]--;
                        usedCharIndexes.add(index);
                    }
                });
                
                if (phraseGroup.chars.length > 0) {
                    phraseGroups.set(phrase, phraseGroup);
                }
            });
            
            // 添加收集統計摘要
            if (completedPhrases.length > 0 || ate.length > 0) {
                const summaryContainer = document.createElement('div');
                summaryContainer.className = 'collection-summary';
                summaryContainer.style.cssText = `
                    margin-bottom: 20px;
                    padding: 15px;
                    background: linear-gradient(135deg, 
                        rgba(255, 248, 220, 0.8) 0%, 
                        rgba(255, 255, 255, 0.6) 100%);
                    border-radius: 12px;
                    border: 2px solid rgba(255, 215, 0, 0.4);
                    text-align: center;
                    animation: slideInFromTop 0.4s ease-out;
                `;
                
                const totalBonus = Array.from(phraseGroups.values()).reduce((sum, group) => sum + group.bonus, 0);
                const phrasesByRarity = {
                    legendary: Array.from(phraseGroups.values()).filter(g => g.phrase.length >= 4).length,
                    rare: Array.from(phraseGroups.values()).filter(g => g.phrase.length === 3).length,
                    common: Array.from(phraseGroups.values()).filter(g => g.phrase.length === 2).length
                };
                
                summaryContainer.innerHTML = `
                    <div style="font-weight: bold; font-size: 1.1em; color: #B8860B; margin-bottom: 8px;">
                        🎄 本局收集成果 🎄
                    </div>
                    <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; font-size: 0.9em;">
                        <span style="color: #333;">📝 總字符: <strong>${ate.length}</strong></span>
                        <span style="color: #333;">🎯 完成詞句: <strong>${completedPhrases.length}</strong></span>
                    </div>
                    ${phrasesByRarity.legendary > 0 || phrasesByRarity.rare > 0 || phrasesByRarity.common > 0 ? `
                        <div style="margin-top: 8px; font-size: 0.85em; color: #666;">
                            ${phrasesByRarity.legendary > 0 ? `🌟傳奇 ${phrasesByRarity.legendary} ` : ''}
                            ${phrasesByRarity.rare > 0 ? `⭐稀有 ${phrasesByRarity.rare} ` : ''}
                            ${phrasesByRarity.common > 0 ? `💫基礎 ${phrasesByRarity.common}` : ''}
                        </div>
                    ` : ''}
                `;
                
                listEl.appendChild(summaryContainer);
            }

            // 首先顯示完成的詞句分組
            Array.from(phraseGroups.values())
                .sort((a, b) => b.bonus - a.bonus) // 按獎勵點數排序
                .forEach((group, index) => {
                    // 創建詞句分組容器
                    const phraseContainer = document.createElement('div');
                    phraseContainer.className = 'phrase-group';
                    phraseContainer.setAttribute('data-phrase-length', group.phrase.length);
                    phraseContainer.setAttribute('data-phrase', group.phrase);
                    
                    // 添加漸進式顯示動畫
                    phraseContainer.style.animationDelay = `${index * 0.15}s`;
                    phraseContainer.style.opacity = '0';
                    phraseContainer.style.transform = 'translateY(-15px) scale(0.95)';
                    
                    // 使用 setTimeout 來觸發動畫
                    setTimeout(() => {
                        phraseContainer.style.opacity = '1';
                        phraseContainer.style.transform = 'translateY(0) scale(1)';
                        phraseContainer.style.transition = 'all 0.6s ease-out';
                    }, index * 150);
                    
                    // 添加詞句標籤
                    const phraseLabel = document.createElement('div');
                    phraseLabel.className = 'phrase-label';
                    
                    // 根據詞句長度設定不同的圖標和獎勵顯示
                    let icon = '✨';
                    let rarityText = '';
                    if (group.phrase.length >= 4) {
                        icon = '🌟';
                        rarityText = '傳奇';
                    } else if (group.phrase.length === 3) {
                        icon = '⭐';
                        rarityText = '稀有';
                    } else {
                        icon = '💫';
                        rarityText = '基礎';
                    }
                    
                    phraseLabel.innerHTML = `
                        ${icon} ${group.phrase} 
                        <span style="font-size: 0.8em; color: #8B6914; opacity: 0.8; margin-left: 5px;">
                            (${rarityText})
                        </span>
                    `;
                    phraseContainer.appendChild(phraseLabel);
                    
                    // 創建字符容器
                    const charsContainer = document.createElement('div');
                    charsContainer.className = 'phrase-chars';
                    
                    // 添加詞句字符
                    group.chars.forEach((charInfo, index) => {
                        const b = document.createElement('span');
                        b.className = 'chip completed-phrase-char';
                        b.textContent = charInfo.char;
                        
                        // 根據食物類型設定顏色
                        const foodType = getFoodType(charInfo.char);
                        const foodColor = getFoodColor(charInfo.char);
                        b.style.backgroundColor = foodColor.background;
                        b.style.border = `3px solid ${foodColor.border}`;
                        b.style.color = foodColor.text;
                        b.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.8)';
                        b.style.fontWeight = 'bold';
                        
                        // 添加詞句相關的 data 屬性
                        b.setAttribute('data-phrase', group.phrase);
                        b.setAttribute('data-phrase-length', group.phrase.length);
                        b.setAttribute('data-position', index);
                        
                        charsContainer.appendChild(b);
                    });
                    
                    phraseContainer.appendChild(charsContainer);
                    listEl.appendChild(phraseContainer);
                });
            
            // 然後顯示未組成詞句的字符 - 添加分組顯示
            const individualChars = ate.filter((ch, index) => !usedCharIndexes.has(index));
            
            if (individualChars.length > 0) {
                // 創建個別字符分組容器
                const individualContainer = document.createElement('div');
                individualContainer.className = 'individual-chars-group';
                individualContainer.style.cssText = `
                    margin-top: 20px;
                    padding: 12px;
                    background: linear-gradient(135deg, 
                        rgba(240, 248, 255, 0.6) 0%, 
                        rgba(255, 255, 255, 0.4) 100%);
                    border-radius: 12px;
                    border: 2px solid rgba(176, 196, 222, 0.4);
                `;
                
                // 添加標題
                const charLabel = document.createElement('div');
                charLabel.textContent = `💎 個別收集的字符 (${individualChars.length} 個)`;
                charLabel.style.cssText = `
                    text-align: center;
                    font-weight: bold;
                    font-size: 0.95em;
                    color: #4682B4;
                    margin-bottom: 10px;
                    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
                `;
                individualContainer.appendChild(charLabel);
                
                // 創建字符容器
                const charsContainer = document.createElement('div');
                charsContainer.style.cssText = `
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    justify-content: center;
                `;
                
                individualChars.forEach((ch, i) => {
                    const b = document.createElement('span');
                    b.className = 'chip individual-char';
                    b.textContent = ch;

                    // 根據食物類型設定顏色
                    const foodType = getFoodType(ch);
                    const foodColor = getFoodColor(ch);
                    b.style.backgroundColor = foodColor.background;
                    b.style.border = `2px solid ${foodColor.border}`;
                    b.style.color = foodColor.text;
                    b.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.8)';
                    b.style.fontWeight = 'bold';
                    b.style.fontSize = '14px';
                    
                    // 添加漸進式顯示動畫
                    b.style.animationDelay = `${i * 0.05}s`;
                    b.style.animation = 'fadeInScale 0.4s ease-out forwards';
                    b.style.opacity = '0';
                    b.style.transform = 'scale(0.8)';

                    charsContainer.appendChild(b);
                });
                
                individualContainer.appendChild(charsContainer);
                listEl.appendChild(individualContainer);
            }
        }

        // 顯示吃到的字的總數
        const totalChars = ate.length;
        const reportEl = document.getElementById('report');
        if (reportEl) {
            reportEl.textContent = msg + `\n\n本局共吃到 ${totalChars} 個字。`;
        }

        // 顯示結束畫面
        const overEl = document.getElementById('over');
        if (overEl) {
            overEl.style.display = 'flex';
        }

        // 延遲渲染圖表，確保DOM已更新
        setTimeout(() => {
            try {
                renderNutritionChart();
                setupShareButton(); // 設置分享按鈕事件監聽器
            } catch (error) {
                console.error('圖表渲染失敗:', error);
            }
        }, 100);

    } catch (error) {
        console.error('遊戲結束處理過程中發生錯誤:', error);
        // 確保至少能顯示基本結束畫面
        const overEl = document.getElementById('over');
        if (overEl) {
            overEl.style.display = 'flex';
        }
    }
}

function renderNutritionChart() {
    const canvas = document.getElementById('nutritionChart');
    if (!canvas || typeof Chart === 'undefined') {
        console.warn('Chart.js未載入或Canvas元素不存在');
        return;
    }

    // 清除之前的圖表實例
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['信心', '愛心', '盼望', '平安', '喜樂', '讚美'],
            datasets: [{
                data: [
                    stat.faith || 0, 
                    stat.love || 0, 
                    stat.hope || 0, 
                    stat.peace || 0, 
                    stat.joy || 0, 
                    stat.praise || 0
                ],
                backgroundColor: [
                    FOOD_COLORS.faith.border,     // 信心：金色
                    FOOD_COLORS.sharing.border,   // 愛心：粉紅色  
                    FOOD_COLORS.christmas.border, // 盼望：黃色
                    FOOD_COLORS.praise.border,    // 平安：銀色
                    FOOD_COLORS.christmas.border, // 喜樂：黃色
                    FOOD_COLORS.praise.border     // 讚美：銀色
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: '屬靈成長分析',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

function changeFoodRandomly() {
    // 如果沒有食物，就不執行
    if (foods.length === 0) return;

    // 隨機選擇一個食物進行變換
    const randomIndex = floor(random(foods.length));
    const foodToChange = foods[randomIndex];

    // 給它一個新的字符
    foodToChange.char = getWeightedFood();

    // 重新定位到新位置
    let newPosition;
    do {
        newPosition = { x: floor(random(cols)), y: floor(random(rows)) };
    } while (
        snake.some(s => s.x === newPosition.x && s.y === newPosition.y) ||
        foods.some((f, i) => i !== randomIndex && f.x === newPosition.x && f.y === newPosition.y) ||
        // 避免出現在四個角落
        (newPosition.x === 0 && newPosition.y === 0) ||         // 左上角
        (newPosition.x === cols - 1 && newPosition.y === 0) || // 右上角
        (newPosition.x === 0 && newPosition.y === rows - 1) || // 左下角
        (newPosition.x === cols - 1 && newPosition.y === rows - 1) // 右下角
    );

    // 更新食物位置
    foodToChange.x = newPosition.x;
    foodToChange.y = newPosition.y;
}

function isFontAvailable(fontName) {
    // 建立一個測試畫布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 測試文字（使用不同的測試字符）
    const testTexts = ['測試', 'Test', '字體', 'Font'];
    const fallbackFont = 'monospace';

    // 設定字體大小
    const fontSize = 72;

    for (let testText of testTexts) {
        // 測試預設字體寬度
        ctx.font = `${fontSize}px ${fallbackFont}`;
        const defaultWidth = ctx.measureText(testText).width;

        // 測試目標字體寬度（多種格式）
        const fontFormats = [
            `${fontSize}px "${fontName}", ${fallbackFont}`,
            `${fontSize}px '${fontName}', ${fallbackFont}`,
            `${fontSize}px ${fontName}, ${fallbackFont}`
        ];

        for (let format of fontFormats) {
            ctx.font = format;
            const testWidth = ctx.measureText(testText).width;

            // 如果寬度不同，表示字體有載入
            if (testWidth !== defaultWidth) {
                console.log(`字體檢測成功: ${fontName}, 使用格式: ${format}, 測試字: ${testText}`);
                return true;
            }
        }
    }

    return false;
}

function detectAndSetFont() {
    console.log('開始字體檢測...');

    const testFonts = [
        "LINE Seed TW_OTF Bold",
        "LINE Seed TW_OTF",
        "LINE Seed TW_OTF Regular",
        "LINE Seed TW_OTF ExtraBold",
        "LINE Seed TW_OTF Thin",
        "LINE Seed TW OTF Bold",
        "LINESeedTW-Bold",
        "LINE Seed TW Bold",
        "LINE Seed TW",
        "PingFang TC",
        "Microsoft JhengHei",
        "Noto Sans TC",
        "system-ui",
        "sans-serif"
    ];

    for (let font of testFonts) {
        console.log(`正在檢測字體: ${font}`);
        if (isFontAvailable(font)) {
            console.log(`✅ 找到可用字體: ${font}`);
            return font;
        } else {
            console.log(`❌ 字體不可用: ${font}`);
        }
    }

    console.log('❌ 沒有找到任何指定字體，使用預設字體: sans-serif');
    return 'sans-serif';
}

function calculateResponsiveParameters() {
    // 已被 calculateOptimalCanvasSize 取代，保留此函數以防其他地方使用
    console.log('calculateResponsiveParameters 已被 calculateOptimalCanvasSize 取代');
}

function getResponsiveTextSize() {
    // 根據cell大小和設備類型調整文字大小
    const isMobile = windowWidth <= GAME_CONFIG.MOBILE_BREAKPOINT;
    const isTablet = windowWidth > GAME_CONFIG.MOBILE_BREAKPOINT && windowWidth <= GAME_CONFIG.TABLET_BREAKPOINT;

    let textRatio;
    if (isMobile) {
        // 手機上使用較大的文字比例以確保可讀性
        textRatio = cell <= 18 ? 0.85 : 0.8;
    } else if (isTablet) {
        textRatio = 0.7;
    } else {
        textRatio = 0.65; // 桌面使用較小比例
    }

    const baseSize = cell * textRatio;

    // 確保文字大小在合理範圍內
    const minSize = isMobile ? 12 : 12;
    const maxSize = isMobile ? 28 : 20;

    return Math.max(minSize, Math.min(maxSize, baseSize));
}

function windowResized() {
    try {
        // 暫停遊戲以防止調整過程中的異常
        const wasLooping = isLooping();
        if (wasLooping) noLoop();

        // 重新計算Canvas大小和cell大小
        const canvasSize = calculateOptimalCanvasSize();
        resizeCanvas(canvasSize.width, canvasSize.height);

        // 更新cell大小（網格大小保持固定）
        cell = canvasSize.cellSize;

        console.log(`視窗大小改變: ${windowWidth}x${windowHeight}, Canvas: ${canvasSize.width}x${canvasSize.height}, Cell: ${cell}, 網格: ${cols}x${rows}（固定）`);

        // 檢查並修正遊戲物件位置（如果需要）
        if (snake && snake.length > 0) {
            adjustGameObjectsToNewGrid(GAME_CONFIG.GRID_COLS, GAME_CONFIG.GRID_ROWS);
        }
        
        // 重新初始化伯利恆之星位置以適應新的畫布大小
        initializeBethlehemStar();

        // 恢復遊戲
        if (wasLooping) loop();
    } catch (error) {
        console.error('視窗調整過程中發生錯誤:', error);
        // 發生錯誤時確保遊戲能繼續運行
        loop();
    }
}

function adjustGameObjectsToNewGrid(oldCols, oldRows) {
    // 檢查蛇是否超出新邊界
    let needsAdjustment = false;

    snake.forEach(segment => {
        if (segment.x >= cols || segment.y >= rows) {
            needsAdjustment = true;
        }
    });

    // 檢查食物是否超出新邊界
    foods.forEach(food => {
        if (food.x >= cols || food.y >= rows) {
            needsAdjustment = true;
        }
    });

    if (needsAdjustment) {
        console.log('偵測到物件超出新邊界，進行安全重新定位');

        // 安全重新定位蛇的位置
        const centerX = Math.max(1, Math.floor(cols / 2));
        const centerY = Math.max(1, Math.floor(rows / 2));

        // 確保蛇頭在安全區域
        snake[0].x = Math.min(centerX, cols - 2);
        snake[0].y = Math.min(centerY, rows - 2);

        // 重新定位蛇身，確保不超出邊界
        for (let i = 1; i < snake.length; i++) {
            if (dir === 'RIGHT') {
                snake[i].x = Math.max(0, snake[0].x - i);
                snake[i].y = snake[0].y;
            } else if (dir === 'LEFT') {
                snake[i].x = Math.min(cols - 1, snake[0].x + i);
                snake[i].y = snake[0].y;
            } else if (dir === 'DOWN') {
                snake[i].x = snake[0].x;
                snake[i].y = Math.max(0, snake[0].y - i);
            } else { // UP
                snake[i].x = snake[0].x;
                snake[i].y = Math.min(rows - 1, snake[0].y + i);
            }
        }

        // 重新生成所有食物確保位置有效
        foods = [];
        for (let i = 0; i < 10; i++) {
            spawnFood();
        }
    }
}

function sel(q) { return select(q); }

// 隨機方向相關函數
function getRandomDirection() {
    const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    return directions[floor(random(directions.length))];
}

function getInitialSnakePosition(direction, centerX, centerY) {
    // 確保有足夠空間：離邊界至少2格距離
    const minDistance = 2;
    const safeX = Math.max(minDistance, Math.min(centerX, cols - minDistance - 1));
    const safeY = Math.max(minDistance, Math.min(centerY, rows - minDistance - 1));

    let head, body;

    switch (direction) {
        case 'UP':
            // 向上移動：蛇身在蛇頭下方
            head = { x: safeX, y: safeY };
            body = { x: safeX, y: safeY + 1 };
            break;
        case 'DOWN':
            // 向下移動：蛇身在蛇頭上方
            head = { x: safeX, y: safeY };
            body = { x: safeX, y: safeY - 1 };
            break;
        case 'LEFT':
            // 向左移動：蛇身在蛇頭右方
            head = { x: safeX, y: safeY };
            body = { x: safeX + 1, y: safeY };
            break;
        case 'RIGHT':
        default:
            // 向右移動：蛇身在蛇頭左方
            head = { x: safeX, y: safeY };
            body = { x: safeX - 1, y: safeY };
            break;
    }

    // 雙重檢查：確保蛇的所有部分都在遊戲邊界內
    const validHead = head.x >= 0 && head.x < cols && head.y >= 0 && head.y < rows;
    const validBody = body.x >= 0 && body.x < cols && body.y >= 0 && body.y < rows;

    if (!validHead || !validBody) {
        console.warn(`初始位置警告: 方向=${direction}, 蛇頭=(${head.x},${head.y}), 蛇身=(${body.x},${body.y}), 網格大小=(${cols},${rows})`);
        // 如果計算出的位置無效，回到更安全的中心位置
        const fallbackX = Math.floor(cols / 2);
        const fallbackY = Math.floor(rows / 2);
        return [
            { x: fallbackX, y: fallbackY },
            { x: Math.max(0, fallbackX - 1), y: fallbackY }
        ];
    }

    return [head, body];
}

// 暫停功能相關函數
function togglePause() {
    if (gameState !== 'PLAYING') return;

    isPaused = !isPaused;

    if (isPaused) {
        pauseGame();
    } else {
        resumeGame();
    }
}

function pauseGame() {
    if (gameState !== 'PLAYING') return;

    noLoop();
    console.log('遊戲已暫停 - 按P鍵繼續');
}

function resumeGame() {
    if (gameState !== 'PLAYING') return;

    loop();
    console.log('遊戲已繼續');
}

function getGamePausedState() {
    return isPaused;
}

function setupDifficultySelector() {
    // 獲取所有難度按鈕
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // 設定預設選中簡單難度
    const defaultButton = document.querySelector('[data-difficulty="easy"]');
    if (defaultButton) {
        defaultButton.classList.add('selected');
    }

    // 為每個按鈕添加點擊事件
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按鈕的選中狀態
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));

            // 設定當前按鈕為選中狀態
            button.classList.add('selected');

            // 更新難度設定
            difficulty = button.getAttribute('data-difficulty');

            console.log(`難度已變更為: ${DIFFICULTY_SETTINGS[difficulty].name}`);
        });
    });

    console.log('難度選擇器初始化完成，預設難度：簡單');
}

// 調試函數：驗證按鈕功能（開發者工具使用）
function debugVirtualButtons() {
    console.log('=== 虛擬按鈕調試信息 ===');
    const buttonIds = ['L', 'R', 'U', 'D'];
    
    // 檢查 Canvas 狀態
    const canvas = document.querySelector('canvas:not(#nutritionChart)');
    console.log('Canvas 狀態:', {
        found: !!canvas,
        pointerEvents: canvas ? getComputedStyle(canvas).pointerEvents : 'N/A',
        zIndex: canvas ? getComputedStyle(canvas).zIndex : 'N/A'
    });
    
    // 檢查 Pad 容器
    const pad = document.getElementById('pad');
    console.log('Pad 容器:', {
        found: !!pad,
        zIndex: pad ? getComputedStyle(pad).zIndex : 'N/A',
        pointerEvents: pad ? getComputedStyle(pad).pointerEvents : 'N/A'
    });
    
    buttonIds.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            const rect = button.getBoundingClientRect();
            const style = getComputedStyle(button);
            console.log(`按鈕 ${id}:`, {
                found: true,
                visible: button.offsetWidth > 0 && button.offsetHeight > 0,
                position: { x: rect.left, y: rect.top },
                size: { width: rect.width, height: rect.height },
                style: {
                    pointerEvents: style.pointerEvents,
                    zIndex: style.zIndex,
                    position: style.position
                },
                eventListeners: getEventListeners ? getEventListeners(button) : '需在開發者工具中查看'
            });
            
            // 測試點擊功能
            console.log(`🧪 測試按鈕 ${id} 點擊功能...`);
            button.click();
        } else {
            console.log(`❌ 按鈕 ${id}: 未找到元素`);
        }
    });
    
    console.log('當前遊戲狀態:', gameState);
    console.log('是否暫停:', isPaused);
    console.log('當前方向:', dir);
    console.log('事件過濾器狀態: Canvas事件過濾器和全域委託已啟用');
    console.log('=== 調試信息結束 ===');
}

// 暴露到全域供調試使用
window.debugVirtualButtons = debugVirtualButtons;

// 調試函數：測試分享功能（不需要完整遊戲）
window.testShareFunction = async function() {
    console.log('🧪 開始測試分享功能...');
    
    // 模擬遊戲數據
    if (!ate || ate.length === 0) {
        ate = ['聖', '誕', '快', '樂', '耶', '穌', '愛', '我'];
        completedPhrases = ['聖誕快樂', '耶穌愛我'];
        console.log('📊 使用模擬遊戲數據進行測試');
    }
    
    try {
        // 測試截圖功能
        const canvas = await captureGameResult();
        console.log('✅ 截圖生成成功:', canvas.width, 'x', canvas.height);
        
        // 測試分享文字生成
        const shareText = generateShareText();
        console.log('✅ 分享文字生成成功:', shareText.substring(0, 100) + '...');
        
        // 顯示結果預覽
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
        const url = URL.createObjectURL(blob);
        
        console.log('🖼️ 截圖預覽 URL:', url);
        console.log('💡 在瀏覽器中打開此 URL 查看截圖效果');
        
        return { canvas, shareText, previewUrl: url };
    } catch (error) {
        console.error('❌ 分享功能測試失敗:', error);
        throw error;
    }
};

// ===== 📤 分享功能系統 (v2.0 - 遊戲畫布分享版) =====
//
// 功能概述：
// 1. 截圖遊戲畫布（包含聖誕夜空背景、聖誕燈、伯利恆之星等視覺效果）
// 2. 動態添加精簡的成果統計文字疊加層
// 3. 生成高解析度分享圖片，適合社群媒體分享
// 4. 支援多平台分享：Web Share API + 後備方案
//
// 技術特色：
// - 保留所有 CSS 聖誕視覺效果（透明背景截圖）
// - 精確計算截圖範圍（HUD 到控制按鈕）
// - 智能文字疊加定位，確保在複雜背景上清晰可讀
// - 完整的錯誤處理和資源清理機制

// 創建分享用的文字疊加層
function createShareOverlay() {
    // 安全獲取遊戲統計數據
    const totalChars = ate ? ate.length : 0;
    const completedCount = completedPhrases ? completedPhrases.length : 0;
    const totalBonus = completedPhrases ? completedPhrases.reduce((sum, phrase) => {
        const phraseData = ITEMS.phrases ? ITEMS.phrases[phrase] : null;
        return sum + (phraseData ? phraseData.bonus : 0);
    }, 0) : 0;

    // 找出最高成就詞句
    let topAchievement = '';
    if (completedPhrases && completedPhrases.length > 0) {
        const sortedPhrases = [...completedPhrases].sort((a, b) => b.length - a.length);
        topAchievement = sortedPhrases[0];
    }

    const overlay = document.createElement('div');
    overlay.id = 'share-overlay';
    
    // 定位在 Canvas 和控制按鈕之間的空間
    overlay.style.cssText = `
        position: fixed;
        bottom: 200px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 15, 35, 0.9);
        color: #FFD700;
        padding: 16px 24px;
        border-radius: 16px;
        text-align: center;
        font-family: inherit;
        font-weight: bold;
        border: 3px solid rgba(255, 215, 0, 0.6);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        z-index: 1002;
        pointer-events: none;
        backdrop-filter: blur(8px);
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        min-width: 280px;
        max-width: 90vw;
    `;

    let overlayHTML = `
        <div style="font-size: 1.2em; margin-bottom: 8px; color: #FFFFE0;">
            🎄 聖誕貪食蛇成果 🎄
        </div>
        <div style="font-size: 1em; margin-bottom: 6px;">
            📝 ${totalChars}字 · 🎯 ${completedCount}詞句
        </div>
    `;

    if (topAchievement) {
        const achievementIcon = topAchievement.length >= 4 ? '🌟' : topAchievement.length === 3 ? '⭐' : '💫';
        overlayHTML += `
            <div style="font-size: 0.9em; color: #FFD700; margin-top: 4px;">
                ${achievementIcon} ${topAchievement}
            </div>
        `;
    }

    overlay.innerHTML = overlayHTML;
    return overlay;
}

// 遊戲結果截圖生成功能 - 截圖遊戲畫布
async function captureGameResult() {
    try {
        console.log('🔄 開始生成遊戲畫布截圖...');
        
        // 找到遊戲畫布
        const gameCanvas = document.querySelector('canvas:not(#nutritionChart)');
        if (!gameCanvas) {
            throw new Error('找不到遊戲畫布元素');
        }

        // 創建文字疊加層
        const overlay = createShareOverlay();
        document.body.appendChild(overlay);

        // 等待元素渲染
        await new Promise(resolve => setTimeout(resolve, 100));

        // 計算遊戲區域範圍，包含所有視覺效果和控制按鈕
        const gameCanvasRect = gameCanvas.getBoundingClientRect();
        const hudElement = document.getElementById('hud');
        const padElement = document.getElementById('pad');
        
        // 計算截圖範圍：從 HUD 頂部到控制按鈕底部
        const topBound = hudElement ? hudElement.getBoundingClientRect().top : gameCanvasRect.top - 80;
        const bottomBound = padElement ? padElement.getBoundingClientRect().bottom : gameCanvasRect.bottom + 130;
        
        const captureWidth = window.innerWidth;
        const captureHeight = bottomBound - topBound;
        
        console.log(`📏 截圖範圍: ${captureWidth}x${captureHeight}, 從 Y=${topBound} 到 Y=${bottomBound}`);

        // 截圖整個遊戲視窗，包含所有聖誕視覺效果
        const canvas = await html2canvas(document.body, {
            backgroundColor: 'transparent', // 保留 CSS 聖誕夜空背景
            scale: 2, // 高解析度截圖
            useCORS: true,
            allowTaint: false,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            x: 0,
            y: Math.max(0, topBound),
            width: captureWidth,
            height: captureHeight,
            // 排除不需要的彈窗元素
            ignoreElements: (element) => {
                return element.id === 'over' || 
                       element.id === 'start-screen' || 
                       element.id === 'help-screen' ||
                       element.id === 'countdown-screen' ||
                       element.classList.contains('modal') ||
                       element.classList.contains('popup');
            }
        });
        
        // 清理疊加層
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        
        console.log('✅ 遊戲畫布截圖生成成功');
        return canvas;
    } catch (error) {
        // 確保清理疊加層
        const overlay = document.getElementById('share-overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        
        console.error('❌ 截圖生成失敗:', error);
        throw error;
    }
}

// 生成分享文字內容
function generateShareText() {
    // 安全獲取遊戲數據
    const totalChars = ate ? ate.length : 0;
    const completedCount = completedPhrases ? completedPhrases.length : 0;
    const totalBonus = completedPhrases ? completedPhrases.reduce((sum, phrase) => {
        const phraseData = ITEMS.phrases ? ITEMS.phrases[phrase] : null;
        return sum + (phraseData ? phraseData.bonus : 0);
    }, 0) : 0;
    
    let shareText = `🎄 聖誕貪食蛇遊戲成果分享 🎄\n\n`;
    shareText += `📝 收集字符：${totalChars} 個\n`;
    shareText += `🎯 完成詞句：${completedCount} 個\n\n`;
    
    if (completedPhrases && completedPhrases.length > 0) {
        shareText += `✨ 完成的聖誕祝福詞句：\n`;
        
        // 按字數分類顯示
        const phrases5 = completedPhrases.filter(p => p && p.length === 5);
        const phrases4 = completedPhrases.filter(p => p && p.length === 4);
        const phrases3 = completedPhrases.filter(p => p && p.length === 3);
        const phrases2 = completedPhrases.filter(p => p && p.length === 2);
        
        if (phrases5.length > 0) {
            shareText += `🌟 傳奇級：${phrases5.join('、')}\n`;
        }
        if (phrases4.length > 0) {
            shareText += `🏆 特等獎：${phrases4.join('、')}\n`;
        }
        if (phrases3.length > 0) {
            shareText += `🥈 優等獎：${phrases3.join('、')}\n`;
        }
        if (phrases2.length > 0) {
            shareText += `🥉 參加獎：${phrases2.join('、')}\n`;
        }
        
        shareText += `\n`;
    }
    
    shareText += `🎮 一起來挑戰聖誕貪食蛇，收集聖誕祝福吧！\n`;
    shareText += `🔗 ${window.location.href}`;
    
    return shareText;
}

// 主要分享功能
async function shareGameResult() {
    // 顯示載入狀態
    const shareButton = document.getElementById('share-result-button');
    const originalContent = shareButton.innerHTML;
    shareButton.innerHTML = '<span class="button-icon">⏳</span>準備分享中...';
    shareButton.disabled = true;
    
    try {
        console.log('🚀 開始分享遊戲結果...');
        
        // 檢查 Web Share API 支援
        if (navigator.share) {
            console.log('📱 偵測到 Web Share API 支援');
            
            // 嘗試圖片分享
            try {
                const canvas = await captureGameResult();
                
                // 轉換為 Blob
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        throw new Error('圖片生成失敗');
                    }
                    
                    const file = new File([blob], 'christmas-snake-result.png', {
                        type: 'image/png'
                    });
                    
                    // 檢查是否支援檔案分享
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        console.log('📤 使用圖片分享模式');
                        await navigator.share({
                            title: '🎄 聖誕貪食蛇成果分享',
                            text: generateShareText(),
                            files: [file]
                        });
                        console.log('✅ 圖片分享成功');
                    } else {
                        // 不支援檔案分享，使用文字分享
                        console.log('📝 降級為文字分享模式');
                        await shareAsText();
                    }
                }, 'image/png', 0.9);
                
            } catch (error) {
                console.warn('⚠️ 圖片分享失敗，降級為文字分享:', error);
                await shareAsText();
            }
            
        } else {
            console.log('💻 Web Share API 不支援，使用備用方案');
            await fallbackShare();
        }
        
    } catch (error) {
        console.error('❌ 分享功能發生錯誤:', error);
        showShareError('分享功能暫時不可用，請稍後再試');
    } finally {
        // 恢復按鈕狀態
        shareButton.innerHTML = originalContent;
        shareButton.disabled = false;
    }
}

// 文字分享功能
async function shareAsText() {
    const shareText = generateShareText();
    
    try {
        await navigator.share({
            title: '🎄 聖誕貪食蛇成果',
            text: shareText
        });
        console.log('✅ 文字分享成功');
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('ℹ️ 用戶取消了分享');
        } else {
            console.error('❌ 文字分享失敗:', error);
            throw error;
        }
    }
}

// 備用分享方案（不支援 Web Share API 的瀏覽器）
async function fallbackShare() {
    const shareText = generateShareText();
    
    try {
        // 嘗試複製到剪貼板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareText);
            showCopyNotification('🎉 遊戲成果已複製到剪貼板！\n\n你可以手動貼上到社群媒體分享給朋友們。');
        } else {
            // 更舊的瀏覽器：顯示文字讓用戶手動複製
            showShareText(shareText);
        }
    } catch (error) {
        console.error('❌ 備用分享方案失敗:', error);
        showShareText(shareText);
    }
}

// 顯示複製成功通知
function showCopyNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(34, 139, 34, 0.95);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        font-size: 1em;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.3);
        pointer-events: none;
        z-index: 10000;
        animation: fadeInOut 3s ease-out forwards;
        max-width: 90vw;
        word-wrap: break-word;
        white-space: pre-line;
    `;
    notification.textContent = message;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3秒後移除通知
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 3000);
}

// 顯示分享文字讓用戶手動複製
function showShareText(shareText) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 25px;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #333;">📤 分享內容</h3>
        <p style="margin-bottom: 15px; color: #666;">請手動複製以下內容到你想分享的地方：</p>
        <textarea readonly style="
            width: 100%;
            height: 200px;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-family: inherit;
            resize: none;
            margin-bottom: 15px;
        ">${shareText}</textarea>
        <button onclick="this.parentElement.parentElement.remove()" style="
            background: linear-gradient(45deg, #B8860B, #DAA520);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        ">關閉</button>
    `;
    
    // 自動選中文字內容
    setTimeout(() => {
        const textarea = content.querySelector('textarea');
        if (textarea) {
            textarea.select();
            textarea.focus();
        }
    }, 100);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // 點擊背景關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 顯示分享錯誤
function showShareError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(220, 53, 69, 0.95);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-size: 1em;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        z-index: 10000;
        animation: fadeInOut 2.5s ease-out forwards;
        max-width: 90vw;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 2.5秒後移除通知
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        } 
    }, 2500);
}

// 設置分享按鈕事件監聽器
function setupShareButton() {
    const shareButton = document.getElementById('share-result-button');
    if (shareButton) {
        shareButton.addEventListener('click', shareGameResult);
        console.log('✅ 分享按鈕事件監聽器已設置');
    } else {
        console.warn('⚠️ 找不到分享按鈕元素');
    }
}

// 設置說明頁按鈕
function setupHelpButtons() {
    // 從開始頁進入說明頁
    const helpButton = select('#help-button');
    if (helpButton) {
        helpButton.mousePressed(() => {
            previousScreen = 'START';
            showHelpScreen();
        });
    } else {
        console.warn('找不到說明頁按鈕元素 #help-button');
    }

    // 從結束頁進入說明頁
    const helpFromEndButton = select('#help-from-end-button');
    if (helpFromEndButton) {
        helpFromEndButton.mousePressed(() => {
            previousScreen = 'END';
            showHelpScreen();
        });
    } else {
        console.warn('找不到結束頁說明按鈕元素 #help-from-end-button');
    }

    // 返回按鈕
    const helpBackButton = select('#help-back-button');
    if (helpBackButton) {
        helpBackButton.mousePressed(hideHelpScreen);
    } else {
        console.warn('找不到說明頁返回按鈕元素 #help-back-button');
    }
}

// 顯示說明頁
function showHelpScreen() {
    console.log(`顯示說明頁，上一頁：${previousScreen}`);

    // 隱藏所有其他畫面
    const startScreen = select('#start-screen');
    const overScreen = select('#over');
    if (startScreen) startScreen.style('display', 'none');
    if (overScreen) overScreen.style('display', 'none');

    // 生成食物說明內容
    generateFoodHelp();

    // 顯示說明頁
    const helpScreen = select('#help-screen');
    if (helpScreen) {
        helpScreen.style('display', 'flex');
    }
}

// 隱藏說明頁，返回上一頁
function hideHelpScreen() {
    console.log(`隱藏說明頁，返回：${previousScreen}`);

    const helpScreen = select('#help-screen');
    if (helpScreen) {
        helpScreen.style('display', 'none');
    }

    // 根據上一頁顯示對應畫面
    if (previousScreen === 'START') {
        const startScreen = select('#start-screen');
        if (startScreen) {
            startScreen.style('display', 'flex');
        }
    } else if (previousScreen === 'END') {
        const overScreen = select('#over');
        if (overScreen) {
            overScreen.style('display', 'flex');
        }
    }
}

// 生成食物說明內容
function generateFoodHelp() {
    const categoriesContainer = select('#food-categories');
    if (!categoriesContainer || !window.ITEMS) {
        console.warn('無法生成食物說明：容器或 ITEMS 資料不存在');
        return;
    }

    // 清空現有內容
    categoriesContainer.html('');

    // 聖誕祝福分類
    const categories = {
        faith: {
            name: '📿 信仰核心',
            items: ['主', '神', '耶', '穌', '愛', '信'],
            description: '穩定持久的力量，建立堅固的信心根基'
        },
        christmas: {
            name: '⭐ 聖誕慶典',
            items: ['聖', '誕', '快', '樂', '夜', '音'],
            description: '歡樂的能量爆發，帶來節慶的喜悅'
        },
        blessing: {
            name: '🎁 祝福話語',
            items: ['平', '安', '福', '恩', '典', '惠'],
            description: '溫暖的祝福力量，帶來心靈的安慰'
        },
        praise: {
            name: '🕊️ 讚美敬拜',
            items: ['哈', '利', '路', '亞', '讚', '美'],
            description: '屬靈的升華，讚美中得著力量'
        },
        sharing: {
            name: '❤️ 愛的分享',
            items: ['分', '享', '溫', '暖', '人', '心'],
            description: '溫馨的情感力量，在愛中彼此建造'
        }
    };

    // 為每個分類創建 HTML
    Object.entries(categories).forEach(([key, category]) => {
        const categoryDiv = createDiv('');
        categoryDiv.addClass('food-category');

        const title = createElement('h4', category.name);
        categoryDiv.child(title);

        const itemsDiv = createDiv('');
        itemsDiv.addClass('food-items');

        category.items.forEach(char => {
            const itemDiv = createDiv('');
            itemDiv.addClass('food-item');

            // 根據食物類型設置顏色
            const foodType = getFoodType(char);
            const foodColor = FOOD_COLORS[foodType];
            itemDiv.style('background-color', foodColor.background);
            itemDiv.style('border', `2px solid ${foodColor.border}`);
            itemDiv.style('color', foodColor.text);

            // 添加字符和效果說明
            const charSpan = createSpan(char);
            charSpan.addClass('char');
            itemDiv.child(charSpan);

            // 獲取效果資訊
            const effect = ITEMS.effects[char];
            const spiritualData = ITEMS.spiritualGrowth[char];
            let effectText = '';

            if (effect) {
                if (effect.speedMul > 1) {
                    effectText = '加速';
                } else if (effect.speedMul < 1) {
                    effectText = '減速';
                } else {
                    effectText = '穩定';
                }
            }

            if (effectText) {
                const effectSpan = createSpan(effectText);
                itemDiv.child(effectSpan);
            }

            itemsDiv.child(itemDiv);
        });

        categoryDiv.child(itemsDiv);

        const descDiv = createDiv(category.description);
        descDiv.addClass('category-desc');
        categoryDiv.child(descDiv);

        categoriesContainer.child(categoryDiv);
    });

    console.log('食物說明內容已生成');
}

// 創建詞句完成特效 - HUD 區域版本
function createPhraseCompletionEffect(phrase) {
    // 性能優化：如果是低性能設備，使用簡化版特效
    if (window.reducedAnimations) {
        createSimplePhraseEffect(phrase);
        return;
    }
    const effectDiv = document.createElement('div');
    effectDiv.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 15, 35, 0.85);
        color: #FFD700;
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 1em;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        border: 2px solid rgba(255, 215, 0, 0.5);
        pointer-events: none;
        z-index: 101;
        animation: hudPhraseComplete 2s ease-out forwards;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    `;
    effectDiv.innerHTML = `✨ 完成：<span style="color: #FFFFE0;">${phrase}</span> ✨`;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes hudPhraseComplete {
            0% { 
                opacity: 0; 
                transform: translateX(-50%) translateY(-20px) scale(0.8); 
            }
            20% { 
                opacity: 1; 
                transform: translateX(-50%) translateY(0px) scale(1.05); 
            }
            70% { 
                opacity: 1; 
                transform: translateX(-50%) translateY(0px) scale(1); 
            }
            100% { 
                opacity: 0; 
                transform: translateX(-50%) translateY(-15px) scale(0.9); 
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(effectDiv);
    
    // 2秒後移除效果
    setTimeout(() => {
        if (effectDiv.parentNode) {
            effectDiv.parentNode.removeChild(effectDiv);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 2000);
    
    // 添加簡化的慶祝效果
    createSimpleCelebrationEffect();
}

// 創建簡化的慶祝效果 - HUD 區域版本
function createSimpleCelebrationEffect() {
    // 只創建 2 個小型星星效果在 HUD 區域
    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.style.cssText = `
                position: fixed;
                top: 45px;
                left: ${50 + (i === 0 ? -15 : 15)}%;
                font-size: 1.2em;
                pointer-events: none;
                z-index: 102;
                animation: hudStarPop 1.2s ease-out forwards;
                color: #FFD700;
                text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
            `;
            star.textContent = ['✨', '⭐', '💫'][Math.floor(Math.random() * 3)];
            
            // 添加 HUD 星星動畫
            const style = document.createElement('style');
            style.textContent = `
                @keyframes hudStarPop {
                    0% { 
                        opacity: 0; 
                        transform: translateY(10px) scale(0.5); 
                    }
                    30% { 
                        opacity: 1; 
                        transform: translateY(-5px) scale(1.2); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-15px) scale(0.8); 
                    }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(star);
            
            // 1.2秒後移除
            setTimeout(() => {
                if (star.parentNode) {
                    star.parentNode.removeChild(star);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 1200);
        }, i * 150);
    }
}

// 簡化版詞句完成特效（適用於低性能設備）- HUD 版本
function createSimplePhraseEffect(phrase) {
    const effectDiv = document.createElement('div');
    effectDiv.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 15, 35, 0.9);
        color: #FFD700;
        padding: 6px 12px;
        border-radius: 10px;
        font-size: 0.9em;
        font-weight: bold;
        text-align: center;
        pointer-events: none;
        z-index: 101;
        transition: opacity 0.3s ease;
        border: 2px solid rgba(255, 215, 0, 0.5);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    `;
    effectDiv.textContent = `✨ 完成：${phrase} ✨`;
    
    document.body.appendChild(effectDiv);
    
    // 1.5秒後淡出移除
    setTimeout(() => {
        effectDiv.style.opacity = '0';
        setTimeout(() => {
            if (effectDiv.parentNode) {
                effectDiv.parentNode.removeChild(effectDiv);
            }
        }, 300);
    }, 1500);
}

// 連擊特效 - HUD 區域版本
function createComboEffect(combo) {
    const effectDiv = document.createElement('div');
    effectDiv.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: rgba(255, 107, 53, 0.9);
        color: white;
        padding: 6px 12px;
        border-radius: 10px;
        font-size: 0.9em;
        font-weight: bold;
        text-align: center;
        pointer-events: none;
        z-index: 101;
        animation: hudComboPopup 1.5s ease-out forwards;
        box-shadow: 0 3px 10px rgba(255, 107, 53, 0.4);
        border: 2px solid rgba(255, 107, 53, 0.6);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    `;
    effectDiv.textContent = `🔥 ${combo}連擊！+1秒`;
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes hudComboPopup {
            0% { 
                opacity: 0; 
                transform: translateX(20px) scale(0.8); 
            }
            30% { 
                opacity: 1; 
                transform: translateX(0px) scale(1.05); 
            }
            70% { 
                opacity: 1; 
                transform: translateX(0px) scale(1); 
            }
            100% { 
                opacity: 0; 
                transform: translateX(-10px) scale(0.9); 
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(effectDiv);
    
    // 1.5秒後移除效果
    setTimeout(() => {
        if (effectDiv.parentNode) {
            effectDiv.parentNode.removeChild(effectDiv);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 1500);
}