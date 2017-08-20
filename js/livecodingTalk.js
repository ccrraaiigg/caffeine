function start(imageName) {
  var magicWindow

  try {magicWindow = window.top.magicWindow}
  catch (exception) {magicWindow = null}

  if (magicWindow) {
    magicWindow.squeakDisplay = SqueakJS.runSqueak(
      "next.image",
      squeak,
      {
        zip: ["memories/next.zip", "sources/SqueakV46.sources.zip"],
        swapButtons: true,
        spinner: window.document.getElementById("sqSpinner"),
        appID: "3599d316-a13e-46ef-92be-c7337899038c",
        appName: "LivecodingTalk",
        appServer: "demo.blackpagedigital.com:8091",
      })}
  else {
    SqueakJS.runSqueak(
      "next.image",
      squeak,
      {
        zip: ["memories/next.zip", "sources/SqueakV46.sources.zip"],
        swapButtons: true,
        spinner: window.document.getElementById("sqSpinner"),
        appID: "3599d316-a13e-46ef-92be-c7337899038c",
        appName: "LivecodingTalk",
        appServer: "demo.blackpagedigital.com:8091",
      })}
}

