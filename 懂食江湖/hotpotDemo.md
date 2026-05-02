<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>懂食江湖 · 投资人 Demo</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  :root {
    --hotpot-red: #D7263D;
    --golden: #F4B400;
    --wood: #8B5A3C;
    --cream: #FFF8E7;
    --dark: #2A1A14;
    --neon-pink: #FF6B9D;
    --neon-blue: #4ECDC4;
    --shadow: rgba(215, 38, 61, 0.3);
  }
  
  body {
    font-family: "PingFang SC", "Microsoft YaHei", -apple-system, sans-serif;
    background: linear-gradient(135deg, #1a0a0a 0%, #2A1A14 50%, #3d1f1f 100%);
    min-height: 100vh;
    overflow-x: hidden;
    color: var(--cream);
    -webkit-font-smoothing: antialiased;
  }
  
  .app {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    background: linear-gradient(180deg, #2A1A14 0%, #1a0a0a 100%);
    box-shadow: 0 0 60px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  
  /* 顶部进度条 */
  .progress-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(26, 10, 10, 0.95);
    backdrop-filter: blur(10px);
    padding: 12px 20px;
    border-bottom: 1px solid rgba(244, 180, 0, 0.2);
  }
  
  .progress-text {
    font-size: 12px;
    color: var(--golden);
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .progress-track {
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--hotpot-red), var(--golden));
    border-radius: 2px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 8px var(--golden);
  }
  
  /* 场景容器 */
  .scene {
    display: none;
    padding: 24px 20px;
    min-height: calc(100vh - 60px);
    animation: fadeIn 0.5s ease;
  }
  
  .scene.active { display: block; }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* 第1幕：开场 */
  .scene-intro {
    display: none;
    height: 100vh;
    background: 
      radial-gradient(ellipse at 50% 30%, rgba(215, 38, 61, 0.4) 0%, transparent 60%),
      linear-gradient(180deg, #1a0a0a 0%, #2A1A14 100%);
    position: relative;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .scene-intro.active { display: flex; }
  
  .city-bg {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%);
    overflow: hidden;
  }
  
  .building {
    position: absolute;
    bottom: 0;
    background: rgba(20, 10, 10, 0.8);
    border-top: 2px solid rgba(244, 180, 0, 0.3);
  }
  
  .building::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 4px;
    background: var(--neon-pink);
    box-shadow: 0 0 12px var(--neon-pink);
  }
  
  .neon-sign {
    font-size: 56px;
    font-weight: 900;
    background: linear-gradient(135deg, var(--hotpot-red), var(--golden));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 40px var(--shadow);
    margin-bottom: 12px;
    letter-spacing: 4px;
    animation: neonFlicker 3s ease-in-out infinite;
  }
  
  @keyframes neonFlicker {
    0%, 100% { filter: brightness(1) drop-shadow(0 0 20px var(--golden)); }
    50% { filter: brightness(1.2) drop-shadow(0 0 30px var(--hotpot-red)); }
  }
  
  .sub-title {
    font-size: 14px;
    color: var(--golden);
    margin-bottom: 8px;
    letter-spacing: 2px;
  }
  
  .tagline {
    font-size: 16px;
    color: var(--cream);
    opacity: 0.8;
    margin-bottom: 60px;
    line-height: 1.8;
    max-width: 340px;
  }
  
  .steam {
    position: absolute;
    bottom: 180px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 40px;
    opacity: 0.4;
    animation: steam 3s ease-in-out infinite;
  }
  
  @keyframes steam {
    0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.4; }
    50% { transform: translateX(-50%) translateY(-20px); opacity: 0.7; }
  }
  
  .start-btn {
    background: linear-gradient(135deg, var(--hotpot-red), var(--golden));
    color: white;
    border: none;
    padding: 16px 48px;
    font-size: 18px;
    font-weight: 700;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0 8px 24px var(--shadow);
    transition: all 0.3s;
    position: relative;
    z-index: 10;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 8px 24px var(--shadow); }
    50% { transform: scale(1.05); box-shadow: 0 12px 32px rgba(244, 180, 0, 0.5); }
  }
  
  .start-btn:active { transform: scale(0.95); }
  
  /* 通用幕标题 */
  .scene-header { margin-bottom: 20px; }
  
  .scene-tag {
    display: inline-block;
    background: rgba(244, 180, 0, 0.15);
    color: var(--golden);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  
  .scene-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--cream);
    margin-bottom: 6px;
  }
  
  .scene-desc {
    font-size: 13px;
    color: rgba(255, 248, 231, 0.6);
    line-height: 1.6;
  }
  
  /* 第2幕：自助餐经营 */
  .restaurant {
    background: linear-gradient(180deg, #4a2818 0%, #2A1A14 100%);
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 14px;
    position: relative;
    overflow: hidden;
    border: 2px solid rgba(244, 180, 0, 0.2);
  }
  
  .restaurant::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(180deg, rgba(215, 38, 61, 0.3), transparent);
  }
  
  .shop-name {
    font-size: 13px;
    color: var(--golden);
    text-align: center;
    margin-bottom: 14px;
    font-weight: 700;
    position: relative;
    z-index: 2;
  }
  
  .shop-name span {
    background: rgba(0,0,0,0.3);
    padding: 5px 14px;
    border-radius: 12px;
    border: 1px solid rgba(244, 180, 0, 0.4);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  
  .shop-status {
    background: rgba(78, 205, 196, 0.25);
    color: var(--neon-blue);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 8px;
    font-weight: 600;
  }
  
  /* 用餐区缩略带 */
  .dining-strip {
    background: rgba(0,0,0,0.35);
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 4px;
    position: relative;
  }
  
  .dining-strip-label {
    width: 100%;
    font-size: 10px;
    color: rgba(255, 248, 231, 0.5);
    margin-bottom: 6px;
    text-align: center;
  }
  
  .pot-with-diner {
    position: relative;
    font-size: 22px;
    line-height: 1;
  }
  
  .pot-with-diner::before {
    content: '♨';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    opacity: 0.7;
    animation: steam 2.5s ease-in-out infinite;
  }
  
  .pot-with-diner .diner {
    position: absolute;
    bottom: -2px;
    right: -8px;
    font-size: 14px;
  }
  
  /* 自助取餐台 */
  .section-title {
    font-size: 12px;
    color: var(--golden);
    margin-bottom: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .section-badge {
    background: rgba(78, 205, 196, 0.2);
    color: var(--neon-blue);
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 8px;
    font-weight: 500;
  }
  
  .buffet-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 14px;
    position: relative;
  }
  
  .buffet-item {
    background: linear-gradient(135deg, #5a3320, #3d2316);
    border-radius: 10px;
    padding: 10px 6px 8px;
    text-align: center;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    border: 2px solid transparent;
  }
  
  .buffet-item:active { transform: scale(0.93); }
  
  .buffet-item.low {
    animation: lowGlow 1.2s ease-in-out infinite;
    border-color: rgba(244, 180, 0, 0.6);
  }
  
  .buffet-item.empty {
    animation: emptyGlow 0.6s ease-in-out infinite;
    border-color: var(--hotpot-red);
  }
  
  .buffet-item.empty::after {
    content: '!';
    position: absolute;
    top: -7px;
    right: -7px;
    width: 20px;
    height: 20px;
    background: var(--hotpot-red);
    color: white;
    border-radius: 50%;
    font-size: 13px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 10px rgba(215, 38, 61, 0.7);
  }
  
  @keyframes lowGlow {
    0%, 100% { box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
    50% { box-shadow: 0 2px 14px rgba(244, 180, 0, 0.5); }
  }
  
  @keyframes emptyGlow {
    0%, 100% { box-shadow: 0 2px 6px rgba(0,0,0,0.3); transform: scale(1); }
    50% { box-shadow: 0 2px 14px rgba(215, 38, 61, 0.7); transform: scale(1.02); }
  }
  
  .buffet-icon {
    font-size: 28px;
    margin-bottom: 2px;
    display: block;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
  }
  
  .buffet-item.empty .buffet-icon {
    filter: grayscale(1) opacity(0.4);
  }
  
  .buffet-name {
    font-size: 10px;
    color: var(--cream);
    margin-bottom: 6px;
    font-weight: 600;
  }
  
  .stock-bar {
    height: 4px;
    background: rgba(0,0,0,0.5);
    border-radius: 2px;
    overflow: hidden;
  }
  
  .stock-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--neon-blue), #6cd9d2);
    border-radius: 2px;
    transition: width 0.6s ease;
  }
  
  .buffet-item.low .stock-fill {
    background: var(--golden);
  }
  
  .buffet-item.empty .stock-fill {
    background: var(--hotpot-red);
  }
  
  .coin-popup {
    position: absolute;
    color: var(--golden);
    font-weight: 700;
    font-size: 16px;
    pointer-events: none;
    animation: coinFloat 1s ease-out forwards;
    z-index: 50;
  }
  
  @keyframes coinFloat {
    0% { transform: translateY(0) scale(0.8); opacity: 1; }
    100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
  }
  
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .stat-card {
    background: rgba(0,0,0,0.3);
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
    border: 1px solid rgba(244, 180, 0, 0.2);
  }
  
  .stat-label {
    font-size: 10px;
    color: rgba(255, 248, 231, 0.6);
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--golden);
    transition: all 0.3s;
  }
  
  .stat-value.bumping {
    animation: bump 0.4s ease;
    color: var(--neon-blue);
  }
  
  @keyframes bump {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }
  
  .upgrade-zone {
    background: rgba(0,0,0,0.4);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 16px;
  }
  
  .upgrade-title {
    font-size: 13px;
    color: var(--golden);
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .upgrade-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .upgrade-btn {
    background: linear-gradient(135deg, var(--hotpot-red), #a01829);
    border: none;
    color: white;
    padding: 10px 6px;
    border-radius: 8px;
    font-size: 11px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 2px 6px var(--shadow);
  }
  
  .upgrade-btn:active { transform: scale(0.95); }
  
  .upgrade-btn .icon {
    display: block;
    font-size: 20px;
    margin-bottom: 2px;
  }
  
  .upgrade-btn .level {
    font-size: 9px;
    opacity: 0.8;
    margin-top: 2px;
  }
  
  .coin-counter {
    background: linear-gradient(135deg, rgba(244, 180, 0, 0.2), rgba(215, 38, 61, 0.2));
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    border: 1px solid var(--golden);
  }
  
  .coin-counter-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .coin-counter-label {
    font-size: 12px;
    color: var(--cream);
  }
  
  .coin-counter-sub {
    font-size: 9px;
    color: var(--neon-blue);
    opacity: 0.8;
  }
  
  .coin-counter-value {
    font-size: 22px;
    font-weight: 800;
    color: var(--golden);
  }
  
  .guide-tip {
    background: linear-gradient(135deg, var(--neon-pink), var(--hotpot-red));
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px;
    text-align: center;
    margin-bottom: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(255, 107, 157, 0.4);
    animation: glow 2s ease-in-out infinite;
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 4px 16px rgba(255, 107, 157, 0.4); }
    50% { box-shadow: 0 4px 24px rgba(255, 107, 157, 0.7); }
  }
  
  .next-btn {
    width: 100%;
    background: linear-gradient(135deg, var(--hotpot-red), var(--golden));
    color: white;
    border: none;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 4px 16px var(--shadow);
    transition: all 0.3s;
    margin-top: 12px;
    opacity: 0.5;
    pointer-events: none;
  }
  
  .next-btn.enabled {
    opacity: 1;
    pointer-events: auto;
    animation: pulse 2s ease-in-out infinite;
  }
  
  .next-btn:active { transform: scale(0.98); }
  
  /* 第3幕：扫码 */
  .receipt-container {
    background: var(--cream);
    color: var(--dark);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
    position: relative;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    font-family: "Courier New", monospace;
  }
  
  .receipt-container::before,
  .receipt-container::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 12px;
    background-image: radial-gradient(circle at 6px 6px, transparent 5px, var(--cream) 5px);
    background-size: 12px 12px;
  }
  
  .receipt-container::before { top: -6px; }
  .receipt-container::after { bottom: -6px; transform: rotate(180deg); }
  
  .receipt-header {
    text-align: center;
    border-bottom: 2px dashed #999;
    padding-bottom: 12px;
    margin-bottom: 12px;
  }
  
  .receipt-shop {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .receipt-info {
    font-size: 11px;
    color: #666;
  }
  
  .receipt-items { font-size: 13px; }
  
  .receipt-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  .receipt-total {
    border-top: 2px dashed #999;
    margin-top: 12px;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    font-size: 14px;
  }
  
  .qr-zone {
    background: rgba(0,0,0,0.4);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    margin: 20px 0;
    border: 2px dashed var(--golden);
  }
  
  .qr-icon {
    font-size: 64px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: transform 0.3s;
    display: inline-block;
  }
  
  .qr-icon:active { transform: scale(0.9); }
  
  .qr-text {
    font-size: 13px;
    color: var(--golden);
    font-weight: 600;
  }
  
  .scan-anim { position: relative; overflow: hidden; }
  
  .scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--neon-blue);
    box-shadow: 0 0 12px var(--neon-blue);
    animation: scanMove 1.5s ease-in-out;
  }
  
  @keyframes scanMove {
    0% { top: 0; }
    50% { top: 100%; }
    100% { top: 0; }
  }
  
  .reward-list {
    display: none;
    margin-top: 16px;
  }
  
  .reward-list.show {
    display: block;
    animation: slideIn 0.5s ease;
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .reward-item {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(244, 180, 0, 0.15));
    border-left: 3px solid var(--neon-blue);
    padding: 12px 14px;
    border-radius: 8px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.5s ease;
    animation-fill-mode: both;
  }
  
  .reward-item:nth-child(1) { animation-delay: 0.1s; }
  .reward-item:nth-child(2) { animation-delay: 0.3s; }
  .reward-item:nth-child(3) { animation-delay: 0.5s; }
  .reward-item:nth-child(4) { animation-delay: 0.7s; }
  
  .reward-icon { font-size: 28px; }
  .reward-content { flex: 1; }
  
  .reward-name {
    font-size: 13px;
    color: var(--cream);
    font-weight: 600;
  }
  
  .reward-detail {
    font-size: 11px;
    color: var(--neon-blue);
    margin-top: 2px;
  }
  
  /* 第4幕：抽卡 */
  .gacha-zone {
    text-align: center;
    padding: 40px 0;
  }
  
  .gacha-box {
    width: 200px;
    height: 200px;
    margin: 0 auto 24px;
    background: linear-gradient(135deg, #8B5A3C, #5a3a1f);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 100px;
    cursor: pointer;
    position: relative;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    transition: all 0.3s;
    border: 3px solid var(--golden);
  }
  
  .gacha-box::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 20px;
    background: linear-gradient(45deg, var(--hotpot-red), var(--golden), var(--hotpot-red));
    z-index: -1;
    animation: rotateBorder 3s linear infinite;
  }
  
  @keyframes rotateBorder {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  
  .gacha-box.shaking {
    animation: shake 0.5s ease infinite;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    25% { transform: translateX(-8px) rotate(-3deg); }
    75% { transform: translateX(8px) rotate(3deg); }
  }
  
  .gacha-tag {
    display: inline-block;
    background: var(--hotpot-red);
    color: white;
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 12px;
    margin-bottom: 12px;
    font-weight: 700;
  }
  
  .gacha-hint {
    color: var(--cream);
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .card-reveal {
    display: none;
    animation: cardZoom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .card-reveal.show { display: block; }
  
  @keyframes cardZoom {
    0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  
  .ssr-card {
    background: linear-gradient(135deg, #FFD700, #FFA500, #FF6347);
    border-radius: 20px;
    padding: 24px 20px;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(255, 180, 0, 0.6);
    border: 3px solid white;
    margin: 0 auto;
    max-width: 280px;
  }
  
  .ssr-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
    animation: shine 2s ease-in-out infinite;
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .ssr-rarity {
    background: white;
    color: var(--hotpot-red);
    font-weight: 900;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 12px;
    letter-spacing: 2px;
  }
  
  .ssr-emoji {
    font-size: 80px;
    margin: 12px 0;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  }
  
  .ssr-name {
    font-size: 22px;
    font-weight: 900;
    color: var(--dark);
    margin-bottom: 4px;
    text-shadow: 0 2px 4px rgba(255,255,255,0.5);
  }
  
  .ssr-subtitle {
    font-size: 12px;
    color: var(--dark);
    opacity: 0.7;
    margin-bottom: 12px;
  }
  
  .ssr-stats {
    background: rgba(255,255,255,0.4);
    border-radius: 12px;
    padding: 10px;
    margin-top: 12px;
    backdrop-filter: blur(10px);
  }
  
  .ssr-stat-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--dark);
    font-weight: 600;
    margin: 4px 0;
  }
  
  .ssr-value {
    color: var(--hotpot-red);
    font-weight: 900;
  }
  
  .firework {
    position: absolute;
    pointer-events: none;
    font-size: 24px;
    animation: firework 1.5s ease-out forwards;
  }
  
  @keyframes firework {
    0% { transform: translate(0, 0) scale(0); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; }
  }
  
  /* 第5幕：交易市场 */
  .market-listing {
    background: rgba(0,0,0,0.3);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(244, 180, 0, 0.2);
  }
  
  .listing-card {
    background: linear-gradient(135deg, rgba(244, 180, 0, 0.15), rgba(215, 38, 61, 0.15));
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 14px;
    border: 1px solid rgba(244, 180, 0, 0.3);
  }
  
  .listing-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #FFD700, #FF6347);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    flex-shrink: 0;
  }
  
  .listing-info { flex: 1; }
  
  .listing-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--cream);
    margin-bottom: 2px;
  }
  
  .listing-rarity {
    font-size: 10px;
    color: var(--golden);
    margin-bottom: 4px;
  }
  
  .listing-price {
    font-size: 18px;
    font-weight: 800;
    color: var(--golden);
  }
  
  .price-input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    align-items: center;
  }
  
  .price-label {
    font-size: 13px;
    color: var(--cream);
    flex-shrink: 0;
  }
  
  .price-display {
    flex: 1;
    background: rgba(0,0,0,0.4);
    border: 1px solid var(--golden);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--golden);
    font-size: 16px;
    font-weight: 700;
    text-align: right;
  }
  
  .list-btn {
    width: 100%;
    background: linear-gradient(135deg, var(--neon-blue), #2a9d96);
    color: white;
    border: none;
    padding: 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .list-btn:active { transform: scale(0.98); }
  
  .list-btn.disabled {
    background: #555;
    cursor: not-allowed;
  }
  
  .deal-flow {
    display: none;
    margin-top: 16px;
    animation: slideIn 0.5s ease;
  }
  
  .deal-flow.show { display: block; }
  
  .deal-step {
    background: rgba(0,0,0,0.3);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 3px solid var(--neon-blue);
    opacity: 0;
    animation: slideIn 0.5s ease forwards;
  }
  
  .deal-step:nth-child(1) { animation-delay: 0.2s; }
  .deal-step:nth-child(2) { animation-delay: 0.8s; }
  .deal-step:nth-child(3) { animation-delay: 1.4s; }
  .deal-step:nth-child(4) { animation-delay: 2.0s; }
  
  .deal-step-icon { font-size: 24px; }
  
  .deal-step-text {
    font-size: 12px;
    color: var(--cream);
    flex: 1;
  }
  
  .deal-step-amount {
    font-size: 13px;
    font-weight: 700;
    color: var(--golden);
  }
  
  .deal-step-amount.fee { color: var(--neon-pink); }
  
  /* 第6幕：合规开关 */
  .console-header {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(244, 180, 0, 0.2));
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(78, 205, 196, 0.4);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .console-header-icon { font-size: 28px; }
  .console-header-text { flex: 1; }
  
  .console-header-title {
    font-size: 13px;
    color: var(--neon-blue);
    font-weight: 700;
  }
  
  .console-header-sub {
    font-size: 11px;
    color: rgba(255, 248, 231, 0.6);
    margin-top: 2px;
  }
  
  .switch-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .switch-card {
    background: rgba(0,0,0,0.4);
    border-radius: 12px;
    padding: 14px;
    border: 1px solid rgba(244, 180, 0, 0.2);
    transition: all 0.3s;
  }
  
  .switch-card.active {
    border-color: var(--neon-blue);
    background: rgba(78, 205, 196, 0.1);
    box-shadow: 0 0 16px rgba(78, 205, 196, 0.2);
  }
  
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .switch-info { flex: 1; }
  
  .switch-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--cream);
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .switch-desc {
    font-size: 11px;
    color: rgba(255, 248, 231, 0.6);
    line-height: 1.4;
  }
  
  .switch-toggle {
    width: 48px;
    height: 26px;
    background: #444;
    border-radius: 13px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s;
    flex-shrink: 0;
    margin-left: 12px;
  }
  
  .switch-toggle.on { background: var(--neon-blue); }
  
  .switch-knob {
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .switch-toggle.on .switch-knob { left: 24px; }
  
  .switch-region {
    display: none;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed rgba(255,255,255,0.1);
  }
  
  .switch-card.active .switch-region { display: block; }
  
  .region-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .region-tag {
    background: rgba(78, 205, 196, 0.15);
    color: var(--neon-blue);
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 10px;
    border: 1px solid rgba(78, 205, 196, 0.3);
  }
  
  /* 第7幕：飞轮+看板 */
  .flywheel-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    max-width: 360px;
    margin: 20px auto;
  }
  
  .flywheel-svg {
    width: 100%;
    height: 100%;
  }
  
  .flywheel-node {
    position: absolute;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--hotpot-red), var(--golden));
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 4px 16px var(--shadow);
    transform: translate(-50%, -50%);
    border: 2px solid var(--cream);
    line-height: 1.2;
    padding: 4px;
  }
  
  .flywheel-node .node-icon {
    font-size: 24px;
    margin-bottom: 2px;
  }
  
  .dashboard {
    background: linear-gradient(135deg, rgba(0,0,0,0.5), rgba(78, 205, 196, 0.1));
    border: 1px solid var(--neon-blue);
    border-radius: 16px;
    padding: 16px;
    margin: 20px 0;
  }
  
  .dashboard-title {
    font-size: 13px;
    color: var(--neon-blue);
    margin-bottom: 12px;
    font-weight: 700;
    text-align: center;
    letter-spacing: 1px;
  }
  
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .dash-card {
    background: rgba(0,0,0,0.4);
    border-radius: 10px;
    padding: 12px 8px;
    text-align: center;
    border: 1px solid rgba(78, 205, 196, 0.2);
  }
  
  .dash-label {
    font-size: 10px;
    color: var(--neon-blue);
    margin-bottom: 4px;
    letter-spacing: 1px;
  }
  
  .dash-value {
    font-size: 20px;
    font-weight: 800;
    color: var(--golden);
    margin-bottom: 2px;
  }
  
  .dash-unit {
    font-size: 9px;
    color: rgba(255, 248, 231, 0.5);
  }
  
  .dashboard-foot {
    text-align: center;
    font-size: 10px;
    color: rgba(255, 248, 231, 0.5);
    margin-top: 10px;
    line-height: 1.5;
  }
  
  .final-cta {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(215, 38, 61, 0.2), rgba(244, 180, 0, 0.2));
    border-radius: 16px;
    border: 1px solid var(--golden);
  }
  
  .final-cta-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--golden);
    margin-bottom: 8px;
  }
  
  .final-cta-text {
    font-size: 12px;
    color: rgba(255, 248, 231, 0.8);
    line-height: 1.6;
    margin-bottom: 16px;
  }
  
  .cta-btn-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .cta-btn {
    background: linear-gradient(135deg, var(--hotpot-red), var(--golden));
    color: white;
    border: none;
    padding: 12px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .cta-btn:active { transform: scale(0.96); }
  
  .cta-btn.outline {
    background: transparent;
    border: 1.5px solid var(--golden);
    color: var(--golden);
  }
  
  .restart-btn {
    width: 100%;
    background: rgba(255,255,255,0.1);
    color: var(--cream);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 12px;
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
    margin-top: 12px;
  }
  
  .restart-btn:active { transform: scale(0.98); }
  
  @media (min-width: 600px) {
    .neon-sign { font-size: 72px; }
  }
</style>
</head>
<body>

<div class="app">

  <div class="progress-bar" id="progressBar" style="display:none;">
    <div class="progress-text">
      <span id="sceneIndicator">第 1 幕 / 共 7 幕</span>
      <span id="sceneNameTag" style="opacity:0.7;">开场</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progressFill" style="width:14%"></div>
    </div>
  </div>

  <!-- 第1幕：开场 -->
  <div class="scene scene-intro active" id="scene1">
    <div class="city-bg">
      <div class="building" style="left:5%; width:60px; height:120px;"></div>
      <div class="building" style="left:18%; width:80px; height:160px;"></div>
      <div class="building" style="left:35%; width:70px; height:100px;"></div>
      <div class="building" style="right:30%; width:90px; height:140px;"></div>
      <div class="building" style="right:15%; width:60px; height:110px;"></div>
      <div class="building" style="right:2%; width:75px; height:130px;"></div>
    </div>
    <div class="steam">♨️ ♨️ ♨️</div>
    <div class="sub-title">DONGSHI · JIANGHU</div>
    <h1 class="neon-sign">懂食江湖</h1>
    <p class="tagline">让每一家懂食汇自助火锅<br>都成为现实世界的火锅副本</p>
    <button class="start-btn" onclick="goToScene(2)">🍲 开始体验</button>
  </div>

  <!-- 第2幕：自助餐经营 -->
  <div class="scene" id="scene2">
    <div class="scene-header">
      <span class="scene-tag">第 2 幕 · 自助餐经营</span>
      <h2 class="scene-title">你的自助火锅店开张了</h2>
      <p class="scene-desc">顾客付餐位费自取食材，玩家管补货保满意度</p>
    </div>

    <div class="guide-tip" id="tip2">👆 食材在被取用，点击格子补货 5 次</div>

    <div class="coin-counter">
      <div class="coin-counter-left">
        <span class="coin-counter-label">💰 当前金币</span>
        <span class="coin-counter-sub">餐位费 ¥98 / 位 · 自动入账</span>
      </div>
      <span class="coin-counter-value" id="coinValue">0</span>
    </div>

    <div class="restaurant">
      <div class="shop-name">
        <span>🏮 懂食汇自助火锅 · 陆家嘴店<span class="shop-status">🟢 6/6 满座</span></span>
      </div>

      <!-- 用餐区缩略 -->
      <div class="dining-strip">
        <div class="dining-strip-label">🍲 用餐区 · 顾客自取中</div>
        <div class="pot-with-diner">🍲<span class="diner">😋</span></div>
        <div class="pot-with-diner">🍲<span class="diner">🤤</span></div>
        <div class="pot-with-diner">🍲<span class="diner">😋</span></div>
        <div class="pot-with-diner">🍲<span class="diner">🥰</span></div>
        <div class="pot-with-diner">🍲<span class="diner">😋</span></div>
        <div class="pot-with-diner">🍲<span class="diner">🤤</span></div>
      </div>

      <!-- 自助取餐台 -->
      <div class="section-title">
        <span>🥘 自助取餐台 · 点击补货</span>
        <span class="section-badge">食材陈列中</span>
      </div>
      <div class="buffet-grid" id="buffetGrid">
        <div class="buffet-item" data-item="0">
          <span class="buffet-icon">🥩</span>
          <div class="buffet-name">肥牛卷</div>
          <div class="stock-bar"><div class="stock-fill" style="width:100%"></div></div>
        </div>
        <div class="buffet-item" data-item="1">
          <span class="buffet-icon">🦐</span>
          <div class="buffet-name">鲜虾滑</div>
          <div class="stock-bar"><div class="stock-fill" style="width:80%"></div></div>
        </div>
        <div class="buffet-item" data-item="2">
          <span class="buffet-icon">🐮</span>
          <div class="buffet-name">嫩毛肚</div>
          <div class="stock-bar"><div class="stock-fill" style="width:60%"></div></div>
        </div>
        <div class="buffet-item" data-item="3">
          <span class="buffet-icon">🥬</span>
          <div class="buffet-name">绿叶菜</div>
          <div class="stock-bar"><div class="stock-fill" style="width:40%"></div></div>
        </div>
        <div class="buffet-item" data-item="4">
          <span class="buffet-icon">🍢</span>
          <div class="buffet-name">手打丸</div>
          <div class="stock-bar"><div class="stock-fill" style="width:50%"></div></div>
        </div>
        <div class="buffet-item" data-item="5">
          <span class="buffet-icon">🦑</span>
          <div class="buffet-name">海鲜拼</div>
          <div class="stock-bar"><div class="stock-fill" style="width:70%"></div></div>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-label">翻台率</div>
          <div class="stat-value" id="statTurn">2.1</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">人均消费</div>
          <div class="stat-value" id="statPrice">¥98</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">满意度</div>
          <div class="stat-value" id="statSatis">85%</div>
        </div>
      </div>
    </div>

    <div class="upgrade-zone">
      <div class="upgrade-title">🔧 升级你的自助店</div>
      <div class="upgrade-list">
        <button class="upgrade-btn" onclick="upgradeShop('buffet')">
          <span class="icon">🥘</span>
          取餐台
          <div class="level" id="lvBuffet">Lv.1</div>
        </button>
        <button class="upgrade-btn" onclick="upgradeShop('fridge')">
          <span class="icon">❄️</span>
          冷柜
          <div class="level" id="lvFridge">Lv.1</div>
        </button>
        <button class="upgrade-btn" onclick="upgradeShop('soup')">
          <span class="icon">🍲</span>
          锅底库
          <div class="level" id="lvSoup">Lv.1</div>
        </button>
      </div>
    </div>

    <button class="next-btn" id="next2" onclick="goToScene(3)">下一步 · 线下扫码反哺 →</button>
  </div>

  <!-- 第3幕：扫码 -->
  <div class="scene" id="scene3">
    <div class="scene-header">
      <span class="scene-tag">第 3 幕 · 线下扫码反哺</span>
      <h2 class="scene-title">线下消费 = 线上资源</h2>
      <p class="scene-desc">扫一下小票，真实自助餐变成游戏资产</p>
    </div>

    <div class="receipt-container">
      <div class="receipt-header">
        <div class="receipt-shop">🏮 懂食汇自助火锅</div>
        <div class="receipt-info">陆家嘴店 · 2026.05.02 19:42</div>
      </div>
      <div class="receipt-items">
        <div class="receipt-item"><span>自助餐位 ×4</span><span>¥392</span></div>
        <div class="receipt-item"><span>番茄养生锅底 ×2</span><span>¥38</span></div>
        <div class="receipt-item"><span>鲜榨饮品 ×4</span><span>¥40</span></div>
        <div class="receipt-item"><span>服务费</span><span>¥30</span></div>
      </div>
      <div class="receipt-total">
        <span>合计</span><span>¥500</span>
      </div>
    </div>

    <div class="qr-zone scan-anim" id="qrZone">
      <div class="qr-icon" id="qrIcon" onclick="scanReceipt()">📱</div>
      <div class="qr-text" id="qrText">👆 点击扫描小票</div>
    </div>

    <div class="reward-list" id="rewardList">
      <div class="reward-item">
        <div class="reward-icon">🍅</div>
        <div class="reward-content">
          <div class="reward-name">番茄锅底熟练度</div>
          <div class="reward-detail">+30 经验</div>
        </div>
      </div>
      <div class="reward-item">
        <div class="reward-icon">🐮</div>
        <div class="reward-content">
          <div class="reward-name">毛肚供应链经验</div>
          <div class="reward-detail">+20 经验</div>
        </div>
      </div>
      <div class="reward-item">
        <div class="reward-icon">👔</div>
        <div class="reward-content">
          <div class="reward-name">解锁 NPC：下班白领小队</div>
          <div class="reward-detail">提升店铺人气 +15%</div>
        </div>
      </div>
      <div class="reward-item">
        <div class="reward-icon">🎁</div>
        <div class="reward-content">
          <div class="reward-name">获得：真实到店宝箱 ×1</div>
          <div class="reward-detail">含稀有抽卡机会</div>
        </div>
      </div>
    </div>

    <button class="next-btn" id="next3" onclick="goToScene(4)">下一步 · 打开宝箱 →</button>
  </div>

  <!-- 第4幕：抽卡 -->
  <div class="scene" id="scene4">
    <div class="scene-header">
      <span class="scene-tag">第 4 幕 · 抽卡盲盒</span>
      <h2 class="scene-title">真实到店宝箱</h2>
      <p class="scene-desc">稀有藏品 = 经营加成 + 交易市场资产</p>
    </div>

    <div class="gacha-zone">
      <div id="gachaPhase1">
        <div class="gacha-tag">🎁 真实到店宝箱</div>
        <div class="gacha-hint">点击宝箱开启</div>
        <div class="gacha-box" id="gachaBox" onclick="openGacha()">🎁</div>
      </div>

      <div class="card-reveal" id="cardReveal">
        <div class="ssr-card">
          <div class="ssr-rarity">⭐ SSR · 隐藏款</div>
          <div class="ssr-emoji">👸</div>
          <div class="ssr-name">黄金锅 · 石矶娘娘</div>
          <div class="ssr-subtitle">仅 0.3% 概率 · 全服限定</div>
          <div class="ssr-stats">
            <div class="ssr-stat-row">
              <span>经营加成</span>
              <span class="ssr-value">+45%</span>
            </div>
            <div class="ssr-stat-row">
              <span>店铺热度</span>
              <span class="ssr-value">+200</span>
            </div>
            <div class="ssr-stat-row">
              <span>市场估值</span>
              <span class="ssr-value">¥2,880</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="next-btn" id="next4" onclick="goToScene(5)">下一步 · 挂上交易市场 →</button>
  </div>

  <!-- 第5幕：交易市场 -->
  <div class="scene" id="scene5">
    <div class="scene-header">
      <span class="scene-tag">第 5 幕 · 自由交易市场</span>
      <h2 class="scene-title">玩家市场 · 平台抽佣</h2>
      <p class="scene-desc">每一笔交易，平台抽 5% 手续费</p>
    </div>

    <div class="market-listing">
      <div class="listing-card">
        <div class="listing-icon">👸</div>
        <div class="listing-info">
          <div class="listing-name">黄金锅 · 石矶娘娘</div>
          <div class="listing-rarity">⭐ SSR · 隐藏款</div>
          <div class="listing-price">¥2,880</div>
        </div>
      </div>

      <div class="price-input-row">
        <span class="price-label">挂牌价</span>
        <div class="price-display">¥2,880</div>
      </div>
      <div class="price-input-row">
        <span class="price-label" style="color:var(--neon-pink);">平台手续费 5%</span>
        <div class="price-display" style="color:var(--neon-pink); border-color:var(--neon-pink);">-¥144</div>
      </div>

      <button class="list-btn" id="listBtn" onclick="listToMarket()">🚀 挂牌出售</button>
    </div>

    <div class="deal-flow" id="dealFlow">
      <div class="deal-step">
        <div class="deal-step-icon">📤</div>
        <div class="deal-step-text">挂牌成功，等待买家</div>
        <div class="deal-step-amount">¥2,880</div>
      </div>
      <div class="deal-step">
        <div class="deal-step-icon">⚡</div>
        <div class="deal-step-text">买家秒拍！</div>
        <div class="deal-step-amount">12 秒成交</div>
      </div>
      <div class="deal-step">
        <div class="deal-step-icon">💸</div>
        <div class="deal-step-text">平台手续费</div>
        <div class="deal-step-amount fee">-¥144</div>
      </div>
      <div class="deal-step">
        <div class="deal-step-icon">💰</div>
        <div class="deal-step-text">玩家到账</div>
        <div class="deal-step-amount">¥2,736</div>
      </div>
    </div>

    <button class="next-btn" id="next5" onclick="goToScene(6)">下一步 · 资产化合规面板 →</button>
  </div>

  <!-- 第6幕：合规开关 -->
  <div class="scene" id="scene6">
    <div class="scene-header">
      <span class="scene-tag">第 6 幕 · 资产化合规开关</span>
      <h2 class="scene-title">地区化配置中心</h2>
      <p class="scene-desc">不同发行地区可独立开启 / 限制 / 关闭</p>
    </div>

    <div class="console-header">
      <div class="console-header-icon">⚙️</div>
      <div class="console-header-text">
        <div class="console-header-title">合规开关控制台</div>
        <div class="console-header-sub">点击开关，体验地区化配置</div>
      </div>
    </div>

    <div class="switch-list">
      <div class="switch-card" data-switch="rmt">
        <div class="switch-row">
          <div class="switch-info">
            <div class="switch-name">💱 官方 RMT 兑换</div>
            <div class="switch-desc">游戏币 ↔ 现实货币官方通道</div>
          </div>
          <div class="switch-toggle" onclick="toggleSwitch(this, 'rmt')">
            <div class="switch-knob"></div>
          </div>
        </div>
        <div class="switch-region">
          <div class="region-tags">
            <span class="region-tag">✓ 东南亚</span>
            <span class="region-tag">✓ 港澳台</span>
            <span class="region-tag">✗ 中国大陆</span>
          </div>
        </div>
      </div>

      <div class="switch-card" data-switch="withdraw">
        <div class="switch-row">
          <div class="switch-info">
            <div class="switch-name">💵 金币提现</div>
            <div class="switch-desc">达门槛后申请提现 · 含 KYC 限额</div>
          </div>
          <div class="switch-toggle" onclick="toggleSwitch(this, 'withdraw')">
            <div class="switch-knob"></div>
          </div>
        </div>
        <div class="switch-region">
          <div class="region-tags">
            <span class="region-tag">✓ 已通过 KYC</span>
            <span class="region-tag">月限额 ¥5,000</span>
          </div>
        </div>
      </div>

      <div class="switch-card" data-switch="index">
        <div class="switch-row">
          <div class="switch-info">
            <div class="switch-name">📈 门店股价指数</div>
            <div class="switch-desc">客流 · 复购 · GMV 反哺资产预期</div>
          </div>
          <div class="switch-toggle" onclick="toggleSwitch(this, 'index')">
            <div class="switch-knob"></div>
          </div>
        </div>
        <div class="switch-region">
          <div class="region-tags">
            <span class="region-tag">✓ 全球可见</span>
            <span class="region-tag">非证券化展示</span>
          </div>
        </div>
      </div>

      <div class="switch-card" data-switch="hidden">
        <div class="switch-row">
          <div class="switch-info">
            <div class="switch-name">💎 隐藏款变现</div>
            <div class="switch-desc">稀有藏品二级市场 · 平台抽佣</div>
          </div>
          <div class="switch-toggle" onclick="toggleSwitch(this, 'hidden')">
            <div class="switch-knob"></div>
          </div>
        </div>
        <div class="switch-region">
          <div class="region-tags">
            <span class="region-tag">✓ 全地区</span>
            <span class="region-tag">手续费 5%</span>
          </div>
        </div>
      </div>
    </div>

    <button class="next-btn" id="next6" onclick="goToScene(7)">下一步 · 商业飞轮 →</button>
  </div>

  <!-- 第7幕：飞轮+看板 -->
  <div class="scene" id="scene7">
    <div class="scene-header">
      <span class="scene-tag">第 7 幕 · 商业飞轮</span>
      <h2 class="scene-title">品牌会员经济操作系统</h2>
      <p class="scene-desc">线上 ↔ 线下 ↔ 资产 · 自循环增长</p>
    </div>

    <div class="flywheel-container">
      <svg class="flywheel-svg" viewBox="0 0 360 360">
        <circle cx="180" cy="180" r="120" fill="none" stroke="rgba(244,180,0,0.3)" stroke-width="2" stroke-dasharray="4,4"/>
        <circle cx="180" cy="180" r="120" fill="none" stroke="#F4B400" stroke-width="2" stroke-dasharray="20,300" stroke-dashoffset="0">
          <animate attributeName="stroke-dashoffset" from="0" to="-320" dur="6s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <div class="flywheel-node" style="top:10%; left:50%;">
        <div class="node-icon">🍲</div>线上经营
      </div>
      <div class="flywheel-node" style="top:30%; left:88%;">
        <div class="node-icon">🏮</div>线下到店
      </div>
      <div class="flywheel-node" style="top:70%; left:88%;">
        <div class="node-icon">🎁</div>奖励回流
      </div>
      <div class="flywheel-node" style="top:90%; left:50%;">
        <div class="node-icon">💱</div>自由交易
      </div>
      <div class="flywheel-node" style="top:70%; left:12%;">
        <div class="node-icon">⭐</div>会员权益
      </div>
      <div class="flywheel-node" style="top:30%; left:12%;">
        <div class="node-icon">📈</div>品牌资产
      </div>
    </div>

    <div class="dashboard">
      <div class="dashboard-title">⚡ 单店预测模型 · 100 家门店</div>
      <div class="dashboard-grid">
        <div class="dash-card">
          <div class="dash-label">DAU</div>
          <div class="dash-value" id="dashDAU">0</div>
          <div class="dash-unit">万 / 日活跃</div>
        </div>
        <div class="dash-card">
          <div class="dash-label">ARPU</div>
          <div class="dash-value" id="dashARPU">¥0</div>
          <div class="dash-unit">单用户月收入</div>
        </div>
        <div class="dash-card">
          <div class="dash-label">月 GMV</div>
          <div class="dash-value" id="dashGMV">0</div>
          <div class="dash-unit">万 / 总交易额</div>
        </div>
      </div>
      <div class="dashboard-foot">
        基于 100 家自助门店 · 单店日均 200 桌 · 转化率 35%<br>
        线上充值 + 门店餐位费 + 玩家市场抽佣 三线收入合计
      </div>
    </div>

    <div class="final-cta">
      <div class="final-cta-title">让每一次涮锅<br>都成为一次链上资产积累</div>
      <div class="final-cta-text">
        懂食江湖 = 自助火锅 IP × 游戏化会员 × 玩家经济<br>
        从一家门店开始，到一座城市，再到一个生态
      </div>
      <div class="cta-btn-group">
        <button class="cta-btn" onclick="alert('感谢您的兴趣！\n请联系：bd@dongshi.example');">📩 联系我们</button>
        <button class="cta-btn outline" onclick="alert('完整商业计划书将在私下分享');">📄 BP 索取</button>
      </div>
    </div>

    <button class="restart-btn" onclick="restart()">🔁 重新体验 Demo</button>
  </div>

</div>

<script>
  // 全局状态
  let currentScene = 1;
  const sceneNames = ['', '开场', '自助餐经营', '扫码反哺', '抽卡盲盒', '交易市场', '合规开关', '商业飞轮'];
  
  // 第2幕：自助餐状态
  let coins = 0;
  let restockCount = 0;
  let buffetStock = [100, 80, 60, 40, 50, 70];
  let upgrades = { buffet: 1, fridge: 1, soup: 1 };
  let stockTimer = null;
  let revenueTimer = null;
  
  // 场景切换
  function goToScene(n) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    document.getElementById('scene' + n).classList.add('active');
    currentScene = n;
    
    const bar = document.getElementById('progressBar');
    if (n === 1) {
      bar.style.display = 'none';
    } else {
      bar.style.display = 'block';
      document.getElementById('sceneIndicator').textContent = '第 ' + n + ' 幕 / 共 7 幕';
      document.getElementById('sceneNameTag').textContent = sceneNames[n];
      document.getElementById('progressFill').style.width = (n / 7 * 100) + '%';
    }
    
    window.scrollTo(0, 0);
    
    if (n === 7) animateDashboard();
    if (n === 4) {
      document.getElementById('gachaPhase1').style.display = 'block';
      document.getElementById('cardReveal').classList.remove('show');
      document.getElementById('next4').classList.remove('enabled');
    }
    if (n === 5) {
      document.getElementById('dealFlow').classList.remove('show');
      document.getElementById('listBtn').classList.remove('disabled');
      document.getElementById('listBtn').textContent = '🚀 挂牌出售';
      document.getElementById('next5').classList.remove('enabled');
    }
    if (n === 3) {
      document.getElementById('rewardList').classList.remove('show');
      document.getElementById('qrZone').classList.add('scan-anim');
      document.getElementById('qrText').textContent = '👆 点击扫描小票';
      document.getElementById('qrIcon').textContent = '📱';
      document.getElementById('next3').classList.remove('enabled');
    }
  }
  
  // 第2幕：自助餐玩法
  function setupBuffet() {
    document.querySelectorAll('.buffet-item').forEach(item => {
      item.addEventListener('click', () => restockItem(parseInt(item.dataset.item)));
    });
    
    // 模拟顾客取餐：库存自动消耗
    stockTimer = setInterval(() => {
      buffetStock.forEach((stock, idx) => {
        const drop = 7 + Math.random() * 6;
        buffetStock[idx] = Math.max(0, stock - drop);
        updateBuffetUI(idx);
      });
    }, 1800);
    
    // 自助餐位费自动入账（轻微）
    revenueTimer = setInterval(() => {
      if (currentScene !== 2) return;
      // 满意度高时才有自动入账
      const satis = parseInt(document.getElementById('statSatis').textContent);
      if (satis > 80) {
        coins += 2;
        document.getElementById('coinValue').textContent = coins;
      }
    }, 3000);
  }
  
  function updateBuffetUI(idx) {
    const el = document.querySelector('.buffet-item[data-item="' + idx + '"]');
    if (!el) return;
    const stock = buffetStock[idx];
    el.querySelector('.stock-fill').style.width = stock + '%';
    
    el.classList.remove('low', 'empty');
    if (stock === 0) {
      el.classList.add('empty');
      // 库存空了影响满意度
      const satEl = document.getElementById('statSatis');
      const cur = parseInt(satEl.textContent);
      if (cur > 70) {
        satEl.textContent = (cur - 1) + '%';
      }
    } else if (stock < 30) {
      el.classList.add('low');
    }
  }
  
  function restockItem(idx) {
    const stockBefore = buffetStock[idx];
    buffetStock[idx] = 100;
    updateBuffetUI(idx);
    
    // 补货收入：低库存时收益更高（救急溢价）
    const amount = stockBefore < 30 ? 18 : (stockBefore < 60 ? 12 : 8);
    coins += amount;
    document.getElementById('coinValue').textContent = coins;
    
    // 飘金币
    const el = document.querySelector('.buffet-item[data-item="' + idx + '"]');
    const grid = el.parentElement;
    const popup = document.createElement('div');
    popup.className = 'coin-popup';
    popup.textContent = '+' + amount;
    const rect = el.getBoundingClientRect();
    const parentRect = grid.getBoundingClientRect();
    popup.style.left = (rect.left - parentRect.left + rect.width/2 - 10) + 'px';
    popup.style.top = (rect.top - parentRect.top + 10) + 'px';
    grid.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
    
    // 数据反馈
    if (stockBefore < 30) {
      // 救急补货 → 满意度回升
      const satEl = document.getElementById('statSatis');
      const cur = parseInt(satEl.textContent);
      satEl.textContent = Math.min(99, cur + 2) + '%';
      satEl.classList.add('bumping');
      setTimeout(() => satEl.classList.remove('bumping'), 400);
    } else {
      const turnEl = document.getElementById('statTurn');
      const cur = parseFloat(turnEl.textContent);
      turnEl.textContent = (cur + 0.05).toFixed(1);
      turnEl.classList.add('bumping');
      setTimeout(() => turnEl.classList.remove('bumping'), 400);
    }
    
    restockCount++;
    if (restockCount === 3) {
      document.getElementById('tip2').innerHTML = '💪 试试升级取餐台！';
    }
    if (restockCount >= 5) {
      document.getElementById('tip2').innerHTML = '✅ 不错！点击下方按钮继续';
      document.getElementById('next2').classList.add('enabled');
    }
  }
  
  function upgradeShop(type) {
    if (coins < 30) {
      document.getElementById('tip2').innerHTML = '⚠️ 金币不足，再补几次货';
      return;
    }
    coins -= 30;
    document.getElementById('coinValue').textContent = coins;
    upgrades[type]++;
    
    const map = { buffet: 'lvBuffet', fridge: 'lvFridge', soup: 'lvSoup' };
    document.getElementById(map[type]).textContent = 'Lv.' + upgrades[type];
    
    const turn = document.getElementById('statTurn');
    const price = document.getElementById('statPrice');
    const satis = document.getElementById('statSatis');
    turn.textContent = (parseFloat(turn.textContent) + 0.3).toFixed(1);
    price.textContent = '¥' + (parseInt(price.textContent.slice(1)) + 8);
    satis.textContent = Math.min(99, parseInt(satis.textContent) + 3) + '%';
    [turn, price, satis].forEach(s => {
      s.classList.add('bumping');
      setTimeout(() => s.classList.remove('bumping'), 400);
    });
    
    document.getElementById('tip2').innerHTML = '🎉 升级成功！店铺数据上涨';
    document.getElementById('next2').classList.add('enabled');
  }
  
  // 第3幕：扫码
  function scanReceipt() {
    const qrZone = document.getElementById('qrZone');
    const qrText = document.getElementById('qrText');
    const qrIcon = document.getElementById('qrIcon');
    
    qrText.textContent = '📡 扫描中...';
    qrIcon.textContent = '⏳';
    
    const line = document.createElement('div');
    line.className = 'scan-line';
    qrZone.appendChild(line);
    
    setTimeout(() => {
      line.remove();
      qrZone.classList.remove('scan-anim');
      qrText.textContent = '✅ 扫描成功！';
      qrIcon.textContent = '✅';
      document.getElementById('rewardList').classList.add('show');
      
      setTimeout(() => {
        document.getElementById('next3').classList.add('enabled');
      }, 2000);
    }, 1500);
  }
  
  // 第4幕：抽卡
  function openGacha() {
    const box = document.getElementById('gachaBox');
    box.classList.add('shaking');
    
    for (let i = 0; i < 12; i++) {
      const fw = document.createElement('div');
      fw.className = 'firework';
      fw.textContent = ['✨', '⭐', '💫', '🌟'][i % 4];
      const angle = (i / 12) * Math.PI * 2;
      fw.style.setProperty('--tx', Math.cos(angle) * 120 + 'px');
      fw.style.setProperty('--ty', Math.sin(angle) * 120 + 'px');
      const rect = box.getBoundingClientRect();
      const parentRect = box.parentElement.getBoundingClientRect();
      fw.style.left = (rect.left - parentRect.left + rect.width/2) + 'px';
      fw.style.top = (rect.top - parentRect.top + rect.height/2) + 'px';
      box.parentElement.appendChild(fw);
      setTimeout(() => fw.remove(), 1500);
    }
    
    setTimeout(() => {
      document.getElementById('gachaPhase1').style.display = 'none';
      document.getElementById('cardReveal').classList.add('show');
      setTimeout(() => {
        document.getElementById('next4').classList.add('enabled');
      }, 1000);
    }, 1200);
  }
  
  // 第5幕：交易
  function listToMarket() {
    const btn = document.getElementById('listBtn');
    if (btn.classList.contains('disabled')) return;
    btn.classList.add('disabled');
    btn.textContent = '✓ 已挂牌';
    document.getElementById('dealFlow').classList.add('show');
    
    setTimeout(() => {
      document.getElementById('next5').classList.add('enabled');
    }, 2500);
  }
  
  // 第6幕：开关
  function toggleSwitch(el, key) {
    el.classList.toggle('on');
    el.closest('.switch-card').classList.toggle('active');
    document.getElementById('next6').classList.add('enabled');
  }
  
  // 第7幕：看板动画
  function animateDashboard() {
    animateNumber('dashDAU', 0, 52, 1500, '', '');
    animateNumber('dashARPU', 0, 86, 1800, '¥', '');
    animateNumber('dashGMV', 0, 4470, 2000, '', '');
  }
  
  function animateNumber(id, from, to, duration, prefix, suffix) {
    const el = document.getElementById(id);
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.floor(from + (to - from) * eased);
      el.textContent = prefix + val.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  
  // 重新开始
  function restart() {
    coins = 0;
    restockCount = 0;
    buffetStock = [100, 80, 60, 40, 50, 70];
    upgrades = { buffet: 1, fridge: 1, soup: 1 };
    document.getElementById('coinValue').textContent = '0';
    document.getElementById('statTurn').textContent = '2.1';
    document.getElementById('statPrice').textContent = '¥98';
    document.getElementById('statSatis').textContent = '85%';
    document.getElementById('lvBuffet').textContent = 'Lv.1';
    document.getElementById('lvFridge').textContent = 'Lv.1';
    document.getElementById('lvSoup').textContent = 'Lv.1';
    document.getElementById('tip2').innerHTML = '👆 食材在被取用，点击格子补货 5 次';
    
    // 重置所有 buffet 格子
    buffetStock.forEach((s, i) => updateBuffetUI(i));
    
    document.querySelectorAll('.next-btn').forEach(b => b.classList.remove('enabled'));
    document.querySelectorAll('.switch-toggle').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.switch-card').forEach(c => c.classList.remove('active'));
    
    goToScene(1);
  }
  
  // 初始化
  setupBuffet();
</script>

</body>
</html>