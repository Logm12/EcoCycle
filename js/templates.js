// js/templates.js (PHIÊN BẢN CUỐI CÙNG)

async function fetchHtmlAsText(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Không thể tải ${filePath}: ${response.statusText}`);
    return response.text();
}

async function loadCommonComponents() {
    try {
        const userRole = localStorage.getItem('userRole');
        const currentPage = window.location.pathname;

        // Danh sách các trang thuộc về "không gian làm việc" của người bán
        const vendorPages = [
            '/dashboard.html',
            '/my-posts.html',
            '/calculator.html',
            '/pricelist.html', // <-- THÊM VÀO
            '/diadiem.html'    // <-- THÊM VÀO
        ];

        let headerPath, footerPath;

        // KIỂM TRA: Nếu người dùng là vendor VÀ đang ở trên một trong các trang của vendor
        if (userRole === 'vendor' && vendorPages.some(page => currentPage.includes(page))) {
            headerPath = 'templates/vendor-header.html';
            footerPath = 'templates/vendor-footer.html';
        } else {
            // Trong mọi trường hợp khác (khách, khách hàng, hoặc vendor xem trang chủ)
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

        setActiveNavLink();
        if (typeof updateAuthState === 'function') {
            updateAuthState();
        }

    } catch (error) {
        console.error('Lỗi khi tải các thành phần chung:', error);
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPath && link.getAttribute('href') !== '#') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', loadCommonComponents);