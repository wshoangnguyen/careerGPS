/**
 * MAIN.JS - Hướng nghiệp ABC
 * Tất cả tính năng: menu mobile, đếm số, slider, scroll mượt, hiệu ứng
 */

// ==================== 1. MENU MOBILE (HAMBURGER) ====================
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            // Đổi icon giữa bars và times
            const icon = hamburger.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Đóng menu khi click vào link
        const navLinks = document.querySelectorAll('.nav-menu li a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
});

// ==================== 2. ĐẾM SỐ (STATS COUNTER) ====================
const counters = document.querySelectorAll('.stat-number');
let started = false; // Chỉ đếm 1 lần khi scroll đến

function startCounters() {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = parseInt(counter.getAttribute('data-target'));
            const current = parseInt(counter.innerText);
            const increment = target / 100; // Tăng dần
            
            if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// Kích hoạt đếm số khi scroll đến phần stats
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top <= window.innerHeight && rect.bottom >= 0;
}

function checkStatsVisibility() {
    const statsSection = document.querySelector('.stats');
    if (statsSection && !started && isElementInViewport(statsSection)) {
        started = true;
        startCounters();
    }
}

window.addEventListener('scroll', checkStatsVisibility);
window.addEventListener('load', checkStatsVisibility);

// ==================== 3. SLIDER TESTIMONIAL ====================
const slider = document.getElementById('testimonialSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (slider && prevBtn && nextBtn) {
    let currentIndex = 0;
    const items = document.querySelectorAll('.testimonial-item');
    const totalItems = items.length;
    
    function showSlide(index) {
        // Xử lý vòng lặp
        if (index < 0) index = totalItems - 1;
        if (index >= totalItems) index = 0;
        
        // Ẩn tất cả
        items.forEach(item => {
            item.style.display = 'none';
            item.classList.remove('active');
        });
        
        // Hiện slide hiện tại
        items[index].style.display = 'block';
        items[index].classList.add('active');
        currentIndex = index;
    }
    
    // Sự kiện nút bấm
    prevBtn.addEventListener('click', () => {
        showSlide(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        showSlide(currentIndex + 1);
    });
    
    // Auto slide mỗi 5 giây
    let autoSlide = setInterval(() => {
        showSlide(currentIndex + 1);
    }, 5000);
    
    // Dừng auto slide khi hover vào slider
    slider.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });
    
    slider.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5000);
    });
    
    // Hiển thị slide đầu tiên
    showSlide(0);
}

// ==================== 4. SCROLL MƯỢT CHO LINK NỘI BỘ ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== 5. HIỆU ỨNG KHI CUỘN (FADE IN) ====================
// Tạo hiệu ứng xuất hiện dần cho các card khi scroll
const fadeElements = document.querySelectorAll('.feature-card, .service-card, .stat-item');

function checkFadeIn() {
    fadeElements.forEach(el => {
        if (isElementInViewport(el)) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

// Thiết lập style ban đầu cho hiệu ứng fade in
fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', checkFadeIn);
window.addEventListener('load', checkFadeIn);

// ==================== 6. HEADER STICKY THAY ĐỔI STYLE ====================
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        header.style.background = 'rgba(255,255,255,0.98)';
        header.style.backdropFilter = 'blur(5px)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        header.style.background = '#ffffff';
        header.style.backdropFilter = 'none';
    }
    
    lastScroll = currentScroll;
});

// ==================== 7. XỬ LÝ FORM (NẾU CÓ SAU NÀY) ====================
// Hàm này sẽ được gọi khi bạn thêm form liên hệ
window.handleContactForm = function(event) {
    event.preventDefault();
    alert('Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.');
    // Ở đây bạn có thể thêm code gửi dữ liệu lên server
    return false;
};

// ==================== 8. HIỆU ỨNG HOVER CHO NÚT (BỔ SUNG) ====================
const allBtns = document.querySelectorAll('.btn');
allBtns.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

console.log('Website Hướng nghiệp ABC đã sẵn sàng!');