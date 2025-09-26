// js/templates.js (PHIÊN BẢN SỬA LỖI CUỐI CÙNG)

async function fetchHtmlAsText(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Không thể tải ${filePath}: ${response.statusText}`);
    return response.text();
}

async function loadCommonComponents() {
    try {
        const userRole = localStorage.getItem('userRole');
        const currentPage = window.location.pathname;

        const vendorPages = [
            '/dashboard.html',
            '/my-posts.html',
            '/calculator.html',
            '/pricelist.html',

            '/diadiem.html'
        ];

        let headerPath, footerPath;

        if (userRole === 'vendor' && vendorPages.some(page => currentPage.includes(page))) {
            headerPath = 'templates/vendor-header.html';
            footerPath = 'templates/vendor-footer.html';
        } else {
            headerPath = 'templates/header.html';
            footerPath = 'templates/footer.html';
        }

        const [headerHtml, footerHtml] = await Promise.all([
            fetchHtmlAsText(headerPath),
            fetchHtmlAsText(footerPath)
        ]);

        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (headerPlaceholder) headerPlaceholder.innerHTML = headerHtml;
        if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;

        // =================================================================
        // SỬA LẠI: Gọi tất cả các hàm phụ thuộc vào header TẠI ĐÂY
        // =================================================================
        
        // 1. Đánh dấu link active trên thanh điều hướng
        setActiveNavLink();

        // 2. Cập nhật trạng thái đăng nhập/đăng xuất
        if (typeof updateAuthState === 'function') {
            updateAuthState();
        }

        // 3. KHỞI TẠO NÚT HAMBURGER (QUAN TRỌNG NHẤT)
        if (typeof initializeMobileNav === 'function') {
            initializeMobileNav();
        }

        // 4. Khởi tạo thanh tìm kiếm chung
        if (typeof initializeGlobalSearch === 'function') {
            initializeGlobalSearch();
        }
        // =================================================================

    } catch (error) {
        console.error('Lỗi khi tải các thành phần chung:', error);
    }
}

function setActiveNavLink() {
    // Đợi một chút để đảm bảo DOM đã cập nhật hoàn toàn
    setTimeout(() => {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // Mặc định là index.html nếu rỗng
        const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href').split('/').pop();
            if (linkPath === currentPath) {
                link.classList.add('active');
            }
        });
    }, 100); // Đợi 100ms
}


// Sửa lại: Chạy hàm chính khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', loadCommonComponents);
