# ♦ NOIR GOLD: Casino Roguelite

> *Años 30. Una deuda de 2,000,000 de fichas. Cuatro mesas entre tú y el fondo del río.*

**Noir Gold** es un roguelite de casino con estética **Noir / Art Déco** (1930–1940): chiaroscuro, jazz sintetizado en vivo, un Pit Boss que huele tus trampas y una progresión que te lleva del sótano clandestino al Gran Salón VIP.

- **Jugar:** `https://nflowstudios.github.io/casino/`
- **Motor:** HTML + CSS + JavaScript puro (sin frameworks, sin build, cero dependencias).
- **Persistencia:** `localStorage` (partida en curso + progresión roguelite).

---

## Cómo jugar

| Sistema | Detalle |
|---|---|
| **Modo Historia** | Saldar la deuda de **2,000,000** de fichas con la familia Moretti (usa el *Teléfono* del casino al reunirla). |
| **Modo Infinito** | Supervivencia y puntuación (pico de fichas). |
| **Permadeath** | Caer a 0 fichas = bancarrota: pierdes tragos, trucos y amuletos de la partida. |
| **Progresión roguelite** | Los objetos desbloqueados permanecen en el catálogo de la Barra y el Mercado Negro para partidas futuras. |
| **Sospecha** | 0–100%. Sube con cada truco; baja con rondas limpias y tragos. Al 100%: **Habitación Trasera** (soborno, entregar trucos o prueba de suerte). |
| **Racha Caliente** | Cada victoria consecutiva suma **+5% de pago** (hasta +50%). Perder una ronda la enfría. **Ojo:** desde la 4ª victoria seguida la casa empieza a contar (+2 de sospecha por victoria, +3 desde la 9ª), aunque el bono ya esté al máximo. |
| **Escenarios** | Sótano (< 50k) → Club Privado (≥ 50k) → Gran Salón VIP (≥ 500k). La interfaz, el letrero y los límites de apuesta evolucionan. |
| **Escenas Moretti** | En el modo Historia, cruzar 100k / 250k / 500k / 1M / 1.75M dispara una escena de la familia: de la burla al respeto… y a la **Ficha Negra**. |
| **La Partida Privada** | El duelo final: al cruzar **1.75M**, don Salvatore Moretti te entrega la Ficha Negra. Blackjack **a 3 victorias** con entrada de 500k, apuesta del orgullo (10→15→20→25% del paño y **todo o nada** en la quinta mano) y el **As de Moretti**. Cuatro finales: **EL SOCIO**, **LA GRAN ESTAFA**, **LA LECCIÓN** y **EL REY DE NADA**. |
| **Eventos nocturnos** | Al volver al piso, la noche puede sorprenderte: el borracho con un sistema, la mesa caliente, la redada, el prestamista, la cantante. |

### Las mesas
- **Blackjack** — Hit / Stand / Double Down / Surrender, apuestas laterales (Pareja Perfecta 30:1, 21+3), zapato de 6 barajas y conteo Hi-Lo visible con el truco *Cartas Marcadas*.
- **Ruleta Art Déco** — Europea (un 0): **tapete simple** con plenos (35:1) y apuestas de color / par-impar (1:1). Slow-zoom cinematográfico en los últimos giros.
- **Tragamonedas "El Dorado"** — 3 carretes, palanca con física y comodín ★. **Dos símbolos iguales pagan ×2**: casi la mitad de las tiradas devuelven algo.
- **Hipódromo Nocturno** — Seis corredores con nombre y seda propia, una sola recta bajo los faroles, apuesta **a ganador** según pizarra (2:1 a 22:1), narración en vivo, **foto final** con suspense y trucos propios (*Doping del Establo*, *Consejo del Jockey*).

### El catálogo
- **Tragos (La Barra):** temporales — Trago de la Casa, Manhattan, Old Fashioned, Sidecar, French 75, Gin Rickey, Bee's Knees, Corpse Reviver Nº2.
- **Trucos (Mercado Negro):** As bajo la Manga, Cartas Marcadas, Dados Cargados, Dados Mellados, Apostar a Destiempo, Dedos de Oro, Doping del Establo, Consejo del Jockey — generan sospecha.
- **Amuletos:** Moneda del Mendigo, Pata de Conejo, Trébol, Sortija de la Croupier, Dado del Marionetista, Reloj de Oro, Favor de la Mafia.
- **Kit de barrio:** tres objetos baratos disponibles desde la primera partida (Trago de la Casa, Dados Mellados, Moneda del Mendigo).
- **Sinergias VIP:** *Hora Dorada* (Old Fashioned + Reloj de Oro), *Cóctel de la Suerte* (Manhattan + Pata de Conejo), *Mano Maestra* (As + Marcadas), *Fortuna Falsificada* (Dados + Pata).

