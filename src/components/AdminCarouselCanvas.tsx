"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  creator: string;
  lastAccess: string;
  code: string;
  themeColor: number; // Hex color, e.g. 0x2563eb
  logoBgColor: number;
  logoType: 'shield_i' | 'shield_lion' | 'shield_ceili' | 'shield_cdi' | 'shield_exclamation' | 'sigma' | 'scroll' | 'atom' | 'globe' | 'book';
  imageUrl?: string; // Base64 data URL or HTTP image url for custom logo upload
}

interface AdminCarouselCanvasProps {
  items: CarouselItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onCardSelect: (item: CarouselItem) => void;
}

export default function AdminCarouselCanvas({
  items,
  activeIndex,
  onActiveIndexChange,
  onCardSelect
}: AdminCarouselCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep latest props in refs to avoid recreating the Pixi application on prop changes
  const itemsRef = useRef<CarouselItem[]>(items);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);
  const onCardSelectRef = useRef(onCardSelect);
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    itemsRef.current = items;
    onActiveIndexChangeRef.current = onActiveIndexChange;
    onCardSelectRef.current = onCardSelect;
    activeIndexRef.current = activeIndex;
  }, [items, onActiveIndexChange, onCardSelect, activeIndex]);

  // Scrolling state refs
  const currentScrollIndex = useRef<number>(activeIndex);
  const targetScrollIndex = useRef<number>(activeIndex);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartScroll = useRef<number>(0);
  const lastMouseX = useRef<number>(0);
  const lastMouseTime = useRef<number>(0);
  const dragVelocity = useRef<number>(0);

  // Trigger scroll to activeIndex when it is changed from React parent
  useEffect(() => {
    const N = itemsRef.current.length;
    if (N === 0) return;

    // Check if the carousel is already focused on this index to avoid infinite feedback loops
    const rounded = Math.round(currentScrollIndex.current);
    const wrapped = ((rounded % N) + N) % N;
    if (wrapped === activeIndex) {
      return;
    }
    
    // Find closest target index corresponding to activeIndex
    const currentTarget = targetScrollIndex.current;
    let diff = activeIndex - (((currentTarget % N) + N) % N);
    const halfN = N / 2;
    while (diff < -halfN) diff += N;
    while (diff > halfN) diff -= N;
    
    targetScrollIndex.current = currentTarget + diff;
  }, [activeIndex]);

  useEffect(() => {
    let active = true;
    let app: PIXI.Application | null = null;
    let initialized = false;

    async function initPixi() {
      if (!containerRef.current) return;

      // Initialize Pixi application
      app = new PIXI.Application();
      await app.init({
        width: 1000,
        height: 560,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 2
      });

      if (!active) {
        app.destroy(true, { children: true });
        return;
      }

      initialized = true;

      appRef.current = app;
      setLoading(false);

      // Responsive styles
      app.canvas.style.width = '100%';
      app.canvas.style.height = '100%';
      app.canvas.style.display = 'block';
      containerRef.current.appendChild(app.canvas);

      // Root Container
      const stage = new PIXI.Container();
      stage.sortableChildren = true;
      app.stage.addChild(stage);

      const centerX = 500;
      const centerY = 280;

      // ----------------------------------------------------
      // 1. HUD CONCENTRICO EN EL FONDO (Holographic Floor Platform)
      // ----------------------------------------------------
      const hudContainer = new PIXI.Container();
      hudContainer.x = centerX;
      hudContainer.y = centerY + 130;
      hudContainer.scale.y = 0.35; // Tilted for 3D perspective
      hudContainer.zIndex = 0;
      stage.addChild(hudContainer);

      const hudOuter = new PIXI.Graphics();
      hudOuter.stroke({ width: 1, color: 0x06b6d4, alpha: 0.15 });
      hudOuter.circle(0, 0, 260);
      hudContainer.addChild(hudOuter);

      const hudMiddle = new PIXI.Graphics();
      hudMiddle.stroke({ width: 1.5, color: 0x3b82f6, alpha: 0.2 });
      // Draw a dashed middle circle
      const dashes = 48;
      const r = 210;
      for (let i = 0; i < dashes; i++) {
        const a1 = (i / dashes) * Math.PI * 2;
        const a2 = ((i + 0.5) / dashes) * Math.PI * 2;
        hudMiddle.moveTo(Math.cos(a1) * r, Math.sin(a1) * r);
        hudMiddle.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
      }
      hudContainer.addChild(hudMiddle);

      const hudInner = new PIXI.Graphics();
      hudInner.stroke({ width: 2, color: 0x6366f1, alpha: 0.25 });
      // Draw tick marks inside the inner circle
      const ticks = 60;
      const rInner = 160;
      const tickLen = 8;
      for (let i = 0; i < ticks; i++) {
        const angle = (i / ticks) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        hudInner.moveTo(cos * rInner, sin * rInner);
        hudInner.lineTo(cos * (rInner - tickLen), sin * (rInner - tickLen));
      }
      hudContainer.addChild(hudInner);

      // HUD Label Technology Collection
      const hudLabel = new PIXI.Text({
        text: "ISKOOL SYSTEM // MULTI-PORTAL ACCESS",
        style: {
          fontFamily: 'monospace',
          fontSize: 10,
          fill: 0x3b82f6,
          align: 'center',
          fontWeight: 'bold',
          letterSpacing: 2
        }
      });
      hudLabel.anchor.set(0.5);
      hudLabel.y = 190;
      hudLabel.alpha = 0.4;
      hudContainer.addChild(hudLabel);

      // HUD Binary Matrix Floating Particles
      const particles: Array<{ text: PIXI.Text; speed: number; yLimit: number }> = [];
      const symbols = ['01', '10', '00', '11', 'SYS_OK', 'SECURE', 'NEM_v2.6', 'ADMIN_SYS'];
      for (let i = 0; i < 12; i++) {
        const txt = new PIXI.Text({
          text: symbols[Math.floor(Math.random() * symbols.length)],
          style: {
            fontFamily: 'monospace',
            fontSize: 9 + Math.floor(Math.random() * 4),
            fill: Math.random() > 0.5 ? 0x06b6d4 : 0x6366f1,
            fontWeight: 'bold'
          }
        });
        txt.alpha = 0.05 + Math.random() * 0.15;
        txt.x = (Math.random() - 0.5) * 800;
        txt.y = (Math.random() - 0.5) * 400;
        hudContainer.addChild(txt);
        particles.push({
          text: txt,
          speed: 0.2 + Math.random() * 0.5,
          yLimit: -240 - Math.random() * 50
        });
      }

      // ----------------------------------------------------
      // 2. CONTENEDOR DE TARJETAS Y LOGOS VECTORIALES
      // ----------------------------------------------------
      const cardsContainer = new PIXI.Container();
      cardsContainer.zIndex = 10;
      stage.addChild(cardsContainer);

      // Card dimensions (Expanded size matching references)
      const cardW = 280;
      const cardH = 390;

      // Function to draw vector emblems/logos
      const drawEmblem = (graphics: PIXI.Graphics, type: string, color: number) => {
        graphics.clear();
        
        switch (type) {
          case 'shield_i': {
            // Blue Shield with "I"
            graphics.fill({ color: 0x1e3a8a, alpha: 1 });
            graphics.stroke({ width: 3, color: 0xffffff });
            graphics.moveTo(-25, -30);
            graphics.lineTo(25, -30);
            graphics.lineTo(25, 0);
            graphics.quadraticCurveTo(25, 25, 0, 35);
            graphics.quadraticCurveTo(-25, 25, -25, 0);
            graphics.closePath();
            
            // Draw a white bold "I"
            graphics.fill({ color: 0xffffff });
            graphics.rect(-6, -18, 12, 5);
            graphics.rect(-6, 13, 12, 5);
            graphics.rect(-3, -13, 6, 26);
            break;
          }
          case 'shield_lion': {
            // Gold Shield with Crown
            graphics.fill({ color: 0x78350f, alpha: 1 });
            graphics.stroke({ width: 3, color: 0xf59e0b });
            graphics.moveTo(-25, -30);
            graphics.lineTo(25, -30);
            graphics.lineTo(25, 0);
            graphics.quadraticCurveTo(25, 25, 0, 35);
            graphics.quadraticCurveTo(-25, 25, -25, 0);
            graphics.closePath();

            // Crown shape
            graphics.fill({ color: 0xf59e0b });
            graphics.moveTo(-15, 10);
            graphics.lineTo(15, 10);
            graphics.lineTo(12, -10);
            graphics.lineTo(6, 0);
            graphics.lineTo(0, -15);
            graphics.lineTo(-6, 0);
            graphics.lineTo(-12, -10);
            graphics.closePath();
            break;
          }
          case 'shield_ceili': {
            // Red Shield with Star
            graphics.fill({ color: 0x7f1d1d, alpha: 1 });
            graphics.stroke({ width: 3, color: 0xef4444 });
            graphics.moveTo(-25, -30);
            graphics.lineTo(25, -30);
            graphics.lineTo(25, 0);
            graphics.quadraticCurveTo(25, 25, 0, 35);
            graphics.quadraticCurveTo(-25, 25, -25, 0);
            graphics.closePath();

            // Star shape
            graphics.fill({ color: 0xf59e0b });
            const points = 5;
            const rOuter = 14;
            const rInner = 6;
            for (let i = 0; i < points * 2; i++) {
              const r = i % 2 === 0 ? rOuter : rInner;
              const angle = (i / points) * Math.PI - Math.PI / 2;
              if (i === 0) graphics.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
              else graphics.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            graphics.closePath();
            break;
          }
          case 'shield_cdi': {
            // Deep Orange Shield with glowing concentric design
            graphics.fill({ color: 0x7c2d12, alpha: 1 });
            graphics.stroke({ width: 3, color: 0xf97316 });
            graphics.moveTo(-25, -30);
            graphics.lineTo(25, -30);
            graphics.lineTo(25, 0);
            graphics.quadraticCurveTo(25, 25, 0, 35);
            graphics.quadraticCurveTo(-25, 25, -25, 0);
            graphics.closePath();

            // Hexagram (Star of David)
            graphics.stroke({ width: 2.5, color: 0xffffff });
            // Triangle 1
            graphics.moveTo(0, -16);
            graphics.lineTo(14, 8);
            graphics.lineTo(-14, 8);
            graphics.closePath();
            // Triangle 2
            graphics.moveTo(0, 16);
            graphics.lineTo(14, -8);
            graphics.lineTo(-14, -8);
            graphics.closePath();
            break;
          }
          case 'shield_exclamation': {
            // Yellow Shield with exclamation
            graphics.fill({ color: 0x713f12, alpha: 1 });
            graphics.stroke({ width: 3, color: 0xeab308 });
            graphics.moveTo(-25, -30);
            graphics.lineTo(25, -30);
            graphics.lineTo(25, 0);
            graphics.quadraticCurveTo(25, 25, 0, 35);
            graphics.quadraticCurveTo(-25, 25, -25, 0);
            graphics.closePath();

            // Exclamation mark
            graphics.fill({ color: 0xeab308 });
            graphics.rect(-4, -18, 8, 18);
            graphics.circle(0, 10, 4);
            break;
          }
          case 'sigma': {
            // Math Sigma Logo
            graphics.fill({ color: 0x4c1d95, alpha: 1 });
            graphics.stroke({ width: 3, color: 0x8b5cf6 });
            graphics.circle(0, 0, 32);

            // Bold Sigma
            graphics.stroke({ width: 5, color: 0xffffff, cap: 'round', join: 'round' });
            graphics.moveTo(10, -14);
            graphics.lineTo(-10, -14);
            graphics.lineTo(0, 0);
            graphics.lineTo(-10, 14);
            graphics.lineTo(10, 14);
            break;
          }
          case 'scroll': {
            // History Scroll
            graphics.fill({ color: 0x78350f, alpha: 1 });
            graphics.stroke({ width: 3, color: 0xd97706 });
            graphics.circle(0, 0, 32);

            // Scroll shape
            graphics.fill({ color: 0xffffff });
            graphics.stroke({ width: 1.5, color: 0xd97706 });
            graphics.rect(-15, -12, 30, 24);
            // scrolls rolls
            graphics.circle(-15, 0, 4);
            graphics.circle(15, 0, 4);
            break;
          }
          case 'atom': {
            // Science Atom
            graphics.fill({ color: 0x064e3b, alpha: 1 });
            graphics.stroke({ width: 3, color: 0x10b981 });
            graphics.circle(0, 0, 32);

            // Orbit ellipses
            graphics.stroke({ width: 2, color: 0xffffff });
            
            // Draw 2 crossing ellipses
            const rx = 24;
            const ry = 8;
            const steps = 30;
            const drawEllipse = (rotationAngle: number) => {
              const cosR = Math.cos(rotationAngle);
              const sinR = Math.sin(rotationAngle);
              for (let i = 0; i <= steps; i++) {
                const stepAngle = (i / steps) * Math.PI * 2;
                const ex = Math.cos(stepAngle) * rx;
                const ey = Math.sin(stepAngle) * ry;
                const rotX = ex * cosR - ey * sinR;
                const rotY = ex * sinR + ey * cosR;
                if (i === 0) graphics.moveTo(rotX, rotY);
                else graphics.lineTo(rotX, rotY);
              }
            };
            drawEllipse(Math.PI / 4);
            drawEllipse(-Math.PI / 4);
            
            // Nucleus
            graphics.fill({ color: 0x10b981 });
            graphics.circle(0, 0, 5);
            break;
          }
          case 'globe': {
            // Geography Globe
            graphics.fill({ color: 0x1e3a8a, alpha: 1 });
            graphics.stroke({ width: 3, color: 0x3b82f6 });
            graphics.circle(0, 0, 32);

            // Grid lines
            graphics.stroke({ width: 1.5, color: 0xffffff });
            graphics.circle(0, 0, 20);
            graphics.moveTo(-32, 0).lineTo(32, 0);
            graphics.moveTo(0, -32).lineTo(0, 32);
            break;
          }
          case 'book': {
            // Spanish Book
            graphics.fill({ color: 0x831843, alpha: 1 });
            graphics.stroke({ width: 3, color: 0xec4899 });
            graphics.circle(0, 0, 32);

            // Book icon
            graphics.fill({ color: 0xffffff });
            graphics.moveTo(-16, -8);
            graphics.lineTo(0, -2);
            graphics.lineTo(16, -8);
            graphics.lineTo(16, 10);
            graphics.lineTo(0, 16);
            graphics.lineTo(-16, 10);
            graphics.closePath();
            graphics.moveTo(0, -2).lineTo(0, 16);
            break;
          }
          default: {
            graphics.fill({ color: 0x4b5563, alpha: 1 });
            graphics.circle(0, 0, 32);
          }
        }
      };

      // ----------------------------------------------------
      // 3. GENERAR Y DIBUJAR LAS TARJETAS (SCHOOL/SUBJECT CARDS)
      // ----------------------------------------------------
      const buildCards = () => {
        // Clear old children
        while (cardsContainer.children.length > 0) {
          const child = cardsContainer.children[0];
          cardsContainer.removeChild(child);
          child.destroy({ children: true });
        }

        const currentItems = itemsRef.current;
        currentItems.forEach((item, idx) => {
          const cardNode = new PIXI.Container();
          cardNode.name = `card_${idx}`;
          (cardNode as any).itemId = item.id;
          (cardNode as any).itemCode = item.code;
          (cardNode as any).itemTitle = item.title;
          (cardNode as any).itemImageUrl = item.imageUrl;
          (cardNode as any).itemLogoType = item.logoType;
          (cardNode as any).itemThemeColor = item.themeColor;
          // Enable interactivity
          cardNode.eventMode = 'static';
          cardNode.cursor = 'pointer';

          // 3.1 Sombra proyectada
          const shadowNode = new PIXI.Graphics();
          shadowNode.name = "shadow";
          shadowNode.fill({ color: 0x000000, alpha: 0.45 });
          shadowNode.drawEllipse(0, cardH / 2 + 10, cardW / 2 + 10, 14);
          cardNode.addChild(shadowNode);

          // 3.2 Borde de selección brillante (Glow)
          const borderGlow = new PIXI.Graphics();
          borderGlow.name = "glow";
          // We draw a larger rounded rect that acts as a glowing border
          borderGlow.stroke({ width: 4, color: 0x3b82f6, alpha: 0 }); // Default alpha is 0
          borderGlow.drawRoundedRect(-cardW / 2 - 2, -cardH / 2 - 2, cardW + 4, cardH + 4, 26);
          cardNode.addChild(borderGlow);

          // 3.3 Cuerpo de la tarjeta
          const cardBody = new PIXI.Graphics();
          cardBody.name = "body";
          // Dark glassmorphic gradient simulation
          cardBody.fill({ color: 0x111827, alpha: 0.9 }); // Zinc 900
          cardBody.stroke({ width: 1.5, color: 0x374151 }); // Grey border
          cardBody.drawRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 24);
          cardNode.addChild(cardBody);

          // 3.4 Star Bookmark flag on top right
          const starFlag = new PIXI.Graphics();
          starFlag.fill({ color: 0xf59e0b }); // Gold
          starFlag.moveTo(cardW / 2 - 40, -cardH / 2);
          starFlag.lineTo(cardW / 2, -cardH / 2);
          starFlag.lineTo(cardW / 2, -cardH / 2 + 40);
          starFlag.closePath();
          cardNode.addChild(starFlag);

          const starChar = new PIXI.Text({
            text: "★",
            style: {
              fontFamily: 'Arial',
              fontSize: 12,
              fill: 0x000000
            }
          });
          starChar.anchor.set(0.5);
          starChar.position.set(cardW / 2 - 14, -cardH / 2 + 13);
          cardNode.addChild(starChar);

          // 3.5 Círculo de área del logo (Ampliado)
          const logoArea = new PIXI.Graphics();
          logoArea.fill({ color: item.logoBgColor, alpha: 1 });
          logoArea.stroke({ width: 1.5, color: 0x374151 });
          logoArea.circle(0, -90, 52);
          cardNode.addChild(logoArea);

          // 3.6 Dibujo de Emblema Vectorial o Carga de Escudo funcional
          if (item.imageUrl) {
            PIXI.Assets.load(item.imageUrl).then((texture) => {
              const sprite = new PIXI.Sprite(texture);
              sprite.anchor.set(0.5);
              sprite.position.set(0, -90);
              
              // Scale to fit inside the logo area (diameter 84px)
              const maxDim = Math.max(texture.width, texture.height);
              if (maxDim > 0) {
                const scale = 84 / maxDim;
                sprite.scale.set(scale);
              }

              // Clip inside circle mask
              const clipMask = new PIXI.Graphics();
              clipMask.fill({ color: 0xffffff });
              clipMask.circle(0, -90, 44);
              cardNode.addChild(clipMask);
              sprite.mask = clipMask;

              cardNode.addChild(sprite);
            }).catch((err) => {
              console.error("Error loading custom school logo:", err);
              // Fallback
              const emblemGraphics = new PIXI.Graphics();
              emblemGraphics.position.set(0, -90);
              emblemGraphics.scale.set(1.2);
              drawEmblem(emblemGraphics, item.logoType, item.themeColor);
              cardNode.addChild(emblemGraphics);
            });
          } else {
            const emblemGraphics = new PIXI.Graphics();
            emblemGraphics.position.set(0, -90);
            emblemGraphics.scale.set(1.2);
            drawEmblem(emblemGraphics, item.logoType, item.themeColor);
            cardNode.addChild(emblemGraphics);
          }

          const isColegio = item.logoType.startsWith('shield_');

          // 3.7 Rol / Subtítulo ("Bienvenido - DUEÑO -")
          const subText = new PIXI.Text({
            text: item.subtitle.toUpperCase(),
            resolution: 2,
            style: {
              fontFamily: 'monospace',
              fontSize: 11,
              fill: item.themeColor,
              fontWeight: 'bold',
              letterSpacing: 2
            }
          });
          subText.anchor.set(0.5);
          subText.position.set(0, -10);
          cardNode.addChild(subText);

          // 3.8 Nombre principal del colegio o materia
          const titleText = new PIXI.Text({
            text: item.title,
            resolution: 2,
            style: {
              fontFamily: 'sans-serif',
              fontSize: 22,
              fill: 0xffffff,
              fontWeight: 'bold',
              wordWrap: true,
              wordWrapWidth: cardW - 30,
              align: 'center'
            }
          });
          titleText.anchor.set(0.5);
          titleText.position.set(0, 35);
          cardNode.addChild(titleText);

          // 3.9 Información adicional (Creador, Acceso)
          const creatorText = new PIXI.Text({
            text: item.creator,
            resolution: 2,
            style: {
              fontFamily: 'sans-serif',
              fontSize: 12,
              fill: 0x9ca3af // gray-400
            }
          });
          creatorText.anchor.set(0.5);
          creatorText.position.set(0, 80);
          cardNode.addChild(creatorText);

          const accessText = new PIXI.Text({
            text: item.lastAccess,
            resolution: 2,
            style: {
              fontFamily: 'sans-serif',
              fontSize: 11,
              fill: 0x6b7280 // gray-500
            }
          });
          accessText.anchor.set(0.5);
          accessText.position.set(0, 108);
          cardNode.addChild(accessText);

          // 3.10 Pastilla / Botón para el Código de Aventura
          const codeBg = new PIXI.Graphics();
          codeBg.fill({ color: item.themeColor, alpha: 0.15 });
          codeBg.stroke({ width: 1, color: item.themeColor, alpha: 0.6 });
          codeBg.drawRoundedRect(-110, 138, 220, 30, 15);
          cardNode.addChild(codeBg);

          const codeText = new PIXI.Text({
            text: isColegio ? `Código de aventura: ${item.code}` : `Código: ${item.code}`,
            resolution: 2,
            style: {
              fontFamily: 'monospace',
              fontSize: 11,
              fill: 0xffffff,
              fontWeight: 'bold'
            }
          });
          codeText.anchor.set(0.5);
          codeText.position.set(0, 153);
          cardNode.addChild(codeText);

          // 3.11 Eventos de clic sobre la tarjeta
          let cardPressed = false;
          let pressX = 0;
          let pressY = 0;

          cardNode.on('pointerdown', (e) => {
            cardPressed = true;
            pressX = e.global.x;
            pressY = e.global.y;
          });

          cardNode.on('pointerup', (e) => {
            if (!cardPressed) return;
            cardPressed = false;

            const dx = e.global.x - pressX;
            const dy = e.global.y - pressY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Si es un clic (no arrastre significativo)
            if (distance < 10) {
              const N = itemsRef.current.length;
              const roundedActive = Math.round(currentScrollIndex.current);
              const wrappedActive = ((roundedActive % N) + N) % N;

              if (wrappedActive === idx) {
                // Si ya está enfocada, la seleccionamos
                onCardSelectRef.current(item);
              } else {
                // Si no, la enfocamos usando el camino más corto en el carrusel cíclico
                const currentTarget = targetScrollIndex.current;
                let wrapDiff = idx - (currentTarget % N);
                const halfN = N / 2;
                while (wrapDiff < -halfN) wrapDiff += N;
                while (wrapDiff > halfN) wrapDiff -= N;
                targetScrollIndex.current = currentTarget + wrapDiff;
              }
            }
          });

          cardNode.on('pointerupoutside', () => {
            cardPressed = false;
          });

          cardsContainer.addChild(cardNode);
        });
      };

      // Inicializar tarjetas
      buildCards();

      // ----------------------------------------------------
      // 4. INTERACTIVIDAD GLOBAL (DRAG DEL CANVAS)
      // ----------------------------------------------------
      const hitArea = new PIXI.Graphics();
      hitArea.fill({ color: 0x000000, alpha: 0.001 }); // Invisible but interactive
      hitArea.rect(0, 0, 1000, 520);
      hitArea.zIndex = 1;
      hitArea.eventMode = 'static';
      stage.addChild(hitArea);

      // Pointer event handlers for drag
      hitArea.on('pointerdown', (e) => {
        isDragging.current = true;
        dragStartX.current = e.global.x;
        dragStartScroll.current = targetScrollIndex.current;
        lastMouseX.current = e.global.x;
        lastMouseTime.current = Date.now();
        dragVelocity.current = 0;
      });

      hitArea.on('pointermove', (e) => {
        if (!isDragging.current) return;
        
        const dx = e.global.x - dragStartX.current;
        // Sensitivity: 280px of drag corresponds to 1 card offset
        const scrollDelta = -dx / 280;
        targetScrollIndex.current = dragStartScroll.current + scrollDelta;

        // Calculate instant velocity for inertia
        const now = Date.now();
        const dt = now - lastMouseTime.current;
        if (dt > 0) {
          dragVelocity.current = -(e.global.x - lastMouseX.current) / dt * 0.15;
        }
        lastMouseX.current = e.global.x;
        lastMouseTime.current = now;
      });

      const handleDragEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;

        // Apply inertia velocity
        if (Math.abs(dragVelocity.current) > 0.01) {
          targetScrollIndex.current += dragVelocity.current * 4.5;
        }

        // Snap to nearest card
        targetScrollIndex.current = Math.round(targetScrollIndex.current);
      };

      hitArea.on('pointerup', handleDragEnd);
      hitArea.on('pointerupoutside', handleDragEnd);

      // ----------------------------------------------------
      // 5. BUCLE DE ANIMACION (TICKER)
      // ----------------------------------------------------
      let lastReportedIndex = -1;

      const tickerCallback = (ticker: PIXI.Ticker) => {
        const dt = ticker.deltaTime;

        // 5.0 Rebuild cards if length or content changed
        const currentItems = itemsRef.current;
        let needsRebuild = currentItems.length !== cardsContainer.children.length;
        if (!needsRebuild) {
          for (let i = 0; i < currentItems.length; i++) {
            const childCard = cardsContainer.children[i] as any;
            if (!childCard || 
                childCard.itemId !== currentItems[i].id || 
                childCard.itemCode !== currentItems[i].code ||
                childCard.itemTitle !== currentItems[i].title ||
                childCard.itemImageUrl !== currentItems[i].imageUrl ||
                childCard.itemLogoType !== currentItems[i].logoType ||
                childCard.itemThemeColor !== currentItems[i].themeColor) {
              needsRebuild = true;
              break;
            }
          }
        }
        if (needsRebuild) {
          buildCards();
        }

        // 5.1 HUD concentric rotation
        hudOuter.rotation += 0.001 * dt;
        hudMiddle.rotation -= 0.0015 * dt;
        hudInner.rotation += 0.0025 * dt;

        // 5.2 HUD floating binary codes
        particles.forEach((p) => {
          p.text.y -= p.speed * dt;
          if (p.text.y < p.yLimit) {
            p.text.y = 250;
            p.text.x = (Math.random() - 0.5) * 800;
          }
        });

        // 5.3 Lerp scroll index towards target
        if (isDragging.current) {
          // Responsive follow when dragging
          currentScrollIndex.current += (targetScrollIndex.current - currentScrollIndex.current) * 0.45 * dt;
        } else {
          // Smooth snapping when releasing
          currentScrollIndex.current += (targetScrollIndex.current - currentScrollIndex.current) * 0.09 * dt;
        }

        // Keep current scroll index in limits to prevent overflow
        const N = itemsRef.current.length;
        if (N > 0) {
          // Send active index back to React
          const roundedIndex = Math.round(currentScrollIndex.current);
          const wrappedIndex = ((roundedIndex % N) + N) % N;
          if (wrappedIndex !== lastReportedIndex) {
            lastReportedIndex = wrappedIndex;
            onActiveIndexChangeRef.current(wrappedIndex);
          }

          // 5.4 Actualizar tarjetas en base al scroll y perspectiva 3D
          const radiusX = 260; // Horizontal reach
          const radiusZ = 120; // Simulated depth

          cardsContainer.children.forEach((card, index) => {
            const cardNode = card as PIXI.Container;
            let diff = index - currentScrollIndex.current;

            // Infinite scroll wrapping math
            const halfN = N / 2;
            while (diff < -halfN) diff += N;
            while (diff > halfN) diff -= N;

            // Theta angle on circular layout
            const theta = diff * 0.65; // Spacing angle factor
            const cosT = Math.cos(theta); // 1 at center, decreases at sides
            const sinT = Math.sin(theta); // -1 to 1

            // 3D coordinates
            cardNode.x = centerX + sinT * radiusX;
            cardNode.y = centerY;
            // depth z scales from 0.4 at sides to 1.0 at center
            const z = cosT; 
            
            // Adjust card scale
            const targetScale = 0.72 + z * 0.28; // active card = 1.0, sides = 0.72
            cardNode.scale.set(targetScale);

            // Apply simulated 3D Y-axis skew
            cardNode.skew.y = -sinT * 0.15;

            // Set alpha fade
            cardNode.alpha = Math.max(0.35, Math.min(1.0, 0.4 + z * 0.6));

            // Layering sorting (higher z = closer to viewport = on top)
            cardNode.zIndex = Math.round(z * 1000);

            // Shadow size and opacity scaling
            const shadow = cardNode.getChildByName("shadow") as PIXI.Graphics;
            if (shadow) {
              shadow.alpha = 0.1 + z * 0.35;
              shadow.scale.set(1 / targetScale * (0.8 + z * 0.2));
            }

            // Glow border highlights
            const glow = cardNode.getChildByName("glow") as PIXI.Graphics;
            if (glow) {
              const isActive = Math.abs(diff) < 0.1;
              if (isActive) {
                // Pulsing cyan/blue glow border
                glow.alpha = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
                glow.stroke({ width: 3, color: itemsRef.current[index]?.themeColor || 0x3b82f6 });
              } else {
                glow.alpha = 0;
              }
            }
          });

          // Force stage children sorting based on zIndex
          cardsContainer.sortChildren();
        }
      };

      app.ticker.add(tickerCallback);
    }

    initPixi();

    return () => {
      active = false;
      if (app) {
        if (initialized) {
          app.destroy(true, { children: true });
        }
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[560px] bg-zinc-950/20 border border-zinc-800/40 rounded-3xl overflow-hidden backdrop-blur-sm select-none">
      
      {/* Luces sutiles de fondo (Glow radial effects) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Pixi Canvas Mounting div */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-zinc-500 tracking-wider">INITIALIZING CORE RENDERING GRAPHICS...</span>
        </div>
      )}
    </div>
  );
}
