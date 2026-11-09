const catalogoLibros = [
  {
    id: 1,
    titulo: "Harry Potter y la Piedra Filosofal",
    autor: "J.K. Rowling",
    genero: "fantasia",
    tema: "theme-fantasia",
    precio: 55,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1547337425i/3636.jpg",
    resena: "El inicio de la saga mágica. Harry descubre en su undécimo cumpleaños que es un mago y es admitido en el Colegio Hogwarts."
  },
  {
    id: 2,
    titulo: "Harry Potter y el Prisionero de Azkaban",
    autor: "J.K. Rowling",
    genero: "fantasia",
    tema: "theme-fantasia",
    precio: 58,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1630547330i/5/5.jpg",
    resena: "Tercer año en Hogwarts marcado por la fuga del prisionero Sirius Black y la presencia de los aterradores Dementores."
  },
  {
    id: 3,
    titulo: "Heartless (El Corazón de la Reina)",
    autor: "Marissa Meyer",
    genero: "fantasia",
    tema: "theme-fantasia",
    precio: 50,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1456209802i/18586621.jpg",
    resena: "Precuela fantástica que narra la trágica historia de Catherine, la joven que soñaba con ser repostera antes de ser la Reina de Corazones."
  },
  {
    id: 4,
    titulo: "El Hobbit",
    autor: "J.R.R. Tolkien",
    genero: "fantasia",
    tema: "theme-fantasia",
    precio: 52,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg",
    resena: "La aventura del pacífico hobbit Bilbo Bolsón al unirse a trece enanos y al mago Gandalf para recuperar el tesoro del dragón Smaug."
  },
  {
    id: 5,
    titulo: "El Nombre del Viento",
    autor: "Patrick Rothfuss",
    genero: "fantasia",
    tema: "theme-fantasia",
    precio: 60,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1701314643i/186074.jpg",
    resena: "La historia de Kvothe, desde su infancia en una compañía de artistas itinerantes hasta convertirse en el mago más temido de su época."
  },
  {
    id: 6,
    titulo: "Los Juegos del Hambre",
    autor: "Suzanne Collins",
    genero: "fantasia",
    tema: "theme-fantasia",
    precio: 45,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722941i/2767052.jpg",
    resena: "En una nación postapocalíptica, Katniss Everdeen se ofrece voluntaria para ocupar el lugar de su hermana menor en un sádico torneo televisado."
  },

  {
    id: 7,
    titulo: "IT (Eso)",
    autor: "Stephen King",
    genero: "misterio",
    tema: "theme-misterio",
    precio: 65,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1334416842i/830502.jpg",
    resena: "La obra maestra del terror de Stephen King. Un grupo de amigos enfrenta a un mal ancestral encarnado en el payaso Pennywise en Derry."
  },
  {
    id: 8,
    titulo: "El Resplandor",
    autor: "Stephen King",
    genero: "misterio",
    tema: "theme-misterio",
    precio: 48,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1353277730i/11588.jpg",
    resena: "Jack Torrance acepta cuidar el aislado Hotel Overlook durante el invierno, donde fuerzas sobrenaturales lo arrastran a una violenta locura."
  },
  {
    id: 9,
    titulo: "El Visitante",
    autor: "Stephen King",
    genero: "misterio",
    tema: "theme-misterio",
    precio: 50,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1524596540i/36124936.jpg",
    resena: "El brutal asesinato de un niño apunta a un respetado ciudadano, pero las huellas y ADN demuestran que estuvo en dos sitios a la vez."
  },
  {
    id: 10,
    titulo: "El Retrato de Dorian Gray",
    autor: "Oscar Wilde",
    genero: "misterio",
    tema: "theme-misterio",
    precio: 39,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546103428i/5297.jpg",
    resena: "Novela gótica y filosófica. Dorian vende su alma para conservar la juventud perpetua mientras su óleo refleja sus pecados."
  },
  {
    id: 11,
    titulo: "Drácula",
    autor: "Bram Stoker",
    genero: "misterio",
    tema: "theme-misterio",
    precio: 42,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387151694i/17245.jpg",
    resena: "El clásico fundacional del vampirismo moderno contado a través de diarios y cartas sobre el conde transilvano y su llegada a Inglaterra."
  },
  {
    id: 12,
    titulo: "Estudio en Escarlata",
    autor: "Arthur Conan Doyle",
    genero: "misterio",
    tema: "theme-misterio",
    precio: 37,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1519031380i/102868.jpg",
    resena: "La primera investigación novelesca de Sherlock Holmes y el Dr. Watson resolviendo un enigmático crimen en el Londres victoriano."
  },

  {
    id: 13,
    titulo: "Crimen y Castigo",
    autor: "Fyodor Dostoevsky",
    genero: "psicologia",
    tema: "theme-psicologia",
    precio: 45,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1382846449i/7144.jpg",
    resena: "Explora los tormentos de la culpa moral, la justificación intelectual del delito y la redención de Raskólnikov en San Petersburgo."
  },
  {
    id: 14,
    titulo: "Noches Blancas",
    autor: "Fyodor Dostoevsky",
    genero: "psicologia",
    tema: "theme-psicologia",
    precio: 35,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1643905581i/1776326.jpg",
    resena: "Narración sentimental de cuatro noches de confidencias entre un joven soñador y solitario y la melancólica Nástenka."
  },
  {
    id: 15,
    titulo: "La Metamorfosis",
    autor: "Franz Kafka",
    genero: "psicologia",
    tema: "theme-psicologia",
    precio: 32,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1646443847i/485894.jpg",
    resena: "Gregorio Samsa despierta convertido en un insecto, simbolizando la alienación laboral y el rechazo del núcleo familiar."
  },
  {
    id: 16,
    titulo: "El Túnel",
    autor: "Ernesto Sábato",
    genero: "psicologia",
    tema: "theme-psicologia",
    precio: 38,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388344605i/157201.jpg",
    resena: "Confesión introspectiva del pintor Juan Pablo Castel, quien narra los celos obsesivos y motivos psicológicos que lo llevaron a asesinar a María Iribarne."
  },
  {
    id: 17,
    titulo: "El Hombre en Busca de Sentido",
    autor: "Viktor Frankl",
    genero: "psicologia",
    tema: "theme-psicologia",
    precio: 40,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535419394i/4069.jpg",
    resena: "Testimonio conmovedor de la supervivencia en campos de concentración nazis y el nacimiento de la logoterapia enfocada en el propósito vital."
  },

  {
    id: 18,
    titulo: "Orgullo y Prejuicio",
    autor: "Jane Austen",
    genero: "romance",
    tema: "theme-romance",
    precio: 40,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327998869i/1885.jpg",
    resena: "Obra maestra sobre las convenciones sociales y el amor maduro a través del tira y afloja entre Elizabeth Bennet y el señor Darcy."
  },
  {
    id: 19,
    titulo: "Jane Eyre",
    autor: "Charlotte Brontë",
    genero: "romance",
    tema: "theme-romance",
    precio: 44,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1557343311i/10210.jpg",
    resena: "La superación de una institutriz independiente y su apasionado romance con el complejo y atormentado señor Rochester."
  },
  {
    id: 20,
    titulo: "Cumbres Borrascosas",
    autor: "Emily Brontë",
    genero: "romance",
    tema: "theme-romance",
    precio: 41,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212715i/6185.jpg",
    resena: "Un intenso y oscuro relato de pasión obsesiva y venganza entre Heathcliff y Catherine Earnshaw en los páramos de Yorkshire."
  },
  {
    id: 21,
    titulo: "Sensatez y Sentimiento",
    autor: "Jane Austen",
    genero: "romance",
    tema: "theme-romance",
    precio: 39,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1397245688i/14935.jpg",
    resena: "Las vivencias sentimentales opuestas de las hermanas Dashwood: Elinor, guiada por la prudencia, y Marianne, dominada por la pasión."
  },
  {
    id: 22,
    titulo: "Romeo y Julieta",
    autor: "William Shakespeare",
    genero: "romance",
    tema: "theme-romance",
    precio: 34,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872146i/18135.jpg",
    resena: "La tragedia clásica por excelencia sobre dos jóvenes amantes cuyas muertes finalmente reconcilian a sus familias enemistadas en Verona."
  },

  {
    id: 23,
    titulo: "Norwegian Wood (Tokio Blues)",
    autor: "Haruki Murakami",
    genero: "realismo",
    tema: "theme-realismo",
    precio: 42,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1386924461i/11297.jpg",
    resena: "Nostálgico relato ambientado en el Tokio de los 60 sobre la juventud, el duelo, la música de los Beatles y la complejidad del amor."
  },
  {
    id: 24,
    titulo: "Cien Años de Soledad",
    autor: "Gabriel García Márquez",
    genero: "realismo",
    tema: "theme-realismo",
    precio: 48,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327881361i/13629.jpg",
    resena: "La monumental epopeya que relata el nacimiento, esplendor y olvido del pueblo mítico de Macondo a través de la estirpe Buendía."
  },
  {
    id: 25,
    titulo: "La Casa de los Espíritus",
    autor: "Isabel Allende",
    genero: "realismo",
    tema: "theme-realismo",
    precio: 46,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1585802528i/9328.jpg",
    resena: "Saga familiar de los Trueba en América Latina que entrelaza magistralmente los eventos políticos con fenómenos sobrenaturales y espíritus."
  },
  {
    id: 26,
    titulo: "Pedro Páramo",
    autor: "Juan Rulfo",
    genero: "realismo",
    tema: "theme-realismo",
    precio: 36,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388190055i/416378.jpg",
    resena: "Juan Preciado viaja al pueblo fantasmal de Comala en busca de su padre, encontrándose únicamente con ecos y voces de almas errantes."
  },
  {
    id: 27,
    titulo: "Kafka en la Orilla",
    autor: "Haruki Murakami",
    genero: "realismo",
    tema: "theme-realismo",
    precio: 45,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388566898i/4929.jpg",
    resena: "Las vidas paralelas de Kafka Tamura, un joven que huye de una maldición edípica, y Satoru Nakata, un anciano con la facultad de hablar con gatos."
  },

  {
    id: 28,
    titulo: "Diarios e Introspección",
    autor: "Alejandra Pizarnik",
    genero: "poesia",
    tema: "theme-poesia",
    precio: 38,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360010996i/17333342.jpg",
    resena: "Cuadernos poéticos íntimos que exploran el lenguaje, el aislamiento nocturno y el dolor existencial en la lírica argentina."
  },
  {
    id: 29,
    titulo: "Indigno de Ser Humano",
    autor: "Osamu Dazai",
    genero: "poesia",
    tema: "theme-poesia",
    precio: 36,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1422071370i/194746.jpg",
    resena: "Clásico contemporáneo japonés sobre la profunda alienación de Yozo y su incapacidad absoluta para integrarse en las normas sociales."
  },
  {
    id: 30,
    titulo: "La Campana de Cristal",
    autor: "Sylvia Plath",
    genero: "poesia",
    tema: "theme-poesia",
    precio: 41,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553592570i/6514.jpg",
    resena: "Relato autobiográfico sobre Esther Greenwood y su lucha con el ahogo de la depresión en la Nueva York de los años cincuenta."
  },
  {
    id: 31,
    titulo: "Poeta en Nueva York",
    autor: "Federico García Lorca",
    genero: "poesia",
    tema: "theme-poesia",
    precio: 35,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388673752i/107758.jpg",
    resena: "La voz poética surrealista de Lorca frente a la urbe moderna, la alienación social y la discriminación durante su estancia en EEUU."
  },
  {
    id: 32,
    titulo: "Hojas de Hierba",
    autor: "Walt Whitman",
    genero: "poesia",
    tema: "theme-poesia",
    precio: 40,
    img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1414430414i/27494.jpg",
    resena: "Canto a la individualidad, la naturaleza, la democracia y la comunión del alma humana con el universo en versos libres revolucionarios."
  }
];

