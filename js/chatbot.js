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
            
            switch (step.type) {
                case 'checkbox':
                    const checked = chatInput.querySelectorAll('input[type="checkbox"]:checked');
                    value = Array.from(checked).map(input => input.value);
                    break;
                case 'radio':
                    const selected = chatInput.querySelector('input[type="radio"]:checked');
                    value = selected ? selected.value : '';
                    break;
                default:
                    value = chatInput.querySelector('input').value;
            }
            
            if (!value || (Array.isArray(value) && value.length === 0)) {
                alert('Por favor, completa este campo');
                return;
            }
            
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