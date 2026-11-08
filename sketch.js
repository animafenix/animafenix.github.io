// SKETCH.JS

let imgMapa;
let banios;
let accesible;
let ascensor;
let globo;
let biblioteca;
//let zonaSimulada;

const parametrosUbicacion = new URLSearchParams(window.location.search);
let ubicacion_objetivo = parametrosUbicacion.get('ubicacion_objetivo');
let ubicacion_objetivo_aulas = parametrosUbicacion.get('ubicacion_objetivo_aulas');

// Paleta de colores para los bordes
const colorEdificio = ['#000000', '#004aac', '#a311c0', '#e45c27'];
let indiceColorActual = 0; 

// 1. Límites geográficos de la imagen del mapa (Calibración)
const MAPA_NORTE = -34.648770; 
const MAPA_SUR   = -34.653585; 
const MAPA_OESTE = -58.777830; 
const MAPA_ESTE  = -58.772530; 

// Definición de zonas/edificios con sus coordenadas extremas
const ZONAS = [
  {
    nombre: "HISTORICO ALA ESTE",
    latNorte: -34.651020, latSur: -34.651930,
    lonOeste: -58.785925, lonEste: -58.774900,
    colorRelleno: 'rgba(0, 74, 172, 0.35)',
    colorBorde: '#004aac',
    indiceColor: 1
  },
  {
    nombre: "DARACT 1",
    latNorte: -34.650131, latSur: -34.650785,
    lonOeste: -58.775172, lonEste: -58.774890,
    colorRelleno: 'rgba(163, 17, 192, 0.35)',
    colorBorde: '#a311c0',
    indiceColor: 2
  },
  {
    nombre: "DARACT 2",
    latNorte: -34.650727, latSur: -34.651311,
    lonOeste: -58.774560, lonEste: -58.774328,
    colorRelleno: 'rgba(228, 92, 39, 0.35)',
    colorBorde: '#e45c27',
    indiceColor: 3
  }
];

let miLatitud = 0;
let miLongitud = 0;

// TEMPORAL: para probar rutas sin GPS, permitir simular la zona actual con teclado.
// Borrar esta sección cuando ya no haga falta la prueba manual.
let zonaSimulada = null;

function simularZonaConTeclado() {
  if (miLatitud !== 0 || miLongitud !== 0) return;

  if (key === '1') {
    zonaSimulada = 'HISTORICO ALA ESTE';
  } else if (key === '2') {
    zonaSimulada = 'DARACT 1';
  } else if (key === '3') {
    zonaSimulada = 'DARACT 2';
  }
}

let posGpsMapa = { x: 0, y: 0 };

function obtenerZonaActual() {
  const zonaActual = ZONAS.find((zona) =>
    miLatitud <= zona.latNorte &&
    miLatitud >= zona.latSur &&
    miLongitud >= zona.lonOeste &&
    miLongitud <= zona.lonEste
  );

  return zonaActual ? zonaActual.nombre : null;
}

/// RUTAS DESDE EL HISTORICO ///
const RUTASHIS = {
  historico: [
    { x: 3533, y: 3317 },
  ],

  daract1: [
    { x: 3533, y: 3317 },
    { x: 3523, y: 2737 },
    { x: 3603, y: 2742 },
    { x: 3638, y: 2177 },
    { x: 4103, y: 2067 },
    { x: 4608, y: 2137 },
    { x: 4953, y: 2002 },
    { x: 5117, y: 1765 },
    { x: 5003, y: 1682 }
  ],
  
  daract2: [
    { x: 3533, y: 3317 },
    { x: 3523, y: 2737 },
    { x: 3603, y: 2742 },
    { x: 3638, y: 2177 },
    { x: 4103, y: 2067 },
    { x: 4608, y: 2137 },
    { x: 4953, y: 2002 },
    { x: 5059, y: 2063 },
    { x: 5221, y: 1834 },
    { x: 5325, y: 1902 },
    ]
};

