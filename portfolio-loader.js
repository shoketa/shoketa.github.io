import { marked } from 'marked';
import { createScene } from './sidebar-scene.js';

/**
 * portfolio-loader.js
 * Fetches /data/projects.json and renders project cards into
 * #portfolio-grid, #game-grid, and #personal-grid.
 * Also fetches /content/about.md and renders it into #about-content.
 *
 * JSON schema per entry:
 *   id       {string}  unique identifier
 *   title    {string}  card label text
 *   section  {string}  "portfolio" | "game" | "personal"
 *   image    {string|null}  path to thumbnail image, or null for gradient bg
 *   gradient {string}  CSS gradient used when image is null
 *   link     {string}  href for the card (use "#" as placeholder)
 */

function buildCard(project, delay) {
  const card = document.createElement('a');
  card.className = 'project-card fade-in';
  card.href = project.link || '#';
  card.style.animationDelay = `${delay}s`;

  if (project.image) {
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    card.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: ${project.gradient || '#1a1a1a'};
    `;
    card.appendChild(placeholder);
  }

  const label = document.createElement('div');
  label.className = 'project-label';
  label.textContent = project.title;
  card.appendChild(label);

  // Tilt effect — only active after fade-in completes
  const MAX_TILT = 4;
  let tiltReady = false;

  card.addEventListener('animationend', () => {
    card.style.animation = 'none';
    card.style.opacity = '1';
    card.style.transform = 'none';
    tiltReady = true;
  }, { once: true });

  let tracking = false;
  let hovered = false;
  card.addEventListener('mouseenter', () => {
    if (!tiltReady) return;
    hovered = true;
    tracking = false;
    card.style.zIndex = '10';
    card.style.transition = 'transform 0.35s ease';
    card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1.06)';
  });
  card.addEventListener('transitionend', () => {
    if (!tiltReady || !hovered) return;
    tracking = true;
    card.style.transition = 'none';
  });
  card.addEventListener('mousemove', e => {
    if (!tiltReady || !tracking) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${-y * MAX_TILT}deg) rotateY(${x * MAX_TILT}deg) scale(1.06)`;
  });
  card.addEventListener('mouseleave', () => {
    if (!tiltReady) return;
    hovered = false;
    tracking = false;
    card.style.transition = 'transform 0.4s ease';
    card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.zIndex = '';
  });

  return card;
}

async function loadPortfolio() {
  let projects;

  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw new Error(`Failed to load projects.json (${res.status})`);
    projects = await res.json();
  } catch (err) {
    console.error('[portfolio-loader]', err);
    return;
  }

  const portfolioGrid = document.getElementById('portfolio-grid');
  const gameGrid      = document.getElementById('game-grid');
  const personalGrid  = document.getElementById('personal-grid');

  const portfolioItems = projects.filter(p => p.section === 'portfolio');
  const gameItems      = projects.filter(p => p.section === 'game');
  const personalItems  = projects.filter(p => p.section === 'personal');

  portfolioItems.forEach((p, i) => {
    portfolioGrid?.appendChild(buildCard(p, 0.1 + i * 0.05));
  });

  if (gameGrid) gameGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  gameItems.forEach((p, i) => {
    gameGrid?.appendChild(buildCard(p, 0.1 + i * 0.05));
  });

  if (personalGrid) personalGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  personalItems.forEach((p, i) => {
    personalGrid?.appendChild(buildCard(p, 0.1 + i * 0.05));
  });

  const aboutEl = document.getElementById('about-content');
  if (aboutEl) {
    try {
      const res = await fetch('/content/about.md');
      if (res.ok) aboutEl.innerHTML = marked.parse(await res.text());
    } catch (err) {
      console.error('[portfolio-loader] about.md', err);
    }
  }
}

loadPortfolio();

// Flip card: delayed flip + lazy scene init
const flipCard = document.querySelector('.flip-card');
const aboutScene = document.getElementById('about-scene');
if (flipCard && aboutScene) {
  let flipTimer = null;
  let sceneInited = false;

  flipCard.addEventListener('mouseenter', () => {
    flipTimer = setTimeout(() => {
      flipCard.classList.add('flipped');
      if (!sceneInited) { sceneInited = true; createScene(aboutScene); }
    }, 1000);
  });

  flipCard.addEventListener('mouseleave', () => {
    clearTimeout(flipTimer);
    flipCard.classList.remove('flipped');
  });
}
