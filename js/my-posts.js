// js/my-posts.js
document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'vendor') {
        alert("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản Người bán.");
        window.location.href = 'index.html';
        return;
    }

    const postListContainer = document.getElementById('my-posts-list');
    if (!postListContainer) return;

    const loggedInUser = localStorage.getItem('userName');
    if (!loggedInUser) {
        alert("Vui lòng đăng nhập để xem tin đăng của bạn.");
        window.location.href = 'Account.html';
        return;
    }

    function renderPosts() {
        const allPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
        const myPosts = allPosts.filter(post => post.author === loggedInUser);

        postListContainer.innerHTML = ''; // Xóa danh sách cũ

        if (myPosts.length === 0) {
            postListContainer.innerHTML = '<p>Bạn chưa có tin đăng nào. Hãy <a href="post-ad.html">đăng tin</a> ngay!</p>';
            return;
        }

        myPosts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'my-post-card';
            postCard.innerHTML = `
                <img src="${post.images[0] || 'https://via.placeholder.com/150x100.png?text=No+Image'}" alt="${post.title}">
                <div class="my-post-info">
                    <h3>${post.title}</h3>
                    <p><strong>Danh mục:</strong> ${post.categoryName}</p>
                    <p><strong>Giá:</strong> ${parseInt(post.price).toLocaleString('vi-VN')} đ</p>
                    <p><strong>Ngày đăng:</strong> ${post.postDate}</p>
                </div>
                <div class="my-post-actions">
                    <button class="btn btn-edit" data-id="${post.id}">Sửa</button>
                    <button class="btn btn-delete" data-id="${post.id}">Xóa</button>
                </div>
            `;
            postListContainer.appendChild(postCard);
        });
    }

    // Dùng event delegation để xử lý click
    postListContainer.addEventListener('click', (e) => {
        const target = e.target;
        const postId = target.dataset.id;

        if (!postId) return;

        if (target.classList.contains('btn-delete')) {
            if (confirm("Bạn có chắc chắn muốn xóa tin đăng này không?")) {
                let allPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
                const updatedPosts = allPosts.filter(post => post.id != postId);
                localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
                renderPosts(); 
            }
        }

        if (target.classList.contains('btn-edit')) {
            window.location.href = `post-ad.html?edit=${postId}`;
        }
    });

    renderPosts();
});