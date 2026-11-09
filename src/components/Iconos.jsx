// Íconos en SVG (dibujados a mano, sin librerías). Todos usan currentColor,
// así toman el color del texto donde se pongan. Prop: tamano (px).
const base = (tamano) => ({ width: tamano, height: tamano, viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" });

export function IconoCasa({ tamano = 40 }) {
  return (
    <svg {...base(tamano)} viewBox="0 0 48 48">
      <path fill="currentColor" d="M24 4 2 22.5l3.6 4.1L9 23.7V44h30V23.7l3.4 2.9 3.6-4.1L37 14.9V6h-6v3.8L24 4Zm-9 35V18.6l9-7.6 9 7.6V39H15Z" />
      <path fill="#fff" d="M19 24h4.3v4.3H19zM24.7 24H29v4.3h-4.3zM19 29.7h4.3V34H19zM24.7 29.7H29V34h-4.3z" />
    </svg>
  );
}

export function IconoHerramientas({ tamano = 44 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M21.7 5.3a5 5 0 0 1-6.5 6.2L6.6 20.1a2 2 0 0 1-2.8-2.8l8.6-8.6A5 5 0 0 1 18.6 2.2l-3 3 .9 2.3 2.3.9 2.9-3.1Z" />
      <path fill="currentColor" d="m3.2 4.6 1.4-1.4 3 1.6 1 2 4.2 4.2-1.4 1.4L7.2 8.2l-2-1-2-2.6Zm11.3 9.9 1.4-1.4 5.4 5.4a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0l-4-4 0-2.8Z" />
    </svg>
  );
}

export function IconoRayo({ tamano = 44 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M13.5 2 4 13.5h6.2L9 22l11-12.5h-6.4L13.5 2Z" />
    </svg>
  );
}

export function IconoCasco({ tamano = 44 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M10.5 4h3v1.2A7.5 7.5 0 0 1 19.5 12.5V16h-15v-3.5a7.5 7.5 0 0 1 6-7.3V4Z" />
      <path fill="currentColor" d="M2 17h20v1.5a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5V17Z" />
    </svg>
  );
}

export function IconoTubo({ tamano = 44 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M9 3h6v2h-2v2h3a4 4 0 0 1 4 4v2h-3.5v-1.5A1.5 1.5 0 0 0 15 10H3V7h8V5H9V3Z" />
      <path fill="currentColor" d="M18.3 15.5c1 1.4 1.7 2.5 1.7 3.3a2 2 0 0 1-4 0c0-.8.7-1.9 1.7-3.3l.3-.4.3.4Z" />
    </svg>
  );
}

export function IconoEtiqueta({ tamano = 90 }) {
  return (
    <svg {...base(tamano)} viewBox="0 0 64 64">
      <path fill="currentColor" d="M34 6h20a4 4 0 0 1 4 4v20a4 4 0 0 1-1.2 2.8L32.8 56.8a4 4 0 0 1-5.6 0L7.2 36.8a4 4 0 0 1 0-5.6L31.2 7.2A4 4 0 0 1 34 6Z" />
      <circle cx="47" cy="17" r="4" fill="#141414" />
      <path stroke="#141414" strokeWidth="4" strokeLinecap="round" d="m22 30 12 12M34 30 22 42" />
      <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M47 17c3-6 9-8 12-5" />
    </svg>
  );
}

export function IconoCarrito({ tamano = 30 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M2 3h2.6l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h9.1a1.5 1.5 0 0 0 1.4-1l2-6.4H6" />
      <circle cx="9" cy="19.5" r="1.6" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function IconoLupa({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="m15.5 15.5 5 5" />
    </svg>
  );
}

export function IconoUsuario({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path fill="currentColor" d="M4 20.5C4 16.4 7.6 14 12 14s8 2.4 8 6.5V21H4v-.5Z" />
    </svg>
  );
}

export function IconoFlecha({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

export function IconoChevron({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function IconoTelefono({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M6.6 2.5 9.4 6a1.5 1.5 0 0 1-.1 2L7.8 9.5a12 12 0 0 0 6.7 6.7l1.5-1.5a1.5 1.5 0 0 1 2-.1l3.5 2.8a1.5 1.5 0 0 1 .1 2.2l-1.9 1.9c-.8.8-2 1-3 .6A20 20 0 0 1 1.9 7.3c-.4-1-.2-2.2.6-3L4.4 2.4a1.5 1.5 0 0 1 2.2.1Z" />
    </svg>
  );
}

export function IconoCorreo({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v.4l-10 6.3L2 6.4V6a1 1 0 0 1 1-1Zm-1 3.8 10 6.3 10-6.3V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.8Z" />
    </svg>
  );
}

export function IconoUbicacion({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 4.2A2.8 2.8 0 1 0 12 11.8 2.8 2.8 0 0 0 12 6.2Z" />
    </svg>
  );
}

export function IconoBanco({ tamano = 22 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M12 2 2 7v2h20V7L12 2ZM4 10.5h3V17H4zm6.5 0h3V17h-3zm6.5 0h3V17h-3zM2 18.5h20V21H2z" />
    </svg>
  );
}

export function IconoFacebook({ tamano = 22 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
    </svg>
  );
}

export function IconoInstagram({ tamano = 22 }) {
  return (
    <svg {...base(tamano)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconoTiktok({ tamano = 22 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M14 3h3a4.5 4.5 0 0 0 4 4v3a7.4 7.4 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3.1a3 3 0 1 0 3 2.9V3Z" />
    </svg>
  );
}

export function IconoYoutube({ tamano = 22 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}

export function IconoFuego({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M12.5 2c.6 3.2 4.5 5.4 4.5 10a5 5 0 0 1-10 0c0-2 1-3.6 2.2-4.6-.1 1.6.6 2.9 1.8 3.4C10.5 7.6 11.6 4.6 12.5 2ZM12 22a7 7 0 0 1-7-7c0-.6.1-1.2.2-1.8a6.5 6.5 0 0 0 13.6 0c.1.6.2 1.2.2 1.8a7 7 0 0 1-7 7Z" />
    </svg>
  );
}

export function IconoEstrella({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9L12 2.5Z" />
    </svg>
  );
}

export function IconoEtiquetaChica({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M3 3h8.2l9.8 9.8-8.2 8.2L3 11.2V3Zm4.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  );
}

export function IconoAudifonos({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M12 3a8 8 0 0 0-8 8v6a3 3 0 0 0 3 3h1v-7H6v-2a6 6 0 0 1 12 0v2h-2v7h1a3 3 0 0 0 3-3v-6a8 8 0 0 0-8-8Z" />
    </svg>
  );
}

export function IconoEscudo({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1.2 13.6-3.5-3.5 1.4-1.4 2.1 2.1 4.7-4.7 1.4 1.4-6.1 6.1Z" />
    </svg>
  );
}

export function IconoCamion({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M2 5h12v3h4l4 4.5V17h-1.6a2.6 2.6 0 0 0-5 0H9.6a2.6 2.6 0 0 0-5 0H2V5Zm14 5v2.5h3.8L17.6 10H16ZM7.1 16a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Zm10.8 0a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Z" />
    </svg>
  );
}

export function IconoTarjeta({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path fill="currentColor" d="M2.5 8.5h19v2.5h-19zM5.5 14.5h5v2h-5zm7.5 0h3v2h-3z" />
    </svg>
  );
}

export function IconoCaja({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="m12 2.8 8.5 4.3v9.8L12 21.2l-8.5-4.3V7.1L12 2.8Zm0 0v0M3.5 7.1 12 11.4l8.5-4.3M12 11.4v9.8M7.7 4.9l8.6 4.4" />
    </svg>
  );
}

export function IconoMenu({ tamano = 22 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M3.5 6h17M3.5 12h17M3.5 18h17" />
    </svg>
  );
}

export function IconoFlechaArriba({ tamano = 22 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="m5 15 7-7 7 7" />
    </svg>
  );
}

export function IconoChevronIzquierda({ tamano = 18 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" d="m15 5-7 7 7 7" />
    </svg>
  );
}

export function IconoBrocha({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M4 3h13v6H4V3Zm14 2h2v6h-8v3h-2v-5h8V5ZM10 15h2v6h-2v-6Z" />
    </svg>
  );
}

export function IconoTienda({ tamano = 20 }) {
  return (
    <svg {...base(tamano)}>
      <path fill="currentColor" d="M3 4h18l1 5a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 11a3 3 0 0 1-4.7-.1A3 3 0 0 1 2 9l1-5Zm1 8.6a4.9 4.9 0 0 0 4-.5 4.9 4.9 0 0 0 4 1 4.9 4.9 0 0 0 4-1 4.9 4.9 0 0 0 4 .5V20h-6v-5h-4v5H4v-7.4Z" />
    </svg>
  );
}
