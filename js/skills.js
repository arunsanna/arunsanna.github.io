export function initializeSkillBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillItems = entry.target.querySelectorAll('.skill-item');
                
                skillItems.forEach((item, index) => {
                    setTimeout(() => {
                        const level = item.getAttribute('data-level');
                        const progressBar = item.querySelector('.skill-progress');
                        if (progressBar) {
                            progressBar.style.width = level + '%';
                            progressBar.setAttribute('data-level', level);
                        }
                    }, index * 100);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const skillsSection = document.querySelector('.skills-grid');
    if (skillsSection) {
        observer.observe(skillsSection);
    }
}