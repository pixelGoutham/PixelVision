# PixelVision: The Missing Visual Compiler for Frontend

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://pixel-focus-meow.vercel.app)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)

**Hacktoberfest Hack Day Bengaluru 2026 Submission**
* **Track:** Track 01 - Best Use of Gemma 4
* **Problem Statement:** G3 - Multimodal AI Intelligence (Text + Images)

---

### The Lie of the "Green Terminal"
In modern web development, a green terminal tells you that all your tests passed—but it doesn't mean your website actually works. Traditional code tests are visually blind. Tools like Jest and Cypress only assert that a button exists in the DOM tree, giving developers false confidence even when a floating header completely covers it up. 

Code tests verify the code, but they completely ignore human reality.

### What is PixelVision?
PixelVision is an automated UI/UX auditing and self-healing workbench. It acts as a pair of objective, AI-powered eyes for frontend developers and designers. By leveraging Google's Gemma 4 multimodal AI (31B/26B parameters), it actually "looks" at your live webpage to detect visual layout issues and instantly generates the CSS to fix them.

### The Problem
Humans are bad at eyeballing mathematical design specs. 
* **Subjective Reviews:** Design critiques often stall in subjective debates instead of objective geometric verification.
* **Missed Accessibility:** Manual QA routinely misses a 26px button that violates Apple's strict 44px minimum touch-target rule.
* **Silent Failures:** Overlapping elements and broken responsive layouts slip through CI/CD pipelines because the underlying code technically "compiles" just fine.

### The Solution
We didn't just plug an AI into a chatbox. We gave Gemma 4 spatial vision.

1. **Set-of-Mark (SoM) Indexing:** PixelVision injects numbered red bounding-box badges directly onto interactive elements on your live webpage.
2. **Multimodal Reality Check:** We bundle a rendered screenshot of those visual tags alongside exact JSON coordinate math (X, Y, Width, Height) and send it to Gemma 4.
3. **Objective Reasoning:** Gemma 4 evaluates the screen against Apple's Human Interface Guidelines (HIG)—verifying spatial consistency and pointer-down touch targets.
4. **Self-Healing UI:** Instead of just telling you something is broken, Gemma 4 isolates the failing marks and outputs a verified CSS patch that can be injected into the live DOM with one click.

### The Promise
PixelVision bridges the gap between advanced AI capabilities and practical development workflows. It removes the guesswork from UI development, ensuring that what you ship is objectively accessible, perfectly spaced, and visually verified before it ever reaches a user.

### And one more thing

I'd be grateful if you check out my flagship project - Pixel Focus

<a href="https://apps.microsoft.com/detail/9pkd9kpvj5gv?referrer=appbadge&mode=full" target="_blank"  rel="noopener noreferrer">
	<img src="https://get.microsoft.com/images/en-us%20light.svg" width="200"/>
</a>

Thanking you,  
  
Goutham Kumar A  
aka Pixel_Inc
