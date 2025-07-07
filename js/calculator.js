// js/calculator.js
document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'vendor') {
        alert("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản Người bán.");
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('calculator-form');
    if (!form) return;

    const materialSelect = document.getElementById('material-select');
    const weightInput = document.getElementById('weight-input');
    const resultDiv = document.getElementById('calculation-result');
    const estimatedPriceSpan = document.getElementById('estimated-price');

    // 1. Đổ dữ liệu vào dropdown
    priceData.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index; // Dùng index để dễ dàng truy xuất lại
        option.textContent = item.name;
        materialSelect.appendChild(option);
    });

    // 2. Xử lý sự kiện submit form
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedIndex = materialSelect.value;
        const weight = parseFloat(weightInput.value);

        if (selectedIndex === "" || !weight || weight <= 0) {
            alert("Vui lòng chọn loại phế liệu và nhập khối lượng hợp lệ.");
            return;
        }

        const selectedMaterial = priceData[selectedIndex];
        const priceString = selectedMaterial.price;

        if (priceString.toLowerCase().includes('liên hệ')) {
            estimatedPriceSpan.textContent = "Vui lòng liên hệ để có giá tốt nhất";
        } else {
            // "8.000 - 22.000" -> [8000, 22000]
            const priceParts = priceString.split('-').map(part => parseInt(part.trim().replace(/\./g, '')));
            const minPrice = priceParts[0];
            const maxPrice = priceParts.length > 1 ? priceParts[1] : minPrice;

            const estimatedMin = (minPrice * weight).toLocaleString('vi-VN');
            const estimatedMax = (maxPrice * weight).toLocaleString('vi-VN');
            
            if (estimatedMin === estimatedMax) {
                estimatedPriceSpan.textContent = `${estimatedMin} VNĐ`;
            } else {
                estimatedPriceSpan.textContent = `${estimatedMin} - ${estimatedMax} VNĐ`;
            }
        }
        
        resultDiv.style.display = 'block';
    });
});