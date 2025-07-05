// js/script.js

/**
 * ===================================================================
 * HÀM XỬ LÝ TRẠNG THÁI XÁC THỰC (ĐĂNG NHẬP/ĐĂNG XUẤT)
 * Được gọi bởi templates.js sau khi header được tải.
 * ===================================================================
 */
function updateAuthState() {
    const authStatusDiv = document.getElementById('auth-status');
    if (!authStatusDiv) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'bạn';

    if (isLoggedIn) {
        // Giao diện khi đã đăng nhập
        authStatusDiv.innerHTML = `
            <span class="user-greeting">Chào, <strong>${userName}</strong></span>
            <a href="#" id="logout-link" title="Đăng xuất">Đăng xuất</a>
        `;
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            alert("Bạn đã đăng xuất thành công!");
            window.location.reload();
        });
    } else {
        // Giao diện khi chưa đăng nhập
        authStatusDiv.innerHTML = `
            <a href="Account.html">Đăng nhập</a> / <a href="Account.html">Đăng ký</a>
        `;
    }
}

/**
 * ===================================================================
 * HÀM XỬ LÝ LOGIC RIÊNG CHO TRANG TÀI KHOẢN (Account.html)
 * ===================================================================
 */
function handleAccountPage() {
    const authForm = document.getElementById('authForm');
    if (!authForm) return; // Nếu không có form, thoát hàm

    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const signUpFields = document.getElementById('signUpFields');
    const submitBtn = document.getElementById('submitBtn');

    let isSignUp = false;

    function setMode(signUp) {
        isSignUp = signUp;
        const nameInput = document.getElementById('name');
        const lastNameInput = document.getElementById('lastName');

        if (signUp) {
            signUpFields.classList.remove('hidden');
            submitBtn.textContent = 'Đăng Ký';
            signInBtn.classList.remove('selected');
            signUpBtn.classList.add('selected');
            nameInput.required = true;
            lastNameInput.required = true;
        } else {
            signUpFields.classList.add('hidden');
            submitBtn.textContent = 'Đăng Nhập';
            signUpBtn.classList.remove('selected');
            signInBtn.classList.add('selected');
            nameInput.required = false;
            lastNameInput.required = false;
        }
    }

    signInBtn.addEventListener('click', () => setMode(false));
    signUpBtn.addEventListener('click', () => setMode(true));

    authForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;

        if (isSignUp) {
            // Logic Đăng Ký
            alert(`Tài khoản cho ${name} đã được tạo thành công!\nBây giờ, hãy đăng nhập để tiếp tục.`);
            setMode(false);
            authForm.reset();
            document.getElementById('email').value = email;
            document.getElementById('password').focus();
        } else {
            // Logic Đăng Nhập
            alert(`Đăng nhập thành công với email ${email}!`);
            const inferredName = name || email.split('@')[0];
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', inferredName);
            window.location.href = 'index.html';
        }
    });

    document.getElementById('googleBtn')?.addEventListener('click', () => alert('Chức năng đăng nhập với Google đang được phát triển.'));
    document.getElementById('facebookBtn')?.addEventListener('click', () => alert('Chức năng đăng nhập với Facebook đang được phát triển.'));
}

/**
 * ===================================================================
 * HÀM TẢI VÀ HIỂN THỊ CÁC TIN ĐĂNG MỚI (TRÊN TRANG CHỦ)
 * ===================================================================
 */
function loadUserPosts() {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return; // Nếu không có grid, thoát hàm

    const userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];

    if (userPosts.length === 0) {
        // Bạn có thể giữ lại các sản phẩm mẫu hoặc hiển thị thông báo
        // Ở đây tôi chọn hiển thị thông báo để thấy rõ kết quả
        const featuredGrid = document.querySelector('.featured-products .product-grid');
        if (featuredGrid) featuredGrid.style.display = 'none'; // Ẩn bảng giá mẫu nếu có tin đăng
        
        postsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Chưa có tin đăng nào. Hãy là người đầu tiên đăng tin!</p>';
        return;
    }

    // Nếu có tin đăng, ẩn bảng giá mẫu đi để không bị trùng lặp
    const featuredSection = document.querySelector('.featured-products');
    if(featuredSection) featuredSection.style.display = 'none';

    postsGrid.innerHTML = ''; // Xóa nội dung cũ
    userPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'product-card';
        postCard.innerHTML = `
            <img src="${post.images[0] || 'https://via.placeholder.com/300x300.png?text=No+Image'}" alt="${post.title}">
            <div class="product-info">
                <h3>${post.title}</h3>
                <p>${parseInt(post.price).toLocaleString('vi-VN')} đ</p>
            </div>
            <div class="discount-badge">${post.categoryName}</div>
        `;
        postsGrid.appendChild(postCard);
    });
}


/**
 * ===================================================================
 * ĐIỂM KHỞI CHẠY CHÍNH CỦA SCRIPT
 * Chạy sau khi toàn bộ DOM đã được tải.
 * ===================================================================
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Logic này sẽ chạy trên MỌI trang, nhưng các hàm bên trong
    // có cơ chế tự kiểm tra để chỉ thực thi khi cần thiết.
    
    // 1. Chạy logic cho trang tài khoản nếu có
    handleAccountPage();

    // 2. Chạy logic tải tin đăng nếu ở trang chủ
    loadUserPosts();

    // Các hàm chung khác có thể được gọi ở đây, ví dụ:
    // initializeMobileMenu();
    // initializeScrollEffects();
});