## Ejecutar localmente

```bash
# desde la raíz del repo
python3 -m http.server 8080
# abre http://localhost:8080
```

(También funciona abriendo `index.html` directamente; todos los recursos son locales salvo las fuentes de Google, con fallbacks tipográficos.)

## Arquitectura

```
casino/
├─ index.html              SPA de pantallas: menú, selección, hub, 4 mesas, sala del fondo, backroom, finales
├─ css/
│  ├─ style.css            Paleta noir, HUD, Pit Boss, tiers de escenario, modales, crisis, finales del duelo
│  └─ games.css            Felt de Blackjack, rueda y tapete de Ruleta, gabinete de Slots, hipódromo, sala del fondo
├─ js/
│  ├─ utils.js             Helpers, RNG, tooltip, toasts (DOM puro)
│  ├─ icons.js             Iconografía Art Déco unificada (SVG 24×24 + escenas de puerta 120×150)
│  ├─ audio.js             WebAudio sintetizado: jazz generativo + SFX + latido de crisis
│  ├─ fx.js                Partículas en canvas, zoom de cámara, shake, fichas voladoras
│  ├─ data.js              Catálogos declarativos (items, sinergias, eventos, escenas, caballos, paytables, unlocks)
│  ├─ state.js             Estado central: run + meta (localStorage), sospecha, crisis, racha, muerte
│  ├─ ui.js                Gestión de pantallas, HUD, Pit Boss, inventario de efectos
│  ├─ hub.js               Piso del casino: puertas, servicios, teléfono de la deuda
│  ├─ shops.js             La Barra, el Mercado Negro y la Habitación Trasera
│  ├─ events.js            Eventos nocturnos + escenas cinemáticas de la familia Moretti
│  ├─ blackjack.js         Mesa de 21 completa
│  ├─ roulette.js          Rueda SVG generada, tapete simple (plenos + color/paridad), animación con slow-zoom
│  ├─ slots.js             Tragamonedas clásico con palanca (giro directo, parejas pagan ×2)
│  ├─ races.js             El Hipódromo Nocturno: 6 corredores, recta, narración, foto final
│  ├─ duel.js              La Partida Privada: duelo final contra Moretti y los 4 finales
│  └─ main.js              Bootstrap, menú, finales, ayuda
└─ README.md
```

**Decisiones de diseño:**
1. **Cero build / cero dependencias** — GitHub Pages sirve estáticos al instante; el repo es el producto.
2. **`State.afterRound()` como aduana** — toda ronda pasa por el mismo punto: tick de tragos, chequeo de crisis, backroom pendiente, muerte.
3. **Catálogos declarativos en `data.js`** — balancear el juego no requiere tocar lógica.
4. **Audio 100% sintetizado** — jazz noir generativo por WebAudio: sin assets, sin licencias, cada sesión suena distinta.
5. **Persistencia dual** — `noirgold.run.v1` (partida reanudable) + `noirgold.meta.v1` (desbloqueos y estadísticas roguelite).

## Despliegue (GitHub Pages)

El sitio se sirve desde la rama `main`, carpeta raíz (`/`). Cualquier `git push` actualiza el juego en segundos.

## Registro de cambios

