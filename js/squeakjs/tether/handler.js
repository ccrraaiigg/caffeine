// Use the function below in the main browser thread, as the handler
// for message events from the Caffeine worker. You can post messages
// to Caffeine with the worker's postMessage() function. Caffeine
// responds with message events.
//
// In Caffeine's "Tether" protocol, the browser is the first side to
// speak, by exposing a special tether object to Caffeine. Caffeine
// responds by exposing its local counterpart tether to the
// browser. Expose your tether by evaluating:
//
// caffeine.tether.push(caffeine.tether)}
//
// You can send simple messages Caffeine's tether object like so:
//
// caffeine.tether.sendMessage(
//   {
//     'selector': 'echo:',
//     'arguments': [3]},
// (result) => {console.log(result)})
//
// Tether also enables sending complex messages to Caffeine's other
// objects, including its compiler. For details, see /js/squeakjs/tether/tether.js

return (message) => {
  let data = JSON.parse(message.data)

  if (data.result) {
    (caffeine.tether.callbacks[data.exposureHash])(data.result)}
  else {
    caffeine.tether.setIncomingMessage(data.payload);
    let tag = caffeine.tether.nextWord()

    if (!(window.caffeinePeer)) {window.caffeinePeer = tag}
    else {
      let constructor = caffeine.classes[tag]

      if (!(constructor)) {debugger}
      else {(new constructor()).handleEventFrom(caffeine.tether)}}}}
