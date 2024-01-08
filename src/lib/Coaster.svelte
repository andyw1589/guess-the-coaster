<script lang="ts">
    export let coaster: App.Coaster;
    export let reveal: boolean;  // whether to reveal information

    // assume coaster has pictures
    $: pictureUrl = coaster.pictures[Math.floor(Math.random() * coaster.pictures.length)].url;
</script>

<img class="w-50 rounded" src={pictureUrl} alt={coaster.name} />
{#if reveal}
    <h3>{coaster.fullName}</h3>
{/if}