<script lang="ts">
	import IconoPapelera from "./IconoPapelera.svelte";

	type Props = {
		limpieza: () => void;
	};

	const { limpieza }: Props = $props();

	const exportarMaterias = (event: Event) => {
		event.preventDefault();
		limpieza();
	};
</script>

<button onclick={exportarMaterias}> <IconoPapelera /> Vaciar selección </button>

<style>
	button {
		display: flex;
		justify-content: center;
		gap: 2px;
		border-radius: 5px;
		padding: 2px;
		color: white;
		background-color: #800000;
	}
	button:hover {
		background-color: #e4e4e4;
		color: #800000;
	}
	button:active {
		opacity: 80%;
		transform: scale(0.95);
	}

	button:hover :global(svg) {
		fill: #800000;
	}
</style>
