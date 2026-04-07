import { marked } from 'marked';

const toWebp = src => src.replace(/\.(png|jpe?g)$/i, '.webp');

function buildCard(project) {
  const card = document.createElement('a');
  card.className = 'project-card';
  card.href = project.link || '#';

  if (project.image) {
    const pic = document.createElement('picture');
    const source = document.createElement('source');
    source.srcset = toWebp(project.image);
    source.type = 'image/webp';
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    pic.appendChild(source);
    pic.appendChild(img);
    card.appendChild(pic);
  } else {
    const bg = document.createElement('div');
    bg.style.cssText = `position:absolute;inset:0;background:${project.gradient || '#1a1a1a'}`;
    card.appendChild(bg);
  }

  const label = document.createElement('div');
  label.className = 'project-label';
  label.textContent = project.title;
  card.appendChild(label);

  card.addEventListener('click', e => {
    e.preventDefault();
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg);opacity:0;transition:opacity 0.4s ease;pointer-events:none;display:flex;align-items:center;justify-content:center;';
    const spinner = document.createElement('img');
    spinner.src = '/images/icon-transparent.png';
    spinner.className = 'overlay-spinner';
    ov.appendChild(spinner);
    document.body.appendChild(ov);
    ov.getBoundingClientRect();
    ov.style.opacity = '1';
    ov.addEventListener('transitionend', () => { window.location.href = card.href; }, { once: true });
  });

  return card;
}

async function loadPortfolio() {
  let projects;
  try {
    projects = await fetch('/data/projects.json').then(r => r.json());
  } catch (err) {
    console.error('[portfolio-loader]', err);
    return;
  }

  const grids = {
    portfolio: document.getElementById('portfolio-grid'),
    game:      document.getElementById('game-grid'),
    personal:  document.getElementById('personal-grid'),
  };

  for (const [section, grid] of Object.entries(grids)) {
    if (!grid) continue;
    if (section !== 'portfolio') grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    projects.filter(p => p.section === section).forEach(p => grid.appendChild(buildCard(p)));
  }

  const aboutEl = document.getElementById('about-content');
  if (aboutEl) {
    try {
      const res = await fetch('/content/about.md');
      if (res.ok) aboutEl.innerHTML = marked.parse(await res.text());
    } catch (_) {}
  }
}

loadPortfolio();
