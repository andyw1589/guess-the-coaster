<script lang="ts">
    import { createEventDispatcher, type EventDispatcher } from "svelte";

    const dispatch: EventDispatcher<any> = createEventDispatcher();

    // filter options
    let filter: App.FilterConfig;
    let includeMountainCoasters: boolean = false;
    let allowedType: "Both" | "Wood" | "Steel" = "Both";
    let operatingOnly: boolean = true;
    let minHeight: number = 100;

    $: filter = {
        includeMountainCoasters: includeMountainCoasters,
        allowedType: allowedType,
        operatingOnly: operatingOnly,
        minHeight: minHeight
    };

    function applyFilter() {
        dispatch("applyFilter", filter);
    }
</script>

<div id="filters" class="mb-3 d-flex flex-column">
    <h3>Filters</h3>

    <label for="mtn-coasters">
        Include mountain coasters:
        <input type="checkbox" name="mtn-coasters" bind:checked={includeMountainCoasters}>
    </label>

    <label for="operating-only">
        Operating coasters only:
        <input type="checkbox" name="operating-only" bind:checked={operatingOnly}>
    </label>

    <label for="min-height">
        Minimum height (feet):
        <input type="number" name="min-height" bind:value={minHeight}>
    </label>

    <div id="type-filters">
        <p>Filter by type:</p>
        {#each ["Both", "Wood", "Steel"] as type, i}
            <label for="type-{type}">
                <input
                    type="radio"
                    name="type-{type}"
                    value={type}
                    bind:group={allowedType}
                    checked="{i === 0}"
                >
                {type}
            </label>
        {/each}
    </div>

    <button class="btn btn-primary w-25" on:click={applyFilter}>Apply Filters</button>
</div>