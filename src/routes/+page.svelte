<script lang="ts">
    import { onMount } from "svelte";

    let coasters: App.Coaster[];

    onMount(() => {
        // get random offset between 0 and 11, multiply by 1000
        let offset: number = Math.round(Math.random() * 11) * 1000;
        fetch("https://rcdb-api.vercel.app/api/coasters/?" + new URLSearchParams({
                offset: String(offset)
            }), 
            {
                method: 'GET'
            }
        ).then(response => {
            response.json()
            .then(json => coasters = json.data)
            .catch(error => console.log(error.message));
        });
    });

    $: console.log(coasters);
</script>

<h1>Guess that Coaster!</h1>

{#if coasters}
    <ul>
        {#each coasters as coaster (coaster.id)}
            <li>{ coaster.name } at { coaster.park.name }</li>
        {/each}
    </ul>
{:else}
    <p>loading...</p>
{/if}