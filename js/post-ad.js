// js/post-ad.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const categoryModal = document.getElementById('category-modal');
    const categoryList = document.querySelector('.category-list');
    const postFormContainer = document.getElementById('post-form-container');
    const postForm = document.getElementById('post-form');
    const stickyActionBar = document.getElementById('sticky-actions-bar');
    const selectedCategoryDisplay = document.getElementById('selected-category-display');
    const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const submitBtn = document.getElementById('submit-btn');

    // --- DATA: Định nghĩa các trường riêng cho mỗi danh mục ---
    const categorySpecificFields = {
        'plastic-bottle': [
            { label: 'Loại nhựa', name: 'plastic_type', type: 'select', options: ['PET', 'HDPE', 'PVC', 'Khác'], required: true },
            { label: 'Tình trạng', name: 'condition', type: 'select', options: ['Đã làm sạch', 'Chưa làm sạch'], required: true },
        ],
        'scrap-iron': [
            { label: 'Loại sắt', name: 'iron_type', type: 'select', options: ['Sắt đặc', 'Sắt vụn', 'Bazo sắt', 'Khác'], required: true },
            { label: 'Tình trạng', name: 'condition', type: 'text', placeholder: 'VD: Gỉ sét nhẹ, dính tạp chất...', required: false },
        ],
        'copper': [
            { label: 'Loại đồng', name: 'copper_type', type: 'select', options: ['Đồng cáp', 'Đồng đỏ', 'Đồng vàng', 'Mạt đồng'], required: true },
        ],
        'electric-wire': [
            { label: 'Loại dây', name: 'wire_type', type: 'select', options: ['Dây cáp', 'Dây dân dụng'], required: true },
            { label: 'Tình trạng lõi', name: 'core_condition', type: 'text', placeholder: 'VD: Lõi 2.5mm, lõi nhôm...', required: true },
        ],
        'battery': [
            { label: 'Loại pin', name: 'battery_type', type: 'select', options: ['Pin tiểu (AA, AAA)', 'Pin điện thoại', 'Ắc quy xe máy', 'Ắc quy ô tô', 'Khác'], required: true },
        ],
        'clothes': [
            { label: 'Tình trạng', name: 'condition', type: 'select', options: ['Còn mới', 'Hơi cũ', 'Rách, hỏng'], required: true },
            { label: 'Chất liệu', name: 'material', type: 'text', placeholder: 'VD: Cotton, Jean, Len...', required: false },
        ]
    };

    // --- FUNCTIONS ---

    // Tạo HTML cho các trường động
    function generateDynamicFields(category) {
        dynamicFieldsContainer.innerHTML = '';
        const fields = categorySpecificFields[category] || [];
        fields.forEach(field => {
            let fieldHtml = `<div class="form-group">
                                <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>`;
            if (field.type === 'select') {
                fieldHtml += `<select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                                <option value="">-- Chọn --</option>
                                ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                              </select>`;
            } else {
                fieldHtml += `<input type="${field.type}" id="${field.name}" name="${field.name}" 
                                     placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
            }
            fieldHtml += `</div>`;
            dynamicFieldsContainer.innerHTML += fieldHtml;
        });
    }

    // Xử lý preview ảnh
    function handleImagePreview(event) {
        imagePreview.innerHTML = '';
        const files = Array.from(event.target.files).slice(0, 6); // Giới hạn 6 ảnh
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'preview-image-container';
                div.innerHTML = `<img src="${e.target.result}" alt="preview">
                                 <button type="button" class="remove-image-btn">×</button>`;
                imagePreview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
        // Gọi validate ngay sau khi ảnh thay đổi
        validateForm();
    }

    // Kiểm tra form hợp lệ để bật/tắt nút Đăng tin
    function validateForm() {
        // Lấy giá trị trực tiếp từ các trường quan trọng
        const titleValue = document.getElementById('title').value.trim();
        const descriptionValue = document.getElementById('description').value.trim();
        const hasImage = imagePreview.children.length > 0;

        // Điều kiện mới: Chỉ cần tiêu đề, mô tả có chữ và có ít nhất 1 ảnh
        const isFormValid = titleValue.length > 0 && descriptionValue.length > 0 && hasImage;

        // Bật/tắt nút dựa trên điều kiện
        submitBtn.disabled = !isFormValid;
    }

    // --- EVENT LISTENERS ---

    // Chọn danh mục
    categoryList.addEventListener('click', (e) => {
        const selectedLi = e.target.closest('li');
        if (!selectedLi) return;

        const category = selectedLi.dataset.category;
        const categoryName = selectedLi.dataset.categoryName;

        // Cập nhật UI
        selectedCategoryDisplay.value = categoryName;
        generateDynamicFields(category);
        categoryModal.classList.add('hidden');
        postFormContainer.classList.remove('hidden');
        stickyActionBar.classList.remove('hidden');
        
        // Gắn data-category vào form để dùng lúc submit
        postForm.dataset.category = category;
        postForm.dataset.categoryName = categoryName;

        // Kiểm tra lại form sau khi tạo trường
        validateForm();
    });

    // Upload ảnh
    imageInput.addEventListener('change', handleImagePreview);

    // Xóa ảnh preview
    imagePreview.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-image-btn')) {
            e.target.closest('.preview-image-container').remove();
            validateForm();
        }
    });

    // Validate form khi người dùng nhập liệu
    postForm.addEventListener('input', validateForm);

    // Submit form
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Thu thập dữ liệu từ form
        const formData = new FormData(postForm);
        const adData = {
            id: Date.now(),
            category: postForm.dataset.category,
            categoryName: postForm.dataset.categoryName,
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price'),
            images: [],
            postDate: new Date().toLocaleDateString('vi-VN')
        };
        
        // Lấy ảnh từ preview
        document.querySelectorAll('.preview-image-container img').forEach(img => {
            adData.images.push(img.src);
        });

        // 2. Lưu vào localStorage
        const existingPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
        existingPosts.unshift(adData); // Thêm vào đầu mảng
        localStorage.setItem('userPosts', JSON.stringify(existingPosts));

        // 3. Thông báo và chuyển hướng
        alert('Đăng tin thành công!');
        window.location.href = 'index.html';
    });
});