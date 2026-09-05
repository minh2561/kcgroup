/**
 * KC EVENT - CORE JAVASCRIPT
 * Modern Vanilla JS - Modular, Accessible, Zero Dependencies
 */

(function () {
  'use strict';

  // Global State
  let currentLightboxIndex = 0;
  let activeGalleryItems = [];

  document.addEventListener('DOMContentLoaded', () => {
    initDynamicConfig();
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initGallery();
    initLightbox();
    initQuoteModal();
    initFormValidation();
  });

  /* ==========================================================================
     1. DYNAMIC CONFIGURATION POPULATION
     ========================================================================== */
  function initDynamicConfig() {
    if (typeof siteConfig === 'undefined') return;

    // Hotline and Phone Links
    document.querySelectorAll('[data-bind="hotline"]').forEach(el => {
      el.textContent = siteConfig.contact.hotlineDisplay;
    });

    document.querySelectorAll('[data-bind="hotline-link"]').forEach(el => {
      el.setAttribute('href', `tel:${siteConfig.contact.hotlineRaw}`);
    });

    // Email Links
    document.querySelectorAll('[data-bind="email"]').forEach(el => {
      el.textContent = siteConfig.contact.email;
    });

    document.querySelectorAll('[data-bind="email-link"]').forEach(el => {
      el.setAttribute('href', `mailto:${siteConfig.contact.email}`);
    });

    // Address & Legal
    document.querySelectorAll('[data-bind="address"]').forEach(el => {
      el.textContent = siteConfig.contact.address;
    });

    document.querySelectorAll('[data-bind="tax-code"]').forEach(el => {
      el.textContent = siteConfig.brand.taxCode;
    });

    document.querySelectorAll('[data-bind="legal-name"]').forEach(el => {
      el.textContent = siteConfig.brand.legalName;
    });

    // Dynamic Year
    document.querySelectorAll('[data-bind="current-year"]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ==========================================================================
     2. STICKY HEADER & SCROLL BEHAVIOR
     ========================================================================== */
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  /* ==========================================================================
     3. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    const backdrop = document.querySelector('.drawer-backdrop');
    const mobileLinks = document.querySelectorAll('.mobile-drawer .nav-link');

    if (!toggleBtn || !drawer || !backdrop) return;

    function openMenu() {
      toggleBtn.classList.add('is-active');
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
      backdrop.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      toggleBtn.classList.remove('is-active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    backdrop.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ==========================================================================
     4. SMOOTH SCROLL WITH HEADER OFFSET
     ========================================================================== */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    const header = document.querySelector('.site-header');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#' || !targetId.startsWith('#')) return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = (header ? header.offsetHeight : 70) + 10;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Accessibility: set focus
          targetEl.setAttribute('tabindex', '-1');
          targetEl.focus({ preventScroll: true });
        }
      });
    });
  }

  /* ==========================================================================
     5. GALLERY FILTER & RENDERING
     ========================================================================== */
  function initGallery() {
    const container = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!container || typeof galleryItems === 'undefined') return;

    activeGalleryItems = [...galleryItems];

    function renderGallery(items) {
      container.innerHTML = '';
      items.forEach((item, index) => {
        const itemEl = document.createElement('article');
        itemEl.className = 'gallery-item';
        itemEl.setAttribute('data-category', item.category);
        itemEl.setAttribute('data-index', index);
        itemEl.setAttribute('tabindex', '0');
        itemEl.setAttribute('role', 'button');
        itemEl.setAttribute('aria-label', `Xem chi tiết ảnh: ${item.title}`);

        itemEl.innerHTML = `
          <div class="gallery-thumb">
            <img src="${item.src}" alt="${item.alt}" width="${item.width}" height="${item.height}" loading="lazy">
            <div class="gallery-overlay-hint">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </div>
          </div>
          <div class="gallery-info">
            <h3 class="gallery-item-title">${item.title}</h3>
            <span class="gallery-item-client">${item.client} • ${item.categoryName}</span>
          </div>
        `;

        itemEl.addEventListener('click', () => {
          openLightbox(index);
        });

        itemEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(index);
          }
        });

        container.appendChild(itemEl);
      });
    }

    // Initial render
    renderGallery(activeGalleryItems);

    // Filtering logic
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        if (filter === 'all') {
          activeGalleryItems = [...galleryItems];
        } else {
          activeGalleryItems = galleryItems.filter(item => item.category === filter);
        }
        renderGallery(activeGalleryItems);
      });
    });
  }

  /* ==========================================================================
     6. LIGHTBOX INTERACTIVE VIEWER
     ========================================================================== */
  function initLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) return;

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', prevLightboxImage);
    if (nextBtn) nextBtn.addEventListener('click', nextLightboxImage);

    // Close when clicking backdrop
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'ArrowRight') nextLightboxImage();
    });
  }

  function openLightbox(index) {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox || !activeGalleryItems[index]) return;

    currentLightboxIndex = index;
    updateLightboxContent();

    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function prevLightboxImage() {
    if (currentLightboxIndex > 0) {
      currentLightboxIndex--;
    } else {
      currentLightboxIndex = activeGalleryItems.length - 1;
    }
    updateLightboxContent();
  }

  function nextLightboxImage() {
    if (currentLightboxIndex < activeGalleryItems.length - 1) {
      currentLightboxIndex++;
    } else {
      currentLightboxIndex = 0;
    }
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) return;

    const item = activeGalleryItems[currentLightboxIndex];
    const img = lightbox.querySelector('.lightbox-image');
    const title = lightbox.querySelector('.lightbox-title');
    const meta = lightbox.querySelector('.lightbox-meta');

    if (img) {
      img.src = item.src;
      img.alt = item.alt;
    }

    if (title) {
      title.textContent = item.title;
    }

    if (meta) {
      meta.textContent = `${item.client} • ${item.location} (${currentLightboxIndex + 1}/${activeGalleryItems.length})`;
    }
  }

  /* ==========================================================================
     7. QUOTE MODAL POPUP
     ========================================================================== */
  function initQuoteModal() {
    const modal = document.getElementById('quote-modal');
    const triggers = document.querySelectorAll('[data-open-modal="quote"]');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');

    function openModal() {
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }

    function closeModal() {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    triggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     8. FORM VALIDATION & SUBMISSION HANDLER
     ========================================================================== */
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate="true"]');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        // Name
        const nameInput = form.querySelector('[name="fullname"]');
        if (nameInput) {
          if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
            setFieldInvalid(nameInput, 'Vui lòng nhập họ và tên (tối thiểu 2 ký tự)');
            isValid = false;
          } else {
            setFieldValid(nameInput);
          }
        }

        // Phone (Vietnam phone number standard: 10 digits starting with 0)
        const phoneInput = form.querySelector('[name="phone"]');
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        if (phoneInput) {
          const phoneVal = phoneInput.value.trim().replace(/\s|\./g, '');
          if (!phoneRegex.test(phoneVal)) {
            setFieldInvalid(phoneInput, 'Vui lòng nhập số điện thoại hợp lệ (10 chữ số)');
            isValid = false;
          } else {
            setFieldValid(phoneInput);
          }
        }

        // Email (optional, but if provided must be valid)
        const emailInput = form.querySelector('[name="email"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput && emailInput.value.trim()) {
          if (!emailRegex.test(emailInput.value.trim())) {
            setFieldInvalid(emailInput, 'Email không đúng định dạng');
            isValid = false;
          } else {
            setFieldValid(emailInput);
          }
        }

        // Company
        const companyInput = form.querySelector('[name="company"]');
        if (companyInput) {
          if (!companyInput.value.trim()) {
            setFieldInvalid(companyInput, 'Vui lòng nhập tên công ty hoặc doanh nghiệp');
            isValid = false;
          } else {
            setFieldValid(companyInput);
          }
        }

        // Service
        const serviceSelect = form.querySelector('[name="service"]');
        if (serviceSelect) {
          if (!serviceSelect.value) {
            setFieldInvalid(serviceSelect, 'Vui lòng chọn loại dịch vụ yêu cầu');
            isValid = false;
          } else {
            setFieldValid(serviceSelect);
          }
        }

        // Agreement Checkbox
        const agreeCheck = form.querySelector('[name="agree"]');
        if (agreeCheck) {
          if (!agreeCheck.checked) {
            const wrap = agreeCheck.closest('.form-checkbox-wrap');
            if (wrap) wrap.style.outline = '1px solid #ef4444';
            isValid = false;
          } else {
            const wrap = agreeCheck.closest('.form-checkbox-wrap');
            if (wrap) wrap.style.outline = 'none';
          }
        }

        if (isValid) {
          // Success Feedback
          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn ? submitBtn.innerHTML : 'Gửi yêu cầu';

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
              <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
              </svg>
              Đang gửi yêu cầu...
            `;
          }

          // Simulate brief processing for pleasant UX
          setTimeout(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }

            form.reset();

            // Close modal if form is in modal
            const parentModal = form.closest('.modal-overlay');
            if (parentModal) {
              parentModal.classList.remove('is-active');
              document.body.style.overflow = '';
            }

            showToast(
              'Gửi yêu cầu thành công!',
              'Cảm ơn quý khách. Chuyên viên tư vấn của KC Event sẽ liên hệ lại trong vòng 15-30 phút.'
            );
          }, 600);
        }
      });
    });
  }

  function setFieldInvalid(el, msg) {
    el.classList.add('is-invalid');
    let errorEl = el.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error';
      el.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function setFieldValid(el) {
    el.classList.remove('is-invalid');
    const errorEl = el.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }

  /* ==========================================================================
     9. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(title, message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="toast-content">
        <h4 class="toast-title">${title}</h4>
        <p class="toast-message">${message}</p>
      </div>
    `;

    container.appendChild(toast);

    // Animation trigger
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4500);
  }

})();
