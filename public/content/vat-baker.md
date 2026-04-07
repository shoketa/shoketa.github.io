##### Project Time: 1 week

# Project Goal
My main goal for this project was to build a tool for creating and exporting Vertex Animation Textures in Blender. It was also a great learning exercise that deepened my understanding of how VATs work.

*Visualization of the Vertex Animation Texture:*
![[ptfl-vat-baker-debug-showcase.webm]]
# Breakdown

*Graph Overview:*
![[ptfl-vat-baker-overview-graph-dark.png / ptfl-vat-baker-overview-graph-light.png]]

### Tool Breakdown
![[ptfl-vat-baker.webm]]

The tool works in 3 stages:

#### Mesh Capture
* Makes a copy of the mesh at that frame
* Captures every vertex position

#### UV Set
* Stores every vertex in a new UV set
* Orders them in a single-file line at the top of the UV

#### Export Textures
* Creates a texture
* Writes the captured values to it

*Properties panel:*
![[ptfl-vat-baker-properties.png#l|360]]

Given the time I set for this project, I chose to keep the panel simple. Most settings are QoL, but the most important one is:

#### Bounding Box Scale
During mesh capture, I have to remap position and normal values to 0–1 since PNGs don't support negative values. Bounding Box Scale divides all positional values before they get remapped. Think of it as a bounding box around the object's origin — everything inside is captured.

---

### Unreal Material Breakdown

*Visualization of how the VAT shader works:*
![[ptfl-vat-baker-uv-showcase.webm]]

![[ptfl-vat-baker-material-uv.png]]

This section calculates which frame of the animation to use at a given time, with input parameters for the vertex animation's frame count, FPS, and an optional frame offset. I've also set up a switch for whether the texture is packed or not.

![[ptfl-vat-baker-material-sample.png]]

Here, I sample the texture, remap it to -1 to 1, then multiply by the bounding box scale to get the proper values. Lastly, I plug it into World Position Offset.

# If I Had More Time...
I would probably use a better approach for bounding box scale — for example, calculating the mesh's bounding box each frame and storing it as a "Max Scale" and "Min Scale" value for a more user-friendly experience.
