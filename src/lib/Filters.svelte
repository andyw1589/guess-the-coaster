<script lang="ts">
    import { createEventDispatcher, type EventDispatcher } from "svelte";

    const dispatch: EventDispatcher<any> = createEventDispatcher();

    // filter options
    let filter: App.FilterConfig;
    let includeMountainCoasters: boolean = false;
    let allowedType: "Both" | "Wood" | "Steel" = "Both";

    $: filter = {
        includeMountainCoasters: includeMountainCoasters,
        allowedType: allowedType
    };

    function applyFilter() {
        dispatch("applyFilter", filter);
    }
</script>

<div id="filters" class="mb-2">
    <h3>Filters</h3>

    <label for="mtn-coasters">
        Include mountain coasters:
        <input type="checkbox" name="mtn-coasters" bind:value={includeMountainCoasters}>
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

    <button class="btn btn-primary" on:click={applyFilter}>Apply Filters</button>
</div>