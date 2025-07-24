import {
	Clase,
	Materia,
	materiasFromDiccionario,
} from "kesos-ipnsaes-api/Materias";
import { MENSAJES as MSJ } from "@/lib/Mensajes";
import { DEFAULT_CONFIG, CONSTANTES, Config } from "@/lib/Config";
import { Temporal } from "@js-temporal/polyfill";

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
	dato: { materias: Materia[]; escuela: string; ciclo: string }
) => {
	if (!tab.id) {
		console.log("No se encontró la pestaña activa");
		return;
	}
	const respuesta = await chrome.tabs.sendMessage(tab.id, {
		tipo: MSJ.TODAS_MATERIAS_A_CAHUITL,
		dato: dato,
	});
	console.debug("Respuesta de todas las materias a generador:", respuesta);
};

const mensajeSeleccionACahuitl = async (
	tab: chrome.tabs.Tab,
	dato: { seleccionadas: Materia[] }
) => {
	if (!tab.id) {
		console.log("No se encontró la pestaña activa");
		return;
	}
	const respuesta = await chrome.tabs.sendMessage(tab.id, {
		tipo: MSJ.SELECCION_A_CAHUITL,
		dato: dato,
	});
	console.debug("Respuesta de seleccion a cahuitl:", respuesta);
};

const buscarPestanaCahuitl = async () => {
	return (
		await chrome.tabs.query({
			currentWindow: true,
			url: [
				CONSTANTES.URL_CAHUITL_ORARIUX + "*",
				(import.meta.env.URL_GENERADOR_DEV ?? CONSTANTES.URL_GENERADOR_DEV) +
					"*",
			],
		})
	)[0];
};
/**
 * Abre una pestaña de cahuitl-orariux dependiendo del entorno, en modo desarrollo se puede forzar a producción con la variable de entorno WXT_USE_PROD
 * @returns Pestaña de cahuitl-orariux
 */
const abrirPestanaCahuitl = async () => {
	return chrome.tabs.create({
		url:
			import.meta.env.DEV && !import.meta.env.WXT_USE_PROD
				? import.meta.env.WXT_URL_GENERADOR_DEV ?? CONSTANTES.URL_GENERADOR_DEV
				: CONSTANTES.URL_CAHUITL_ORARIUX,
		active: true,
	});
};

