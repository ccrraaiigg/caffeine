<template>
  <vue-draggable-resizable
    :w="600"
    :h="400"
    :min-width="600"
    :min-height="400"
    style="display: flex;
	   flex-direction: column;
	   flex: 1;
	   opacity: 0.9;">

    <div id="titlebar"
	 style="flex: 0 0 25px;
		background: #CCCCCC;">

      <div style="text-align: left;
		  margin-top: 3px;">&nbsp;&nbsp;<i>a classes browser</i></div></div>
    
    <div id="listboxes"
	 style="display: flex;
		flex: 1;
		margin-left: 3px;
		margin-top: 3px;
		height: 50%;">

      <select id="class-categories"
	      class="listbox"
	      size="2"
	      style="flex: 1;
		     font-size: 16;">
	
	<option value="1">class category one</option>
	<option value="2">class category two</option>
	<option value="3">class category three</option>
	<option value="4">class category four</option>
	<option value="5">class category five</option>
	<option value="6">class category six</option>
	<option value="7">class category seven</option></select>

      <div id="classes-group"
	   style="flex: 1;
		  display: flex;
		  flex-direction: column;">

	<select id="classes"
		class="listbox"
		size="2"
		style="flex: 5;
		       font-size: 16;">
	  
	  <option value="1">class one</option>
	  <option value="2">class two</option>
	  <option value="3">class three</option>
	  <option value="4">class four</option>
	  <option value="5">class five</option>
	  <option value="6">class six</option>
	  <option value="7">class seven</option></select>

	<div id="class-buttons"
	     class="button-row"
	     style="flex: 1;
		    margin-top: 1;">
	  
	  <div id="instance-side-button"
	       class="button"
	       style="flex: 1;">instance</div>

	  <div id="class-side-button"
	       class="button"
	       style="flex: 1;">class</div>

	  <div id="class-comment-button"
	       class="button"
	       style="flex: 1;">?</div></div></div>

      <select id="method-categories"
	      class="listbox"
	      size="2"
	      style="flex: 1;
		     font-size: 16;">
	
	<option value="1">method category one</option>
	<option value="2">method category two</option>
	<option value="3">method category three</option>
	<option value="4">method category four</option>
	<option value="5">method category five</option>
	<option value="6">method category six</option>
	<option value="7">method category seven</option></select>

      <select id="methods"
	      class="listbox"
	      size="2"
	      style="flex: 1;
		     font-size: 16;">
	
	<option value="1">method one</option>
	<option value="2">method two</option>
	<option value="3">method three</option>
	<option value="4">method four</option>
	<option value="5">method five</option>
	<option value="6">method six</option>
	<option value="7">method seven</option></select></div>

    <hsc-menu-style-white>
      <hsc-menu-context-menu>

	<textarea id="smalltalk-classes-browser-text"
		  class="textarea"
		  style="flex: 1;
			 font-size: 16;">This is a Smalltalk classes browser, implemented as an Vue component animated by SqueakJS.</textarea>

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
