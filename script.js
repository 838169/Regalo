'use strict';

document.addEventListener('DOMContentLoaded', () => {

    class App {
        constructor() {
            this.fireflySystem = new FireflySystem('firefly-canvas');
            this.scrollAnimator = new ScrollAnimator();
            this.interactionManager = new InteractionManager();
        }

        run() {
            this.fireflySystem.init();
            this.scrollAnimator.init();
            this.interactionManager.init();
            this.animationLoop();
        }

        animationLoop() {
            this.fireflySystem.render();
            requestAnimationFrame(() => this.animationLoop());
        }
    }

    const myApp = new App();
    myApp.run();
});

class FireflySystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Error fatal: No se encontró el elemento canvas.");
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.fireflies = [];
        this.config = {
            maxFireflies: 100,
            mouseRadius: 80
        };
        this.mouse = { x: null, y: null };
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        window.addEventListener('touchstart', e => {
            this.mouse.x = e.touches[0].clientX;
            this.mouse.y = e.touches[0].clientY;
        }, { passive: true });
        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        for (let i = 0; i < this.config.maxFireflies; i++) {
            this.fireflies.push(new Firefly(this.canvas.width, this.canvas.height));
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fireflies.forEach(firefly => {
            firefly.update(this.canvas.width, this.canvas.height, this.mouse, this.config.mouseRadius);
            firefly.draw(this.ctx);
        });
    }
}

class Firefly {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 1.8 + 1.2;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.flicker = Math.random() * 0.03 + 0.01;
        this.flickerDirection = 1;
        this.pushForce = 5;
        this.friction = 0.95;
    }

    update(canvasWidth, canvasHeight, mouse, mouseRadius) {
        if (mouse.x !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouseRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouseRadius - distance) / mouseRadius;
                this.speedX += forceDirectionX * force * this.pushForce;
                this.speedY += forceDirectionY * force * this.pushForce;
            }
        }

        this.speedX *= this.friction;
        this.speedY *= this.friction;

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvasWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.speedY *= -1;

        this.opacity += this.flicker * this.flickerDirection;
        if (this.opacity <= 0.1 || this.opacity >= 0.9) {
            this.flickerDirection *= -1;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, `rgba(240, 230, 140, ${this.opacity})`);
        gradient.addColorStop(0.8, `rgba(240, 230, 140, ${this.opacity * 0.2})`);
        gradient.addColorStop(1, 'rgba(240, 230, 140, 0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ScrollAnimator {
    constructor() {
        this.elementsToAnimate = document.querySelectorAll('.content-panel, .timeline-section, .reasons-section, .scroll-section');
    }

    init() {
        const observerOptions = {
            root: document.getElementById('phone-container'),
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.elementsToAnimate.forEach(el => observer.observe(el));
    }
}

class InteractionManager {
    constructor() {
        this.reasonCards = document.querySelectorAll('.reason-card');
        this.scrollTrigger = document.getElementById('scroll-trigger');
        this.triggerInstruction = document.getElementById('trigger-instruction');
        this.scrollContainer = document.getElementById('magic-scroll-container');
        this.isLetterOpen = false;

        // **AQUÍ ESTÁ LA CORRECCIÓN CLAVE**
        // El texto de la carta se almacena aquí, no en el HTML.
        this.letterContent = [
            { id: 'letter-line-1', text: 'Mi amor,' },
            { id: 'letter-line-2', text: 'Felices 21 meses, estoy tan feliz, satisfecho al tenerte a tí, definitivamente yo quiero hacer las cosas bien y ser parte de tú mundo' },
            { id: 'letter-line-3', text: 'Amo cada milimetro de tí, amo cada pensamiento de tí, te amo tal cual eres. Tú no necesitas tener un maquillaje en tú rostro para verme, porque siempre te verás hermosa. Te amo mucho mucho mi vida.' },
            { id: 'letter-line-4', text: 'Con amor,\nSantiago' } // \n será reemplazado por <br>
        ];
    }

    init() {
        this.reasonCards.forEach(card => {
            card.addEventListener('click', () => card.classList.toggle('is-flipped'));
        });

        if (this.scrollTrigger) {
            this.scrollTrigger.addEventListener('click', () => {
                if (!this.isLetterOpen) {
                    this.openLetter();
                }
            });
        }
    }

    openLetter() {
        this.isLetterOpen = true;
        this.scrollContainer.classList.add('is-open');
        
        this.scrollTrigger.style.opacity = '0';
        this.scrollTrigger.style.transform = 'scale(0)';
        this.triggerInstruction.style.opacity = '0';
        this.scrollTrigger.style.pointerEvents = 'none';

        setTimeout(() => {
            this.typewriterEffect(this.letterContent);
        }, 1000); // Espera 1 segundo para que la animación de deslizamiento termine.
    }
    
    async typewriterEffect(content) {
        for (const line of content) {
            const element = document.getElementById(line.id);
            if (element) {
                const text = line.text.replace(/\n/g, '<br>'); // Reemplaza \n con <br>
                await this.typeSingleElement(element, text);
            }
        }
    }
    
    typeSingleElement(element, text) {
        return new Promise(resolve => {
            let i = 0;
            const speed = 40; // Velocidad de escritura
            
            element.innerHTML = '<span class="cursor"></span>';
            const cursor = element.querySelector('.cursor');

            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    // Si encontramos un <br>, lo insertamos de una vez
                    if (text.substring(i, i + 4) === '<br>') {
                        cursor.insertAdjacentHTML('beforebegin', '<br>');
                        i += 4;
                    } else {
                        cursor.insertAdjacentText('beforebegin', text.charAt(i));
                        i++;
                    }
                } else {
                    clearInterval(typingInterval);
                    setTimeout(() => {
                        if (cursor) cursor.remove();
                        resolve();
                    }, 500);
                }
            }, speed);
        });
    }
}