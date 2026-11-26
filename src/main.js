import Chart from 'chart.js/auto';
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/css/regular.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import './site.css';

'use strict';

/**
 * SystemOS - Quantum Matrix Kernel
 * Padrões: Singleton, Module Pattern, RequestAnimationFrame optimizações
 */
const SystemOS = (function() {

    // Constantes e Estado
    const DB_KEY = 'ciclotech_os_v10';
    const state = {
        step: 1, 
        ledger: [], 
        hash: '', 
        isDecoding: false, 
        chartsReady: false
    };

    // --- 1. ENGINE: CANVAS PARTICLE NETWORK ---
    const NetworkEngine = {
        init: () => {
            const cvs = document.getElementById('network-canvas');
            const ctx = cvs.getContext('2d');
            let w, h, particles = [];

            // Suporte a monitores Retina/Alta Densidade
            const dpr = window.devicePixelRatio || 1;

            const resize = () => { 
                w = window.innerWidth; 
                h = window.innerHeight; 
                cvs.width = w * dpr;
                cvs.height = h * dpr;
                ctx.scale(dpr, dpr);
                cvs.style.width = `${w}px`;
                cvs.style.height = `${h}px`;
            };

            window.addEventListener('resize', resize); 
            resize();

            class Particle {
                constructor() { 
                    this.x = Math.random() * w; 
                    this.y = Math.random() * h; 
                    this.vx = (Math.random() - 0.5) * 0.5; 
                    this.vy = (Math.random() - 0.5) * 0.5; 
                    this.r = Math.random() * 1.5 + 0.5; 
                }

                update() { 
                    this.x += this.vx; 
                    this.y += this.vy; 
                    if (this.x < 0 || this.x > w) this.vx *= -1; 
                    if (this.y < 0 || this.y > h) this.vy *= -1; 
                }

                draw() { 
                    ctx.beginPath(); 
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); 
                    ctx.fillStyle = 'rgba(0, 255, 163, 0.5)'; 
                    ctx.fill(); 
                }
            }

            // Gerar as partículas
            for (let i = 0; i < 70; i++) particles.push(new Particle());

            let mouse = { x: null, y: null };
            document.addEventListener('mousemove', e => { 
                mouse.x = e.clientX; 
                mouse.y = e.clientY; 
            });

            const animate = () => {
                ctx.clearRect(0, 0, w, h);

                for (let i = 0; i < particles.length; i++) {
                    particles[i].update(); 
                    particles[i].draw();

                    // Linhas entre partículas
                    for (let j = i; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x; 
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 120) { 
                            ctx.beginPath(); 
                            ctx.strokeStyle = `rgba(0, 255, 163, ${0.15 - dist/800})`; 
                            ctx.lineWidth = 0.5; 
                            ctx.moveTo(particles[i].x, particles[i].y); 
                            ctx.lineTo(particles[j].x, particles[j].y); 
                            ctx.stroke(); 
                        }
                    }

                    // Interação com o Mouse
                    if (mouse.x != null) {
                        const dx = particles[i].x - mouse.x; 
                        const dy = particles[i].y - mouse.y; 
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 150) { 
                            ctx.beginPath(); 
                            ctx.strokeStyle = `rgba(0, 229, 255, ${0.2 - dist/750})`; 
                            ctx.lineWidth = 1; 
                            ctx.moveTo(particles[i].x, particles[i].y); 
                            ctx.lineTo(mouse.x, mouse.y); 
                            ctx.stroke(); 
                        }
                    }
                }
                requestAnimationFrame(animate);
            };

            animate();
        }
    };

    // --- 2. ENGINE: UI & MAGNETIC CURSOR ---
    const UIEngine = {
        boot: () => {
            const boot = document.getElementById('quantum-boot');
            const counter = document.getElementById('boot-counter');
            const log = document.getElementById('boot-log');
            let c = 0;
            const logs = [
                'Montando Volumes AES-256...', 
                'Conectando malha P2P...', 
                'Sincronizando Nodes Geográficos...', 
                'Bypass Firewalls ODS...', 
                'Kernel SystemOS Pronto.'
            ];

            const ival = setInterval(() => {
                c += Math.floor(Math.random() * 15); 
                if(c > 100) c = 100;
                counter.innerText = c;

                if(c % 25 === 0 && c < 100) {
                    log.innerText = logs[Math.floor(c/25)];
                }

                if(c === 100) {
                    clearInterval(ival); 
                    log.innerText = logs[4];
                    setTimeout(() => { 
                        boot.style.opacity = '0'; 
                        setTimeout(() => boot.style.display = 'none', 600); 
                    }, 500);
                }
            }, 100);
        },

        cursor: () => {
            // Prevenir bugs em telas touch (mobile)
            const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
            if (isTouchDevice) return;

            const dot = document.getElementById('cursor-dot'); 
            const ring = document.getElementById('cursor-ring');

            // Exibir os elementos caso passem no teste
            dot.style.opacity = '1';
            ring.style.opacity = '1';
            document.body.classList.add('custom-cursor-active');

            let isMoving = false;

            document.addEventListener('mousemove', e => { 
                if (!isMoving) {
                    requestAnimationFrame(() => { 
                        dot.style.left = `${e.clientX}px`; 
                        dot.style.top = `${e.clientY}px`; 
                        ring.style.left = `${e.clientX}px`; 
                        ring.style.top = `${e.clientY}px`; 
                        isMoving = false;
                    });
                    isMoving = true;
                }
            });

            document.querySelectorAll('.interactive, button, a, label, input, textarea').forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('magnetic-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('magnetic-hover'));
            });
        },

        parallax3D: () => {
            const scene = document.getElementById('3d-scene'); 
            const card = document.getElementById('3d-card'); 
            const glare = document.getElementById('3d-glare');

            if(!scene || !card) return;

            let isProcessing = false;

            scene.addEventListener('mousemove', e => {
                if (isProcessing) return;

                requestAnimationFrame(() => {
                    const r = scene.getBoundingClientRect(); 
                    const x = e.clientX - r.left; 
                    const y = e.clientY - r.top;

                    const rotateX = ((y - r.height/2) / (r.height/2)) * -12;
                    const rotateY = ((x - r.width/2) / (r.width/2)) * 12;

                    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    glare.style.opacity = '1'; 
                    glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 50%)`;

                    isProcessing = false;
                });
                isProcessing = true;
            });

            scene.addEventListener('mouseleave', () => { 
                card.style.transform = 'rotateX(0) rotateY(0)'; 
                glare.style.opacity = '0'; 
            });
        },

        scrollReveal: () => {
            const obs = new IntersectionObserver(entries => entries.forEach(en => { 
                if(en.isIntersecting) {
                    en.target.classList.add('active'); 
                    // Desconectar após aparecer a primeira vez (opcional)
                    // obs.unobserve(en.target);
                }
            }), { threshold: 0.1 });

            document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        },

        header: () => {
            const h = document.getElementById('nav-header');
            window.addEventListener('scroll', () => { 
                if(window.scrollY > 50) {
                    h.classList.add('bg-black/70','backdrop-blur-xl','border-white/10','shadow-2xl'); 
                } else {
                    h.classList.remove('bg-black/70','backdrop-blur-xl','border-white/10','shadow-2xl'); 
                }
            });
        },

        terminal: () => {
            const logs = [
                "Kernel 10.0.1...", 
                "AES-256 volumes: OK", 
                "P2P Mesh: 12 nodes [SYNCED]", 
                "Awaiting DoD 5220.22-M manifest..."
            ];
            const cont = document.getElementById('terminal-logs');
            let i = 0;

            const type = () => {
                if(i >= logs.length) return;
                const div = document.createElement('div'); 
                div.className = 'opacity-0 transform translate-y-2 transition-all duration-300';
                div.innerHTML = `<span class="text-zinc-600">></span> <span class="text-white">${logs[i]}</span>`;
                cont.insertBefore(div, cont.firstChild);

                requestAnimationFrame(() => div.classList.remove('opacity-0', 'translate-y-2'));

                i++; 
                setTimeout(type, Math.random() * 500 + 400);
            };

            setTimeout(type, 2000);

            // Iniciar os contadores após um pequeno delay
            setTimeout(() => { 
                UIEngine.animateNum(document.getElementById('stat-wiped'), 14092); 
                UIEngine.animateNum(document.getElementById('stat-co2'), 842.5); 
            }, 3000);
        },

        animateNum: (el, tgt) => { 
            let c = 0; 
            const inc = tgt / 30; 

            const tmr = setInterval(() => {
                c += inc; 
                if (c >= tgt) {
                    clearInterval(tmr); 
                    el.innerText = tgt.toLocaleString('pt-BR');
                } else {
                    el.innerText = Math.floor(c).toLocaleString('pt-BR');
                }
            }, 40); 
        },

        toast: (msg, isErr = false) => {
            const bin = document.getElementById('toast-bin'); 
            const el = document.createElement('div');

            el.className = 'bg-black/90 backdrop-blur-xl border border-white/10 px-5 py-4 rounded-xl flex items-center gap-3 text-sm text-white font-medium shadow-2xl transform translate-x-full transition-transform duration-300';
            el.innerHTML = `${isErr ? '<i class="fa-solid fa-triangle-exclamation text-quantum-error"></i>' : '<i class="fa-solid fa-check text-quantum-neon"></i>'} <span>${msg}</span>`;

            bin.appendChild(el); 
            requestAnimationFrame(() => el.style.transform = 'translateX(0)');

            setTimeout(() => { 
                el.style.transform = 'translateX(120%)'; 
                setTimeout(() => el.remove(), 300); 
            }, 4000);
        },

        bruteForceText: (el, final, dur = 1500) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>'; 
            let start = Date.now();

            let iv = setInterval(() => {
                if (Date.now() - start >= dur) { 
                    clearInterval(iv); 
                    el.innerText = final; 
                } else {
                    el.innerText = final.split('').map(c => (c === ' ' || c === '-') ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
                }
            }, 40);
        }
    };

    // --- 3. STORAGE & DATA ---
    const DataStore = {
        init: () => {
            try {
                const d = localStorage.getItem(DB_KEY);
                if (!d) { 
                    state.ledger = [{ 
                        hash: 'CT-A1B2-C3D4', 
                        name: 'Corp Tech LTDA', 
                        cep: '01310-100', 
                        items: 'Computação', 
                        date: new Date().toLocaleDateString('pt-BR'), 
                        step: 1 
                    }]; 
                    localStorage.setItem(DB_KEY, JSON.stringify(state.ledger)); 
                } else {
                    state.ledger = JSON.parse(d);
                }
            } catch (e) {
                console.error('Falha ao acessar LocalStorage', e);
            }
        },
        save: (entry) => { 
            state.ledger.push(entry); 
            localStorage.setItem(DB_KEY, JSON.stringify(state.ledger)); 
        },
        find: (h) => state.ledger.find(e => e.hash === h)
    };

    // --- 4. WIZARD ---
    const WizardEngine = {
        render: () => {
            const c = document.getElementById('wizard-form'); 
            const b = document.getElementById('wizard-bar'); 
            let th = 0;

            b.style.width = `${((state.step - 1) / 2) * 100}%`;

            for (let i = 1; i <= 3; i++) {
                const ind = document.querySelector(`.step-indicator[data-step="${i}"]`); 
                const v = document.getElementById(`step-${i}`);

                if (i === state.step) { 
                    ind.className = "step-indicator w-12 h-12 rounded-full bg-quantum-neon text-black font-bold flex items-center justify-center border-4 border-black text-sm transition-all duration-500 shadow-[0_0_20px_rgba(0,255,163,0.4)] scale-110 z-10"; 
                    v.classList.add('active'); 
                    th = v.offsetHeight; 
                } else if (i < state.step) { 
                    ind.className = "step-indicator w-12 h-12 rounded-full bg-zinc-900 text-quantum-neon flex items-center justify-center border-4 border-black text-sm transition-all duration-500 z-10"; 
                    ind.innerHTML = '<i class="fa-solid fa-check"></i>'; 
                    v.classList.remove('active'); 
                } else { 
                    ind.className = "step-indicator w-12 h-12 rounded-full bg-zinc-900 text-zinc-600 font-bold flex items-center justify-center border-4 border-black text-sm transition-all duration-500 z-10"; 
                    ind.innerHTML = i; 
                    v.classList.remove('active'); 
                }
            }

            // Atualiza a altura do contêiner fluidamente
            c.style.height = `${th}px`;
        },

        validate: (stepNumber) => {
            let isValid = true;

            if (stepNumber === 1) { 
                const inputs = document.querySelectorAll('#step-1 input[required]');
                inputs.forEach(i => {
                    if (!i.value.trim()) {
                        isValid = false;
                        i.classList.add('input-error'); // Feedback visual vermelho
                    } else {
                        i.classList.remove('input-error');
                    }
                });
                if (!isValid) UIEngine.toast('Preencha os campos obrigatórios em vermelho.', true);
            }
            else if (stepNumber === 2) { 
                const checked = document.querySelectorAll('input[name="category"]:checked');
                if (checked.length === 0) { 
                    UIEngine.toast('Selecione pelo menos uma categoria de mídia.', true); 
                    isValid = false; 
                } 
            }
            return isValid;
        },

        next: () => { 
            if (WizardEngine.validate(state.step)) { 
                state.step++; 
                WizardEngine.render(); 
            } 
        },

        prev: () => { 
            state.step--; 
            WizardEngine.render(); 
        },

        submit: () => {
            const lgpdInput = document.querySelector('input[name="lgpd"]');
            const lgpdVisual = document.getElementById('lgpd-checkbox-visual');

            if (!lgpdInput.checked) { 
                UIEngine.toast('O aceite dos termos (LGPD) é obrigatório.', true); 
                lgpdVisual.classList.add('border-quantum-error');
                setTimeout(() => lgpdVisual.classList.remove('border-quantum-error'), 1000);
                return; 
            }

            const b = document.getElementById('btn-submit'); 
            b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Encrypting...';

            setTimeout(() => {
                const hashPart1 = Math.random().toString(16).slice(2, 6).toUpperCase();
                const hashPart2 = Math.random().toString(16).slice(2, 6).toUpperCase();
                const h = `CT-${hashPart1}-${hashPart2}`; 
                state.hash = h;

                const itemsSelected = Array.from(document.querySelectorAll('input[name="category"]:checked'))
                                         .map(e => e.value)
                                         .join(', ');

                DataStore.save({ 
                    hash: h, 
                    name: document.querySelector('input[name="name"]').value, 
                    cep: document.querySelector('input[name="cep"]').value, 
                    items: itemsSelected, 
                    date: new Date().toLocaleDateString('pt-BR'), 
                    step: 1 
                });

                document.getElementById('hash-display').innerText = h;

                // Exibir Modal de Sucesso
                const modal = document.getElementById('modal-success');
                modal.classList.remove('hidden'); 

                // Espera o proximo frame para animar opacidade e escala
                requestAnimationFrame(() => {
                    modal.classList.remove('opacity-0', 'pointer-events-none');
                    modal.querySelector('.modal-content').classList.replace('scale-95', 'scale-100');
                });

                // Reseta o botao
                b.innerHTML = '<i class="fa-solid fa-lock"></i> Encriptar Manifesto';
            }, 800);
        },

        finish: (e) => { 
            // Evita disparar ao clicar dentro do conteúdo se foi passado o evento
            if(e && e.target !== e.currentTarget) return;

            const modal = document.getElementById('modal-success');
            modal.classList.add('opacity-0', 'pointer-events-none'); 
            modal.querySelector('.modal-content').classList.replace('scale-100', 'scale-95');

            setTimeout(() => {
                modal.classList.add('hidden');
                document.getElementById('wizard-form').reset(); 
                state.step = 1; 
                WizardEngine.render();

                // Auto-preencher o Tracker com o hash gerado
                document.getElementById('hash-input').value = state.hash; 
                document.getElementById('ledger').scrollIntoView({behavior: 'smooth'}); 

                setTimeout(TrackerEngine.search, 1000); 
            }, 500); 
        }
    };

    // --- 5. TRACKER ---
    const TrackerEngine = {
        search: () => {
            if (state.isDecoding) return; 

            const inp = document.getElementById('hash-input').value.trim().toUpperCase(); 
            if (!inp) return;

            state.isDecoding = true; 
            const b = document.getElementById('btn-search'); 
            b.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

            document.getElementById('state-empty').classList.add('hidden'); 
            document.getElementById('state-result').classList.add('hidden'); 
            document.getElementById('state-result').classList.remove('opacity-100', 'pointer-events-auto');

            const ld = document.getElementById('state-loading'); 
            ld.classList.remove('pointer-events-none'); 
            ld.style.opacity = '1';

            UIEngine.bruteForceText(document.getElementById('loading-hash'), `DECRYPTING ${inp}...`, 2000);

            // Hex Dump Matrix Effect
            const hd = document.getElementById('hex-dump'); 
            hd.innerHTML = '<div class="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10"></div>';
            let lc = 0; 

            const iv = setInterval(() => {
                if (lc > 15 || !state.isDecoding) {
                    clearInterval(iv);
                    return;
                }
                let line = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase() + ' ';
                for (let i = 0; i < 8; i++) {
                    line += Math.floor(Math.random() * 0xFF).toString(16).padStart(2, '0').toUpperCase() + ' ';
                }

                const div = document.createElement('div'); 
                div.innerText = line; 
                hd.insertBefore(div, hd.firstChild); 
                lc++;
            }, 80);

            // Mock tempo de processamento
            setTimeout(() => {
                ld.style.opacity = '0'; 
                ld.classList.add('pointer-events-none');

                const data = DataStore.find(inp);
                if (data) {
                    TrackerEngine.pop(data); 
                    const res = document.getElementById('state-result');

                    res.classList.remove('hidden'); 
                    void res.offsetWidth; // trigger reflow
                    res.classList.add('opacity-100', 'pointer-events-auto');

                    setTimeout(() => {
                        document.getElementById('res-progress').style.width = `${((data.step - 1) / 3) * 100}%`;
                    }, 300);
                } else { 
                    document.getElementById('state-empty').classList.remove('hidden'); 
                    UIEngine.toast('Bloco (Hash) não localizado no Ledger.', true); 
                }

                state.isDecoding = false; 
                b.innerHTML = 'Decrypt';
            }, 2200);
        },

        pop: (d) => {
            document.getElementById('res-hash').innerText = d.hash;

            const fields = [
                { id: 'res-name', v: d.name },
                { id: 'res-cep', v: d.cep },
                { id: 'res-items', v: d.items }
            ];

            fields.forEach(t => UIEngine.bruteForceText(document.getElementById(t.id), t.v, 1000));

            document.getElementById('res-progress').style.width = '0%';

            document.querySelectorAll('.t-node').forEach(n => {
                const s = parseInt(n.getAttribute('data-step')); 
                const ic = n.querySelector('.t-icon'); 
                const tt = n.querySelector('.t-title'); 
                const dt = n.querySelector('.t-date');

                if (s <= d.step) { 
                    ic.className = "t-icon w-16 h-16 rounded-full bg-quantum-neon border-4 border-black flex items-center justify-center text-black mx-auto md:mb-5 transition-all duration-700 relative z-10 shadow-[0_0_20px_rgba(0,255,163,0.5)] group-hover:scale-110"; 
                    tt.className = "t-title text-sm font-bold text-white transition-colors"; 
                    dt.innerText = (s === 1) ? d.date : "OK"; 
                    dt.classList.replace('text-zinc-700', 'text-quantum-cyan'); 
                } else { 
                    ic.className = "t-icon w-16 h-16 rounded-full bg-zinc-900 border-4 border-black flex items-center justify-center text-zinc-600 mx-auto md:mb-5 transition-all duration-700 relative z-10 shadow-inner group-hover:scale-110"; 
                    tt.className = "t-title text-sm font-bold text-zinc-600 transition-colors"; 
                    dt.innerText = "Pendente"; 
                    dt.classList.replace('text-quantum-cyan', 'text-zinc-700'); 
                }
            });
        }
    };

    // --- 6. TELEMETRY & CHARTS ---
    const TelemetryEngine = {
        open: () => {
            const m = document.getElementById('modal-telemetry'); 
            m.classList.remove('hidden'); 
            void m.offsetWidth; // trigger reflow

            m.classList.remove('opacity-0', 'pointer-events-none'); 
            m.querySelector('.modal-content').classList.replace('scale-95', 'scale-100'); 
            document.body.style.overflow = 'hidden';

            if (!state.chartsReady) {
                Chart.defaults.color = '#71717a'; 
                Chart.defaults.font.family = "'Inter', sans-serif";

                // Line Chart
                const cl = document.getElementById('chart-line').getContext('2d');
                let g = cl.createLinearGradient(0, 0, 0, 400); 
                g.addColorStop(0, 'rgba(0, 255, 163, 0.3)'); 
                g.addColorStop(1, 'rgba(0, 255, 163, 0)');

                const lc = new Chart(cl, { 
                    type: 'line', 
                    data: {
                        labels: ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'], 
                        datasets: [{
                            data: [320, 450, 410, 680, 850, 750], 
                            borderColor: '#00ffa3', 
                            backgroundColor: g, 
                            borderWidth: 2, 
                            fill: true, 
                            tension: 0.4, 
                            pointBackgroundColor: '#000', 
                            pointBorderColor: '#00ffa3'
                        }]
                    }, 
                    options: {
                        responsive: true, 
                        maintainAspectRatio: false, 
                        plugins: { legend: { display: false } }, 
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.02)' }, border: { display: false } }, 
                            x: { grid: { display: false }, border: { display: false } }
                        }
                    } 
                });

                // Simulacao ao vivo no grafico
                setInterval(() => {
                    const d = lc.data.datasets[0].data; 
                    d[d.length - 1] += (Math.random() * 20 - 10); 
                    lc.update('none');
                }, 2000); 

                // Doughnut Chart
                const cd = document.getElementById('chart-doughnut').getContext('2d');
                new Chart(cd, { 
                    type: 'doughnut', 
                    data: {
                        labels: ['Computação', 'Mobile', 'Rede'], 
                        datasets: [{
                            data: [55, 25, 20], 
                            backgroundColor: ['#00ffa3', '#00e5ff', '#03120b'], 
                            borderColor: '#000', 
                            borderWidth: 2
                        }]
                    }, 
                    options: {
                        responsive: true, 
                        maintainAspectRatio: false, 
                        cutout: '75%', 
                        plugins: {
                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                        }
                    } 
                });

                state.chartsReady = true;
            }
        },
        close: (e) => { 
            if(e && e.target !== e.currentTarget) return;

            const m = document.getElementById('modal-telemetry'); 
            m.classList.add('opacity-0', 'pointer-events-none'); 
            m.querySelector('.modal-content').classList.replace('scale-100', 'scale-95'); 

            setTimeout(() => {
                m.classList.add('hidden'); 
                document.body.style.overflow = '';
            }, 500); 
        }
    };

    // API Pública Exposta
    return {
        init: () => { 
            UIEngine.boot(); 
            NetworkEngine.init(); 
            UIEngine.cursor(); 
            UIEngine.parallax3D(); 
            UIEngine.scrollReveal(); 
            UIEngine.header(); 
            UIEngine.terminal(); 
            DataStore.init(); 

            // Delay renderização do wizard pra evitar bugs de layout iniciais
            setTimeout(WizardEngine.render, 100); 
        },
        UI: { 
            copyHash: () => { 
                navigator.clipboard.writeText(document.getElementById('hash-display').innerText); 
                UIEngine.toast('Hash copiado para a área de transferência.'); 
            } 
        },
        Wizard: { 
            next: WizardEngine.next, 
            prev: WizardEngine.prev, 
            submit: WizardEngine.submit, 
            finish: WizardEngine.finish 
        },
        Tracker: { 
            search: TrackerEngine.search 
        },
        Telemetry: { 
            open: TelemetryEngine.open, 
            close: TelemetryEngine.close 
        }
    };
})();

document.addEventListener('DOMContentLoaded', SystemOS.init);

const actions = {
  'telemetry-open': SystemOS.Telemetry.open,
  'go-manifesto': () => document.getElementById('manifesto').scrollIntoView(),
  'go-ledger': () => document.getElementById('ledger').scrollIntoView(),
  'wizard-next': SystemOS.Wizard.next,
  'wizard-prev': SystemOS.Wizard.prev,
  'wizard-submit': SystemOS.Wizard.submit,
  'tracker-search': SystemOS.Tracker.search,
  'success-backdrop': SystemOS.Wizard.finish,
  'dialog-content': event => event.stopPropagation(),
  'copy-reference': SystemOS.UI.copyHash,
  'success-close': () => SystemOS.Wizard.finish(),
  'telemetry-backdrop': SystemOS.Telemetry.close,
  'telemetry-close': () => SystemOS.Telemetry.close(),
};
for (const element of document.querySelectorAll('[data-action]')) {
  element.addEventListener('click', actions[element.getAttribute('data-action')]);
}
