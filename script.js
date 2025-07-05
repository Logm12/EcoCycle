document.addEventListener('DOMContentLoaded', function() {

    // --- PHẦN MÔ PHỎNG TRẠNG THÁI ĐĂNG NHẬP ---
    // Trong một ứng dụng thực tế, giá trị này sẽ được lấy từ server (session, token,...)
    const isLoggedIn = false; // <<<< THAY ĐỔI `false` thành `true` ĐỂ XEM KẾT QUẢ KHI ĐĂNG NHẬP
    const userName = "Nguyễn Văn A"; // Tên người dùng mẫu

    const authStatusDiv = document.getElementById('auth-status');

    function updateAuthState() {
        if (isLoggedIn) {
            // Nếu đã đăng nhập, hiển thị lời chào và nút đăng xuất
            authStatusDiv.innerHTML = `
                <span class="user-greeting">Chào, <strong>${userName}</strong></span>
                <a href="#" id="logout-link">Đăng xuất</a>
            `;
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                alert("Bạn đã đăng xuất! ");

            });
        } else {
            authStatusDiv.innerHTML = `
                <a href="#">Đăng nhập</a> / <a href="#">Đăng ký</a>
            `;
        }
    }

    if (authStatusDiv) {
        updateAuthState();
    }
    // --- KẾT THÚC PHẦN MÔ PHỎNG ---


    // --- CÁC CHỨC NĂNG CŨ VẪN GIỮ NGUYÊN ---

    // 1. Sticky Header with scroll effect
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

});