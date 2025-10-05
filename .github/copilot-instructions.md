# Copilot Instructions - Pointer Landing Template

## Project Overview
Next.js 15.2.4 landing page template using TypeScript, React 18.2.0, Tailwind CSS, Radix UI primitives, and Framer Motion. Built for v0 compatibility with custom design system and Docker deployment support.

## Architecture & Structure

### Key Directories
- **`app/`**: Next.js App Router - contains `layout.tsx`, `page.tsx`, and `globals.css`
- **`components/`**: All UI components (sections, bento cards, UI primitives)
  - **`components/ui/`**: Radix UI-based primitives (buttons, dialogs, etc.) - all use `'use client'`
  - **`components/bento/`**: Feature illustration components for bento grid (AI reviews, deployment, MCP, etc.)
- **`lib/utils.ts`**: Single utility - `cn()` function for className merging with `clsx` and `tailwind-merge`
- **`public/`**: Static assets organized by type (`images/`, `logos/`)

### Page Structure
`app/page.tsx` is a single-page landing with sections stacked vertically:
1. Hero (with fixed-position dashboard preview)
2. Social Proof
3. Bento Grid (features)
4. Large Testimonial
5. Pricing
6. Testimonial Grid
7. FAQ
8. CTA
9. Footer

Each section wrapped in `<AnimatedSection>` for scroll-triggered animations.

## Critical Patterns & Conventions

### Client vs Server Components
- **Server by default**: Most components in `components/` (sections like `hero-section.tsx`, `bento-section.tsx`) are server components
- **Require `'use client'`**: 
  - All `components/ui/*` primitives (Radix UI requires client)
  - `animated-section.tsx` (uses Framer Motion)
  - `header.tsx` (uses smooth scroll handlers)
  - `theme-provider.tsx` (context provider)

### Styling System
```typescript
// Always use the cn() utility for conditional classes
import { cn } from '@/lib/utils'
<div className={cn("base-classes", condition && "conditional-classes", className)} />
```

**Theme Variables** (defined in `app/globals.css`):
- Primary brand: `--primary` (teal #78fcd6), `--primary-dark`, `--primary-light`
- Background: `--background` (dark #0f1211), `--foreground` (light #e7eceb)
- Muted text: `--muted-foreground` with opacity variants (0.7, 0.6, 0.5)
- Borders: `--border` (white/8%), `--border-light`, `--border-dark`
- All colors use HSL format: `hsl(var(--primary))`

**Common Patterns**:
- Glassmorphism: `backdrop-filter: blur(4px)` with `rgba(231, 236, 235, 0.08)` background
- Blur effects: `blur-[130px]` for glow effects with `opacity-10` primary color
- Responsive: Mobile-first with `md:` breakpoints

### Path Aliases
```typescript
// tsconfig.json configures "@/*" to root
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### Component Conventions
- Use TypeScript with proper types (`React.FC`, interface props)
- Bento cards: Standard pattern in `bento-section.tsx` with title/description/Component props
- Inline SVGs: Large decorative SVGs often inlined (see `hero-section.tsx` grid background)
- CSS-in-JS for dynamic theming: Use inline styles with CSS variables (see `ai-code-reviews.tsx`)

### Fonts
- **Geist Sans** & **Geist Mono** from `geist/font` package
- Applied in `app/layout.tsx` via inline `<style>` tag setting CSS variables
- Reference: `font-family: var(--font-sans)` or Geist family names

## Development Workflow

### Local Development
```powershell
npm install          # Uses React 18.2.0 (locked for stability)
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm start            # Start production server
npm run lint         # Next.js linting
```

### Docker Development
```powershell
docker compose -f docker-compose.dev.yml up --build    # Start with live reload
docker compose -f docker-compose.dev.yml up --build -d # Background mode
docker compose -f docker-compose.dev.yml logs --tail=200
docker compose -f docker-compose.dev.yml down          # Stop and cleanup
```

**Docker Notes**:
- Multi-stage `Dockerfile` for production
- `docker-compose.dev.yml` mounts source for hot reload
- Requires Docker Desktop running on Windows
- Uses `npm ci --legacy-peer-deps` for dependency resolution

### Build Configuration
- **TypeScript**: Strict mode enabled, `ignoreBuildErrors: true` in `next.config.mjs`
- **ESLint**: `ignoreDuringBuilds: true` for faster builds
- **Images**: `unoptimized: true` (configured for static export compatibility)

## Important Technical Decisions

### React Version Lock
- **React 18.2.0** pinned (not 19.x) due to peer dependency conflicts with `vaul`, `@radix-ui`, and other libs
- Do NOT upgrade React without testing all Radix UI components and Framer Motion

### Animation Strategy
- Framer Motion `<AnimatedSection>` wraps sections with:
  ```typescript
  initial={{ opacity: 0, y: 20, scale: 0.98 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay }}
  ```
- Staggered delays (0, 0.1, 0.2) for section reveals

### Smooth Scrolling
- `header.tsx` implements manual smooth scroll to section IDs
- Sections have IDs: `#features-section`, `#pricing-section`, `#testimonials-section`, `#faq-section`

## Common Tasks

### Adding a New Section
1. Create component in `components/` (server component unless needs interactivity)
2. Import in `app/page.tsx`
3. Wrap in `<AnimatedSection>` with appropriate delay
4. Add ID if navigation target

### Adding a New Bento Card
1. Create illustration component in `components/bento/`
2. Add to `cards` array in `bento-section.tsx` with title/description
3. Use inline CSS variables pattern for theme support (see existing bento components)

### Modifying Theme Colors
- Edit CSS variables in `app/globals.css` `:root`
- Reference throughout with `hsl(var(--variable-name))`
- Tailwind extends these in `tailwind.config.ts`

### Working with UI Primitives
- All in `components/ui/` are from Radix UI or shadcn/ui
- Always marked `'use client'`
- Use variant props (e.g., `Button` has `variant` and `size`)
- Import types: `ButtonProps`, `VariantProps<typeof buttonVariants>`

## External Dependencies
- **Vercel Analytics**: Integrated in `layout.tsx` via `<Analytics />`
- **Radix UI**: Comprehensive primitive library for accessible components
- **Framer Motion**: Animation library (use `motion.*` components)
- **Lucide React**: Icon library (e.g., `<Menu />` in header)
- **class-variance-authority**: For variant-based component APIs

## Troubleshooting
- **Docker errors**: Ensure Docker Desktop is running
- **Build errors**: Check React version hasn't been upgraded
- **Type errors**: Verify `@/*` imports resolve correctly
- **Style conflicts**: Use `cn()` utility, never raw `className` concatenation
