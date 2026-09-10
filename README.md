# ♥ Jessi Quest — Nivel 1

## BOO — ENCONTRÁ A GAZTi

Jessi está haciendo swipe entre perfiles hasta encontrar a GAZTi.

### Mecánica
- La flecha indica el swipe correcto.
- El perfil **solo cambia cuando el jugador pulsa la flecha correcta**.
- Error o tiempo agotado: se pierde una vida y el mismo perfil permanece.
- 5 fases de velocidad.
- 3 vidas y puntaje.
- Al comenzar hay una cuenta regresiva **5 → 4 → 3 → 2 → 1 → ¡YA!**
- Al completar el nivel aparece primero el perfil de GAZTi, suena la victoria y cae confeti durante un instante.
- Después aparece la tarjeta del Cromo #01 y se reproduce su efecto.

### Audio
- Música del Nivel 1 en bucle: `audio/nivel1_musica.mp3`
- Derrota: `audio/muerte.mp3`
- Victoria: `audio/victoria.mp3`
- Cromo: `audio/cromo.mp3`
- El volumen de la música está deliberadamente bajo para que no tape los efectos.
- Hay control de volumen y mute en pantalla.
- La reproducción comienza al iniciar la cuenta regresiva para respetar las restricciones de autoplay del navegador.

### Pantalla completa
Hay un botón `⛶ PANTALLA COMPLETA` dentro del juego.

### Imágenes
Los perfiles usan las imágenes originales proporcionadas. Jessi y GAZTi también usan sus fotos originales. El estilo retro está en la interfaz, HUD, marcos, tipografía y efectos.

### Publicación
Subir `index.html`, `assets/` y `audio/` a GitHub y conectar el repositorio con Netlify. No requiere build ni dependencias.