export default defineBackground(async () => {
	let CONFIG =
		((await chrome.storage.local.get("CONFIG")).CONFIG as Partial<Config>) ??
		DEFAULT_CONFIG;

	if (CONFIG.version !== DEFAULT_CONFIG.version) {
		console.debug("Actualizando configuración de la extensión");
		CONFIG = { ...DEFAULT_CONFIG, ...CONFIG };

		await chrome.storage.local.set({
			CONFIG: CONFIG,
		});
	}

	type HorariosExtraidos = {
		turnoIndex: number;
		periodoIndex: number;
		numeroTurnos: number;
		numeroPeriodos: number;
		materias: Materia[];
		enCurso: boolean;
		escuela: string;
		ciclo: string;
	};

	let extraccionHorarios: HorariosExtraidos = (
		await chrome.storage.local.get("EXTRACCION_HORARIOS")
	).EXTRACCION_HORARIOS ?? {
		turnoIndex: 0,
		periodoIndex: 0,
		numeroTurnos: 0,
		numeroPeriodos: 0,
		materias: [] as Materia[],
		enCurso: false,
		escuela: "",
		ciclo: "",
	};

	let materiasSeleccionadas: Materia[] =
		(await chrome.storage.local.get("MATERIAS_SELECCIONADAS"))
			.MATERIAS_SELECCIONADAS ?? [];

	chrome.runtime.onMessage.addListener(
		async (message, sender, sendResponse) => {
			if (sender?.tab?.id === undefined) {
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
					extraccionHorarios.escuela = message.dato.escuela;
					extraccionHorarios.ciclo =
						"Guardado: " + Temporal.Now.plainDateISO().toLocaleString();
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

						chrome.storage.local.set({
							EXTRACCION_HORARIOS: extraccionHorarios,
						});

						let tab = await buscarPestanaCahuitl();
						if (!tab?.id) {
							tab = await abrirPestanaCahuitl();
						} else {
							chrome.tabs.update(tab.id, { active: true });
							await mensajeTodasMateriasAGenerador(tab, {
								materias: extraccionHorarios.materias,
								escuela: extraccionHorarios.escuela,
								ciclo: extraccionHorarios.ciclo,
							});
						}
					}
					mensajeActualizarHorarios(
						sender.tab,
						extraccionHorarios.turnoIndex,
						extraccionHorarios.periodoIndex
					);
					break;
				}

				//* =======================================================================
				//* Inicio: Selección de materias
				//* =======================================================================
				case MSJ.MATERIA_SELECCIONADA: {
					const materiaSeleccionada = message.dato.seleccionada;
					const materia = message.dato.materia;

					// Borrar (y añadir) de la lista de materias seleccionadas
					materiasSeleccionadas = materiasSeleccionadas.filter(
						(m) => m.id === materia.id
					);

					extraccionHorarios.materias = extraccionHorarios.materias.filter(
						(m) => m.id === materia.id
					);
					if (materiaSeleccionada) {
						materiasSeleccionadas.push(materia);
						extraccionHorarios.materias.push(materia);
					}

					await chrome.storage.local.set({
						HORARIOS_EXTRAIDOS: extraccionHorarios.materias,
					});
					await chrome.storage.local.set({
						MATERIAS_SELECCIONADAS: materiasSeleccionadas,
					});

					if (CONFIG.SINCRONIZAR_SELECCION_CAHUITL) {
						let cahuitlTab = await buscarPestanaCahuitl();
						if (!cahuitlTab?.id) return;

						await mensajeSeleccionACahuitl(cahuitlTab, {
							seleccionadas: materiasSeleccionadas,
						});
						await mensajeTodasMateriasAGenerador(cahuitlTab, {
							materias: extraccionHorarios.materias,
							escuela: extraccionHorarios.escuela,
							ciclo: extraccionHorarios.ciclo,
						});
					}

					break;
				}
				case MSJ.SELECCION_A_CAHUITL: {
					let cahuitlTab = await buscarPestanaCahuitl();
					if (!cahuitlTab) cahuitlTab = await abrirPestanaCahuitl();
					if (!cahuitlTab?.id)
						throw new Error("No se encontró la pestaña de cahuitl-orariux");

					await mensajeTodasMateriasAGenerador(cahuitlTab, {
						materias: extraccionHorarios.materias,
						escuela: extraccionHorarios.escuela,
						ciclo: extraccionHorarios.ciclo,
					});
					await mensajeSeleccionACahuitl(cahuitlTab, {
						seleccionadas: materiasSeleccionadas,
					});

					chrome.tabs.update(cahuitlTab.id, { active: true });
					break;
				}
				case MSJ.LIMPIAR_MATERIAS_SELECCIONADAS: {
					extraccionHorarios.materias = [];
					extraccionHorarios.escuela = "";
					extraccionHorarios.ciclo = "";
					materiasSeleccionadas = [];
					await chrome.storage.local.set({
						HORARIOS_EXTRAIDOS: extraccionHorarios.materias,
					});
					await chrome.storage.local.set({
						MATERIAS_SELECCIONADAS: materiasSeleccionadas,
					});
					break;
				}
				// =======================================================================
				// Fin: Selección de materias
				// =======================================================================

				case MSJ.PAGINA_CAHUITL_ORARIUX_INIT: {
					if (
						!message.dato.autoimportarHorarios ||
						extraccionHorarios.materias.length === 0
					)
						return;

					await mensajeTodasMateriasAGenerador(sender.tab, {
						materias: extraccionHorarios.materias,
						escuela: extraccionHorarios.escuela,
						ciclo: extraccionHorarios.ciclo,
					});
				}
			}
		}
	);
});
