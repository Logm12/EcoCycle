// js/pricelist.js (PHIÊN BẢN ỔN ĐỊNH - SỬ DỤNG DỮ LIỆU NHÚNG)

document.addEventListener('DOMContentLoaded', () => {
    // --- DỮ LIỆU GIÁ MỚI NHẤT (CẬP NHẬT NGÀY 06/07/2025) ---
    const priceData = [
        { name: "Sắt đặc", price: "8.000 - 22.000", note: "Nguyên chất, không lẫn tạp chất" },
        { name: "Sắt vụn", price: "8.500 - 14.000", note: "Sắt công trình, nhà xưởng" },
        { name: "Bazo sắt", price: "7.500 - 12.000", note: "Sắt tiện, phay" },
        { name: "Sắt gỉ sét", price: "8.000 - 13.000", note: "Sắt để lâu ngoài trời" },
        { name: "Dây thép sắt", price: "8.000 - 13.000", note: "Dây thép từ công trình" },
        { name: "Đồng cáp", price: "175.000 - 285.000", note: "Lõi đồng từ dây cáp lớn" },
        { name: "Đồng đỏ", price: "165.000 - 255.000", note: "Tỷ lệ đồng cao, không lẫn tạp chất" },
        { name: "Đồng vàng", price: "115.000 - 215.000", note: "Thường là hợp kim của đồng" },
        { name: "Mạt đồng vàng", price: "95.000 - 185.000", note: "Vụn đồng từ quá trình sản xuất" },
        { name: "Nhôm loại 1 (dẻo, thanh)", price: "53.000 - 71.000", note: "Nhôm nguyên chất, không sơn" },
        { name: "Nhôm loại 2 (hợp kim)", price: "43.000 - 62.000", note: "Nhôm từ chi tiết máy, vỏ" },
        { name: "Bột nhôm", price: "15.000 - 25.000", note: "Bột nhôm nguyên chất" },
        { name: "Nhôm dẻo", price: "45.000 - 55.000", note: "Nhôm có thể uốn dẻo" },
        { name: "Mạt nhôm", price: "32.000 - 48.000", note: "Vụn nhôm từ sản xuất" },
        { name: "Inox 304, 316", price: "41.000 - 68.000", note: "Loại cao cấp, không gỉ" },
        { name: "Inox 201, 430", price: "18.000 - 32.000", note: "Loại phổ thông" },
        { name: "Bazo Inox", price: "15.000 - 25.000", note: "Vụn inox từ sản xuất" },
        { name: "Nhựa ABS", price: "22.000 - 46.000", note: "Vỏ thiết bị điện tử" },
        { name: "Nhựa PP", price: "13.000 - 33.000", note: "Chai lọ, vật dụng gia đình" },
        { name: "Nhựa PVC", price: "9.000 - 27.000", note: "Ống nước, cửa nhựa" },
        { name: "Nhựa HI", price: "15.000 - 30.000", note: "Nhựa dẻo, chịu va đập" },
        { name: "Ống nhựa", price: "10.000 - 15.000", note: "Ống nhựa các loại" },
        { name: "Giấy carton", price: "3.500 - 8.000", note: "Thùng carton các loại" },
        { name: "Giấy báo", price: "4.500 - 9.000", note: "Giấy in báo" },
        { name: "Giấy photo", price: "5.000 - 10.000", note: "Giấy văn phòng" },
        { name: "Bình ắc quy", price: "23.000 - 38.000", note: "Ắc quy xe máy, ô tô" },
        { name: "Vải vụn", price: "2.000 - 15.000", note: "Vải thừa từ xưởng may" },
        { name: "Nilon", price: "9.000 - 25.000", note: "Túi nilon sạch" },
        { name: "Hợp kim", price: "Liên hệ", note: "Tùy loại và thành phần" },
        { name: "Chì", price: "35.000 - 55.000", note: "Chì cục, chì dẻo" },
        { name: "Kẽm", price: "30.000 - 45.000", note: "Kẽm in, kẽm cục" }
    ];

    // --- BIẾN TRẠNG THÁI ---
    let currentPage = 1;
    const rowsPerPage = 10;
    let filteredData = [...priceData];

    // --- DOM ELEMENTS ---
    const tableBody = document.getElementById('price-table-body');
    const searchInput = document.getElementById('search-input');
    const paginationControls = document.getElementById('pagination-controls');
    const paginationSummary = document.getElementById('pagination-summary');
    const searchBtn = document.getElementById('search-btn');

    // --- FUNCTIONS ---
    function displayTable(page) {
        currentPage = page;
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (filteredData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Không tìm thấy kết quả phù hợp.</td></tr>`;
            setupPagination();
            updateSummary();
            return;
        }

        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedItems = filteredData.slice(start, end);

        paginatedItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${start + index + 1}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.note}</td>
            `;
            tableBody.appendChild(row);
        });

        setupPagination();
        updateSummary();
    }

    function setupPagination() {
        if (!paginationControls) return;
        paginationControls.innerHTML = '';
        const pageCount = Math.ceil(filteredData.length / rowsPerPage);
        if (pageCount <= 1) {
            paginationSummary.style.display = 'none';
            return;
        }
        paginationSummary.style.display = 'block';

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '«';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => displayTable(currentPage - 1));
        paginationControls.appendChild(prevButton);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            if (i === currentPage) btn.classList.add('active');
            btn.addEventListener('click', () => displayTable(i));
            paginationControls.appendChild(btn);
        }

        const nextButton = document.createElement('button');
        nextButton.innerHTML = '»';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => displayTable(currentPage + 1));
        paginationControls.appendChild(nextButton);
    }
    
    function updateSummary() {
        if (!paginationSummary) return;
        const startItem = filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
        const endItem = Math.min(startItem + rowsPerPage - 1, filteredData.length);
        paginationSummary.innerText = `Đang hiển thị ${startItem}-${endItem} trên tổng số ${filteredData.length} mục.`;
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        filteredData = priceData.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
        displayTable(1);
    }

    // --- EVENT LISTENERS ---
    if (searchInput) searchInput.addEventListener('keyup', handleSearch);
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);

    // --- KHỞI CHẠY LẦN ĐẦU ---
    displayTable(1);
});