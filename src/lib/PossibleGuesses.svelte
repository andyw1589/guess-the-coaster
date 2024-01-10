<script lang="ts">
    import { createEventDispatcher, type EventDispatcher } from "svelte";

    export let possibleGuesses: App.Coaster[];

    const dispatch: EventDispatcher<any> = createEventDispatcher();

    // on click, put the guess into the input field using event
    function autocomplete(guess: string): void {
        dispatch("autocomplete", {
            guess: guess
        });
    }
</script>

<h3>Suggestions</h3>
<div id="autocomplete" class="d-flex flex-column mb-5">
    {#each possibleGuesses as guess (guess.id)}
        <button class="btn btn-light" on:click={() => autocomplete(guess.fullName)}>{guess.fullName}</button>
    {/each}
</div>

<style>
    #autocomplete {
        width: 100%;
        max-height: 50vh;
        overflow-y: scroll;
    }
</style>