<script lang="ts">
	import IconoExportar from "./IconoExportar.svelte";
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
	<IconoExportar /> Exportar todas las materias de esta carrera
</button>

<style>
	button {
		border-radius: 5px;
		padding: 2px;
		background-color: #e4e4e4;
	}
	button:hover {
		background-color: #e4e4e4;
		color: #800000;
	}
	button:active {
		opacity: 80%;
		transform: scale(0.95);
	}
</style>
