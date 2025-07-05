document.addEventListener('DOMContentLoaded', function() {

    // --- KHỞI TẠO BIẾN ---
    const map = L.map('map-container').setView([21.0285, 105.8542], 13); // Mặc định ở Hà Nội
    const markersLayer = L.layerGroup().addTo(map);
    let userLocation = [21.0285, 105.8542]; // Vị trí mặc định của người dùng
    let userMarker = null;

    // --- DỮ LIỆU MẪU (THAY THẾ BẰNG API TRONG THỰC TẾ) ---
    const locationsData = [
        { id: 1, name: "Vựa Phế Liệu Thuận Phát", address: "123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội", lat: 21.0047, lng: 105.8431, types: ["metal", "plastic"], rating: 4.5 },
        { id: 2, name: "Điểm Thu Mua Giấy Cô Lan", address: "45 Ngõ Tự Do, Cầu Giấy, Hà Nội", lat: 21.0333, lng: 105.7950, types: ["paper"], rating: 4.8 },
        { id: 3, name: "Tái Chế Đồ Điện Tử 24h", address: "88 Phố Huế, Hoàn Kiếm, Hà Nội", lat: 21.0165, lng: 105.8521, types: ["electronics", "metal"], rating: 4.2 },
        { id: 4, name: "Kho Phế Liệu Minh Anh", address: "210 Nguyễn Trãi, Thanh Xuân, Hà Nội", lat: 20.9937, lng: 105.8114, types: ["metal", "paper", "plastic"], rating: 4.0 },
        { id: 5, name: "Thu Mua Chai Lọ Nhựa", address: "15 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy", lat: 21.0456, lng: 105.7999, types: ["plastic"], rating: 4.6 },
        { id: 6, name: "Sắt Vụn Chú Hùng", address: "33 Đê La Thành, Đống Đa, Hà Nội", lat: 21.0228, lng: 105.8223, types: ["metal"], rating: 3.9 }
    ];

    // --- CÀI ĐẶT BẢN ĐỒ ---
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- CÁC HÀM TIỆN ÍCH ---

    // Hàm tính khoảng cách giữa 2 điểm (công thức Haversine)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Khoảng cách (km)
    }

    // --- CÁC HÀM RENDER (HIỂN THỊ) ---

    // Hàm hiển thị danh sách kết quả
    function renderLocationList(locations) {
        const listElement = document.getElementById('results-list');
        listElement.innerHTML = ''; // Xóa danh sách cũ

        if (locations.length === 0) {
            listElement.innerHTML = '<div class="no-results">Không tìm thấy địa điểm nào phù hợp.</div>';
            return;
        }

        locations.forEach(location => {
            const card = document.createElement('div');
            card.className = 'location-card';
            card.dataset.id = location.id; // Gán ID để liên kết với marker

            card.innerHTML = `
                <h3 class="location-name">${location.name}</h3>
                <p class="location-address"><i class="fa-solid fa-location-dot"></i> ${location.address}</p>
                <p class="location-distance"><i class="fa-solid fa-road"></i> Khoảng ${location.distance.toFixed(2)} km</p>
                <div class="rating-stars">
                    ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(location.rating))}
                    ${location.rating % 1 !== 0 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}
                    ${'<i class="fa-regular fa-star"></i>'.repeat(5 - Math.ceil(location.rating))}
                    <span>(${location.rating.toFixed(1)})</span>
                </div>
                <div class="card-actions">
                    <a href="#" class="btn btn-secondary">Xem chi tiết</a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}" target="_blank" class="btn btn-primary">Chỉ đường</a>
                </div>
            `;
            
            // Sự kiện khi click vào thẻ -> zoom tới marker trên bản đồ
            card.addEventListener('click', () => {
                map.setView([location.lat, location.lng], 15);
                // Làm nổi bật thẻ được chọn
                document.querySelectorAll('.location-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });

            listElement.appendChild(card);
        });
    }

    // Hàm hiển thị các ghim trên bản đồ
    function renderMapMarkers(locations) {
        markersLayer.clearLayers(); // Xóa các marker cũ

        locations.forEach(location => {
            const marker = L.marker([location.lat, location.lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${location.name}</b><br>${location.address}`);
            
            // Sự kiện khi click vào marker -> làm nổi bật thẻ trong danh sách
            marker.on('click', () => {
                const card = document.querySelector(`.location-card[data-id='${location.id}']`);
                if (card) {
                    document.querySelectorAll('.location-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    // --- HÀM LỌC VÀ CẬP NHẬT KẾT QUẢ ---
    function updateResults() {
        // Lấy giá trị từ các bộ lọc
        const addressQuery = document.getElementById('address-input').value.toLowerCase();
        const typeFilter = document.getElementById('scrap-type-filter').value;
        const distanceFilter = parseFloat(document.getElementById('distance-filter').value);
        const sortFilter = document.getElementById('sort-filter').value;

        // 1. Lọc theo từ khóa địa chỉ
        let filteredLocations = locationsData.filter(location => 
            location.name.toLowerCase().includes(addressQuery) || 
            location.address.toLowerCase().includes(addressQuery)
        );

        // 2. Lọc theo loại phế liệu
        if (typeFilter !== 'all') {
            filteredLocations = filteredLocations.filter(location => location.types.includes(typeFilter));
        }

        // 3. Tính toán khoảng cách và lọc theo khoảng cách
        filteredLocations.forEach(location => {
            location.distance = calculateDistance(userLocation[0], userLocation[1], location.lat, location.lng);
        });
        filteredLocations = filteredLocations.filter(location => location.distance <= distanceFilter);

        // 4. Sắp xếp kết quả
        if (sortFilter === 'distance') {
            filteredLocations.sort((a, b) => a.distance - b.distance);
        } else if (sortFilter === 'rating') {
            filteredLocations.sort((a, b) => b.rating - a.rating);
        }

        // 5. Hiển thị kết quả
        renderLocationList(filteredLocations);
        renderMapMarkers(filteredLocations);
    }

    // --- GẮN CÁC SỰ KIỆN ---

    // Gắn sự kiện cho các bộ lọc
    document.getElementById('address-input').addEventListener('keyup', updateResults);
    document.getElementById('scrap-type-filter').addEventListener('change', updateResults);
    document.getElementById('distance-filter').addEventListener('change', updateResults);
    document.getElementById('sort-filter').addEventListener('change', updateResults);

    // Sự kiện cho nút "Tìm gần tôi"
    document.getElementById('gps-button').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                map.setView(userLocation, 14); // Zoom tới vị trí người dùng

                // Xóa marker cũ (nếu có) và thêm marker mới cho vị trí người dùng
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                userMarker = L.marker(userLocation, {
                    icon: L.icon({ // Tạo icon tùy chỉnh cho đẹp hơn
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(map);
                userMarker.bindPopup("<b>Vị trí của bạn</b>").openPopup();

                updateResults(); // Cập nhật lại kết quả dựa trên vị trí mới
            }, () => {
                alert("Không thể truy cập vị trí của bạn. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.");
            });
        } else {
            alert("Trình duyệt của bạn không hỗ trợ định vị.");
        }
    });

    // --- CHẠY LẦN ĐẦU KHI TẢI TRANG ---
    updateResults();
});