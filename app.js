(function() {
    // ==========================================
    // 3D PARTICLE BACKGROUND
    // ==========================================
    var canvas = document.getElementById('bgCanvas');
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: 0, y: 0 };
    var PARTICLE_COUNT = 80;
    var CONNECTION_DIST = 120;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
    }

    Particle.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;

        // Parallax with mouse
        var dx = mouse.x - canvas.width / 2;
        var dy = mouse.y - canvas.height / 2;
        this.x += dx * 0.0003 * this.z;
        this.y += dy * 0.0003 * this.z;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    };

    Particle.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.z, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108, 99, 255,' + (0.3 * this.z) + ')';
        ctx.fill();
    };

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    var opacity = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(108, 99, 255,' + opacity + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        drawConnections();
        requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // ==========================================
    // 3D TILT ON HERO
    // ==========================================
    var heroContent = document.querySelector('.hero-content');
    var hero = document.getElementById('hero');

    hero.addEventListener('mousemove', function(e) {
        var rect = hero.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        heroContent.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });

    hero.addEventListener('mouseleave', function() {
        heroContent.style.transform = 'rotateX(2deg)';
    });

    // ==========================================
    // SCROLL ANIMATIONS
    // ==========================================
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate skill bars
                if (entry.target.classList.contains('skill-item')) {
                    var fill = entry.target.querySelector('.skill-fill');
                    if (fill) {
                        setTimeout(function() {
                            fill.classList.add('animate');
                        }, 100);
                    }
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe all animatable elements
    document.querySelectorAll('.section-title, .project-card, .skill-item, .stat-card, .about-text, .contact-inner').forEach(function(el) {
        observer.observe(el);
    });

    // Stagger project cards
    var projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(function(card, i) {
        card.style.transitionDelay = (i * 0.08) + 's';
    });

    // Stagger skill items
    var skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(function(item, i) {
        item.style.transitionDelay = (i * 0.1) + 's';
    });

    // ==========================================
    // NAV ACTIVE STATE ON SCROLL
    // ==========================================
    var sections = document.querySelectorAll('.section');
    var navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY + 200;
        sections.forEach(function(section) {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                var id = section.id;
                navLinks.forEach(function(link) {
                    link.classList.toggle('active', link.dataset.section === id);
                });
            }
        });
    });

    // ==========================================
    // 3D CARD TILT ON HOVER
    // ==========================================
    document.querySelectorAll('.project-card, .stat-card, .contact-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = 'translateY(-6px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
        });

        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
        });
    });
})();
