# PixelVision Landing Page

Official marketing site for the PixelVision UI/UX verification workbench.

## Overview

This repository contains the official landing page for PixelVision, an AI-powered UI/UX auditing and verification workbench. PixelVision helps developers objectively verify their interfaces against product specifications using Google's Set-of-Mark technique and Gemma 4 multimodal reasoning.

**Important**: This repository contains ONLY the landing page/marketing site. The actual PixelVision desktop application exists in a separate repository.

## Repository Scope

### What This Repository Contains
- React 19 + TypeScript frontend application
- Vite build system with Tailwind CSS styling
- API routes for URL fetching and audit processing (Vercel serverless functions)
- Landing page components and documentation
- Deployment configuration for Vercel

### What This Repository Does NOT Contain
- PixelVision desktop application source code
- Native desktop application binaries or installers
- Backend services for the desktop application
- Database schemas or persistence layers
- Electron/Tauri wrapper code

## Live Website

- **Production Website**: https://pixelvision-black.vercel.app
- **Desktop Application Repository**: [To be added - separate repository]

## Features

### Core Functionality
- **Set-of-Mark Visual Prompting**: Automatically injects numbered bounding boxes into live DOM elements
- **Multimodal AI Auditing**: Uses Gemma 4 to analyze both visual screenshots and structural DOM telemetry
- **Specification Verification**: Checks interfaces against explicit product requirements
- **Violation Detection**: Identifies overlapping elements, inadequate touch targets, and hierarchy issues
- **Self-Healing Patches**: Generates Apple-grade CSS remediation suggestions
- **Live Website Analysis**: Fetches and audits any publicly accessible URL
- **Deterministic Fallbacks**: Provides consistent demo experiences when live sites are unavailable

### Technical Capabilities
- React 19 with modern hooks architecture
- TypeScript for type safety and developer experience
- Vite-powered development with instant HMR
- Tailwind CSS for utility-first styling
- Vercel serverless functions for API endpoints
- IndexedDB caching for audit results
- Responsive design across device sizes

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.2.8 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | ^8.3.0 |
| Styling | Tailwind CSS | ^4.3.3 |
| UI Icons | Lucide React | ^1.57.0 |
| API | Vercel Serverless Functions | @vercel/node ^24.0.0 |
| AI Integration | Google GenAI (Gemma 4) | @google/genai ^2.29.1 |
| Offline Storage | LocalForage | ^1.10.0 |
| Image Processing | HTML-to-Image | ^1.11.13 |
| Linting | ESLint | ^10.10.0 |
| Formatting | Prettier (via ESLint) | - |

## Repository Structure

```
pixelvision/
├── api/                  # Vercel serverless functions
│   ├── audit.ts          # Multimodal audit endpoint (Gemma 4 integration)
│   └── fetch-url.ts      # Website fetching and parsing endpoint
├── public/               # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/                  # Source code
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── components/       # Reusable UI components
│   │   └── SandboxRenderer.tsx  # Secure iframe-based rendering
│   └── lib/              # Utility libraries
│       └── gemmaClient.ts  # Gemma 4 integration and deterministic audits
├── .env.local            # Environment variables (API keys)
├── .gitignore            # Git exclusion patterns
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration with Vercel middleware
└── README.md             # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn package manager
- Vercel account (for deployment)
- Google Gemini API key (for live Gemma 4 functionality)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/pixelvision.git
cd pixelvision

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
```

