/**
 * Precision Fluid Motion & Audio Engine
 * Nova (myra-celestine) — FOREST DEPARTMENT
 * Light Pink Theme Edition
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Scroll Progress Indicator at Top
     ========================================================================== */
  const progressBar = document.getElementById('scroll-progress-bar');
  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ==========================================================================
     2. Scroll-Triggered Reveal Animations
     ========================================================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Trigger immediate reveal for elements already in viewport
  setTimeout(() => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('revealed');
      }
    });
  }, 100);

  /* ==========================================================================
     3. Ambient Canvas Particle Mesh (Soft Rose & Light Pink Particles)
     ========================================================================== */
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 60;
    let pointer = { x: null, y: null, radius: isMobile ? 80 : 130 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Desktop mouse pointer
    window.addEventListener('mousemove', (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseout', () => {
      pointer.x = null;
      pointer.y = null;
    }, { passive: true });

    // Mobile touch interaction
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      setTimeout(() => {
        pointer.x = null;
        pointer.y = null;
      }, 400);
    }, { passive: true });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = Math.random() * 1.6 + 0.7;
        this.baseAlpha = Math.random() * 0.28 + 0.14;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (pointer.x !== null && pointer.y !== null) {
          const dx = pointer.x - this.x;
          const dy = pointer.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pointer.radius) {
            const force = (pointer.radius - dist) / pointer.radius;
            this.x -= (dx / dist) * force * 1.2;
            this.y -= (dy / dist) * force * 1.2;
            this.alpha = Math.min(0.85, this.baseAlpha + 0.45);
          } else {
            this.alpha = this.baseAlpha;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 63, 94, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function animateParticles() {
      if (!isVisible) {
        requestAnimationFrame(animateParticles);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==========================================================================
     4. Audio Controller & Immediate Autoplay Launch
     ========================================================================== */
  const audio = document.getElementById('theme-audio');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const mobileAudioToggle = document.getElementById('mobile-audio-toggle');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const eqVisualizer = document.getElementById('eq-visualizer');
  const audioStatusLabel = document.getElementById('audio-status-label');
  const entranceOverlay = document.getElementById('entrance-overlay');

  function updateAudioUI(isPlaying) {
    if (isPlaying) {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (eqVisualizer) eqVisualizer.classList.add('playing');
      if (audioStatusLabel) audioStatusLabel.textContent = 'Soundtrack ♫';
      if (audioToggleBtn) audioToggleBtn.classList.add('playing');
    } else {
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (eqVisualizer) eqVisualizer.classList.remove('playing');
      if (audioStatusLabel) audioStatusLabel.textContent = 'Paused';
      if (audioToggleBtn) audioToggleBtn.classList.remove('playing');
    }
  }

  function startAudioPlayback() {
    if (!audio) return;
    audio.muted = false;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updateAudioUI(true);
        })
        .catch(() => {
          // Fallback if browser blocks sound
          audio.muted = true;
          audio.play()
            .then(() => updateAudioUI(true))
            .catch(() => updateAudioUI(false));
        });
    }
  }

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      audio.muted = false;
      audio.play().then(() => updateAudioUI(true)).catch(() => {});
    } else {
      audio.pause();
      updateAudioUI(false);
    }
  }

  if (audioToggleBtn) audioToggleBtn.addEventListener('click', toggleAudio);
  if (mobileAudioToggle) mobileAudioToggle.addEventListener('click', toggleAudio);

  // Dismiss Entrance Screen & Start Soundtrack
  function dismissEntrance() {
    if (entranceOverlay && !entranceOverlay.classList.contains('dismissed')) {
      entranceOverlay.classList.add('dismissed');
      startAudioPlayback();
      setTimeout(() => {
        entranceOverlay.style.display = 'none';
      }, 650);
    }
  }

  if (entranceOverlay) {
    entranceOverlay.addEventListener('click', dismissEntrance);
    entranceOverlay.addEventListener('touchstart', dismissEntrance, { passive: true });
  }

  // Attempt instant browser playback
  if (audio) {
    audio.volume = 0.85;
    const autoPromise = audio.play();
    if (autoPromise !== undefined) {
      autoPromise.then(() => {
        updateAudioUI(true);
        if (entranceOverlay) {
          entranceOverlay.classList.add('dismissed');
          setTimeout(() => { entranceOverlay.style.display = 'none'; }, 650);
        }
      }).catch(() => {
        // Overlay waits for first user gesture
      });
    }
  }

  // Global one-gesture unmute listener
  window.addEventListener('click', () => {
    if (audio && audio.paused) {
      audio.muted = false;
      audio.play().then(() => updateAudioUI(true)).catch(() => {});
    }
  }, { once: true });

  window.addEventListener('touchstart', () => {
    if (audio && audio.paused) {
      audio.muted = false;
      audio.play().then(() => updateAudioUI(true)).catch(() => {});
    }
  }, { once: true, passive: true });

  /* ==========================================================================
     5. Embedded Discord Profile Button (Opens in Discord App)
     ========================================================================== */
  const discordAppBtn = document.getElementById('discord-app-btn');
  const feedbackLabel = document.getElementById('discord-click-feedback');

  if (discordAppBtn) {
    discordAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const discordUsername = 'nova_vance56';
      
      // Tactile vibration if supported
      if (navigator.vibrate) {
        navigator.vibrate(12);
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(discordUsername).catch(() => {});
      }
      
      if (feedbackLabel) {
        feedbackLabel.textContent = 'Copied! ✓';
        feedbackLabel.style.backgroundColor = '#10b981';
        setTimeout(() => {
          feedbackLabel.textContent = 'Open App ↗';
          feedbackLabel.style.backgroundColor = '';
        }, 2200);
      }

      // Trigger Discord Desktop or Mobile App URI
      window.location.href = 'discord://-/users/nova_vance56';

      // Fallback to web Discord profile
      setTimeout(() => {
        window.open('https://discord.com/users/nova_vance56', '_blank', 'noopener,noreferrer');
      }, 600);
    });
  }

  /* ==========================================================================
     6. 3D Tilt Dynamics on Profile Card (Desktop)
     ========================================================================== */
  const discordCard = document.getElementById('discord-card');
  if (discordCard && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    discordCard.addEventListener('mousemove', (e) => {
      const rect = discordCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 8;
      const rotateY = (x / rect.width) * 8;
      discordCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    discordCard.addEventListener('mouseleave', () => {
      discordCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }

  /* ==========================================================================
     7. Full Discord Profile Lightbox Modal
     ========================================================================== */
  const modal = document.getElementById('image-modal');
  const openModalBtn = document.getElementById('view-profile-modal-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  /* ==========================================================================
     8. Mobile Drawer Navigation & Smooth Scrolling
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isClosed = mobileMenu.classList.contains('hidden');
      if (isClosed) {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
      });
    });
  }

});
