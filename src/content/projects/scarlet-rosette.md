---
title: Scarlet Rosette
year: '2025'
summary: VFX, a Houdini silk-veil tool and atmospherics for a boss-intro cinematic.
tags: [unreal, vfx, houdini, embergen]
video: /media/ptfl-scarlet-showcase.webm
poster: /media/ptfl-scarlet.png
order: 3
---

Project time: ~4 weeks

I made this project in collaboration with my fellow TGA student and friend from Animation, [Sharon Chao](https://sharonchao.me). I thought her character looked awesome and had a lot of potential, so I offered to elevate the cinematic with VFX and environmental effects.

## Project goal

Our idea was to create a boss cinematic intro akin to games like Elden Ring. I made various visual effects befitting her character's aesthetic and vibe.

Effects and tools I contributed:

- Silk Veil Houdini Tool
- Mist VFX
- Fire Step VFX
- Environment Lighting & Atmospherics

## Breakdown

### Silk Veil Houdini Tool

I created this tool because the scene felt empty even with nice lighting. I was mainly inspired by the veils in Elden Ring: Shadow of the Erdtree's Messmer boss and La La Barina from Monster Hunter: Wilds.

<video data-autoplay src="/media/ptfl-scarlet-cloth.mp4" muted loop playsinline preload="metadata"></video>

I first use a curve spline input to define two anchor points where the veil hangs from, then create a middle point and droop it downward.

<video data-autoplay src="/media/ptfl-scarlet-cloth-houdini.webm" muted loop playsinline preload="metadata"></video>

After that, I assign vertex colors based on each point's proximity to the middle. This lets me displace the silk in a shader. I then use sweep to generate the geometry, which gets simulated using Vellum Cloth Physics. Lastly, I "bake" a frame using timestep and send it to output.

---

### Mist VFX

<video data-autoplay src="/media/ptfl-scarlet-mist.mp4" width="400" muted loop playsinline preload="metadata"></video>

The mist is an environmental VFX that adds ambiance to the character's entrance and exit. It's composed of two main parts:

#### Mist

- Flipbook texture baked in EmberGen
- Fade in/out

#### Confetti

- A simple plane with aerodynamic drag

---

### Fire Step VFX

<video data-autoplay src="/media/ptfl-scarlet-firestep.mp4" width="400" muted loop playsinline preload="metadata"></video>

For this effect, we wanted a dramatic close-up look for when the camera zooms in on the character's shoes. To match her mysterious, phoenix-like appearance, I made a fire footstep effect. It's composed of two main parts:

#### Fire poof

- Three different flame flipbooks packed in one texture, also baked in EmberGen
- Uses a custom-made flipbook material function for frame blending

#### Flame ring

- A simple panning texture with erosion, created in Substance Designer
