// js/map.js (PHIÊN BẢN HOÀN CHỈNH VỚI TABS VÀ LEADERBOARD)

document.addEventListener('DOMContentLoaded', () => {
    // --- KHỞI TẠO CHUNG ---
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return; // Thoát nếu không phải trang địa điểm

    const map = L.map(mapContainer).setView([21.0285, 105.8542], 13);
    const markersLayer = L.layerGroup().addTo(map); // Lớp để chứa các marker địa điểm
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // ===================================================================
    // LOGIC CHUYỂN TAB
    // ===================================================================
    function initializeTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                const tabId = button.dataset.tab;
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });
    }

    // ===================================================================
    // LOGIC CHO TAB "ĐỊA ĐIỂM" (TÌM KIẾM VỰA PHẾ LIỆU)
    // ===================================================================
function initializeLocationFinder() {
    const resultsList = document.getElementById('results-list');
    if (!resultsList) return;

    // Lấy dữ liệu người bán từ localStorage
    const allUsers = JSON.parse(localStorage.getItem('ecoUsers')) || [];
    const vendors = allUsers.filter(user => user.role === 'vendor');

    function renderVendorList(vendorList) {
        resultsList.innerHTML = '';
        if (vendorList.length === 0) {
            resultsList.innerHTML = '<p style="text-align: center; color: #666;">Chưa có người bán nào đăng ký.</p>';
            return;
        }
        vendorList.forEach(vendor => {
            const card = document.createElement('div');
            card.className = 'location-card'; // Tái sử dụng class CSS
            card.innerHTML = `
                <h3>${vendor.name}</h3>
                <p><i class="fa-solid fa-phone"></i> <strong>SĐT:</strong> ${vendor.phone || 'Chưa cập nhật'}</p>
                <p><i class="fa-solid fa-envelope"></i> <strong>Email:</strong> ${vendor.email}</p>
            `;
            resultsList.appendChild(card);
        });
    }

    // Hiển thị danh sách ban đầu
    renderVendorList(vendors);

}

// Các hàm cho tab địa điểm (nếu cần dùng dữ liệu locationsData, bạn cần định nghĩa nó)
function renderMapMarkers(locations) {
    markersLayer.clearLayers();
    locations.forEach(location => {
        L.marker([location.lat, location.lng]).addTo(markersLayer)
            .bindPopup(`<b>${location.name}</b><br>${location.address}`);
    });
}

function renderLocationList(locations) {
    // Bạn cần định nghĩa hàm này nếu muốn hiển thị danh sách địa điểm
    // Ví dụ: giống như renderVendorList nhưng cho dữ liệu locations
}

function applyLocationFilters() {
    // Ở đây bạn có thể thêm logic đọc từ các ô filter như trước
    // Ví dụ: const searchTerm = document.getElementById('address-input').value;
    // Hiện tại, chúng ta sẽ hiển thị tất cả
    if (typeof locationsData !== 'undefined') {
        renderLocationList(locationsData);
        renderMapMarkers(locationsData);
    }
}

// Chạy lần đầu cho tab địa điểm
applyLocationFilters();
    
    // ===================================================================
    // LOGIC CHO TAB "KHÁCH HÀNG" (LEADERBOARD ĐỘNG)
    // ===================================================================
    function initializeCustomerLeaderboard() {
        const leaderboardList = document.getElementById('customer-leaderboard-list');
        if (!leaderboardList) return;

        let allUsers = JSON.parse(localStorage.getItem('ecoUsers')) || [];
        let customers = allUsers.filter(user => user.role === 'customer');
        const sampleItems = ["5kg Đồng Vàng", "10kg Sắt vụn", "20kg Giấy carton", "5kg Dây điện cũ", "100 vỏ lon nhôm", "15kg Nhựa PP", "3kg Inox 304"];
        
        customers = customers.map((customer, index) => ({
            ...customer,
            selling: sampleItems[index % sampleItems.length],
            status: 'pending'
        }));

        function sortCustomers(customerList) {
            return customerList.sort((a, b) => {
                if (a.status === 'accepted' && b.status !== 'accepted') return -1;
                if (b.status === 'accepted' && a.status !== 'accepted') return 1;
                return 0;
            });
        }

        function renderLeaderboard() {
            leaderboardList.innerHTML = '';
            const sorted = sortCustomers(customers);
            const displayList = sorted.slice(0, 8); // Chỉ hiển thị 8 người

            if (displayList.length === 0) {
                leaderboardList.innerHTML = '<p style="text-align: center; color: #666;">Chưa có khách hàng nào đăng ký.</p>';
                return;
            }

            displayList.forEach(customer => {
                const card = document.createElement('div');
                card.className = 'customer-card';
                if (customer.status === 'accepted') card.classList.add('accepted');
                const isAccepted = customer.status === 'accepted';
                card.innerHTML = `
                    <div class="customer-avatar">${customer.name.charAt(0).toUpperCase()}</div>
                    <div class="customer-info">
                        <div class="name">${customer.name}</div>
                        <div class="item">Đang bán: <strong>${customer.selling}</strong></div>
                    </div>
                    <div class="customer-action">
                        <button class="btn-accept" data-email="${customer.email}" ${isAccepted ? 'disabled' : ''}>
                            ${isAccepted ? 'Đã chấp nhận' : 'Chấp nhận giá'}
                        </button>
                    </div>
                `;
                leaderboardList.appendChild(card);
            });
        }

        leaderboardList.addEventListener('click', (e) => {
            if (e.target.matches('.btn-accept')) {
                const userEmail = e.target.dataset.email;
                const targetCustomer = customers.find(c => c.email === userEmail);
                if (targetCustomer) {
                    targetCustomer.status = 'accepted';
                    renderLeaderboard();
                }
            }
        });

        function animateUpdate() {
            leaderboardList.classList.add('updating');
            setTimeout(() => {
                customers.sort(() => Math.random() - 0.5);
                renderLeaderboard();
                leaderboardList.classList.remove('updating');
            }, 500);
        }

        renderLeaderboard();
        setInterval(animateUpdate, 8000);
    }

    // --- KHỞI CHẠY TẤT CẢ CÁC MODULE ---
    initializeTabSwitching();
    initializeLocationFinder();
    initializeCustomerLeaderboard();
});