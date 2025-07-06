// js/map.js

(function() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
        return;
    }

    const HANOI_COORDS = [21.0285, 105.8542];
    const map = L.map(mapContainer).setView(HANOI_COORDS, 13);
    const markersLayer = L.layerGroup().addTo(map);
    let userLocation = HANOI_COORDS; 
    let userMarker = null;
//Replace by API in the future
    const locationsData = [
        { id: 1, name: "Vựa Phế Liệu Thuận Phát", address: "123 Đường Giải Phóng, Hai Bà Trưng, Hà Nội", lat: 21.0047, lng: 105.8431, types: ["metal", "plastic"], rating: 4.5 },
        { id: 2, name: "Điểm Thu Mua Giấy Cô Lan", address: "45 Ngõ Tự Do, Cầu Giấy, Hà Nội", lat: 21.0333, lng: 105.7950, types: ["paper"], rating: 4.8 },
        { id: 3, name: "Tái Chế Đồ Điện Tử 24h", address: "88 Phố Huế, Hoàn Kiếm, Hà Nội", lat: 21.0165, lng: 105.8521, types: ["electronics", "metal"], rating: 4.2 },
        { id: 4, name: "Kho Phế Liệu Minh Anh", address: "210 Nguyễn Trãi, Thanh Xuân, Hà Nội", lat: 20.9937, lng: 105.8114, types: ["metal", "paper", "plastic"], rating: 4.0 },
        { id: 5, name: "Thu Mua Chai Lọ Nhựa", address: "15 Ngõ 120 Hoàng Quốc Việt, Cầu Giấy", lat: 21.0456, lng: 105.7999, types: ["plastic"], rating: 4.6 },
        { id: 6, name: "Sắt Vụn Chú Hùng", address: "33 Đê La Thành, Đống Đa, Hà Nội", lat: 21.0228, lng: 105.8223, types: ["metal"], rating: 3.9 }
    ];

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Bán kính Trái Đất (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function renderLocationList(locations) {
        const listElement = document.getElementById('results-list');
        if (!listElement) return;
        listElement.innerHTML = '';

        if (locations.length === 0) {
            listElement.innerHTML = '<div class="no-results">Không tìm thấy địa điểm nào phù hợp.</div>';
            return;
        }

        locations.forEach(location => {
            const card = document.createElement('div');
            card.className = 'location-card';
            card.dataset.id = location.id;

            const ratingStars = `${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(location.rating))}${location.rating % 1 !== 0 ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}${'<i class="fa-regular fa-star"></i>'.repeat(5 - Math.ceil(location.rating))}`;

            card.innerHTML = `
                <h3 class="location-name">${location.name}</h3>
                <p class="location-address"><i class="fa-solid fa-location-dot"></i> ${location.address}</p>
                <p class="location-distance"><i class="fa-solid fa-road"></i> Khoảng ${location.distance.toFixed(2)} km</p>
                <div class="rating-stars">${ratingStars}<span>(${location.rating.toFixed(1)})</span></div>
                <div class="card-actions">
                    <a href="#" class="btn btn-secondary">Xem chi tiết</a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}" target="_blank" class="btn btn-primary">Chỉ đường</a>
                </div>
            `;
            
            card.addEventListener('click', () => {
                map.setView([location.lat, location.lng], 15);
                document.querySelectorAll('.location-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });

            listElement.appendChild(card);
        });
    }

    function renderMapMarkers(locations) {
        markersLayer.clearLayers();
        locations.forEach(location => {
            const marker = L.marker([location.lat, location.lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${location.name}</b><br>${location.address}`);
            
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

    function updateResults() {
        const addressQuery = document.getElementById('address-input').value.toLowerCase();
        const typeFilter = document.getElementById('scrap-type-filter').value;
        const distanceFilter = parseFloat(document.getElementById('distance-filter').value);
        const sortFilter = document.getElementById('sort-filter').value;

        let filteredLocations = locationsData
            .filter(loc => loc.name.toLowerCase().includes(addressQuery) || loc.address.toLowerCase().includes(addressQuery))
            .filter(loc => typeFilter === 'all' || loc.types.includes(typeFilter))
            .map(loc => ({ ...loc, distance: calculateDistance(userLocation[0], userLocation[1], loc.lat, loc.lng) }))
            .filter(loc => loc.distance <= distanceFilter);

        if (sortFilter === 'distance') {
            filteredLocations.sort((a, b) => a.distance - b.distance);
        } else if (sortFilter === 'rating') {
            filteredLocations.sort((a, b) => b.rating - a.rating);
        }

        renderLocationList(filteredLocations);
        renderMapMarkers(filteredLocations);
    }

    function addEventListeners() {
        document.getElementById('address-input')?.addEventListener('keyup', updateResults);
        document.getElementById('scrap-type-filter')?.addEventListener('change', updateResults);
        document.getElementById('distance-filter')?.addEventListener('change', updateResults);
        document.getElementById('sort-filter')?.addEventListener('change', updateResults);

        document.getElementById('gps-button')?.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Trình duyệt của bạn không hỗ trợ định vị.");
                return;
            }
            navigator.geolocation.getCurrentPosition(position => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                map.setView(userLocation, 14);

                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker(userLocation, {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                    })
                }).addTo(map).bindPopup("<b>Vị trí của bạn</b>").openPopup();

                updateResults();
            }, () => {
                alert("Không thể truy cập vị trí của bạn. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.");
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        addEventListeners();
        updateResults(); // Chạy lần đầu khi tải trang
    });

})(); 
