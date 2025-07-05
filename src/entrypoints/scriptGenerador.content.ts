import { Config, CONSTANTES, DEFAULT_CONFIG } from "@/lib/Config";
import { MENSAJES } from "@/lib/Mensajes";

export default defineContentScript({
	matches: [CONSTANTES.URL_CAHUITL_ORARIUX + "*", "http://localhost/*"],
	main: async () => {
		const CONFIG: Config =
			(await chrome.storage.local.get("CONFIG")).CONFIG ?? DEFAULT_CONFIG;
		console.debug("Iniciando script de generador");

		window.addEventListener("message", (event) => {

			// Manejo de msj desde la página cahuitl-orariux para burbujearlo al background
			if (event.data.tipo === MENSAJES.PAGINA_CAHUITL_ORARIUX_INIT) {
				console.debug("Recibido mensaje de inicio de pagina cahuitl-orariux");
				console.debug(event.data.dato);
				chrome.runtime.sendMessage({
					tipo: MENSAJES.PAGINA_CAHUITL_ORARIUX_INIT,
					dato: {
						autoimportarHorarios: CONFIG.AUTOIMPORTAR_HORARIOS,
					},
				});
			}
		});

		chrome.runtime.onMessage.addListener(
			async (request, sender, sendResponse) => {
				if (request.tipo === MENSAJES.TODAS_MATERIAS_A_GENERADOR) {
					console.log("Recibido mensaje de todas las materias a generador");
					console.debug(request.dato);
					sendResponse({ dato: "Dato recibido: " + request.dato });

					window.postMessage({
						tipo: "TODAS_MATERIAS_A_GENERADOR",
						materias: request.dato.materias,
						escuela: request.dato.escuela + " (SAES)",
						cicloEscolar: request.dato.ciclo,
					});

					console.debug(
						"Respuesta de todas las materias a generador:",
						request
					);
				}
			}
		);
	},
});
