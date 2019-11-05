import VueSimpleContextMenu from 'vue-simple-context-menu'
Vue.component('vue-simple-context-menu', VueSimpleContextMenu)

new Vue({
  el: '#app',
  data: function() {
    return {
      items: [{name: 'one'}, {name: 'two'}],
      options: [],
      flip: 3,
      selectedNode: null,
      treeFilter: '',
      treeData: getTreeData(),
      treeOptions: {
	dnd: true,
	multiple: true,
	filter: {plainList: true}}}},
  
  methods: {
    handleClick (event, item) {this.$refs.vueSimpleContextMenu.showMenu(event, item)},

    optionClicked (event) {window.alert(JSON.stringify(event))}}})

function getTreeData() {
  return [{text: 'root'}]}

