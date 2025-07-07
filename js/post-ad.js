// js/post-ad.js
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để sử dụng chức năng này.");
        window.location.href = 'Account.html'; 
        return; 
    }
   // --- DOM ELEMENTS ---
    const postForm = document.getElementById('post-form');
    const urlParams = new URLSearchParams(window.location.search);
    const postIdToEdit = urlParams.get('edit');
    const isEditMode = postIdToEdit !== null;
    
    const submitBtn = document.getElementById('submit-btn');
    const categoryModal = document.getElementById('category-modal');
    const postFormContainer = document.getElementById('post-form-container');
    const stickyActionBar = document.getElementById('sticky-actions-bar');
    const selectedCategoryDisplay = document.getElementById('selected-category-display');
    const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');

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

    function populateFormForEdit(postId) {
        const allPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
        const postToEdit = allPosts.find(post => post.id == postId);

        if (!postToEdit) {
            alert("Không tìm thấy tin đăng để sửa!");
            window.location.href = 'my-posts.html';
            return;
        }

        document.getElementById('title').value = postToEdit.title;
        document.getElementById('description').value = postToEdit.description;
        document.getElementById('price').value = postToEdit.price;
        selectedCategoryDisplay.value = postToEdit.categoryName;
        
        generateDynamicFields(postToEdit.category);
        
        imagePreview.innerHTML = '';
        postToEdit.images.forEach(imgSrc => {
            const div = document.createElement('div');
            div.className = 'preview-image-container';
            div.innerHTML = `<img src="${imgSrc}" alt="preview"><button type="button" class="remove-image-btn">×</button>`;
            imagePreview.appendChild(div);
        });

        document.title = "Sửa Tin Đăng - ECOCYCLE";
        submitBtn.textContent = "Cập nhật tin";
        categoryModal.classList.add('hidden'); 
        postFormContainer.classList.remove('hidden');
        stickyActionBar.classList.remove('hidden');
        validateForm();
    }

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

    function validateForm() {
        const titleValue = document.getElementById('title').value.trim();
        const descriptionValue = document.getElementById('description').value.trim();
        const hasImage = imagePreview.children.length > 0;

        const isFormValid = titleValue.length > 0 && descriptionValue.length > 0 && hasImage;

        submitBtn.disabled = !isFormValid;
    }
    if (isEditMode) {
        populateFormForEdit(postIdToEdit);
    }
    // --- EVENT LISTENERS ---

    // Chọn danh mục
    categoryList.addEventListener('click', (e) => {
        const selectedLi = e.target.closest('li');
        if (!selectedLi) return;

        const category = selectedLi.dataset.category;
        const categoryName = selectedLi.dataset.categoryName;

        selectedCategoryDisplay.value = categoryName;
        generateDynamicFields(category);
        categoryModal.classList.add('hidden');
        postFormContainer.classList.remove('hidden');
        stickyActionBar.classList.remove('hidden');
        
        postForm.dataset.category = category;
        postForm.dataset.categoryName = categoryName;

        validateForm();
    });

    imageInput.addEventListener('change', handleImagePreview);

    imagePreview.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-image-btn')) {
            e.target.closest('.preview-image-container').remove();
            validateForm();
        }
    });

    postForm.addEventListener('input', validateForm);

    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const allPosts = JSON.parse(localStorage.getItem('userPosts')) || [];
        const formData = new FormData(postForm);
        const loggedInUser = localStorage.getItem('userName');
        
        const images = [];
        document.querySelectorAll('.preview-image-container img').forEach(img => images.push(img.src));

        if (isEditMode) {
            const postIndex = allPosts.findIndex(post => post.id == postIdToEdit);
            if (postIndex > -1) {
                allPosts[postIndex].title = formData.get('title');
                allPosts[postIndex].description = formData.get('description');
                allPosts[postIndex].price = formData.get('price');
                allPosts[postIndex].images = images;
            }
            localStorage.setItem('userPosts', JSON.stringify(allPosts));
            alert('Cập nhật tin đăng thành công!');
            window.location.href = 'my-posts.html'; 

        } else {
            const adData = {
                id: Date.now(),
                author: loggedInUser,
                category: postForm.dataset.category,
                categoryName: selectedCategoryDisplay.value,
                title: formData.get('title'),
                description: formData.get('description'),
                price: formData.get('price'),
                images: images,
                postDate: new Date().toLocaleDateString('vi-VN')
            };
            allPosts.unshift(adData);
            localStorage.setItem('userPosts', JSON.stringify(allPosts));
            alert('Đăng tin thành công!');
            
            const userRole = localStorage.getItem('userRole');
            window.location.href = userRole === 'vendor' ? 'dashboard.html' : 'index.html';
        }
    });
});