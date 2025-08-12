var button = document.getElementById('button'),
    href

chrome.devtools.inspectedWindow.eval(
  'location.href',
  null,
  function (result, exceptionInfo) {
    href = result
    if (!(/chrome:\/\//gi).test(href)) button.disabled = true
    else {
      button.addEventListener(
	'click',
	function () {
	  debugger
	  chrome.devtools.inspectedWindow.eval(
	    '\
\
            (function() {\
              var preTags = document.getElementsByTagName("pre");\
              var preWithHeaderInfo = preTags[0];\
              var preWithContent = preTags[2];\
              var lines = preWithContent.textContent.split("\\n");\
              var rgx = /^(0{8}:\\s+)([0-9a-f]{2}\\s+)[0-9a-f]{2}/m;\
              var match = rgx.exec(lines[0]);\
              var text = "";\
\
              for (var i = 0; i < lines.length; i++) {\
                var line = lines[i];\
                var firstIndex = match[1].length;\
                var indexJump = match[2].length;\
                var totalCharsPerLine = 16;\
                index = firstIndex;\
\
                for (var j = 0; j < totalCharsPerLine; j++) {\
                  var hexValAsStr = line.substr(index, 2);\
                  if (hexValAsStr == "  ") {\
                    break;}\
\
                var asciiVal = parseInt(hexValAsStr, 16);\
                text += String.fromCharCode(asciiVal);\
\
                index += indexJump;}}\
\
              var headerText = preWithHeaderInfo.textContent;\
              var elToInsertBefore = document.body.childNodes[0];\
              var insertedDiv = document.createElement("div");\
              document.body.insertBefore(insertedDiv, elToInsertBefore);\
\
              var nodes = [document.body];\
              var filepath = "";\
\
              while (true) {\
                var node = nodes.pop();\
                if (node.hasChildNodes()) {\
                  var children = node.childNodes;\
                  for (var i = children.length - 1; i >= 0; i--) {\
                    nodes.push(children[i]);}}\
\
                if (node.nodeType === Node.TEXT_NODE && /\\S/.test(node.nodeValue)) {\
                  filepath = node.nodeValue;\
                  break;}}\
\
              outputResults(insertedDiv, convertToBase64(text), filepath, headerText);\
              insertedDiv.appendChild(document.createElement("hr"));\
\
              function outputResults(parentElement, fileContents, fileUrl, headerText) {\
                var rgx = /.+\\/([^\\/]+)/;\
                var filename = rgx.exec(fileUrl)[1];\
\
                rgx = /content-type: (.+)/i;\
                var match = rgx.exec(headerText);\
                var contentTypeFound = match != null;\
                var contentType = "text/plain";\
                if (contentTypeFound) {\
                  contentType = match[1];}\
\
                var dataUri = "data:" + contentType + ";base64," + fileContents;\
                var gZipRgx = /content-encoding: gzip/i;\
\
                if (gZipRgx.test(headerText)) {\
                  filename += ".gz";}\
\
                var imageRgx = /image/i;\
                var isImage = imageRgx.test(contentType);\
                var aTag = document.createElement("a");\
\
                aTag.textContent = "download";\
                aTag.setAttribute("href", dataUri);\
                aTag.setAttribute("download", filename);\
                parentElement.appendChild(aTag);\
                parentElement.appendChild(document.createElement("br"));\
\
                if (isImage) {\
                  var imgTag = document.createElement("img");\
                  imgTag.setAttribute("src", dataUri);\
                  parentElement.appendChild(imgTag);\
                  parentElement.appendChild(document.createElement("br"));}\
\
                if (!contentTypeFound) {\
                  var pTag = document.createElement("p");\
                  pTag.textContent = "WARNING: the type of file was not found in the headers... defaulting to text file.";\
                  parentElement.appendChild(pTag);}}\
\
              function getBase64Char(base64Value) {\
                if (base64Value < 0) {\
                  throw "Invalid number: " + base64Value;}\
                else if (base64Value <= 25) {\
                  return String.fromCharCode(base64Value + "A".charCodeAt(0));}\
                else if (base64Value <= 51) {\
                  base64Value -= 26;\
                  return String.fromCharCode(base64Value + "a".charCodeAt(0));}\
                else if (base64Value <= 61) {\
                  base64Value -= 52;\
                  return String.fromCharCode(base64Value + "0".charCodeAt(0));}\
                else if (base64Value <= 62) {\
                  return "+";}\
                else if (base64Value <= 63) {\
                  return "/";}\
                else {\
                  throw "Invalid number: " + base64Value;}}\
\
              function convertToBase64(input) {\
                var remainingBits;\
                var result = "";\
                var additionalCharsNeeded = 0;\
                var charIndex = -1;\
                var charAsciiValue;\
                var advanceToNextChar = function() {\
                  charIndex++;\
                  charAsciiValue = input.charCodeAt(charIndex);\
                  return charIndex < input.length;};\
\
                while (true) {\
                  var base64Char;\
\
                  if (!advanceToNextChar()) break;\
                  base64Char = charAsciiValue >>> 2;\
                  remainingBits = charAsciiValue & 3;\
                  result += getBase64Char(base64Char);\
                  additionalCharsNeeded = 3;\
\
                  if (!advanceToNextChar()) break;\
                  base64Char = (remainingBits << 4) | (charAsciiValue >>> 4);\
                  remainingBits = charAsciiValue & 15;\
                  result += getBase64Char(base64Char);\
                  additionalCharsNeeded = 2;\
\
                  if (!advanceToNextChar()) break;\
                  base64Char = (remainingBits << 2) | (charAsciiValue >>> 6);\
                  result += getBase64Char(base64Char);\
                  remainingBits = charAsciiValue & 63;\
                  result += getBase64Char(remainingBits);\
                  additionalCharsNeeded = 0;}\
\
                  if (additionalCharsNeeded == 2) {\
                    remainingBits = remainingBits << 2;\
                    result += getBase64Char(remainingBits) + "=";}\
                  else if (additionalCharsNeeded == 3) {\
                    remainingBits = remainingBits << 4;\
                    result += getBase64Char(remainingBits) + "==";}\
                  else if (additionalCharsNeeded != 0) {\
                    throw "Unhandled number of additional chars needed: " + additionalCharsNeeded;}\
\
                return result;}})()',
	    null,
	    function (result, exceptionInfo) {debugger})})}})
