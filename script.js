// ==================== VARIABLES GLOBALES ====================
let favoritos = JSON.parse(localStorage.getItem('colorFavoritos')) || [];
let modoOscuro = localStorage.getItem('modoOscuro') === 'true';
let modoFondoActual = localStorage.getItem('modoFondo') || 'rendimiento';
let fondoActual = null;

// ==================== MODO OSCURO ====================
function toggleModo() {
    modoOscuro = !modoOscuro;
    localStorage.setItem('modoOscuro', modoOscuro);
    aplicarModo();
    actualizarTextoBotonModo();
}

function aplicarModo() {
    if (modoOscuro) {
        document.body.classList.add('modo-oscuro');
    } else {
        document.body.classList.remove('modo-oscuro');
    }
}

function actualizarTextoBotonModo() {
    const botonModo = document.querySelector('.modo-btn');
    if (modoOscuro) {
        botonModo.innerHTML = '☀️ Modo Claro';
    } else {
        botonModo.innerHTML = '🌙 Modo Oscuro';
    }
}

// ==================== GENERADOR ALEATORIO ====================
function generarColorHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

async function generarPaleta() {
    const paleta = document.getElementById('paleta');
    const mensaje = document.getElementById('mensaje');
    
    mensaje.classList.remove('show');
    paleta.style.opacity = '0';
    paleta.style.transform = 'translateY(20px)';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    paleta.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const colorHex = generarColorHex();
        crearElementoColor(colorHex, paleta);
    }
    
    const contenedores = paleta.querySelectorAll('.color-container');
    contenedores.forEach((contenedor, index) => {
        setTimeout(() => {
            contenedor.style.transition = 'all 0.5s ease';
            contenedor.style.opacity = '1';
            contenedor.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    paleta.style.opacity = '1';
    paleta.style.transform = 'translateY(0)';
    paleta.style.transition = 'all 0.3s ease';
    
    // Notificar al fondo
    const colores = Array.from(document.querySelectorAll('.color-info')).map(c => c.textContent);
    if (fondoActual && fondoActual.reaccionarGenerarPaleta) {
        fondoActual.reaccionarGenerarPaleta(colores);
    }
}

function crearElementoColor(colorHex, contenedor) {
    const esFavorito = favoritos.some(fav => fav.codigo === colorHex);
    
    const colorDiv = document.createElement('div');
    colorDiv.className = 'color-box';
    colorDiv.style.backgroundColor = colorHex;
    colorDiv.onclick = () => copiarColor(colorHex);
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'color-info';
    infoDiv.textContent = colorHex;
    
    const likeBtn = document.createElement('button');
    likeBtn.className = `btn-like ${esFavorito ? 'likeado' : ''}`;
    likeBtn.innerHTML = esFavorito ? '❤️' : '🤍';
    likeBtn.onclick = (e) => {
        e.stopPropagation();
        toggleFavorito(colorHex, likeBtn);
    };
    likeBtn.setAttribute('data-color', colorHex);
    
    const contenedorColor = document.createElement('div');
    contenedorColor.className = 'color-container';
    contenedorColor.style.opacity = '0';
    contenedorColor.style.transform = 'translateY(30px)';
    contenedorColor.appendChild(colorDiv);
    contenedorColor.appendChild(infoDiv);
    contenedorColor.appendChild(likeBtn);
    
    contenedor.appendChild(contenedorColor);
}

// ==================== FAVORITOS ====================
function toggleFavorito(colorHex, likeBtn = null) {
    const index = favoritos.findIndex(fav => fav.codigo === colorHex);
    
    if (index === -1) {
        favoritos.push({
            codigo: colorHex,
            fecha: new Date().toLocaleString()
        });
        if (likeBtn) {
            likeBtn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                likeBtn.classList.add('likeado');
                likeBtn.innerHTML = '❤️';
                likeBtn.style.transform = 'scale(1.1)';
            }, 150);
        }
        mostrarMensaje(`❤️ Agregado a favoritos: ${colorHex}`);
    } else {
        favoritos.splice(index, 1);
        if (likeBtn) {
            likeBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                likeBtn.classList.remove('likeado');
                likeBtn.innerHTML = '🤍';
                likeBtn.style.transform = 'scale(1)';
            }, 150);
        }
        mostrarMensaje(`💔 Eliminado de favoritos: ${colorHex}`);
    }
    
    localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
    actualizarTodosLosBotonesLike();
    actualizarListaFavoritos();
}

