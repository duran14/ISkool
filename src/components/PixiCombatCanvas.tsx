"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useCoopStore, PartyAction } from '@/store/useCoopStore';
import { useStudentStore } from '@/store/useStudentStore';

interface PixiCombatCanvasProps {
  combatState: 'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat';
  volume: number;
  guildBoss: {
    hp_actual: number;
    hp_max: number;
    name: string;
    xp_reward: number;
  };
  partyHp: number;
  elenaSub: {
    status: string;
    student_name: string;
  } | undefined;
  playSound: (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => void;
  onAttackFinish: () => void;
}

const getStudentAvatarUrl = (name: string): string => {
  const firstName = name.split(' ')[0].toLowerCase();
  const validAvatars = ['elena', 'lucas', 'mateo', 'santi'];
  if (validAvatars.includes(firstName)) {
    return `/images/students/${firstName}.png`;
  }
  return '/images/students/default.png';
};

export default function PixiCombatCanvas({
  combatState,
  volume,
  guildBoss,
  partyHp,
  elenaSub,
  playSound,
  onAttackFinish
}: PixiCombatCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [loading, setLoading] = useState(true);

  // References
  const bossRef = useRef<PIXI.Container | null>(null);
  const bossRedRef = useRef<PIXI.Sprite | null>(null);
  const bossCyanRef = useRef<PIXI.Sprite | null>(null);
  const rootStageRef = useRef<PIXI.Container | null>(null);
  const lasersRef = useRef<PIXI.Graphics | null>(null);
  const shockwaveRef = useRef<PIXI.Graphics | null>(null);

  // Parallax target positions
  const mousePos = useRef({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });

  // Reference for avoiding stale closures in the ticker loop
  const combatStateRef = useRef(combatState);
  useEffect(() => {
    combatStateRef.current = combatState;
  }, [combatState]);

  // Code/binary floating particles list
  const particles = useRef<Array<{
    text: PIXI.Text;
    vx: number;
    vy: number;
    life: number;
  }>>([]);

  // Screen shake timer
  const shakeTimer = useRef(0);

  // Helper to scale sprites maintaining ratio
  const fitToHeight = (sprite: PIXI.Sprite, targetHeight: number) => {
    if (sprite.texture) {
      const ratio = targetHeight / sprite.texture.height;
      sprite.scale.set(ratio);
    }
  };

  useEffect(() => {
    let active = true;

    async function initPixi() {
      if (!containerRef.current) return;

      // 1. Load textures asynchronously
      let bgTex: PIXI.Texture, bossTex: PIXI.Texture;
      const avatarTextures = new Map<string, PIXI.Texture>();

      try {
        bgTex = await PIXI.Assets.load('/images/rpg/combat_bg.png?v=3');
        bossTex = await PIXI.Assets.load('/images/rpg/boss_sprite.png?v=3');
        
        // Dynamic student avatars
        avatarTextures.set('default', await PIXI.Assets.load('/images/students/default.png'));
        avatarTextures.set('elena', await PIXI.Assets.load('/images/students/elena.png'));
        avatarTextures.set('lucas', await PIXI.Assets.load('/images/students/lucas.png'));
        avatarTextures.set('mateo', await PIXI.Assets.load('/images/students/mateo.png'));
        avatarTextures.set('santi', await PIXI.Assets.load('/images/students/santi.png'));

        // Preload default RPG sprites for backwards compatibility
        avatarTextures.set('santi_sprite', await PIXI.Assets.load('/images/rpg/santi_sprite.png?v=3'));
        avatarTextures.set('lucas_sprite', await PIXI.Assets.load('/images/rpg/lucas_sprite.png?v=3'));
        avatarTextures.set('elena_sprite', await PIXI.Assets.load('/images/rpg/elena_sprite.png?v=3'));
      } catch (e) {
        console.error("Error loading combat assets:", e);
        return;
      }

      if (!active) return;

      // 2. Initialize PixiJS Application
      const app = new PIXI.Application();
      await app.init({
        width: 800,
        height: 320,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1
      });

      if (!active) {
        app.destroy(true, { children: true });
        return;
      }

      appRef.current = app;
      setLoading(false);
      
      // Responsive canvas styles
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.objectFit = 'contain';
      containerRef.current.appendChild(app.canvas);

      // --- LAYER CONFIGURATION ---
      const rootStage = new PIXI.Container();
      app.stage.addChild(rootStage);
      rootStageRef.current = rootStage;

      // Background layer
      const bgContainer = new PIXI.Container();
      rootStage.addChild(bgContainer);

      // Main action layer
      const mainContainer = new PIXI.Container();
      rootStage.addChild(mainContainer);

      // --- ADD BACKGROUND ---
      const bgSprite = new PIXI.Sprite(bgTex);
      bgSprite.anchor.set(0.5);
      bgSprite.position.set(400, 160);
      bgSprite.width = 860;
      bgSprite.height = 350;
      bgContainer.addChild(bgSprite);

      // --- SLOTS AND COOP FORMATIONS ---
      const slots = [
        { x: 310, y: 200, height: 110 }, // Slot 0
        { x: 360, y: 260, height: 110 }, // Slot 1
        { x: 410, y: 160, height: 115 }, // Slot 2
        { x: 260, y: 150, height: 110 }, // Slot 3
        { x: 210, y: 210, height: 110 }  // Slot 4
      ];

      // Resolve character list based on Coop Party state
      const coopMembers = useCoopStore.getState().members;
      const charactersData: Array<{ id: string; name: string; isCoop: boolean; texKey: string }> = [];

      if (coopMembers && coopMembers.length > 0) {
        coopMembers.forEach((m) => {
          const firstName = m.name.split(' ')[0].toLowerCase();
          const texKey = ['elena', 'lucas', 'mateo', 'santi'].includes(firstName) ? firstName : 'default';
          charactersData.push({
            id: m.student_id,
            name: m.name.split(' ')[0],
            isCoop: true,
            texKey
          });
        });
      } else {
        // Fallback to offline JRPG defaults
        charactersData.push({ id: 'santi', name: 'Santi', isCoop: false, texKey: 'santi_sprite' });
        charactersData.push({ id: 'lucas', name: 'Lucas', isCoop: false, texKey: 'lucas_sprite' });
        charactersData.push({ id: 'elena', name: 'Elena', isCoop: false, texKey: 'elena_sprite' });
      }

      // --- RENDER CHARACTERS ---
      interface RenderedCharacter {
        id: string;
        container: PIXI.Container;
        sprite: PIXI.Sprite;
        baseX: number;
        baseY: number;
        height: number;
        muzzleOffsetX: number;
        muzzleOffsetY: number;
        color: number;
        laserWidth: number;
      }
      const renderedChars: RenderedCharacter[] = [];

      charactersData.forEach((char, idx) => {
        const slot = slots[idx % slots.length];
        const container = new PIXI.Container();
        container.position.set(slot.x, slot.y);
        mainContainer.addChild(container);

        // Shadow
        const sombra = new PIXI.Graphics();
        sombra.fill({ color: 0x000, alpha: 0.45 });
        sombra.drawEllipse(0, 36, 26, 8);
        container.addChild(sombra);

        // Sprite
        const tex = avatarTextures.get(char.texKey) || avatarTextures.get('default')!;
        const sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5, 0.5);
        fitToHeight(sprite, slot.height);
        container.addChild(sprite);

        // Tag text
        const tag = new PIXI.Text({
          text: char.name,
          style: {
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 'bold',
            fill: char.isCoop ? 0x94A3B8 : (idx === 2 ? 0xE9D5FF : 0x94A3B8),
            align: 'center'
          }
        });
        tag.anchor.set(0.5);
        tag.position.set(0, 52);
        container.addChild(tag);

        renderedChars.push({
          id: char.id,
          container,
          sprite,
          baseX: slot.x,
          baseY: slot.y,
          height: slot.height,
          muzzleOffsetX: idx === 0 ? 36 : idx === 1 ? 28 : 32,
          muzzleOffsetY: idx === 0 ? -12 : idx === 1 ? -18 : -24,
          color: idx === 2 ? 0xFF9900 : 0x00F0FF,
          laserWidth: idx === 0 ? 14 : idx === 1 ? 12 : 16
        });
      });

      // --- CREATION OF BOSS (Firewall Corrupto) ---
      const boss = new PIXI.Container();
      boss.position.set(680, 175);
      mainContainer.addChild(boss);
      bossRef.current = boss;

      const bossSombra = new PIXI.Graphics();
      bossSombra.fill({ color: 0x000, alpha: 0.55 });
      bossSombra.drawEllipse(0, 75, 50, 14);
      boss.addChild(bossSombra);

      const bossEscudo = new PIXI.Graphics();
      bossEscudo.stroke({ width: 1.5, color: 0xFF00FF, alpha: 0.4 });
      bossEscudo.moveTo(0, -90);
      bossEscudo.lineTo(65, -50);
      bossEscudo.lineTo(65, 40);
      bossEscudo.lineTo(0, 80);
      bossEscudo.lineTo(-65, 40);
      bossEscudo.lineTo(-65, -50);
      bossEscudo.closePath();
      boss.addChild(bossEscudo);

      const bossMatrix = new PIXI.Container();
      boss.addChild(bossMatrix);

      const bossRed = new PIXI.Sprite(bossTex);
      bossRed.anchor.set(0.5, 0.5);
      fitToHeight(bossRed, 170);
      bossRed.tint = 0xFF0000;
      bossRed.alpha = 0.65;
      bossRed.visible = false;
      bossMatrix.addChild(bossRed);
      bossRedRef.current = bossRed;

      const bossCyan = new PIXI.Sprite(bossTex);
      bossCyan.anchor.set(0.5, 0.5);
      fitToHeight(bossCyan, 170);
      bossCyan.tint = 0x00FFFF;
      bossCyan.alpha = 0.65;
      bossCyan.visible = false;
      bossMatrix.addChild(bossCyan);
      bossCyanRef.current = bossCyan;

      const bossMain = new PIXI.Container();
      bossMatrix.addChild(bossMain);

      const bossMainSprite = new PIXI.Sprite(bossTex);
      bossMainSprite.anchor.set(0.5, 0.5);
      fitToHeight(bossMainSprite, 170);
      bossMain.addChild(bossMainSprite);

      // --- LASERS AND ATTACKS ---
      const lasers = new PIXI.Graphics();
      lasers.blendMode = 'add';
      mainContainer.addChild(lasers);
      lasersRef.current = lasers;

      const shockwave = new PIXI.Graphics();
      shockwave.blendMode = 'add';
      mainContainer.addChild(shockwave);
      shockwaveRef.current = shockwave;

      // Parallax Mouse Handler
      const handleMouseMove = (e: MouseEvent) => {
        const rect = app.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        targetParallax.current.x = (mouseX - 400) * 0.05;
        targetParallax.current.y = (mouseY - 160) * 0.05;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // Local State for visual cues (avoids React re-renders)
      let localCombatState = 'idle';
      const setLocalCombatState = (state: string) => {
        localCombatState = state;
        if (state === 'boss_hurt') {
          shakeTimer.current = 300;
          
          if (app && boss) {
            const glyphs = ['0', '1', '4', 'Z', '8', '3-', 'XP', '404', 'SYS_ERR'];
            const numParticles = 15 + Math.floor(Math.random() * 10);
            for (let i = 0; i < numParticles; i++) {
              const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
              const text = new PIXI.Text({
                text: glyph,
                style: {
                  fontFamily: 'monospace',
                  fontSize: 10 + Math.floor(Math.random() * 8),
                  fontWeight: 'bold',
                  fill: Math.random() > 0.5 ? 0x00F0FF : 0xFF00FF
                }
              });
              text.anchor.set(0.5);
              text.position.set(680 + (Math.random() - 0.5) * 35, boss.y + (Math.random() - 0.5) * 50);
              const angle = Math.random() * Math.PI * 2;
              const speed = 2.5 + Math.random() * 6.5;
              const vx = Math.cos(angle) * speed;
              const vy = Math.sin(angle) * speed - 1.8;
              app.stage.addChild(text);
              particles.current.push({ text, vx, vy, life: 1.0 });
            }
          }
        }
      };

      // --- PROJECTILE SPAWNER FOR CO-OP ACTIONS ---
      const spawnProjectile = (fromX: number, fromY: number, damage: number, studentName: string) => {
        if (volume > 0) {
          playSound('charge');
        }

        const projectile = new PIXI.Graphics();
        projectile.blendMode = 'add';
        projectile.fill({ color: 0xFF00FF, alpha: 0.85 });
        projectile.drawCircle(0, 0, 10);
        projectile.position.set(fromX, fromY);
        mainContainer.addChild(projectile);

        const targetX = 680;
        const targetY = boss ? boss.y - 5 : 170;

        const startTime = Date.now();
        const duration = 600; // ms

        const animateProj = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Arched curve path
          const currentX = fromX + (targetX - fromX) * progress;
          const currentY = fromY + (targetY - fromY) * progress - Math.sin(progress * Math.PI) * 50;

          projectile.position.set(currentX, currentY);

          // Sparkle trail
          const trail = new PIXI.Graphics();
          trail.fill({ color: 0xFF99FF, alpha: 0.4 });
          trail.drawCircle(0, 0, 5);
          trail.position.set(currentX, currentY);
          mainContainer.addChild(trail);
          
          let trailAlpha = 0.4;
          const fadeTrail = () => {
            trailAlpha -= 0.05;
            trail.alpha = trailAlpha;
            if (trailAlpha <= 0) {
              mainContainer.removeChild(trail);
              trail.destroy();
            } else {
              requestAnimationFrame(fadeTrail);
            }
          };
          fadeTrail();

          if (progress < 1) {
            requestAnimationFrame(animateProj);
          } else {
            // Impact!
            mainContainer.removeChild(projectile);
            projectile.destroy();
            
            // Screen shake flash
            setLocalCombatState('boss_hurt');
            setTimeout(() => {
              localCombatState = 'idle';
            }, 500);
            
            // Floating damage indicators
            const damageText = new PIXI.Text({
              text: `-${damage} HP\n(${studentName})`,
              style: {
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 'bold',
                fill: 0xFF3333,
                align: 'center'
              }
            });
            damageText.anchor.set(0.5);
            damageText.position.set(targetX, targetY - 45);
            mainContainer.addChild(damageText);

            let dY = damageText.y;
            let dAlpha = 1.2;
            const animateText = () => {
              dY -= 0.8;
              dAlpha -= 0.025;
              damageText.y = dY;
              damageText.alpha = dAlpha;
              if (dAlpha <= 0) {
                mainContainer.removeChild(damageText);
                damageText.destroy();
              } else {
                requestAnimationFrame(animateText);
              }
            };
            animateText();

            // Hit sound
            if (volume > 0) {
              playSound('hit');
            }
          }
        };

        animateProj();
      };

      // --- ZUSTAND STORE SUBSCRIPTION ---
      const lastActionIdRef = { current: null as string | null };
      const unsubscribeCoop = useCoopStore.subscribe((state) => {
        const lastAction = state.lastAction;
        if (lastAction && lastAction.id !== lastActionIdRef.current) {
          lastActionIdRef.current = lastAction.id;
          
          const localStudentId = useStudentStore.getState().activeStudentId;
          // Trigger projectile only for actions from OTHER students
          if (lastAction.student_id !== localStudentId) {
            const members = useCoopStore.getState().members;
            const memberIdx = members.findIndex(m => m.student_id === lastAction.student_id);
            const slotIdx = memberIdx !== -1 ? memberIdx % slots.length : 1;
            const slot = slots[slotIdx];
            
            spawnProjectile(slot.x, slot.y - 10, lastAction.damage_dealt, lastAction.student_name || 'Compañero');
          }
        }
      });

      // --- TICKER LOOP (60 FPS) ---
      app.ticker.add((ticker) => {
        const time = ticker.lastTime;

        // 1. Parallax background
        bgContainer.x += (targetParallax.current.x - bgContainer.x) * 0.1;
        bgContainer.y += (targetParallax.current.y - bgContainer.y) * 0.1;

        // 2. Bobbing / Breathing and combat recoil
        renderedChars.forEach((char, idx) => {
          let targetX = char.baseX;
          if (combatStateRef.current === 'attacking' || localCombatState === 'attacking') {
            targetX = char.baseX - 14;
          }
          char.container.x += (targetX - char.container.x) * 0.15;
          char.sprite.scale.y = (char.height / char.sprite.texture.height) * (1 + Math.sin(time * 0.003 + idx) * 0.022);
        });

        // Levitating Boss
        const targetBossX = 680;
        const targetBossY = 175;
        
        if (boss) {
          if (combatStateRef.current !== 'boss_hurt' && localCombatState !== 'boss_hurt') {
            boss.y = targetBossY + Math.sin(time * 0.002) * 5.5;
            boss.x += (targetBossX - boss.x) * 0.15;
            bossEscudo.rotation += 0.004;
          } else {
            boss.x = targetBossX + (Math.random() - 0.5) * 7;
            boss.y = targetBossY + (Math.random() - 0.5) * 7;
          }
        }

        // 3. Screen Shake Control
        if (shakeTimer.current > 0) {
          shakeTimer.current -= ticker.deltaTime * 16.666;
          const dx = (Math.random() - 0.5) * 11;
          const dy = (Math.random() - 0.5) * 9;
          rootStage.position.set(dx, dy);

          if (bossRed && bossCyan) {
            const isGlitching = Math.random() > 0.35;
            bossRed.visible = isGlitching;
            bossCyan.visible = !isGlitching;
            bossRed.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8);
            bossCyan.position.set((Math.random() - 0.5) * -14, (Math.random() - 0.5) * -8);
          }
        } else {
          rootStage.position.set(0, 0);
          if (bossRed && bossCyan) {
            bossRed.visible = false;
            bossCyan.visible = false;
          }
        }

        // 4. Update binary floating particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.text.x += p.vx;
          p.text.y += p.vy;
          p.text.alpha -= 0.022;
          p.text.scale.set(p.text.scale.x * 0.98);
          
          if (p.text.alpha <= 0) {
            mainContainer.removeChild(p.text);
            p.text.destroy();
            particles.current.splice(i, 1);
          }
        }

        // Helper to draw muzzle flashes
        const drawMuzzleFlash = (g: PIXI.Graphics, x: number, y: number, radius: number, color: number) => {
          g.fill({ color, alpha: 0.35 });
          g.drawCircle(x, y, radius * 1.55);
          g.fill({ color: 0xFFFFFF, alpha: 0.9 });
          g.drawCircle(x, y, radius * 0.65);
          
          g.stroke({ width: 2.2, color: 0xFFFFFF });
          for (let k = 0; k < 8; k++) {
            const angle = (k * Math.PI) / 4;
            const length = radius * (k % 2 === 0 ? 1.9 : 1.25);
            g.moveTo(x, y);
            g.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
          }
        };

        // 5. Render lasers (attacks)
        lasers.clear();
        if (combatStateRef.current === 'attacking') {
          const bossY = boss ? boss.y : 175;
          const targetX = 680;
          const targetY = bossY - 5;

          renderedChars.forEach((char) => {
            const muzzleX = char.container.x + char.muzzleOffsetX;
            const muzzleY = char.container.y + char.muzzleOffsetY;

            lasers.stroke({ width: char.laserWidth + Math.sin(time * 0.055) * 4.5, color: char.color, alpha: 0.28 });
            lasers.moveTo(muzzleX, muzzleY); lasers.lineTo(targetX, targetY);
            lasers.stroke({ width: char.laserWidth / 2, color: char.color, alpha: 0.75 });
            lasers.moveTo(muzzleX, muzzleY); lasers.lineTo(targetX, targetY);
            lasers.stroke({ width: 2, color: 0xFFFFFF, alpha: 1 });
            lasers.moveTo(muzzleX, muzzleY); lasers.lineTo(targetX, targetY);
            drawMuzzleFlash(lasers, muzzleX, muzzleY, char.laserWidth + Math.sin(time * 0.12) * 5, char.color);
          });

          // Energy rings on impact
          lasers.stroke({ width: 1.8, color: 0xFFFFFF, alpha: 0.55 });
          lasers.drawCircle(targetX, targetY, 14 + (time % 28) * 0.65);
        }

        // Side glow flares
        const leftFlareX = 5;
        const rightFlareX = 795;
        const flareY = 160;
        const flareScale = 1 + Math.sin(time * 0.005) * 0.15;
        
        lasers.fill({ color: 0xEF4444, alpha: 0.18 * flareScale });
        lasers.drawCircle(leftFlareX, flareY, 52);
        lasers.drawCircle(rightFlareX, flareY, 52);
        lasers.fill({ color: 0xEF4444, alpha: 0.45 * flareScale });
        lasers.drawCircle(leftFlareX, flareY, 22);
        lasers.drawCircle(rightFlareX, flareY, 22);
        
        lasers.stroke({ width: 2.2, color: 0xFF8888, alpha: 0.65 * flareScale });
        for (let j = 0; j < 8; j++) {
          const angle = (j * Math.PI) / 4;
          lasers.moveTo(leftFlareX, flareY);
          lasers.lineTo(leftFlareX + Math.cos(angle) * 36 * flareScale, flareY + Math.sin(angle) * 36 * flareScale);
          lasers.moveTo(rightFlareX, flareY);
          lasers.lineTo(rightFlareX + Math.cos(angle) * 36 * flareScale, flareY + Math.sin(angle) * 36 * flareScale);
        }

        // 6. Impact Shockwave
        shockwave.clear();
        if (combatStateRef.current === 'boss_hurt' || localCombatState === 'boss_hurt') {
          const bossY = boss ? boss.y : 175;
          const targetX = 680;
          const targetY = bossY - 5;
          
          const radius = 24 + (time % 1200) * 0.16;
          const opacity = Math.max(0, 1 - (radius / 85));
          
          shockwave.stroke({ width: 4.5, color: 0xFFFFFF, alpha: opacity });
          shockwave.drawCircle(targetX, targetY, radius);
          
          shockwave.stroke({ width: 2, color: 0x00F0FF, alpha: opacity * 0.65 });
          shockwave.drawCircle(targetX, targetY, radius * 0.75);

          shockwave.stroke({ width: 2.8, color: 0xFFFFFF, alpha: opacity });
          for (let m = 0; m < 12; m++) {
            const angle = (m * Math.PI) / 6;
            const length = radius * (m % 2 === 0 ? 1.65 : 0.95);
            shockwave.moveTo(targetX, targetY);
            shockwave.lineTo(targetX + Math.cos(angle) * length, targetY + Math.sin(angle) * length);
          }

          const smokeRadius = 15 + (time % 38) * 0.85;
          const smokeAlpha = Math.max(0, 0.55 - (smokeRadius / 55));
          shockwave.fill({ color: 0x222222, alpha: smokeAlpha * 0.45 });
          shockwave.drawCircle(targetX - 25, targetY + 62, smokeRadius);
          shockwave.drawCircle(targetX + 25, targetY + 62, smokeRadius * 1.15);
        }
      });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        unsubscribeCoop();
      };
    }

    initPixi();

    return () => {
      active = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // Visual cues on combatState transitions
  useEffect(() => {
    if (combatState === 'boss_hurt') {
      shakeTimer.current = 350;

      if (appRef.current && bossRef.current) {
        const glyphs = ['0', '1', '4', 'Z', '8', '3-', 'XP', '404', 'SYS_ERR'];
        const numParticles = 28 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < numParticles; i++) {
          const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
          const size = 10 + Math.floor(Math.random() * 8);
          
          const text = new PIXI.Text({
            text: glyph,
            style: {
              fontFamily: 'monospace',
              fontSize: size,
              fontWeight: 'bold',
              fill: Math.random() > 0.5 ? 0x00F0FF : 0xFF00FF
            }
          });
          
          text.anchor.set(0.5);
          text.position.set(680 + (Math.random() - 0.5) * 35, bossRef.current.y + (Math.random() - 0.5) * 50);
          
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6.5;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed - 1.8;

          appRef.current.stage.addChild(text);
          particles.current.push({ text, vx, vy, life: 1.0 });
        }
      }
    }
  }, [combatState]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-hidden relative" 
      style={{ touchAction: 'none' }}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-cyan-400 font-mono text-xs tracking-[4px] gap-3 z-30">
          <div className="w-8 h-8 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <span>INICIALIZANDO ESCENARIO WEBGL...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}
