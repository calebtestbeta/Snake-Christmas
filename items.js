// 聖誕祝福版 Christmas Blessing Edition v1.0
window.ITEMS = {
    // 聖誕與信仰主題字符池
    pool: [
        // 📿 信仰核心 (金色系)
        "主", "神", "耶", "穌", "愛", "信",
        // ⭐ 聖誕慶典 (亮黃系) 
        "聖", "誕", "快", "樂", "夜", "音",
        // 🎁 祝福話語 (紅色系)
        "平", "安", "福", "恩", "典", "惠",
        // 🕊️ 讚美敬拜 (白銀系)
        "哈", "利", "路", "亞", "讚", "美",
        // ❤️ 愛的分享 (粉紅系)
        "分", "享", "溫", "暖", "人", "心",
        // 其他重要字符
        "望", "光", "明", "澤", "用", "報", "佳", "以", "馬", "內",
        // 特殊詞句字符
        "我", "友", "堂", "榮", "耀", "歸", "於"
    ],

    // 可組成的聖誕與信仰詞句
    phrases: {
        // 5字特殊詞句 (超高獎勵)
        "我愛信友堂": { bonus: 150, effect: "supremeBlessing" },
        "榮耀歸於神": { bonus: 140, effect: "divineGlory" },
        
        // 4字經典詞句 (最高獎勵)
        "聖誕快樂": { bonus: 100, effect: "goldenGlow" },
        "耶穌愛我": { bonus: 100, effect: "stableSpeed" },
        "哈利路亞": { bonus: 120, effect: "doubleFood" },
        "以馬內利": { bonus: 110, effect: "timeExtend" },
        "平安喜樂": { bonus: 90, effect: "calmMovement" },
        "神愛世人": { bonus: 100, effect: "love" },
        
        // 3字重要詞句 (中等獎勵)
        "報佳音": { bonus: 60, effect: "speedUp" },
        "平安夜": { bonus: 55, effect: "slowTime" },
        "信望愛": { bonus: 70, effect: "balanced" },
        "感謝主": { bonus: 50, effect: "blessing" },
        "讚美主": { bonus: 50, effect: "joyful" },
        
        // 2字基礎詞句 (基礎獎勵)
        "聖誕": { bonus: 30, effect: "christmas" },
        "平安": { bonus: 25, effect: "peace" },
        "快樂": { bonus: 25, effect: "joy" },
        "感謝": { bonus: 20, effect: "thanks" },
        "讚美": { bonus: 20, effect: "praise" },
        "愛心": { bonus: 30, effect: "love" },
        "恩典": { bonus: 35, effect: "grace" },
        "光明": { bonus: 30, effect: "light" }
    },

    // 字符效果定義
    effects: {
        // ===== 📿 信仰核心 (穩定持久的力量) =====
        "主": { kind: "faith", speedMul: 1.0, durationMs: 2500, blessing: "strength" },
        "神": { kind: "faith", speedMul: 0.95, durationMs: 3000, blessing: "wisdom" },
        "耶": { kind: "faith", speedMul: 1.0, durationMs: 2000, blessing: "love" },
        "穌": { kind: "faith", speedMul: 1.0, durationMs: 2000, blessing: "salvation" },
        "愛": { kind: "faith", speedMul: 0.9, durationMs: 2500, blessing: "compassion" },
        "信": { kind: "faith", speedMul: 0.95, durationMs: 2200, blessing: "trust" },

        // ===== ⭐ 聖誕慶典 (歡樂的能量爆發) =====
        "聖": { kind: "christmas", speedMul: 1.15, durationMs: 1800, blessing: "holy" },
        "誕": { kind: "christmas", speedMul: 1.12, durationMs: 1800, blessing: "birth" },
        "快": { kind: "christmas", speedMul: 1.20, durationMs: 1500, blessing: "happiness" },
        "樂": { kind: "christmas", speedMul: 1.18, durationMs: 1600, blessing: "joy" },
        "夜": { kind: "christmas", speedMul: 0.85, durationMs: 2500, blessing: "peaceful" },
        "音": { kind: "christmas", speedMul: 1.10, durationMs: 1700, blessing: "melody" },

        // ===== 🎁 祝福話語 (溫暖的祝福力量) =====
        "平": { kind: "blessing", speedMul: 0.88, durationMs: 2200, blessing: "peace" },
        "安": { kind: "blessing", speedMul: 0.90, durationMs: 2100, blessing: "safety" },
        "福": { kind: "blessing", speedMul: 1.05, durationMs: 2000, blessing: "fortune" },
        "恩": { kind: "blessing", speedMul: 0.95, durationMs: 2300, blessing: "grace" },
        "典": { kind: "blessing", speedMul: 0.92, durationMs: 2400, blessing: "ceremony" },
        "惠": { kind: "blessing", speedMul: 0.93, durationMs: 2200, blessing: "favor" },

        // ===== 🕊️ 讚美敬拜 (屬靈的升華) =====
        "哈": { kind: "praise", speedMul: 1.25, durationMs: 1200, 
               after: { speedMul: 1.05, durationMs: 2000 }, blessing: "hallelujah" },
        "利": { kind: "praise", speedMul: 1.22, durationMs: 1300, 
               after: { speedMul: 1.03, durationMs: 1800 }, blessing: "hallelujah" },
        "路": { kind: "praise", speedMul: 1.20, durationMs: 1400, 
               after: { speedMul: 1.02, durationMs: 1600 }, blessing: "hallelujah" },
        "亞": { kind: "praise", speedMul: 1.18, durationMs: 1500, 
               after: { speedMul: 1.01, durationMs: 1400 }, blessing: "hallelujah" },
        "讚": { kind: "praise", speedMul: 1.15, durationMs: 1600, blessing: "praise" },
        "美": { kind: "praise", speedMul: 1.12, durationMs: 1700, blessing: "beauty" },

        // ===== ❤️ 愛的分享 (溫馨的情感力量) =====
        "分": { kind: "sharing", speedMul: 1.0, durationMs: 2000, blessing: "sharing" },
        "享": { kind: "sharing", speedMul: 1.02, durationMs: 1900, blessing: "giving" },
        "溫": { kind: "sharing", speedMul: 0.95, durationMs: 2200, blessing: "warmth" },
        "暖": { kind: "sharing", speedMul: 0.92, durationMs: 2300, blessing: "comfort" },
        "人": { kind: "sharing", speedMul: 1.0, durationMs: 2000, blessing: "humanity" },
        "心": { kind: "sharing", speedMul: 0.90, durationMs: 2400, blessing: "heart" },

        // ===== 其他重要字符 =====
        "望": { kind: "faith", speedMul: 1.05, durationMs: 2000, blessing: "hope" },
        "光": { kind: "christmas", speedMul: 1.15, durationMs: 1800, blessing: "light" },
        "明": { kind: "christmas", speedMul: 1.10, durationMs: 1900, blessing: "brightness" },
        "澤": { kind: "blessing", speedMul: 0.95, durationMs: 2100, blessing: "grace" },
        "用": { kind: "blessing", speedMul: 0.98, durationMs: 2000, blessing: "sufficient" },
        "報": { kind: "christmas", speedMul: 1.12, durationMs: 1700, blessing: "announce" },
        "佳": { kind: "christmas", speedMul: 1.08, durationMs: 1800, blessing: "good" },
        "以": { kind: "faith", speedMul: 1.0, durationMs: 2200, blessing: "emmanuel" },
        "馬": { kind: "faith", speedMul: 1.0, durationMs: 2200, blessing: "emmanuel" },
        "內": { kind: "faith", speedMul: 1.0, durationMs: 2200, blessing: "emmanuel" }
    },

    // 屬靈成長指標 (取代原本的營養成分)
    spiritualGrowth: {
        // 📿 信仰核心
        "主": { faith: 15 },
        "神": { faith: 18, wisdom: 5 },
        "耶": { faith: 12, love: 8 },
        "穌": { faith: 12, love: 8 },
        "愛": { love: 20, peace: 5 },
        "信": { faith: 15, trust: 10 },

        // ⭐ 聖誕慶典
        "聖": { faith: 8, joy: 12 },
        "誕": { joy: 15, hope: 8 },
        "快": { joy: 18 },
        "樂": { joy: 20 },
        "夜": { peace: 15, hope: 5 },
        "音": { joy: 10, praise: 8 },

        // 🎁 祝福話語
        "平": { peace: 18 },
        "安": { peace: 15, trust: 5 },
        "福": { joy: 8, hope: 10 },
        "恩": { love: 10, faith: 8 },
        "典": { faith: 12, wisdom: 6 },
        "惠": { love: 8, peace: 6 },

        // 🕊️ 讚美敬拜
        "哈": { praise: 15, joy: 10 },
        "利": { praise: 12, joy: 8 },
        "路": { praise: 10, joy: 6 },
        "亞": { praise: 8, joy: 4 },
        "讚": { praise: 18 },
        "美": { praise: 15, joy: 5 },

        // ❤️ 愛的分享
        "分": { love: 12, peace: 6 },
        "享": { love: 15, joy: 5 },
        "溫": { love: 10, peace: 8 },
        "暖": { love: 12, peace: 10 },
        "人": { love: 8, wisdom: 6 },
        "心": { love: 18, peace: 8 },

        // 其他字符
        "望": { hope: 20 },
        "光": { hope: 15, faith: 5 },
        "明": { hope: 12, wisdom: 6 },
        "澤": { love: 8, peace: 6 },
        "用": { faith: 10, trust: 8 },
        "報": { joy: 12, hope: 6 },
        "佳": { joy: 10, peace: 4 },
        "以": { faith: 6 },
        "馬": { faith: 6 },
        "內": { faith: 8, peace: 4 }
    }
};