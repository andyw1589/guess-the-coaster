<script lang="ts">
    import { onMount } from "svelte";
    import Coaster from "$lib/Coaster.svelte";

    let doneGathering: boolean = false;
    let allCoasters: App.Coaster[] = [];
    let coasters: App.Coaster[];
    let coaster: App.Coaster | null;
    let errorMessage: string;
    let revealCurrent: boolean; // whether to reveal the current coaster

    // on mount, assign to <allCoasters> the initial list of coasters, subject to a few restraints
    onMount(() => {
        (async () => {
            // do it in increments
            for (let i: number = 0; i <= 6; i++) {
                let response = await fetch(
                    "https://rcdb-api.vercel.app/api/coasters/?" +
                        new URLSearchParams({
                            offset: String(i * 2000),
                            limit: "2000",
                        }),
                    {
                        method: "GET",
                    },
                );

                if (response.ok) {
                    let json = await response.json();
                    let currList: App.Coaster[] = json.data.filter(
                        (coaster: App.Coaster) => {
                            // make sure the coasters have a picture and aren't unknown
                            if (
                                coaster.pictures.length === 0 ||
                                coaster.name.toLowerCase().includes("unknown")
                            ) {
                                return false;
                            }

                            return true;
                        },
                    );

                    allCoasters = [...allCoasters, ...currList];
                } else {
                    errorMessage = await response.text();
                    return;
                }
            }

            doneGathering = true;
            coasters = allCoasters; // coasters is all coasters initially
            chooseNewCoaster();
        })();

        return () => console.log("destroyed");
    });

    // assign to <coasters> the updated, filtered list of coasters
    function updateCoasterList(): void {
        coaster = null;
        coasters = allCoasters.filter((coaster: App.Coaster) => {
            // TODO: filter based on country, type, status, mountain coaster or not
            return true;
        });
        chooseNewCoaster();
    }

    // choose a new coaster
    function chooseNewCoaster(): void {
        revealCurrent = false;
        coaster = coasters[Math.floor(Math.random() * coasters.length)];
        console.log(coaster);
    }

    // $: console.log(coasters);
    // $: errorMessage;
</script>

<h1>Guess that Coaster!</h1>

{#if errorMessage}
    <p style="color: red">{@html errorMessage}</p>
{:else if coaster}
    <div class="d-flex flex-column gap-2 w-50">
        <button class="w-25" on:click={chooseNewCoaster}>New</button>
        <Coaster {coaster} reveal={revealCurrent} />

        {#if !revealCurrent}
            <button class="w-25" on:click={() => (revealCurrent = true)}>Reveal</button>
        {/if}
    </div>
{:else if !doneGathering}
    <p>gathering coasters...({allCoasters.length})</p>
{:else}
    <p>loading...</p>
{/if}
