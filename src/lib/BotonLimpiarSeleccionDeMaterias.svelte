<script lang="ts">

        type Props = {
		limpieza: () => void;
	};

	const { limpieza }: Props = $props();

	const exportarMaterias = (event: Event) => {
		event.preventDefault();
		limpieza();
	};
</script>

<button onclick={exportarMaterias}>
	📤 Vaciar selección de materias
</button>
