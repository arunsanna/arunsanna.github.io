export function initializeTypingEffect() {
    const typingElement = document.querySelector('.typing-effect');
    if (!typingElement) return;

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

// Terminal cursor blinking
setInterval(() => {
    const cursor = document.querySelector('.logo-cursor');
    if (cursor) {
        cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }
}, 500);