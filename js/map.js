// js/map.js (PHIÊN BẢN NÂNG CẤP VỚI CHỨC NĂNG TÌM GẦN TÔI)

document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO BIẾN VÀ LẤY ELEMENT ---
    const mapContainer = document.getElementById('map-container');
    const tradingBoardList = document.getElementById('trading-board-list');
    const addressInput = document.getElementById('address-input');
    const gpsButton = document.getElementById('gps-button'); // Lấy nút GPS
    const distanceFilter = document.getElementById('distance-filter'); // Lấy dropdown khoảng cách

    if (!mapContainer || !tradingBoardList || !addressInput || !gpsButton || !distanceFilter) {
        console.error("Một hoặc nhiều element cần thiết không được tìm thấy!");
        return;
    }

    // --- KHỞI TẠO BẢN ĐỒ ---
    const map = L.map(mapContainer).setView([21.0285, 105.8542], 12);
    const markersLayer = L.layerGroup().addTo(map);
    let markers = {};
    let userMarker = null; // Biến để lưu marker vị trí người dùng

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- DỮ LIỆU GỐC (MASTER DATA) ---
    const masterTradingData = [
        { id: 1, name: "Vựa phế liệu Hoàng Mai", role: "vendor", item: "Sắt đặc", quantity: 15000, price_per_kg: 10000, location_name: "Khu công nghiệp Vĩnh Tuy, Hoàng Mai, Hà Nội", lat: 20.993, lng: 105.868, phone: "0987 654 321" },
        { id: 2, name: "Công ty Môi Trường Xanh", role: "vendor", item: "Đồng cáp", quantity: 8500, price_per_kg: 180000, location_name: "Cụm công nghiệp Cầu Giấy, Hà Nội", lat: 21.038, lng: 105.783, phone: "0912 345 678" },
        { id: 3, name: "Anh Tuấn", role: "customer", item: "Giấy carton", quantity: 2500, price_per_kg: 4000, location_name: "Phố cổ, Hoàn Kiếm, Hà Nội", lat: 21.034, lng: 105.852, phone: "0905 112 233" },
        { id: 4, name: "Tái chế Thăng Long", role: "vendor", item: "Nhựa PP", quantity: 12000, price_per_kg: 15000, location_name: "Khu công nghiệp Sài Đồng B, Long Biên, Hà Nội", lat: 21.037, lng: 105.915, phone: "0979 888 999" },
        { id: 5, name: "Chị Hoa", role: "customer", item: "100 vỏ lon nhôm", quantity: 100, price_per_kg: 250, location_name: "Khu đô thị Times City, Hai Bà Trưng, Hà Nội", lat: 21.005, lng: 105.869, phone: "0333 456 789" },
        { id: 6, name: "Hợp tác xã Đồng Nát", role: "vendor", item: "Inox 304", quantity: 7000, price_per_kg: 45000, location_name: "Cụm công nghiệp Từ Liêm, Hà Nội", lat: 21.045, lng: 105.745, phone: "0888 123 456" },
        { id: 7, name: "Anh Minh", role: "customer", item: "5kg Dây điện cũ", quantity: 5, price_per_kg: 90000, location_name: "Làng lụa Vạn Phúc, Hà Đông, Hà Nội", lat: 20.963, lng: 105.778, phone: "0944 555 666" },
    ];

    // --- HÀM TÍNH KHOẢNG CÁCH (HAVERSINE) ---
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Khoảng cách (km)
    }

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
            const card = document.createElement('div');
            card.className = 'trading-card';
            card.dataset.id = person.id;
            const estimatedPrice = (person.quantity * person.price_per_kg).toLocaleString('vi-VN');

            // Hiển thị khoảng cách nếu có
            const distanceInfo = person.distance ? `<p class="distance"><i class="fa-solid fa-route"></i> Khoảng ${person.distance.toFixed(2)} km</p>` : '';

            card.innerHTML = `
                <div class="avatar">${person.name.charAt(0).toUpperCase()}</div>
                <div class="info">
                    <p class="name">${person.name}</p>
                    <p class="item">Bán: <strong>${person.quantity.toLocaleString('vi-VN')} kg ${person.item}</strong></p>
                    <p class="phone"><i class="fa-solid fa-phone"></i> ${person.phone}</p>
                    ${distanceInfo}
                </div>
                <div class="price-location">
                    <p class="price">~ ${estimatedPrice} VNĐ</p>
                    <div class="location-pin" title="${person.location_name}">
                        <i class="fa-solid fa-map-marker-alt"></i>
                    </div>
                </div>
            `;
            tradingBoardList.appendChild(card);

            const marker = L.marker([person.lat, person.lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${person.name}</b><br>${person.item} - ${person.quantity}kg<br>ĐT: ${person.phone}`);
            markers[person.id] = marker;
        });
    }

    // --- HÀM LỌC VÀ SẮP XẾP DỮ LIỆU (CHO TÌM KIẾM VĂN BẢN) ---
    function filterAndSortData() {
        const searchTerm = addressInput.value.toLowerCase().trim();
        let filteredData = masterTradingData.filter(item => {
            // Xóa thông tin khoảng cách cũ khi tìm kiếm bằng text
            delete item.distance;
            const nameMatch = item.name.toLowerCase().includes(searchTerm);
            const locationMatch = item.location_name.toLowerCase().includes(searchTerm);
            return nameMatch || locationMatch;
        });
        const calculateValue = (item) => item.quantity * item.price_per_kg;
        filteredData.sort((a, b) => calculateValue(b) - calculateValue(a));
        renderUI(filteredData);
    }

    // --- LOGIC TÌM KIẾM VỊ TRÍ ---
    function findNearby() {
        if (!navigator.geolocation) {
            alert("Trình duyệt của bạn không hỗ trợ định vị.");
            return;
        }

        gpsButton.disabled = true;
        gpsButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang tìm...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Cập nhật bản đồ
                map.setView([userLat, userLng], 13);
                if (userMarker) map.removeLayer(userMarker); // Xóa marker cũ
                userMarker = L.circleMarker([userLat, userLng], {
                    radius: 8,
                    color: '#fff',
                    weight: 2,
                    fillColor: '#007bff',
                    fillOpacity: 1
                }).addTo(map).bindPopup("<b>Vị trí của bạn</b>").openPopup();

                // Lọc và sắp xếp dữ liệu theo khoảng cách
                const maxDistance = parseFloat(distanceFilter.value);
                
                const nearbyData = masterTradingData
                    .map(item => {
                        const distance = getDistanceFromLatLonInKm(userLat, userLng, item.lat, item.lng);
                        return { ...item, distance }; // Thêm thuộc tính khoảng cách
                    })
                    .filter(item => item.distance <= maxDistance) // Lọc trong bán kính đã chọn
                    .sort((a, b) => a.distance - b.distance); // Sắp xếp gần nhất lên đầu

                renderUI(nearbyData);

                gpsButton.disabled = false;
                gpsButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Tìm gần tôi';
            },
            (error) => {
                let errorMessage = "Đã xảy ra lỗi khi lấy vị trí của bạn.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Bạn đã từ chối quyền truy cập vị trí.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Thông tin vị trí không có sẵn.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Yêu cầu lấy vị trí đã hết hạn.";
                        break;
                }
                alert(errorMessage);
                gpsButton.disabled = false;
                gpsButton.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Tìm gần tôi';
            }
        );
    }

    // --- GẮN CÁC SỰ KIỆN (EVENT LISTENERS) ---
    addressInput.addEventListener('keyup', filterAndSortData);
    gpsButton.addEventListener('click', findNearby);

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
    filterAndSortData();
});
