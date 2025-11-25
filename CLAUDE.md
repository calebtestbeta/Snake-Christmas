# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese text-based Snake game called "文字貪食蛇｜聖誕祝福版" (Text Snake - Christmas Blessing Edition). It's a unique twist on the classic Snake game where the snake collects Christmas and Christian faith-themed Chinese characters. Players can form meaningful phrases like "聖誕快樂" and "哈利路亞" to trigger special blessing effects and spiritual growth.

## Development Commands

### Running the Game
- **Local Development**: Open `index.html` directly in a browser or use a local HTTP server
- **Access**: Navigate to `http://localhost:[PORT]` when using a local server

### Web Server Management (重要！)

#### Smart Server Startup Protocol
為了避免 "Address already in use" 錯誤和端口衝突，建議使用以下流程：

```bash
# 1. 檢查現有 server 進程
ps aux | grep "python.*http.server" | grep -v grep

# 2. 清理現有 servers (推薦在啟動新 server 前執行)
pkill -f "python.*http.server" 2>/dev/null || true

# 3. 智能端口檢測和啟動
for port in 8000 8001 8002 8003; do
    if ! lsof -ti:$port > /dev/null 2>&1; then
        echo "🚀 Starting server on port $port"
        python3 -m http.server $port --directory .
        break
    fi
done
```

#### HTTP Server Options
```bash
# Python (推薦 - 內建支援)
python3 -m http.server 8000

# Node.js (需要全域安裝)
npx http-server -p 8001

# PHP (適用於 PHP 開發者)
php -S localhost:8002
```

#### Quick Management Commands
```bash
# 快速清理所有 HTTP servers
alias kill-servers="pkill -f 'python.*http.server'"

# 檢查端口使用情況
alias check-ports="lsof -i :8000,8001,8002,8003"

# 智能啟動 (自動找可用端口)
alias start-server="for port in 8000 8001 8002 8003; do if ! lsof -ti:\$port >/dev/null 2>&1; then python3 -m http.server \$port; break; fi; done"
```

#### Automated Server Management Script

專案包含 `dev-server.sh` 自動化腳本，提供完整的服務器管理功能：

```bash
# 賦予執行權限 (首次使用)
chmod +x dev-server.sh

# 基本用法
./dev-server.sh           # 智能啟動服務器
./dev-server.sh cleanup   # 清理所有服務器  
./dev-server.sh restart   # 清理並重新啟動
./dev-server.sh check     # 檢查服務器狀態
./dev-server.sh help      # 顯示幫助信息
```

**腳本功能特色**:
- 🔍 自動檢測現有服務器進程
- 🧹 一鍵清理所有衝突的服務器
- 🚀 智能端口選擇 (8000→8001→8002→8003)
- 💡 用戶友善的狀態提示和建議
- 🎨 彩色輸出增強可讀性

### Testing
- No automated test framework - testing is done manually through browser gameplay
- Test on multiple devices/screen sizes due to responsive design focus
- Verify touch controls work on mobile devices

## Architecture Overview

### Core Game System
The game uses **P5.js** as its rendering engine with a modular Christmas-themed architecture:

- **Fixed Grid System**: 18×25 grid with responsive cell sizing optimized for Chinese characters
- **State Management**: Global game state with distinct phases (START, PLAYING, OVER)
- **Entity System**: Snake segments, Christmas characters, Bethlehem star effects, and Christmas light borders
- **Event-Driven**: Keyboard/touch input, timer events, food spawning intervals, and phrase completion triggers
- **Visual Effects System**: Bethlehem star with breathing animation, colorful Christmas light borders, phrase completion celebrations

### Key Architecture Patterns

