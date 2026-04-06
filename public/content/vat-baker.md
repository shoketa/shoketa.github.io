*Visualization of the Vertex Animation Texture:*
![[ptfl-vat-baker-debug-showcase.webm]]
##### Project Time: 1 week

### Project Goal
My main goal for this project was to create a nice way to create and export Vertex Animation Textures in Blender. This project was a really good learning exercise to deepen my understanding of how VATs work.
# Breakdown
![[ptfl-vat-baker.webm]]

The tool works in 3 stages:
#### Mesh Capture
* Makes a copy of a given mesh in that frame
* Captures every vertex in that frame
* Calculates offset of each vertex from the starting frame

#### UV set
* Saves every vertex in a new UV set
* Orders them in a single-file line at the top of the UV

#### Export Textures
* Create a Texture
* Apply captured values to the texture

### Properties Panel
![[ptfl-vat-baker-properties.png#l|360]]

