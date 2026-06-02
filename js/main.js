document.addEventListener('DOMContentLoaded', () => {

  // ===== Safari warning =====
  function isSafariBrowser() {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor || '';
    const hasSafariToken = /Safari/i.test(userAgent);
    const isAppleVendor = /Apple/i.test(vendor);
    const isOtherBrowser = /CriOS|Chrome|Chromium|Edg|EdgiOS|OPR|OPiOS|Firefox|FxiOS|SamsungBrowser|DuckDuckGo|Vivaldi/i.test(userAgent);

    return hasSafariToken && isAppleVendor && !isOtherBrowser;
  }

  function hasSeenSafariWarning() {
    try {
      return sessionStorage.getItem('safari-warning-dismissed') === 'true';
    } catch {
      return false;
    }
  }

  function markSafariWarningSeen() {
    try {
      sessionStorage.setItem('safari-warning-dismissed', 'true');
    } catch {}
  }

  function showSafariWarning() {
    const overlay = document.createElement('div');
    overlay.className = 'browser-warning-overlay';

    overlay.innerHTML = `
      <div class="browser-warning" role="dialog" aria-modal="true" aria-labelledby="browser-warning-title">
        <button type="button" class="browser-warning-close" aria-label="Close browser warning">
          <span></span>
          <span></span>
        </button>
        <p class="browser-warning-eyebrow">Browser Notice</p>
        <h2 class="browser-warning-title" id="browser-warning-title">Please open Chrome or other browsers</h2>
        <p class="browser-warning-body">Some features are not working in Safari browser.</p>
        <button type="button" class="browser-warning-btn">Continue Anyway</button>
      </div>
    `;

    const closeButton = overlay.querySelector('.browser-warning-close');
    const continueButton = overlay.querySelector('.browser-warning-btn');
    const handleWarningEscape = (event) => {
      if (event.key === 'Escape' && document.body.contains(overlay)) {
        closeWarning();
      }
    };

    function closeWarning() {
      overlay.classList.remove('visible');
      document.body.classList.remove('browser-warning-open');
      document.removeEventListener('keydown', handleWarningEscape);
      markSafariWarningSeen();

      setTimeout(() => {
        overlay.remove();
      }, 240);
    }

    closeButton.addEventListener('click', closeWarning);
    continueButton.addEventListener('click', closeWarning);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeWarning();
      }
    });

    document.addEventListener('keydown', handleWarningEscape);

    document.body.appendChild(overlay);
    document.body.classList.add('browser-warning-open');

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });
  }

  if (isSafariBrowser() && !hasSeenSafariWarning()) {
    showSafariWarning();
  }

  // ===== Navbar fade in =====
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    setTimeout(() => {
      navbar.classList.add('visible');
    }, 300);
  }

  // ===== Mobile Menu =====
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ===== Scroll Indicator =====
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    const isCaseStudy = !!document.querySelector('.cs-hook');
    const appearDelay = isCaseStudy ? 5000 : 3000;
    const hideDelay = appearDelay + 6000;

    setTimeout(() => {
      scrollIndicator.classList.add('show');
    }, appearDelay);

    setTimeout(() => {
      scrollIndicator.classList.remove('show');
    }, hideDelay);

    window.addEventListener('scroll', function hideOnScroll() {
      if (window.scrollY > 50) {
        scrollIndicator.classList.remove('show');
        window.removeEventListener('scroll', hideOnScroll);
      }
    });
  }

  // ===== Hero Typewriter =====
  const heroHeading = document.querySelector('.hero-heading');
  if (heroHeading) {
    const fullText = [
      { text: 'Motion,', highlight: true },
      { text: ' Rhythm & ', highlight: true },
      { text: 'Storytelling', highlight: true }
    ];

    // Build a flat array of characters with their highlight state
    const chars = [];
    fullText.forEach(segment => {
      for (let i = 0; i < segment.text.length; i++) {
        chars.push({ char: segment.text[i], highlight: segment.highlight });
      }
    });

    const totalChars = chars.length;
    const midPoint = Math.floor(totalChars * 0.45);
    let charIndex = 0;
    let fadeTriggered = false;

    // Add cursor
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    heroHeading.appendChild(cursor);

    // Start video fade-in shortly after typing begins
    const heroVideo = document.querySelector('.hero-video');
    const videoFallback = document.querySelector('.hero-video-fallback');

    if (heroVideo) {
      // Check if video can play
      heroVideo.addEventListener('error', () => {
        heroVideo.style.display = 'none';
        if (videoFallback) {
          videoFallback.style.display = 'block';
          videoFallback.classList.add('hero-video');
          videoFallback.classList.add('visible');
        }
      }, true);

      // Also check source error
      const source = heroVideo.querySelector('source');
      if (source) {
        source.addEventListener('error', () => {
          heroVideo.style.display = 'none';
          if (videoFallback) {
            videoFallback.style.display = 'block';
            videoFallback.classList.add('hero-video');
            setTimeout(() => videoFallback.classList.add('visible'), 50);
          }
        });
      }

      setTimeout(() => {
        heroVideo.classList.add('visible');
        heroVideo.play().catch(() => {});
      }, 500);

      // Pause on last frame when ended
      heroVideo.addEventListener('ended', () => {
        heroVideo.pause();
      });

      // Hover: replay from start
      heroVideo.addEventListener('mouseenter', () => {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
      });

      // Scroll: replay when hero comes back into view
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        let wasOutOfView = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) {
              wasOutOfView = true;
            } else if (wasOutOfView) {
              wasOutOfView = false;
              heroVideo.currentTime = 0;
              heroVideo.play().catch(() => {});
            }
          });
        }, { threshold: 0.3 });
        observer.observe(heroSection);
      }
    }

    // Track which span is currently open
    let currentSpan = null;
    let isInHighlight = false;

    function typeNextChar() {
      if (charIndex >= totalChars) {
        // Remove cursor after typing is done
        setTimeout(() => {
          cursor.remove();
        }, 600);
        return;
      }

      const { char, highlight } = chars[charIndex];

      // Trigger fade-ins at midpoint
      if (charIndex >= midPoint && !fadeTriggered) {
        fadeTriggered = true;
        triggerFadeIns();
      }

      // Handle highlight span transitions
      if (highlight && !isInHighlight) {
        // Start a new highlight span
        currentSpan = document.createElement('span');
        currentSpan.className = 'highlight';
        heroHeading.insertBefore(currentSpan, cursor);
        isInHighlight = true;
      } else if (!highlight && isInHighlight) {
        // Close the highlight span
        currentSpan = null;
        isInHighlight = false;
      }

      // Add character
      if (isInHighlight && currentSpan) {
        currentSpan.textContent += char;
      } else {
        const textNode = document.createTextNode(char);
        heroHeading.insertBefore(textNode, cursor);
      }

      charIndex++;
      setTimeout(typeNextChar, 60);
    }

    // Start typing after a short delay
    setTimeout(typeNextChar, 600);
  }

  // ===== Fade-in stagger =====
  function triggerFadeIns() {
    const tags = document.querySelector('.hero-tags.fade-in-up');
    const desc = document.querySelector('.hero-description.fade-in-up');
    const btn = document.querySelector('.hero-left .btn-glass.fade-in-up');

    if (tags) setTimeout(() => tags.classList.add('visible'), 0);
    if (desc) setTimeout(() => desc.classList.add('visible'), 200);
    if (btn) setTimeout(() => btn.classList.add('visible'), 400);
  }

  // ===== Scroll reveal =====
  const isProjectsPage = !document.querySelector('.hero') && !document.querySelector('.cs-hook');

  if (isProjectsPage) {
    document.querySelectorAll('.projects-section, .contact-section').forEach(section => {
      section.classList.add('revealed');
    });
  }

  const isMobile = window.innerWidth < 768;
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: isMobile ? 0.05 : 0.3,
    rootMargin: isMobile ? '0px' : '-100px'
  });

  if (!isProjectsPage) {
    // Sections that are safely below the fold on load
    const revealSections = document.querySelectorAll(
      '.about-section, .experience-section, .cs-about, .cs-first-impressions, .cs-features, .cs-explore, .cs-learned'
    );

    revealSections.forEach(section => {
      revealObserver.observe(section);
    });

    // Sections near the fold — defer observation until user scrolls
    const deferredSections = document.querySelectorAll('.projects-section, .cs-hero');
    if (deferredSections.length > 0) {
      let deferredStarted = false;
      window.addEventListener('scroll', function onFirstScroll() {
        if (!deferredStarted && window.scrollY > 50) {
          deferredStarted = true;
          deferredSections.forEach(section => {
            revealObserver.observe(section);
          });
          window.removeEventListener('scroll', onFirstScroll);
        }
    });
    }
  }

});
