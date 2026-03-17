

### Project Goal
My main goal for this project was to create something interactive using render targets. During that process, I sort of flowed into a water shader because I thought it would a nice challenge to both create a good-looking water shader along with the interaction system.

# Breakdown

### Niagara System Breakdown
For the interaction system, I use two render targets, one uses the state of each object intersecting with the water plane at that frame, and the other uses the previous render target to generate normals, waves and a mask in RGBA respectively over time. The secondary render target also converts it's output as world space with domain wrapping.
![[ptfl-water-rt-showcase.mp4]]

| ![[ptfl-water-rt1.png\|400]] | ![[ptfl-water-rt2.png\|400]] |
| ---------------------------- | ---------------------------- |
| Intersection RT              | Wave RT                      |

*Overview of the System:*
![[ptfl-water-overview.png]]

Here's an overview of the Niagara System. It looks simple but everything lies under the hood. Both emitters use the same Initialize Module

*Inside the Initialize Module:*
![[ptfl-water-init-rt.png]]

Here, I set the render target's parameters with a size multiplier for optional down/up scaling.

![[ptfl-water-localize.png]]

In the "Draw RT" Module, before I actually draw the render target I chose to use a Niagara Parameter Collection to set the render target's origin in blueprint. I've also set it up so I can choose how big the area the interaction system affects with the scale parameter.

![[ptfl-water-draw.png]]

This is there I actually draw to the render target. Using Niagara's built-in Rigid Mesh Query, I can get the closest point of a mesh to the water plane and write the value to the render target.

### Water Material Breakdown
For the water material, I decided to create a few different layers

## If I had more time...
Researching this topic and getting a working prototype took longer than I expected so I didn't have enough time for the water simulation that I wanted. If I had more time, I probably would've tried to do more with the interaction system, for e.g a realistic wave propagation system similar to the fluid simulation from Unreal Engine's Content Examples.


## Sources
- Lorem ipsum
- Lorem ipsum
- Lorem ipsum
- Lorem ipsum
- Lorem ipsum