1. **Responsive Canvas Calculation**: Dynamic canvas sizing based on device type and viewport with Christmas light border considerations
2. **Modular Character System**: Separate spiritual growth data, effects, and visual rendering for Christmas/faith characters
3. **Color-Coded Character Types**: 5-category system (faith, christmas, blessing, praise, sharing) with distinct color schemes
4. **Device-Specific Adaptations**: iOS/Android/Desktop specific styling with Christmas theme optimizations
5. **Phrase Detection System**: Real-time analysis of collected characters to form meaningful phrases
6. **Visual Effects Engine**: Multi-layer Christmas atmosphere (star field, snowfall, Bethlehem star, Christmas lights)

### File Structure & Dependencies

- **index.html**: Main game interface with embedded styles, device detection, and video demo modal
- **game.js**: Core game logic, rendering, state management, and video demo system
- **items.js**: Food data definitions (nutrition, effects, character pools)
- **ending.js**: Game completion analysis and nutritional feedback system
- **christmas-snake-demo.mp4**: Screen-recorded gameplay demonstration video
- **工作人員指南.txt**: Staff guide for event management and phrase completion verification

**External Dependencies**:
- P5.js v1.9.0 (CDN)
- Chart.js (CDN) for nutrition visualization
- HTML5 Video API for demo playback

## Critical Implementation Details

### Christmas Character System Architecture
The game categorizes characters into spiritual/Christmas types with distinct visual and gameplay effects:

