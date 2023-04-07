let port = chrome.runtime.connect('jffjneepkpohlipploomamljdagfmhen'),
    tree
    
var vm = new Vue({
  el: '#tabs',

  data: {
    selectedNode: null,
    treeFilter: '',
    treeData: getTreeData(),
    treeOptions: {
      dnd: true,
      multiple: true,
      filter: {plainList: true}}},

  mounted: function () {
    tree = document.getElementById('tabs').__vue__.$refs.tree},

  methods: {
    dblclickHandler: function (event) {
      raiseSelectedTab()},
      
    contextMenuHandler: function (event) {
      let menu = document.createElement('div'),
	  top = 0
      
      items = [
	[
	  'delete',
	  () => {
	    tree.selected().map((selection) => {
	      port.postMessage({
		selector: 'remove',
		parameters: [selection.data.id]})})}],

	[
	  'group',
	  () => {}],

	[
	  'raise',
	  () => {raiseSelectedTab()}],

	[
	  'rename',
	  (node) => {
	    let form = document.createElement('form'),
		input = document.createElement('input'),
		dialog = document.createElement('dialog'),
		confirm = document.createElement('button'),
		cancel = document.createElement('button')

	    confirm.innerText = 'OK'
	    cancel.innerText = 'cancel'
	    form.method = 'dialog'
	    dialog.input = input
	    form.appendChild(input)
	    form.appendChild(confirm)
	    form.appendChild(cancel)
	    dialog.appendChild(form)

	    // "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
	    dialog.addEventListener(
	      'close',
	      function onClose() {node.data.text = this.input.value})

	    document.body.appendChild(dialog)
	    dialog.showModal()}]]

      items.map((pair) => {
	let item = document.createElement('div')

	item.innerText = pair[0]
	item.action = pair[1]
	item.style.position = 'relative'
	item.style.textAlign = 'left'
	item.left = '0px'
	item.top = top + 'px'
	item.style.margin = '5px'
	item.style.backgroundColor = "gray"

	item.onmouseenter = (event) => {
	  item.style.backgroundColor = "lightGray"}

	item.onmouseleave = (event) => {
	  item.style.backgroundColor = "gray"}

	item.onclick = (event) => {(item.action)(selectedNode())}
	
	top = top + 20
	menu.appendChild(item)})
	  
      menu.style.position = 'absolute'
      menu.style.left = event.pageX + 'px'
      menu.style.top = event.pageY + 'px'
      menu.style.height = top + 20 + 'px'
      menu.style.backgroundColor = 'gray'
      menu.style.zIndex = 5000

      window.onclick = (event) => {
	try {document.body.removeChild(menu)}
	catch (e) {}
	window.onclick = null}
      
      event.target.onclick = (event) => {
	try {document.body.removeChild(menu)}
	catch (e) {}
	event.target.onclick = null}
      
      document.body.appendChild(menu)
      event.preventDefault()}}})

function getTreeData() {
  return [{text: 'root'}]}

function selectedNode() {
  return tree.selected()[0]}

function raiseSelectedTab() {
  port.postMessage({
    selector: 'raise',
    parameters: [selectedNode().data.id]})}

