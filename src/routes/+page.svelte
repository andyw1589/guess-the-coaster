<script lang="ts">
    import { onMount } from "svelte";
    import Coaster from "$lib/Coaster.svelte";
    import PossibleGuesses from "$lib/PossibleGuesses.svelte";
    import Filters from "$lib/Filters.svelte";

    const MIN_GUESS_LENGTH: number = 4; // minimum guess length for autocomplete to show up
    const DEFAULT_FILTER: App.FilterConfig = {
        includeMountainCoasters: false,
        allowedType: "Both",
        operatingOnly: true,
        minHeight: 100, // 0 = any height, even unknown
        canadaUSOnly: true
    };

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
            possibleGuesses = allCoasters.filter(
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
                            // make sure the coasters have a picture, aren't unknown, have a model
                            if (
                                coaster.pictures.length === 0 ||
                                coaster.name.toLowerCase().startsWith("unknown") ||
                                coaster.model === ""
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

            // add fullName property to all coasters
            allCoasters = allCoasters.map((c: App.Coaster): App.Coaster => {
                return { ...c, fullName: `${c.name}, ${c.park.name}` };
            });
            updateCoasterList(DEFAULT_FILTER);
            chooseNewCoaster();
        })();

        return () => console.log("destroyed");
    });

    // assign to <coasters> the updated, filtered list of coasters
    function updateCoasterList(filter: App.FilterConfig): void {
        coasters = allCoasters.filter((coaster: App.Coaster): boolean => {
            // TODO: filter based on country, type, status, mountain coaster or not
            // Include/exclude mountain coasters
            if (
                !filter.includeMountainCoasters &&
                (coaster.model === "Alpine Coaster" ||
                    coaster.model === "Mountain Coaster" ||
                    coaster.name.includes("Mountain Coaster"))
            ) {
                return false;
            }

            // Filter by wood or steel, only if filter is non-empty
            if (
                filter.allowedType !== "Both" &&
                filter.allowedType !== coaster.type
            ) {
                return false;
            }

            // Filter by operating
            if (filter.operatingOnly && coaster.status.state !== "Operating") {
                return false;
            }

            // Filter by min height, exclude coasters with no height recorded
            // Height is stored in metres, so convert from feet
            // Also, height might be an array
            // If no height, it might be in key ΔElevation
            let heightCheck: string = coaster.stats.height
                ? Array.isArray(coaster.stats.height)
                    ? coaster.stats.height[0]
                    : coaster.stats.height
                : coaster.stats["ΔElevation"];

            if (
                filter.minHeight > 0 &&
                (!heightCheck ||
                    Number(heightCheck) < filter.minHeight * 0.3048)
            ) {
                return false;
            }

            // Filter by country, if Canada/US only is checked
            if (filter.canadaUSOnly && coaster.country !== "United States" && coaster.country !== "Canada") {
                return false;
            }

            return true;
        });
        feedback = `<p style="color: green">Filter applied!</p>`;
        console.log(filter);
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

        feedback = `<p style="color: red">Try again!</p>`;
        return false;
    }

    // $: console.log(coasters);
    // $: errorMessage;
</script>

<div id="content-wrap">
    <header class="my-4 text-center"><h1>Guess that Coaster!</h1></header>

    <main>
        {#if errorMessage}
            <p class="text-center" style="color: red">{@html errorMessage}</p>
        {:else if !doneGathering}
            <p class="text-center">gathering coasters...({allCoasters.length})</p>
            <div class="spinner-border mx-auto" style="display:block" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        {:else}
            <div id="game-container">
                <div id="coaster-info" class="text-center">
                    {#if coaster}
                        <Coaster {coaster} reveal={revealCurrent} />
                    {:else}
                        <p>No coaster was found :c</p>
                    {/if}
                </div>

                <div id="guess-field" class="d-flex flex-column">
                    {#if feedback.length > 0}
                        {@html feedback}
                    {/if}

                    <Filters
                        on:applyFilter={(e) => updateCoasterList(e.detail)}
                    />

                    <div class="d-flex flex-row gap-2 mb-2">
                        <label for="coaster-name" hidden>Guess</label>
                        <input
                            type="text"
                            name="coaster-name"
                            class="w-50"
                            bind:value={currentGuess}
                            placeholder="Guess here"
                            disabled={revealCurrent || !coaster}
                            autocomplete="off"
                        />
                        <button
                            class="btn btn-primary"
                            on:click={submitGuess}
                            disabled={revealCurrent || currentGuess.length == 0}
                            >Guess</button
                        >
                        {#if !revealCurrent && coaster}
                            <button
                                class="btn btn-danger"
                                on:click={() => {
                                    revealCurrent = true;
                                    currentGuess = "";
                                    feedback = "";
                                }}>Reveal</button
                            >
                        {:else}
                            <button
                                class="btn btn-primary"
                                on:click={chooseNewCoaster}>New</button
                            >
                        {/if}
                    </div>

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
        {/if}
    </main>
    <div id="push"></div>
</div>

<footer id="footer" class="bg-light text-center text-secondary">
    Powered by&nbsp;<a
        class="text-dark"
        href="https://github.com/fabianrguez/rcdb-api"
        target="_blank">https://github.com/fabianrguez/rcdb-api</a
    >
</footer>

<style>
    #content-wrap {
        min-height: 100vh;
        height: auto !important;
        margin-bottom: -2.5rem;
    }

    #game-container {
        display: flex;
        flex-direction: row;
        align-content: space-evenly;
        gap: 1rem;
    }

    #coaster-info,
    #guess-field {
        width: 50%;
    }

    #footer,
    #push {
        width: 100%;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @media screen and (max-width: 800px) {
        #game-container {
            flex-direction: column;
        }

        #coaster-info,
        #guess-field {
            width: 100%;
        }

        #guess-field {
            align-items: center;
        }

        #guess-field {
            width: 100%;
        }

        #guess-field > div {
            width: 100%;
            justify-content: center;
        }
    }
</style>
