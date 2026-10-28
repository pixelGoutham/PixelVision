# PixelVision: The Missing Visual Compiler for Frontend
  
**Hacktoberfest Hack Day Bengaluru 2026 Submission**
- Track: Track 01 - Best Use of Gemma 4
- Problem Statement: G3 - Multimodal AI Intelligence (Text + Images)

## The Lie of the "Green Terminal"
In modern web development, a green terminal tells you that all your tests passed—but it doesn't mean your website actually works. Traditional code tests are visually blind. Tools like Jest and Cypress only assert that a button exists in the DOM tree, giving developers false confidence even when a floating header completely covers it up.

Code tests verify the code, but they completely ignore human reality.

## What is PixelVision?
PixelVision is an automated UI/UX auditing and self-healing workbench. It acts as a pair of objective, AI-powered eyes for frontend developers and designers. By leveraging Google's Gemma 4 multimodal AI (31B/26B parameters), it actually "looks" at your live webpage to detect visual layout issues and instantly generates the CSS to fix them.

---

## How to Use PixelVision (Step-by-Step)

To run a visual audit and self-heal a broken interface, follow these steps:

### 1. Load a Target UI
When you open PixelVision, you need to provide a user interface to audit. You have two options:
* **Live URL Import:** Paste any public website URL into the top search bar and click **Fetch**. PixelVision will clone the live DOM and CSS into the isolated sandbox.
* **Demo Presets:** Click on the preset buttons on the left sidebar (e.g., `Apple.com — Hero` or `Pixel Blast — Course`) to load pre-configured UI scenarios with deliberate bugs.

### 2. Understand the Set-of-Mark (SoM) Badges
Once a page is loaded, you will notice **red numbered boxes** appearing over the UI elements. 
* **What they mean:** These are Set-of-Mark (SoM) badges. Instead of forcing the AI to guess pixel coordinates, our local script maps the bounding box of every interactive DOM node (buttons, headers, links). 
* **Why it matters:** This gives the Gemma 4 vision model an exact, numbered map of the screen so it can precisely identify overlapping elements, poor contrast, or touch-targets that are too small.

### 3. Run the Multimodal Audit
With the page loaded and the red badges visible, click the **"Run Multimodal Audit"** button at the top right. 
* PixelVision will capture a screenshot of the badged UI, bundle it with exact JSON coordinate math (X, Y, Width, Height), and send it to Gemma 4.
* Gemma will evaluate the screen against standard design rules (like Apple's Human Interface Guidelines).

### 4. Review and Apply the AI Patch
After the audit completes, look at the **Verification Report** panel on the right.
* **Spec Violations:** Gemma will list the exact badge numbers that are failing (e.g., "Badge #4 overlaps with Badge #5" or "Badge #12 is smaller than 44px").
* **How to fix it:** Click the **Apply Suggested Patch** button in the report. PixelVision will instantly inject Gemma's AI-generated CSS fix back into the live DOM, self-healing the layout right in front of you.

---

## The Problem
Humans are bad at eyeballing mathematical design specs.
- **Subjective Reviews:** Design critiques often stall in subjective debates instead of objective geometric verification.
- **Missed Accessibility:** Manual QA routinely misses a 26px button that violates Apple's strict 44px minimum touch-target rule.
- **Silent Failures:** Overlapping elements and broken responsive layouts slip through CI/CD pipelines because the underlying code technically "compiles" just fine.

## The Solution
We didn't just plug an AI into a chatbox. We gave Gemma 4 spatial vision.
1. **Set-of-Mark (SoM) Indexing:** PixelVision injects numbered red bounding-box badges directly onto interactive elements on your live webpage.
2. **Multimodal Reality Check:** We bundle a rendered screenshot of those visual tags alongside exact JSON coordinate math (X, Y, Width, Height) and send it to Gemma 4.
3. **Objective Reasoning:** Gemma 4 evaluates the screen against Apple's Human Interface Guidelines (HIG)—verifying spatial consistency and pointer-down touch targets.
4. **Self-Healing UI:** Instead of just telling you something is broken, Gemma 4 isolates the failing marks and outputs a verified CSS patch that can be injected into the live DOM with one click.

## The Promise
PixelVision bridges the gap between advanced AI capabilities and practical development workflows. It removes the guesswork from UI development, ensuring that what you ship is objectively accessible, perfectly spaced, and visually verified before it ever reaches a user.

### And one more thing...
I'd be grateful if you check out my flagship project - **Pixel Focus**

Thanking you,  
**Goutham Kumar A**  
*aka Pixel_Inc*
