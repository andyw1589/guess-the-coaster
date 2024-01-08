<script lang="ts">
    export let coaster: App.Coaster;
    export let reveal: boolean;  // whether to reveal information

    // assume coaster has pictures
    $: pictureUrl = coaster.pictures[Math.floor(Math.random() * coaster.pictures.length)].url;
</script>

<img class="img-fluid mx-auto rounded" src={pictureUrl} alt="A coaster that you need to guess." />
{#if reveal}
    <h3>{coaster.fullName}</h3>
{/if}
