<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<main>
	{@render children()}
</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

	main {
		font-family: 'Roboto', sans-serif;
	}
</style>
