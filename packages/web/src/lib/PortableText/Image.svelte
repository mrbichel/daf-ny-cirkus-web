<script lang="ts">
    import type {BlockProps} from '@portabletext/svelte'

    export let portableText: BlockProps<{
      asset: {
        extension: string
        url: string
        originalFilename: string
        aspectRatio: number
      }
      caption: string
    }>
    $: block = portableText.block


    // TODO add caption 
    // TODO add render options, crop / size 
  </script>
  
  <figure>
    <img src={block.asset.url} alt={block.asset.originalFilename} />
  
    <!--<figcaption>{block.caption}</figcaption>-->
  </figure>