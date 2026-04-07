#hero![[ptfl-volumetric.png]]
##### Project Time: ~6 weeks

A fully compute-shaded volumetric renderer inside our custom C++ engine. This was originally a feature for [P6: Aliens Stole My Sh**](/project/p6), but I ended up putting enough effort into it that I decided to keep it as its own portfolio piece.

# Project Goal
This project started as raymarched clouds for our game, which is set on a planet with floating islands. It eventually evolved into a full volumetric renderer with support for up to 8 box volumes that other disciplines can place in the level.

#### Key Features:
* Cloud Rendering
* Volume Rendering
* Uses Compute Shader
* Half-Res Upscaled Raymarching

# Breakdown

### Compute Shader Dispatch & Upsampling
The volumetric raymarching runs entirely in a compute shader, dispatched at half resolution. The dispatch is divided into 16x16 thread groups, covering the half-res viewport:

```cpp
Texture* halfResFog = myHalfResVolumetricBuffer.get();
inoutCommandList.SetUnorderedAccessView(halfResFog);
inoutCommandList.Dispatch(
    ((GetViewportSize().x / 2) / 16) + 1,
    ((GetViewportSize().y / 2) / 16) + 1, 1);
inoutCommandList.SetUnorderedAccessView(nullptr);
```

After the compute pass, the half-res result is upsampled to full resolution using a fullscreen quad drawn with a dedicated resample pixel shader. This keeps the raymarching cost low while maintaining a clean final image.

---

### Cloud Rendering
![[ptfl-volumetric-cloud-showcase.webm]]

---
![[ptfl-volumetric-fogfx-showcase.webm#r|320]]

The clouds use a 64x64 packed noise map that I created in Substance Designer, combining various noise types into a single texture. The raymarcher samples this noise along each ray to build up density along a desired height to give the effect of clouds.


---

### Box Volumes
![[ptfl-volumetric-box-volume.png]]

 Artists and level designers use Unreal as a medium to place out assets in the level. I added a box volume tag to our custom exporter, which creates a corresponding box volume inside the renderer. The system supports up to 8 box volumes, each defining a region where volumetric fog is rendered. The raymarcher performs ray-box intersection to determine entry and exit points for each volume.
*Inside the map function*
```hlsl
    // fog box volumes in the scene
    for (uint i = 0; i < VB_NumBoxes; i++) // iterate through every box.
    {
        DeconstructedTransform transform = Deconstruct(VB_Boxes[i].Transform);
        
        float3 rotP = mul(transform.RotationMatrix, (p - transform.Position));
        float b = sdBox(p - transform.Position, float3(40.0f, 40.0f, 40.0f) * transform.Scale) * 2.0f;
        m = min(m, b); // add box to map
    }
```

---

### Performance & Optimizations

To keep performance manageable, I implemented several optimizations:

#### Half-Res Rendering
* As mentioned above, the raymarching runs at half resolution and is upsampled afterward, cutting the number of rays by 4x
```cpp
inoutCommandList.Dispatch(
    ((GetViewportSize().x / 2) / 16) + 1,
    ((GetViewportSize().y / 2) / 16) + 1, 1);
```
#### Depth Early-Out
* The depth texture is used to break out of the raymarching loop early when the ray hits opaque geometry, avoiding unnecessary samples behind solid objects
```hlsl
float4 rayMarch(float3 ro, float3 rd, float noise, float depth)
{
    float t = noise * RAY_MARCH_SIZE;
    // depth is depth texture
    float maxT = min(depth, MAX_RAY_DIST);
    
    [loop]
	for (uint i = 0; i < RAY_STEPS && t < maxT; i++)
	{
		// t < maxT breaks loop
	}
}
```

#### Adaptive Step Sizing
* The step size adjusts based on density at the ray's current position — dense regions use smaller steps for accuracy, while empty regions use larger steps to skip through quickly
* I also multiply an interleaved gradient noise ([IGN](https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/)) to break up the banding caused by raymarching from the camera
```hlsl

float4 rayMarch(float3 ro, float3 rd, float noise, float depth)
{
    float t = noise * RAY_MARCH_SIZE;
    float maxT = min(depth, MAX_RAY_DIST);
    
    [loop]
	for (uint i = 0; i < RAY_STEPS && t < maxT; i++)
	{
		
	}
}
```