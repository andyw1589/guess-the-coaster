<script lang="ts">
    import { createEventDispatcher, type EventDispatcher } from "svelte";

    export let possibleGuesses: App.Coaster[];

    const dispatch: EventDispatcher<any> = createEventDispatcher();

    // on click, put the name into the input field using event
    function autocomplete(name: string): void {
        dispatch("autocomplete", {
            name: name
        });
    }
</script>

<h3>Autocomplete:</h3>
<ul>
    {#each possibleGuesses as guess (guess.id)}
        <li><button on:click={() => autocomplete(guess.name)}>{guess.name}, {guess.park.name}</button></li>
    {/each}
</ul>
