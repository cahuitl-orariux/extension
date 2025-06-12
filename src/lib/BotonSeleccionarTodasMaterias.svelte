<script lang="ts">
	import { Materia } from "kesos-ipnsaes-api/Materias";
	import { MENSAJES } from "./Mensajes";
	import { SELECTOR_SAES } from "./Selectores";

	type Props = {
		horariosExtraidos: Materia[];
	};

	const { horariosExtraidos }: Props = $props();

	const htmlSelectTurno = document.querySelector(
		SELECTOR_SAES.TURNO
	) as HTMLSelectElement;
	const htmlSelectPeriodo = document.querySelector(
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
			},
		});
	};
</script>

<button onclick={exportarMaterias}>
	📤 Exportar todas las materias de esta carrera
</button>
