

### Project Goal
My main goal for this project was to create something interactive using render targets. During that process, I sort of flowed into a water shader because I thought it would a nice challenge to both create a good-looking water shader along with the interaction system.

# Breakdown

## Breakdown Overview
*Environment assets and textures are from FAB*
![[ptfl-water-rt-showcase.webm]]


*Graph overview of the entire project:*
![[ptfl-water-overview-graph.png]]

Here's an overview of the entire system and how it works:
#### Interaction Blueprint
*  Handles both render targets and their domains
*  The water plane

#### Niagara System
* Creates Render Targets
* Simulates Waves, Trails & Normals over time

#### Water Material
* Reads from RT to add normals
* Reads from RT to mask out grime and moss.
 
 
---


### Niagara System Breakdown
For the interaction system, I use two render targets, one uses the state of each object intersecting with the water plane at that frame, and the other uses the previous render target to generate normals, edge and a mask in RGBA respectively over time. The secondary render target also converts it's output as world space with domain wrapping.

| ![[ptfl-water-rt1.png\|400]] | ![[ptfl-water-rt2.png\|400]] |
| ---------------------------- | ---------------------------- |
| Intersection RT              | Wave RT                      |


*Overview of the Niagara System:*
![[ptfl-water-overview.png]]

Here's an overview of the Niagara System. It looks simple but everything lies under the hood. Both emitters use the same Initialize Module

*Inside the Initialize Module:*
![[ptfl-water-init-rt.png]]

Here, I set the render target's parameters with a size multiplier for optional down/up scaling.

![[ptfl-water-localize.png]]

In the "Draw RT" Module, before I actually draw the render target I chose to use a Niagara Parameter Collection to set the render target's origin in blueprint. I've also set it up so I can choose how big the area the interaction system affects with the scale parameter.

![[ptfl-water-draw.png]]

This is where I actually draw to the render target. Using Niagara's built-in Rigid Mesh Query, I can get the closest point of a mesh and it's velocity to the water plane and write the value to the render target.

---


*Wave RT Emitter:*
![[ptfl-water-wave-emitter.png]]

The Wave RT emitter is similar but with a few extra steps. Namely, the Grid2D Buffer setup. It creates somewhat like a feedback loop for the niagara system to feed the previous frames data to the current.

*Inside the Draw Wave Module:*
![[ptfl-water-undo-localization.png]]

Inside the draw wave module, I undo the localization set from the first render target.

## Water Material Breakdown
For the water material, I decided to create a few different layers to really sell the grimey lake water look. The water is using Unreal's Single Layer Water as a base with 2 layers on top. I am also using material attributes to streamline the process of blending multiple layers.

*Overview of the Material:*
![[ptfl-water-material-overview.png]]

Since, I am using Single Layer Water, I don't have to calculate scattering, absorption, etc. myself. But I still need to handle the water normals.

*Overview of water normal:*
![[ptfl-water-normal.png]]

| ![[T_Water_HF_N.jpg\|400]]    | ![[T_Water_LF_N.jpg\|400]]   |
| ----------------------------- | ---------------------------- |
| High Frequency Normal Texture | Low Frequency Normal Texture |

*Water Direction & UVs:*
![[ptfl-water-normal-direction.png]]
![[ptfl-water-normal-showcase.webm]]
For the water normals, I created a high-frequency and a low-frequency normal texture in Substance Designer. These two will be using World Position based UVs and also be panning with their own directions set as vector parameters in the material. 


*Normal Blending and RT Normal Reconstruction:*
![[ptfl-water-normal-blending.png]]

Here, I just sample the two water normals with the UVs I created earlier then blend them together. The blend node is custom hlsl code snippet that blends the normals with correct angles using dot product. 

RT Normal Reconstruction just takes the RG channels of the Render Target and makes a normal map out of it. 




## If I had more time...
Researching this topic and getting a working prototype took longer than I expected so I didn't have enough time for the water simulation that I wanted. If I had more time, I probably would've tried to do more with the interaction system, for e.g a realistic wave propagation system similar to the fluid simulation from Unreal Engine's Content Examples.


## Sources
- Lorem ipsum
- Lorem ipsum
- Lorem ipsum
- Lorem ipsum
- Lorem ipsum
