---
title: VAT Baker
year: '2025'
summary: A Blender tool that bakes and exports Vertex Animation Textures, plus the Unreal material that plays them back.
tags: [blender, python, unreal, tools]
video: /media/ptfl-vat-baker-debug-showcase.webm
poster: /media/ptfl-vatbaker.png
order: 5
---

Project time: 1 week

## Project goal

My main goal for this project was to build a tool for creating and exporting Vertex Animation Textures in Blender. It was also a great learning exercise that deepened my understanding of how VATs work.

The clip above visualizes the Vertex Animation Texture.

## Breakdown

*Graph overview:*

<img class="theme-light" src="/media/ptfl-vat-baker-overview-graph-light.png" alt="Graph overview of the VAT Baker" />
<img class="theme-dark" src="/media/ptfl-vat-baker-overview-graph-dark.png" alt="Graph overview of the VAT Baker" />

### Tool breakdown

<video data-autoplay src="/media/ptfl-vat-baker.webm" muted loop playsinline preload="metadata"></video>

The tool works in 3 stages:

#### Mesh capture

- Makes a copy of the mesh at that frame
- Captures every vertex position

#### UV set

- Stores every vertex in a new UV set
- Orders them in a single-file line at the top of the UV

#### Export textures

- Creates a texture
- Writes the captured values to it

*Properties panel:*

<img src="/media/ptfl-vat-baker-properties.png" width="360" alt="VAT Baker properties panel" />

Given the time I set for this project, I chose to keep the panel simple. Most settings are QoL, but the most important one is:

#### Bounding box scale

During mesh capture, I have to remap position and normal values to 0–1 since PNGs don't support negative values. Bounding Box Scale divides all positional values before they get remapped. Think of it as a bounding box around the object's origin — everything inside is captured.

---

### Unreal material breakdown

*Visualization of how the VAT shader works:*

<video data-autoplay src="/media/ptfl-vat-baker-uv-showcase.webm" muted loop playsinline preload="metadata"></video>

![Material graph: frame selection](/media/ptfl-vat-baker-material-uv.png)

This section calculates which frame of the animation to use at a given time, with input parameters for the vertex animation's frame count, FPS, and an optional frame offset. I've also set up a switch for whether the texture is packed or not.

![Material graph: texture sampling](/media/ptfl-vat-baker-material-sample.png)

Here, I sample the texture, remap it to -1 to 1, then multiply by the bounding box scale to get the proper values. Lastly, I plug it into World Position Offset.

## If I had more time...

I would probably use a better approach for bounding box scale — for example, calculating the mesh's bounding box each frame and storing it as a "Max Scale" and "Min Scale" value for a more user-friendly experience.
