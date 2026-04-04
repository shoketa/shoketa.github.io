![[ptfl-vat-baker.webm]]
### Project Goal
My main goal for this project was to create a nice way to create and export Vertex Animation Textures in Blender. This was originally an idea I got when our group was working on game project 5: Blood and Gold.
# Breakdown
The tool works in 3 stages:
#### Mesh Capture
* Makes a copy of a given mesh in that frame
* Captures every vertex in that frame

#### UV set
* Saves every vertex in a new UV set
* Orders them in a single-file line at the top of the UV

#### Export Textures
* Create a Texture
* Apply captured values to the texture

---

Visualization of the Vertex Animation Texture:
![[ptfl-vat-baker-debug-showcase.webm]]
Each color represents it's offset from the first frame.