/// RUTAS DE AULAS GENERALES ///
const RUTASAULAS = {
  // desde la entrada del daract1
  d1aula1y3: [
    { x: 5003, y: 1682 },
    { x: 4870, y: 1597 },
    { x: 4689, y: 1479 },
    { x: 4665, y: 1522 },
    ],
  d1aula2: [
    { x: 5003, y: 1682 },
    { x: 4795, y: 1543 },
    { x: 4814, y: 1498 }
    ],
  d1aula4: [
    { x: 5003, y: 1682 },
    { x: 4770, y: 1515 },
    { x: 4790, y: 1480 },
    ],
  d1aula5y7: [
    { x: 5003, y: 1682 },
    { x: 4666, y: 1468 },
    { x: 4638, y: 1504 },
    ],
  d1aula6: [
    { x: 5003, y: 1682 },
    { x: 4595, y: 1408 },
    { x: 4611, y: 1373 },
    ],
  d1aula8: [
    { x: 5003, y: 1682 },
    { x: 4572, y: 1389 },
    { x: 4588, y: 1358 },
    ],
  d1biblioteca: [
    { x: 5003, y: 1682 },
    { x: 4362, y: 1287 },
    ],
  d1banos: [
    { x: 5003, y: 1682 },
    { x: 4917, y: 1643 },
    { x: 4885, y: 1686 },
    ],
  
  // desde la entrada del daract2
  d2aula1y3: [
    { x: 5325, y: 1902 },
    { x: 5450, y: 1980 },
    { x: 5415, y: 2033 },
    ],
  d2aula2: [
    { x: 5325, y: 1902 },
    { x: 5535, y: 2017 },
    { x: 5561, y: 1977 },
    ],
  d2aula4: [
    { x: 5325, y: 1902 },
    { x: 5556, y: 2034 },
    { x: 5586, y: 1993 },
    ],
  d2aula5: [
    { x: 5325, y: 1902 },
    { x: 5653, y: 2104 },
    { x: 5629, y: 2144 },
    { x: 5653, y: 2104 },
    { x: 5817, y: 2216 },
    { x: 5788, y: 2272 },
    ],
  d2aula6: [
    { x: 5325, y: 1902 },
    { x: 5728, y: 2150 },
    { x: 5757, y: 2111 },
    ],
  d2aula8: [
    { x: 5325, y: 1902 },
    { x: 5756, y: 2167 },
    { x: 5780, y: 2126 },
    ],
  d2sum: [
    { x: 5325, y: 1902 },
    { x: 5946, y: 2308 },
    ],
  d2banos: [
    { x: 5325, y: 1902 },
    { x: 5387, y: 1944 },
    { x: 5360, y: 1990 },
    ],

  //desde la entrada del historico
  salonH003: [
    { x: 3535, y: 3317 },
    { x: 4676, y: 3315 },
    { x: 4676, y: 3354 },
    ],
  salonH002: [
    { x: 3535, y: 3317 },
    { x: 4567, y: 3315 },
    { x: 4568, y: 3349 },
    ],
  salonH001: [
    { x: 3535, y: 3317 },
    { x: 4628, y: 3315 },
    { x: 4628, y: 3211 },
    ],
  salonH004: [
    { x: 3535, y: 3317 },
    { x: 4628, y: 3319 },
    { x: 4628, y: 3278 },
    { x: 4491, y: 3278 },
    ],
  salonG004: [
    { x: 3535, y: 3317 },
    { x: 4362, y: 3315 },
    { x: 4362, y: 3286 },
    ],
  salonG003: [
    { x: 3535, y: 3317 },
    { x: 4300, y: 3315 },
    { x: 4300, y: 3354 },
    ],
  salonG002: [
    { x: 3535, y: 3317 },
    { x: 4190, y: 3315 },
    { x: 4190, y: 3352 },
    ],
  salonG001: [
    { x: 3535, y: 3317 },
    { x: 4258, y: 3315 },
    { x: 4258, y: 3210 },
    ],
  salonF004: [
    { x: 3535, y: 3317 },
    { x: 4258, y: 3319 },
    { x: 4258, y: 3280 },
    { x: 4121, y: 3280 },
    ],
  salonF003: [
    { x: 3535, y: 3317 },
    { x: 4990, y: 3315 },
    { x: 4990, y: 3290 },
    ],
  salonF002: [
    { x: 3535, y: 3317 },
    { x: 3919, y: 3315 },
    { x: 3919, y: 3351 },
    ],
  salonF001: [
    { x: 3535, y: 3317 },
    { x: 3880, y: 3315 },
    { x: 3880, y: 3205 },
    ]
};


