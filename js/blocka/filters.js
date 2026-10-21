const colorCompartido = { r: 0, g: 0, b: 0 };

const EFECTOS_COLOR = {
	gris: (r, g, b) => {
		const prom = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
		colorCompartido.r = prom;
		colorCompartido.g = prom;
		colorCompartido.b = prom;
	},
	brillo: (r, g, b) => {
		colorCompartido.r = Math.min(255, Math.floor(r * .3));
		colorCompartido.g = Math.min(255, Math.floor(g * .3));
		colorCompartido.b = Math.min(255, Math.floor(b * .3));
	},
	negativo: (r, g, b) => {
		colorCompartido.r = 255 - r;
		colorCompartido.g = 255 - g;
		colorCompartido.b = 255 - b;
	},
	blur: (r, g, b, pixeles, indice, width, height) => {
		let sumaR = 0;
		let sumaG = 0;
		let sumaB = 0;
		let cantidad = 0;
		const x = (indice / 4) % width;
		const y = Math.floor(indice / 4 / width);

		//Cambie el desplazamiento para que se note mas
		for (let desplazamientoY = -4; desplazamientoY < 5; desplazamientoY++) {
			for (let desplazamientoX = -4; desplazamientoX < 5; desplazamientoX++) {
				const vecinoX = x + desplazamientoX;
				const vecinoY = y + desplazamientoY;

				if (vecinoX < 0 || vecinoX >= width || vecinoY < 0 || vecinoY >= height) continue;

				const indiceVecino = (vecinoX + vecinoY * width) * 4;
				sumaR += pixeles[indiceVecino];
				sumaG += pixeles[indiceVecino + 1];
				sumaB += pixeles[indiceVecino + 2];
				cantidad++;
			}
		}
		colorCompartido.r = Math.floor(sumaR / cantidad);
		colorCompartido.g = Math.floor(sumaG / cantidad);
		colorCompartido.b = Math.floor(sumaB / cantidad);
	}
};

//const ORDEN_EFECTOS = ['gris', 'negativo', 'brillo', 'blur'];
const ORDEN_EFECTOS = ['blur'];

function generarFiltros(efectos) {
	const filtros = [...efectos];

	for (let i = 0; i < efectos.length; i++) {
		for (let j = i + 1; j < efectos.length; j++) {
			filtros.push(`${efectos[i]}+${efectos[j]}`);
		}
	}

	return filtros;
}

const FILTROS_DISPONIBLES = generarFiltros(ORDEN_EFECTOS);

function crearAplicadorFiltro(filtro) {
	const efectos = (filtro || '')
		.split('+')
		.map(nombre => EFECTOS_COLOR[nombre])
		.filter(Boolean);

	return function aplicar(r, g, b, pixeles, indice, width, height) {
		let cr = r;
		let cg = g;
		let cb = b;

		for (const efecto of efectos) {
			efecto(cr, cg, cb, pixeles, indice, width, height);
			cr = colorCompartido.r;
			cg = colorCompartido.g;
			cb = colorCompartido.b;
		}

		return colorCompartido;
	};
}