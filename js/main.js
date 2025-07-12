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
    initializeFloatingScroll();
});

function initializeFloatingScroll() {
    const scrollIndicator = document.querySelector('.scroll-indicator.floating');
    if (!scrollIndicator) return;

    function checkScroll() {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = 100; // Hide when within 100px of bottom
        const heroHeight = window.innerHeight; // Height of first viewport

        // No longer need to move to side - always on right

        // Hide at bottom
        if (scrollHeight - scrollPosition < threshold) {
            scrollIndicator.classList.add('hide');
        } else {
            scrollIndicator.classList.remove('hide');
        }
    }

    // Check on scroll and resize
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    
    // Initial check
    checkScroll();
}

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