let seleccionadosCount = 0;

function mostrarToast(titulo, mensaje) {
  const toast = $('#toast-alert');
  $('#toast-titulo').text(titulo);
  $('#toast-cuerpo').text(mensaje);
  toast.stop(true, true).removeClass('toast-hidden').fadeIn('fast').delay(2500).fadeOut('slow');
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarTarjetas(catalogoLibros);

  $('#menuHambBtn').click((e) => {
    e.stopPropagation();
    $('#mobileDropdownMenu').toggle();
  });

  $(document).click(() => {
    $('#mobileDropdownMenu').hide();
  });

  $('#btn-tema').click(() => {
    $('body').toggleClass('dark-mode light-mode');
    const esOscuro = $('body').hasClass('dark-mode');
    $('#btn-tema').html(esOscuro ? '🌙 Modo Noche' : '☀️ Modo Día');
    mostrarToast('TEMA', esOscuro ? 'Modo Noche Activado' : 'Modo Día Activado');
  });

  $('#inputBusquedaLibro').on('keyup', function() {
    const q = $(this).val().toLowerCase();
    const filtrados = catalogoLibros.filter(l => l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q));
    renderizarTarjetas(filtrados);
  });
});

function toggleHamb() {
  $('#mobileDropdownMenu').hide();
}

