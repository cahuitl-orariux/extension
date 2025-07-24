<script lang="ts">
	import IconoExportar from "./IconoExportar.svelte";
	import { MENSAJES as MSJS } from "./Mensajes";

	const exportarMaterias = (event: Event) => {
		event.preventDefault();
		chrome.runtime.sendMessage({
			tipo: MSJS.SELECCION_A_CAHUITL,
		});
	};
</script>

<button onclick={exportarMaterias}>
	<IconoExportar /> Exportar selección</button
>

<style>
	button {
		display: flex;
		justify-content: center;
		gap: 2px;
		border-radius: 5px;
		padding: 2px;
		background-color: #ff9900;
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
