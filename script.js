let favoritos = JSON.parse(localStorage.getItem('colorFavoritos')) || [];
let modoNavideno = localStorage.getItem('modoNavideno') === 'true';

// ==================== SISTEMA DE MODO CLARO/OSCURO ====================

function toggleModo() {
    modoNavideno = !modoNavideno;
    localStorage.setItem('modoNavideno', modoNavideno);
    aplicarModo();
    actualizarTextoBotonModo();
}

function aplicarModo() {
    if (modoNavideno) {
        document.body.classList.add('modo-navideno');
        crearParticulasNavidenas();
    } else {
        document.body.classList.remove('modo-navideno');
        eliminarParticulasNavidenas();
    }
}

function actualizarTextoBotonModo() {
    const botonModo = document.querySelector('.modo-btn');
    if (modoNavideno) {
        botonModo.innerHTML = '☀️ Modo Claro';
        botonModo.title = 'Cambiar a modo claro';
    } else {
        botonModo.innerHTML = '🌙 Modo Navideño';
        botonModo.title = 'Cambiar a modo navideño';
    }
}

function crearParticulasNavidenas() {
    const contenedor = document.getElementById('particulasNavidenas');
    contenedor.innerHTML = '';
    
    // Crear 50 partículas navideñas
    for (let i = 0; i < 50; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula-navidena';
        particula.style.left = Math.random() * 100 + 'vw';
        particula.style.animationDelay = Math.random() * 8 + 's';
        particula.style.animationDuration = (6 + Math.random() * 6) + 's';
        particula.style.fontSize = (0.8 + Math.random() * 0.8) + 'em';
        contenedor.appendChild(particula);
    }
}

function eliminarParticulasNavidenas() {
    const contenedor = document.getElementById('particulasNavidenas');
    contenedor.innerHTML = '';
}

// ==================== GENERADOR ALEATORIO ====================

function generarColorHex() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

