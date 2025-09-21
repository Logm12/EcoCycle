// js/map.js (PHIÊN BẢN ĐÃ SỬA LỖI VÀ NÂNG CẤP)

document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO BIẾN VÀ LẤY ELEMENT ---
    const mapContainer = document.getElementById('map-container');
    const tradingBoardList = document.getElementById('trading-board-list');
    const addressInput = document.getElementById('address-input');
    // Thêm các bộ lọc khác nếu cần
    // const scrapTypeFilter = document.getElementById('scrap-type-filter');

    if (!mapContainer || !tradingBoardList || !addressInput) {
        console.error("Một hoặc nhiều element cần thiết không được tìm thấy!");
        return;
    }

    // --- KHỞI TẠO BẢN ĐỒ ---
    const map = L.map(mapContainer).setView([21.0285, 105.8542], 12);
    const markersLayer = L.layerGroup().addTo(map);
    let markers = {}; // Object để lưu trữ các marker theo ID

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- DỮ LIỆU GỐC (MASTER DATA) ---
    // Thêm thuộc tính "phone" vào dữ liệu
    const simulationData = [
        { id: 1, name: "Vựa phế liệu Hoàng Mai", role: "vendor", item: "Sắt đặc", quantity: 15000, price_per_kg: 10000, location_name: "Khu công nghiệp Vĩnh Tuy, Hoàng Mai, Hà Nội", lat: 20.993, lng: 105.868, phone: "0987 654 321" },
        { id: 2, name: "Công ty Môi Trường Xanh", role: "vendor", item: "Đồng cáp", quantity: 8500, price_per_kg: 180000, location_name: "Cụm công nghiệp Cầu Giấy, Hà Nội", lat: 21.038, lng: 105.783, phone: "0912 345 678" },
        { id: 3, name: "Anh Tuấn", role: "customer", item: "Giấy carton", quantity: 2500, price_per_kg: 4000, location_name: "Phố cổ, Hoàn Kiếm, Hà Nội", lat: 21.034, lng: 105.852, phone: "0905 112 233" },
        { id: 4, name: "Tái chế Thăng Long", role: "vendor", item: "Nhựa PP", quantity: 12000, price_per_kg: 15000, location_name: "Khu công nghiệp Sài Đồng B, Long Biên, Hà Nội", lat: 21.037, lng: 105.915, phone: "0979 888 999" },
        { id: 5, name: "Chị Hoa", role: "customer", item: "100 vỏ lon nhôm", quantity: 100, price_per_kg: 250, location_name: "Khu đô thị Times City, Hai Bà Trưng, Hà Nội", lat: 21.005, lng: 105.869, phone: "0333 456 789" },
        { id: 6, name: "Hợp tác xã Đồng Nát", role: "vendor", item: "Inox 304", quantity: 7000, price_per_kg: 45000, location_name: "Cụm công nghiệp Từ Liêm, Hà Nội", lat: 21.045, lng: 105.745, phone: "0888 123 456" },
        { id: 7, name: "Anh Minh", role: "customer", item: "5kg Dây điện cũ", quantity: 5, price_per_kg: 90000, location_name: "Làng lụa Vạn Phúc, Hà Đông, Hà Nội", lat: 20.963, lng: 105.778, phone: "0944 555 666" },
    ];
    
    // Dữ liệu này sẽ không thay đổi, dùng để reset bộ lọc
    const masterTradingData = [...simulationData]; // Thêm user từ localStorage nếu có

    // --- HÀM RENDER GIAO DIỆN ---
    function renderUI(dataToRender) {
        tradingBoardList.innerHTML = '';
        markersLayer.clearLayers();
        markers = {};

        if (dataToRender.length === 0) {
            tradingBoardList.innerHTML = `<p style="padding: 20px; text-align: center;">Không tìm thấy kết quả phù hợp.</p>`;
            return;
        }

        dataToRender.forEach(person => {
            // A. TẠO MỤC TRONG DANH SÁCH
            const card = document.createElement('div');
            card.className = 'trading-card';
            card.dataset.id = person.id;

            const estimatedPrice = (person.quantity * person.price_per_kg).toLocaleString('vi-VN');

            // **FIX 3: Thêm dòng hiển thị số điện thoại**
            card.innerHTML = `
                <div class="avatar">${person.name.charAt(0).toUpperCase()}</div>
                <div class="info">
                    <p class="name">${person.name}</p>
                    <p class="item">Bán: <strong>${person.quantity.toLocaleString('vi-VN')} kg ${person.item}</strong></p>
                    <p class="phone"><i class="fa-solid fa-phone"></i> ${person.phone}</p>
                    <p class="price">~ ${estimatedPrice} VNĐ</p>
                </div>
                <div class="location-pin" title="${person.location_name}">
                    <i class="fa-solid fa-map-marker-alt"></i>
                </div>
            `;
            tradingBoardList.appendChild(card);

            // B. TẠO MARKER TRÊN BẢN ĐỒ
            const marker = L.marker([person.lat, person.lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${person.name}</b><br>${person.item} - ${person.quantity}kg<br>ĐT: ${person.phone}`);
            markers[person.id] = marker;
        });
    }

    // --- HÀM LỌC VÀ SẮP XẾP DỮ LIỆU ---
    function filterAndSortData() {
        const searchTerm = addressInput.value.toLowerCase().trim();

        // **FIX 1: Lọc dữ liệu dựa trên ô tìm kiếm**
        let filteredData = masterTradingData.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(searchTerm);
            const locationMatch = item.location_name.toLowerCase().includes(searchTerm);
            return nameMatch || locationMatch;
        });

        // **FIX 2: Sắp xếp theo TỔNG GIÁ TRỊ giao dịch giảm dần**
        const calculateValue = (item) => item.quantity * item.price_per_kg;
        filteredData.sort((a, b) => calculateValue(b) - calculateValue(a));

        // Render lại giao diện với dữ liệu đã được lọc và sắp xếp
        renderUI(filteredData);
    }

    // --- GẮN CÁC SỰ KIỆN (EVENT LISTENERS) ---

    // Sự kiện tìm kiếm khi người dùng gõ vào ô input
    addressInput.addEventListener('keyup', filterAndSortData);

    // Sự kiện tương tác giữa danh sách và bản đồ
    tradingBoardList.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.trading-card');
        if (!card) return;
        const id = card.dataset.id;
        if (markers[id]) {
            card.classList.add('highlight');
            markers[id].openPopup();
        }
    });

    tradingBoardList.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.trading-card');
        if (!card) return;
        const id = card.dataset.id;
        if (markers[id]) {
            card.classList.remove('highlight');
            markers[id].closePopup();
        }
    });

    // --- KHỞI CHẠY LẦN ĐẦU ---
    filterAndSortData(); // Chạy lần đầu để hiển thị danh sách ban đầu đã được sắp xếp đúng
});
