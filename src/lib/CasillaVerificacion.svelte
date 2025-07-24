<script lang="ts">
	import { Materia } from "kesos-ipnsaes-api/Materias";
	import { MENSAJES } from "./Mensajes";

	type Props = {
		id: string;
		materiaSeleccionada: boolean;
		materia: Materia;
	};

	let { id, materiaSeleccionada = false, materia }: Props = $props();
</script>

<input
	type="checkbox"
	class="checkbox"
	id = {"checkbox-" + id}
	bind:checked={materiaSeleccionada}
	onchange={async () => {
		console.debug(
			`Cambio de selección de materia ${id} a ${materiaSeleccionada}`
		);
		const respuesta = await chrome.runtime.sendMessage({
			tipo: MENSAJES.MATERIA_SELECCIONADA,
			dato: {
				id: id,
				seleccionada: materiaSeleccionada,
				materia: materia,
			},
		});

                console.debug(`Respuesta: ${JSON.stringify(respuesta)}`);
	}}
/>