### v1.5.0 — La Sala del Fondo
- **La Partida Privada (duelo final):** al cruzar **1.75M** en el modo Historia, Moretti entrega la **Ficha Negra** y abre *La Sala del Fondo*: Blackjack **a 3 victorias** contra el don en persona, con entrada de 500k y **apuesta del orgullo** (10% → 15% → 20% → 25% del paño; la quinta mano se juega **a TODO O NADA**, paño y bolsillo). **El As de Moretti:** una vez por partida cambia su carta oculta a la vista de todos. Tus trucos funcionan en la sala… y deciden tu final.
- **Cuatro finales:** **EL SOCIO** (ganar limpio y con la sospecha baja), **LA GRAN ESTAFA** (ganar con trucos o quemado — con sombras en el epílogo), **LA LECCIÓN** (perder; puedes volver a pagar la entrada) y **EL REY DE NADA** (arruinarte en el todo o nada). Epílogos con estadísticas de la partida y un guiño si conservas la *Moneda del Mendigo*. Ganar cierra el modo Historia.
- **La racha quema:** desde la **4ª victoria consecutiva** el contador de racha se vuelve rojo con ojos — la casa cuenta tus victorias: **+2 de sospecha por victoria** (+3 desde la 9ª), aunque el bono ya esté congelado en +50%. Al romper una racha larga, el crupier anota algo en una libreta pequeña.
- **Arreglo — Consejo del Jockey:** el desbloqueo (“gana 3 carreras”) nunca se activaba para partidas guardadas por versiones anteriores: la fusión de estadísticas dejaba `hrBestRun` en `undefined` y la comparación siempre fallaba. Ahora las victorias se cuentan **en total histórico** (no hace falta que sean seguidas ni en la misma partida) y la fusión de `localStorage` rellena los defaults correctamente (también repara `doping` y el récord de pico).

### v1.4.0 — La Noche se Mueve
- **El Hipódromo Nocturno (nueva mesa):** seis corredores con seda propia, apuesta a ganador según pizarra variable, carreras de ~10 s con narración en vivo, adelantos, remontadas y **foto final**. Trucos propios: *Doping del Establo* y *Consejo del Jockey*; el bookie vigila tus rachas.
- **Tragamonedas más generoso:** cualquier **pareja idéntica paga ×2** — la frecuencia de premio pasa de ~10% a ~46% de las tiradas. Tríos rebalanceados (♠×3 = ×6, BAR×3 = ×25) para conservar un retorno sano.
- **Racha Caliente:** cada victoria consecutiva suma +5% de pago (máx. +50%), visible en el HUD. Se rompe al perder.
- **Escenas de la familia Moretti:** al cruzar 100k / 250k / 500k / 1M / 1.75M en el modo Historia, escenas cinemáticas del desprecio al respeto.
- **Eventos nocturnos:** al volver al piso pueden aparecer el borracho con su sistema, la mesa caliente, la redada policial, el prestamista y la cantante — cada uno con decisiones.
- **Kit de barrio:** tres objetos baratos desde la primera partida — *Trago de la Casa* (100), *Dados Mellados* (120, +10% en ruleta 3 giros) y *Moneda del Mendigo* (150, devuelve media pérdida grande una vez).
- **Castigos afinados:** la prueba de suerte fallida quita −40% (antes −50%) y la Pareja Perfecta paga 30:1 (antes 25:1).

### v1.3.0 — Pulido Art Déco
- Iconografía SVG unificada para todo el catálogo (nada de glifos sueltos), toasts reorganizados por mesa, hub y pantallas narrativas pulidas.

### v1.2.0 — Diseño fluido
- Rediseño responsive con escala tipográfica de 6 niveles, tablero de ruleta que llena el ancho y pista de scroll en móvil.

### v1.1.0
- **Arreglo:** los modales (Cómo Jugar, La Barra, El Callejón y confirmaciones) no se abrían — el atributo `hidden` del HTML los mantenía ocultos pese a la clase `open`.
- **Ruleta simplificada:** el tapete pasa a plenos + ROJO / NEGRO / PAR / IMPAR. Fuera docenas, columnas y mitades. *Dados Cargados* ahora sesga el color elegido.
- **Tragamonedas clásico:** se elimina la mecánica Hold & Nudge (retener / empujar). *Dedos de Oro* ahora concede una tirada gratis y el *Trébol* paga +15% en premios.

### v1.0.0
- Lanzamiento inicial.

## Hoja de ruta

- [ ] Split en Blackjack
- [ ] El bar de Manny: radio de época con boletines que anticipan la noche
- [ ] Sistema de calor unificado (sospecha con escalera de consecuencias y sobornos)
- [ ] Póker de trastienda contra NPCs con tells
- [ ] Dados de calle (craps) como quinta mesa
- [ ] Más amuletos y sinergias por nodo de progresión
- [ ] Tabla de récords locales

---

© NflowStudios — *Noir Gold: Casino Roguelite*. La casa siempre gana… hasta que tú haces trampa.