///ACTUALIZACION NUEVA 7-11-2026 INICIO///
/// RUTAS DESDE EL DARACT 1///
const RUTASD1 = {
  historico: [
    { x: 5003, y: 1682 },
    { x: 5117, y: 1765 },
    { x: 4953, y: 2002 },
    { x: 4608, y: 2137 },
    { x: 4103, y: 2067 },
    { x: 3638, y: 2177 },
    { x: 3603, y: 2742 },
    { x: 3523, y: 2737 },
    { x: 3533, y: 3317 }
  ],

  daract1: [
    { x: 5003, y: 1682 },
  ],
  
  daract2: [
    { x: 5003, y: 1682 },
    { x: 5325, y: 1902 },
    ]
};

/// RUTAS DESDE EL DARACT 2///
const RUTASD2 = {
  historico: [
    { x: 5325, y: 1902 },
    { x: 5221, y: 1834 },
    { x: 5059, y: 2063 },
    { x: 4953, y: 2002 },
    { x: 4608, y: 2137 },
    { x: 4103, y: 2067 },
    { x: 3638, y: 2177 },
    { x: 3603, y: 2742 },
    { x: 3523, y: 2737 },
    { x: 3533, y: 3317 }
  ],

  daract1: [
    { x: 5325, y: 1902 },
    { x: 5003, y: 1682 },
  ],
  
  daract2: [
    { x: 5325, y: 1902 },
    ]
};
///ACTUALIZACION NUEVA 7-11-2026 FIN///

let panX = 0;
let panY = 0;
let zoom = 1.0;
let anguloRotacion = 0;

// TEMPORAL: captura las coordenadas del ultimo clic en el espacio de la imagen.
let puntoClickMapa = null;

let distToqueInicial = 0;
let zoomInicial = 1.0;
let anguloInicialToque = 0;
let rotacionInicial = 0;

function preload() {
  imgMapa = loadImage('img/predio.jpg');
  banios = loadImage('img/servicios/banios.png');
  accesible = loadImage('img/servicios/accesible.png');
  ascensor = loadImage('img/servicios/ascensor.png');
  globo = loadImage('img/icons/globo.png');
  encuentro = loadImage('img/icons/encuentro.png');
  salida = loadImage('img/icons/salida.png');
  biblioteca = loadImage('img/servicios/biblioteca.png');
}

function setup() {
  const contenedor = document.getElementById('map-container');
  let w = contenedor ? contenedor.clientWidth : windowWidth;
  let h = contenedor ? contenedor.clientHeight : windowHeight;

  let canvas = createCanvas(w, h);
  if (contenedor) canvas.parent('map-container');
  
  panX = width / 2;
  panY = height / 2;

  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
      actualizarPosicion,
      errorGPS,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  }

  let canvasElem = canvas.elt;
  canvasElem.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  canvasElem.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

