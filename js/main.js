document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    function validarServicios() {
        const checkboxes = form.querySelectorAll('input[name="servicios[]"]');
        let checked = false;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) checked = true;
        });
        return checked;
    }

    function mostrarLoading() {
        loadingOverlay.classList.remove('hidden');
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 3000); // Ocultar después de 3 segundos por si algo falla
    }

    function validarFormulario() {
        const nombre = form.querySelector('[name="nombre"]').value.trim();
        const telefono = form.querySelector('[name="telefono"]').value.trim();
        
        if (nombre.length < 3) {
            alert('Por favor, introduce un nombre válido');
            return false;
        }
        
        if (!/^\d{9}$/.test(telefono)) {
            alert('Por favor, introduce un teléfono válido (9 dígitos)');
            return false;
        }
        
        if (!validarServicios()) {
            alert('Por favor, selecciona al menos un servicio para optimizar');
            return false;
        }
        
        return true;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validarFormulario()) return;
        
        const formData = new FormData(form);
        const nombre = formData.get('nombre');
        const telefono = formData.get('telefono');
        const servicios = [];
        formData.getAll('servicios[]').forEach(servicio => {
            servicios.push(servicio);
        });

        const mensaje = encodeURIComponent(`Hola, soy ${nombre}. Me interesa optimizar mis servicios de ${servicios.join(', ')}. ¿Podrían ayudarme?`);
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        let whatsappUrl;
        if (isMobile) {
            whatsappUrl = `https://api.whatsapp.com/send?phone=34661804306&text=${mensaje}`;
        } else {
            whatsappUrl = `https://web.whatsapp.com/send?phone=34661804306&text=${mensaje}`;
        }

        mostrarLoading();
        
        // Registrar el evento si tienes Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'iniciar_chat', {
                'event_category': 'conversiones',
                'event_label': servicios.join(', ')
            });
        }

        if (!isMobile) {
            window.open(whatsappUrl, 'whatsapp-web');
        } else {
            window.open(whatsappUrl, '_blank');
        }
    });

    // Animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Añadir elementos para animar
    const elementsToAnimate = document.querySelectorAll('.testimonials > div, .faq-section > div, .statistics > div');
    elementsToAnimate.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });

    // Mejorar accesibilidad del formulario
    const inputs = form.querySelectorAll('input, button');
    
    inputs.forEach(input => {
        input.addEventListener('invalid', (e) => {
            e.preventDefault();
            input.classList.add('error');
        });
        
        input.addEventListener('input', () => {
            input.classList.remove('error');
        });
    });
}); 