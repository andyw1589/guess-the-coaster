<script lang="ts">
    import { onMount } from "svelte";
    import Coaster from "$lib/Coaster.svelte";
    import PossibleGuesses from "$lib/PossibleGuesses.svelte";

    const MIN_GUESS_LENGTH = 4;  // minimum guess length for autocomplete to show up

    let doneGathering: boolean = false;
    let allCoasters: App.Coaster[] = [];
    let coasters: App.Coaster[] = [];
    let possibleGuesses: App.Coaster[];
    let coaster: App.Coaster | null;
    let errorMessage: string;
    let revealCurrent: boolean;  // whether to reveal the current coaster
    let currentGuess: string = "";  // the player's current guess
    let feedback: string = "";  // whether you got a guess right or wrong (HTML STRING)

    // update possible guess autocomplete whenever user updates their guess in the input
    $: {
        if ((coasters.length > 0) && (currentGuess.trim().length >= MIN_GUESS_LENGTH)) {
            possibleGuesses = coasters.filter((coaster: App.Coaster): boolean => {
                return coaster.name.toLowerCase().includes(currentGuess.trim().toLowerCase());
            });
        } else {
            possibleGuesses = [];
        }
    }

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
                        (coaster: App.Coaster): boolean => {
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
        coasters = allCoasters.filter((coaster: App.Coaster): boolean => {
            // TODO: filter based on country, type, status, mountain coaster or not
            return true;
        });
        chooseNewCoaster();
    }

    // choose a new coaster
    function chooseNewCoaster(): void {
        revealCurrent = false;
        currentGuess = "";
        feedback = "";
        coaster = coasters[Math.floor(Math.random() * coasters.length)];
        //console.log(coaster);
    }

    // submit guess (check if <coaster.name> == <currentGuess>); verification works by checking name equality, not park
    function submitGuess(): boolean {
        if (coaster === null) {
            return false;
        }

        if (coaster.name.toLowerCase() === currentGuess.toLowerCase().trim()) {
            revealCurrent = true;
            currentGuess = "";
            feedback = `<p style="color: green">Correct!</p>`;
            return true;
        }

        currentGuess = "";
        feedback = `<p style="color: red">Try again!</p>`;
        return false;
    }

    // $: console.log(coasters);
    // $: errorMessage;
</script>

<h1>Guess that Coaster!</h1>

{#if errorMessage}
    <p style="color: red">{@html errorMessage}</p>
{:else if coaster}
    <div class="d-flex flex-column gap-2 w-50">
        <Coaster {coaster} reveal={revealCurrent} />

        {#if feedback.length > 0}
            {@html feedback}
        {/if}

        <div>
            <label for="coaster-name" hidden>Guess</label>
            <input type="text" name="coaster-name" bind:value={currentGuess} placeholder="Guess here" disabled={revealCurrent}>
            <button on:click={submitGuess} disabled={revealCurrent || (currentGuess.length == 0)}>Guess</button>
            {#if !revealCurrent}
                <button on:click={() => { 
                        revealCurrent = true;
                        currentGuess = "";
                        feedback = "";
                    }
                }>Reveal</button>
            {:else}
                <button on:click={chooseNewCoaster}>New</button>
            {/if}

            {#if (possibleGuesses.length > 0) && (!revealCurrent)}
                <PossibleGuesses {possibleGuesses} />
            {/if}
        </div>
    </div>
{:else if !doneGathering}
    <p>gathering coasters...({allCoasters.length})</p>
{:else}
    <p>loading...</p>
{/if}
