<script lang="ts">
    export let possibleGuesses: App.Coaster[];
</script>

<h3>Autocomplete:</h3>
<ul>
    {#each possibleGuesses as guess (guess.id)}
        <li>{guess.name}, {guess.park.name}</li>
    {/each}
</ul>
