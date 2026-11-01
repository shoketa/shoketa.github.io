---
title: Interactive Water
year: '2025'
summary: A grimy lake-water material driven by Niagara render targets that ripple and clear moss around anything touching the surface.
tags: [unreal, niagara, hlsl]
video: /media/ptfl-water-rt-showcase.webm
poster: /media/ptfl-water.png
order: 2
---

Project time: ~4 weeks

## Project goal

My main goal for this project was to create something interactive using render targets. During that process, it naturally evolved into a water shader — I thought it would be a nice challenge to pair a good-looking water material with the interaction system.

*Environment assets and textures are from FAB.*

## Breakdown

*Graph overview of the entire project:*

<img class="theme-light" src="/media/ptfl-water-overview-graph-light.png" alt="Graph overview of the water project" />
<img class="theme-dark" src="/media/ptfl-water-overview-graph-dark.png" alt="Graph overview of the water project" />

Here's an overview of the entire system and how it works:

#### Interaction Blueprint

- Handles both render targets and their domains
- The water plane

#### Niagara System

- Creates render targets
- Simulates waves, trails, and normals over time

#### Water material

- Reads from RT to add normals
- Reads from RT to mask out grime and moss

---

### Niagara System breakdown

For the interaction system, I use two render targets. The first captures the state of each object intersecting with the water plane at that frame. The second takes the previous render target and generates normals, an edge mask, and an opacity mask in RGBA over time. It also converts its output to world space with domain wrapping.

| <img src="/media/ptfl-water-rt1.png" width="400" alt="Intersection RT" /> | <img src="/media/ptfl-water-rt2.png" width="400" alt="Wave RT" /> |
| --- | --- |
| Intersection RT | Wave RT |

*Overview of the Niagara System:*

![Niagara System overview](/media/ptfl-water-overview.png)

The Niagara System looks simple, but most of the complexity is under the hood. Both emitters use the same Initialize Module.

*Inside the Initialize Module:*

![Initialize Module](/media/ptfl-water-init-rt.png)

Here, I set the render target's parameters with a size multiplier for optional down/up scaling.

![Localizing the render target](/media/ptfl-water-localize.png)

In the "Draw RT" module, before drawing the render target, I use a Niagara Parameter Collection to set the render target's origin in Blueprint. I've also set it up so I can control how large of an area the interaction system covers with the scale parameter.

![Drawing to the render target](/media/ptfl-water-draw.png)

This is where I draw to the render target. Using Niagara's built-in Rigid Mesh Query, I can get the closest point on a mesh to the water plane along with its velocity, and write the result to the render target.

---

*Wave RT emitter:*

![Wave RT emitter](/media/ptfl-water-wave-emitter.png)

The Wave RT emitter is similar but with a few extra steps, namely the Grid2D Buffer setup. It creates a feedback loop that feeds the previous frame's data into the current one.

*Inside the Draw Wave Module:*

![Undoing the localization](/media/ptfl-water-undo-localization.png)

Inside the Draw Wave module, I undo the localization set from the first render target.

<video data-autoplay src="/media/ptfl-water-render-targets.webm" muted loop playsinline preload="metadata"></video>

Left is un-localized, right is localized.

The reason for undoing the localization in the Wave RT is to achieve domain wrapping. This lets me simply sample the render target without constantly offsetting it. It also helps with blending out when objects move out of bounds.

---

### Water material breakdown

*Overview of the material:*

![Water material overview](/media/ptfl-water-material-showcase.png)

For the water material, I created a few different layers to really sell the grimy lake water look. The water uses Unreal's Single Layer Water as a base with two layers on top. I also use material attributes to keep track of each layer's textures and streamline blending them.

Since I use Single Layer Water, I don't have to calculate scattering, absorption, etc. myself. But I still need to handle the water normals.

*Water direction & UVs:*

![Water normal direction and UVs](/media/ptfl-water-normal-direction.png)

<video data-autoplay src="/media/ptfl-water-normal-showcase.webm" muted loop playsinline preload="metadata"></video>

For the water normals, I created a high-frequency and a low-frequency normal texture in Substance Designer. Both use world-position-based UVs and pan with their own directions, set as vector parameters in the material.

*Normal blending and RT normal reconstruction:*

![Normal blending](/media/ptfl-water-normal-blending.png)

Here, I sample the two water normals with the UVs I created earlier, then blend them together. The blend node is a custom HLSL snippet that combines the normals at correct angles using dot product.

RT Normal Reconstruction takes the RG channels of the render target and reconstructs a normal map from them.

*The two normal maps:*

| <img src="/media/T_Water_HF_N.jpg" width="400" alt="High frequency normal texture" /> | <img src="/media/T_Water_LF_N.jpg" width="400" alt="Low frequency normal texture" /> |
| --- | --- |
| High frequency normal texture | Low frequency normal texture |

## If I had more time...

Researching this topic and getting a working prototype took longer than I expected, so I didn't have enough time for the water simulation I originally wanted. If I had more time, I would've expanded the interaction system with:

1. A proper wave propagation system
2. Landscape integration (instead of planes)
3. Foliage interaction using landscape integration
