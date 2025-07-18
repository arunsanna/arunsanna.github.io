export function initializeTypingEffect() {
    // Original typing effect for terminal
    const typingElement = document.querySelector('.typing-effect');
    if (typingElement) {
        const text = 'whoami';
        let index = 0;

        function type() {
            if (index < text.length) {
                typingElement.textContent = text.substring(0, index + 1);
                index++;
                setTimeout(type, 100);
            }
        }

        setTimeout(type, 500);
    }

    // New typing effect for hero badge
    const heroTypingElement = document.querySelector('.typing-text');
    if (heroTypingElement) {
        const text = heroTypingElement.getAttribute('data-text') || "Hello, I'm";
        let index = 0;
        heroTypingElement.textContent = '';
        
        // Add a class to control cursor visibility
        heroTypingElement.classList.add('typing');
        
        // Faster typing on mobile for better UX
        const isMobile = window.innerWidth <= 768;
        const typingSpeed = isMobile ? 50 : 100;
        const startDelay = isMobile ? 100 : 300;

        function typeHero() {
            if (index < text.length) {
                heroTypingElement.textContent = text.substring(0, index + 1);
                index++;
                setTimeout(typeHero, typingSpeed);
            } else {
                // Keep cursor blinking after typing is complete
                heroTypingElement.classList.remove('typing');
            }
        }

        setTimeout(typeHero, startDelay);
    }
}

export function initializeGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch');
    
    glitchElements.forEach(element => {
        // Update data-text attribute to match current text content
        const textContent = element.textContent.trim();
        element.setAttribute('data-text', textContent);
        
        setInterval(() => {
            if (Math.random() < 0.1) {
                element.style.animation = 'none';
                setTimeout(() => {
                    element.style.animation = '';
                }, 100);
            }
        }, 3000);
    });
}

// Terminal cursor blinking - disabled on mobile for better UX
if (window.innerWidth > 768) {
    setInterval(() => {
        const cursor = document.querySelector('.logo-cursor');
        if (cursor) {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }
    }, 500);
}