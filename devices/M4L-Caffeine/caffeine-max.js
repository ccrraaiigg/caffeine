// Service M4L LiveAPI invocation requests and relay their results.

var apis = [],
    extensions = []

post('caffeine-max starting\n')

function bang() {}

// remotely-callable extension functions

function cacheAPIAndProperty(api, property) {
  var pathTag = api.unquotedpath,
      idTag = 'id ' + api.id
  
  if (!(apis[pathTag])) {
    //post('creating cache for tag "' + pathTag + '"\n')
    apis[pathTag] = []}

  if (!(apis[idTag])) {
    //post('creating cache for tag "' + idTag + '"\n')
    apis[idTag] = []}

  //post('creating caches for property "' + property + '"\n')
  apis[pathTag][property] = api
  apis[idTag][property] = api}

function apiWithTagAndProperty(tag, property) {
  if ((apis[tag]) && (apis[tag][property])) {
    if ((apis[tag][property]).path) {
      //post('Retrieved API with path "' + (apis[tag][property]).path + '" for tag "' + tag + '" and property "' + property + '"\n')
      return apis[tag][property]}
    else {
      //post('Object for cached API for tag "' + tag + '" has been deleted.\n')
      delete apis[tag]
      return null}}
  else {
    //post('no API for tag "' + tag + '" and property "' + property + '"\n')
    return null}}

function removeObserver(api, property) {
  var api
  
  post('removing ' + property + ' observer for ' + api.path + '\n')
  api = apiWithTagAndProperty(api.path, property)
  if (!api) api = apiWithTagAndProperty(('id ' + api.id), property)
  if (!api) post('no such observer')
  else delete apis[api.path][property]

  return 1}

function trackIsCentered(track) {
  var mixer = new LiveAPI(track.get('mixer_device')),
      panning = new LiveAPI(mixer.get('panning'))
  
  return Math.abs(panning.get('value')) < 0.05}

function center(track) {
  var mixer = new LiveAPI(track.get('mixer_device')),
      panning = new LiveAPI(mixer.get('panning'))
  
  panning.set('value', 0)
  return 1}
  
function toggleSolo(track) {
  var newValue

  if (track.get('solo') == 1) newValue = 0
  else newValue = 1
  
  track.set('solo', newValue)
  return newValue}
  
function toggleRecordMode(song) {
  var newValue

  if (song.get('record_mode') == 1) newValue = 0
  else newValue = 1

  song.set('record_mode', newValue)
  return 1}

function toggleView(applicationView) {
  var newValue

  applicationView.call('hide_view', ' ')
  return 1}

function toggleArmTrack(track) {
  var newValue
  
  if (track.get('arm') == 1) newValue = 0
  else newValue = 1
  track.set('arm', newValue)
  return newValue}

function sceneTick(songView, tick) {
  var delta,
      scenes = (extensions['apiWithTagAndProperty']('live_set', 'generic')).get('scenes'),
      newSelectedSceneIndex,
      newSelectedSceneID

  if (tick[0] == 1) delta = 1
  else delta = -1

  newSelectedSceneIndex = ((scenes.indexOf(songView.get('selected_scene')[1]) + 1) / 2) - 1 + delta

  if (newSelectedSceneIndex < 0) newSelectedSceneIndex = 0
  else if (newSelectedSceneIndex > ((scenes.length / 2) - 1)) newSelectedSceneIndex = (scenes.length / 2) - 1

  newSelectedSceneID = scenes[newSelectedSceneIndex * 2 + 1]
  songView.set('selected_scene', 'id ' + newSelectedSceneID)
  return newSelectedSceneID}

function pannerTick(panner, tick) {
  var delta = tick[1] / 50,
      sign = tick[0],
      newValue

  if (!sign) {delta = -delta}
  newValue = panner.get('value')[0] + delta

  if (Math.abs(newValue) < 0.001) {newValue = 0}
  else {
    if (newValue > 1) {newValue = 1}
    else {if (newValue < -1) {newValue = -1}}}

  panner.set('value', newValue)
  return newValue}

extensions['trackIsCentered'] = trackIsCentered
extensions['center'] = center
extensions['cacheAPIAndProperty'] = cacheAPIAndProperty
extensions['apiWithTagAndProperty'] = apiWithTagAndProperty
extensions['removeObserver'] = removeObserver
extensions['toggleRecordMode'] = toggleRecordMode
extensions['toggleArmTrack'] = toggleArmTrack
extensions['pannerTick'] = pannerTick
extensions['sceneTick'] = sceneTick
extensions['toggleView'] = toggleView
extensions['toggleSolo'] = toggleSolo

