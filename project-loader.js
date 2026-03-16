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

document.getElementById('project-content').innerHTML = marked.parse(mdText);
