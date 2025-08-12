<template>
  <hsc-menu-style-white>
    <hsc-menu-context-menu style="margin: 50px;">
      <div class="box"
	   style="padding: 1em;">
        Secondary click here
      </div>
      <template slot="contextmenu">
        <hsc-menu-item label="MenuItem 1"></hsc-menu-item>
        <hsc-menu-item label="MenuItem 2"></hsc-menu-item>
	<hsc-menu-item label="MenuItem 3">
          <hsc-menu-item label="MenuItem 4"></hsc-menu-item>
          <hsc-menu-item label="MenuItem 5"></hsc-menu-item>
        </hsc-menu-item>
      </template>
    </hsc-menu-context-menu>
  </hsc-menu-style-white>
</template>

<style src="/css/devtools.css"></style>