function actualizarTodosLosBotonesLike() {
    const likeButtonsPrincipal = document.querySelectorAll('#paginaPrincipal .btn-like');
    likeButtonsPrincipal.forEach(btn => {
        const colorHex = btn.getAttribute('data-color');
        const esFavorito = favoritos.some(fav => fav.codigo === colorHex);
        btn.className = `btn-like ${esFavorito ? 'likeado' : ''}`;
        btn.innerHTML = esFavorito ? '❤️' : '🤍';
    });
    
    const likeButtonsPersonalizado = document.querySelectorAll('#paginaPersonalizada .btn-color-accion');
    likeButtonsPersonalizado.forEach(btn => {
        const colorHex = btn.getAttribute('data-color');
        if (colorHex) {
            const esFavorito = favoritos.some(fav => fav.codigo === colorHex);
            btn.className = `btn-color-accion ${esFavorito ? 'likeado' : ''}`;
            btn.innerHTML = esFavorito ? '❤️' : '🤍';
        }
    });
}

function actualizarListaFavoritos() {
    const listaFavoritos = document.getElementById('listaFavoritos');
    listaFavoritos.innerHTML = '';
    
    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7); padding: 20px;">No hay favoritos aún</p>';
        return;
    }
    
    favoritos.forEach((favorito, index) => {
        const favoritoDiv = document.createElement('div');
        favoritoDiv.className = 'color-favorito';
        favoritoDiv.style.opacity = '0';
        favoritoDiv.style.transform = 'translateX(-30px)';
        
        favoritoDiv.innerHTML = `
            <div class="mini-color" style="background-color: ${favorito.codigo}" onclick="copiarColor('${favorito.codigo}')"></div>
            <div class="info-favorito">
                <div class="codigo-favorito" onclick="copiarColor('${favorito.codigo}')">${favorito.codigo}</div>
                <div class="fecha-favorito">${favorito.fecha}</div>
            </div>
            <div class="acciones-favorito">
                <button class="btn-accion" onclick="copiarColor('${favorito.codigo}')" title="Copiar">📋</button>
                <button class="btn-accion" onclick="eliminarFavoritoDesdeLista('${favorito.codigo}')" title="Eliminar">🗑️</button>
            </div>
        `;
        
        listaFavoritos.appendChild(favoritoDiv);
        
        setTimeout(() => {
            favoritoDiv.style.transition = 'all 0.4s ease';
            favoritoDiv.style.opacity = '1';
            favoritoDiv.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

function eliminarFavoritoDesdeLista(colorHex) {
    const index = favoritos.findIndex(fav => fav.codigo === colorHex);
    if (index !== -1) {
        favoritos.splice(index, 1);
        localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
        actualizarTodosLosBotonesLike();
        actualizarListaFavoritos();
        mostrarMensaje(`💔 Eliminado de favoritos: ${colorHex}`);
    }
}

function limpiarFavoritos() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
        favoritos = [];
        localStorage.removeItem('colorFavoritos');
        actualizarTodosLosBotonesLike();
        actualizarListaFavoritos();
        mostrarMensaje('🗑️ Todos los favoritos eliminados');
    }
}

function toggleFavoritos() {
    const panel = document.getElementById('panelFavoritos');
    const overlay = document.getElementById('overlay');
    
    if (panel.classList.contains('abierto')) {
        panel.style.transform = 'translateX(-30px)';
        panel.style.opacity = '0';
        overlay.style.opacity = '0';
        setTimeout(() => {
            panel.classList.remove('abierto');
            overlay.classList.remove('mostrado');
            panel.style.transform = '';
            panel.style.opacity = '';
        }, 400);
    } else {
        panel.classList.add('abierto');
        overlay.classList.add('mostrado');
        setTimeout(() => {
            panel.style.transform = 'translateX(0)';
            panel.style.opacity = '1';
            overlay.style.opacity = '1';
        }, 10);
        actualizarListaFavoritos();
    }
}

function copiarColor(hexCode) {
    navigator.clipboard.writeText(hexCode).then(() => {
        mostrarMensaje(`¡Copiado! ${hexCode}`);
        if (fondoActual && fondoActual.reaccionarCopiarColor) {
            fondoActual.reaccionarCopiarColor(hexCode);
        }
    });
}

function mostrarMensaje(texto) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.classList.add('show');
    
    setTimeout(() => {
        mensaje.style.opacity = '0';
        mensaje.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            mensaje.classList.remove('show');
            mensaje.style.opacity = '';
            mensaje.style.transform = '';
        }, 300);
    }, 1700);
}

