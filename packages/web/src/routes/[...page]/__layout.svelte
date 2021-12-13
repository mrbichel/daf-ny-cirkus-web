<section id="page">
<div class="content">
    <slot></slot>
</div>
</section>

<style>
	section#page {
		position: absolute;
		top: 0;
        width: 100%;
		height: 100vh;
		background: #FCFCFC;
        overflow-y: scroll;
	}
    
    .content {
        padding: 2em;
	}
</style>
