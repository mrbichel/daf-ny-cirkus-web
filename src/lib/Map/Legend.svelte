
<script lang="ts">
    export let data = {}

</script>


<aside>
    <ul>
        {#each Object.keys(data) as t}
          <li class="{t}">{data[t].title}</li>
        {/each}
    </ul>
</aside>


<style lang="scss">
    @import 'src/lib/style/variables.scss';
  
    aside {
      position: absolute;
      right: 1em;
      top: 2em;
      pointer-events: all;
  
      @each $class, $color in $locColorMap {
        li.#{$class} {
          color: $color;
        }
      }
    }
    </style>