<template>

  <!-- a traditional Smalltalk classes browser, with listboxes for
       class categories, classes, method categories, and methods,
       and a text area for method source, class definitions, and
       class comments -->

  <div id="classes-browser"
       class="window classes-browser"
       style="width: 800px;
							height: 500px;
							top: 50px;
							left: 50px;">

    <div id="titlebar"
				 class="titlebar">

      <img id="close-button"
					 class="close-button"
					 src="/pictures/icons/windows/closeButton.png">

      <div class="titlebar-text"
					 style="all: initial;
									display: block;
									margin: 0px 30px;">
				
				<i><b>

						classes browser

    </b></i></div></div>

    <div id="listboxes"
				 style="display: flex;
								flex: 1;
								margin-left: 3px;
								margin-top: 3px;">

      <select id="class-categories"
							class="listbox"
							size="2"
							style="flex: 1;"></select>
				
      <div id="classes-group"
					 style="flex: 1;
									display: flex;
									flex-direction: column;">

				<select id="classes"
								class="listbox"
								size="2"
								style="flex: 5;"></select>

				<div id="class-buttons"
						 class="button-row">
					
					<div id="instance-side-button"
							 class="button">instance</div>

					<div id="class-side-button"
							 class="button">class</div>

					<div id="class-comment-button"
							 class="button">?</div></div></div>

      <select id="method-categories"
							class="listbox"
							size="2"
							style="flex: 1;"></select>

      <select id="methods"
							class="listbox"
							size="2"
							style="flex: 1;"></select></div>

    <textarea id="text"
							class="editor">

      <p>It <i>works!</i></p></textarea></div></template>

<style scoped id="classes-browser-style">
  
  .window {
    display: flex;
    flex-direction: column;
    background: gray;
    position: absolute;
    border-radius: 10px;
    transition: opacity 500ms;}

  .close-button {
    position: absolute;
    left: 5;
    top: 5;}

  .listbox {
    flex: 1;
    font-size: 18px;
    margin-right: 3px;}

  .button {
    padding: 1px 20px;
    background: lightGray;
    margin-top: 2px;
    border: 2px solid black;
    font-size: 16px;}

  .button-row {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-right: 3px;
    margin-bottom: 1px;}

  .titlebar {
    display: flex;
    height: 25px;
    margin-top: 6px;
    margin-left: 6px;}

  .titlebar-text {
    position: absolute;
    font-size: 18px;
    top: 6;
    left: 30;}

  .editor {
    resize: none;
    flex: 1;
    font-size: 18px;
    margin: 3px;}
  
  .menu {
    display: flex;
    padding: 5px;
    border: 2px solid blue;
    flex-direction: column;
    background: lightGray;
    position: absolute;
    border-radius: 10px;
    text-align: center;
    transition: opacity 500ms;}

  .menu-item {
    font-size: 18px;
    padding: 1px 5px;}

  .menu-separator {
    background: white;
    height: 2px;
    margin-top: 2px;
    margin-bottom: 3px;}

  .dialog {
    display: flex;
    padding: 10px;
    border: 2px solid red;
    flex-direction: column;
    background: lightGray;
    position: absolute;
    border-radius: 10px;
    text-align: center;
    transition: opacity 500ms;}

  .dialog-question {
    margin-bottom: 5px;}

  .dialog-button {
    padding: 1px 5px;
    background: lightGray;
    margin-top: 2px;
    border: 2px solid black;
    font-size: small;}

</style>
