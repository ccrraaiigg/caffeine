// Use the function below in the main browser thread, as the handler
// for "message" events from the worker for speaking the Tether
// protocol. You can post messages to Caffeine with the worker's
// postMessage() function. Caffeine responds with message events.
//
// In this protocol, the browser is the first side to speak, by
// exposing a special "tether" object to Caffeine. Caffeine responds
// by exposing its local counterpart tether to the browser. Expose
// your tether by evaluating:
//
// caffeine.tether.push(caffeine.tether)}

return (message) => {
  caffeine.tether.setIncomingMessage(message.data);
  let tag = caffeine.tether.nextWord()

  if (!(window.caffeinePeer)) {window.caffeinePeer = tag}
  else {
    let constructor = caffeine.classes[tag]

    if (!(constructor)) {debugger}
    else {(new constructor()).handleEventFrom(caffeine.tether)}}}
