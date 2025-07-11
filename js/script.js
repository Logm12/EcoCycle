// js/script.js

/**
 * ===================================================================
 * HÀM XỬ LÝ TRẠNG THÁI XÁC THỰC (ĐĂNG NHẬP/ĐĂNG XUẤT)
 * Được gọi bởi templates.js sau khi header được tải.
 * ===================================================================
 */
// js/script.js (Hàm updateAuthState hoàn chỉnh)

function updateAuthState() {
    const authStatusDiv = document.getElementById('auth-status');
    if (!authStatusDiv) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'bạn';
    const userRole = localStorage.getItem('userRole');

    authStatusDiv.innerHTML = '';

    if (isLoggedIn) {
        if (userRole === 'vendor') {
            authStatusDiv.innerHTML = `
                <div class="user-menu-container">
                    <button class="user-menu-button">Chào, <strong>${userName}</strong> <i class="fa-solid fa-caret-down"></i></button>
                    <div class="user-menu-dropdown">
                        <a href="dashboard.html"><i class="fa-solid fa-gauge-high"></i> Bảng điều khiển</a>
                        <a href="my-posts.html"><i class="fa-solid fa-list-check"></i> Quản lý tin đăng</a>
                        <a href="calculator.html"><i class="fa-solid fa-calculator"></i> Công cụ tính giá</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" id="logout-link"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a>
                    </div>
                </div>
            `;
        } else {
            authStatusDiv.innerHTML = `
                <div class="user-menu-container">
                     <button class="user-menu-button">Chào, <strong>${userName}</strong> <i class="fa-solid fa-caret-down"></i></button>
                    <div class="user-menu-dropdown">
                        <a href="my-posts.html"><i class="fa-solid fa-list-check"></i> Tin đăng của tôi</a>
                        <a href="#" id="logout-link"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a>
                    </div>
                </div>
            `;
        }

        const menuButton = authStatusDiv.querySelector('.user-menu-button');
        const dropdown = authStatusDiv.querySelector('.user-menu-dropdown');
        
        if(menuButton) {
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
        }

        const logoutLink = authStatusDiv.querySelector('#logout-link');
        if(logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole');

                alert("Bạn đã đăng xuất thành công!");
                window.location.href = 'index.html';
            });
        }

    } else {
        // GIAO DIỆN CHO KHÁCH (GUEST)
        authStatusDiv.innerHTML = `<a href="Account.html">Đăng nhập</a> / <a href="Account.html">Đăng ký</a>`;
    }
    
    window.addEventListener('click', () => {
        const dropdown = authStatusDiv.querySelector('.user-menu-dropdown.show');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    });
}

/**
 * ===================================================================
 * HÀM XỬ LÝ LOGIC RIÊNG CHO TRANG TÀI KHOẢN (Account.html)
 * ===================================================================
 */
function handleAccountPage() {
    const authForm = document.getElementById('authForm');
    if (!authForm) return;

    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const signUpFields = document.getElementById('signUpFields');
    const submitBtn = document.getElementById('submitBtn');

    // --- MÔ PHỎNG CƠ SỞ DỮ LIỆU NGƯỜI DÙNG ---
    // Lấy danh sách người dùng từ localStorage, nếu không có thì tạo mảng rỗng
    const getUsers = () => JSON.parse(localStorage.getItem('ecoUsers')) || [];
    const saveUsers = (users) => localStorage.setItem('ecoUsers', JSON.stringify(users));

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
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const users = getUsers();

    if (isSignUp) {
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim(); 
        const role = document.querySelector('input[name="role"]:checked').value;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            alert('Email này đã được sử dụng. Vui lòng chọn email khác.');
            return;
        }

        // Thêm người dùng mới vào "cơ sở dữ liệu"
        const newUser = { email, password, name, phone, role }; 
        users.push(newUser);
        saveUsers(users);

        alert(`Đăng ký thành công với vai trò "${role === 'vendor' ? 'Người bán' : 'Khách hàng'}"!\nVui lòng đăng nhập để tiếp tục.`);
        setMode(false);
        authForm.reset();
        document.getElementById('email').value = email;
        document.getElementById('password').focus();

    } else {
        // --- LOGIC ĐĂNG NHẬP MỚI ---
        const foundUser = users.find(user => user.email === email);

        if (!foundUser || foundUser.password !== password) {
            alert('Email hoặc mật khẩu không chính xác.');
            return;
        }

        // Đăng nhập thành công, lưu thông tin phiên làm việc
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', foundUser.name);
        localStorage.setItem('userRole', foundUser.role); // <-- LƯU ROLE

        alert(`Đăng nhập thành công!`);

        // PHÂN LUỒNG CHUYỂN HƯỚNG DỰA TRÊN ROLE
        if (foundUser.role === 'vendor') {
            window.location.href = 'dashboard.html'; // Chuyển đến trang dashboard
        } else {
            window.location.href = 'index.html'; // Chuyển về trang chủ
        }
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

function displayTopProducts() {
    const sliderWrapper = document.querySelector('#top-products-slider .swiper-wrapper');
    if (!sliderWrapper) return; 

    const getMaxValue = (priceString) => {
        if (typeof priceString !== 'string' || priceString.toLowerCase().includes('liên hệ')) {
            return 0;
        }
        const parts = priceString.split('-').map(part => parseInt(part.trim().replace(/\./g, '')));
        return Math.max(...parts);
    };

    const sortedData = [...priceData].sort((a, b) => getMaxValue(b.price) - getMaxValue(a.price));
    const topProducts = sortedData.slice(0, 10);

    sliderWrapper.innerHTML = '';
    topProducts.forEach(product => {
        
        const slideHTML = `
            <div class="swiper-slide">
                <div class="product-card">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.price} đ/kg</p>
                    </div>
                </div>
            </div>
        `;
        sliderWrapper.innerHTML += slideHTML;
    });

    // Khởi tạo Swiper sau khi đã chèn HTML
    const swiper = new Swiper('#top-products-slider', {
        // Các tùy chọn
        loop: true, // Lặp lại vô tận
        spaceBetween: 30, // Khoảng cách giữa các slide

        // Responsive breakpoints
        breakpoints: {
            // Khi chiều rộng màn hình >= 640px
            640: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            // Khi chiều rộng màn hình >= 1024px
            1024: {
              slidesPerView: 3,
              spaceBetween: 30
            }
        },

        // Nút điều hướng
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}
function initializeGlobalSearch() {
    setTimeout(() => {
        const searchBar = document.querySelector('.header-main .search-bar');
        if (!searchBar) return;

        const searchInput = searchBar.querySelector('input');
        const searchButton = searchBar.querySelector('button');

        const handleSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return;

            if (query.includes('giá') || query.includes('sắt') || query.includes('đồng') || query.includes('nhôm')) {
                window.location.href = 'pricelist.html';
            } else if (query.includes('bản đồ') || query.includes('địa điểm') || query.includes('gần đây')) {
                window.location.href = 'diadiem.html';
            } else if (query.includes('đăng') || query.includes('bán')) {
                window.location.href = 'post-ad.html';
            } else if (query.includes('về') || query.includes('giới thiệu') || query.includes('liên hệ')) {
                window.location.href = 'about.html';
            } else {
                alert(`Không tìm thấy kết quả phù hợp cho từ khóa: "${searchInput.value}"`);
            }
        };

        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }, 500); // Chờ 0.5s để đảm bảo header đã được render
}
document.addEventListener('DOMContentLoaded', function() {
    handleAccountPage();
    loadUserPosts();
	displayTopProducts();
    initializeGlobalSearch();

});