function draw() {
  background('#5070fe');

  // --- MAPA, RUTA, GPS Y CARTELES (TODO BAJO LA MISMA CÁMARA) ---
  push();
  translate(panX, panY);
  scale(zoom);
  //rotate(anguloRotacion);

  imageMode(CENTER);
  image(imgMapa, 0, 0);

  // 1. DIBUJAR RECTÁNGULOS DE EDIFICIOS BASADOS EN COORDENADAS
  /*if (imgMapa.width > 0 && imgMapa.height > 0) {
    for (let zona of ZONAS) {
      dibujarRectanguloGeo(
        zona.latNorte, 
        zona.latSur, 
        zona.lonOeste, 
        zona.lonEste, 
        zona.colorRelleno, 
        zona.colorBorde
      );
    }
  }*/

    ///ACTUALIZACION NUEVA 7-11-2026 INICIO///
  const zonaActual = obtenerZonaActual();

  // TEMPORAL: para pruebas sin GPS, si miLatitud/miLongitud están en 0 se usa la zona simulada por teclado.
  const zonaActiva = (miLatitud === 0 && miLongitud === 0) ? zonaSimulada : zonaActual;

  const RUTAS_POR_ZONA = {
    'HISTORICO ALA ESTE': {
      rutas: RUTASHIS,
      aulas: RUTASAULAS
    },
    'DARACT 1': {
      rutas: RUTASD1,
      aulas: RUTASAULAS
    },
    'DARACT 2': {
      rutas: RUTASD2,
      aulas: RUTASAULAS
    }
  };

  const rutasZona = RUTAS_POR_ZONA[zonaActiva] || { rutas: {}, aulas: {} };

  if (ubicacion_objetivo && rutasZona.rutas[ubicacion_objetivo]) {
    const ruta = rutasZona.rutas[ubicacion_objetivo];
    noFill();
    stroke('#004acc');
    strokeWeight(6 / zoom);
    beginShape();
    for (const punto of ruta) {
      vertex(punto.x - imgMapa.width / 2, punto.y - imgMapa.height / 2);
    }
    endShape();
  }

  if (ubicacion_objetivo_aulas !== null && rutasZona.aulas[ubicacion_objetivo_aulas]) {
    const ruta = rutasZona.aulas[ubicacion_objetivo_aulas];
    noFill();
    stroke('#004acc');
    strokeWeight(6 / zoom);
    beginShape();
    for (const punto of ruta) {
      vertex(punto.x - imgMapa.width / 2, punto.y - imgMapa.height / 2);
    }
    endShape();
  }

  const rutaObjetivo = ubicacion_objetivo_aulas !== null
    ? rutasZona.aulas[ubicacion_objetivo_aulas]
    : ubicacion_objetivo !== null
      ? rutasZona.rutas[ubicacion_objetivo]
      : null;
  if (rutaObjetivo && rutaObjetivo.length > 0) {
    const destino = rutaObjetivo[rutaObjetivo.length - 1];
    image(
      globo,
      destino.x - imgMapa.width / 2,
      destino.y - imgMapa.height / 2,
      66,
      132
    );
  }
  ///ACTUALIZACION NUEVA 7-11-2026 FIN///

  // 2. DIBUJAR MARCADOR DE GPS
  let circuloX = posGpsMapa.x - imgMapa.width / 2;
  let circuloY = posGpsMapa.y - imgMapa.height / 2;

  noStroke();
  fill(80, 112, 254, 100);
  circle(circuloX, circuloY, 60 / zoom);

  stroke('#ffffff');
  strokeWeight(3 / zoom);
  fill('#5070fe');
  circle(circuloX, circuloY, 24 / zoom);
  
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('inter');
  noStroke();

  function dibujarCartelIcono(fnDibujo, x, y, w, h) {
    push();
    translate(x, y);
    //rotate(-anguloRotacion); 
    fnDibujo();
    pop();
  }

  function dibujarEdifiNom(fnDibujo, x, y, w, h) {
    push();
    translate(x, y);
    //rotate(-anguloRotacion); 
    scale(1 / zoom);         
    fnDibujo();
    pop();
  }

  // --- BAÑOS 1 --- 00000000000000000000000000000 DARACT II 0000000000000000000000000000000000
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(banios, 0, 0, 50, 50);
  }, 700, -880);

  // --- ASCENSOR ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(ascensor, 0, 0, 50, 50);
  }, 765, -1045);

  // --- AULA 1/3 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 120, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 1/3`, 0, 0);
  }, 840, -790);

  // --- AULA 5 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 5`, 0, 0);
  }, 1040, -660);

  // --- ENCUENTRO ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(encuentro, 0, 0, 50, 50);
  }, 900, -290);

  // --- AULA 2 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 2`, 0, 0);
  }, 900, -970);

  // --- AULA 4 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 4`, 0, 0);
  }, 1000, -900);

  // --- AULA 6 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 6`, 0, 0);
  }, 1090, -830);

  // --- AULA 8 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 8`, 0, 0);
  }, 1190, -760);

  // --- BAÑOS 2 ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(banios, 0, 0, 50, 50);
  }, 1300, -700);

  // --- ACCESIBLE ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(accesible, 0, 0, 30, 30);
  }, 1235, -700);

  // --- SUM ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 90, 60, 7);
    fill(255);
    textSize(24);
    text(`SUM`, 0, 0);
  }, 1370, -510);

  dibujarEdifiNom(() => {
    fill('#004aac');
    rect(0, 0, 130, 60, 7);
    fill(255);
    textSize(20);
    text(`DARACT 2`, 0, 0);
  }, 1200, -1000);

  // --- J003 --- 0000000000000000000000000000 HISTORICO ALA ESTE 0000000000000000000000000000
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`J003`, 0, 2);
  }, 1116, 170);

  // --- I001 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`I001`, 0, 2);
  }, 355, 170);

  // --- H001 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`H001`, 0, 2);
  }, -20, 170);

  // --- SALIDA H ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -113, 301);

  // --- G001 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`G001`, 0, 2);
  }, -395, 170);

  // --- F001 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`F001`, 0, 2);
  }, -772, 170);

  // --- F003 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`F003`, 0, 2);
  }, -667, 367);

  // --- F004 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`F004`, 0, 2);
  }, -560, 367);

  // --- G004 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`G004`, 0, 2);
  }, -291, 367);

  // --- H004 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`H004`, 0, 2);
  }, -184, 367);

  // --- COORDINACION DISENIO ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 90, 45, 7);
    fill(255);
    textLeading(8);
    textSize(12);
    text(`Coordinación\n\nde Diseño`, 0, 2);
  }, 85, 367);

  // --- AULA TALLER ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 65, 50, 7);
    fill(255);
    textLeading(9);
    textSize(16);
    text(`Aula\n\nTaller`, 0, 2);
  }, 200, 367);

  // --- BANIO PEQUENIO J ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(banios, 0, 0, 30, 30);
  }, 824, 340);

  // --- SALIDA J ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, 754, 303);

  // --- J001 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`J001`, 0, 2);
  }, 920, 367);

  // --- J002 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`J002`, 0, 2);
  }, 1020, 367);

  // --- BANIOS J---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(banios, 0, 0, 50, 50);
  }, 1145, 367);

  // --- H002 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`H002`, 0, 2);
  }, -41, 494);

  // --- H003 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`H003`, 0, 2);
  }, 65, 494);

  // --- G003 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`G003`, 0, 2);
  }, -311, 494);

  // --- G002 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`G002`, 0, 2);
  }, -420, 494);

  // --- F002 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`F002`, 0, 2);
  }, -688, 494);

  // --- AULA POSGRADO ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 95, 50, 7);
    fill(255);
    textLeading(8);
    textSize(16);
    text(`Aula\n\nPosgrado`, 0, 0);
  }, -794, 494);

  // --- ASCENSOR F ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(ascensor, 0, 0, 50, 50);
  }, -875, 470);

  // --- SALIDA F ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -860, 303);

  // --- F004 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 40, 7);
    fill(255);
    textLeading(9);
    textSize(14);
    text(`Depart.\n\nde Radio`, 0, 1);
  }, -845, 383);

  // --- VICERRECTORADO ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 130, 30, 7);
    fill(255);
    textSize(16);
    text(`Vicerrectorado`, 0, 0);
  }, -1155, 485);

  // --- BEDELIA HIST ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 95, 40, 7);
    fill(255);
    textSize(20);
    text(`Bedelía`, 0, 1);
  }, -1279, 495);

  // --- CONSEJO SUPERIOR ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 95, 55, 7);
    fill(255);
    textLeading(10);
    textSize(16);
    text(`Consejo\n\nSuperior`, 0, 0);
  }, -1380, 520);

  // --- RECTORADO ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 30, 7);
    fill(255);
    textSize(16);
    text(`Rectorado`, 0, 0);
  }, -1765, 485);

  // --- TITULOS ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 85, 40, 7);
    fill(255);
    textSize(20);
    text(`Títulos`, 0, 0);
  }, -1660, 487);

  // --- CARPA ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 80, 50, 7);
    fill(255);
    textSize(24);
    text(`Carpa`, 0, 2);
  }, -1453, 210);

  // --- EDITORA ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 95, 40, 7);
    fill(255);
    textSize(20);
    text(`Editora`, 0, 1);
  }, -1794, 280);

  dibujarEdifiNom(() => {
    fill('#004aac');
    rect(0, 0, 130, 60, 7);
    fill(255);
    textSize(18);
    textLeading(10);
    text(`HISTÓRICO\n\nALA ESTE`, 0, 0);
  }, 100, 0);
  
  // --- SALIDA A --- 0000000000000000000000000000 HISTORICO ALA OESTE 0000000000000000000000000000
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -2045, 303);

  // --- SALIDA B ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -2443, 275);

  // --- SALIDA C ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -2796, 303);

  // --- SALIDA D ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -3170, 303);

  // --- SALIDA E NORTE ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -3725, 303);

   // --- SALIDA E SUR ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(salida, 0, 0, 30, 30);
  }, -3727, 568);

  dibujarEdifiNom(() => {
    fill('#004aac');
    rect(0, 0, 130, 60, 7);
    fill(255);
    textSize(18);
    textLeading(10);
    text(`HISTÓRICO\n\nALA OESTE`, 0, 0);
  }, -3000, 0);

  // --- ENCUENTRO --- 00000000000000000000000000000000000000 DARACT 1 000000000000000000000000
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(encuentro, 0, 0, 50, 50);
  }, -780, -1320);

  // --- ASCENSOR ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(ascensor, 0, 0, 50, 50);
  }, 335, -1305);

  // --- BEDELIA DARACT I ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 95, 40, 7);
    fill(255);
    textSize(20);
    text(`Bedelía`, 0, 1);
  }, 290, -1140);

  // --- BAÑOS 1 ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(banios, 0, 0, 50, 50);
  }, 200, -1182);

  // --- ACCESIBLE 1 ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(accesible, 0, 0, 30, 30);
  }, 243, -1188);

  // --- AULA 2 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 2`, 0, 0);
  }, 225, -1395);

  // --- AULA 4 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 4`, 0, 0);
  }, 120, -1455);

  // --- AULA 6 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 6`, 0, 0);
  }, 25, -1520);

  // --- AULA 8 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 100, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 8`, 0, 0);
  }, -80, -1582);

   // --- BAÑOS 2 ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(banios, 0, 0, 50, 50);
  }, -180, -1655);

  // --- ACCESIBLE 2 ---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(accesible, 0, 0, 30, 30);
  }, -159, -1594);

  // --- BIBLIOTECA RUIDOSA---
  dibujarCartelIcono(() => {
    imageMode(CENTER);
    image(biblioteca, 0, 0, 50, 50);
  }, -390, -1685);

  // --- BIBLIOTECA RUIDOSA ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 90, 50, 7);
    fill(255);
    textLeading(10);
    textSize(16);
    text(`Biblioteca\n\nRuidosa`, 0, 2);
  }, -390, -1630);

  // --- AULA 1/3 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 120, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 1/3`, 0, 0);
  }, 70, -1280);

  // --- AULA 5/7 ---
  dibujarCartelIcono(() => {
    fill('#004aac');
    rect(0, 0, 120, 50, 7);
    fill(255);
    textSize(24);
    text(`Aula 5/7`, 0, 0);
  }, -120, -1400);

  dibujarEdifiNom(() => {
    fill('#004aac');
    rect(0, 0, 130, 60, 7);
    fill(255);
    textSize(20);
    text(`DARACT 1`, 0, 0);
  }, 100, -1700);

  // --- ENCUENTRO --- 00000000000000000000000000000000000000 DORREGO 1 000000000000000000000000

  dibujarEdifiNom(() => {
    fill('#004aac');
    rect(0, 0, 140, 60, 7);
    fill(255);
    textSize(20);
    text(`DORREGO 1`, 0, 0);
  }, -3223, -1900);

  pop(); // Fin de la matriz principal del mapa

  // --- APLICAR RESTRICCIONES DE MOVIMIENTO (BOUNDS) ---
  aplicarRestriccionesMapa();

  // --- EVALUACIÓN DE ZONAS / EDIFICIOS ---
  indiceColorActual = 0; 
  for (let zona of ZONAS) {
    if (miLatitud <= zona.latNorte && miLatitud >= zona.latSur &&
        miLongitud >= zona.lonOeste && miLongitud <= zona.lonEste) {
      indiceColorActual = zona.indiceColor;
      break;
    }
  }

  // --- BORDE MARCADOR DE PANTALLA ---
  rectMode(CORNER);
  stroke(colorEdificio[indiceColorActual]);
  strokeWeight(10);
  noFill();
  rect(0, 0, width, height);

  // --- INTERFAZ ---
  dibujarInterfaz();
  dibujarPuntoClick(); //<---------------------------------------ESTA DIBUJA EL CARTEL CON LOS PIXELES
}

