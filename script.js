document.addEventListener('DOMContentLoaded', function() {

    // 1. Sticky Header with scroll effect
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Footer Logo Uploader
    const logoUploader = document.getElementById('logo-uploader');
    const footerLogo = document.getElementById('footer-logo');

    if (logoUploader && footerLogo) {
        logoUploader.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                // Create a URL for the selected file
                const reader = new FileReader();
                reader.onload = function(e) {
                    footerLogo.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

});