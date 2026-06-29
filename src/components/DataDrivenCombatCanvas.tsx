"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export interface RpgEnemyData {
  enemy_id: string;
  name: string;
  hp_max: number;
  hp_remaining: number;
  skin_id: string;
}

export interface RpgAttacker {
  student_id: string;
  name: string;
  role: 'Cyber_Marine' | 'Scout_Space' | 'Sage_Cyber' | string;
  skin_texture_id: string;
  rpg_action: 'RIFLE_BURST' | 'BLASTER_SHOT' | 'LASER_BEAM' | string;
  damage: number;
}

export interface RpgCombatPayload {
  mission_id: string;
  homework_id: string;
  enemy_data: RpgEnemyData;
  attackers: RpgAttacker[];
  server_calculated_total_damage: number;
}

interface DataDrivenCombatCanvasProps {
  payload: RpgCombatPayload;
  localStudentId: string;
  combatState: 'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat';
  volume: number;
  playSound: (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => void;
  onAttackFinish?: () => void;
}

export default function DataDrivenCombatCanvas({
  payload,
  localStudentId,
  combatState,
  volume,
  playSound,
  onAttackFinish
}: DataDrivenCombatCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Referencias a huesos para animaciones programáticas
  const boneBodyRefs = useRef<Map<string, PIXI.Container>>(new Map());
  const boneArmRefs = useRef<Map<string, PIXI.Container>>(new Map());
  const boneHeadRefs = useRef<Map<string, PIXI.Container>>(new Map());
  const boneWeaponRefs = useRef<Map<string, PIXI.Container>>(new Map());

  // Referencias globales de contenedores
  const bossRef = useRef<PIXI.Container | null>(null);
  const bossRedRef = useRef<PIXI.Sprite | null>(null);
  const bossCyanRef = useRef<PIXI.Sprite | null>(null);
  const rootStageRef = useRef<PIXI.Container | null>(null);
  const lasersRef = useRef<PIXI.Graphics | null>(null);
  const shockwaveRef = useRef<PIXI.Graphics | null>(null);

  // Parallax y Cámara
  const targetParallax = useRef({ x: 0, y: 0 });
  const shakeTimer = useRef(0);

  // Referencias reactivas para el Ticker
  const combatStateRef = useRef(combatState);
  useEffect(() => {
    combatStateRef.current = combatState;
  }, [combatState]);

  const particles = useRef<Array<{
    text: PIXI.Text;
    vx: number;
    vy: number;
    life: number;
  }>>([]);

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

      // 1. Cargar texturas de manera dinámica basadas en el Payload JSON
      let bgTex: PIXI.Texture, bossTex: PIXI.Texture;
      const attackerTextures: Map<string, PIXI.Texture> = new Map();

      try {
        // Carga de mapa y jefe basados en el ID
        bgTex = await PIXI.Assets.load(`/images/rpg/combat_bg.png?v=3`);
        bossTex = await PIXI.Assets.load(`/images/rpg/boss_sprite.png?v=3`);

        // Cargar skins de atacantes dinámicamente
        for (const attacker of payload.attackers) {
          const skinUrl = `/images/rpg/${attacker.skin_texture_id.replace('skin_', '')}_sprite.png?v=3`;
          const tex = await PIXI.Assets.load(skinUrl);
          attackerTextures.set(attacker.student_id, tex);
        }
      } catch (e) {
        console.error("Error al cargar dinámicamente los assets de la misión:", e);
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
      
      // Ajustar responsive
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.objectFit = 'contain';
      containerRef.current.appendChild(app.canvas);

      // --- CONFIGURACIÓN DE CAPAS ---
      const rootStage = new PIXI.Container();
      app.stage.addChild(rootStage);
      rootStageRef.current = rootStage;

      const bgContainer = new PIXI.Container();
      rootStage.addChild(bgContainer);

      const mainContainer = new PIXI.Container();
      rootStage.addChild(mainContainer);

      // Fondo
      const bgSprite = new PIXI.Sprite(bgTex);
      bgSprite.anchor.set(0.5);
      bgSprite.position.set(400, 160);
      bgSprite.width = 860;
      bgSprite.height = 350;
      bgContainer.addChild(bgSprite);

      // --- PERSPECTIVA DE CÁMARA LOCAL (Reordenamiento de Slots) ---
      // Slot 0 (Primer plano prioritario): Alumno Local
      // Slot 1 (Plano Medio)
      // Slot 2 (Fondo)
      const slots = [
        { x: 360, y: 260, zIndex: 3, height: 110 }, // Foreground
        { x: 310, y: 200, zIndex: 2, height: 110 }, // Middleground
        { x: 410, y: 160, zIndex: 1, height: 115 }  // Background
      ];

      // Reordenar atacantes colocando al Alumno Local en el primer slot (Foreground)
      const localAttacker = payload.attackers.find(a => a.student_id === localStudentId);
      const otherAttackers = payload.attackers.filter(a => a.student_id !== localStudentId);
      const orderedAttackers = localAttacker ? [localAttacker, ...otherAttackers] : payload.attackers;

      // --- RIGGING ÓSEO DE OPERADORES ---
      orderedAttackers.forEach((attacker, idx) => {
        const slot = slots[idx];
        const tex = attackerTextures.get(attacker.student_id);
        if (!tex) return;

        const charContainer = new PIXI.Container();
        charContainer.position.set(slot.x, slot.y);
        charContainer.zIndex = slot.zIndex;
        mainContainer.addChild(charContainer);

        // Sombra
        const sombra = new PIXI.Graphics();
        sombra.fill({ color: 0x000, alpha: 0.45 });
        sombra.ellipse(0, 36, 26, 8);
        charContainer.addChild(sombra);

        // --- JERARQUÍA ÓSEA (Bones) ---
        const boneRoot = new PIXI.Container();
        charContainer.addChild(boneRoot);

        // Hueso Torso / Cuerpo
        const boneBody = new PIXI.Container();
        boneRoot.addChild(boneBody);
        boneBodyRefs.current.set(attacker.student_id, boneBody);

        const bodySprite = new PIXI.Sprite(tex);
        bodySprite.anchor.set(0.5, 0.5);
        fitToHeight(bodySprite, slot.height);
        boneBody.addChild(bodySprite);

        // Determinar colores y luces del rol para efectos de neón
        let roleColor = 0x00F0FF; // Cyan por defecto (Cyber Marine)
        if (attacker.role === 'Sage_Cyber') roleColor = 0xFF00FF; // Magenta
        if (attacker.role === 'Scout_Space') roleColor = 0xFF9900; // Orange

        // Hueso Cabeza (con visor glowing neón dinámico)
        const boneHead = new PIXI.Container();
        boneHead.position.set(0, -slot.height * 0.18);
        boneBody.addChild(boneHead);
        boneHeadRefs.current.set(attacker.student_id, boneHead);

        const visorOverlay = new PIXI.Graphics();
        visorOverlay.fill({ color: roleColor, alpha: 0.4 });
        visorOverlay.drawCircle(0, 0, slot.height * 0.08);
        boneHead.addChild(visorOverlay);

        // Hueso Brazo Derecho (apuntando al jefe)
        const boneArmRight = new PIXI.Container();
        boneArmRight.position.set(slot.height * 0.15, -slot.height * 0.1);
        boneBody.addChild(boneArmRight);
        boneArmRefs.current.set(attacker.student_id, boneArmRight);

        // Hueso Arma / Cañón (Focal point del láser)
        const boneWeapon = new PIXI.Container();
        boneWeapon.position.set(slot.height * 0.2, 0); // Punta del arma
        boneArmRight.addChild(boneWeapon);
        boneWeaponRefs.current.set(attacker.student_id, boneWeapon);

        // Etiqueta del alumno
        const isLocal = attacker.student_id === localStudentId;
        const nameTag = new PIXI.Text({
          text: isLocal ? `TÚ (${attacker.name})` : attacker.name,
          style: {
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 'bold',
            fill: isLocal ? 0x22D3EE : 0x94A3B8,
            align: 'center'
          }
        });
        nameTag.anchor.set(0.5);
        nameTag.position.set(0, 52);
        charContainer.addChild(nameTag);
      });

      // Ordenar capas en base a Z-Index isométrico
      mainContainer.sortChildren();

      // --- CREACIÓN DEL JEFE ---
      const boss = new PIXI.Container();
      boss.position.set(680, 175);
      mainContainer.addChild(boss);
      bossRef.current = boss;

      const bossSombra = new PIXI.Graphics();
      bossSombra.fill({ color: 0x000, alpha: 0.55 });
      bossSombra.ellipse(0, 75, 50, 14);
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

      // --- LASERS Y SHOCKWAVE ---
      const lasers = new PIXI.Graphics();
      lasers.blendMode = 'add';
      mainContainer.addChild(lasers);
      lasersRef.current = lasers;

      const shockwave = new PIXI.Graphics();
      shockwave.blendMode = 'add';
      mainContainer.addChild(shockwave);
      shockwaveRef.current = shockwave;

      // Parallax Mouse
      const handleMouseMove = (e: MouseEvent) => {
        const rect = app.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        targetParallax.current.x = (mouseX - 400) * 0.05;
        targetParallax.current.y = (mouseY - 160) * 0.05;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // --- TICKER LOOP (60 FPS) ---
      app.ticker.add((ticker) => {
        const time = ticker.lastTime;

        // 1. Lógica de Cámara Virtual Local
        let targetCamX = 0;
        let targetCamY = 0;

        if (combatStateRef.current === 'attacking') {
          // Centrar cámara cinematográfica en la interacción Alumno Local - Boss
          targetCamX = (400 - (slots[0].x + 680) / 2) * 0.35;
          targetCamY = (160 - (slots[0].y + 175) / 2) * 0.35;
        } else {
          targetCamX = targetParallax.current.x;
          targetCamY = targetParallax.current.y;
        }

        rootStage.x += (targetCamX - rootStage.x) * 0.1;
        rootStage.y += (targetCamY - rootStage.y) * 0.1;

        // 2. Parallax de fondo
        bgContainer.x = -rootStage.x * 0.3;
        bgContainer.y = -rootStage.y * 0.3;

        // 3. Animaciones Óseas (Skeletal Bone Bobbing)
        orderedAttackers.forEach((attacker, idx) => {
          const boneBody = boneBodyRefs.current.get(attacker.student_id);
          const boneHead = boneHeadRefs.current.get(attacker.student_id);
          const boneArm = boneArmRefs.current.get(attacker.student_id);

          if (boneBody && boneHead && boneArm) {
            // Respiración base
            const osc = Math.sin(time * 0.003 + idx) * 0.02;
            boneBody.scale.y = 1 + osc;
            boneHead.y = (-slots[idx].height * 0.18) + Math.sin(time * 0.002 + idx) * 1.2;

            // Retroceso / Posicionamiento durante ataque
            let targetX = 0;
            if (combatStateRef.current === 'attacking') {
              targetX = -12; // Mover torso hacia atrás al disparar (recoil)
              boneArm.rotation = -0.15 + Math.sin(time * 0.1) * 0.08;
            } else {
              targetX = 0;
              boneArm.rotation = Math.sin(time * 0.003 + idx) * 0.03;
            }
            boneBody.x += (targetX - boneBody.x) * 0.15;
          }
        });

        // Oscilación del jefe
        const targetBossY = 175;
        if (boss) {
          if (combatStateRef.current !== 'boss_hurt') {
            boss.y = targetBossY + Math.sin(time * 0.002) * 5.5;
            bossEscudo.rotation += 0.004;
          } else {
            boss.x = 680 + (Math.random() - 0.5) * 8;
            boss.y = targetBossY + (Math.random() - 0.5) * 8;
          }
        }

        // 4. Screen Shake e Impacto de Aberración Cromática
        if (shakeTimer.current > 0) {
          shakeTimer.current -= ticker.deltaTime * 16.666;
          
          const dx = (Math.random() - 0.5) * 12;
          const dy = (Math.random() - 0.5) * 10;
          rootStage.position.set(rootStage.position.x + dx, rootStage.position.y + dy);

          if (bossRed && bossCyan) {
            const isGlitching = Math.random() > 0.35;
            bossRed.visible = isGlitching;
            bossCyan.visible = !isGlitching;
            bossRed.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 9);
            bossCyan.position.set((Math.random() - 0.5) * -15, (Math.random() - 0.5) * -9);
          }
        } else {
          if (bossRed && bossCyan) {
            bossRed.visible = false;
            bossCyan.visible = false;
          }
        }

        // 5. Partículas Binarias
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

        // 6. Dibujar Láseres y Muzzle Flashes
        lasers.clear();
        if (combatStateRef.current === 'attacking') {
          const bossY = boss ? boss.y : 175;
          const laserTargetX = 680;
          const laserTargetY = bossY - 8;

          orderedAttackers.forEach((attacker) => {
            const boneWeapon = boneWeaponRefs.current.get(attacker.student_id);
            if (!boneWeapon) return;

            // Obtener coordenadas globales del cañón usando la jerarquía ósea
            const weaponGlobal = boneWeapon.toGlobal(new PIXI.Point(0, 0));
            // Ajustar del espacio de root a mainContainer
            const localMuzzleX = mainContainer.toLocal(weaponGlobal).x;
            const localMuzzleY = mainContainer.toLocal(weaponGlobal).y;

            let laserColor = 0x00F0FF;
            if (attacker.role === 'Sage_Cyber') laserColor = 0xFF9900; // Oro
            if (attacker.role === 'Scout_Space') laserColor = 0x00F0FF;

            // Glow aditivo neón
            lasers.stroke({ width: 15 + Math.sin(time * 0.05) * 4, color: laserColor, alpha: 0.28 });
            lasers.moveTo(localMuzzleX, localMuzzleY); lasers.lineTo(laserTargetX, laserTargetY);
            lasers.stroke({ width: 6.5, color: laserColor, alpha: 0.75 });
            lasers.moveTo(localMuzzleX, localMuzzleY); lasers.lineTo(laserTargetX, laserTargetY);
            lasers.stroke({ width: 2, color: 0xFFFFFF, alpha: 1 });
            lasers.moveTo(localMuzzleX, localMuzzleY); lasers.lineTo(laserTargetX, laserTargetY);

            // Muzzle flash
            lasers.fill({ color: laserColor, alpha: 0.35 });
            lasers.drawCircle(localMuzzleX, localMuzzleY, 16);
            lasers.fill({ color: 0xFFFFFF, alpha: 0.9 });
            lasers.drawCircle(localMuzzleX, localMuzzleY, 8);
            
            lasers.stroke({ width: 2.2, color: 0xFFFFFF });
            for (let k = 0; k < 8; k++) {
              const angle = (k * Math.PI) / 4;
              lasers.moveTo(localMuzzleX, localMuzzleY);
              lasers.lineTo(localMuzzleX + Math.cos(angle) * 20, localMuzzleY + Math.sin(angle) * 20);
            }
          });
        }

        // Flares laterales
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

        // 7. Shockwave e Impacto Spiky
        shockwave.clear();
        if (combatStateRef.current === 'boss_hurt') {
          const bossY = boss ? boss.y : 175;
          const laserTargetX = 680;
          const laserTargetY = bossY - 8;
          
          const radius = 24 + (time % 1200) * 0.16;
          const opacity = Math.max(0, 1 - (radius / 85));

          shockwave.stroke({ width: 4.5, color: 0xFFFFFF, alpha: opacity });
          shockwave.drawCircle(laserTargetX, laserTargetY, radius);
          
          shockwave.stroke({ width: 2.8, color: 0xFFFFFF, alpha: opacity });
          for (let m = 0; m < 12; m++) {
            const angle = (m * Math.PI) / 6;
            const length = radius * (m % 2 === 0 ? 1.65 : 0.95);
            shockwave.moveTo(laserTargetX, laserTargetY);
            shockwave.lineTo(laserTargetX + Math.cos(angle) * length, laserTargetY + Math.sin(angle) * length);
          }

          const smokeRadius = 15 + (time % 38) * 0.85;
          const smokeAlpha = Math.max(0, 0.55 - (smokeRadius / 55));
          shockwave.fill({ color: 0x222222, alpha: smokeAlpha * 0.45 });
          shockwave.drawCircle(laserTargetX - 25, laserTargetY + 62, smokeRadius);
          shockwave.drawCircle(laserTargetX + 25, laserTargetY + 62, smokeRadius * 1.15);
        }
      });

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
  }, [payload, localStudentId]);

  // Disparar efectos en transiciones
  useEffect(() => {
    if (combatState === 'boss_hurt') {
      shakeTimer.current = 350;

      if (appRef.current && bossRef.current) {
        const glyphs = ['0', '1', '4', 'Z', '8', '3-', 'XP', '404', 'SYS_ERR'];
        const numParticles = 25 + Math.floor(Math.random() * 10);
        
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
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative" style={{ touchAction: 'none' }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 text-cyan-400 font-mono text-xs tracking-[4px] gap-3 z-30">
          <div className="w-8 h-8 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <span>CARGANDO MOTOR DATA-DRIVEN...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
}