async function generarPaleta() {
    const paleta = document.getElementById('paleta');
    const mensaje = document.getElementById('mensaje');
    
    // Ocultar mensaje anterior
    mensaje.classList.remove('show');
    
    // Efecto de desvanecimiento (fade out)
    paleta.style.opacity = '0';
    paleta.style.transform = 'translateY(20px)';
    
    // Esperar a que termine la animación de fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Limpiar paleta
    paleta.innerHTML = '';
    
    // Generar 5 colores
    for (let i = 0; i < 5; i++) {
        const colorHex = generarColorHex();
        crearElementoColor(colorHex, paleta);
    }
    
    // Efecto de aparición (fade in) con delay escalonado
    const contenedores = paleta.querySelectorAll('.color-container');
    contenedores.forEach((contenedor, index) => {
        setTimeout(() => {
            contenedor.style.transition = 'all 0.5s ease';
            contenedor.style.opacity = '1';
            contenedor.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Restaurar opacidad del contenedor principal
    paleta.style.opacity = '1';
    paleta.style.transform = 'translateY(0)';
    paleta.style.transition = 'all 0.3s ease';
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
    
    // Guardar referencia del colorHex en el botón
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

// ==================== SISTEMA DE FAVORITOS ====================

function toggleFavorito(colorHex, likeBtn = null) {
    const index = favoritos.findIndex(fav => fav.codigo === colorHex);
    
    if (index === -1) {
        // Agregar a favoritos
        favoritos.push({
            codigo: colorHex,
            fecha: new Date().toLocaleString()
        });
        if (likeBtn) {
            // Efecto al agregar like
            likeBtn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                likeBtn.classList.add('likeado');
                likeBtn.innerHTML = '❤️';
                likeBtn.style.transform = 'scale(1.1)';
            }, 150);
        }
        mostrarMensaje(`❤️ Agregado a favoritos: ${colorHex}`);
    } else {
        // Quitar de favoritos
        favoritos.splice(index, 1);
        if (likeBtn) {
            // Efecto al quitar like
            likeBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                likeBtn.classList.remove('likeado');
                likeBtn.innerHTML = '🤍';
                likeBtn.style.transform = 'scale(1)';
            }, 150);
        }
        mostrarMensaje(`💔 Eliminado de favoritos: ${colorHex}`);
    }
    
    // Guardar en localStorage
    localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
    
    // Actualizar TODOS los botones de like en la página
    actualizarTodosLosBotonesLike();
    actualizarListaFavoritos();
}

function actualizarTodosLosBotonesLike() {
    // Actualizar botones en generador principal
    const likeButtonsPrincipal = document.querySelectorAll('#paginaPrincipal .btn-like');
    likeButtonsPrincipal.forEach(btn => {
        const colorHex = btn.getAttribute('data-color');
        const esFavorito = favoritos.some(fav => fav.codigo === colorHex);
        btn.className = `btn-like ${esFavorito ? 'likeado' : ''}`;
        btn.innerHTML = esFavorito ? '❤️' : '🤍';
    });
    
    // Actualizar botones en generador personalizado
    const likeButtonsPersonalizado = document.querySelectorAll('#paginaPersonalizada .btn-color-accion');
    likeButtonsPersonalizado.forEach(btn => {
        const colorHex = btn.getAttribute('data-color');
        if (colorHex) {
            const esFavorito = favoritos.some(fav => fav.codigo === colorHex);
            btn.className = `btn-color-accion ${esFavorito ? 'likeado' : ''}`;
            btn.innerHTML = esFavorito ? '❤️' : '🤍';
            btn.title = esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos';
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
        const favoritoElement = document.querySelector(`[data-color="${colorHex}"]`)?.closest('.color-favorito');
        if (favoritoElement) {
            favoritoElement.style.transform = 'translateX(-100%)';
            favoritoElement.style.opacity = '0';
            setTimeout(() => {
                favoritos.splice(index, 1);
                localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
                actualizarTodosLosBotonesLike();
                actualizarListaFavoritos();
            }, 300);
        } else {
            favoritos.splice(index, 1);
            localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
            actualizarTodosLosBotonesLike();
            actualizarListaFavoritos();
        }
        
        mostrarMensaje(`💔 Eliminado de favoritos: ${colorHex}`);
    }
}

function limpiarFavoritos() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
        const favoritosElements = document.querySelectorAll('.color-favorito');
        favoritosElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.transform = 'translateX(-100%)';
                element.style.opacity = '0';
            }, index * 100);
        });
        
        setTimeout(() => {
            favoritos = [];
            localStorage.removeItem('colorFavoritos');
            actualizarTodosLosBotonesLike();
            actualizarListaFavoritos();
            
            mostrarMensaje('🗑️ Todos los favoritos eliminados');
        }, favoritosElements.length * 100 + 300);
    }
}

function toggleFavoritos() {
    const panel = document.getElementById('panelFavoritos');
    const overlay = document.getElementById('overlay');
    const boton = document.querySelector('.favoritos-btn-flotante');
    
    if (panel.classList.contains('abierto')) {
        panel.style.transform = 'translateX(-30px)';
        panel.style.opacity = '0';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            panel.classList.remove('abierto');
            overlay.classList.remove('mostrado');
            panel.style.transform = '';
            panel.style.opacity = '';
            boton.style.transform = 'scale(1)';
        }, 400);
        
    } else {
        panel.classList.add('abierto');
        overlay.classList.add('mostrado');
        
        boton.style.transform = 'scale(1.1)';
        
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

// ==================== NAVEGACIÓN ENTRE PÁGINAS ====================

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
    
    saturacion.addEventListener('input', function() {
        saturacionValor.textContent = this.value + '%';
    });
    
    luminosidad.addEventListener('input', function() {
        luminosidadValor.textContent = this.value + '%';
    });
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
        if (hex && hex !== '#') {
            colores.push(hex);
        }
    }
    return colores;
}

