import { marked } from 'marked';

const id = new URLSearchParams(location.search).get('id');

if (!id) {
  document.getElementById('project-title').textContent = 'Project not found.';
  throw new Error('No id param');
}

const [projects, mdText] = await Promise.all([
  fetch('/data/projects.json').then(r => r.json()),
  fetch(`/content/${id}.md`).then(r => {
    if (!r.ok) throw new Error(`No content for "${id}"`);
    return r.text();
  })
]);

const project = projects.find(p => p.id === id);

const titleEl = document.getElementById('project-title');
titleEl.textContent = project?.title ?? id;
document.title = `${titleEl.textContent} — Allen Velazco`;

const heroSlot = document.getElementById('hero-slot');
if (project?.image) {
  const img = document.createElement('img');
  img.src = project.image;
  img.alt = project.title;
  img.className = 'project-hero fade-in';
  heroSlot.appendChild(img);
} else if (project?.gradient) {
  const div = document.createElement('div');
  div.className = 'project-hero-placeholder fade-in';
  div.style.background = project.gradient;
  heroSlot.appendChild(div);
}

// Convert Obsidian wiki-image syntax
// ![[file.mp4]]       →  <video> element from /videos/
// ![[file.png]]       →  ![file.png](/images/file.png)
// ![[file.png|352]]   →  <img src="/images/file.png" alt="file.png" width="352">
const VIDEO_EXTS = /\.(mp4|webm|ogg|mov)$/i;
const normalised = mdText.replace(/!\[\[([^\]|]+)(?:\|(\d+))?\]\]/g, (_, file, width) => {
  file = file.replace(/\\$/, ''); // strip trailing backslash Obsidian adds to \| inside table cells
  if (VIDEO_EXTS.test(file)) {
    const style = width ? ` style="width:${width}px"` : '';
    return `<video src="/videos/${file}" autoplay loop muted playsinline${style}></video>`;
  }
  const sizeAttr = width ? ` style="width:${width}px"` : '';
  return `<img src="/images/${file}" alt="${file}"${sizeAttr}>`;
});

const contentEl = document.getElementById('project-content');
contentEl.innerHTML = marked.parse(normalised);

// Lightbox
const overlay = document.createElement('div');
overlay.id = 'lightbox';
overlay.innerHTML = '<img id="lightbox-img"><span id="lightbox-close">✕</span>';
document.body.appendChild(overlay);

const lbImg       = document.getElementById('lightbox-img');
const lbCloseBtn  = document.getElementById('lightbox-close');
const ZOOM_LEVELS = [1, 2, 3];

let lbScale = 1, lbPanX = 0, lbPanY = 0;
let lbDragging = false, lbDragMoved = false;
let lbStartX = 0, lbStartY = 0;

function lbApply(animate) {
  lbImg.style.transition = animate ? 'transform 0.2s ease' : 'none';
  lbImg.style.transform  = `translate(${lbPanX}px, ${lbPanY}px) scale(${lbScale})`;
  lbImg.style.cursor     = lbScale > 1 ? 'grab' : 'zoom-in';
}

function lbClose() {
  overlay.classList.remove('open');
  lbScale = 1; lbPanX = 0; lbPanY = 0;
  lbApply(false);
}

lbCloseBtn.addEventListener('click', e => { e.stopPropagation(); lbClose(); });
overlay.addEventListener('click', e => { if (e.target === overlay) lbClose(); });

// Zoom on click (skip if drag occurred)
lbImg.addEventListener('click', e => {
  if (lbDragMoved) return;
  e.stopPropagation();
  const idx = ZOOM_LEVELS.indexOf(lbScale);
  lbScale = ZOOM_LEVELS[(idx + 1) % ZOOM_LEVELS.length];
  if (lbScale === 1) { lbPanX = 0; lbPanY = 0; }
  lbApply(true);
});

// Pan drag
lbImg.addEventListener('mousedown', e => {
  e.preventDefault();
  lbDragging = true; lbDragMoved = false;
  lbStartX = e.clientX - lbPanX;
  lbStartY = e.clientY - lbPanY;
  lbImg.style.cursor     = 'grabbing';
  lbImg.style.transition = 'none';
});
window.addEventListener('mousemove', e => {
  if (!lbDragging) return;
  const nx = e.clientX - lbStartX, ny = e.clientY - lbStartY;
  if (Math.abs(nx - lbPanX) > 2 || Math.abs(ny - lbPanY) > 2) lbDragMoved = true;
  lbPanX = nx; lbPanY = ny;
  lbImg.style.transform = `translate(${lbPanX}px, ${lbPanY}px) scale(${lbScale})`;
});
window.addEventListener('mouseup', () => {
  if (!lbDragging) return;
  lbDragging = false;
  lbImg.style.cursor = lbScale > 1 ? 'grab' : 'zoom-in';
});

contentEl.querySelectorAll('img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', e => {
    e.stopPropagation();
    lbImg.src = img.src;
    lbScale = 1; lbPanX = 0; lbPanY = 0;
    lbApply(false);
    overlay.classList.add('open');
  });
});
