export async function initializeSkillBars() {
    const skills = ['architecture', 'fullstack', 'cloud', 'networking', 'devops', 'monitoring', 'ai', 'programming', 'federal'];
    const skillsGrid = document.querySelector('.skills-grid');

    if (skillsGrid) {
        for (const skill of skills) {
            try {
                const response = await fetch(`components/skills/${skill}.html`);
                if (response.ok) {
                    const html = await response.text();
                    skillsGrid.innerHTML += html;
                } else {
                    console.error(`Failed to load skill: ${skill}`);
                }
            } catch (error) {
                console.error(`Error loading skill ${skill}:`, error);
            }
        }
    }

    // Progress bar animation observer
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBars = entry.target.querySelectorAll('.skill-progress');
                progressBars.forEach((bar, index) => {
                    setTimeout(() => {
                        const level = bar.getAttribute('data-level');
                        bar.style.width = level + '%';
                    }, index * 50);
                });
                progressObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe skill categories for progress bars
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach(category => {
        progressObserver.observe(category);
    });

    // Remove hover effects for consistency

    // Add keyboard navigation
    const cards = document.querySelectorAll('.skill-category, .cert-card');
    cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Smooth scroll to certifications
    const certSection = document.querySelector('.certifications-section');
    if (certSection) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        scrollObserver.observe(certSection);
    }
}