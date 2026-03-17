(function() {
    var mouse = { x: 0, y: 0, nx: 0, ny: 0 };

    // ==========================================
    // LOADING SCREEN (smooth eased fill)
    // ==========================================
    var loader = document.getElementById('loader');
    var loaderFill = document.getElementById('loaderFill');
    var loadTarget = 0;
    var loadCurrent = 0;
    var loadDone = false;

    function tickLoader() {
        if (loadDone) return;
        loadCurrent += (loadTarget - loadCurrent) * 0.08;
        if (loadCurrent > 99.5 && loadTarget >= 100) {
            loadCurrent = 100;
            loadDone = true;
            loaderFill.style.width = '100%';
            setTimeout(function() {
                loader.classList.add('done');
                document.body.classList.add('loaded');
            }, 400);
            return;
        }
        loaderFill.style.width = loadCurrent.toFixed(1) + '%';
        requestAnimationFrame(tickLoader);
    }

    // Start at 0, ease toward 70 immediately
    loadTarget = 70;
    requestAnimationFrame(tickLoader);

    window.addEventListener('load', function() {
        loadTarget = 100;
    });

    // ==========================================
    // CUSTOM CURSOR
    // ==========================================
    var cursor = document.getElementById('cursor');
    var trail = document.getElementById('cursorTrail');
    var cursorX = 0, cursorY = 0, trailX = 0, trailY = 0;

    document.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    });

    // Smooth trail follow
    function updateTrail() {
        trailX += (cursorX - trailX) * 0.15;
        trailY += (cursorY - trailY) * 0.15;
        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';
        requestAnimationFrame(updateTrail);
    }
    updateTrail();

    // Hover effect on interactive elements
    document.addEventListener('mouseover', function(e) {
        var target = e.target.closest('a, button, .project-card, .stat-card, .contact-card, .tag, .nav-link');
        if (target) {
            cursor.classList.add('hover');
            trail.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', function(e) {
        var target = e.target.closest('a, button, .project-card, .stat-card, .contact-card, .tag, .nav-link');
        if (target) {
            cursor.classList.remove('hover');
            trail.classList.remove('hover');
        }
    });

    // ==========================================
    // TYPEWRITER EFFECT
    // ==========================================
    var typeEl = document.getElementById('typewriter');
    var phrases = [
        'Building modern web apps with vanilla JS, Supabase & Next.js',
        'Shipping fast with AI tools like Claude Code & Antigravity',
        'Crafting pixel-perfect, mobile-first experiences'
    ];
    var phraseIdx = 0, charIdx = 0, deleting = false, typeDelay = 0;
    var cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';
    typeEl.appendChild(cursorSpan);

    function typewrite() {
        var current = phrases[phraseIdx];
        if (!deleting) {
            charIdx++;
            if (charIdx > current.length) {
                typeDelay = 2000;
                deleting = true;
            } else {
                typeDelay = 40 + Math.random() * 40;
            }
        } else {
            charIdx--;
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                typeDelay = 500;
            } else {
                typeDelay = 20;
            }
        }
        typeEl.textContent = current.substring(0, charIdx);
        typeEl.appendChild(cursorSpan);
        setTimeout(typewrite, typeDelay);
    }
    // Start typewriter after loader
    setTimeout(typewrite, 1500);

    // ==========================================
    // ANIMATED COUNTERS
    // ==========================================
    function animateCounters() {
        document.querySelectorAll('.stat-number[data-count]').forEach(function(el) {
            if (el.dataset.counted) return;
            var rect = el.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) return;
            el.dataset.counted = 'true';

            var target = parseInt(el.dataset.count);
            var suffix = el.dataset.suffix || '';
            var duration = 1500;
            var start = performance.now();

            function tick(now) {
                var elapsed = now - start;
                var progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.round(eased * target);
                el.textContent = current + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }
    window.addEventListener('scroll', animateCounters);
    setTimeout(animateCounters, 2000);

    // ==========================================
    // THREE.JS — HERO SCENE
    // Floating wireframe icosahedron + orbiting particles
    // ==========================================
    var heroContainer = document.getElementById('three-hero');
    var heroScene = new THREE.Scene();
    var heroCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    heroCamera.position.z = 5;

    var heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroContainer.appendChild(heroRenderer.domElement);

    // Main icosahedron wireframe
    var icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
    var icoMat = new THREE.MeshBasicMaterial({
        color: 0x6c63ff,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    var icosahedron = new THREE.Mesh(icoGeo, icoMat);
    heroScene.add(icosahedron);

    // Store original vertex positions for scroll-driven explosion
    var icoOrigPositions = new Float32Array(icoGeo.attributes.position.array);
    var scrollExplode = 0; // 0 = normal, 1 = fully exploded

    // Inner icosahedron (smaller, different rotation)
    var innerGeo = new THREE.IcosahedronGeometry(1.0, 0);
    var innerMat = new THREE.MeshBasicMaterial({
        color: 0x00d4aa,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    var innerIco = new THREE.Mesh(innerGeo, innerMat);
    heroScene.add(innerIco);

    // Orbiting particles
    var particleCount = 200;
    var particleGeo = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    var sizes = new Float32Array(particleCount);

    for (var i = 0; i < particleCount; i++) {
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        var r = 2.5 + Math.random() * 3;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        sizes[i] = Math.random() * 3 + 1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    var particleMat = new THREE.PointsMaterial({
        color: 0x6c63ff,
        size: 0.03,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    heroScene.add(particles);

    // Connecting lines between nearby particles
    var lineGeo = new THREE.BufferGeometry();
    var linePositions = [];
    var posArr = particleGeo.attributes.position.array;
    for (var i = 0; i < particleCount; i++) {
        for (var j = i + 1; j < particleCount; j++) {
            var dx = posArr[i*3] - posArr[j*3];
            var dy = posArr[i*3+1] - posArr[j*3+1];
            var dz = posArr[i*3+2] - posArr[j*3+2];
            var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist < 1.2) {
                linePositions.push(posArr[i*3], posArr[i*3+1], posArr[i*3+2]);
                linePositions.push(posArr[j*3], posArr[j*3+1], posArr[j*3+2]);
            }
        }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    var lineMat = new THREE.LineBasicMaterial({
        color: 0x6c63ff,
        transparent: true,
        opacity: 0.08
    });
    var lines = new THREE.LineSegments(lineGeo, lineMat);
    heroScene.add(lines);

    // Torus ring
    var torusGeo = new THREE.TorusGeometry(2.8, 0.01, 8, 100);
    var torusMat = new THREE.MeshBasicMaterial({
        color: 0x00d4aa,
        transparent: true,
        opacity: 0.2
    });
    var torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 3;
    heroScene.add(torus);

    // ==========================================
    // THREE.JS — SKILLS SCENE
    // Floating 3D tech cubes
    // ==========================================
    var skillsContainer = document.getElementById('three-skills');
    var skillsScene = new THREE.Scene();
    var skillsCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    skillsCamera.position.z = 8;

    var skillsRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    skillsRenderer.setSize(window.innerWidth, window.innerHeight);
    skillsRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    skillsContainer.appendChild(skillsRenderer.domElement);

    var skillCubes = [];
    var skillNames = ['JS', 'TS', 'React', 'Next', 'PHP', 'Py', 'Node', 'SQL', 'CSS', 'Git'];
    var skillColors = [0xf7df1e, 0x3178c6, 0x61dafb, 0x000000, 0x777bb3, 0x3776ab, 0x68a063, 0x336791, 0x264de4, 0xf05032];

    for (var i = 0; i < skillNames.length; i++) {
        var cubeGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        var edges = new THREE.EdgesGeometry(cubeGeo);
        var edgeMat = new THREE.LineBasicMaterial({
            color: skillColors[i],
            transparent: true,
            opacity: 0.6
        });
        var cubeEdges = new THREE.LineSegments(edges, edgeMat);

        // Create filled face with low opacity
        var faceMat = new THREE.MeshBasicMaterial({
            color: skillColors[i],
            transparent: true,
            opacity: 0.08
        });
        var cubeFace = new THREE.Mesh(cubeGeo, faceMat);

        var group = new THREE.Group();
        group.add(cubeEdges);
        group.add(cubeFace);

        // Spread in a sphere
        var angle = (i / skillNames.length) * Math.PI * 2;
        var radius = 3 + Math.random() * 1.5;
        var yOffset = (Math.random() - 0.5) * 3;
        group.position.set(
            Math.cos(angle) * radius,
            yOffset,
            Math.sin(angle) * radius
        );
        group.userData = {
            baseX: group.position.x,
            baseY: group.position.y,
            baseZ: group.position.z,
            rotSpeed: 0.005 + Math.random() * 0.01,
            floatSpeed: 0.5 + Math.random() * 0.5,
            floatAmp: 0.3 + Math.random() * 0.3,
            orbitSpeed: 0.0003 + Math.random() * 0.0005,
            orbitAngle: angle
        };

        skillsScene.add(group);
        skillCubes.push(group);
    }

    // Add a central sphere for skills
    var centerGeo = new THREE.SphereGeometry(0.4, 16, 16);
    var centerMat = new THREE.MeshBasicMaterial({
        color: 0x6c63ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    var centerSphere = new THREE.Mesh(centerGeo, centerMat);
    skillsScene.add(centerSphere);

    // ==========================================
    // ANIMATION LOOP
    // ==========================================
    var clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        var t = clock.getElapsedTime();

        // Scroll-driven icosahedron explosion
        var heroSection = document.getElementById('hero');
        var heroRect = heroSection.getBoundingClientRect();
        var heroProgress = Math.max(0, Math.min(1, -heroRect.top / (heroRect.height * 0.6)));
        scrollExplode += (heroProgress - scrollExplode) * 0.05;

        var posAttr = icoGeo.attributes.position;
        for (var vi = 0; vi < posAttr.count; vi++) {
            var ox = icoOrigPositions[vi * 3];
            var oy = icoOrigPositions[vi * 3 + 1];
            var oz = icoOrigPositions[vi * 3 + 2];
            var explodeScale = 1 + scrollExplode * 2.5;
            posAttr.array[vi * 3] = ox * explodeScale;
            posAttr.array[vi * 3 + 1] = oy * explodeScale;
            posAttr.array[vi * 3 + 2] = oz * explodeScale;
        }
        posAttr.needsUpdate = true;

        // Fade icosahedron as it explodes
        icoMat.opacity = 0.25 * (1 - scrollExplode * 0.7);
        innerMat.opacity = 0.15 * (1 - scrollExplode * 0.8);

        // Hero scene
        icosahedron.rotation.x = t * 0.15 + mouse.ny * 0.3;
        icosahedron.rotation.y = t * 0.2 + mouse.nx * 0.3;

        innerIco.rotation.x = -t * 0.2 + mouse.ny * 0.2;
        innerIco.rotation.y = -t * 0.25 + mouse.nx * 0.2;

        particles.rotation.y = t * 0.05;
        particles.rotation.x = t * 0.02;
        lines.rotation.y = t * 0.05;
        lines.rotation.x = t * 0.02;

        torus.rotation.z = t * 0.1;

        // Camera follows mouse slightly
        heroCamera.position.x += (mouse.nx * 0.5 - heroCamera.position.x) * 0.02;
        heroCamera.position.y += (mouse.ny * 0.3 - heroCamera.position.y) * 0.02;
        heroCamera.lookAt(0, 0, 0);

        heroRenderer.render(heroScene, heroCamera);

        // Skills scene
        centerSphere.rotation.x = t * 0.3;
        centerSphere.rotation.y = t * 0.4;

        for (var i = 0; i < skillCubes.length; i++) {
            var cube = skillCubes[i];
            var d = cube.userData;

            // Orbit around center
            d.orbitAngle += d.orbitSpeed;
            var radius = Math.sqrt(d.baseX * d.baseX + d.baseZ * d.baseZ);
            cube.position.x = Math.cos(d.orbitAngle) * radius;
            cube.position.z = Math.sin(d.orbitAngle) * radius;
            cube.position.y = d.baseY + Math.sin(t * d.floatSpeed) * d.floatAmp;

            // Self rotation
            cube.rotation.x += d.rotSpeed;
            cube.rotation.y += d.rotSpeed * 0.7;
        }

        skillsCamera.position.x += (mouse.nx * 0.8 - skillsCamera.position.x) * 0.02;
        skillsCamera.position.y += (mouse.ny * 0.5 - skillsCamera.position.y) * 0.02;
        skillsCamera.lookAt(0, 0, 0);

        skillsRenderer.render(skillsScene, skillsCamera);
    }
    animate();

    // ==========================================
    // RESIZE
    // ==========================================
    window.addEventListener('resize', function() {
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);

        skillsCamera.aspect = window.innerWidth / window.innerHeight;
        skillsCamera.updateProjectionMatrix();
        skillsRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ==========================================
    // 3D TILT ON HERO TEXT
    // ==========================================
    var heroContent = document.querySelector('.hero-content');
    var hero = document.getElementById('hero');

    hero.addEventListener('mousemove', function(e) {
        var rect = hero.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        heroContent.style.transform = 'rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) translateZ(20px)';
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
                if (entry.target.classList.contains('skill-item')) {
                    var fill = entry.target.querySelector('.skill-fill');
                    var pctEl = entry.target.querySelector('.skill-pct');
                    if (fill) {
                        setTimeout(function() { fill.classList.add('animate'); }, 100);
                    }
                    if (pctEl && !pctEl.dataset.animated) {
                        pctEl.dataset.animated = 'true';
                        var target = parseInt(pctEl.dataset.pct);
                        var start = performance.now();
                        var duration = 1200;
                        (function countPct(now) {
                            var elapsed = now - start;
                            var progress = Math.min(elapsed / duration, 1);
                            var eased = 1 - Math.pow(1 - progress, 3);
                            pctEl.textContent = Math.round(eased * target) + '%';
                            if (progress < 1) requestAnimationFrame(countPct);
                        })(start);
                    }
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-title, .project-card, .skill-item, .stat-card, .about-text, .contact-inner').forEach(function(el) {
        observer.observe(el);
    });

    // Stagger animations
    document.querySelectorAll('.project-card').forEach(function(card, i) {
        card.style.transitionDelay = (i * 0.08) + 's';
    });
    document.querySelectorAll('.skill-item').forEach(function(item, i) {
        item.style.transitionDelay = (i * 0.1) + 's';
    });

    // ==========================================
    // NAV ACTIVE STATE
    // ==========================================
    var sections = document.querySelectorAll('.section');
    var navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY + 200;
        sections.forEach(function(section) {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                navLinks.forEach(function(link) {
                    link.classList.toggle('active', link.dataset.section === section.id);
                });
            }
        });

        // Toggle 3D scenes based on scroll position
        var skillsSection = document.getElementById('skills');
        var skillsRect = skillsSection.getBoundingClientRect();
        var inSkills = skillsRect.top < window.innerHeight * 0.5 && skillsRect.bottom > window.innerHeight * 0.3;
        skillsContainer.classList.toggle('active', inSkills);
        heroContainer.style.opacity = inSkills ? '0.2' : '1';
    });

    // ==========================================
    // 3D CARD TILT ON HOVER
    // ==========================================
    document.querySelectorAll('.project-card, .stat-card, .contact-card').forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = 'perspective(800px) translateY(-6px) rotateY(' + (x * 15) + 'deg) rotateX(' + (-y * 15) + 'deg)';
        });
        card.addEventListener('mouseleave', function() {
            card.style.transform = '';
        });
    });

    // ==========================================
    // DARK / LIGHT THEME TOGGLE
    // ==========================================
    var themeBtn = document.getElementById('themeToggle');
    var themeIcon = document.getElementById('themeIcon');
    var isDark = localStorage.getItem('resume-theme') !== 'light';

    function applyTheme() {
        document.body.classList.toggle('light', !isDark);
        themeIcon.innerHTML = isDark
            ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
            : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
    }
    applyTheme();

    themeBtn.addEventListener('click', function() {
        isDark = !isDark;
        localStorage.setItem('resume-theme', isDark ? 'dark' : 'light');
        applyTheme();
    });

    // ==========================================
    // AMBIENT SOUND TOGGLE (Web Audio)
    // ==========================================
    var soundBtn = document.getElementById('soundToggle');
    var audioCtx = null;
    var ambientGain = null;
    var soundOn = false;
    var oscillators = [];

    function createAmbient() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        ambientGain = audioCtx.createGain();
        ambientGain.gain.value = 0;
        ambientGain.connect(audioCtx.destination);

        // Layered soft drones
        var freqs = [55, 82.5, 110, 165];
        freqs.forEach(function(f) {
            var osc = audioCtx.createOscillator();
            var oscGain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            oscGain.gain.value = 0.03;
            osc.connect(oscGain);
            oscGain.connect(ambientGain);
            osc.start();
            oscillators.push(osc);
        });
    }

    function toggleSound() {
        soundOn = !soundOn;
        soundBtn.classList.toggle('muted', !soundOn);
        if (soundOn) {
            createAmbient();
            ambientGain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 1);
        } else if (ambientGain) {
            ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        }
    }

    soundBtn.addEventListener('click', toggleSound);
    soundBtn.classList.add('muted');

    // ==========================================
    // PARALLAX DEPTH LAYERS (subtle mouse-only, no scroll shift)
    // ==========================================
    var parallaxLayers = document.querySelectorAll('.parallax-layer');

    function updateParallax() {
        parallaxLayers.forEach(function(layer) {
            var speed = parseFloat(layer.dataset.speed) || 0.03;
            var xOffset = mouse.nx * speed * 40;
            var yOffset = mouse.ny * speed * 40;
            layer.style.transform = 'translate(' + xOffset + 'px, ' + yOffset + 'px)';
        });
        requestAnimationFrame(updateParallax);
    }
    updateParallax();
})();
