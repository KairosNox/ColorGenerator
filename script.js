let favoritos = JSON.parse(localStorage.getItem('colorFavoritos')) || [];

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
        
        paleta.appendChild(contenedorColor);
    }
    
    // Efecto de aparición (fade in) con delay escalonado
    const contenedores = paleta.querySelectorAll('.color-container');
    contenedores.forEach((contenedor, index) => {
        setTimeout(() => {
            contenedor.style.transition = 'all 0.5s ease';
            contenedor.style.opacity = '1';
            contenedor.style.transform = 'translateY(0)';
        }, index * 100); // Delay escalonado
    });
    
    // Restaurar opacidad del contenedor principal
    paleta.style.opacity = '1';
    paleta.style.transform = 'translateY(0)';
    paleta.style.transition = 'all 0.3s ease';
}

function toggleFavorito(colorHex, likeBtn) {
    const index = favoritos.findIndex(fav => fav.codigo === colorHex);
    
    if (index === -1) {
        // Agregar a favoritos
        favoritos.push({
            codigo: colorHex,
            fecha: new Date().toLocaleString()
        });
        // Efecto al agregar like
        likeBtn.style.transform = 'scale(1.3)';
        setTimeout(() => {
            likeBtn.classList.add('likeado');
            likeBtn.innerHTML = '❤️';
            likeBtn.style.transform = 'scale(1.1)';
        }, 150);
        mostrarMensaje(`❤️ Agregado a favoritos: ${colorHex}`);
    } else {
        // Quitar de favoritos
        favoritos.splice(index, 1);
        // Efecto al quitar like
        likeBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            likeBtn.classList.remove('likeado');
            likeBtn.innerHTML = '🤍';
            likeBtn.style.transform = 'scale(1)';
        }, 150);
        mostrarMensaje(`💔 Eliminado de favoritos: ${colorHex}`);
    }
    
    // Guardar en localStorage
    localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
    
    // Actualizar solo la lista de favoritos, NO toda la paleta
    actualizarListaFavoritos();
}

function actualizarListaFavoritos() {
    const listaFavoritos = document.getElementById('listaFavoritos');
    listaFavoritos.innerHTML = '';
    
    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay favoritos aún</p>';
        return;
    }
    
    favoritos.forEach((favorito, index) => {
        const favoritoDiv = document.createElement('div');
        favoritoDiv.className = 'color-favorito';
        favoritoDiv.style.opacity = '0';
        favoritoDiv.style.transform = 'translateX(-20px)';
        
        favoritoDiv.innerHTML = `
            <div class="mini-color" style="background-color: ${favorito.codigo}"></div>
            <div class="info-favorito">
                <div class="codigo-favorito">${favorito.codigo}</div>
                <div class="fecha-favorito">${favorito.fecha}</div>
            </div>
            <div class="acciones-favorito">
                <button class="btn-accion" onclick="copiarColor('${favorito.codigo}')" title="Copiar">📋</button>
                <button class="btn-accion" onclick="eliminarFavorito('${favorito.codigo}')" title="Eliminar">🗑️</button>
            </div>
        `;
        
        listaFavoritos.appendChild(favoritoDiv);
        
        // Efecto de aparición escalonado en favoritos
        setTimeout(() => {
            favoritoDiv.style.transition = 'all 0.4s ease';
            favoritoDiv.style.opacity = '1';
            favoritoDiv.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

function eliminarFavorito(colorHex) {
    const index = favoritos.findIndex(fav => fav.codigo === colorHex);
    if (index !== -1) {
        // Efecto de eliminación en el elemento de favoritos
        const favoritoElement = document.querySelector(`[data-color="${colorHex}"]`)?.closest('.color-favorito');
        if (favoritoElement) {
            favoritoElement.style.transform = 'translateX(100%)';
            favoritoElement.style.opacity = '0';
            setTimeout(() => {
                favoritos.splice(index, 1);
                localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
                actualizarListaFavoritos();
            }, 300);
        } else {
            favoritos.splice(index, 1);
            localStorage.setItem('colorFavoritos', JSON.stringify(favoritos));
            actualizarListaFavoritos();
        }
        
        // Actualizar el botón de like en la paleta si existe
        const likeButtons = document.querySelectorAll('.btn-like');
        likeButtons.forEach(btn => {
            if (btn.getAttribute('data-color') === colorHex) {
                btn.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    btn.classList.remove('likeado');
                    btn.innerHTML = '🤍';
                    btn.style.transform = 'scale(1)';
                }, 150);
            }
        });
        
        mostrarMensaje(`💔 Eliminado de favoritos: ${colorHex}`);
    }
}

function limpiarFavoritos() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos?')) {
        // Efecto de eliminación para todos los favoritos
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
            actualizarListaFavoritos();
            
            // Actualizar todos los botones de like en la paleta
            const likeButtons = document.querySelectorAll('.btn-like');
            likeButtons.forEach(btn => {
                btn.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    btn.classList.remove('likeado');
                    btn.innerHTML = '🤍';
                    btn.style.transform = 'scale(1)';
                }, 150);
            });
            
            mostrarMensaje('🗑️ Todos los favoritos eliminados');
        }, favoritosElements.length * 100 + 300);
    }
}

function toggleFavoritos() {
    const panel = document.getElementById('panelFavoritos');
    const overlay = document.getElementById('overlay');
    
    if (panel.classList.contains('abierto')) {
        // Efecto al cerrar
        panel.style.transform = 'translateX(100%)';
        setTimeout(() => {
            panel.classList.remove('abierto');
            overlay.classList.remove('mostrado');
            panel.style.transform = '';
        }, 300);
    } else {
        // Efecto al abrir
        panel.classList.add('abierto');
        overlay.classList.add('mostrado');
        panel.style.transform = 'translateX(0)';
        panel.style.transition = 'transform 0.3s ease';
    }
}

function copiarColor(hexCode) {
    // Efecto visual al copiar
    const colorBox = event.target.closest('.color-container').querySelector('.color-box');
    colorBox.style.transform = 'scale(0.95)';
    colorBox.style.boxShadow = '0 0 20px rgba(255,255,255,0.8)';
    
    setTimeout(() => {
        colorBox.style.transform = '';
        colorBox.style.boxShadow = '';
    }, 200);
    
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

// Crear partículas decorativas
function crearParticulas() {
    const particulasContainer = document.createElement('div');
    particulasContainer.className = 'particulas';
    document.body.insertBefore(particulasContainer, document.body.firstChild);
    
    for (let i = 0; i < 20; i++) {
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
    generarPaleta();
    actualizarListaFavoritos();
});