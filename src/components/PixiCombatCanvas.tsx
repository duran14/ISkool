"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

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

  // Guardar referencias de contenedores para animaciones
  const santiRef = useRef<PIXI.Container | null>(null);
  const lucasRef = useRef<PIXI.Container | null>(null);
  const elenaRef = useRef<PIXI.Container | null>(null);
  const bossRef = useRef<PIXI.Container | null>(null);
  const bossMainRef = useRef<PIXI.Container | null>(null);
  const bossRedRef = useRef<PIXI.Sprite | null>(null);
  const bossCyanRef = useRef<PIXI.Sprite | null>(null);
  const backgroundRef = useRef<PIXI.Container | null>(null);
  const stageRef = useRef<PIXI.Container | null>(null);
  const laserRef = useRef<PIXI.Graphics | null>(null);
  const shockwaveRef = useRef<PIXI.Graphics | null>(null);

  // Parallax target positions
  const mousePos = useRef({ x: 0, y: 0 });
  const targetParallax = useRef({ x: 0, y: 0 });

  // Referencia para evitar closures obsoletos en el ticker
  const combatStateRef = useRef(combatState);
  useEffect(() => {
    combatStateRef.current = combatState;
  }, [combatState]);

  // Lista de partículas de código
  const particles = useRef<Array<{
    text: PIXI.Text;
    vx: number;
    vy: number;
    life: number;
  }>>([]);

  // Timer para la sacudida
  const shakeTimer = useRef(0);

  // Función para escalar sprites a una altura deseada manteniendo el aspecto
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

      // 1. Cargar texturas de manera asíncrona y remover el fondo negro
      let bgTex, santiTex, lucasTex, elenaTex, bossTex;
      try {
        bgTex = await PIXI.Assets.load('/images/rpg/combat_bg.png');

        const loadWithChromaKey = async (url: string): Promise<PIXI.Texture> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(PIXI.Texture.from(img));
                return;
              }
              ctx.drawImage(img, 0, 0);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imgData.data;
              
              // Cambiar píxeles negros a transparentes
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                if (r < 10 && g < 10 && b < 10) {
                  data[i+3] = 0;
                }
              }
              ctx.putImageData(imgData, 0, 0);
              resolve(PIXI.Texture.from(canvas));
            };
            img.onerror = (err) => reject(err);
          });
        };

        santiTex = await loadWithChromaKey('/images/rpg/santi_sprite.png');
        lucasTex = await loadWithChromaKey('/images/rpg/lucas_sprite.png');
        elenaTex = await loadWithChromaKey('/images/rpg/elena_sprite.png');
        bossTex = await loadWithChromaKey('/images/rpg/boss_sprite.png');
      } catch (e) {
        console.error("Error cargando los assets de combate:", e);
        return;
      }

      if (!active) return;

      // 2. Inicializar PixiJS Application
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
      containerRef.current.appendChild(app.canvas);

      // --- CONFIGURACIÓN DE CAPAS ---
      const rootStage = new PIXI.Container();
      app.stage.addChild(rootStage);
      stageRef.current = rootStage;

      // Capa de fondo
      const bgContainer = new PIXI.Container();
      rootStage.addChild(bgContainer);
      backgroundRef.current = bgContainer;

      // Capa de juego principal
      const mainContainer = new PIXI.Container();
      rootStage.addChild(mainContainer);

      // --- AGREGAR FONDO PREMIUM ---
      const bgSprite = new PIXI.Sprite(bgTex);
      bgSprite.anchor.set(0.5);
      bgSprite.position.set(400, 160);
      bgSprite.width = 860; // Extra ancho para el efecto parallax
      bgSprite.height = 350;
      bgContainer.addChild(bgSprite);

      // --- CREACIÓN DE OPERADORES ESPACIALES ---
      // 1. Santi (Guerrero - Cyber Marine)
      const santi = new PIXI.Container();
      santi.position.set(310, 200);
      mainContainer.addChild(santi);
      santiRef.current = santi;

      // Sombra
      const santiSombra = new PIXI.Graphics();
      santiSombra.fill({ color: 0x000, alpha: 0.45 });
      santiSombra.drawEllipse(0, 36, 26, 8);
      santi.addChild(santiSombra);

      // Sprite
      const santiSprite = new PIXI.Sprite(santiTex);
      santiSprite.anchor.set(0.5, 0.5);
      fitToHeight(santiSprite, 110);
      santi.addChild(santiSprite);

      // Etiqueta de nombre
      const santiTag = new PIXI.Text({
        text: 'Santi (Cyber_Marine)',
        style: {
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 'bold',
          fill: 0x94A3B8,
          align: 'center'
        }
      });
      santiTag.anchor.set(0.5);
      santiTag.position.set(0, 52);
      santi.addChild(santiTag);

      // 2. Lucas (Explorador - Scout Space)
      const lucas = new PIXI.Container();
      lucas.position.set(360, 260);
      mainContainer.addChild(lucas);
      lucasRef.current = lucas;

      // Sombra
      const lucasSombra = new PIXI.Graphics();
      lucasSombra.fill({ color: 0x000, alpha: 0.45 });
      lucasSombra.drawEllipse(0, 36, 24, 7);
      lucas.addChild(lucasSombra);

      // Sprite
      const lucasSprite = new PIXI.Sprite(lucasTex);
      lucasSprite.anchor.set(0.5, 0.5);
      fitToHeight(lucasSprite, 110);
      lucas.addChild(lucasSprite);

      const lucasTag = new PIXI.Text({
        text: 'Lucas (Scout_Space)',
        style: {
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 'bold',
          fill: 0x94A3B8,
          align: 'center'
        }
      });
      lucasTag.anchor.set(0.5);
      lucasTag.position.set(0, 52);
      lucas.addChild(lucasTag);

      // 3. Elena (Mago - Sage Cyber)
      const elena = new PIXI.Container();
      elena.position.set(410, 160);
      mainContainer.addChild(elena);
      elenaRef.current = elena;

      // Sombra
      const elenaSombra = new PIXI.Graphics();
      elenaSombra.fill({ color: 0x000, alpha: 0.45 });
      elenaSombra.drawEllipse(0, 36, 26, 8);
      elena.addChild(elenaSombra);

      // Sprite
      const elenaSprite = new PIXI.Sprite(elenaTex);
      elenaSprite.anchor.set(0.5, 0.5);
      fitToHeight(elenaSprite, 115);
      elena.addChild(elenaSprite);

      const elenaTag = new PIXI.Text({
        text: 'Elena (Sage_Cyber)',
        style: {
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 'bold',
          fill: 0xE9D5FF,
          align: 'center'
        }
      });
      elenaTag.anchor.set(0.5);
      elenaTag.position.set(0, 52);
      elena.addChild(elenaTag);

      // --- CREACIÓN DEL JEFE (Firewall Corrupto) ---
      const boss = new PIXI.Container();
      boss.position.set(680, 175);
      mainContainer.addChild(boss);
      bossRef.current = boss;

      // Sombra del jefe
      const bossSombra = new PIXI.Graphics();
      bossSombra.fill({ color: 0x000, alpha: 0.55 });
      bossSombra.drawEllipse(0, 75, 50, 14);
      boss.addChild(bossSombra);

      // Escudo Hexagonal giratorio de fondo
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

      // Contenedor principal de Aberración Cromática Glitch
      const bossMatrix = new PIXI.Container();
      boss.addChild(bossMatrix);

      // 1) Capa Roja Desfasada
      const bossRed = new PIXI.Sprite(bossTex);
      bossRed.anchor.set(0.5, 0.5);
      fitToHeight(bossRed, 170);
      bossRed.tint = 0xFF0000;
      bossRed.alpha = 0.65;
      bossRed.visible = false;
      bossMatrix.addChild(bossRed);
      bossRedRef.current = bossRed;

      // 2) Capa Cian Desfasada
      const bossCyan = new PIXI.Sprite(bossTex);
      bossCyan.anchor.set(0.5, 0.5);
      fitToHeight(bossCyan, 170);
      bossCyan.tint = 0x00FFFF;
      bossCyan.alpha = 0.65;
      bossCyan.visible = false;
      bossMatrix.addChild(bossCyan);
      bossCyanRef.current = bossCyan;

      // 3) Capa Principal
      const bossMain = new PIXI.Container();
      bossMatrix.addChild(bossMain);
      bossMainRef.current = bossMain;

      const bossMainSprite = new PIXI.Sprite(bossTex);
      bossMainSprite.anchor.set(0.5, 0.5);
      fitToHeight(bossMainSprite, 170);
      bossMain.addChild(bossMainSprite);

      // --- ELEMENTOS DE ATAQUE ---
      const lasers = new PIXI.Graphics();
      lasers.blendMode = 'add';
      mainContainer.addChild(lasers);
      laserRef.current = lasers;

      const shockwave = new PIXI.Graphics();
      shockwave.blendMode = 'add';
      mainContainer.addChild(shockwave);
      shockwaveRef.current = shockwave;

      // Manejador de ratón para parallax
      const handleMouseMove = (e: MouseEvent) => {
        const rect = app.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        targetParallax.current.x = (mouseX - 400) * 0.05;
        targetParallax.current.y = (mouseY - 160) * 0.05;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // --- PIXI TICKER (Loop a 60 FPS estables) ---
      app.ticker.add((ticker) => {
        const time = ticker.lastTime;

        // 1. Efecto Parallax en el Fondo
        bgContainer.x += (targetParallax.current.x - bgContainer.x) * 0.1;
        bgContainer.y += (targetParallax.current.y - bgContainer.y) * 0.1;

        // 2. Respiración de Personajes y Retroceso en Combate
        let santiTargetX = 310;
        let lucasTargetX = 360;
        let elenaTargetX = 410;

        if (combatStateRef.current === 'attacking') {
          // Desplazar hacia atrás ligeramente al disparar
          santiTargetX = 296;
          lucasTargetX = 346;
          elenaTargetX = 396;
        }

        santi.x += (santiTargetX - santi.x) * 0.15;
        lucas.x += (lucasTargetX - lucas.x) * 0.15;
        elena.x += (elenaTargetX - elena.x) * 0.15;

        santiSprite.scale.y = (110 / santiTex.height) * (1 + Math.sin(time * 0.003) * 0.022);
        lucasSprite.scale.y = (110 / lucasTex.height) * (1 + Math.sin(time * 0.003 + 1) * 0.022);
        elenaSprite.scale.y = (115 / elenaTex.height) * (1 + Math.sin(time * 0.003 + 2) * 0.022);

        // Levitación y oscilación del jefe
        const targetBossX = 680;
        const targetBossY = 175;
        
        if (boss) {
          if (combatStateRef.current !== 'boss_hurt') {
            boss.y = targetBossY + Math.sin(time * 0.002) * 5.5;
            boss.x += (targetBossX - boss.x) * 0.15;
            bossEscudo.rotation += 0.004;
          } else {
            // Sacudida violenta local
            boss.x = targetBossX + (Math.random() - 0.5) * 7;
            boss.y = targetBossY + (Math.random() - 0.5) * 7;
          }
        }

        // 3. Control de Screen Shake en la raíz
        if (shakeTimer.current > 0) {
          shakeTimer.current -= ticker.deltaTime * 16.666;
          
          const dx = (Math.random() - 0.5) * 11;
          const dy = (Math.random() - 0.5) * 9;
          rootStage.position.set(dx, dy);

          // Aberración cromática de sprites del jefe
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

        // 4. Actualizar partículas de código
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

        // Helper para dibujar destellos (muzzle flashes) en los cañones
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

        // 5. Renderizar y animar láseres
        lasers.clear();
        if (combatStateRef.current === 'attacking') {
          const bossY = boss ? boss.y : 175;
          const targetX = 680;
          const targetY = bossY - 5; // Altura del impacto en el pecho

          // Puntas de armas
          const santiMuzzleX = santi.x + 36;
          const santiMuzzleY = santi.y - 12;

          const lucasMuzzleX = lucas.x + 28;
          const lucasMuzzleY = lucas.y - 18;

          const elenaMuzzleX = elena.x + 32;
          const elenaMuzzleY = elena.y - 24;

          // Láser de Santi (Cyan)
          lasers.stroke({ width: 14 + Math.sin(time * 0.055) * 4.5, color: 0x00F0FF, alpha: 0.28 });
          lasers.moveTo(santiMuzzleX, santiMuzzleY); lasers.lineTo(targetX, targetY);
          lasers.stroke({ width: 6.5, color: 0x00F0FF, alpha: 0.75 });
          lasers.moveTo(santiMuzzleX, santiMuzzleY); lasers.lineTo(targetX, targetY);
          lasers.stroke({ width: 2, color: 0xFFFFFF, alpha: 1 });
          lasers.moveTo(santiMuzzleX, santiMuzzleY); lasers.lineTo(targetX, targetY);
          drawMuzzleFlash(lasers, santiMuzzleX, santiMuzzleY, 14 + Math.sin(time * 0.12) * 5, 0x00F0FF);

          // Láser de Lucas (Cyan)
          lasers.stroke({ width: 12 + Math.sin(time * 0.055) * 4.0, color: 0x00F0FF, alpha: 0.28 });
          lasers.moveTo(lucasMuzzleX, lucasMuzzleY); lasers.lineTo(targetX, targetY);
          lasers.stroke({ width: 6.0, color: 0x00F0FF, alpha: 0.75 });
          lasers.moveTo(lucasMuzzleX, lucasMuzzleY); lasers.lineTo(targetX, targetY);
          lasers.stroke({ width: 1.8, color: 0xFFFFFF, alpha: 1 });
          lasers.moveTo(lucasMuzzleX, lucasMuzzleY); lasers.lineTo(targetX, targetY);
          drawMuzzleFlash(lasers, lucasMuzzleX, lucasMuzzleY, 12 + Math.sin(time * 0.12) * 4, 0x00F0FF);

          // Láser de Elena (Naranja/Oro - Imagen 1)
          lasers.stroke({ width: 16 + Math.sin(time * 0.055) * 5.0, color: 0xFF9900, alpha: 0.28 });
          lasers.moveTo(elenaMuzzleX, elenaMuzzleY); lasers.lineTo(targetX, targetY);
          lasers.stroke({ width: 7.5, color: 0xFF9900, alpha: 0.75 });
          lasers.moveTo(elenaMuzzleX, elenaMuzzleY); lasers.lineTo(targetX, targetY);
          lasers.stroke({ width: 2.2, color: 0xFFFFFF, alpha: 1 });
          lasers.moveTo(elenaMuzzleX, elenaMuzzleY); lasers.lineTo(targetX, targetY);
          drawMuzzleFlash(lasers, elenaMuzzleX, elenaMuzzleY, 16 + Math.sin(time * 0.12) * 5.5, 0xFF9900);

          // Círculos de energía en el impacto
          lasers.stroke({ width: 1.8, color: 0xFFFFFF, alpha: 0.55 });
          lasers.drawCircle(targetX, targetY, 14 + (time % 28) * 0.65);
        }

        // Flares rojos en los laterales de la pantalla (Imagen 1)
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

        // 6. Animación del Shockwave en Impacto
        shockwave.clear();
        if (combatStateRef.current === 'boss_hurt') {
          const bossY = boss ? boss.y : 175;
          const targetX = 680;
          const targetY = bossY - 5;
          
          const radius = 24 + (time % 1200) * 0.16;
          const opacity = Math.max(0, 1 - (radius / 85));
          
          // Anillos expansivos
          shockwave.stroke({ width: 4.5, color: 0xFFFFFF, alpha: opacity });
          shockwave.drawCircle(targetX, targetY, radius);
          
          shockwave.stroke({ width: 2, color: 0x00F0FF, alpha: opacity * 0.65 });
          shockwave.drawCircle(targetX, targetY, radius * 0.75);

          // Impacto masivo spiky starburst (Imagen 1)
          shockwave.stroke({ width: 2.8, color: 0xFFFFFF, alpha: opacity });
          for (let m = 0; m < 12; m++) {
            const angle = (m * Math.PI) / 6;
            const length = radius * (m % 2 === 0 ? 1.65 : 0.95);
            shockwave.moveTo(targetX, targetY);
            shockwave.lineTo(targetX + Math.cos(angle) * length, targetY + Math.sin(angle) * length);
          }

          // Polvo/humo expansivo en el suelo del jefe
          const smokeRadius = 15 + (time % 38) * 0.85;
          const smokeAlpha = Math.max(0, 0.55 - (smokeRadius / 55));
          shockwave.fill({ color: 0x222222, alpha: smokeAlpha * 0.45 });
          shockwave.drawCircle(targetX - 25, targetY + 62, smokeRadius);
          shockwave.drawCircle(targetX + 25, targetY + 62, smokeRadius * 1.15);
          shockwave.drawCircle(targetX, targetY + 68, smokeRadius * 0.95);
        }
      });

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
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

  // Escuchar transiciones en el estado del combate para disparar partículas y sacudidas
  useEffect(() => {
    if (combatState === 'boss_hurt') {
      // 1. Disparar Sacudida de Pantalla por 350ms
      shakeTimer.current = 350;

      // 2. Disparar Partículas de código matrix flotantes (Explosión de partículas físicas)
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
          const vy = Math.sin(angle) * speed - 1.8; // Empuje ascendente

          appRef.current.stage.addChild(text);

          particles.current.push({
            text,
            vx,
            vy,
            life: 1.0
          });
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