/**
 * Función para proyectar y dibujar un rectángulo basado en coordenadas GPS
 */
/*
function dibujarRectanguloGeo(latNorte, latSur, lonOeste, lonEste, colorRelleno, colorBorde) {
  // Convertir esquinas geograficas a pixeles de la imagen
  let xMin = map(lonOeste, MAPA_OESTE, MAPA_ESTE, 0, imgMapa.width, true);
  let xMax = map(lonEste, MAPA_OESTE, MAPA_ESTE, 0, imgMapa.width, true);
  let yMin = map(latNorte, MAPA_NORTE, MAPA_SUR, 0, imgMapa.height, true);
  let yMax = map(latSur, MAPA_NORTE, MAPA_SUR, 0, imgMapa.height, true);

  // Trasladar origen al centro del mapa (ya que la imagen se dibuja con imageMode(CENTER))
  let rectX = xMin - imgMapa.width / 2;
  let rectY = yMin - imgMapa.height / 2;
  let rectW = xMax - xMin;
  let rectH = yMax - yMin;

  // Dibujar rectángulo
  fill(colorRelleno);
  stroke(colorBorde);
  strokeWeight(2 / zoom); // Mantiene el grosor del borde legible independiente del zoom
  rect(rectX, rectY, rectW, rectH);
}*/

