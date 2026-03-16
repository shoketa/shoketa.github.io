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
// ![[file.png]]       →  ![file.png](/images/file.png)
// ![[file.png|352]]   →  <img src="/images/file.png" alt="file.png" width="352">
const normalised = mdText.replace(/!\[\[([^\]|]+)(?:\|(\d+))?\]\]/g, (_, file, width) =>
  width
    ? `<img src="/images/${file}" alt="${file}" style="width:${width}px">`
    : `![${file}](/images/${file})`
);

document.getElementById('project-content').innerHTML = marked.parse(normalised);
