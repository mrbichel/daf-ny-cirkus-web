<script lang="ts">
    import type {MarkProps} from '@portabletext/svelte'
    import Phone from 'svelte-bootstrap-icons/lib/Phone'
    import Envelope from 'svelte-bootstrap-icons/lib/Envelope'
    import BoxArrowUpRight from 'svelte-bootstrap-icons/lib/BoxArrowUpRight'


    //import url from 'url'
  
    // Property custom marks receive from @portabletext/svelte when redered
    export let portableText: MarkProps<{
      href?: string
      newWindow?: boolean
    }>
  
    $: mark = portableText.mark 
    $: newWindow = mark.newWindow || true

    $: urlData = new URL(mark.href)

  </script>
  
  {#if mark.href}

  <a href={mark.href} rel="external" target={newWindow ? '_blank' : undefined}
    ><slot />
    {#if (urlData.protocol == 'tel:')}
    <Phone/>
    {/if}
    {#if (urlData.protocol == 'mailto:')}
    <Envelope/>
    {/if}
    {#if (['https:', 'http:'].includes(urlData.protocol))}
    <BoxArrowUpRight/>
    {/if}
  </a>



  {:else}
    <slot />
  {/if}