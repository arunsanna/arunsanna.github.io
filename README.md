# Arun Sanna Portfolio Website

A modern, component-based portfolio website showcasing enterprise architecture and engineering expertise. Built with vanilla HTML, CSS, and JavaScript for GitHub Pages deployment.

## Features

- 🎨 Modern dark theme with cyberpunk/military aesthetic
- 📱 Fully responsive mobile-first design
- ⚡ Smooth animations and scroll-triggered effects
- 🧩 Modular component-based architecture
- 🔧 No build process required - pure HTML/CSS/JS
- 🚀 GitHub Pages ready
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
│   ├── projects.html      # Projects grid container
│   ├── projects/          # Individual project cards
│   │   ├── dod.html       # DoD Platform One project
│   │   ├── cms.html       # CMS Healthcare project
│   │   ├── oar.html       # Operation Allies Refuge
│   │   ├── cloud.html     # Enterprise AI Transformation
│   │   └── edge.html      # Defense Edge Computing
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
│   └── projects.js        # Project interactions
├── assets/                # Static assets
│   ├── Arun.png           # Profile image
│   └── projects.md        # Project data (reference)
└── README.md              # This file
```

## Development

### Local Development

Run a local server to view the site:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

Then visit `http://localhost:8000`

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

Edit individual project files in `components/projects/` to update:
- Project descriptions
- Metrics and outcomes
- Technology stacks
- Visual elements

## Deployment

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