// Función para restringir que el mapa no salga completamente de la pantalla
function aplicarRestriccionesMapa() {
  if (imgMapa.width > 0 && imgMapa.height > 0) {
    // Calculamos el tamaño escalado del mapa en pantalla
    let mapaAnchoEscalado = imgMapa.width * zoom;
    let mapaAltoEscalado = imgMapa.height * zoom;

    // Margen de tolerancia para que al menos una parte del mapa quede visible
    let margenX = width * 0.75;
    let margenY = height * 0.75;

    let minX = -mapaAnchoEscalado / 2 - margenX;
    let maxX = width + mapaAnchoEscalado / 2 + margenX;
    let minY = -mapaAltoEscalado / 2 - margenY;
    let maxY = height + mapaAltoEscalado / 2 + margenY;

    panX = constrain(panX, minX, maxX);
    panY = constrain(panY, minY, maxY);
  }
}

// TEMPORAL: para probar la zona sin GPS y sin ubicar el teléfono, se usa el teclado.
// Presionar: 1 = HISTORICO ALA ESTE, 2 = DARACT 1, 3 = DARACT 2.
function keyPressed() {
  if (miLatitud !== 0 || miLongitud !== 0) return;

  if (key === '1') {
    zonaSimulada = 'HISTORICO ALA ESTE';
  } else if (key === '2') {
    zonaSimulada = 'DARACT 1';
  } else if (key === '3') {
    zonaSimulada = 'DARACT 2';
  }
}
// TEMPORAL: fin de prueba por teclado.