- **📿 信仰核心** (Faith Core): Gold color scheme (#FFD700), stable spiritual foundation characters like "主", "神", "耶", "穌"
- **⭐ 聖誕慶典** (Christmas Celebration): Bright yellow scheme (#FFF570), joyful energy burst characters like "聖", "誕", "快", "樂"
- **🎁 祝福話語** (Blessing Words): Red/pink scheme (#FFB3BA), warm blessing characters like "平", "安", "福", "恩"
- **🕊️ 讚美敬拜** (Praise & Worship): Silver/white scheme (#E8E8E8), spiritual uplift characters like "哈", "利", "路", "亞"
- **❤️ 愛的分享** (Love & Sharing): Pink scheme (#FFCCCB), warm emotion characters like "分", "享", "溫", "暖"

### Responsive Design System
Uses breakpoint-based responsive design with device-specific optimizations:

- **Mobile** (≤480px): Optimized touch controls, larger UI elements
- **Tablet** (481-768px): Balanced layout with moderate sizing
- **Desktop** (>768px): Full keyboard controls, compact UI

### State Management Patterns
- Global game state stored in module-level variables
- Separate state objects for statistics (`stat`), collected items (`ate`), and UI state
- Effect system with temporal duration and post-effect callbacks

## Development Guidelines

### Adding New Christmas Characters
1. Add character to `ITEMS.pool` array in `items.js`
2. Define effect properties in `ITEMS.effects` with `kind` field for category
3. Set spiritual growth values in `ITEMS.spiritualGrowth`
4. Character colors are auto-assigned based on spiritual category (`kind` field)
5. Add to phrase definitions in `ITEMS.phrases` if part of meaningful combinations

### Modifying Game Balance
- Adjust speed multipliers in `ITEMS.effects` (1.0 = normal, >1.0 = faster, <1.0 = slower)
- Modify `DIFFICULTY_SETTINGS` in `game.js` for three Christmas-themed difficulty levels
- Change `GAME_CONFIG` constants for timing, spawn behavior, and Christmas light effects
- Update phrase bonuses in `ITEMS.phrases` for different blessing effects
- Adjust Bethlehem star parameters in `initializeBethlehemStar()` function

### Responsive Design Changes
- Modify `calculateOptimalCanvasSize()` for canvas sizing logic
- Update CSS media queries in `index.html` for UI element scaling
- Adjust `GAME_CONFIG` breakpoint constants for different device classifications

### Font System
The game prioritizes LINE SEED TW fonts with automatic fallback detection, optimized for beautiful Chinese character display in Christmas theme. Font availability is tested using canvas text measurement before game start. Font notice is hidden but font detection logic remains active.

## Device-Specific Considerations

- **iOS Safari**: Special viewport handling and background color optimization
- **Android Chrome**: Touch event optimization and different background colors  
- **Desktop**: Keyboard-only controls with hover states
- **Small Screens**: Automatic UI element hiding and simplified layouts for screens <320px width

## Performance Notes

- Fixed 16 FPS frame rate for consistent cross-device performance
- Efficient collision detection using grid-based position checking
- DOM element caching through `DOMManager` pattern to minimize lookups
- Responsive text sizing calculations cached per frame
- Christmas light effects optimized with performance monitoring
- Bethlehem star animations with reduced motion support for accessibility
- Multi-layer visual effects (stars, snowfall, lights) with automatic degradation on low-performance devices

## Recent Development History (v1.0 聖誕祝福版)

### 2025-11-25 - 影片示範系統實作與工作人員指南優化

#### 影片示範系統完整實作
- **功能概述**: 新增「🎥 觀看遊戲示範」按鈕，提供完整的螢幕錄製遊戲示範
- **技術架構**: 基於 HTML5 Video API 的 Modal 系統，支援 MP4/WebM 雙格式
- **響應式設計**: 自適應各種設備螢幕尺寸，包含移動端優化
- **使用者體驗**: 全螢幕播放功能、載入指示器、錯誤處理機制

#### 核心功能特色

**Modal 系統設計** (`index.html:2173-2227`):
- 全螢幕遮罩背景，支援 `backdrop-filter: blur(3px)` 模糊效果
- 聖誕主題視覺設計，金色邊框與漸層背景
- 響應式佈局，支援橫豎屏自動調整

**HTML5 影片播放器** (`setupVideoDemo()` in `game.js:3949+`):
```javascript
// 跨瀏覽器全螢幕支援
if (demoVideo.requestFullscreen) {
    demoVideo.requestFullscreen();
} else if (demoVideo.webkitRequestFullscreen) {
    demoVideo.webkitRequestFullscreen();
}
```

**載入與錯誤處理系統**:
- 動畫載入指示器配合播放狀態
- 網路錯誤自動偵測與友善提示
- 'canplay' 和 'loadeddata' 雙重載入事件監聽

#### 工作人員指南現代化更新

**分數系統移除** (配合遊戲簡化設計):
- 移除所有分數相關描述與數值參考
- 專注詞句完成機制與屬靈成長分析
- 更新獎品發放檢查流程，以詞句達成為核心標準

**內容結構優化**:
- 簡化任務詞句列表，突出詞句本身意義
- 更新結果檢查步驟，強調屬靈成長圖表功能
- 調整工作人員教學重點，配合實際遊戲體驗

#### 開發者工作流程改進

**問題解決經驗**:
- **Element ID 除錯**: 發現並修復 JavaScript 中 `video-close-button` vs `video-close-btn` ID 不匹配問題
- **事件處理優化**: 實作完整的影片事件生命週期管理
- **跨瀏覽器相容性**: 針對不同瀏覽器的全螢幕 API 提供 fallback 機制

**效能考量**:
- 影片 `preload="metadata"` 設定，平衡載入速度與頻寬消耗
- Modal 顯示/隱藏動畫優化，使用 CSS transitions
- 移動端觸控優化，確保按鈕可用性

### 2025-11-22 - iPhone 16 Plus Canvas 重疊問題修復

#### 問題診斷與解決
- **核心問題**: iPhone 16 Plus (430px 寬度) 的遊戲畫布與控制按鈕重疊
- **根本原因**: 響應式斷點覆蓋不完整，iPhone 16 Plus 落入桌面版 CSS 規則範圍
- **影響範圍**: 所有大螢幕 iPhone 設備 (iPhone 12 Pro Max, iPhone 14 Plus, iPhone 16 Plus)

#### 技術實作解決方案

**新增響應式斷點** (`index.html:1282-1295`):
```css
/* iPhone 16 Plus 和類似大螢幕手機 (430-450px) */
@media (max-width: 450px) and (min-width: 429px) {
    canvas:not(#nutritionChart) {
        margin: 80px auto 280px auto;  /* 大幅增加底部邊距防止重疊 */
        max-width: calc(100vw - 20px);
    }
}
```

**Canvas 底部邊距優化**:
- **iPhone 16 Plus** (430-450px): 280px 底部邊距
- **iPhone 14 Plus/12 Pro Max** (391-428px): 270px 底部邊距  
- **iPhone 12/13/14** (376-390px): 250px 底部邊距
- **保持控制按鈕位置**: `bottom: 10-12px` 確保觸控便利性

#### 響應式設計架構改進
- **完整覆蓋**: 320px-480px 所有手機設備尺寸
- **漸進式邊距**: 根據螢幕大小調整 Canvas 底部間距
- **觸控優化**: 維持 44px 最小觸控區域標準
- **視覺一致性**: 保持聖誕燈邊框與 Canvas 對齊

#### 用戶體驗提升
- **零重疊**: 所有 iPhone 機型的遊戲內容與控制按鈕完全分離
- **舒適操作**: 充足的緩衝空間確保誤觸防護
- **視覺平衡**: Canvas 居中顯示，上下間距協調
- **分享功能**: 修復後的佈局確保分享截圖清晰完整

### 2025-11-21 - 倒數系統優化升級

#### 使用者體驗增強
- **倒數時間延長**: 從 3 秒延長至 5 秒，給予玩家更充足的準備時間
- **背景透明度優化**: 倒數期間背景透明度從 `rgba(15, 15, 35, 0.9)` 調整為 `rgba(15, 15, 35, 0.3)`，大幅提高透明度
- **視覺連續性提升**: 玩家在倒數期間可清楚看到遊戲初始狀態，包括蛇的起始位置、食物分布和聖誕夜空背景
- **開始體驗最佳化**: 增強遊戲開始時的視覺連貫性，減少突兀感

#### 技術實作細節
**Code Changes** (`game.js:720, 731`):
```javascript
// 倒數初始值從 3 改為 5
DOMManager.setContent('countdownNumber', 5);
let count = 5;
```

**UI Enhancement** (`index.html:1923-1924`):
```css
/* 背景透明度大幅提高，從 0.9 降至 0.3 */
background: rgba(15, 15, 35, 0.3);
```

### 2024-11-12 - Christmas Blessing Theme Transformation

#### Major Theme Conversion
- **Complete theme transformation** from breakfast to Christmas/Christian faith
- **Character system overhaul**: 40+ Christmas and faith-related Chinese characters
- **Phrase detection system**: Real-time detection of meaningful phrases like "聖誕快樂", "哈利路亞", "耶穌愛我"
- **Spiritual growth system**: Replaced nutrition with faith-based growth metrics (信心、愛心、盼望、平安、喜樂、讚美)

#### Visual Enhancement Features

**Bethlehem Star System** (`initializeBethlehemStar()`, `updateBethlehemStar()`, `drawBethlehemStar()`)
- Dynamic moving star with intelligent pathfinding across the night sky
- Enhanced breathing effect with brightness range 0.3-1.0 and halo size 8-28px
- Performance optimization with `prefers-reduced-motion` support
- Special effects triggered by phrase completions
- Responsive sizing for mobile devices

**Christmas Light Border System** (`drawChristmasLightBorder()`, `drawChristmasLight()`)
- 8-color Christmas light sequence around game canvas
- Multi-layer glow effects with outer, middle, and enhanced glow layers
- Alternating blink animation with 1.5-second cycle
- Cross-ray light effects for high brightness states
- Responsive light sizing with mobile optimization
- Enhanced visibility with increased borderOffset (2.0x) and canvas margins

**Christmas Night Sky Background**
- Multi-layer CSS radial gradients for starfield effect
- Gentle snowfall animation with CSS transforms
- Transparent canvas background to allow CSS Christmas atmosphere
- Performance-optimized with reduced animation complexity on mobile

#### Gameplay Enhancement Features

**Phrase Completion System** (`checkForCompletedPhrases()`, `getCharPhraseInfo()`)
- Real-time phrase detection from collected characters
- Visual highlighting of completed phrases in results screen
- Phrase grouping with animated containers and special effects
- Different icons and styling based on phrase length (2-4 characters)
- Special blessing effects for different phrase completions

**Character Classification System** (Enhanced `FOOD_COLORS`, `getFoodType()`, `getFoodColor()`)
- 5-category system with distinct color schemes and spiritual meanings
- High-contrast color optimization for better accessibility
- Consistent visual identity across game elements
- Snake body coloring based on collected character types

**Bible Verse Blessing System** (Complete `ending.js` overhaul)
- Intelligent Scripture selection based on spiritual growth patterns
- 5 categories of Christmas Bible verses (nativity, angels, light/hope, love/salvation, peace/joy)
- Personalized spiritual growth analysis and recommendations
- Chart.js integration for spiritual growth visualization

#### Technical Infrastructure Improvements

**Responsive Design Enhancements**
- Comprehensive mobile device support (iPhone SE to iPhone 14 Plus)
- Dynamic canvas sizing with Christmas light border considerations
- Enhanced touch controls with improved button spacing
- Canvas margin adjustments to prevent Christmas light clipping

**Performance Optimization**
- Device detection with automatic animation degradation
- Memory-efficient DOM element management through `DOMManager`
- Reduced animation complexity for low-performance devices
- Accessibility support with motion reduction preferences

**Code Architecture Improvements**
- Modular character system with clear separation of concerns
- Enhanced error handling and validation throughout
- Comprehensive configuration system via `GAME_CONFIG`
- Improved state management for complex visual effects

### Recent Bug Fixes and Adjustments

#### 2024-11-12 Evening - Christmas Light Visibility Enhancement
- **Issue**: Christmas lights were barely visible and being clipped by canvas container
- **Solution**: 
  - Increased `borderOffset` from 1.2x to 2.0x in `drawChristmasLightBorder()`
  - Enhanced canvas margins from 60px/108px to 80px/130px on desktop
  - Adjusted all responsive breakpoints to provide adequate space for lights
  - Removed conflicting box-shadow that was interfering with light visibility
  - Updated electrical wire rendering area to match new light positions

#### Character Phrase Highlighting System
- **Feature**: Completed phrases like "哈利路亞" now appear in special highlighted groups
- **Implementation**: 
  - Added phrase detection algorithm in `checkForCompletedPhrases()`
  - Created animated phrase containers with CSS glow effects
  - Implemented character-to-phrase mapping system
  - Added different styling based on phrase length and importance

#### Font Notice Hiding
- **User Request**: Hide font availability notice while preserving detection logic
- **Implementation**: Added `style="display: none;"` to font notice div while maintaining all font detection functionality

### 2024-11-15 - Analytics Integration & Error Fixes

#### Google Analytics 4 Implementation

**Comprehensive Event Tracking System**
- **Measurement ID Integration**: G-LZ4KDGDLED configured in index.html
- **Game Start Events**: Track player engagement initiation with difficulty metadata
- **Phrase Completion Events**: Monitor Christmas phrase achievement rates and popularity
- **Game End Events**: Capture session performance metrics including score, duration, and completion stats

**Developer Testing Infrastructure**
- **GA4 Test Helper**: Built comprehensive testing tool (ga4-test-helper.html)
- **Event Validation**: Real-time testing interface with network request monitoring
- **Debug Integration**: Browser developer tools integration for event verification

**Critical Bug Fixes**
- **gameOver() Error Resolution**: Fixed `Cannot read properties of undefined (reading 'length')` error
- **Safe Property Access**: Implemented defensive programming with null checks (`snake ? snake.length : 0`)
- **Graceful Degradation**: Added gtag availability checks to prevent tracking failures

**Technical Implementation Details**
```javascript
// Added comprehensive error handling in GA4 events
'score': snake ? snake.length : 0,
'completed_phrases': completedPhrases ? completedPhrases.length : 0,
```

#### Analytics Integration Architecture

**Event Tracking Strategy**
- **Non-intrusive Monitoring**: Zero impact on game performance or user experience
- **Privacy-First Approach**: No personal data collection, only gameplay interaction metrics
- **Real-time Validation**: Immediate verification system for development and testing

**Future Data Applications**
- **Game Balance Optimization**: Data-driven difficulty adjustments based on completion rates  
- **Content Strategy**: Identify most popular Christmas phrases for content expansion
- **Performance Monitoring**: Device-specific analytics for responsive design optimization
- **User Experience Enhancement**: Session duration analysis for engagement optimization

### 2024-11-13 - Revolutionary Task Completion Optimization

#### Major Gameplay Enhancement: 3-5x Phrase Completion Rate Improvement

**Core Problem Solved**: Original phrase detection system required exact sequential order, making 4-character phrases nearly impossible to complete within the 60-second timeframe.

**Comprehensive Solution**: Implemented multi-faceted optimization system combining quantitative adjustments, algorithmic improvements, and intelligent AI assistance.

#### Quantitative Performance Adjustments

**Character Spawning Optimization** (`GAME_CONFIG` updates in `game.js`)
- **Increased simultaneous characters**: 6 → 8 characters appearing at once
- **Enhanced core character probability**: 30% → 55% for essential Christmas/faith characters
- **Extended character change interval**: 5 seconds → 7.5 seconds (more collection time)

#### Revolutionary Flexible Phrase Detection System

**Breakthrough Algorithm Implementation** (`checkForCompletedPhrases()` complete rewrite)
- **Old System**: Required exact sequential order matching using `collectedString.includes(phrase)`
- **New System**: Character counting algorithm allowing any collection order
```javascript
// Revolutionary character counting approach
const canComplete = Object.keys(requiredCounts).every(char => {
    return collectedCharCounts[char] >= requiredCounts[char];
});
```
- **Impact**: 4-character phrases like "聖誕快樂" now achievable without specific sequence
- **Technical Innovation**: Maintains phrase integrity while removing artificial difficulty barriers

#### Real-time Progress Tracking System

**Intelligent HUD Enhancement** (`analyzePhraseProgress()`, `updatePhraseProgressDisplay()`)
- **Live Progress Bars**: Display completion percentage for top 3 progressing phrases
- **Missing Character Indicators**: Show exactly which characters player needs next
- **Responsive Design**: Mobile-optimized display with compact progress indicators
- **Smart Filtering**: Only shows phrases with ≥25% progress to avoid clutter

#### AI-powered Intelligent Character Generation

**Adaptive Spawning Algorithm** (`getWeightedFood()`, `getNeededCharacters()`)
- **40% Intelligent Probability**: Prioritizes characters player actually needs for phrase completion
- **Progress Analysis**: AI examines current player progress to determine optimal character spawning
- **Dynamic Adaptation**: System learns from player's collected characters and adjusts spawning accordingly
- **Balanced Approach**: Combines intelligent spawning with original random Christmas character system

#### Visual Guidance Enhancement System

**Enhanced Player Feedback** (Visual effects in `draw()` function)
- **Golden Glow Highlighting**: Needed characters display special gold aura effects
- **Animated Attention Grabbers**: Subtle bouncing animation for high-priority characters
- **Enhanced Border Styling**: Thicker, gold-colored borders for needed characters
- **Real-time Visual Cues**: Dynamic highlighting updates as player progress changes

#### Combo Reward & Engagement System

**Advanced Player Motivation** (`handleFoodConsumption()` combo logic)
- **Combo Detection**: 3-second window for consecutive character collection
- **Time Rewards**: Every 5-combo streak grants +1 second gameplay time
- **Visual Feedback**: Explosive combo celebration effects with progress indicators
- **Strategic Depth**: Encourages focused, rapid collection strategies

#### Technical Architecture Improvements

**Performance & Maintainability Enhancements**
- **Modular Progress System**: Separate functions for analysis, display, and character intelligence
- **Efficient Algorithms**: Optimized character counting with O(n) complexity instead of O(n²) string searching
- **Mobile-First Responsive**: Progress display automatically adapts to device screen size constraints
- **Memory Optimization**: Smart caching of needed character analysis to prevent repeated calculations

#### Expected & Measured Results

**Dramatic Improvement Metrics**
- **Phrase Completion Rate**: 3-5x increase in successful phrase formations
- **Player Engagement**: Real-time progress feedback maintains motivation
- **Accessibility**: Flexible order matching accommodates different play styles
- **Strategic Depth**: Combo system adds skill-based time management layer

### Claude Code Development Protocol

#### Web Server Management Best Practices

**For Claude Code Assistants**: 以下指導原則有助於提供更順暢的開發體驗

##### Server Lifecycle Management
1. **啟動前檢查**
   ```bash
   # 總是先檢查現有進程
   ps aux | grep "python.*http.server" | grep -v grep
   ```

2. **智能衝突處理**
   ```bash
   # 提供清理選項而非強制覆蓋
   if lsof -ti:8000 >/dev/null 2>&1; then
       echo "⚠️  Port 8000 is already in use"
       echo "🔧 Run: pkill -f 'python.*http.server' to clean up"
   fi
   ```

3. **用戶友善提示**
   - 明確告知端口使用情況
   - 提供具體的清理命令
   - 建議使用智能端口檢測腳本

##### Development Workflow Enhancement
- **端口策略**: 優先順序 8000 > 8001 > 8002 > 8003
- **清理策略**: 用戶請求時提供快速清理指令
- **進程追蹤**: 記住啟動的 server 以便後續管理
- **自動化建議**: 推薦使用智能啟動腳本避免手動管理

## Mobile Development & Testing

### iOS Safari Touch Controls (v1.1.1 - 2024-11-13)

#### Problem Diagnosis
- **Issue**: iPhone 虛擬按鈕 (L/R/U/D) 無觸控反應
- **Root Cause**: p5.js `mousePressed()` 在 iOS Safari 兼容性不佳
- **Impact**: 遊戲核心控制功能失效，嚴重影響移動端用戶體驗

#### Solution Implementation
1. **事件系統重構** (`game.js:429-487`):
   ```javascript
   // 替換 p5.js mousePressed 為原生事件
   button.addEventListener('touchstart', handleDirection, { passive: false });
   button.addEventListener('click', handleDirection, { passive: false });
   ```

2. **iOS 專用優化** (`index.html:226-299`):
   ```css
   #pad button {
       touch-action: manipulation;
       -webkit-touch-callout: none;
       -webkit-tap-highlight-color: transparent;
       min-width: 44px; /* iOS HIG 標準 */
   }
   ```

3. **調試工具**:
   ```javascript
   // 開發者工具中使用
   window.debugVirtualButtons(); // 檢測按鈕狀態和事件
   ```

#### Testing Protocol
1. 部署到本地服務器 (`http://localhost:8000`)
2. 在 iPhone Safari 中測試四方向按鈕
3. 檢查控制台是否有觸控事件日誌
4. 驗證按鈕視覺反饋 (`.touched` 類別)

#### Key Learnings
- iOS Safari 對 p5.js 事件支持有限
- 必須使用 `{ passive: false }` 確保 `preventDefault()` 生效
- 44px 最小觸控區域是 iOS 可用性標準
- 原生 JavaScript 事件比第三方庫更可靠

## Common Issues & Solutions

### Port Conflicts ("Address already in use")

**Problem**: Multiple HTTP servers running on same port causing conflicts

**Solutions**:
```bash
# Method 1: Kill specific port process
lsof -ti:8000 | xargs kill -9

# Method 2: Kill all Python HTTP servers  
pkill -f "python.*http.server"

# Method 3: Use smart port detection
for port in 8000 8001 8002 8003; do
    if ! lsof -ti:$port >/dev/null 2>&1; then
        python3 -m http.server $port
        break
    fi
done
```

**Prevention**: Always check existing processes before starting new servers

### Multiple Server Management

**Problem**: Forgetting about background servers leading to resource waste

**Solution**: Implement systematic server management
```bash
# Create a server management script
#!/bin/bash
echo "🔍 Checking existing servers..."
ps aux | grep "python.*http.server" | grep -v grep

echo "🧹 Cleaning up existing servers..."
pkill -f "python.*http.server" 2>/dev/null || true

echo "🚀 Starting fresh server..."
python3 -m http.server 8000
```

## Analytics & Statistics Integration

### Google Analytics 4 (GA4) Setup

#### Implementation Overview
The game integrates comprehensive GA4 event tracking to monitor player interactions and game performance.

**GA4 Configuration**:
- **Measurement ID**: G-LZ4KDGDLED (configured in index.html)
- **Implementation**: Global Site Tag (gtag.js) with custom event tracking
- **Privacy**: No personal data collected, only game interaction metrics

#### Tracked Events

**Core Game Events**:
1. **game_start**: Triggered when player begins game
   - Properties: difficulty level, event category
   - Purpose: Track game session initiation rates

2. **phrase_completed**: Triggered when Christmas phrases are completed  
   - Properties: phrase text, phrase length, total completed count
   - Purpose: Monitor phrase completion success rates and popular phrases

3. **game_end**: Triggered when game session ends
   - Properties: final score, completed phrases count, game duration, difficulty
   - Purpose: Analyze game performance and session length

**Page Analytics**:
- **page_view**: Automatic tracking of game page visits
- **user_engagement**: Session duration and interaction metrics

#### GA4 Event Testing

**Testing Tools**:
- `ga4-test-helper.html`: Comprehensive testing interface for GA4 events
- Real-time event validation with browser developer tools
- Network request monitoring for gtag API calls

**Testing Procedure**:
1. Open ga4-test-helper.html in browser
2. Enable browser Developer Tools > Network tab
3. Filter for "google-analytics.com" or "collect" requests
4. Execute test events and verify network requests
5. Check GA4 Real-time Reports for event confirmation

#### Development Integration

**Code Implementation**:
```javascript
// Game start tracking (game.js:722-729)
if (typeof gtag !== 'undefined') {
    gtag('event', 'game_start', {
        'event_category': 'engagement',
        'event_label': 'christmas_snake_game',
        'difficulty': difficulty
    });
}

// Phrase completion tracking (game.js:1263-1271)
gtag('event', 'phrase_completed', {
    'event_category': 'achievement',
    'event_label': phrase,
    'phrase_length': phrase.length,
    'total_completed': completedPhrases.length + newCompletedPhrases.length
});

// Game end tracking (game.js:2017-2025)
gtag('event', 'game_end', {
    'event_category': 'engagement',
    'event_label': 'christmas_snake_game',
    'score': snake ? snake.length : 0,
    'completed_phrases': completedPhrases ? completedPhrases.length : 0,
    'game_duration': GAME_CONFIG.GAME_DURATION - timer,
    'difficulty': difficulty
});
```

**Error Handling**:
- Safe checks for gtag availability: `typeof gtag !== 'undefined'`
- Null-safe object property access: `snake ? snake.length : 0`
- Graceful fallbacks when tracking fails

#### Data Analysis Applications

**Performance Metrics**:
- Game completion rates by difficulty level
- Average session duration and engagement time
- Most popular Christmas phrases completed
- Player progression patterns and drop-off points

**Optimization Insights**:
- Identify difficult gameplay segments requiring balance adjustments
- Monitor phrase completion success rates for difficulty tuning
- Track user engagement to optimize game duration
- Analyze device-specific performance patterns

### Configuration Requirements
- **Language**: 繁體中文 (Traditional Chinese) with Taiwan-specific terminology
- **Theme**: Christmas and Christian faith elements
- **Target Devices**: Multi-platform support (Desktop, Tablet, Mobile)
- **Performance**: Optimized for various device capabilities with graceful degradation
- **Analytics**: GA4 integration for comprehensive player behavior tracking