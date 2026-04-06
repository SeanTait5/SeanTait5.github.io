document.addEventListener('DOMContentLoaded', () => {
    // ---- Motion Toggle Logic ----
    const motionToggleBtn = document.getElementById('motion-toggle');
    const motionIconOn = document.getElementById('motion-icon-on');
    const motionIconOff = document.getElementById('motion-icon-off');

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const storedMotionPref = localStorage.getItem('motionPref');
    
    let isReducedMotion = storedMotionPref === 'reduced' || (!storedMotionPref && prefersReducedMotion);

    const applyMotionPreference = () => {
        if (isReducedMotion) {
            document.body.classList.add('reduced-motion');
            if (motionIconOn) motionIconOn.classList.add('hidden');
            if (motionIconOff) motionIconOff.classList.remove('hidden');
        } else {
            document.body.classList.remove('reduced-motion');
            if (motionIconOn) motionIconOn.classList.remove('hidden');
            if (motionIconOff) motionIconOff.classList.add('hidden');
        }
        document.dispatchEvent(new CustomEvent('motionToggled', { detail: { isReduced: isReducedMotion } }));
    };

    applyMotionPreference();

    if (motionToggleBtn) {
        motionToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isReducedMotion = !isReducedMotion;
            localStorage.setItem('motionPref', isReducedMotion ? 'reduced' : 'allow');
            applyMotionPreference();
        });
    }

    // ---- YouTube Inline Embed: Set src with origin to fix Error 153 ----
    const showcaseIframe = document.getElementById('youtube-showcase');
    if (showcaseIframe) {
        const origin = window.location.origin === 'null' ? '*' : window.location.origin;
        const videoId = "D8VoB7PpUu8";
        showcaseIframe.src = `https://www.youtube.com/embed/${videoId}?mute=1&enablejsapi=1&origin=${origin}`;
    }

    // ---- Filtering Logic removed ----
    const galleryItems = document.querySelectorAll('.gallery-item');

    // ---- Lightbox Logic ----
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.querySelector('.lightbox-content');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentLightboxImages = [];
    let currentLightboxIndex = 0;

    const updateLightboxMedia = () => {
        const existingMedia = lightboxContent.querySelector('img, video, iframe');
        if (existingMedia) existingMedia.remove();
        
        const mediaUrl = currentLightboxImages[currentLightboxIndex];
        const isVideo = mediaUrl.toLowerCase().endsWith('.mp4');

        if (isVideo) {
            const newVideo = document.createElement('video');
            newVideo.src = mediaUrl;
            newVideo.controls = true;
            newVideo.autoplay = true;
            newVideo.style.maxWidth = "100%";
            newVideo.style.maxHeight = "100%";
            lightboxContent.appendChild(newVideo);
        } else {
            const newImg = document.createElement('img');
            newImg.src = mediaUrl;
            newImg.alt = "Gallery Media";
            lightboxContent.appendChild(newImg);
        }
    };

    // Open Lightbox
    galleryItems.forEach(item => {
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const video = item.querySelector('video');
            const hasIframe = item.querySelector('iframe');

            if (hasIframe) return; // Allow direct interaction with YouTube player

            // Clear previous content
            const existingMedia = lightboxContent.querySelector('img, video, iframe');
            if (existingMedia) existingMedia.remove();

            const youtubeId = item.getAttribute('data-youtube-id');
            if (youtubeId) {
                const iframe = document.createElement('iframe');
                const origin = window.location.origin === 'null' ? '*' : window.location.origin;
                iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&enablejsapi=1&origin=${origin}`;
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.aspectRatio = "16/9";
                iframe.frameBorder = "0";
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                iframe.allowFullscreen = true;
                lightboxContent.appendChild(iframe);
                if(lightboxPrev) lightboxPrev.style.display = 'none';
                if(lightboxNext) lightboxNext.style.display = 'none';
            } else if (img) {
                // Check if this img has data-images for cycling
                const dataImagesStr = img.getAttribute('data-images');
                if (dataImagesStr) {
                    try {
                        currentLightboxImages = JSON.parse(dataImagesStr);
                        if (currentLightboxImages.length > 1) {
                            // Find the index of the currently shown image so it opens seamlessly
                            const currentSrc = img.getAttribute('src');
                            currentLightboxIndex = currentLightboxImages.findIndex(src => currentSrc.includes(src));
                            if (currentLightboxIndex === -1) currentLightboxIndex = 0;
                            
                            if(lightboxPrev) lightboxPrev.style.display = 'block';
                            if(lightboxNext) lightboxNext.style.display = 'block';
                        } else {
                            currentLightboxImages = [img.src];
                            currentLightboxIndex = 0;
                            if(lightboxPrev) lightboxPrev.style.display = 'none';
                            if(lightboxNext) lightboxNext.style.display = 'none';
                        }
                    } catch (e) {
                        currentLightboxImages = [img.src];
                        currentLightboxIndex = 0;
                        if(lightboxPrev) lightboxPrev.style.display = 'none';
                        if(lightboxNext) lightboxNext.style.display = 'none';
                    }
                } else {
                    currentLightboxImages = [img.src];
                    currentLightboxIndex = 0;
                    if(lightboxPrev) lightboxPrev.style.display = 'none';
                    if(lightboxNext) lightboxNext.style.display = 'none';
                }
                
                updateLightboxMedia();
            } else if (video) {
                const dataVideosStr = video.getAttribute('data-videos');
                if (dataVideosStr) {
                    try {
                        currentLightboxImages = JSON.parse(dataVideosStr);
                        const currentSrc = video.querySelector('source') ? video.querySelector('source').getAttribute('src') : video.getAttribute('src');
                        currentLightboxIndex = currentLightboxImages.findIndex(src => currentSrc.includes(src));
                        if (currentLightboxIndex === -1) currentLightboxIndex = 0;

                        if (currentLightboxImages.length > 1) {
                            if(lightboxPrev) lightboxPrev.style.display = 'block';
                            if(lightboxNext) lightboxNext.style.display = 'block';
                        } else {
                            if(lightboxPrev) lightboxPrev.style.display = 'none';
                            if(lightboxNext) lightboxNext.style.display = 'none';
                        }
                    } catch (e) {
                        currentLightboxImages = [video.querySelector('source')?.src || video.src];
                        currentLightboxIndex = 0;
                    }
                } else {
                    currentLightboxImages = [video.querySelector('source')?.src || video.src];
                    currentLightboxIndex = 0;
                    if(lightboxPrev) lightboxPrev.style.display = 'none';
                    if(lightboxNext) lightboxNext.style.display = 'none';
                }
                updateLightboxMedia();
            }

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
            
            lightbox.lastFocus = document.activeElement;
            setTimeout(() => {
                if (lightboxClose) lightboxClose.focus();
            }, 50);
        });
    });

    if (lightboxPrev && lightboxNext) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't close lightbox
            if (currentLightboxImages.length > 1) {
                currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
                updateLightboxMedia();
            }
        });

        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't close lightbox
            if (currentLightboxImages.length > 1) {
                currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
                updateLightboxMedia();
            }
        });
    }

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
        // Stop video playing after a short delay so the fade out animation completes first
        setTimeout(() => {
            const existingMedia = lightboxContent.querySelector('img, video, iframe');
            if (existingMedia) existingMedia.remove();
        }, 400);

        if (lightbox.lastFocus) {
            lightbox.lastFocus.focus();
            lightbox.lastFocus = null;
        }
    };

    lightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    // Close on clicking outside content
    const lightboxInner = document.querySelector('.lightbox-inner');
    lightbox.addEventListener('click', (e) => {
        // Only close if clicking directly on the lightbox background, not on images or arrows
        if (e.target === lightbox || e.target === lightboxInner) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft' && currentLightboxImages.length > 1) {
            currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
            updateLightboxMedia();
        } else if (e.key === 'ArrowRight' && currentLightboxImages.length > 1) {
            currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
            updateLightboxMedia();
        } else if (e.key === 'Tab') {
            const focusables = Array.from(lightbox.querySelectorAll('button, iframe, video, [tabindex]:not([tabindex="-1"])')).filter(el => el.style.display !== 'none');
            if (focusables.length > 0) {
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        }
    });

    // ---- Intersection Observer for fade-in elements ----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply observer to gallery items that aren't already visible on load
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        // Initial state for observer
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });

    // ---- Parallax Background Glow Logic (Horizontal Oscillation) ----
    const maxOffset = 180; // Max pixels to shift (increased by 20%)
    const scrollSpeed = 0.003; // How fast it shifts back and forth while scrolling

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Parallax glow oscillation
        const horizontalShift = Math.sin(scrollY * scrollSpeed) * maxOffset;
        document.documentElement.style.setProperty('--scroll-x', `${horizontalShift}px`);

        // Navbar: swap pill → solid bar after scrolling 60px
        const navbar = document.querySelector('.navbar');
        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ---- Image Carousel Logic (auto-swap only, no card arrows) ----
    const carouselImages = document.querySelectorAll('img[data-images]');
    carouselImages.forEach(img => {
        try {
            const images = JSON.parse(img.getAttribute('data-images'));
            if (images && images.length > 1) {
                let currentIndex = 0;
                img.style.transition = 'opacity 0.4s ease-in-out';

                const initialDelay = 3000 + Math.random() * 5000;
                setTimeout(() => {
                    const performSwap = () => {
                        img.style.opacity = '0';
                        setTimeout(() => {
                            currentIndex = (currentIndex + 1) % images.length;
                            img.src = images[currentIndex];
                            img.onload = () => { img.style.opacity = '1'; };
                            const nextInterval = 5000 + Math.random() * 10000;
                            setTimeout(performSwap, nextInterval);
                        }, 400);
                    };
                    performSwap();
                }, initialDelay);
            }
        } catch (e) {
            console.error("Error parsing data-images JSON", e);
        }
    });

    // ---- Video Carousel Logic (auto-swap for multi-video cards) ----
    const carouselVideos = document.querySelectorAll('video[data-videos]');
    carouselVideos.forEach(v => {
        try {
            const videosStr = v.getAttribute('data-videos');
            if (videosStr) {
                const videos = JSON.parse(videosStr);
                if (videos && videos.length > 1) {
                    let currentIndex = 0;
                    v.style.transition = 'opacity 0.4s ease-in-out';
                    
                    setInterval(() => {
                        v.style.opacity = '0';
                        setTimeout(() => {
                            currentIndex = (currentIndex + 1) % videos.length;
                            v.src = videos[currentIndex];
                            // Also update source tag if it exists
                            const source = v.querySelector('source');
                            if (source) source.src = videos[currentIndex];
                            
                            v.load(); 
                            v.style.opacity = '1';
                        }, 400);
                    }, 5000 + Math.random() * 5000);
                }
            }
        } catch (e) {
            console.error("Error parsing data-videos:", e);
        }
    });

});

// ---- Cyber Canvas Particle Network ----
(function () {
    const canvas = document.getElementById('cyberCanvas');
    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 120;
    const CONNECTION_DIST = 150;
    const COLORS = ['rgba(255,51,51,', 'rgba(33,107,255,'];

    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r = Math.random() * 2 + 1;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    let animationId;

    function drawParticles() {
        if (document.body.classList.contains('reduced-motion')) {
            animationId = null;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.5;
                    ctx.beginPath();
                    ctx.strokeStyle = particles[i].color + alpha + ')';
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes and move
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '0.8)';
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        animationId = requestAnimationFrame(drawParticles);
    }

    drawParticles();

    document.addEventListener('motionToggled', (e) => {
        if (!e.detail.isReduced && !animationId) {
            drawParticles();
        }
    });
})();