// ==================== NAVEGACIÓN ====================
function irAPersonalizado() {
    document.getElementById('paginaPrincipal').classList.remove('activa');
    document.getElementById('paginaPersonalizada').classList.add('activa');
    document.querySelector('.principal-btn').classList.remove('activo');
    document.querySelector('.personalizado-btn').classList.add('activo');
    document.title = "Generador Personalizado - Paletas de Colores";
}

function irAPrincipal() {
    document.getElementById('paginaPersonalizada').classList.remove('activa');
    document.getElementById('paginaPrincipal').classList.add('activa');
    document.querySelector('.personalizado-btn').classList.remove('activo');
    document.querySelector('.principal-btn').classList.add('activo');
    document.title = "Generador de Paletas de Colores";
    generarPaleta();
}

// ==================== GENERADOR PERSONALIZADO ====================
function configurarSelectoresColor() {
    const colorInputs = document.querySelectorAll('.input-color');
    const hexInputs = document.querySelectorAll('.input-hex');
    
    colorInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            hexInputs[index].value = this.value.toUpperCase();
        });
        
        hexInputs[index].addEventListener('click', function() {
            this.select();
            navigator.clipboard.writeText(this.value);
            mostrarMensaje(`¡Copiado! ${this.value}`);
        });
    });
}

function configurarSliders() {
    const saturacion = document.getElementById('saturacion');
    const luminosidad = document.getElementById('luminosidad');
    const saturacionValor = document.getElementById('saturacionValor');
    const luminosidadValor = document.getElementById('luminosidadValor');
    
    saturacion.addEventListener('input', () => saturacionValor.textContent = saturacion.value + '%');
    luminosidad.addEventListener('input', () => luminosidadValor.textContent = luminosidad.value + '%');
}

function generarPaletaPersonalizada() {
    const coloresBase = obtenerColoresBase();
    const etiquetas = obtenerEtiquetasSeleccionadas();
    const ajustes = obtenerAjustes();
    
    if (coloresBase.length < 2) {
        mostrarMensaje('❌ Selecciona al menos 2 colores base');
        return;
    }
    
    if (etiquetas.length === 0) {
        mostrarMensaje('❌ Selecciona al menos un estilo de paleta');
        return;
    }
    
    const paletas = generarPaletasSegunConfiguracion(coloresBase, etiquetas, ajustes);
    mostrarResultadosPersonalizados(paletas);
}

function obtenerColoresBase() {
    const colores = [];
    for (let i = 1; i <= 3; i++) {
        const hex = document.getElementById(`color${i}Hex`).value;
        if (hex && hex !== '#') colores.push(hex);
    }
    return colores;
}

function obtenerEtiquetasSeleccionadas() {
    const etiquetas = [];
    document.querySelectorAll('input[name="etiqueta"]:checked').forEach(cb => etiquetas.push(cb.value));
    return etiquetas;
}

function obtenerAjustes() {
    return {
        saturacion: parseInt(document.getElementById('saturacion').value),
        luminosidad: parseInt(document.getElementById('luminosidad').value)
    };
}

