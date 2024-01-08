<script lang="ts">
    import { onMount } from "svelte";
    import Coaster from "$lib/Coaster.svelte";
    import PossibleGuesses from "$lib/PossibleGuesses.svelte";

    const MIN_GUESS_LENGTH = 4; // minimum guess length for autocomplete to show up

    let doneGathering: boolean = false;
    let allCoasters: App.Coaster[] = [];
    let coasters: App.Coaster[] = [];
    let possibleGuesses: App.Coaster[];
    let coaster: App.Coaster | null;
    let errorMessage: string;
    let revealCurrent: boolean; // whether to reveal the current coaster
    let currentGuess: string = ""; // the player's current guess
    let feedback: string = ""; // whether you got a guess right or wrong (HTML STRING)

    // update possible guess autocomplete whenever user updates their guess in the input
    $: {
        if (
            coasters.length > 0 &&
            currentGuess.trim().length >= MIN_GUESS_LENGTH
        ) {
            possibleGuesses = coasters.filter(
                (coaster: App.Coaster): boolean => {
                    return coaster.fullName
                        .toLowerCase()
                        .includes(currentGuess.trim().toLowerCase());
                },
            );
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

            // <coasters> is all coasters initially, with full name filled out
            coasters = allCoasters.map((c: App.Coaster): App.Coaster => {
                return { ...c, fullName: `${c.name}, ${c.park.name}` };
            });
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
        console.log(coaster);
    }

    // submit guess, name AND park must match
    function submitGuess(): boolean {
        if (coaster === null) {
            return false;
        }

        let correct: string = coaster.fullName.toLowerCase();
        let guess: string = currentGuess.toLowerCase().trim();
        if (correct === guess) {
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

<div id="content-wrap">
    <header><h1>Guess that Coaster!</h1></header>

    <main>
        {#if errorMessage}
            <p style="color: red">{@html errorMessage}</p>
        {:else if coaster}
            <div class="d-flex flex-row gap-2">
                <div id="coaster-info" class="w-50 text-center">
                    <Coaster {coaster} reveal={revealCurrent} />
                </div>

                <div id="guess-field" class="w-50 d-flex flex-column">
                    {#if feedback.length > 0}
                        {@html feedback}
                    {/if}
                    <div>
                        <label for="coaster-name" hidden>Guess</label>
                        <input
                            type="text"
                            name="coaster-name"
                            bind:value={currentGuess}
                            placeholder="Guess here"
                            disabled={revealCurrent}
                        />
                        <button
                            on:click={submitGuess}
                            disabled={revealCurrent || currentGuess.length == 0}
                            >Guess</button
                        >
                        {#if !revealCurrent}
                            <button
                                on:click={() => {
                                    revealCurrent = true;
                                    currentGuess = "";
                                    feedback = "";
                                }}>Reveal</button
                            >
                        {:else}
                            <button on:click={chooseNewCoaster}>New</button>
                        {/if}

                        {#if possibleGuesses.length > 0 && !revealCurrent}
                            <PossibleGuesses
                                {possibleGuesses}
                                on:autocomplete={(e) => {
                                    currentGuess = e.detail.guess;
                                    feedback = "";
                                }}
                            />
                        {/if}
                    </div>
                </div>
            </div>
        {:else if !doneGathering}
            <p>gathering coasters...({allCoasters.length})</p>
        {:else}
            <p>loading...</p>
        {/if}
    </main>
    <div id="push"></div>
</div>

<footer id="footer" class="bg-light text-center text-secondary">
    Powered by <a
        class="text-dark"
        href="https://github.com/fabianrguez/rcdb-api"
        target="_blank">https://github.com/fabianrguez/rcdb-api</a
    >
</footer>

<style>
    #content-wrap {
        min-height: 100vh;
        height: auto !important;
        height: 100vh;
        margin: 0 auto -2rem;
    }

    #footer,
    #push {
        width: 100%;
        height: 2rem;
    }
</style>