function actualizarPosicion(position) {
  miLatitud = position.coords.latitude;
  miLongitud = position.coords.longitude;

  if (imgMapa.width > 0 && imgMapa.height > 0) {
    posGpsMapa.x = map(miLongitud, MAPA_OESTE, MAPA_ESTE, 0, imgMapa.width, true);
    posGpsMapa.y = map(miLatitud, MAPA_NORTE, MAPA_SUR, 0, imgMapa.height, true);
  }
}

function touchMoved() {
  if (touches.length === 1) {
    // Un dedo: Arrastrar el mapa libremente (Pan)
    panX += movedX;
    panY += movedY;
  } else if (touches.length === 2) {
    // Dos dedos: Zoom (Pinch) y Rotación con pivote en el centro de la pantalla
    let distActual = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    
    if (distToqueInicial > 0) {
      let factor = distActual / distToqueInicial;
      let nuevoZoom = constrain(zoomInicial * factor, 0.2, 5.0);

      // El zoom se mantiene fluido haciendo zoom hacia el centro de la pantalla
      let centroX = width / 2;
      let centroY = height / 2;
      
      panX = centroX - (centroX - panX) * (nuevoZoom / zoom);
      panY = centroY - (centroY - panY) * (nuevoZoom / zoom);
      zoom = nuevoZoom;
    }

    // Calcular el nuevo ángulo y aplicar la rotación tomando el centro de la pantalla como eje
    let anguloActual = atan2(touches[1].y - touches[0].y, touches[1].x - touches[0].x);
    let deltaAngulo = anguloActual - anguloInicialToque;
    
    // Aplicamos el cambio de rotación
    anguloRotacion = rotacionInicial + deltaAngulo;
  }
  return false;
}

