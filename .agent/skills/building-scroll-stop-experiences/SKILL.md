---
name: building-scroll-stop-experiences
description: >
  An end-to-end workflow for creating Apple-style scroll-driven object sites. First generates coordinated prompts for AI image/video models (hero image, deconstructed image, video transition). Then, handles the final video by extracting frames via FFmpeg and building a premium HTML/JS scroll-driven website. Trigger when the user asks for a scroll-stop experience, building a 3d scroll animation site from scratch, or scroll-driven video workflow.
---

# Building Scroll-Stop Experiences

You guide the user through an end-to-end process: first, generating the necessary AI prompts to create stunning video content. Second, building a premium scroll-driven website from their generated video file.

## When to use this skill
- User asks for an end-to-end scroll-stop experience.
- User wants an Apple-style product animation site built from scratch.
- User says "scroll-stop build", "scroll animation website", or "build the scroll-stop site".

## Workflow

### Phase 1: Planning and Asset Generation
1. [ ] **Interview & Content Sourcing:** Ask the user for:
   - Object/product details.
   - Brand name and Logo (SVG/PNG).
   - Accent color, background color, and overall vibe.
   - Existing website URL (optional: for `WebFetch` copy extraction).
2. [ ] **Prompt Generation:** Create Prompts A (Hero on white background), B (Deconstructed on white background), and C (Video Transition) based on whether it is a product (deconstruction) or transformation (before/after).
3. [ ] **Deliver Prompts:** Read `resources/prompt-page-template.html` (in this skill directory), replace all placeholders (`{{OBJECT_NAME}}`, `{{PROMPT_A}}`, etc.) and escape `<, >, &` as HTML entities. Write the final result to `prompts.html` and open it for the user. Present a fallback copy in the chat.
4. [ ] **Wait for User:** Instruct the user to run the prompts through their image/video gen tool (e.g. Midjourney, Kling, Runway) and provide you with the final MP4/video file.

### Phase 2: Building the Scroll-Driven Website
1. [ ] **Analyze Video:** Once the video is provided, use `ffprobe -v quiet -print_format json -show_streams -show_format "{VIDEO_PATH}"`. Target 60-150 frames. *Crucially check that the first frame is on a white background.*
2. [ ] **Extract Frames:** 
   ```bash
   mkdir -p "{OUTPUT_DIR}/frames"
   ffmpeg -i "{VIDEO_PATH}" -vf "fps={TARGET_FPS},scale=1920:-2" -q:v 2 "{OUTPUT_DIR}/frames/frame_%04d.jpg"
   ```
3. [ ] **Build the Website:** Use `resources/sections-guide.md` as the blueprint to assemble the HTML, CSS, and JS (Starscape canvas, Loader, Navbar scroll-to-pill, sticky canvas scroll parsing frames, Specs with count-up animation, mobile layout containing zoom-fit scaling, etc.). Incorporate branding from Phase 1.
4. [ ] **Serve & Test:** `cd "{OUTPUT_DIR}" && python3 -m http.server 8080` (Check the preview).

## Detailed Instructions

### Prompt Engineering Details (Phase 1)
- **Prompt A:** Professional product photograph centered in frame on a pure white (#FFFFFF) background. Describe the brand-new, pristine state. 16:9 aspect.
- **Prompt B:** Exploded view retaining spatial relationships on a pure white background (if product) OR a completely transformed pristine state on pure white background (if transformation).
- **Prompt C (Video):** Start with A, end with B. Describe the smooth 2-3 sec separation or transition that cascades along an axis. 5-6 sec total, 24fps. Lock camera off (tripod shot).
- Offer Reverse (start deconstructed -> assemble) or Loop versions.

### Website Construction Details (Phase 2)
- Read `resources/sections-guide.md` for specific technical implementations:
  - **`requestAnimationFrame`**: Never execute draw operations natively in scroll listeners.
  - **Annotation Snap-Stop**: Freeze scroll progression briefly at data-show/data-hide points while allowing card rendering.
  - **Retina Scaling**: `canvas.width = window.innerWidth * window.devicePixelRatio`.
- **Content:** Do not use Lorem Ipsum text. Use real brand specifics, proper fonts (Space Grotesk, Archivo), and accurate spec details.

## Error Recovery
| Phase | Issue | Solution |
|---|---|---|
| 1 | Image lighting inconsistent | Add "match exact lighting direction from reference image" to Prompt B. |
| 1 | Deconstruction looks random | Emphasize "maintain spatial relationships" and "explosion along single axis". |
| 2 | Frames don't load | Check paths and deploy local web server (cannot load from `file://`). |
| 2 | Canvas is blurry | Ensure `devicePixelRatio` scaling. |
| 2 | Scroll feels too fast/slow | Adjust `.scroll-animation` container height (200vh=fast, 800vh=cinematic). |
| 2 | First frame isn't white | Inform user to re-render video so it opens on a seamless white canvas. |
