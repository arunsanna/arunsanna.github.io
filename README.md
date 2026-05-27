# Arun Sanna Portfolio Website

A modern, component-based portfolio website showcasing enterprise architecture and engineering expertise. Historically built with vanilla HTML, CSS, and JavaScript for GitHub Pages deployment; now also scaffolded as a small Fastify app for dynamic Forge/k3s hosting.

## Features

- 🎨 Modern dark theme with cyberpunk/military aesthetic
- 📱 Fully responsive mobile-first design
- ⚡ Smooth animations and scroll-triggered effects
- 🧩 Modular component-based architecture
- 🔧 Existing static frontend preserved - pure HTML/CSS/JS
- 🚀 GitHub Pages ready, with Forge/k3s migration manifests
- 🧠 Dynamic API seed: `/healthz`, `/api/status`, `/api/projects`
- 🎯 Accessibility focused

## Project Architecture

This site uses a modular component architecture where content is organized into reusable HTML components that are dynamically loaded:

```
arunsanna.github.io/
├── index.html              # Main entry point with shell structure
├── CLAUDE.md               # AI assistant guidance for development
├── components/             # Modular HTML components
│   ├── hero.html          # Hero section with role graph
│   ├── about.html         # About section with highlights
│   ├── projects.html      # Projects section shell (tabs + filters)
│   ├── projects/          # Legacy per-card templates (archived pattern)
│   ├── skills.html        # Skills section container
│   ├── skills/            # Individual skill category cards
│   ├── experience.html    # Work experience timeline
│   ├── certifications.html # Professional certifications
│   ├── contact.html       # Contact section
│   └── footer.html        # Footer component
├── styles/                # Modular CSS files
│   ├── main.css           # Core styles and variables
│   ├── components/        # Component-specific styles
│   └── utilities/         # Utility classes
├── js/                    # JavaScript modules
│   ├── main.js            # Main entry point and component loader
│   ├── navigation.js      # Navigation and scroll handling
│   ├── animations.js      # Animation controllers
│   └── projects.js        # Data-driven project renderer + filters
├── assets/                # Static assets
│   ├── Arun.png           # Profile image
│   ├── projects.json      # Source of truth for all project cards
│   └── projects.md        # Legacy reference notes
└── README.md              # This file
```

## Development

### Local Development

Install dependencies and run the dynamic local server:

```bash
npm install
npm run dev
```

Then visit `http://localhost:8080`.

Static-only fallback:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

Then visit `http://localhost:8000`.

### Making Changes

1. **Content Updates**: Edit component HTML files in `components/`
2. **Styling**: Update CSS in `styles/` directory
3. **Functionality**: Modify JavaScript in `js/` directory
4. **New Components**: Create new component files and import them in `main.js`

### AI Assistant Development

This project includes `CLAUDE.md` which provides context and guidelines for AI assistants (like Claude Code). It includes:
- Repository overview and architecture
- Development commands and patterns
- Code organization principles
- Common modification patterns

## Customization

### Colors & Theme

Edit CSS variables in `styles/main.css`:
```css
:root {
    --primary: #02D7F2;      /* Cyan accent color */
    --background: #0a0e27;    /* Dark background */
    /* ... other theme variables */
}
```

### Adding New Sections

1. Create new component file in `components/`
2. Add corresponding styles in `styles/components/`
3. Import and load component in `js/main.js`
4. Add navigation link in `index.html`

### Updating Projects

Edit `assets/projects.json`:
- Add/remove projects
- Move projects between `professional`, `opensource`, and `cooking`
- Update metrics, highlights, tags, and technologies

`js/projects.js` renders cards, tab counts, and dynamic tag filters from this file.

## Deployment

### Forge / k3s Draft

See [`docs/forge-migration.md`](docs/forge-migration.md).

```bash
docker build -t registry.arunlabs.com/arunsanna-site:dev .
kubectl --context forge apply -k deploy/forge/arunsanna-site
kubectl --context forge -n arunsanna-site rollout status deployment/arunsanna-site
```

Do not cut over `arunsanna.com` DNS until the Forge public gateway has a valid `arunsanna.com` TLS secret and public ingress has been smoke-tested.

### GitHub Pages

1. Push changes to the `main` branch
2. GitHub Pages automatically deploys updates
3. Site available at: `https://arunsanna.github.io`

### Manual Deployment

The site is purely static - copy all files to any web server.

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern features (Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript**: ES6+ modules, no frameworks
- **Font Awesome**: Icon library
- **Google Fonts**: Inter & JetBrains Mono

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- No build step or dependencies
- Lazy-loaded components
- Optimized animations using CSS transforms
- Mobile-first responsive design
- Semantic HTML for accessibility

## License

Feel free to use this template for your own portfolio! Attribution appreciated but not required.
