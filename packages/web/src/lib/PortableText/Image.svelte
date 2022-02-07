<script lang="ts">
    import type {BlockProps} from '@portabletext/svelte'
    import imageUrlBuilder from '@sanity/image-url'
    import client from '../../sanityClient'


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

    const builder = imageUrlBuilder(client)
    function urlFor(source) {
        return builder.image(source)
    }


    // TODO add caption 
    // TODO add render options, crop / size 
  </script>
  
  <figure>
    <img src={urlFor(block.asset).width(400).url()} alt={block.asset.originalFilename} />
  
    <!--<figcaption>{block.caption}</figcaption>-->
  </figure>