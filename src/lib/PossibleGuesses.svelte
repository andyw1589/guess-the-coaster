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

<h3>Autocomplete:</h3>
<ul>
    {#each possibleGuesses as guess (guess.id)}
        <li><button on:click={() => autocomplete(guess.fullName)}>{guess.fullName}</button></li>
    {/each}
</ul>
