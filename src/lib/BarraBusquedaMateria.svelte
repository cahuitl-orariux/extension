<script lang="ts">
	import { buscarCoincidenciaAlgunSelector, SELECTOR_SAES } from "./Selectores";

	const tablaHorarios = buscarCoincidenciaAlgunSelector(
		SELECTOR_SAES.HORARIOS
	) as HTMLTableElement;
	const filas = tablaHorarios.rows;

	let filtro = "";

	const filtrarFilas = (
		filas: HTMLCollectionOf<HTMLTableRowElement>,
		filtro: string
	) => {
		let filasFiltradas = 0;
		for (const fila of filas) {
			if (filasFiltradas === 0) {
				// Omitir encabezado
				filasFiltradas++;
				continue;
			}

			const filaText = fila.innerText;
			if (filaText.toLowerCase().includes(filtro.toLowerCase())) {
				fila.style.display = "table-row";
			} else {
				fila.style.display = "none";
				filasFiltradas++;
			}
		}
	};

	onMount(async () => {
		filtro = (await chrome.storage.local.get("FILTRO")).FILTRO ?? "";
		if (filtro) {
			filtrarFilas(filas, filtro);
		}
	});
</script>

<div class="busqueda">
	<input
		oninput={(event) => {
			event.preventDefault();
			const target = event?.target as HTMLInputElement;
			chrome.storage.local.set({ FILTRO: filtro });

			if (!target) {
				return;
			}
			filtrarFilas(filas, filtro);
		}}
		bind:value={filtro}
		type="text"
		placeholder="Búsqueda"
	/>
	<button
		onclick={(event) => {
			event.preventDefault();
			filtro = "";
			chrome.storage.local.remove(["FILTRO"]);
			filtrarFilas(filas, filtro);
		}}>✖️</button
	>
</div>

<style>
	.busqueda {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 5px;
	}
	button {
		background-color: transparent;
	}
	button:hover {
		opacity: 90%;
	}
	button:active {
		opacity: 80%;
		transform: scale(0.95);
	}
</style>
