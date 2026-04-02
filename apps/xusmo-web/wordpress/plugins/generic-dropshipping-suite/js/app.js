document.addEventListener('DOMContentLoaded', () => {
    console.log('Dropnex Workspace Initialized');

    // Subtle parallax effect for background glow
    document.addEventListener('mousemove', (e) => {
        const glow = document.querySelector('.bg-glow');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        glow.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass-card').forEach(card => {
        observer.observe(card);
    });
});
