/* NOIR GOLD — icons.js: sistema de iconografía Art Déco unificado
   Un solo estilo: trazo 1.5, currentColor, retícula 24×24, geometría escalonada.
   Nada de glifos Unicode sueltos: TODO icono vive en su lozenge (rombo) contenedor. */
'use strict';
const Icon = {

  /* ============ ICONOS 24×24 ============ */
  S: {

    /* ---------- TRAGOS (vasos reales de época) ---------- */
    ginrickey: /* vaso alto + lima + burbujas */ `
      <path d="M8 4.5H16L15.1 19.4A1.7 1.7 0 0 1 13.4 21H10.6A1.7 1.7 0 0 1 8.9 19.4Z"/>
      <path d="M8.35 9H15.65"/>
      <circle cx="10.6" cy="12" r=".75" fill="currentColor" stroke="none"/>
      <circle cx="13.4" cy="14.4" r=".75" fill="currentColor" stroke="none"/>
      <circle cx="11.6" cy="16.6" r=".75" fill="currentColor" stroke="none"/>
      <circle cx="16.9" cy="3.7" r="1.8"/>
      <path d="M16.9 1.9V5.5M15.4 2.5L18.4 4.9M18.4 2.5L15.4 4.9" stroke-width="1"/>`,

    beesknees: /* copa coupe + gota de miel */ `
      <path d="M5.8 7.5C8.3 9.2 15.7 9.2 18.2 7.5C17.8 11.6 15.4 13.5 12 13.5C8.6 13.5 6.2 11.6 5.8 7.5Z"/>
      <path d="M12 13.5V18.4"/>
      <ellipse cx="12" cy="19.9" rx="3" ry="1.1"/>
      <path d="M17 1.9C17.8 3 17.8 3.9 17 4.5C16.2 3.9 16.2 3 17 1.9Z"/>
      <path d="M17 5.6V6.4" stroke-width="1"/>`,

    sidecar: /* coupe con borde azucarado + limón */ `
      <path d="M5.8 7.5C8.3 9.2 15.7 9.2 18.2 7.5C17.8 11.6 15.4 13.5 12 13.5C8.6 13.5 6.2 11.6 5.8 7.5Z"/>
      <path d="M5.8 7.5C8.3 9.2 15.7 9.2 18.2 7.5" stroke-dasharray="1.4 1.3" stroke-width="1.2"/>
      <path d="M12 13.5V18.4"/>
      <ellipse cx="12" cy="19.9" rx="3" ry="1.1"/>
      <circle cx="7.4" cy="5.6" r="1.7"/>
      <path d="M5.7 5.6H9.1M7.4 3.9V7.3" stroke-width="1"/>`,

    manhattan: /* copa cónica + cereza */ `
      <path d="M6 6H18L12.9 13.2A1.2 1.2 0 0 1 11.1 13.2Z"/>
      <path d="M12 13.6V18.4"/>
      <ellipse cx="12" cy="20" rx="3" ry="1.1"/>
      <circle cx="16.6" cy="4.4" r="1.25" fill="currentColor" stroke="none"/>
      <path d="M16.9 3.3C17.1 2.6 17.7 2.1 18.4 2" stroke-width="1"/>`,

    oldfashioned: /* vaso bajo + hielo + naranja */ `
      <path d="M7 6.5H17L16.1 18.9A1.8 1.8 0 0 1 14.3 20.5H9.7A1.8 1.8 0 0 1 7.9 18.9Z"/>
      <path d="M10.4 10.2L13.9 9.4L14.7 12.9L11.2 13.7Z"/>
      <path d="M11 11.6L12.9 11.1" stroke-width="1"/>
      <circle cx="18.1" cy="5.1" r="1.4"/>
      <path d="M16.7 5.1H19.5M18.1 3.7V6.5" stroke-width="1"/>`,

    french75: /* flauta de champán + burbujas */ `
      <path d="M9.6 3H14.4L13.6 11.8A1.6 1.6 0 0 1 12 13.3A1.6 1.6 0 0 1 10.4 11.8Z"/>
      <circle cx="11" cy="5" r=".65" fill="currentColor" stroke="none"/>
      <circle cx="13.1" cy="7" r=".6" fill="currentColor" stroke="none"/>
      <circle cx="11.5" cy="9.2" r=".55" fill="currentColor" stroke="none"/>
      <path d="M12 13.3V18.6"/>
      <ellipse cx="12" cy="20.1" rx="2.7" ry="1"/>`,

    corpse: /* coupe + calavera colgante */ `
      <path d="M5.8 7.5C8.3 9.2 15.7 9.2 18.2 7.5C17.8 11.6 15.4 13.5 12 13.5C8.6 13.5 6.2 11.6 5.8 7.5Z"/>
      <path d="M12 13.5V18.4"/>
      <ellipse cx="12" cy="19.9" rx="3" ry="1.1"/>
      <circle cx="17.3" cy="4.7" r="1.75"/>
      <circle cx="16.7" cy="4.4" r=".33" fill="currentColor" stroke="none"/>
      <circle cx="17.9" cy="4.4" r=".33" fill="currentColor" stroke="none"/>
      <path d="M16.6 6.1V6.8M17.3 6.1V6.9M18 6.1V6.8" stroke-width="1"/>`,

    /* ---------- TRUCOS ---------- */
    asbajo: /* as saliendo de la manga */ `
      <g transform="rotate(13 14 8.5)">
        <rect x="10.8" y="2.4" width="6.6" height="9.8" rx="1"/>
        <text x="14.1" y="7" text-anchor="middle" font-family="Georgia,serif" font-weight="700"
              font-size="4.6" fill="currentColor" stroke="none">A</text>
        <path d="M14.1 7.6c-.85 1.2-1.8 1.95-1.8 2.85a.95 .95 0 0 0 1.8 .35a.95 .95 0 0 0 1.8 -.35c0 -.9 -.95 -1.65 -1.8 -2.85Z" fill="currentColor" stroke="none"/>
      </g>
      <path d="M3.4 16.9L10.3 14.7L11.3 17.9L4.4 20.1Z"/>
      <path d="M10.3 14.7L11.3 17.9" stroke-width="1"/>`,

    dedos: /* dedos cruzados */ `
      <path d="M9.1 21.5C7.5 16 8.3 10.5 13.5 4.7"/>
      <path d="M14.9 21.5C16.5 16 15.7 10.5 10.5 4.7"/>
      <path d="M13.5 4.7L14.8 3.2M10.5 4.7L9.2 3.2" stroke-width="1.2"/>
      <path d="M6.7 21.5H17.3"/>`,

    dados: /* dado cargado, pip sesgado */ `
      <g transform="rotate(9 12 12)">
        <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="2.4"/>
        <circle cx="8.2" cy="8.2" r="1.05" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1.05" fill="currentColor" stroke="none"/>
        <circle cx="16.4" cy="16.4" r="1.05" fill="currentColor" stroke="none"/>
      </g>
      <path d="M17.6 9.4A6.2 6.2 0 0 1 19.4 13.6" stroke-dasharray="1.6 1.4" stroke-width="1.1"/>`,

    marcadas: /* carta con muesca y pincho */ `
      <rect x="6.6" y="3.4" width="10.8" height="17.2" rx="1.6"/>
      <text x="9.2" y="7.8" font-family="Georgia,serif" font-weight="700" font-size="4.4"
            fill="currentColor" stroke="none">K</text>
      <path d="M9.2 9c-.5 .75 -1.1 1.25 -1.1 1.75a.58 .58 0 0 0 1.1 .15a.58 .58 0 0 0 1.1 -.15c0 -.5 -.6 -1 -1.1 -1.75Z" fill="currentColor" stroke="none"/>
      <path d="M10.9 3.4L11.6 4.3L10.9 5.2" stroke-width="1.1"/>
      <path d="M14.6 12.4l.8 .8-.8 .8-.8 -.8Z" fill="currentColor" stroke="none"/>
      <path d="M13.4 15.4h2.4M14.6 14.2v2.4" stroke-width="1"/>`,

    destiempo: /* reloj de bolsillo + ficha tardía */ `
      <circle cx="10.3" cy="3.9" r=".85"/>
      <path d="M11.2 5.4V4.9H9.4V5.4"/>
      <circle cx="10.3" cy="11.4" r="5.6"/>
      <circle cx="10.3" cy="11.4" r="4.3" stroke-width="1"/>
      <path d="M10.3 11.4V7.9M10.3 11.4L12.9 12.9" stroke-width="1.2"/>
      <circle cx="18.3" cy="16.9" r="2.7"/>
      <circle cx="18.3" cy="16.9" r="1.3" stroke-width="1"/>
      <path d="M14.7 7.1Q19.6 9.4 18.6 14.1" stroke-dasharray="1.7 1.5" stroke-width="1.1"/>`,

    /* ---------- AMULETOS ---------- */
    pata: /* pata de conejo */ `
      <g transform="translate(12 12) scale(1.12) translate(-12 -12)">
        <path d="M8.6 21C6.5 21 5.5 18.4 6.9 16.1C7.9 14.4 8.3 12.7 8.3 10.7C8.3 9.5 8.9 8.6 9.8 8.2C9.6 7.5 10 6.9 10.8 6.8C11.2 6.2 11.9 5.9 12.6 6.1C13.3 5.9 14 6.2 14.4 6.8C15.2 6.9 15.6 7.5 15.4 8.2C16.3 8.6 16.9 9.5 16.9 10.7C16.9 12.7 17.3 14.4 18.3 16.1C19.7 18.4 18.7 21 16.6 21Z"/>
        <circle cx="10.5" cy="13.3" r="1.05" fill="currentColor" stroke="none"/>
        <circle cx="13.7" cy="13.3" r="1.05" fill="currentColor" stroke="none"/>
        <ellipse cx="12.1" cy="17.1" rx="1.9" ry="1.5" fill="currentColor" stroke="none"/>
      </g>`,

    trebol: /* trébol de cuatro hojas */ `
      <circle cx="9" cy="8.3" r="3"/>
      <circle cx="15" cy="8.3" r="3"/>
      <circle cx="9" cy="14.3" r="3"/>
      <circle cx="15" cy="14.3" r="3"/>
      <path d="M12 12C13.2 14.2 13.7 16.7 13.4 19.9" stroke-width="1.2"/>`,

    sortija: /* anillo con gema escalonada Déco */ `
      <circle cx="12" cy="14.7" r="5.4"/>
      <path d="M12 2.5L15.6 6.1L12 9.7L8.4 6.1Z"/>
      <path d="M8.4 6.1H15.6M12 2.5L10.2 6.1L12 9.7M12 2.5L13.8 6.1L12 9.7" stroke-width="1"/>`,

    marionetista: /* dado colgado de hilos */ `
      <path d="M5.4 4H18.6"/>
      <circle cx="5.4" cy="4" r=".85" fill="currentColor" stroke="none"/>
      <circle cx="18.6" cy="4" r=".85" fill="currentColor" stroke="none"/>
      <path d="M7 4.85L8.6 10.3M12 4.85V10.3M17 4.85L15.4 10.3" stroke-width="1"/>
      <g transform="rotate(-6 12 14.9)">
        <rect x="7.6" y="10.3" width="8.8" height="8.8" rx="1.8"/>
        <circle cx="10.2" cy="12.9" r=".85" fill="currentColor" stroke="none"/>
        <circle cx="13.8" cy="16.5" r=".85" fill="currentColor" stroke="none"/>
      </g>`,

    reloj: /* reloj de bolsillo dorado */ `
      <circle cx="12" cy="3.1" r="1"/>
      <path d="M11.2 5.4V4.4H12.8V5.4"/>
      <circle cx="12" cy="13.2" r="6.6"/>
      <circle cx="12" cy="13.2" r="5.1" stroke-width="1"/>
      <path d="M12 8.4V9.2M12 17.2V18M7.2 13.2H8M16 13.2H16.8" stroke-width="1"/>
      <path d="M12 13.2V10M12 13.2L14.3 14.6" stroke-width="1.2"/>`,

    favor: /* fedora de la familia */ `
      <path d="M7.2 14.6C7.2 9.4 9 8.2 12 8.2C15 8.2 16.8 9.4 16.8 14.6"/>
      <path d="M12 8.2C11.7 9.3 11.7 10.6 12 11.7" stroke-width="1"/>
      <path d="M7.5 12.8H16.5"/>
      <path d="M4.6 14.9C8 16.9 16 16.9 19.4 14.9C16.2 18.9 7.8 18.9 4.6 14.9Z"/>`,

    /* ---------- KIT DE BARRIO + HIPÓDROMO ---------- */
    tragocasa: /* vaso de la casa sin etiqueta + destello */ `
      <path d="M7.5 6H16.5L15.6 18.9A1.8 1.8 0 0 1 13.8 20.6H10.2A1.8 1.8 0 0 1 8.4 18.9Z"/>
      <path d="M7.8 10H16.2"/>
      <circle cx="10.8" cy="13.4" r=".75" fill="currentColor" stroke="none"/>
      <circle cx="13.4" cy="15.7" r=".75" fill="currentColor" stroke="none"/>
      <circle cx="11.4" cy="17.4" r=".75" fill="currentColor" stroke="none"/>
      <path d="M18.7 2.6l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6Z" fill="currentColor" stroke="none"/>`,

    dadosmellados: /* dado agrietado con mella */ `
      <rect x="5" y="5" width="14" height="14" rx="2.6"/>
      <path d="M14.2 5L15.9 6.7L14.7 8.3" stroke-width="1.2"/>
      <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none"/>`,

    moneda: /* moneda agujereada del mendigo */ `
      <circle cx="12" cy="12" r="7.4"/>
      <circle cx="12" cy="12" r="5.8" stroke-dasharray="1.6 1.7" stroke-width="1"/>
      <circle cx="12" cy="12" r="2.7"/>
      <path d="M6.3 9.1L4.8 8.3M17.7 9.1L19.2 8.3" stroke-width="1"/>`,

    doping: /* vial de "vitaminas" del establo */ `
      <path d="M10.2 3.4h3.6V6.2"/>
      <path d="M9.4 6.2h5.2v11.2A2.6 2.6 0 0 1 12 20a2.6 2.6 0 0 1-2.6-2.6Z"/>
      <path d="M9.4 12.2h5.2" stroke-width="1.2"/>
      <circle cx="11" cy="15.1" r=".7" fill="currentColor" stroke="none"/>
      <circle cx="13.3" cy="16.8" r=".7" fill="currentColor" stroke="none"/>
      <path d="M15.8 4.4l1.6-1.6M16.6 6.6h2.2" stroke-width="1"/>`,

    consejo: /* gorra de jockey con visera */ `
      <path d="M7.2 13.8C7.2 9.8 9.3 7.4 12 7.4s4.8 2.4 4.8 6.4"/>
      <path d="M6.4 13.8h11.2"/>
      <path d="M17.6 13.8c1.9.2 3.1.8 3.5 1.9-1.7.5-3.6.2-4.9-.5"/>
      <path d="M9.6 9.2L12 10.6l2.4-1.4" stroke-width="1"/>
      <circle cx="12" cy="6.6" r=".9"/>`,

    lacre: /* sobre con sello de lacre */ `
      <rect x="4.5" y="6.2" width="15" height="11.4" rx="1.4"/>
      <path d="M5.2 7.2L12 12.6l6.8-5.4"/>
      <circle cx="12" cy="15.6" r="1.8"/>
      <path d="M12 14.6v2" stroke-width="1"/>`,

    table: /* mesa de paño con patas */ `
      <path d="M4.4 8.2C4.4 6 7.8 4.4 12 4.4s7.6 1.6 7.6 3.8-3.4 3.8-7.6 3.8S4.4 10.4 4.4 8.2Z"/>
      <path d="M6.4 11.8V19.6M17.6 11.8V19.6"/>
      <path d="M6.4 16.4h11.2" stroke-width="1"/>`,

    badge: /* placa policial */ `
      <path d="M12 3.2l2.2 4.7 5.1.6-3.8 3.5 1 5.1L12 14.6l-4.5 2.5 1-5.1-3.8-3.5 5.1-.6Z"/>
      <circle cx="12" cy="11" r="1.1" fill="currentColor" stroke="none"/>`,

    fajo: /* fajo de billetes atado */ `
      <ellipse cx="12" cy="6.6" rx="5.6" ry="2.4"/>
      <path d="M6.4 6.6v11.2c0 1.4 2.5 2.6 5.6 2.6s5.6-1.2 5.6-2.6V6.6"/>
      <path d="M6.4 12c0 1.4 2.5 2.6 5.6 2.6s5.6-1.2 5.6-2.6"/>
      <path d="M6.4 12v5.8c0 1.4 2.5 2.6 5.6 2.6s5.6-1.2 5.6-2.6V12" stroke-width="1"/>`,

    streak: /* llama déco de la racha */ `
      <path d="M12 3.2C13.2 6 10.4 7.5 9.3 9.4c-.9 1.6-1.4 2.8-1.4 4.3a4.1 4.1 0 0 0 4.1 4.1 4.1 4.1 0 0 0 4.1-4.1c0-1.9-.9-3.4-1.8-4.8"/>
      <path d="M12 17.8c-1.5-.6-2.3-1.8-2.1-3.4 1.4.4 2.3-.5 2.1-2.3 1.6 1.2 2.4 2.5 2.4 4" stroke-width="1.1"/>`,

    /* ---------- SERVICIOS / UI ---------- */
    martini: /* botella y copa — LA BARRA */ `
      <path d="M7.5 4H9.5V8.8C9.5 9.8 8.7 10.2 8.7 11.2V18.4A1.6 1.6 0 0 0 10.3 20H7.1A1.6 1.6 0 0 0 8.7 18.4V11.2C8.7 10.2 7.5 9.8 7.5 8.8Z"/>
      <path d="M7 13.4H10"/>
      <path d="M13 6.2H19.6L16.3 11.5A1 1 0 0 1 14.7 11.5Z" transform="translate(0 .4)"/>
      <path d="M15.5 12.2V17.2"/>
      <ellipse cx="15.5" cy="18.9" rx="2.1" ry=".9"/>
      <circle cx="17.7" cy="5.2" r=".7" fill="currentColor" stroke="none"/>`,

    coat: /* abrigo de contrabandista */ `
      <path d="M9.4 4.2L5.8 7L4.2 20H10.2M14.6 4.2L18.2 7L19.8 20H13.8"/>
      <path d="M9.4 4.2L12 7.4L14.6 4.2M12 7.4V20"/>
      <path d="M4.9 13.8H19.1M11 12.9H13V14.7H11Z" stroke-width="1.1"/>
      <path d="M6.4 3.2L6 4.4M17.6 3.2L18 4.4" stroke-width="1"/>`,

    phone: /* teléfono candlestick */ `
      <path d="M6.6 20.6H17.4L16 17.8H8Z"/>
      <path d="M11.7 17.8V8.6"/>
      <rect x="9.3" y="5.8" width="4.8" height="1.7" rx=".85"/>
      <path d="M12 7.5V8.6"/>
      <path d="M13.2 10.1C14 9.5 15 9.5 15.7 10"/>
      <circle cx="16.7" cy="11" r="2.1"/>`,

    note: /* nota de jazz */ `
      <path d="M9.4 18.2V6.2L16.6 4.6V15.6"/>
      <ellipse cx="7.5" cy="18.2" rx="1.9" ry="1.5" fill="currentColor" stroke="none" transform="rotate(-18 7.5 18.2)"/>
      <ellipse cx="14.7" cy="15.6" rx="1.9" ry="1.5" fill="currentColor" stroke="none" transform="rotate(-18 14.7 15.6)"/>`,

    mute: /* nota silenciada */ `
      <path d="M9.4 18.2V6.2L16.6 4.6V15.6"/>
      <ellipse cx="7.5" cy="18.2" rx="1.9" ry="1.5" fill="currentColor" stroke="none" transform="rotate(-18 7.5 18.2)"/>
      <ellipse cx="14.7" cy="15.6" rx="1.9" ry="1.5" fill="currentColor" stroke="none" transform="rotate(-18 14.7 15.6)"/>
      <path d="M4.6 4.6L19.4 19.4" stroke-width="1.7"/>`,

    x: /* cerrar */ `
      <path d="M6.4 6.4L17.6 17.6M17.6 6.4L6.4 17.6"/>`,

    lock: /* candado */ `
      <rect x="6.4" y="10.4" width="11.2" height="8.8" rx="1.6"/>
      <path d="M8.7 10.4V7.6A3.3 3.3 0 0 1 15.3 7.6V10.4"/>
      <circle cx="12" cy="13.8" r="1.1" fill="currentColor" stroke="none"/>
      <path d="M12 14.9V16.4" stroke-width="1.2"/>`,

    chip: /* ficha de casino */ `
      <circle cx="12" cy="12" r="7.2"/>
      <circle cx="12" cy="12" r="6.2" stroke-dasharray="2.4 2.46" stroke-width="1.2"/>
      <circle cx="12" cy="12" r="3.4"/>`,

    menu: /* menú hamburguesa */ `
      <path d="M5 7H19M5 12H19M5 17H19"/>
      <path d="M12 10.6l.9 1.4-.9 1.4-.9-1.4Z" fill="currentColor" stroke="none"/>`,

    back: /* flecha de retroceso */ `
      <path d="M9.5 5L4 12L9.5 19"/>
      <path d="M4.6 12H14.5"/>
      <path d="M12.5 8.5L19.5 12L12.5 15.5" stroke-width="1.2"/>`,

    info: /* placa de información */ `
      <circle cx="12" cy="12" r="7.4"/>
      <path d="M12 11V16.4"/>
      <circle cx="12" cy="8.1" r=".8" fill="currentColor" stroke="none"/>`
  },

  /* ============ ESCENAS DE PUERTAS (120×150, trazo 2.2, misma familia) ============ */
  SCENES: {

    bj: /* abanico de cartas + ficha 21 */ `
      <g stroke-width="1.8" opacity=".22">
        <path d="M60 118L26 34M60 118L44 26M60 118L60 23M60 118L76 26M60 118L94 34"/>
      </g>
      <g stroke-width="2">
        <g transform="rotate(-16 60 86)">
          <rect x="44" y="40" width="32" height="46" rx="2.5" fill="rgba(242,232,213,.06)"/>
          <text x="50" y="52" font-family="Georgia,serif" font-weight="700" font-size="8" fill="#F2E8D5" stroke="none">Q</text>
          <text x="47.5" y="62" font-family="Georgia,serif" font-size="7" fill="#E06A82" stroke="none">♥</text>
        </g>
        <g transform="rotate(16 60 86)">
          <rect x="44" y="40" width="32" height="46" rx="2.5" fill="rgba(242,232,213,.06)"/>
          <text x="50" y="52" font-family="Georgia,serif" font-weight="700" font-size="8" fill="#F2E8D5" stroke="none">K</text>
          <text x="47.5" y="62" font-family="Georgia,serif" font-size="7" fill="#F2E8D5" stroke="none">♣</text>
        </g>
        <rect x="44" y="40" width="32" height="46" rx="2.5" fill="rgba(242,232,213,.1)"/>
        <text x="50" y="52" font-family="Georgia,serif" font-weight="700" font-size="8" fill="#F2E8D5" stroke="none">A</text>
        <text x="47.5" y="62" font-family="Georgia,serif" font-size="7" fill="#F2E8D5" stroke="none">♠</text>
      </g>
      <circle cx="60" cy="112" r="15" fill="#046307"/>
      <circle cx="60" cy="112" r="11.5" stroke-width="1.6"/>
      <text x="60" y="116.5" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="11" fill="#F4D06F" stroke="none">21</text>`,

    rl: /* rueda déco + bola + puntero */ `
      <circle cx="60" cy="64" r="44" stroke-width="2.4"/>
      <circle cx="60" cy="64" r="34" stroke-width="1.6"/>
      <circle cx="60" cy="64" r="14" stroke-width="2"/>
      <circle cx="60" cy="64" r="4.5" fill="currentColor" stroke="none"/>
      <g fill="#800020" opacity=".6" stroke="none">
        <path d="M71.1 22.5A43 43 0 0 1 90.4 33.6L84 40A34 34 0 0 0 68.8 31.2Z"/>
        <path d="M101.5 52.9A43 43 0 0 1 101.5 75.1L92.8 72.8A34 34 0 0 0 92.8 55.2Z"/>
        <path d="M90.4 94.4A43 43 0 0 1 71.1 105.5L68.8 96.8A34 34 0 0 0 84 88Z"/>
        <path d="M48.9 105.5A43 43 0 0 1 29.6 94.4L36 88A34 34 0 0 0 51.2 96.8Z"/>
        <path d="M18.5 75.1A43 43 0 0 1 18.5 52.9L27.2 55.2A34 34 0 0 0 27.2 72.8Z"/>
        <path d="M29.6 33.6A43 43 0 0 1 48.9 22.5L51.2 31.2A34 34 0 0 0 36 40Z"/>
      </g>
      <g stroke-width="1.4" opacity=".7">
        <path d="M60 49V31M67.5 51L76.5 35.4M73 56.5L88.6 47.5M75 64H93M73 71.5L88.6 80.5M67.5 77L76.5 92.6M60 79V97M52.5 77L43.5 92.6M47 71.5L31.4 80.5M45 64H27M47 56.5L31.4 47.5M52.5 51L43.5 35.4"/>
      </g>
      <g fill="currentColor" stroke="none">
        <path d="M75.9 45.1l3 3-3 3-3-3ZM44.1 45.1l3 3-3 3-3-3ZM44.1 76.9l3 3-3 3-3-3ZM75.9 76.9l3 3-3 3-3-3Z"/>
      </g>
      <circle cx="87" cy="37" r="3.2" fill="#F2E8D5" stroke="none"/>
      <path d="M60 8L66 20L60 17L54 20Z" fill="#F4D06F" stroke="none"/>
      <path d="M46 128C46 112 74 112 74 128" stroke-width="2"/>
      <path d="M40 128H80M44 128V134M76 128V134" stroke-width="2"/>`,

    hr: /* herradura del hipódromo nocturno */ `
      <g stroke-width="7">
        <path d="M40 108V70C40 48 48 36 60 36C72 36 80 48 80 70V108"/>
      </g>
      <g stroke-width="2">
        <path d="M60 52l3.2 8.8L72 64l-8.8 3.2L60 76l-3.2-8.8L48 64l8.8-3.2Z" fill="rgba(244,208,111,.14)"/>
      </g>
      <g fill="currentColor" stroke="none" opacity=".9">
        <circle cx="40" cy="86" r="1.7"/><circle cx="40" cy="100" r="1.7"/>
        <circle cx="80" cy="86" r="1.7"/><circle cx="80" cy="100" r="1.7"/>
        <circle cx="49.5" cy="52" r="1.7"/><circle cx="70.5" cy="52" r="1.7"/>
      </g>
      <g stroke-width="1.6" opacity=".35">
        <path d="M20 42L36 26M100 42L84 26M60 14V26"/>
      </g>
      <g stroke-width="2">
        <path d="M24 122H96M30 122V133M90 122V133"/>
        <path d="M52 122V96M68 122V96" stroke-width="1.6" opacity=".7"/>
      </g>`,

    sl: /* gabinete con carretes + palanca + ficha */ `
      <path d="M30 42C40 22 80 22 90 42" stroke-width="2.2"/>
      <path d="M36 42C44 28 76 28 84 42" stroke-width="1.3" opacity=".6"/>
      <path d="M60 19.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2Z" fill="#F4D06F" stroke="none"/>
      <rect x="24" y="42" width="72" height="56" rx="4" stroke-width="2.2"/>
      <rect x="30" y="48" width="60" height="44" rx="2" stroke-width="1.2" opacity=".5"/>
      <g stroke-width="1.6">
        <rect x="36" y="52" width="14" height="30" rx="2" fill="rgba(11,12,16,.9)"/>
        <rect x="54" y="52" width="14" height="30" rx="2" fill="rgba(11,12,16,.9)"/>
        <rect x="72" y="52" width="14" height="30" rx="2" fill="rgba(11,12,16,.9)"/>
      </g>
      <path d="M43 58.5l4.6 7.5-4.6 7.5-4.6-7.5Z" fill="#E06A82" stroke="none"/>
      <text x="61" y="77" text-anchor="middle" font-family="Limelight,Georgia,serif" font-size="12" fill="#F4D06F" stroke="none">7</text>
      <path d="M79 58.5L80.7 65.3 87.5 67 80.7 68.7 79 75.5 77.3 68.7 70.5 67 77.3 65.3Z" fill="#F4D06F" stroke="none"/>
      <path d="M96.5 60h7v6h-7Z" stroke-width="1.8"/>
      <path d="M100 60V36" stroke-width="1.8"/>
      <circle cx="100" cy="32" r="4.5" fill="#800020"/>
      <path d="M26 98H94M30 98V105M90 98V105M28 105H92" stroke-width="2"/>
      <ellipse cx="49" cy="131" rx="8" ry="2" fill="currentColor" opacity=".25" stroke="none"/>
      <circle cx="49" cy="120" r="9" stroke-width="1.8"/>
      <circle cx="49" cy="120" r="6.4" stroke-width="1" stroke-dasharray="2.8 3"/>`
  },

  /* ============ API ============ */
  svg(id, cls) {
    return '<svg class="ico-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none"' +
      ' stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' +
      ' aria-hidden="true" focusable="false">' + (this.S[id] || '') + '</svg>';
  },
  scene(name) {
    return '<svg class="scn-svg" viewBox="0 0 120 150" fill="none" stroke="currentColor"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      (this.SCENES[name] || '') + '</svg>';
  },
  /* pinta todo [data-ico] y [data-scene] del DOM */
  paint(root) {
    (root || document).querySelectorAll('[data-ico]').forEach((el) => {
      el.innerHTML = this.svg(el.dataset.ico, el.dataset.icoCls);
    });
    (root || document).querySelectorAll('[data-scene]').forEach((el) => {
      el.innerHTML = this.scene(el.dataset.scene);
    });
  }
};
