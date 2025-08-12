try {
  // The Caffeine Helper extension manages the Chrome debugger and
  // webpage keyboard/mouse communication, for the Caffeine in-browser
  // IDE.
  //
  // Copyright (c) 2021 Craig Latta, d/b/a Black Page Digital.
  // All Rights Reserved.

  // Service worker variables - these will be reset on each wake
  var tabs = {}
  var version = "1.3"
  var tethers = []

  // Initialize tabs state from storage on startup
  chrome.storage.local.get(['tabs'], function(result) {
    if (result.tabs) {
      tabs = result.tabs
    }
  })

  // need equivalent APIs in Firefox
  chrome.debugger.onEvent.addListener(onDebuggerEvent)
  chrome.debugger.onDetach.addListener(onDetach)
  chrome.tabs.onCreated.addListener(onTabCreatedEvent)
  chrome.tabs.onRemoved.addListener(onTabRemovedEvent)
  chrome.tabs.onUpdated.addListener(onTabUpdatedEvent)

  // Speak with webpage-based Caffeine IDEs.
  chrome.runtime.onConnectExternal.addListener(
    function(port) {
      tethers.push(port)

      port.onDisconnect.addListener(function(event) {tethers.pop(port)})
				    
      tethers.map((tether) => {
	tether.onMessage.addListener(
	  function(message) {
	    switch(message.selector) {
	    case "createWindow":
	      chrome.windows.create({url: message.url})
	      respondToMessageWith(tether, message)
	      break
	    case "raise":
	      let tabID = message.parameters[0]
	      
	      chrome.tabs.query(
		{title: '*'},
		(result) => {
		  result.map((tab) => {
		    if (tab.id == tabID) {
		      // Raise the tab's window.
		      chrome.windows.update(tab.windowId, {focused: true})

		      // Raise the tab.
		      chrome.tabs.update(tabID, {active: true})
		      respondToMessageWith(tether, message)}})})
	      break
	    case "remove":
	      chrome.tabs.remove(message.parameters[0])
	      break
	    case "tabs":
	      chrome.tabs.query(
		{title: "*"},
		function(result){
		  respondToMessageWith(tether, message, result)})
	      break
	    case "myID":
	      respondToMessageWith(tether, message, tether.sender.tab.id)
	      break

	    case "attach":
	      var debuggeeId = {tabId: message.parameters[0]}

	      chrome.debugger.attach(
		debuggeeId,
		version,
		onAttach.bind(null, debuggeeId))
	      respondToMessageWith(tether, message, true)
	      break

	    case "detach":
	      var debuggeeId = {tabId: message.parameters[0]}

	      chrome.debugger.detach(
		debuggeeId,
		onDetach.bind(null, debuggeeId))
	      respondToMessageWith(tether, message, true)
	      break

	    default:
	      if (Object.keys(message.parameters[1]).length > 0) {
		chrome.debugger.sendCommand(
		  {tabId: message.parameters[0]},
		  // API command name
		  message.selector,
		  // API command parameters
		  message.parameters[1],
		  function(result) {
		    if (chrome.runtime.lastError) {
		      respondToMessageWith(tether, message, chrome.runtime.lastError)}
		    else {
		      respondToMessageWith(tether, message, result)}})}
	      else {
		chrome.debugger.sendCommand(
		  {tabId: message.parameters[0]},
		  // API command name
		  message.selector,
		  function(result) {
		    if (chrome.runtime.lastError) {
		      respondToMessageWith(tether, message, chrome.runtime.lastError)}
		    else {
		      respondToMessageWith(tether, message, result)}})}}})})})


  // Handle clicks on the extension icon.
  chrome.action.onClicked.addListener(
    function(tab) {
      var tabId = tab.id
      var debuggeeId = {tabId: tabId}

      // If present, tabs[tabId] can be "attaching" while waiting for
      // attachment, or "attached" after attachment.
      if (tabs[tabId] === "attaching")
	return

      if (!tabs[tabId]) {
	tabs[tabId] = "attaching"
        // Save state to storage
        chrome.storage.local.set({tabs: tabs})
	chrome.debugger.attach(
          debuggeeId,
	  version,
	  onAttach.bind(null, debuggeeId))}
      else if (tabs[tabId]) {
	tabs[tabId] = "detaching"
        // Save state to storage
        chrome.storage.local.set({tabs: tabs})
	chrome.debugger.detach(
          debuggeeId,
	  onDetach.bind(null, debuggeeId))}
    })

  function respondToMessageWith(tether, message, result) {
    tether.postMessage({
      action: 'response',
      promiseID: message.promiseID,
      result: result})}

  function onAttach(debuggeeId) {
    // A debugger has attached to the tab indicated by
    // debuggeeId. Change the extension icon, to indicate the
    // attachment.

    var debuggerID, tabId
    
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message)
      return}

    debuggerID = chrome.debugger.sendCommand(debuggeeId, "Debugger.enable")
    tabId = debuggeeId.tabId

    chrome.action.setIcon({
      tabId: tabId,
      path: "caffeineRed16.png"})

    chrome.action.setTitle({
      tabId: tabId,
      title: "Debugging with Caffeine"})

    tabs[tabId] = "attached"
    // Save state to storage
    chrome.storage.local.set({tabs: tabs})
  }

  function tethersDo(func) {
    tethers.map((tether) => {
      try {func(tether)}
      catch (e) {
	if (tether) {
	  debugger
	  tethers.pop(tether)}}})}
  
  function onTabCreatedEvent(tab) {
    tethersDo((tether) => {
      tether.postMessage({
	action: 'tabCreated',
	tab: tab})})}

  function onTabRemovedEvent(tabID, info) {
    tethersDo((tether) => {
      tether.postMessage({
	action: 'tabRemoved',
	tabID: tabID,
	info: info})})}

  function onTabUpdatedEvent(tabID, info, tab) {
    tethersDo((tether) => {
      tether.postMessage({
	action: 'tabUpdated',
	tabID: tabID,
	info: info,
	tab: tab})})}

  function onDebuggerEvent(debuggeeId, method, parameters) {
    // Forward all DevTools events to Caffeine, except for script parses
    // that have no URL (e.g., when the SqueakJS JIT translates a
    // method).
    
    if (!(((method === "Debugger.scriptParsed") && (parameters.url === ""))))
      tethersDo((tether) => {
	tether.postMessage({
	  action: 'debuggerEvent',
	  tabID: debuggeeId.tabId,
	  method: method,
	  params: parameters})})}

  function onDetach(debuggeeId) {
    var tabId = debuggeeId.tabId

    delete tabs[tabId]
    // Save state to storage
    chrome.storage.local.set({tabs: tabs})
    chrome.action.setIcon({tabId: tabId, path: "caffeine16.png"})
    chrome.action.setTitle({tabId: tabId, title: "Debug with Caffeine"})}
}
catch (e) {console.error(e)}
