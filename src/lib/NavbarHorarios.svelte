<script lang="ts">
	import BarraBusquedaMateria from "./BarraBusquedaMateria.svelte";
	import BotonExportarSeleccionDeMaterias from "./BotonExportarSeleccionDeMaterias.svelte";
	import BotonLimpiarSeleccionDeMaterias from "./BotonLimpiarSeleccionDeMaterias.svelte";
	import BotonSeleccionarTodasMaterias from "./BotonSeleccionarTodasMaterias.svelte";

	type Props = {
		limpieza: () => void;
	};

	const { limpieza }: Props = $props();
</script>

<td colspan="2">
	<div class="navbar">
		<div class="col">
			<BarraBusquedaMateria />
		</div>
		<div class="col">
			<BotonExportarSeleccionDeMaterias />
			<BotonLimpiarSeleccionDeMaterias {limpieza} />
			<BotonSeleccionarTodasMaterias />
		</div>
	</div>
</td>

<style>
	.col {
		display: flex;
		flex-direction: column;
		width: 20svw;
		gap: 2px;
	}
	.navbar {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
	}
</style>
