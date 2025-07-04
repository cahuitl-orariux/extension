<script lang="ts">
	import { MENSAJES } from "./Mensajes";
	import { buscarCoincidenciaAlgunSelector, SELECTOR_SAES } from "./Selectores";

	const htmlSelectTurno = buscarCoincidenciaAlgunSelector(
		SELECTOR_SAES.TURNO
	) as HTMLSelectElement;
	const htmlSelectPeriodo = buscarCoincidenciaAlgunSelector(
		SELECTOR_SAES.PERIODO
	) as HTMLSelectElement;

	const numeroTurnos = htmlSelectTurno?.options.length;
	const numeroPeriodos = htmlSelectPeriodo?.options.length;

	const exportarMaterias = (event: Event) => {
		event.preventDefault();
		chrome.runtime.sendMessage({
			tipo: MENSAJES.INICIA_EXTRACCION_HORARIOS,
			dato: {
				numeroTurnos: numeroTurnos,
				numeroPeriodos: numeroPeriodos,
				escuela: window.location.hostname.split(".")[2],
			},
		});
	};
</script>

<button onclick={exportarMaterias}>
	📤 Exportar todas las materias de esta carrera
</button>
