class Chatbot {
    constructor() {
        this.responses = {
            nombre: '',
            email: '',
            telefono: '',
            servicios: [],
            contacto: ''
        };
        this.currentStep = 0;
        this.steps = [
            {
                question: '👋 ¡Hola! ¿Cuál es tu nombre?',
                type: 'text',
                field: 'nombre'
            },
            {
                question: '📧 ¿Cuál es tu email?',
                type: 'email',
                field: 'email'
            },
            {
                question: '📱 ¿Cuál es tu teléfono?',
                type: 'tel',
                field: 'telefono'
            },
            {
                question: '🔍 ¿Qué servicios te interesan?',
                type: 'checkbox',
                field: 'servicios',
                options: [
                    'Luz',
                    'Gas',
                    'Internet',
                    'Móvil',
                    'Alarma'
                ]
            },
            {
                question: '📞 ¿Cómo prefieres que te contactemos?',
                type: 'radio',
                field: 'contacto',
                options: [
                    'WhatsApp',
                    'Llamada',
                    'Email'
                ]
            }
        ];
    }

    validateEmail(email) {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
    }
    
    validatePhone(phone) {
        // Acepta formatos: 666666666, 666-666-666, 666 666 666
        phone = phone.replace(/[\s-]/g, '');
        return /^[6789]\d{8}$/.test(phone);
    }
    
    validateName(name) {
        return name.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
    }

    createChatInterface() {
        const chatHtml = `
            <div id="chatbot" class="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl transform transition-transform duration-300 translate-y-full">
                <div class="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
                    <h3 class="font-bold">Chat con Ahorra Factura</h3>
                    <button id="closeChat" class="text-white hover:text-gray-200">×</button>
                </div>
                <div id="chatMessages" class="p-4 h-96 overflow-y-auto"></div>
                <div id="chatInput" class="p-4 border-t"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatHtml);
    }

    async sendResponses() {
        try {
            const response = await fetch('https://formspree.io/f/xdkkjgqr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: this.responses.nombre,
                    email: this.responses.email,
                    telefono: this.responses.telefono,
                    servicios: this.responses.servicios,
                    contacto: this.responses.contacto,
                    fecha: new Date().toISOString()
                })
            });
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

    showNextQuestion() {
        if (this.currentStep >= this.steps.length) {
            this.finishChat();
            return;
        }

        const step = this.steps[this.currentStep];
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');

        // Mostrar pregunta
        chatMessages.insertAdjacentHTML('beforeend', `
            <div class="mb-4">
                <div class="bg-blue-100 p-3 rounded-lg inline-block">${step.question}</div>
            </div>
        `);

        // Crear input según el tipo
        let inputHtml = '';
        switch (step.type) {
            case 'checkbox':
                inputHtml = step.options.map(option => `
                    <label class="block mb-2">
                        <input type="checkbox" value="${option}" class="mr-2">${option}
                    </label>
                `).join('');
                break;
            case 'radio':
                inputHtml = step.options.map(option => `
                    <label class="block mb-2">
                        <input type="radio" name="contact" value="${option}" class="mr-2">${option}
                    </label>
                `).join('');
                break;
            default:
                inputHtml = `<input type="${step.type}" class="w-full p-2 border rounded">`;
        }

        chatInput.innerHTML = `
            <div class="space-y-2">
                ${inputHtml}
                <button class="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2">Enviar</button>
            </div>
        `;

        // Añadir event listener al botón
        const button = chatInput.querySelector('button');
        button.addEventListener('click', () => {
            let value = '';
            let isValid = true;
            let errorMessage = '';
            
            switch (step.type) {
                case 'checkbox':
                    const checked = chatInput.querySelectorAll('input[type="checkbox"]:checked');
                    value = Array.from(checked).map(input => input.value);
                    if (value.length === 0) {
                        isValid = false;
                        errorMessage = '🔍 Por favor, selecciona los servicios que quieres optimizar';
                    }
                    break;
                case 'radio':
                    const selected = chatInput.querySelector('input[type="radio"]:checked');
                    value = selected ? selected.value : '';
                    if (!value) {
                        isValid = false;
                        errorMessage = '📞 Por favor, indícanos cómo prefieres que te contactemos';
                    }
                    break;
                default:
                    value = chatInput.querySelector('input').value.trim();
                    if (!value) {
                        isValid = false;
                        errorMessage = step.type === 'text' ? '👋 Por favor, dinos tu nombre' :
                                    step.type === 'email' ? '📧 Necesitamos tu email para contactarte' :
                                    '📱 Necesitamos tu teléfono para contactarte';
                    } else if (step.type === 'text' && !this.validateName(value)) {
                        isValid = false;
                        errorMessage = '👋 Por favor, introduce un nombre válido (solo letras)';
                    } else if (step.type === 'email' && !this.validateEmail(value)) {
                        isValid = false;
                        errorMessage = '📧 Por favor, introduce un email válido (ejemplo@dominio.com)';
                    } else if (step.type === 'tel' && !this.validatePhone(value)) {
                        isValid = false;
                        errorMessage = '📱 Introduce un teléfono móvil válido español (9 dígitos)';
                    }
            }
            
            if (!isValid) {
                const errorDiv = chatInput.querySelector('.error-message') || document.createElement('div');
                errorDiv.className = 'error-message bg-red-50 text-red-600 p-2 rounded-lg mt-2 flex items-center';
                errorDiv.innerHTML = `
                    <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    ${errorMessage}
                `;
                if (!chatInput.querySelector('.error-message')) {
                    chatInput.querySelector('.space-y-2').appendChild(errorDiv);
                }
                // Añadir clase de error al input
                const input = chatInput.querySelector('input');
                if (input) {
                    input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
                }
                return;
            }
            
            // Limpiar error si existe
            const errorDiv = chatInput.querySelector('.error-message');
            if (errorDiv) errorDiv.remove();

            this.responses[step.field] = value;
            
            // Mostrar la respuesta del usuario
            chatMessages.insertAdjacentHTML('beforeend', `
                <div class="mb-4 text-right">
                    <div class="bg-blue-600 text-white p-3 rounded-lg inline-block">
                        ${Array.isArray(value) ? value.join(', ') : value}
                    </div>
                </div>
            `);
            
            this.currentStep++;
            this.showNextQuestion();
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async finishChat() {
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');

        chatInput.innerHTML = '';
        chatMessages.insertAdjacentHTML('beforeend', `
            <div class="mb-4">
                <div class="bg-green-100 p-3 rounded-lg inline-block">
                    ¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.
                </div>
            </div>
        `);

        // Enviar email
        await this.sendResponses();

        // Cerrar chat después de 3 segundos
        setTimeout(() => {
            document.getElementById('chatbot').classList.add('translate-y-full');
        }, 3000);
    }

    init() {
        this.createChatInterface();
        
        // Event Listeners
        document.getElementById('openChat').addEventListener('click', () => {
            document.getElementById('chatbot').classList.remove('translate-y-full');
            if (this.currentStep === 0) this.showNextQuestion();
        });

        document.getElementById('closeChat').addEventListener('click', () => {
            document.getElementById('chatbot').classList.add('translate-y-full');
        });
    }
} 