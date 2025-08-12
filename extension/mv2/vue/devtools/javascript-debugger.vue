<template>
  <vue-draggable-resizable
    :w="300"
    :h="200"
    :min-width="300"
    :min-height="100"
    style="display: flex;
	   flex-direction: column;
	   flex: 1;
	   opacity: 0.9;">

    <div id="titlebar"
	 style="flex: 0 0 25px;
		background: #CCCCCC;">

      <div style="text-align: left;
		  margin-top: 3px;">&nbsp;&nbsp;<i>a workspace</i></div></div>
    
    <hsc-menu-style-white>
      <hsc-menu-context-menu>
	<textarea id="smalltalk-workspace-text"
		  class="textarea"
		  style="flex: 1;
			 font-size: 16;">3 + 4</textarea>

	<template slot="contextmenu">

          <hsc-menu-item
	    id="do it"
	    label="do it"></hsc-menu-item>

          <hsc-menu-item
	    id="print it"
	    label="print it"></hsc-menu-item>

	</template>
      </hsc-menu-context-menu>
    </hsc-menu-style-white>
  </vue-draggable-resizable>
</template>

<style src="/css/devtools.css"></style>
