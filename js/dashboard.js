// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'vendor') {
        alert("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản Người bán.");
        window.location.href = 'index.html'; 
        return; 
    }

    const welcomeMessage = document.getElementById('welcome-message');
    if (!welcomeMessage) return;

    const loggedInUser = localStorage.getItem('userName');
    if (!loggedInUser) {
        window.location.href = 'Account.html';
        return;
    }

    // Cập nhật lời chào
    welcomeMessage.innerHTML = `Chào mừng <strong>${loggedInUser}</strong> quay trở lại!`;

    // Lấy dữ liệu và tính toán thống kê
    const allPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
    const myPosts = allPosts.filter(post => post.author === loggedInUser);

    const totalPosts = myPosts.length;
    const totalValue = myPosts.reduce((sum, post) => {
        const price = parseInt(post.price) || 0;
        return sum + price;
    }, 0);

    // Cập nhật các thẻ thống kê
    document.getElementById('total-posts-stat').textContent = totalPosts;
    document.getElementById('total-value-stat').textContent = totalValue.toLocaleString('vi-VN') + ' đ';
});