function obtenerEtiquetasSeleccionadas() {
    const etiquetas = [];
    document.querySelectorAll('input[name="etiqueta"]:checked').forEach(checkbox => {
        etiquetas.push(checkbox.value);
    });
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
            case 'armoniosa':
                paletas.push(generarPaletaArmoniosa(coloresBase, ajustes));
                break;
            case 'corporativa':
                paletas.push(generarPaletaCorporativa(coloresBase, ajustes));
                break;
            case 'natural':
                paletas.push(generarPaletaNatural(coloresBase, ajustes));
                break;
            case 'contraste':
                paletas.push(generarPaletaContraste(coloresBase, ajustes));
                break;
            case 'pastel':
                paletas.push(generarPaletaPastel(coloresBase, ajustes));
                break;
            case 'minima':
                paletas.push(generarPaletaMinima(coloresBase, ajustes));
                break;
            case 'calida':
                paletas.push(generarPaletaCalida(coloresBase, ajustes));
                break;
            case 'fria':
                paletas.push(generarPaletaFria(coloresBase, ajustes));
                break;
        }
    });
    
    return paletas;
}

// ==================== ALGORITMOS DE GENERACIÓN ====================

function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h * 360, s * 100, l * 100];
}

function HSLToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function generarPaletaArmoniosa(coloresBase, ajustes) {
    const colores = [];
    coloresBase.forEach(color => {
        const [h, s, l] = hexToHSL(color);
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            const hueVariation = Math.random() * 60 - 30;
            const newH = (h + hueVariation + 360) % 360;
            const newS = Math.max(20, Math.min(80, s + (ajustes.saturacion - 50) / 2 + (Math.random() * 20 - 10)));
            const newL = Math.max(20, Math.min(80, l + (ajustes.luminosidad - 50) / 2 + (Math.random() * 20 - 10)));
            colores.push(HSLToHex(newH, newS, newL));
        }
    });
    
    const coloresUnicos = [...new Set(colores)];
    return {
        nombre: '🎭 Paleta Armoniosa',
        colores: coloresUnicos.slice(0, 5)
    };
}

function generarPaletaCorporativa(coloresBase, ajustes) {
    const coloresBaseCorp = ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7'];
    return {
        nombre: '🏢 Paleta Corporativa',
        colores: ajustarColores(mezclarArrays(coloresBaseCorp, coloresBase), ajustes)
    };
}

function generarPaletaNatural(coloresBase, ajustes) {
    const coloresBaseNat = ['#27AE60', '#2ECC71', '#16A085', '#F39C12', '#8B4513'];
    return {
        nombre: '🌿 Paleta Natural',
        colores: ajustarColores(mezclarArrays(coloresBaseNat, coloresBase), ajustes)
    };
}

function generarPaletaContraste(coloresBase, ajustes) {
    const coloresBaseCont = ['#000000', '#FFFFFF', '#E74C3C', '#2C3E50', '#F1C40F'];
    return {
        nombre: '🔊 Paleta de Alto Contraste',
        colores: ajustarColores(mezclarArrays(coloresBaseCont, coloresBase), ajustes)
    };
}

function generarPaletaPastel(coloresBase, ajustes) {
    const coloresBasePast = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#FFFACD'];
    return {
        nombre: '🥰 Paleta Pastel',
        colores: ajustarColores(mezclarArrays(coloresBasePast, coloresBase), ajustes)
    };
}

function generarPaletaMinima(coloresBase, ajustes) {
    const coloresBaseMin = ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#6C757D'];
    return {
        nombre: '⚫ Paleta Mínima',
        colores: ajustarColores(mezclarArrays(coloresBaseMin, coloresBase), ajustes)
    };
}

function generarPaletaCalida(coloresBase, ajustes) {
    const coloresBaseCal = ['#FF6B6B', '#FF8E53', '#FFB142', '#FFD166', '#FFEAA7'];
    return {
        nombre: '🔥 Paleta Cálida',
        colores: ajustarColores(mezclarArrays(coloresBaseCal, coloresBase), ajustes)
    };
}

