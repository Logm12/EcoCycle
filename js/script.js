
function updateAuthState() {
    const authStatusDiv = document.getElementById('auth-status');
    if (!authStatusDiv) return;

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'bạn';

    if (isLoggedIn) {
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


function loadUserPosts() {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return; // Nếu không có grid, thoát hàm

    const userPosts = JSON.parse(localStorage.getItem('userPosts')) || [];

    if (userPosts.length === 0) {

        const featuredGrid = document.querySelector('.featured-products .product-grid');
        if (featuredGrid) featuredGrid.style.display = 'none';
        
        postsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Chưa có tin đăng nào. Hãy là người đầu tiên đăng tin!</p>';
        return;
    }

    const featuredSection = document.querySelector('.featured-products');
    if(featuredSection) featuredSection.style.display = 'none';

    postsGrid.innerHTML = ''; 
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

    const swiper = new Swiper('#top-products-slider', {
        loop: true, 
        spaceBetween: 30,

        breakpoints: {
            640: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30
            }
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}

document.addEventListener('DOMContentLoaded', function() {
    handleAccountPage();
    loadUserPosts();
	displayTopProducts();

});
