<script lang='ts'>
    import {runOAuth2Process} from "./oauth"
    import {onMount, createEventDispatcher} from "svelte"

    const dispatch = createEventDispatcher()

    export let scopes = []
    export let authentication = runOAuth2Process(scopes)

    let authenticated = false

    onMount(() => {
        if (typeof authentication === "undefined") {
            authentication = runOAuth2Process(scopes)
        }
    })
    const authOk = (v) => {
        authenticated = true
        return ''
    }
    $: if (authenticated) { dispatch("authenticated", {})}
</script>

{#await authentication}
    <slot name="loading">
        <progress />
    </slot>
{:then ok}
    {authOk(ok)}
    <slot />
{:catch error}
    <slot name="error" {error}>
        {error.name}: {error.message}
    </slot>
{/await}