function anything(dictName) {
  var dict = Dict(dictName),
      invocationID = dict.get('invocationID'),
      tag = dict.get('tag'),
      functionName = dict.get('functionName'),
      parameters = dict.get('parameters'),
      attributeName,
      argument,
      observe,
      api,
      property,
      result,
      song

  song = extensions['apiWithTagAndProperty']('live_set', 'generic')

  if (!song) {
    song = new LiveAPI('live_set')
    extensions['cacheAPIAndProperty'](song, 'generic')}
  
  function removeUnderscores(string) {
    var output = [],
	uppercase = false

    for (i = 0; i < string.length; i++) {
      if (string[i] == '_') uppercase = true
      else {
	var character = string[i]

	if (uppercase && (character >= 'a')) output.push(string[i].toUpperCase())
	else output.push(string[i])

	uppercase = false}}

    return output.join('')}

  if (functionName == 'reset') {
    post('resetting observers\n')
    apis = []

    outlet(
      0,
      JSON.stringify({
	invocationID: invocationID,
	functionName: functionName,
	result: null}))}
  else {
    if (((functionName == 'attribute') || (functionName == 'apiProperty') || (functionName == 'observe')) && parameters) {
      attributeName = parameters.get("attributeName")
      argument = parameters.get("argument")}

    observe = (functionName == 'observe')
    api = extensions['apiWithTagAndProperty'](tag, attributeName)
    
    if (observe) {
      if (!api) {
	api = new LiveAPI(
	  function (payload) {
	    if (this.doNotRespond) {
	      // post('not broadcasting update to ' + this.path + ' :: ' + '\n')
	      this.doNotRespond = false}
	    else {
	      var song = extensions['apiWithTagAndProperty']('live_set', 'generic')

	      // post('update to ' + this.path + ' :: ' + payload + '\n')

	      this.count = this.count + 1

	      if (!(song.get('is_playing')[0]) || ((this.count % this.modulus) == 0)) {
		this.count = 0

		outlet(
		  0,
		  JSON.stringify({
		    invocationID: -1,
		    originalInvocationID: this.originalInvocationID,
		    property: this.property,
		    path: this.path.replace(/"/g, ''),
		    payload: payload}))}}},
	  tag)

	// post('observing ' + api.path + ' :: ' + attributeName + '\n')
	api.property = attributeName
	api.modulus = parameters.get('modulus')
	api.originalInvocationID = invocationID
	if (!api.modulus) api.modulus = 1
	post('property is ' + attributeName + ', modulus is ' + api.modulus + '\n')
	api.count = 0
	property = attributeName
	extensions['cacheAPIAndProperty'](api, attributeName)}}
    else {
      property = 'generic'
      
      if (!api) {
	// post('Using cached generic API for ' + tag + '\n')
	api = extensions['apiWithTagAndProperty'](tag, 'generic')}

      if (!api) {
	//post('new API for ' + tag + '\n')
	api = new LiveAPI(tag)
	extensions['cacheAPIAndProperty'](api, 'generic')}}

    //post('Using API with path "' + api.path + '" for tag "' + tag + '", property "' + property + '", function name "' + functionName + '", and parameters "' + JSON.stringify(parameters) + '"\n')
    
    if (invocationID == -7) {
      // post('API ' + api.unquotedpath + ' will not respond.\n')
      api.doNotRespond = true}

    try {
      if (functionName == 'apiProperty') {
	if (!(api[attributeName])) {
	  attributeName = removeUnderscores(attributeName)
	  // post('trying extension function ' + attributeName + '...\n')
	  result = extensions[attributeName](api, argument)}
	else {
	  if (!(argument == null)) {api[attributeName] = argument}
	  else {result = api[attributeName]}}}
      else {
	if (observe || (functionName == 'attribute')) {
	  if (!(argument == null)) {result = api.set(attributeName, argument)}
	  else result = api.get(attributeName)}
	else {
	  if (functionName == 'extension') result = extensions[attributeName](api, argument)
	  else {
	    if (parameters) {
	      result = api.call(functionName, parameters)
	      //post('called with parameters (' + parameters + '), stringified "' + JSON.stringify(parameters) + '", second parameter "' + parameters[1] + '", got result ' + result + '\n')
	    }
	    else {
	      result = api.call(functionName)
	      //post('called with no parameters, got result ' + result + '\n')
	    }}}}}
    catch (error) {
      post('Caffeine device error: ' + error + ' :: ' + functionName + ' :: ' + attributeName + '\n')
      result = null}

    if (typeof(result) == 'string') {result = result.replace(/"/g, '')}

    if (invocationID != -7) {
      outlet(
	0,
	JSON.stringify({
	  invocationID: invocationID,
	  functionName: functionName,
	  result: result}))}}}

