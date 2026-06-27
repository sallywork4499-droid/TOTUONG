/* ============================================================
   main.js – Landing Page Shop Tô Tượng Ngọc Hồi
   ============================================================ */

(() => {
    'use strict';

    /* -------------------------------------------------- */
    /* 1. NAVBAR – scroll class + hamburger               */
    /* -------------------------------------------------- */
    const navbar     = document.getElementById('navbar');
    const hamburger  = document.getElementById('hamburger');
    const navMenu    = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    hamburger?.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu on link click
    navMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });

    /* -------------------------------------------------- */
    /* 2. SMOOTH SCROLL (with navbar + banner offset)     */
    /* -------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();

            const navH    = navbar?.offsetHeight  ?? 72;
            const bannerH = document.querySelector('.countdown-banner')?.offsetHeight ?? 46;
            const offset  = navH + bannerH + 16;

            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* -------------------------------------------------- */
    /* 3. COUNTDOWN TIMER – 28/07/2026 00:00              */
    /* -------------------------------------------------- */
    const LAUNCH_DATE = new Date('2026-07-28T00:00:00+07:00').getTime();

    const elDays  = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins  = document.getElementById('cd-mins');
    const elSecs  = document.getElementById('cd-secs');

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdown() {
        const now  = Date.now();
        const diff = LAUNCH_DATE - now;

        if (diff <= 0) {
            // Already launched
            elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = '00';
            return;
        }

        const days  = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins  = Math.floor((diff % 3600000)  / 60000);
        const secs  = Math.floor((diff % 60000)    / 1000);

        elDays.textContent  = pad(days);
        elHours.textContent = pad(hours);
        elMins.textContent  = pad(mins);
        elSecs.textContent  = pad(secs);
    }

    if (elSecs) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    /* -------------------------------------------------- */
    /* 4. SCROLL REVEAL (IntersectionObserver)            */
    /* -------------------------------------------------- */
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger children of grids
                const siblings = [...(entry.target.parentElement?.children ?? [])];
                const idx      = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${idx * 80}ms`;
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    /* -------------------------------------------------- */
    /* 5. FAQ ACCORDION                                   */
    /* -------------------------------------------------- */
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn    = item.querySelector('.faq-q');
        const answer = item.querySelector('.faq-a');

        btn?.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item.active').forEach(openItem => {
                openItem.classList.remove('active');
                openItem.querySelector('.faq-a').style.maxHeight = null;
            });

            // Open clicked if was closed
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    /* -------------------------------------------------- */
    /* 6. BOOKING FORM                                    */
    /* -------------------------------------------------- */
    const bookingForm = document.getElementById('booking-form');
    const submitBtn   = document.getElementById('submit-btn');
    const formSuccess = document.getElementById('form-success');

    // Set min date to today
    const dateInput = document.getElementById('f-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    bookingForm?.addEventListener('submit', e => {
        e.preventDefault();

        const name  = document.getElementById('f-name')?.value.trim();
        const phone = document.getElementById('f-phone')?.value.trim();
        const date  = document.getElementById('f-date')?.value;
        const time  = document.getElementById('f-time')?.value;
        const email = document.getElementById('f-email')?.value.trim();

        // Simple validation
        if (!name || !phone || !date || !time) {
            shake(submitBtn);
            showFieldErrors({ name, phone, date, time });
            return;
        }

        if (!isValidPhone(phone)) {
            shake(submitBtn);
            alert('Số điện thoại không hợp lệ. Vui lòng nhập lại!');
            return;
        }

        const people = document.getElementById('f-people')?.value.trim();
        const note   = document.getElementById('f-note')?.value.trim();

        // Generate Order ID and Amount
        const orderId = 'TT' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        const amount = '19.000đ';

        // Show loading state
        submitBtn.textContent = 'Đang gửi...';
        submitBtn.disabled    = true;

        // Prepare data for Google Apps Script
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('date', date);
        formData.append('time', time);
        formData.append('email', email || '');
        formData.append('people', people || '');
        formData.append('note', note || '');
        formData.append('orderId', orderId);
        formData.append('amount', amount);

        // Send data
        const scriptURL = 'https://script.google.com/macros/s/AKfycbwp22eAJPXmsVFRX_Ze60MrgXR9NIJFD9UEX-V6Uc4xWK-tJjD8p4RFyqMbaZIApxgahQ/exec';
        
        fetch(scriptURL, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            // Restore button state
            submitBtn.textContent = 'Gửi thông tin đặt chỗ →';
            submitBtn.disabled    = false;
            
            // Elements
            const paymentModal = document.getElementById('payment-modal');
            const qrImg = document.getElementById('payment-qr-img');
            const orderIdText = document.getElementById('payment-order-id');
            const btnConfirm = document.getElementById('btn-confirm-payment');
            const step1 = document.getElementById('payment-step-1');
            const step2 = document.getElementById('payment-step-2');
            const statusLoading = document.getElementById('payment-status-loading');
            const btnClose = document.getElementById('payment-close');

            // Reset modal state
            step1.style.display = 'block';
            step2.style.display = 'none';
            btnConfirm.style.display = 'none';
            if (statusLoading) statusLoading.style.display = 'flex';
            
            // Set QR image and text
            qrImg.src = `https://img.vietqr.io/image/ACB-22177727-compact2.png?amount=19000&addInfo=${orderId}&accountName=NGUYEN%20THI%20HANH`;
            orderIdText.textContent = orderId;
            
            // Show modal
            paymentModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Show confirm button after 30s
            setTimeout(() => {
                if (btnConfirm) btnConfirm.style.display = 'block';
                if (statusLoading) statusLoading.style.display = 'none';
            }, 30000);

            // Handle confirm click
            btnConfirm.onclick = () => {
                step1.style.display = 'none';
                step2.style.display = 'block';
            };

            // Handle close
            const closeModal = () => {
                paymentModal.classList.remove('active');
                document.body.style.overflow = '';
                bookingForm.reset();
            };

            btnClose.onclick = closeModal;
            paymentModal.onclick = (e) => {
                if (e.target === paymentModal) closeModal();
            };
        })
        .catch(error => {
            console.error('Error!', error.message);
            submitBtn.textContent = 'Gửi thông tin đặt chỗ →';
            submitBtn.disabled    = false;
            alert('Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại hoặc gọi trực tiếp!');
        });
    });

    function isValidPhone(p) {
        return /^(0|\+84)[3-9]\d{8}$/.test(p.replace(/\s/g, ''));
    }

    function formatDate(d) {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    }

    function shake(el) {
        el?.classList.add('shake');
        setTimeout(() => el?.classList.remove('shake'), 600);
    }

    function showFieldErrors({ name, phone, date, time }) {
        const fields = [
            { id: 'f-name',  val: name },
            { id: 'f-phone', val: phone },
            { id: 'f-date',  val: date },
            { id: 'f-time',  val: time },
        ];
        fields.forEach(({ id, val }) => {
            const el = document.getElementById(id);
            if (!val) {
                el?.classList.add('field-error');
                el?.addEventListener('input', () => el.classList.remove('field-error'), { once: true });
            }
        });
    }

    /* -------------------------------------------------- */
    /* 7. GALLERY LIGHTBOX (simple)                       */
    /* -------------------------------------------------- */
    const galleryItems = document.querySelectorAll('.gallery-item img');

    galleryItems.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    function openLightbox(src, alt) {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <div class="lightbox-inner">
                <img src="${src}" alt="${alt}">
                <button class="lightbox-close">✕</button>
                <p class="lightbox-caption">${alt}</p>
            </div>`;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Animate in
        requestAnimationFrame(() => overlay.classList.add('lightbox-open'));

        const close = () => {
            overlay.classList.remove('lightbox-open');
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        overlay.querySelector('.lightbox-close').addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
    }

    /* -------------------------------------------------- */
    /* 8. Active nav link on scroll                       */
    /* -------------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 140;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const h   = sec.offsetHeight;
            const id  = sec.getAttribute('id');
            if (scrollY >= top && scrollY < top + h) {
                navLinks.forEach(l => {
                    l.classList.toggle('active-link', l.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { passive: true });

})();

/* ============================================================
   Lightbox + field-error styles injected via JS
   (keeps CSS file self-contained for theming)
   ============================================================ */
const _style = document.createElement('style');
_style.textContent = `
.lightbox-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(10,8,20,0.88);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.3s ease;
    padding: 20px;
}
.lightbox-overlay.lightbox-open { opacity: 1; }
.lightbox-inner { position: relative; max-width: 900px; width: 100%; }
.lightbox-inner img {
    width: 100%; height: auto; border-radius: 16px;
    transform: scale(0.94); transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
}
.lightbox-open .lightbox-inner img { transform: scale(1); }
.lightbox-close {
    position: absolute; top: -16px; right: -16px;
    width: 40px; height: 40px; border-radius: 50%;
    background: white; color: #333; font-size: 1.1rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    border: none; transition: transform 0.2s;
}
.lightbox-close:hover { transform: scale(1.1); }
.lightbox-caption {
    text-align: center; color: rgba(255,255,255,0.7);
    font-size: 0.9rem; margin-top: 12px;
}

.field-error {
    border-color: #ff4757 !important;
    box-shadow: 0 0 0 3px rgba(255,71,87,0.15) !important;
}

@keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-6px); }
    40%,80% { transform: translateX(6px); }
}
.shake { animation: shake 0.5s ease; }

.nav-links a.active-link { color: var(--clr-primary) !important; }
.nav-links a.active-link::after { width: 100% !important; }
`;
document.head.appendChild(_style);