function touchStarted() {
  if (touches.length === 2) {
    distToqueInicial = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    zoomInicial = zoom;
    anguloInicialToque = atan2(touches[1].y - touches[0].y, touches[1].x - touches[0].x);
    rotacionInicial = anguloRotacion;
  }
}

// TEMPORAL: quitar esta funcion y la variable puntoClickMapa cuando ya no se necesiten.
function mousePressed() {
  const dx = mouseX - panX;
  const dy = mouseY - panY;
  const cosRotacion = cos(anguloRotacion);
  const sinRotacion = sin(anguloRotacion);

  puntoClickMapa = {
    x: (cosRotacion * dx + sinRotacion * dy) / zoom + imgMapa.width / 2,
    y: (-sinRotacion * dx + cosRotacion * dy) / zoom + imgMapa.height / 2
  };
}

function mouseDragged() {
  panX += movedX;
  panY += movedY;
  return false;
}

function mouseWheel(event) {
  let factorZoom = event.delta > 0 ? 0.9 : 1.1;
  let nuevoZoom = constrain(zoom * factorZoom, 0.2, 5.0);
  
  panX = mouseX - (mouseX - panX) * (nuevoZoom / zoom);
  panY = mouseY - (mouseY - panY) * (nuevoZoom / zoom);
  zoom = nuevoZoom;
  return false;
}

function dibujarInterfaz() {
  noStroke();
  fill('rgba(0, 75, 172, 0.75)');
  rect(10, 10, 140, 90, 8);

  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`Latitud: ${miLatitud.toFixed(6)}`, 20, 20);
  text(`Longitud: ${miLongitud.toFixed(6)}`, 20, 38);
  text(`Zoom: ${zoom.toFixed(2)}x`, 20, 56);
  text(`Rotación: ${degrees(anguloRotacion).toFixed(1)}°`, 20, 74);
}

// TEMPORAL: muestra las coordenadas del ultimo clic, separadas del panel GPS.
function dibujarPuntoClick() {
  if (!puntoClickMapa) return;

  const ancho = 230;
  const alto = 58;
  const margenDerecho = 10;
  const margenInferior = 80;
  const x = width - ancho - margenDerecho;
  const y = height - alto - margenInferior;

  noStroke();
  fill('#004aac');
  rect(x, y, ancho, alto, 8);

  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text('PUNTO CLICKEADO (px)', x + 12, y + 9);
  text(
    `X: ${puntoClickMapa.x.toFixed(1)}   Y: ${puntoClickMapa.y.toFixed(1)}`,
    x + 12,
    y + 32
  );
}

function errorGPS(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function windowResized() {
  const contenedor = document.getElementById('map-container');
  if (contenedor) {
    resizeCanvas(contenedor.clientWidth, contenedor.clientHeight);
  }
}