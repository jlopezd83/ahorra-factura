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
        
        // Validar nombre
        if (!nombre) {
            mostrarError('Por favor, introduce tu nombre');
            form.querySelector('[name="nombre"]').focus();
            return false;
        }
        
        if (nombre.length < 3) {
            mostrarError('El nombre debe tener al menos 3 caracteres');
            form.querySelector('[name="nombre"]').focus();
            return false;
        }
        
        // Validar teléfono
        if (!telefono) {
            mostrarError('Por favor, introduce tu número de teléfono');
            form.querySelector('[name="telefono"]').focus();
            return false;
        }
        
        if (!/^\d{9}$/.test(telefono)) {
            mostrarError('El teléfono debe tener 9 dígitos');
            form.querySelector('[name="telefono"]').focus();
            return false;
        }
        
        // Validar servicios
        if (!validarServicios()) {
            mostrarError('Por favor, selecciona al menos un servicio para optimizar');
            return false;
        }
        
        return true;
    }

    function mostrarError(mensaje) {
        // Crear o actualizar el div de error
        let errorDiv = document.getElementById('errorMensaje');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorMensaje';
            errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
            form.insertBefore(errorDiv, form.firstChild);
        }
        errorDiv.textContent = mensaje;
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Limpiar mensaje de error cuando el usuario empiece a escribir
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            const errorDiv = document.getElementById('errorMensaje');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    });

    // Limpiar mensaje de error cuando se seleccione un checkbox
    form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const errorDiv = document.getElementById('errorMensaje');
            if (errorDiv && validarServicios()) {
                errorDiv.remove();
            }
        });
    });

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

    // Testimonios dinámicos
    async function cargarTestimonios() {
        try {
            const response = await fetch('data/testimonios.json');
            const data = await response.json();
            const testimoniosContainer = document.querySelector('.testimonios-container');
            let currentIndex = 0;

            function mostrarTestimonios() {
                const testimonio = data.testimonios[currentIndex];
                
                testimoniosContainer.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-md opacity-0 transform translate-y-4 transition-all duration-500">
                        <div class="flex items-center mb-4">
                            <div class="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                                <span class="text-blue-600 font-bold">${testimonio.iniciales}</span>
                            </div>
                            <div>
                                <h4 class="font-bold">${testimonio.nombre}</h4>
                                <p class="text-gray-600">${testimonio.ciudad}</p>
                            </div>
                        </div>
                        <p class="text-gray-600">"${testimonio.texto}"</p>
                    </div>
                `;

                // Animar entrada
                setTimeout(() => {
                    document.querySelectorAll('.testimonios-container > div').forEach(el => {
                        el.classList.remove('opacity-0', 'translate-y-4');
                    });
                }, 100);

                currentIndex = (currentIndex + 1) % data.testimonios.length;
            }

            mostrarTestimonios();
            setInterval(mostrarTestimonios, 5000);
        } catch (error) {
            console.error('Error cargando testimonios:', error);
        }
    }

    // Cargar testimonios inmediatamente
    cargarTestimonios();
}); 