function generarPaletasSegunConfiguracion(coloresBase, etiquetas, ajustes) {
    const paletas = [];
    etiquetas.forEach(etiqueta => {
        switch(etiqueta) {
            case 'armoniosa': paletas.push(generarPaletaArmoniosa(coloresBase, ajustes)); break;
            case 'corporativa': paletas.push(generarPaletaCorporativa(coloresBase, ajustes)); break;
            case 'natural': paletas.push(generarPaletaNatural(coloresBase, ajustes)); break;
            case 'contraste': paletas.push(generarPaletaContraste(coloresBase, ajustes)); break;
            case 'pastel': paletas.push(generarPaletaPastel(coloresBase, ajustes)); break;
            case 'minima': paletas.push(generarPaletaMinima(coloresBase, ajustes)); break;
            case 'calida': paletas.push(generarPaletaCalida(coloresBase, ajustes)); break;
            case 'fria': paletas.push(generarPaletaFria(coloresBase, ajustes)); break;
        }
    });
    return paletas;
}

// ==================== ALGORITMOS DE COLOR ====================
function hexToHSL(hex) {
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l = (max+min)/2;
    if(max===min) h=s=0;
    else {
        let d = max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
            case r: h=(g-b)/d+(g<b?6:0); break;
            case g: h=(b-r)/d+2; break;
            case b: h=(r-g)/d+4; break;
        }
        h/=6;
    }
    return [h*360, s*100, l*100];
}

