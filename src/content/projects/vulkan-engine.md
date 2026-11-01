---
title: Vulkan Engine (WIP)
year: '2026'
summary: A custom C++ Vulkan graphics engine with deferred rendering, compute and basic lighting. Work in progress.
tags: [c++, vulkan, rendering]
video: /media/pp-deferred-engine.webm
poster: /media/pp-vulkan.png
order: 1
---

This page is WIP. Here, I'll show progress of my custom C++ Vulkan graphics engine.

## As of 26/05/10

I added:

- A LOT of Vulkan backend helper classes & functions
- Compute pipeline
- Present mode switching

![Vulkan backend](/media/pp-vkbackend.png)

## As of 26/05/15

I added:

- Basic lights (directional, spot, point) without shadows
- Basic transparency (discard with noise)
- KTX texture loading
- Simple Dear ImGui panels & info
- AgX tonemapping

## Sponza rendering tests

<video data-autoplay src="/media/pp-deferred-engine.webm" muted loop playsinline preload="metadata"></video>