function filtrarPorGenero(genero, temaClase, btnElem) {
  $('.btn-genre').removeClass('active');
  $(btnElem).addClass('active');

  const esOscuro = $('body').hasClass('dark-mode');
  const esClaro = $('body').hasClass('light-mode');

  document.body.className = `${temaClase} ${esOscuro ? 'dark-mode' : ''} ${esClaro ? 'light-mode' : ''}`;

  if (genero === 'all') {
    renderizarTarjetas(catalogoLibros);
  } else {
    const res = catalogoLibros.filter(l => l.genero === genero);
    renderizarTarjetas(res);
  }
  mostrarToast('GÉNERO', `Atmósfera: ${genero.toUpperCase()}`);
}

function renderizarTarjetas(libros) {
  const container = $('#gridContenedorLibros');
  container.html('');

  if (libros.length === 0) {
    container.html('<p style="color:var(--text-sub); font-size:0.8rem;">No hay obras encontradas para este filtro.</p>');
    return;
  }

  libros.forEach(item => {
    container.append(`
      <div class="libro-card-item" onclick="mostrarFichaLibro(${item.id})">
        <img src="${item.img}" class="libro-cover-img" alt="${item.titulo}">
        <h4>${item.titulo}</h4>
        <p>${item.autor}</p>
        <div class="libro-price-tag">${item.precio} BOB</div>
      </div>
    `);
  });
}

function mostrarFichaLibro(id) {
  const libro = catalogoLibros.find(l => l.id === id);
  const panel = $('#panelDetalleLibro');

  panel.html(`
    <div class="ficha-activa-wrapper">
      <img src="${libro.img}" class="ficha-cover" alt="${libro.titulo}">
      <h3>${libro.titulo}</h3>
      <div class="ficha-autor">${libro.autor}</div>
      <p class="ficha-desc"><strong>Reseña Editorial:</strong><br>${libro.resena}</p>
      <div style="font-weight:bold; color:var(--accent); font-size:0.85rem; text-align:center;">Precio: ${libro.precio} BOB</div>
      <button class="btn-select-book" onclick="marcarLibroSeleccionado('${libro.titulo}')">Añadir al Carrito</button>
    </div>
  `);
  mostrarToast('LECTURA', `Ficha de "${libro.titulo}" abierta`);
}

function marcarLibroSeleccionado(titulo) {
  seleccionadosCount++;
  $('#navItemCount').text(seleccionadosCount);
  mostrarToast('CARRITO', `"${titulo}" añadido a tu orden.`);
}