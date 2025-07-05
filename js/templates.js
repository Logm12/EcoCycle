// js/templates.js

/**
 * Hàm tải nội dung từ một file HTML.
 * @param {string} filePath - Đường dẫn tới file HTML.
 * @returns {Promise<string>} - Một promise sẽ resolve với nội dung HTML.
 */
async function fetchHtmlAsText(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Không thể tải ${filePath}: ${response.statusText}`);
    }
    return response.text();
}

/**
 * Hàm chính để tải và chèn các thành phần chung (header, footer).
 */
async function loadCommonComponents() {
    try {
        const [headerHtml, footerHtml] = await Promise.all([
            fetchHtmlAsText('templates/header.html'),
            fetchHtmlAsText('templates/footer.html')
        ]);

        const headerPlaceholder = document.getElementById('header-placeholder');
        const footerPlaceholder = document.getElementById('footer-placeholder');

        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = headerHtml;
        }
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = footerHtml;
        }

        setActiveNavLink();
        
        if (typeof updateAuthState === 'function') {
            updateAuthState();
        }

    } catch (error) {
        console.error('Lỗi nghiêm trọng khi tải các thành phần chung:', error);
    }
}

/**
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname; 

    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;

        if (linkPath === currentPath && link.getAttribute('href') !== '#') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', loadCommonComponents);