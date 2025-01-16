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
                <div class="bg-white p-4 rounded-lg shadow-md opacity-0 transform translate-y-4 transition-all duration-500">
                    <div class="flex items-center mb-4">
                        <div class="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <span class="text-blue-600 font-bold">${testimonio.iniciales}</span>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm">${testimonio.nombre}</h4>
                            <p class="text-gray-600 text-sm">${testimonio.ciudad}</p>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm">"${testimonio.texto}"</p>
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
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
        errorDiv.innerHTML = mensaje;
        
        const form = document.getElementById('contactForm');
        const existingError = form.querySelector('.bg-red-100');
        if (existingError) {
            existingError.remove();
        }
        form.appendChild(errorDiv);
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

    // Cargar testimonios
    cargarTestimonios();

    // Menú móvil
    const menuButton = document.getElementById('menuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');
    const openChatMobile = document.getElementById('openChatMobile');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    // Abrir menú
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    });

    // Cerrar menú
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurar scroll
    });

    // Cerrar al hacer click fuera
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // Cerrar al hacer click en links
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    });

    // Botón de chat en móvil
    openChatMobile.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
        document.getElementById('chatbot').classList.remove('translate-y-full');
        if (window.chatbot) {
            if (window.chatbot.currentStep === 0) {
                window.chatbot.showNextQuestion();
            }
        } else {
            console.error('Chatbot no inicializado');
        }
    });

    function showCookieConsent() {
        const consent = document.createElement('div');
        consent.innerHTML = `
            <div class="fixed bottom-0 w-full bg-gray-900 text-white p-4 z-50">
                <div class="container mx-auto flex justify-between items-center">
                    <p>Utilizamos cookies para mejorar tu experiencia.</p>
                    <button class="bg-blue-600 px-4 py-2 rounded">Aceptar</button>
                </div>
            </div>
        `;
        document.body.appendChild(consent);
    }
});

// Función global para WhatsApp
function iniciarWhatsApp() {
    const form = document.getElementById('contactForm');
    const nombre = form.querySelector('#nombre').value.trim();
    const telefono = form.querySelector('#telefono').value.trim();
    const servicios = Array.from(form.querySelectorAll('input[name="servicios[]"]:checked')).map(cb => cb.value);
    
    // Eliminar error anterior si existe
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Validar campos
    if (!nombre || !telefono || servicios.length === 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
        errorDiv.innerHTML = 'Por favor, rellena todos los campos y selecciona al menos un servicio';
        form.appendChild(errorDiv);
        return;
    }
    
    // Validar formato de teléfono
    const telefonoLimpio = telefono.replace(/[\s-]/g, '');
    if (!/^[6789]\d{8}$/.test(telefonoLimpio)) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
        errorDiv.innerHTML = 'Por favor, introduce un número de teléfono válido español (9 dígitos)';
        form.appendChild(errorDiv);
        return;
    }
    
    // Crear mensaje para WhatsApp
    const mensaje = `Hola, soy ${nombre}. Me interesan los siguientes servicios: ${servicios.join(', ')}`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Mostrar mensaje de aviso
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-md">
            <div class="mb-4">
                <svg class="w-12 h-12 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
                </svg>
            </div>
            <p class="text-gray-600 mb-4">Se abrirá WhatsApp en una nueva pestaña.</p>
            <p class="text-sm text-gray-500">Si ya tienes WhatsApp Web abierto, puedes usar esa pestaña.</p>
        </div>
    `;
    loadingOverlay.classList.remove('hidden');

    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 2000);
    
    // Intentar abrir WhatsApp Web primero
    const whatsappWeb = window.open(`https://web.whatsapp.com/send?phone=34670449218&text=${mensajeCodificado}`, '_blank');
    
    // Si WhatsApp Web falla o no está disponible, intentar con la versión móvil
    whatsappWeb.addEventListener('load', (event) => {
        if (event.target.location.href.includes('web.whatsapp.com/send')) {
            // WhatsApp Web funcionó
            return;
        } else {
            // Si WhatsApp Web no está disponible, usar la versión móvil
            whatsappWeb.close();
            window.open(`https://wa.me/34670449218?text=${mensajeCodificado}`, '_blank');
        }
    });
} 