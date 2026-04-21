/**
 * MAIN.JS - Career GPS
 * Phiên bản nâng cấp với hiệu ứng scroll mượt mà, stagger animation, tối ưu trải nghiệm
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
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
});

// ==================== 2. ĐẾM SỐ (STATS COUNTER) ====================
const counters = document.querySelectorAll('.stat-number');
let statsStarted = false;

function startCounters() {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = parseInt(counter.getAttribute('data-target'));
            const current = parseInt(counter.innerText);
            const increment = target / 80; // Tăng dần, số càng nhỏ càng mượt
            
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

// Kiểm tra phần tử có trong viewport không
function isElementInViewport(el, offset = 100) {
    const rect = el.getBoundingClientRect();
    return rect.top <= window.innerHeight - offset && rect.bottom >= offset;
}

function checkStatsVisibility() {
    const statsSection = document.querySelector('.stats');
    if (statsSection && !statsStarted && isElementInViewport(statsSection, 200)) {
        statsStarted = true;
        startCounters();
    }
}

// ==================== 3. SLIDER TESTIMONIAL ====================
const slider = document.getElementById('testimonialSlider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (slider && prevBtn && nextBtn) {
    let currentIndex = 0;
    const items = document.querySelectorAll('.testimonial-item');
    const totalItems = items.length;
    let autoSlideInterval;
    
    function showSlide(index) {
        // Xử lý vòng lặp
        if (index < 0) index = totalItems - 1;
        if (index >= totalItems) index = 0;
        
        // Ẩn tất cả với hiệu ứng mượt
        items.forEach((item, i) => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (i !== index) {
                    item.style.display = 'none';
                }
            }, 300);
        });
        
        // Hiện slide hiện tại với hiệu ứng
        setTimeout(() => {
            items[index].style.display = 'block';
            setTimeout(() => {
                items[index].style.opacity = '1';
                items[index].style.transform = 'scale(1)';
            }, 50);
        }, 300);
        
        currentIndex = index;
    }
    
    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5000);
    }
    
    // Sự kiện nút bấm
    prevBtn.addEventListener('click', () => {
        showSlide(currentIndex - 1);
        startAutoSlide(); // Reset timer
    });
    
    nextBtn.addEventListener('click', () => {
        showSlide(currentIndex + 1);
        startAutoSlide();
    });
    
    // Dừng auto slide khi hover
    slider.addEventListener('mouseenter', () => {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
    });
    
    slider.addEventListener('mouseleave', startAutoSlide);
    
    // Khởi tạo slide đầu tiên
    items.forEach((item, i) => {
        if (i !== 0) item.style.display = 'none';
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.opacity = i === 0 ? '1' : '0';
        item.style.transform = i === 0 ? 'scale(1)' : 'scale(0.95)';
    });
    
    startAutoSlide();
}

// ==================== 4. SCROLL MƯỢT CHO LINK NỘI BỘ ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        
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

// ==================== 5. HIỆU ỨNG SCROLL (FADE IN + STAGGER) ====================
// Đây là phần QUAN TRỌNG NHẤT - tạo hiệu ứng mượt mà như trang augen.pro

// Chọn tất cả các phần tử cần hiệu ứng (mở rộng so với bản gốc)
const fadeElements = document.querySelectorAll(
    '.hero, .feature-card, .service-card, .stat-item, ' +
    '.testimonial-item, .footer-col, .section-title'
);

// Thiết lập style ban đầu cho tất cả các phần tử cần hiệu ứng
fadeElements.forEach(el => {
    // Chỉ thêm style nếu chưa có (tránh ghi đè)
    if (!el.style.transition) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
    }
});

// Biến lưu trạng thái đã xuất hiện để tránh chạy lại không cần thiết
const animatedElements = new Set();

function checkFadeIn() {
    let anyElementVisible = false;
    
    fadeElements.forEach((el, index) => {
        // Nếu phần tử đã xuất hiện rồi thì bỏ qua
        if (animatedElements.has(el)) return;
        
        if (isElementInViewport(el, 100)) {
            anyElementVisible = true;
            animatedElements.add(el);
            
            // Thêm delay nhỏ để tạo hiệu ứng lần lượt (stagger)
            // Phần tử cùng loại sẽ có delay dựa trên index của chúng
            let delay = 0;
            
            if (el.classList.contains('feature-card')) {
                const siblings = document.querySelectorAll('.feature-card');
                const siblingIndex = Array.from(siblings).indexOf(el);
                delay = siblingIndex * 100;
            } else if (el.classList.contains('service-card')) {
                const siblings = document.querySelectorAll('.service-card');
                const siblingIndex = Array.from(siblings).indexOf(el);
                delay = siblingIndex * 80;
            } else if (el.classList.contains('stat-item')) {
                const siblings = document.querySelectorAll('.stat-item');
                const siblingIndex = Array.from(siblings).indexOf(el);
                delay = siblingIndex * 120;
            } else if (el.classList.contains('section-title')) {
                delay = 0; // Tiêu đề xuất hiện ngay
            } else {
                delay = Math.min(index * 30, 300); // Tối đa 300ms
            }
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
        }
    });
    
    // Nếu không còn phần tử nào để animation, có thể gỡ bỏ event listener để tối ưu
    if (animatedElements.size === fadeElements.length) {
        window.removeEventListener('scroll', checkFadeIn);
        window.removeEventListener('load', checkFadeIn);
        window.removeEventListener('resize', checkFadeIn);
    }
}

// ==================== 6. HEADER STICKY THAY ĐỔI STYLE ====================
const header = document.querySelector('header');
if (header) {
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
    });
}

// ==================== 7. HIỆU ỨNG PARALLAX NHẸ CHO HERO ====================
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < 600) {
            hero.style.backgroundPositionY = `${scrolled * 0.3}px`;
        }
    });
}

// ==================== 8. HIỆU ỨNG HOVER NÂNG CAO CHO NÚT ====================
const allBtns = document.querySelectorAll('.btn');
allBtns.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.transition = 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
    });
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ==================== 9. HIỆU ỨNG KHI CLICK VÀO CARD (TÙY CHỌN) ====================
const cards = document.querySelectorAll('.feature-card, .service-card');
cards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Chỉ thêm hiệu ứng nếu click không phải vào nút bên trong
        if (!e.target.closest('.btn')) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        }
    });
});

// ==================== 10. XỬ LÝ FORM (NẾU CÓ) ====================
window.handleContactForm = function(event) {
    if (event) event.preventDefault();
    alert('✨ Cảm ơn bạn! Chúng tôi sẽ liên hệ trong vòng 24 giờ.');
    // TODO: Thêm code gửi dữ liệu lên server ở đây
    return false;
};

// ==================== 11. KHỞI TẠO TẤT CẢ CÁC HIỆU ỨNG ====================
// Gắn event listeners
window.addEventListener('scroll', checkFadeIn);
window.addEventListener('scroll', checkStatsVisibility);
window.addEventListener('load', () => {
    checkFadeIn();
    checkStatsVisibility();
});
window.addEventListener('resize', () => {
    // Re-check khi thay đổi kích thước màn hình
    checkFadeIn();
    checkStatsVisibility();
});

// Log khởi tạo thành công (chỉ để debug, có thể xóa khi deploy)
console.log('🚀 Website Career GPS đã sẵn sàng với hiệu ứng scroll mượt mà!');