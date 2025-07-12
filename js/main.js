import { initializeNavigation } from './navigation.js';
import { initializeAnimations } from './animations.js';
import { initializeSkillBars } from './skills.js';
import { initializeCounters } from './counters.js';
import { initializeTypingEffect } from './effects.js';
import { initializeGlitchEffect } from './effects.js';
import { initializeProjects } from './projects.js';
import { initializeEasterEgg } from './easter-egg.js';

document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
});

async function loadComponents() {
    const components = ['hero', 'about', 'projects', 'skills', 'experience', 'certifications', 'contact', 'footer'];
    const mainContent = document.getElementById('main-content');

    try {
        for (const component of components) {
            try {
                const response = await fetch(`components/${component}.html`);
                if (!response.ok) {
                    console.error(`Failed to load ${component}: ${response.status}`);
                    continue;
                }
                const html = await response.text();
                mainContent.innerHTML += html;
            } catch (error) {
                console.error(`Error loading ${component}:`, error);
            }
        }

        // After all components are loaded, initialize the scripts
        initializeNavigation();
        initializeAnimations();
        initializeSkillBars();
        initializeCounters();
        initializeTypingEffect();
        // initializeGlitchEffect(); // Disabled for simpler design
        initializeEasterEgg();
    initializeProjects();
    } catch (error) {
        console.error('Error in loadComponents:', error);
    }
}
