//
// This file is part of //\ Tarp.
//
// Copyright (C) 2013-2018 Torben Haase <https://pixelsvsbytes.com>
//
// Tarp is free software: you can redistribute it and/or modify it under the
// terms of the GNU Lesser General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Tarp is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
// details.You should have received a copy of the GNU Lesser General Public
// License along with Tarp.  If not, see <http://www.gnu.org/licenses/>.
//
////////////////////////////////////////////////////////////////////////////////

// INFO This is a simple loader script mainly provided for backward
//      compatibility with the the original Smoothie.require boot loader. See
//      the following website on more information on how to switch from
//      Smoothie to Tarp.require:
//
//      https://pixelsvsbytes.com/2018/01/tarp-require-replaces-smoothie/

var mainModule = "main";

function boot(module) {
  var ieInteractiveWithBody;
  module.loading && module.loading();
  switch (document.readyState) {
    case "complete":
      module.ready && module.ready(document.body);
      module.interactive && module.interactive(document.body);
      module.complete && module.complete(document.body);
      break;
    case "interactive":
      // NOTE In IE8/9 the "interactive" state has still no document body,
      //      if the page has been loaded from cache. Therefore we have to
      //      wait until the "complete" state has been reached to call the
      //      hooks for "interactive" then.
      ieInteractiveWithBody = !!document.body;
      if (ieInteractiveWithBody) {
        module.ready && module.ready(document.body);
        module.interactive && module.interactive(document.body);
      }
      // falls through
    case "loading":
      document.onreadystatechange = function() {
        switch (document.readyState) {
          case "interactive":
            module.ready && module.ready(document.body);
            module.interactive && module.interactive(document.body);
            break;
          case "complete":
            if (!ieInteractiveWithBody) {
              module.ready && module.ready(document.body);
              module.interactive && module.interactive(document.body);
            }
            module.complete && module.complete(document.body);
            break;
          default:
            throw new Error("unknown readyState " + document.readyState);
        }
      };
      break;
    default:
      throw new Error("unknown readyState " + document.readyState);
  }
}

Tarp.require({main: mainModule}).then(boot);
