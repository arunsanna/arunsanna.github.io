# Arun Sanna Portfolio Website

A modern, responsive portfolio website built for GitHub Pages deployment.

## Features

- 🎨 Modern dark theme with gradient accents
- 📱 Fully responsive design
- ⚡ Smooth animations and transitions
- 🔧 No build process required - pure HTML/CSS/JS
- 🚀 Ready for GitHub Pages deployment

## Setup Instructions

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/arunsanna/arunsanna.github.io.git
   ```

2. **Customize the content**
   - Update personal information in `index.html`
   - Replace placeholder images in the `assets/` folder:
     - `profile.jpg` - Your profile photo
     - `project1.jpg`, `project2.jpg`, `project3.jpg` - Project screenshots
     - `resume.pdf` - Your resume

3. **Update the following sections:**
   - **Hero Section**: Name, title, and description
   - **About**: Your background and information
   - **Skills**: Your technical skills
   - **Projects**: Your portfolio projects with links
   - **Experience**: Your work experience
   - **Contact**: Your contact information

4. **Deploy to GitHub Pages**
   - Push your changes to GitHub
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save and wait for deployment

## File Structure

```
arunsanna.github.io/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript functionality
├── assets/             # Images and documents
│   ├── profile.jpg     # Your profile photo
│   ├── project1.jpg    # Project screenshots
│   ├── project2.jpg
│   ├── project3.jpg
│   └── resume.pdf      # Your resume
└── README.md           # This file
```

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* ... other colors */
}
```

### Fonts
The site uses system fonts by default. To change, update the `font-family` in `styles.css`.

### Sections
Add or remove sections by editing `index.html` and corresponding styles in `styles.css`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Feel free to use this template for your own portfolio!