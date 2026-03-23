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

// Convert Obsidian wiki-image/video syntax, using placeholders for videos so
// marked never wraps <video> in <p> tags (it doesn't treat video as block-level).
const VIDEO_EXTS = /\.(mp4|webm|ogg|mov)$/i;
const videoBlocks = [];

// Regex captures: ![[darkFile / lightFile|width]] or ![[file|width]]
const normalised = mdText.replace(/!\[\[([^\]|/]+?)(?:\s*\/\s*([^\]|]+?))?\s*(?:\\?\|(\d+))?\]\]/g, (_, file, lightFile, width) => {
  file = file.trim().replace(/\\$/, '');
  if (lightFile) {
    lightFile = lightFile.trim().replace(/\\$/, '');
    const sizeAttr = width ? ` style="width:${width}px"` : '';
    return `<span class="theme-img-pair">`
         + `<img src="/images/${file}" alt="${file}" class="theme-img-dark"${sizeAttr}>`
         + `<img src="/images/${lightFile}" alt="${lightFile}" class="theme-img-light"${sizeAttr}>`
         + `</span>`;
  }
  if (VIDEO_EXTS.test(file)) {
    const style = width ? ` style="width:${width}px"` : '';
    const tag = `<video src="/videos/${file}" autoplay loop muted playsinline${style}></video>`;
    videoBlocks.push(tag);
    return `VIDPLACEHOLDER${videoBlocks.length - 1}`;
  }
  const sizeAttr = width ? ` style="width:${width}px"` : '';
  return `<img src="/images/${file}" alt="${file}"${sizeAttr}>`;
});

let html = marked.parse(normalised);
videoBlocks.forEach((tag, i) => { html = html.replaceAll(`VIDPLACEHOLDER${i}`, tag); });

const contentEl = document.getElementById('project-content');
contentEl.innerHTML = html;

// Lightbox
const overlay = document.createElement('div');
overlay.id = 'lightbox';
overlay.innerHTML = '<img id="lightbox-img"><video id="lightbox-video" controls playsinline></video><span id="lightbox-close">✕</span>';
document.body.appendChild(overlay);

const lbImg       = document.getElementById('lightbox-img');
const lbVideo     = document.getElementById('lightbox-video');
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

function lbShowImg(src) {
  lbImg.src = src;
  lbImg.style.display = '';
  lbVideo.style.display = 'none';
  lbVideo.pause();
  lbScale = 1; lbPanX = 0; lbPanY = 0;
  lbApply(false);
  overlay.classList.add('open');
}

function lbShowVideo(src) {
  lbVideo.src = src;
  lbVideo.style.display = '';
  lbImg.style.display = 'none';
  overlay.classList.add('open');
}

function lbClose() {
  overlay.classList.remove('open');
  lbVideo.pause();
  lbVideo.src = '';
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
    const isLight = document.documentElement.classList.contains('light');
    if (img.classList.contains('theme-img-dark')  &&  isLight) return;
    if (img.classList.contains('theme-img-light')  && !isLight) return;
    e.stopPropagation();
    lbShowImg(img.src);
  });
});

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => e.isIntersecting ? e.target.play() : e.target.pause());
}, { threshold: 0.1 });

contentEl.querySelectorAll('video').forEach(vid => {
  vid.style.cursor = 'zoom-in';
  vid.addEventListener('click', e => { e.stopPropagation(); lbShowVideo(vid.src); });
  videoObserver.observe(vid);
});
