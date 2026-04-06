![[ptfl-scarlet-showcase.webm]]

# Project Goal
This project was made in collaboration with my fellow TGA student and friend from Animation, [Sharon Chao](https://sharonchao.me). I wanted to collaborate because I thought her character looked awesome and had potential. So, I wanted to elevate the cinematic with some VFX and Environmental Effects.
# Summary
For this project, I made various visual effects befitting her characters aesthetic and vibe. Our Idea was to make a boss cinematic intro akin to games like Elden Ring.

#### Effects & Tools I contributed to:
* Mist VFX
* Fire step VFX
* Silk Veil Houdini Tool
* Environment Lighting & Atmospherics.
# Breakdown

### Silk Veil Houdini Tool
I created this tool because I noticed that the scene felt empty even with nice lighting. I was mainly inspired by the veils in Elden Ring: Shadows of the Erdtree Messmer Boss and La La Barina from Monster Hunter: Wilds.

![[ptfl-scarlet-cloth.mp4]]

I first use a curve spline input to create two points where the veil will be hanging from. I then create a middle point and droop it down.

![[ptfl-scarlet-cloth-houdini.mp4]]

After that I assign vertex colors based on how close each points is from the middle, using that I can displace the silk using a shader. Then, I use sweep to create the geometry that will eventually be simulated using Vellum Cloth Physics. Lastly, I "bake" a frame using timestep to then be sent to output.

---

### Mist VFX
![[ptfl-scarlet-mist.mp4]]

The mist is an environmental VFX meant to add ambiance to the character's entrance and exit. This effect is composed of three main parts:
####  Mist
* Flipbook texture baked in EmberGen
* Fade in/out

[Mist Image]
#### Confetti
* A simple plane with aerodynamic drag

[Confetti Image]


---

### Fire Step VFX
![[ptfl-scarlet-firestep.mp4]]
For this effect we wanted a cool dramatic effect for when the camera is zoomed in on the characters shoes. To go with her mysterious, phoenix-like appearance I decided to make a fire footstep effect. It's composed of two main parts:

#### Fire Poof
* Three different flame flipbooks packed in one texture, also baked in EmberGen.
* Uses custom made flipbook material function for frame blending

[Fire Poof Image]
#### Flame Ring
 * A simple panning texture with erosion. Texture was created using Substance Designer.

