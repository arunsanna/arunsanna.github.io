import { initializeNavigation } from './navigation.js';
import { initializeAnimations } from './animations.js';
import { initializeSkillBars } from './skills.js';
import { initializeCounters } from './counters.js';
import { initializeTypingEffect } from './effects.js';
import { initializeGlitchEffect } from './effects.js';
import { initializeEasterEgg } from './easter-egg.js';

document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
});

async function loadComponents() {
    const components = ['hero', 'about', 'projects', 'skills', 'experience', 'certifications', 'contact', 'footer'];
    const mainContent = document.getElementById('main-content');

    for (const component of components) {
        const response = await fetch(`components/${component}.html`);
        const html = await response.text();
        mainContent.innerHTML += html;
    }

    // After all components are loaded, initialize the scripts
    initializeNavigation();
    initializeAnimations();
    initializeSkillBars();
    initializeCounters();
    initializeTypingEffect();
    initializeGlitchEffect();
    initializeEasterEgg();
}
