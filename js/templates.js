

/**
 * Hàm helper để tải nội dung từ một file HTML.
 * @param {string} filePath - Đường dẫn tới file HTML.
 * @returns {Promise<string>} - Một promise sẽ resolve với nội dung HTML.
 */
async function fetchHtmlAsText(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Không thể tải template: ${filePath} (Lỗi: ${response.statusText})`);
    }
    return response.text();
}

/**
 * Hàm chính để tải và chèn các thành phần chung (header, footer).
 * Hàm này sẽ tự động kiểm tra vai trò người dùng và tải template tương ứng.
 */
async function loadCommonComponents() {
    try {
        const userRole = localStorage.getItem('userRole');
        
        let headerPath;
        let footerPath;

        if (userRole === 'vendor') {
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

        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = headerHtml;
        }
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = footerHtml;
        }


        if (typeof setActiveNavLink === 'function') {
            setActiveNavLink();
        }
        if (typeof updateAuthState === 'function') {
            updateAuthState();
        }

    } catch (error) {
        console.error('Lỗi nghiêm trọng khi tải các thành phần chung:', error);
    }
}

/**
 * Đánh dấu link điều hướng đang hoạt động (active) trên thanh menu.
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop(); 
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        
        const isHomePage = (currentPath === 'index.html' || currentPath === '');
        const isLinkToHomePage = (linkPage === 'index.html' || linkPage === '');

        if (isHomePage && isLinkToHomePage) {
            link.classList.add('active');
        } else if (linkPage === currentPath && !isHomePage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}


document.addEventListener('DOMContentLoaded', loadCommonComponents);