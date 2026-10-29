# ♦ NOIR GOLD: Casino Roguelite

> *Años 30. Una deuda de 2,000,000 de fichas. Tres mesas entre tú y el fondo del río.*

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
| **Escenarios** | Sótano (< 50k) → Club Privado (≥ 50k) → Gran Salón VIP (≥ 500k). La interfaz, el letrero y los límites de apuesta evolucionan. |

### Las mesas
- **Blackjack** — Hit / Stand / Double Down / Surrender, apuestas laterales (Pareja Perfecta, 21+3), zapato de 6 barajas y conteo Hi-Lo visible con el truco *Cartas Marcadas*.
- **Ruleta Art Déco** — Europea (un 0): plenos, docenas, columnas, color, par/impar, mitades. Slow-zoom cinematográfico en los últimos giros.
- **Tragamonedas "El Dorado"** — 3 carretes, palanca con física, mecánica **Hold & Nudge** (retener / empujar), comodín ★.

### El catálogo
- **Tragos (La Barra):** temporales — Manhattan, Old Fashioned, Sidecar, French 75, Gin Rickey, Bee's Knees, Corpse Reviver Nº2.
- **Trucos (Mercado Negro):** As bajo la Manga, Cartas Marcadas, Dados Cargados, Apostar a Destiempo, Dedos de Oro — generan sospecha.
- **Amuletos:** Pata de Conejo, Trébol, Sortija de la Croupier, Dado del Marionetista, Reloj de Oro, Favor de la Mafia.
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
├─ index.html              SPA de pantallas: menú, selección, hub, 3 mesas, backroom, finales
├─ css/
│  ├─ style.css            Paleta noir, HUD, Pit Boss, tiers de escenario, modales, crisis
│  └─ games.css            Felt de Blackjack, rueda y tapete de Ruleta, gabinete de Slots
├─ js/
│  ├─ utils.js             Helpers, RNG, tooltip, toasts (DOM puro)
│  ├─ audio.js             WebAudio sintetizado: jazz generativo + SFX + latido de crisis
│  ├─ fx.js                Partículas en canvas, zoom de cámara, shake, fichas voladoras
│  ├─ data.js              Catálogos declarativos (items, sinergias, tiers, paytables, unlocks)
│  ├─ state.js             Estado central: run + meta (localStorage), sospecha, crisis, muerte
│  ├─ ui.js                Gestión de pantallas, HUD, Pit Boss, inventario de efectos
│  ├─ hub.js               Piso del casino: puertas, servicios, teléfono de la deuda
│  ├─ shops.js             La Barra, el Mercado Negro y la Habitación Trasera
│  ├─ blackjack.js         Mesa de 21 completa
│  ├─ roulette.js          Rueda SVG generada, tablero, animación con slow-zoom
│  ├─ slots.js             Tragamonedas con palanca y Hold & Nudge
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

## Hoja de ruta

- [ ] Split en Blackjack
- [ ] Dados de calle (craps) como cuarta mesa
- [ ] Más amuletos y sinergias por nodo de progresión
- [ ] Tabla de récords locales

---

© NflowStudios — *Noir Gold: Casino Roguelite*. La casa siempre gana… hasta que tú haces trampa.