function HSLToHex(h,s,l) {
    h/=360; s/=100; l/=100;
    let r,g,b;
    if(s===0) r=g=b=l;
    else {
        const hue2rgb=(p,q,t)=>{
            if(t<0) t+=1;
            if(t>1) t-=1;
            if(t<1/6) return p+(q-p)*6*t;
            if(t<1/2) return q;
            if(t<2/3) return p+(q-p)*(2/3-t)*6;
            return p;
        };
        const q = l<0.5 ? l*(1+s) : l+s-l*s;
        const p = 2*l-q;
        r = hue2rgb(p,q,h+1/3);
        g = hue2rgb(p,q,h);
        b = hue2rgb(p,q,h-1/3);
    }
    const toHex=x=>{const hex=Math.round(x*255).toString(16); return hex.length===1?'0'+hex:hex;};
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function generarPaletaArmoniosa(coloresBase, ajustes) {
    const colores = [];
    coloresBase.forEach(color => {
        const [h,s,l] = hexToHSL(color);
        for(let i=-2;i<=2;i++) {
            if(i===0) continue;
            const hueVariation = Math.random()*60-30;
            const newH = (h+hueVariation+360)%360;
            const newS = Math.max(20, Math.min(80, s+(ajustes.saturacion-50)/2+(Math.random()*20-10)));
            const newL = Math.max(20, Math.min(80, l+(ajustes.luminosidad-50)/2+(Math.random()*20-10)));
            colores.push(HSLToHex(newH,newS,newL));
        }
    });
    const coloresUnicos = [...new Set(colores)];
    return { nombre:'🎭 Paleta Armoniosa', colores:coloresUnicos.slice(0,5) };
}

function generarPaletaCorporativa(coloresBase, ajustes) {
    const base = ['#2C3E50','#34495E','#7F8C8D','#95A5A6','#BDC3C7'];
    return { nombre:'🏢 Paleta Corporativa', colores:ajustarColores(mezclarArrays(base,coloresBase), ajustes) };
}

function generarPaletaNatural(coloresBase, ajustes) {
    const base = ['#27AE60','#2ECC71','#16A085','#F39C12','#8B4513'];
    return { nombre:'🌿 Paleta Natural', colores:ajustarColores(mezclarArrays(base,coloresBase), ajustes) };
}

function generarPaletaContraste(coloresBase, ajustes) {
    const base = ['#000000','#FFFFFF','#E74C3C','#2C3E50','#F1C40F'];
    return { nombre:'🔊 Paleta de Alto Contraste', colores:ajustarColores(mezclarArrays(base,coloresBase), ajustes) };
}

function generarPaletaPastel(coloresBase, ajustes) {
    const base = ['#FFB6C1','#87CEEB','#98FB98','#DDA0DD','#FFFACD'];
    return { nombre:'🥰 Paleta Pastel', colores:ajustarColores(mezclarArrays(base,coloresBase), ajustes) };
}

function generarPaletaMinima(coloresBase, ajustes) {
    const base = ['#FFFFFF','#F8F9FA','#E9ECEF','#DEE2E6','#6C757D'];
    return { nombre:'⚫ Paleta Mínima', colores:ajustarColores(mezclarArrays(base,coloresBase), ajustes) };
}

function generarPaletaCalida(coloresBase, ajustes) {
    const base = ['#FF6B6B','#FF8E53','#FFB142','#FFD166','#FFEAA7'];
    return { nombre:'🔥 Paleta Cálida', colores:ajustarColores(mezclarArrays(base,coloresBase), ajustes) };
}

function generarPaletaFria(coloresBase, ajustes) {
    const base = ['#74B9FF','#6C5CE7','#A29BFE','#81ECEC','#55E6C1'];
    return { nombre:'❄️ Paleta Fría', colores:ajustarColores(mezclarArrays(base,coloresBase), ajustes) };
}

function mezclarArrays(arr1, arr2) {
    const mezclado = [...arr1, ...arr2];
    return mezclado.sort(()=>Math.random()-0.5).slice(0,5);
}

function ajustarColores(colores, ajustes) {
    return colores.map(color => {
        const [h,s,l] = hexToHSL(color);
        const newS = Math.max(0, Math.min(100, s+(ajustes.saturacion-50)+(Math.random()*10-5)));
        const newL = Math.max(0, Math.min(100, l+(ajustes.luminosidad-50)+(Math.random()*10-5)));
        return HSLToHex(h,newS,newL);
    });
}

function mostrarResultadosPersonalizados(paletas) {
    const container = document.getElementById('paletasContainer');
    container.innerHTML = '';
    
    if(paletas.length===0) {
        container.innerHTML='<p class="mensaje-vacio">No se generaron paletas</p>';
        return;
    }
    
    if(paletas.length===1) container.style.gridTemplateColumns='1fr';
    else if(paletas.length===2) container.style.gridTemplateColumns='repeat(2,1fr)';
    else container.style.gridTemplateColumns='repeat(auto-fit, minmax(320px, 1fr))';
    
    paletas.forEach((paleta, idx) => {
        const paletaDiv = document.createElement('div');
        paletaDiv.className='paleta-personalizada';
        paletaDiv.style.opacity='0';
        paletaDiv.style.transform='translateY(20px)';
        
        let coloresHTML='', codigosHTML='';
        paleta.colores.forEach(color => {
            const esFavorito = favoritos.some(fav=>fav.codigo===color);
            coloresHTML += `
                <div class="color-contenedor-personalizado">
                    <div class="color-personalizado" style="background-color:${color}" onclick="copiarColor('${color}')"></div>
                    <div class="acciones-color">
                        <button class="btn-color-accion ${esFavorito?'likeado':''}" onclick="toggleFavoritoPersonalizado('${color}',this)" data-color="${color}">${esFavorito?'❤️':'🤍'}</button>
                    </div>
                </div>`;
            codigosHTML += `<span class="codigo-color" onclick="copiarColor('${color}')">${color}</span>`;
        });
        
        paletaDiv.innerHTML = `<h4>${paleta.nombre}</h4><div class="colores-paleta">${coloresHTML}</div><div class="codigos-paleta">${codigosHTML}</div>`;
        container.appendChild(paletaDiv);
        setTimeout(()=>{paletaDiv.style.transition='all 0.5s ease'; paletaDiv.style.opacity='1'; paletaDiv.style.transform='translateY(0)';}, idx*100);
    });
    
    const coloresGenerados = paletas.flatMap(p=>p.colores);
    if(fondoActual && fondoActual.reaccionarGenerarPaleta) fondoActual.reaccionarGenerarPaleta(coloresGenerados);
    mostrarMensaje(`✅ Generadas ${paletas.length} paletas personalizadas`);
}

function toggleFavoritoPersonalizado(colorHex, boton) {
    toggleFavorito(colorHex);
}

// ==================== PARTÍCULAS NEUTRAS ====================
function crearParticulas() {
    const container = document.createElement('div');
    container.className='particulas';
    document.body.insertBefore(container, document.body.firstChild);
    for(let i=0;i<30;i++){
        const p = document.createElement('div');
        p.className='particula';
        p.style.left=Math.random()*100+'vw';
        p.style.animationDelay=Math.random()*6+'s';
        p.style.animationDuration=(3+Math.random()*4)+'s';
        container.appendChild(p);
    }
}

// ==================== CLASES DE FONDOS ====================

class FondoBase {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.activo = true;
        this.frameId = null;
        this.ajustarTamaño();
        window.addEventListener('resize', () => this.ajustarTamaño());
    }
    
    ajustarTamaño() { 
        this.canvas.width = window.innerWidth; 
        this.canvas.height = window.innerHeight; 
    }
    
    reaccionarGenerarPaleta(colores) {}
    reaccionarCopiarColor(color) {}
    reaccionarMouse(x, y) {}
    
    detener() { 
        if (this.frameId) cancelAnimationFrame(this.frameId); 
        this.activo = false; 
    }
}

