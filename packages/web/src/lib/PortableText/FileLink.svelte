<script lang="ts">
    import type {MarkProps} from '@portabletext/svelte'

    //import BoxArrowUpRight from 'svelte-bootstrap-icons/lib/BoxArrowUpRight'

    //import url from 'url'
  
    // Property custom marks receive from @portabletext/svelte when redered
    export let portableText: MarkProps<{
      href?: string
      asset?: object
      newWindow?: boolean
    }>
  
    $: mark = portableText.mark 
    $: newWindow = mark.newWindow || true

    //$: urlData = new URL(mark.href)

  </script>
  
  {#if mark.asset.url}

  <a href={mark.asset.url} title={mark.asset.originalFilename} rel="external" target={newWindow ? '_blank' : undefined}
    ><slot />
  </a>

  {:else}
    <slot />
  {/if}