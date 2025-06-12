import {
	Clase,
	Materia,
	materiasFromDiccionario,
} from "kesos-ipnsaes-api/Materias";
import { MENSAJES as MSJ } from "@/lib/Mensajes";
import { CONFIG } from "@/lib/Config";

const mensajeExtraccionHorarios = async (
	tab: chrome.tabs.Tab,
	turnoIndex: number,
	periodoIndex: number
) => {
	if (!tab.id) {
		console.log("No se encontró la pestaña activa");
		return;
	}
	chrome.tabs.sendMessage(tab.id, {
		tipo: MSJ.EXTRAER_HORARIOS,
		dato: {
			turnoIndex: turnoIndex,
			periodoIndex: periodoIndex,
		},
	});
};

const mensajeActualizarHorarios = (
	tab: chrome.tabs.Tab,
	turnoIndex: number,
	periodoIndex: number
) => {
	if (!tab.id) {
		console.log("No se encontró la pestaña activa");
		return;
	}
	chrome.tabs.sendMessage(tab.id, {
		tipo: MSJ.ACTUALIZAR_HORARIOS,
		dato: {
			turnoIndex: turnoIndex,
			periodoIndex: periodoIndex,
		},
	});
};

const mensajeTodasMateriasAGenerador = async (
	tab: chrome.tabs.Tab,
	materias: Materia[]
) => {
	if (!tab.id) {
		console.log("No se encontró la pestaña activa");
		return;
	}
	const respuesta = await chrome.tabs.sendMessage(tab.id, {
		tipo: MSJ.TODAS_MATERIAS_A_GENERADOR,
		dato: {
			materias,
		},
	});
	console.debug("Respuesta de todas las materias a generador:", respuesta);
};

export default defineBackground(async () => {
	let extraccionHorarios = {
		turnoIndex: 0,
		periodoIndex: 0,
		numeroTurnos: 0,
		numeroPeriodos: 0,
		materias: [] as Materia[],
		enCurso: false,
	};

	let materiasSeleccionadas: Materia[] =
		(await chrome.storage.local.get("MATERIAS_SELECCIONADAS"))
			.MATERIAS_SELECCIONADAS ?? [];

	chrome.runtime.onMessage.addListener(
		async (message, sender, sendResponse) => {
			if (sender?.tab === undefined) {
				console.log("No se encontró la pestaña activa");
				return;
			}

			switch (message.tipo) {
				case MSJ.INICIA_EXTRACCION_HORARIOS: {
					extraccionHorarios.turnoIndex = 0;
					extraccionHorarios.periodoIndex = 0;
					extraccionHorarios.materias = [];
					extraccionHorarios.numeroTurnos = message.dato.numeroTurnos;
					extraccionHorarios.numeroPeriodos = message.dato.numeroPeriodos;
					extraccionHorarios.enCurso = true;
					mensajeActualizarHorarios(sender.tab, 0, 0);
					break;
				}
				case MSJ.PAGINA_HORARIOS_INIT: {
					sendResponse({ materiasSeleccionadas });
					if (extraccionHorarios.enCurso) {
						mensajeExtraccionHorarios(
							sender.tab,
							extraccionHorarios.turnoIndex,
							extraccionHorarios.periodoIndex
						);
					}
					break;
				}
				case MSJ.ENVIAR_HORARIOS: {
					console.debug(
						"Turno:",
						extraccionHorarios.turnoIndex,
						"Periodo:",
						extraccionHorarios.periodoIndex
					);
					console.debug("Horarios recibidos:", message.dato.horarios);

					message.dato.horarios = materiasFromDiccionario(
						message.dato.horarios
					);

					message.dato.horarios = (message.dato.horarios as Materia[]).filter(
						(materia) => {
							return !extraccionHorarios.materias.some(
								(m) => m.id === materia.id
							); // Si ya existe, no añadir
						}
					);

					console.debug("Horarios añadidos:", message.dato.horarios);

					extraccionHorarios.materias.push(
						...(message.dato.horarios as Materia[])
					);

					await chrome.storage.local.set({
						HORARIOS_EXTRAIDOS: extraccionHorarios.materias,
					});

					if (
						++extraccionHorarios.periodoIndex <
						extraccionHorarios.numeroPeriodos
					) {
					} else if (
						++extraccionHorarios.turnoIndex < extraccionHorarios.numeroTurnos
					) {
						extraccionHorarios.periodoIndex = 0;
					} else {
						extraccionHorarios.turnoIndex = 0;
						extraccionHorarios.periodoIndex = 0;
						extraccionHorarios.enCurso = false;
						console.log("Se ha finalizado la extracción de horarios");
						console.debug(extraccionHorarios);
						console.info(import.meta.env.WXT_URL_GENERADOR_DEV);
						let tab = (
							await chrome.tabs.query({
								currentWindow: true,
								url: [
									CONFIG.URL_CAHUITL_ORARIUX + "*",
									(import.meta.env.URL_GENERADOR_DEV ??
										CONFIG.URL_GENERADOR_DEV) + "*",
								],
							})
						)[0];
						if (!tab?.id) {
							tab = await chrome.tabs.create({
								url: import.meta.env.DEV
									? import.meta.env.WXT_URL_GENERADOR_DEV ??
									  CONFIG.URL_GENERADOR_DEV
									: CONFIG.URL_CAHUITL_ORARIUX,
							});
						} else {
							chrome.tabs.update(tab.id, { active: true });
						}

						// TODO: Evaluar si extraer esto a otro mensaje, que el script de generador pueda llamar después de terminar de cargar la página y que acá se evalúe si es necesario enviar algún mensaje
						await new Promise((resolve) => setTimeout(resolve, 2000));

						await mensajeTodasMateriasAGenerador(
							tab,
							extraccionHorarios.materias
						);
					}
					mensajeActualizarHorarios(
						sender.tab,
						extraccionHorarios.turnoIndex,
						extraccionHorarios.periodoIndex
					);
					break;
				}

				case MSJ.MATERIA_SELECCIONADA: {
					const materiaSeleccionada = message.dato.seleccionada;
					const materia = message.dato.materia;

					if (materiaSeleccionada) {
						materiasSeleccionadas.push(materia);
					} else {
						materiasSeleccionadas = materiasSeleccionadas.filter(
							(m) => m.id !== materia.id
						);
					}

					await chrome.storage.local.set({
						MATERIAS_SELECCIONADAS: materiasSeleccionadas,
					});
					break;
				}
				case MSJ.LIMPIAR_MATERIAS_SELECCIONADAS: {
					materiasSeleccionadas = [];
					await chrome.storage.local.set({
						MATERIAS_SELECCIONADAS: materiasSeleccionadas,
					});
					break;
				}
			}
		}
	);
});
