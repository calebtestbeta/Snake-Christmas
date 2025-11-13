# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese text-based Snake game called "文字貪食蛇｜聖誕祝福版" (Text Snake - Christmas Blessing Edition). It's a unique twist on the classic Snake game where the snake collects Christmas and Christian faith-themed Chinese characters. Players can form meaningful phrases like "聖誕快樂" and "哈利路亞" to trigger special blessing effects and spiritual growth.

## Development Commands

### Running the Game
- **Local Development**: Open `index.html` directly in a browser or use a local HTTP server
- **HTTP Server Options**:
  ```bash
  # Python (recommended)
  python3 -m http.server 8000
  
  # Node.js
  npx http-server
  
  # PHP
  php -S localhost:8000
  ```
- **Access**: Navigate to `http://localhost:8000` when using a local server

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

- **index.html**: Main game interface with embedded styles and device detection
- **game.js**: Core game logic, rendering, and state management  
- **items.js**: Food data definitions (nutrition, effects, character pools)
- **ending.js**: Game completion analysis and nutritional feedback system

**External Dependencies**:
- P5.js v1.9.0 (CDN)
- Chart.js (CDN) for nutrition visualization

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

### Configuration Requirements
- **Language**: 繁體中文 (Traditional Chinese) with Taiwan-specific terminology
- **Theme**: Christmas and Christian faith elements
- **Target Devices**: Multi-platform support (Desktop, Tablet, Mobile)
- **Performance**: Optimized for various device capabilities with graceful degradation