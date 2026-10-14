
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
	}
};

const ORDEN_EFECTOS = ['gris', 'negativo', 'brillo'];

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

	return function aplicar(r, g, b) {
		let cr = r;
		let cg = g;
		let cb = b;

		for (const efecto of efectos) {
			efecto(cr, cg, cb);
			cr = colorCompartido.r;
			cg = colorCompartido.g;
			cb = colorCompartido.b;
		}

		return colorCompartido;
	};
}