class FondoRendimiento extends FondoBase {
    constructor(canvas) {
        super(canvas);
        this.hue = 0;
        this.particulas = [];
        this.initParticulas();
        this.animar();
    }
    
    initParticulas() {
        for(let i = 0; i < 30; i++){
            this.particulas.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radio: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                opacidad: Math.random() * 0.3 + 0.2
            });
        }
    }
    
    ajustarTamaño() { 
        super.ajustarTamaño(); 
        this.initParticulas();
    }
    
    animar() {
        if(!this.activo) return;
        this.hue = (this.hue + 0.3) % 360;
        
        const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        grad.addColorStop(0, `hsl(${this.hue}, 70%, 15%)`);
        grad.addColorStop(0.5, `hsl(${this.hue + 40}, 70%, 20%)`);
        grad.addColorStop(1, `hsl(${this.hue + 80}, 70%, 10%)`);
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particulas.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacidad})`;
            this.ctx.fill();
            
            p.x += p.vx;
            p.y += p.vy;
            
            if(p.x < 0) p.x = this.canvas.width;
            if(p.x > this.canvas.width) p.x = 0;
            if(p.y < 0) p.y = this.canvas.height;
            if(p.y > this.canvas.height) p.y = 0;
        });
        
        this.frameId = requestAnimationFrame(() => this.animar());
    }
    
    reaccionarGenerarPaleta(colores) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        setTimeout(() => {}, 100);
    }
    
    reaccionarCopiarColor(color) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class FondoTintaElectrica extends FondoBase {
    constructor(canvas) {
        super(canvas);
        this.ondas = [];
        this.particulas = [];
        this.tiempo = 0;
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        this.initSistema();
        this.animar();
    }
    
    initSistema() {
        // Ondas líquidas
        for(let i = 0; i < 5; i++){
            this.ondas.push({
                amplitud: 30 + Math.random() * 40,
                frecuencia: 0.005 + Math.random() * 0.01,
                velocidad: 0.01 + Math.random() * 0.02,
                fase: Math.random() * Math.PI * 2,
                offsetY: (i / 5) * this.canvas.height,
                color: `hsl(${Math.random() * 60 + 200}, 80%, 60%)`
            });
        }
        
        // Partículas brillantes
        for(let i = 0; i < 100; i++){
            this.particulas.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                radio: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 60 + 200}, 100%, 70%)`,
                alpha: Math.random() * 0.6 + 0.2,
                trail: []
            });
        }
    }
    
    ajustarTamaño() { 
        super.ajustarTamaño(); 
        this.ondas.forEach((onda, i) => {
            onda.offsetY = (i / this.ondas.length) * this.canvas.height;
        });
    }
    
    animar() {
        if(!this.activo) return;
        this.tiempo += 0.02;
        
        // Fondo semitransparente para efecto estela
        this.ctx.fillStyle = 'rgba(10, 10, 30, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar ondas
        this.ondas.forEach(onda => {
            this.ctx.beginPath();
            for(let x = 0; x < this.canvas.width; x += 10){
                const y = onda.offsetY + 
                         Math.sin(x * onda.frecuencia + this.tiempo * onda.velocidad) * onda.amplitud +
                         Math.cos(x * 0.003 + this.tiempo * 0.005) * 15;
                if(x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.strokeStyle = onda.color;
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = onda.color;
            this.ctx.stroke();
        });
        
        // Dibujar partículas
        this.particulas.forEach(p => {
            // Dibujar estela
            for(let i = 0; i < p.trail.length; i++){
                const pos = p.trail[i];
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, p.radio * 0.7, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * (i / p.trail.length) * 0.5})`;
                this.ctx.fill();
            }
            
            // Dibujar partícula principal
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            
            // Guardar trail
            p.trail.unshift({x: p.x, y: p.y});
            if(p.trail.length > 5) p.trail.pop();
            
            // Mover partícula
            p.x += p.vx;
            p.y += p.vy;
            
            // Rebote suave en bordes
            if(p.x < 0){ p.x = 0; p.vx *= -0.9; }
            if(p.x > this.canvas.width){ p.x = this.canvas.width; p.vx *= -0.9; }
            if(p.y < 0){ p.y = 0; p.vy *= -0.9; }
            if(p.y > this.canvas.height){ p.y = this.canvas.height; p.vy *= -0.9; }
            
            // Atracción al mouse
            const dx = p.x - this.mouseX;
            const dy = p.y - this.mouseY;
            const dist = Math.hypot(dx, dy);
            if(dist < 150){
                const fuerza = (150 - dist) / 150 * 0.5;
                p.vx += dx * fuerza * 0.01;
                p.vy += dy * fuerza * 0.01;
            }
        });
        
        this.ctx.shadowBlur = 0;
        this.frameId = requestAnimationFrame(() => this.animar());
    }
    
    reaccionarGenerarPaleta(colores) {
        // Efecto de onda expansiva
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Cambiar colores según paleta
        if(colores && colores.length){
            this.particulas.forEach((p, i) => {
                p.color = colores[i % colores.length];
            });
            this.ondas.forEach((onda, i) => {
                onda.color = colores[i % colores.length];
            });
        }
        
        // Agitar partículas
        this.particulas.forEach(p => {
            p.vx += (Math.random() - 0.5) * 3;
            p.vy += (Math.random() - 0.5) * 3;
        });
        
        setTimeout(() => {
            this.particulas.forEach(p => {
                p.vx *= 0.9;
                p.vy *= 0.9;
            });
        }, 500);
    }
    
    reaccionarCopiarColor(color) {
        // Explosión local de color
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
        setTimeout(() => this.ctx.shadowBlur = 0, 200);
    }
    
    reaccionarMouse(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }
}

// ==================== CONTROLADOR DE FONDOS ====================

function cambiarModoFondo(modo) {
    if(fondoActual) fondoActual.detener();
    
    const canvas = document.getElementById('canvasFondo');
    if(!canvas) return;
    
    if(modo === 'rendimiento') {
        fondoActual = new FondoRendimiento(canvas);
    } else if(modo === 'tinta') {
        fondoActual = new FondoTintaElectrica(canvas);
    }
    
    localStorage.setItem('modoFondo', modo);
    
    document.querySelectorAll('.btn-fondo').forEach(btn => {
        if(btn.dataset.fondo === modo) {
            btn.classList.add('activo');
        } else {
            btn.classList.remove('activo');
        }
    });
}

function initSelectorFondos() {
    const botones = document.querySelectorAll('.btn-fondo');
    botones.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modo = btn.dataset.fondo;
            cambiarModoFondo(modo);
        });
    });
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    crearParticulas();
    aplicarModo();
    actualizarTextoBotonModo();
    generarPaleta();
    actualizarListaFavoritos();
    configurarSelectoresColor();
    configurarSliders();
    initSelectorFondos();
    cambiarModoFondo(modoFondoActual);
    
    // Evento de mouse para el fondo
    document.addEventListener('mousemove', (e) => {
        if(fondoActual && fondoActual.reaccionarMouse) {
            fondoActual.reaccionarMouse(e.clientX, e.clientY);
        }
    });
});