function generarPaletaFria(coloresBase, ajustes) {
    const coloresBaseFri = ['#74B9FF', '#6C5CE7', '#A29BFE', '#81ECEC', '#55E6C1'];
    return {
        nombre: '❄️ Paleta Fría',
        colores: ajustarColores(mezclarArrays(coloresBaseFri, coloresBase), ajustes)
    };
}

function mezclarArrays(arr1, arr2) {
    const mezclado = [...arr1, ...arr2];
    return mezclado.sort(() => Math.random() - 0.5).slice(0, 5);
}

function ajustarColores(colores, ajustes) {
    return colores.map(color => {
        const [h, s, l] = hexToHSL(color);
        const newS = Math.max(0, Math.min(100, s + (ajustes.saturacion - 50) + (Math.random() * 10 - 5)));
        const newL = Math.max(0, Math.min(100, l + (ajustes.luminosidad - 50) + (Math.random() * 10 - 5)));
        return HSLToHex(h, newS, newL);
    });
}

function mostrarResultadosPersonalizados(paletas) {
    const container = document.getElementById('paletasContainer');
    container.innerHTML = '';
    
    if (paletas.length === 0) {
        container.innerHTML = '<p class="mensaje-vacio">No se generaron paletas</p>';
        return;
    }
    
    // Ajustar grid según cantidad de paletas
    if (paletas.length === 1) {
        container.style.gridTemplateColumns = '1fr';
    } else if (paletas.length === 2) {
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
        container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
    }
    
    paletas.forEach((paleta, paletaIndex) => {
        const paletaDiv = document.createElement('div');
        paletaDiv.className = 'paleta-personalizada';
        paletaDiv.style.opacity = '0';
        paletaDiv.style.transform = 'translateY(20px)';
        
        let coloresHTML = '';
        let codigosHTML = '';
        
        paleta.colores.forEach((color, colorIndex) => {
            const esFavorito = favoritos.some(fav => fav.codigo === color);
            coloresHTML += `
                <div class="color-contenedor-personalizado">
                    <div class="color-personalizado" style="background-color: ${color}" onclick="copiarColor('${color}')"></div>
                    <div class="acciones-color">
                        <button class="btn-color-accion ${esFavorito ? 'likeado' : ''}" 
                                onclick="toggleFavoritoPersonalizado('${color}', this)" 
                                data-color="${color}"
                                title="${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                            ${esFavorito ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            `;
            codigosHTML += `<span class="codigo-color" onclick="copiarColor('${color}')">${color}</span>`;
        });
        
        paletaDiv.innerHTML = `
            <h4>${paleta.nombre}</h4>
            <div class="colores-paleta">${coloresHTML}</div>
            <div class="codigos-paleta">${codigosHTML}</div>
        `;
        
        container.appendChild(paletaDiv);
        
        // Animación de entrada escalonada
        setTimeout(() => {
            paletaDiv.style.transition = 'all 0.5s ease';
            paletaDiv.style.opacity = '1';
            paletaDiv.style.transform = 'translateY(0)';
        }, paletaIndex * 100);
    });
    
    mostrarMensaje(`✅ Generadas ${paletas.length} paletas personalizadas`);
}

function toggleFavoritoPersonalizado(colorHex, boton) {
    toggleFavorito(colorHex);
    // El botón se actualizará automáticamente gracias a actualizarTodosLosBotonesLike()
}

// ==================== INICIALIZACIÓN ====================

function crearParticulas() {
    const particulasContainer = document.createElement('div');
    particulasContainer.className = 'particulas';
    document.body.insertBefore(particulasContainer, document.body.firstChild);
    
    for (let i = 0; i < 30; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula';
        particula.style.left = Math.random() * 100 + 'vw';
        particula.style.animationDelay = Math.random() * 6 + 's';
        particula.style.animationDuration = (3 + Math.random() * 4) + 's';
        particulasContainer.appendChild(particula);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    crearParticulas();
    aplicarModo();
    actualizarTextoBotonModo();
    generarPaleta();
    actualizarListaFavoritos();
    configurarSelectoresColor();
    configurarSliders();
});
