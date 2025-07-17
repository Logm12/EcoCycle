// js/map.js (PHIÊN BẢN HOÀN CHỈNH VỚI MAP INTERACTION)

document.addEventListener('DOMContentLoaded', () => {
    // --- KHỞI TẠO BẢN ĐỒ VÀ CÁC BIẾN TOÀN CỤC ---
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    const map = L.map(mapContainer).setView([21.0285, 105.8542], 12); // Zoom ra xa hơn một chút
    const markersLayer = L.layerGroup().addTo(map);
    let markers = {}; // Object để lưu trữ các marker theo ID

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- LOGIC CHO BẢNG TIN GIAO DỊCH ---
    const tradingBoardList = document.getElementById('trading-board-list');
    if (!tradingBoardList) return;

    // 1. TẠO DỮ LIỆU MÔ PHỎNG (SIMULATION DATA) VỚI TỌA ĐỘ
    const registeredUsers = JSON.parse(localStorage.getItem('ecoUsers')) || [];
    const simulationData = [
        { id: 1, name: "Vựa phế liệu Hoàng Mai", role: "vendor", item: "Sắt đặc", quantity: 15000, price_per_kg: 10000, location_name: "Khu công nghiệp Vĩnh Tuy, Hoàng Mai, Hà Nội", lat: 20.993, lng: 105.868 },
        { id: 2, name: "Công ty Môi Trường Xanh", role: "vendor", item: "Đồng cáp", quantity: 8500, price_per_kg: 180000, location_name: "Cụm công nghiệp Cầu Giấy, Hà Nội", lat: 21.038, lng: 105.783 },
        { id: 3, name: "Anh Tuấn", role: "customer", item: "Giấy carton", quantity: 2500, price_per_kg: 4000, location_name: "Phố cổ, Hoàn Kiếm, Hà Nội", lat: 21.034, lng: 105.852 },
        { id: 4, name: "Tái chế Thăng Long", role: "vendor", item: "Nhựa PP", quantity: 12000, price_per_kg: 15000, location_name: "Khu công nghiệp Sài Đồng B, Long Biên, Hà Nội", lat: 21.037, lng: 105.915 },
        { id: 5, name: "Chị Hoa", role: "customer", item: "100 vỏ lon nhôm", quantity: 100, price_per_kg: 250, location_name: "Khu đô thị Times City, Hai Bà Trưng, Hà Nội", lat: 21.005, lng: 105.869 },
        { id: 6, name: "Hợp tác xã Đồng Nát", role: "vendor", item: "Inox 304", quantity: 7000, price_per_kg: 45000, location_name: "Cụm công nghiệp Từ Liêm, Hà Nội", lat: 21.045, lng: 105.745 },
        { id: 7, name: "Anh Minh", role: "customer", item: "5kg Dây điện cũ", quantity: 5, price_per_kg: 90000, location_name: "Làng lụa Vạn Phúc, Hà Đông, Hà Nội", lat: 20.963, lng: 105.778 },
    ];
    
    // Gộp và xử lý dữ liệu
    let tradingData = [...simulationData, ...registeredUsers.map((user, index) => ({
        id: 100 + index, // Tạo ID duy nhất
        ...user,
        location_name: "Quận Thanh Xuân, Hà Nội",
        lat: 20.998 + (Math.random() - 0.5) * 0.01, // Random tọa độ quanh một điểm
        lng: 105.815 + (Math.random() - 0.5) * 0.01,
        item: "Phế liệu tổng hợp",
        quantity: Math.floor(Math.random() * 500) + 50,
        price_per_kg: 5000
    }))];

    // 2. HÀM RENDER DANH SÁCH VÀ BẢN ĐỒ
    function renderTradingBoard() {
        // Sắp xếp theo số lượng giảm dần
        tradingData.sort((a, b) => b.quantity - a.quantity);
        const displayList = tradingData.slice(0, 8); // Luôn hiển thị 8 người đầu

        tradingBoardList.innerHTML = '';
        markersLayer.clearLayers();
        markers = {}; // Reset object markers

        displayList.forEach(person => {
            // A. TẠO MỤC TRONG DANH SÁCH
            const card = document.createElement('div');
            card.className = 'trading-card';
            card.dataset.id = person.id; // Gán ID để liên kết

            const estimatedPrice = (person.quantity * person.price_per_kg).toLocaleString('vi-VN');

            card.innerHTML = `
                <div class="avatar">${person.name.charAt(0).toUpperCase()}</div>
                <div class="info">
                    <p class="name">${person.name}</p>
                    <p class="item">Bán: <strong>${person.quantity.toLocaleString('vi-VN')} kg ${person.item}</strong></p>
                    <p class="price">~ ${estimatedPrice} VNĐ</p>
                </div>
                <div class="location-pin" title="${person.location_name}">
                    <i class="fa-solid fa-map-marker-alt"></i>
                </div>
            `;
            tradingBoardList.appendChild(card);

            // B. TẠO MARKER TRÊN BẢN ĐỒ
            const marker = L.marker([person.lat, person.lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${person.name}</b><br>${person.item} - ${person.quantity}kg`);
            markers[person.id] = marker; // Lưu marker vào object với key là ID
        });
    }

    // 3. GẮN SỰ KIỆN TƯƠNG TÁC
    tradingBoardList.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.trading-card');
        if (!card) return;

        const id = card.dataset.id;
        const marker = markers[id];
        if (marker) {
            card.classList.add('highlight');
            marker.openPopup();
        }
    });

    tradingBoardList.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.trading-card');
        if (!card) return;

        const id = card.dataset.id;
        const marker = markers[id];
        if (marker) {
            card.classList.remove('highlight');
            marker.closePopup();
        }
    });

    // --- KHỞI CHẠY ---
    renderTradingBoard();
});