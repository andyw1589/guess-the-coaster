<script lang="ts">
    export let coaster: App.Coaster;
    export let reveal: boolean;  // whether to reveal information

    // assume coaster has pictures
    $: pictureUrl = coaster.pictures[Math.floor(Math.random() * coaster.pictures.length)].url;
</script>

<img id="coaster-picture" class="center-block rounded" src={pictureUrl} alt="A coaster that you need to guess." />
{#if reveal}
    <h3>{coaster.fullName}</h3>
{/if}

<style>
    #coaster-picture {
        max-width: 100%;
        max-height: 80vh;
    }
</style>