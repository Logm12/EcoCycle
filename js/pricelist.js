// js/pricelist.js (PHIÊN BẢN ỔN ĐỊNH - SỬ DỤNG DỮ LIỆU NHÚNG)

document.addEventListener('DOMContentLoaded', () => {

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