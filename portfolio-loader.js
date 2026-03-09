/**
 * portfolio-loader.js
 * Fetches /data/projects.json and renders project cards into
 * #portfolio-grid and #game-grid.
 *
 * JSON schema per entry:
 *   id       {string}  unique identifier
 *   title    {string}  card label text
 *   section  {string}  "portfolio" | "game"
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
  const gameGrid = document.getElementById('game-grid');

  const portfolioItems = projects.filter(p => p.section === 'portfolio');
  const gameItems      = projects.filter(p => p.section === 'game');

  portfolioItems.forEach((p, i) => {
    portfolioGrid?.appendChild(buildCard(p, 0.1 + i * 0.05));
  });

  gameItems.forEach((p, i) => {
    gameGrid?.appendChild(buildCard(p, 0.1 + i * 0.05));
  });
}

loadPortfolio();
