import { CONFIG } from "@/lib/Config";
import { MENSAJES } from "@/lib/Mensajes";

export default defineContentScript({
	matches: [CONFIG.URL_CAHUITL_ORARIUX + "*", "http://localhost/*"],
	main: () => {
		console.debug("Iniciando script de generador");
		const btn = document.createElement("button");
		btn.textContent = "📥 Obtener Dato";
		btn.style.position = "fixed";
		btn.style.top = "10px";
		btn.style.left = "10px";
		btn.style.zIndex = "9999";
		btn.onclick = () => {
			chrome.runtime.sendMessage({ tipo: "SOLICITAR_DATO" }, (response) => {
				alert("Dato recibido: " + response?.dato);
			});
		};
		document.body.appendChild(btn);

		chrome.runtime.onMessage.addListener(
			async (request, sender, sendResponse) => {
				if (request.tipo === MENSAJES.TODAS_MATERIAS_A_GENERADOR) {
					console.log("Recibido mensaje de todas las materias a generador");
					console.debug(request.dato);
					sendResponse({ dato: "Dato recibido: " + request.dato });

					window.postMessage({
						tipo: "TODAS_MATERIAS_A_GENERADOR",
						materias: request.dato.materias,
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
