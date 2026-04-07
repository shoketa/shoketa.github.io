import { marked } from 'marked';

// Support clean URLs: /project/water-shader
// On GitHub Pages, 404.html redirects to /project.html and stashes the original path.
const redirectPath = sessionStorage.getItem('spa-redirect');
if (redirectPath) sessionStorage.removeItem('spa-redirect');

const pathname = redirectPath || location.pathname;
const id = pathname.replace(/\/$/, '').split('/').pop();

// Rewrite URL bar to clean path if we landed on /project.html
if (id && location.pathname === '/project.html') {
  history.replaceState(null, '', '/project/' + id);
}

if (!id || id === 'project.html') {
  document.getElementById('project-title').textContent = 'Project not found.';
  throw new Error('No id param');
}

let [projects, mdText] = await Promise.all([
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

const VIDEO_EXTS = /\.(mp4|webm|ogg|mov)$/i;

// Extract #hero![[file]] from markdown if present
let heroFile = null;
const heroMatch = mdText.match(/^#hero!\[\[([^\]]+)\]\]\s*$/m);
if (heroMatch) {
  heroFile = heroMatch[1].trim();
  mdText = mdText.replace(heroMatch[0], '').replace(/^\n/, '');
}

const heroSlot = document.getElementById('hero-slot');
if (heroFile) {
  if (VIDEO_EXTS.test(heroFile)) {
    const vid = document.createElement('video');
    vid.src = `/videos/${heroFile}`;
    vid.autoplay = true; vid.loop = true; vid.muted = true; vid.playsInline = true;
    vid.className = 'project-hero';
    heroSlot.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = `/images/${heroFile}`;
    img.alt = project?.title ?? '';
    img.className = 'project-hero';
    heroSlot.appendChild(img);
  }
} else if (project?.image) {
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
const videoBlocks = [];

// Regex captures: ![[darkFile / lightFile#l|width]] or ![[file#r|width]]
// #l = left-align, #r = right-align (default is centered)
const normalised = mdText.replace(/!\[\[([^\]|/#]+?)(?:\s*\/\s*([^\]|#]+?))?\s*(#[lr])?\s*(?:\\?\|(\d+))?\]\]/g, (_, file, lightFile, align, width) => {
  file = file.trim().replace(/\\$/, '');
  const alignStyle = align === '#l' ? 'float:left;margin:0 20px 12px 0'
                   : align === '#r' ? 'float:right;margin:0 0 12px 20px'
                   : '';

  if (lightFile) {
    lightFile = lightFile.trim().replace(/\\$/, '');
    const wrapStyles = [width ? `max-width:${width}px` : '', alignStyle].filter(Boolean).join(';');
    return `<span class="theme-img-pair"${wrapStyles ? ` style="${wrapStyles}"` : ''}>`
         + `<img src="/images/${file}" alt="${file}" class="theme-img-dark">`
         + `<img src="/images/${lightFile}" alt="${lightFile}" class="theme-img-light">`
         + `</span>`;
  }

  const styles = [width ? `max-width:${width}px` : '', alignStyle].filter(Boolean).join(';');
  const styleAttr = styles ? ` style="${styles}"` : '';

  if (VIDEO_EXTS.test(file)) {
    const tag = `<video src="/videos/${file}" autoplay loop muted playsinline${styleAttr}></video>`;
    videoBlocks.push(tag);
    return `VIDPLACEHOLDER${videoBlocks.length - 1}`;
  }
  return `<img src="/images/${file}" alt="${file}"${styleAttr}>`;
});

let html = marked.parse(normalised);
videoBlocks.forEach((tag, i) => { html = html.replaceAll(`VIDPLACEHOLDER${i}`, tag); });
html = html.replace(/<p>\s*<\/p>/g, '<div class="spacer"></div>');
html = html.replace(/<a href="/g, '<a target="_blank" rel="noopener noreferrer" href="');

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
  lbVideo.style.display = 'block';
  lbImg.style.display = 'none';
  overlay.classList.add('open');
  lbVideo.play();
}

function lbClose() {
  overlay.classList.remove('open');
  lbVideo.pause();
  lbVideo.style.display = 'none';
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
  vid.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); lbShowVideo(vid.src); });
  videoObserver.observe(vid);
});