### Development
```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Building
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Development Workflow

### Local Development
1. Feature branches are created from `main`
2. Development server provides hot module replacement
3. API routes are proxied locally via Vite middleware
4. Changes trigger instant browser updates

### Code Standards
- ESLint with React and TypeScript plugins
- Prettier formatting enforced via CI
- TypeScript strict mode enabled
- Component-first organization in `src/components/`

### Branch Strategy
- `main`: Production-ready code (deployed to Vercel)
- Feature branches: Short-lived branches for specific features
- Pull requirements: Maintainers review before merging

## Deployment

### Vercel Deployment
This project is optimized for Vercel deployment:
- Automatic builds on GitHub pushes to `main`
- Preview deployments for all pull requests
- Serverless functions deployed alongside frontend
- Edge-optimized asset delivery

### Production Branch
- `main` branch is automatically deployed to production
- Vercel builds run on push to `main`
- Custom domain configured via Vercel dashboard

### Preview Deployments
- Every pull request gets a unique preview URL
- Enables visual review before merging
- Automatically cleaned up when PR is closed

## SEO Implementation

### Meta Tags
- Dynamic title generation based on page content
- Meta description summarizing PixelVision's value proposition
- Open Graph tags for social sharing
- Twitter Card configuration for Twitter/X sharing

### Structured Data
- JSON-LD for Organization and WebSite entities
- Breadcrumb navigation schema
- FAQ schema for common questions

### Performance Optimizations
- Semantic HTML5 elements for better crawler understanding
- Proper heading hierarchy (H1-H6)
- Descriptive alt text for all images
- Accessible link text and button labels

## Performance

### Build Optimizations
- Vite-powered bundling with code splitting
- Automatic chunking for vendor dependencies
- Asset optimization and fingerprinting
- CSS purging via Tailwind CSS JIT mode

### Runtime Performance
- Virtualized lists for large telemetry datasets
- Memoized expensive computations with React.useMemo
- Efficient re-rendering with React.useCallback
- Lazy loading of non-critical components

### Asset Optimization
- SVG icons for infinite scalability
- Compressed image formats
- Font subsetting for icon libraries
- Efficient bundle analysis and reporting

## Accessibility

### WCAG Compliance
- Semantic HTML structure with proper landmarks
- ARIA labels for interactive elements where needed
- Keyboard navigable interface
- Focus management for modal dialogs
- Sufficient color contrast ratios

### Implementation Details
- All interactive elements have accessible names
- Form elements include associated labels
- Color is not used as the sole means of conveying information
- Text can be resized without loss of content or functionality
- Skip navigation links for keyboard users

## Design Philosophy

### Apple-Inspired Design
- Fluid, physical motion inspired by Apple's WWDC guidelines
- Translucent materials and depth effects
- Pointer-down tactile feedback (§1)
- 44px minimum touch target size (§10)
- Optical typography with negative tracking (§15)
- Reduced motion accessibility considerations (§14)

### Key Principles
- **Restraint**: Minimal chrome, maximum content focus
- **Feedback**: Immediate and clear response to user actions
- **Metaphors**: Familiar, real-world interactions
- **Consistency**: Predictable behavior across the interface
- **Directness**: Manipulation of objects rather than proxies

## Contributing

### Reporting Issues
- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps and expected behavior
- Screenshots or screen recordings are helpful for UI issues
- Label issues appropriately (bug, enhancement, documentation)

### Development Process
1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with clear, descriptive commits
4. Ensure all tests pass and linting succeeds
5. Submit a pull request to `main`
6. Address any feedback from maintainers
7. Maintainers will merge after approval

### Code Contributions
- Follow the existing code style and patterns
- Write meaningful commit messages
- Update documentation when changing functionality
- Consider accessibility implications of UI changes
- Include type definitions for new TypeScript code

## Roadmap

### Near Term (Next 6-8 Weeks)
- Enhance demo presets with additional website examples
- Improve error handling and user feedback during API calls
- Add keyboard shortcuts for power users
- Expand accessibility audit capabilities
- Improve mobile responsiveness of the workbench interface

### Mid Term (Next 3-4 Months)
- Add custom specification builder for user-defined rules
- Implement audit history and comparison features
- Export audit reports in multiple formats (JSON, PDF, HTML)
- Add team collaboration features for shared audits
- Integrate with popular design tools (Figma, Sketch)

### Long Term (Future Releases)
- Machine learning model customization for domain-specific audits
- CI/CD pipeline integration for automated UI testing
- Design system compliance checking
- Multi-language support for international teams
- Advanced analytics dashboard for audit trends

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- **Google**: For providing access to Gemma 4 multimodal models
- **Vercel**: For hosting and deployment infrastructure
- **Apple**: For WWDC Fluid Interface and Human Interface Guidelines that inspire the design principles
- **Tailwind CSS Team**: For the utility-first CSS framework
- **React Team**: For the frontend library powering the interface
- **TypeScript Team**: For the type-safe JavaScript superset
- **Lucide Contributors**: For the beautiful open-source icon set
- **LocalForage Contributors**: For the offline storage solution
- **HTML-to-Image Contributors**: For the client-side HTML rendering library
- **All Open Source Contributors**: Whose tools and libraries make this project possible

---

*PixelVision Landing Page - Official marketing site for the PixelVision UI/UX verification workbench*