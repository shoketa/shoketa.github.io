import { marked } from 'marked';

function buildCard(project) {
  const card = document.createElement('a');
  card.className = 'project-card';
  card.href = project.link || '#';

  if (project.image) {
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    card.appendChild(img);
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
    ov.dataset.navOverlay = '1';
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
    projects.filter(p => p.section === section).forEach(p => grid.appendChild(buildCard(p)));
  }

  const aboutEl = document.getElementById('about-content');
  if (aboutEl) {
    try {
      const res = await fetch('/content/about.md');
      if (res.ok) {
        const normalised = (await res.text()).replace(/!\[\[([^\]|/#]+?)\s*(#[lr])?\s*(?:\|(\d+))?\]\]/g, (_, file, align, width) => {
          file = file.trim();
          const alignStyle = align === '#l' ? 'float:left;margin:0 20px 12px 0'
                           : align === '#r' ? 'float:right;margin:0 0 12px 20px'
                           : '';
          const styles = [alignStyle, width ? `max-width:${width}px` : ''].filter(Boolean).join(';');
          const styleAttr = styles ? ` style="${styles}"` : '';
          return `<img src="/images/${file}" alt="${file}"${styleAttr}>`;
        });
        aboutEl.innerHTML = marked.parse(normalised);
      }
    } catch (_) {}
  }
}

loadPortfolio();
