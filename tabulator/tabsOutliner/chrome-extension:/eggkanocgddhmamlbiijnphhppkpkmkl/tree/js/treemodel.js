// Input 0
/*
 Copyright 2012, 2013, 2014, 2015 by Vladyslav Volovyk. All Rights Reserved. */
function isNewTab(chromeTabObj) {
  return chromeTabObj.url == "chrome://newtab/" || chromeTabObj.url.indexOf("sourceid=chrome-instant") > 0
}
function isPropertiesEqual(obj1, obj2, propertiesList) {
  for(var i = 0;i < propertiesList.length;i++) {
    if(obj1[propertiesList[i]] !== obj2[propertiesList[i]]) {
      return false
    }
  }
  return true
}
function i2s36(v) {
  return v.toString(36)
}
function s2i36(v) {
  return parseInt(v, 36)
}
function addToCollectionUnderS36Key(collectionsDict, collectionName, intKey, content) {
  if(!collectionsDict[collectionName]) {
    collectionsDict[collectionName] = {}
  }
  collectionsDict[collectionName][i2s36(intKey)] = content
}
function oneLevelObjectClone(o) {
  var r = {};
  for(var i in o) {
    r[i] = o[i]
  }
  return r
}
function findById(array, id) {
  if(!array) {
    return null
  }
  for(var i = 0;i < array.length;i++) {
    if(array[i]["id"] === id) {
      return array[i]
    }
  }
  return null
}
function last(array) {
  return array[array.length - 1]
}
var CDID_SDID_SEPARATOR = "#";
var CDID_SUBNODESLIST_SEPARATOR = "@";
var CDIDSDID_SUBNODESBASEMODIFICATIONS_SEPARATOR = "#";
var OPS_SEPARATOR = "|";
var NEW_DIDS_SEPARATOR = "/";
var SUBNODES_DIDS_SEPARATOR = "&";
var OPS_COMPONENTS_SEPARATOR = "=";
function SybnodesChangesMonitor_isChangesToBase(curSubnodesDids, baseSubnodesArray) {
  if(curSubnodesDids.length != baseSubnodesArray.length) {
    return true
  }
  for(var i = 0;i < curSubnodesDids.length;i++) {
    if(curSubnodesDids[i] != baseSubnodesArray[i]) {
      return true
    }
  }
  return false
}
function SybnodesChangesMonitor_serializeCurSubnodes(curSubnodesDids, baseSubnodesArray) {
  var lastFoundDidInBasePos = -1;
  var diff = [];
  for(var curCursor = 0;curCursor < curSubnodesDids.length;curCursor++) {
    var si = baseSubnodesArray.indexOf(curSubnodesDids[curCursor], lastFoundDidInBasePos + 1);
    if(si < 0) {
      diff.push(curSubnodesDids[curCursor])
    }else {
      if(lastFoundDidInBasePos + 1 === si) {
        var last_op = last(diff);
        if(last_op && last_op[0] === "*") {
          var op = diff.pop();
          var n = s2i36(op.split("*")[1]);
          if(isNaN(n)) {
            n = 1
          }
          diff.push("*" + i2s36(++n))
        }else {
          diff.push("*")
        }
      }else {
        n = si - (lastFoundDidInBasePos + 1);
        if(n === 1) {
          diff.push("-")
        }else {
          diff.push("-" + i2s36(n))
        }
      }
      lastFoundDidInBasePos = si
    }
  }
  return diff.join(OPS_SEPARATOR)
}
function SybnodesChangesMonitor_restoreSubnodesList(baseSubnodesArray, changes_str) {
  var diff = changes_str.split(OPS_SEPARATOR);
  var baseCursor = 0;
  var r_restoredSubnodes = [];
  for(var i = 0;i < diff.length;i++) {
    var op = diff[i];
    if(op[0] === "*") {
      var n = s2i36(op.split("*")[1]);
      if(isNaN(n)) {
        n = 1
      }
      while(n-- > 0) {
        r_restoredSubnodes.push(baseSubnodesArray[baseCursor++])
      }
    }else {
      if(op[0] === "-") {
        n = s2i36(op.split("-")[1]);
        if(isNaN(n)) {
          n = 1
        }
        baseCursor += n;
        r_restoredSubnodes.push(baseSubnodesArray[baseCursor++])
      }else {
        r_restoredSubnodes.push(op)
      }
    }
  }
  return r_restoredSubnodes
}
function getBaseSubnodesArray(baseKnot) {
  return baseKnot.split(CDID_SUBNODESLIST_SEPARATOR)[1].split(SUBNODES_DIDS_SEPARATOR)
}
function testSubnodesChangesAlgorithm() {
  var did = 1E4;
  var subnodes = [];
  for(var i = 0;i < 400;i++) {
    subnodes.push(i2s36(did++))
  }
  var subnodes_old = subnodes.slice(0);
  var sdidKnot = "ffff" + CDID_SUBNODESLIST_SEPARATOR + subnodes_old.join(SUBNODES_DIDS_SEPARATOR);
  console.log("##############################################################################");
  console.log("INIT subnodes:", subnodes.join(SUBNODES_DIDS_SEPARATOR));
  function ins(i) {
    subnodes.splice(i, 0, i2s36(did++));
    serializedDifference = SybnodesChangesMonitor_serializeCurSubnodes(subnodes.slice(0), getBaseSubnodesArray(sdidKnot));
    console.log("+(" + i + ") new_subnodes:", subnodes.join(SUBNODES_DIDS_SEPARATOR), "\tops:", serializedDifference, "\trestored:", SybnodesChangesMonitor_restoreSubnodesList(subnodes_old, serializedDifference).join(SUBNODES_DIDS_SEPARATOR))
  }
  function del(i) {
    subnodes.splice(i, 1);
    serializedDifference = SybnodesChangesMonitor_serializeCurSubnodes(subnodes.slice(0), getBaseSubnodesArray(sdidKnot));
    console.log("-(" + i + ") new_subnodes:", subnodes.join(SUBNODES_DIDS_SEPARATOR), "\tops:", serializedDifference, "\trestored:", SybnodesChangesMonitor_restoreSubnodesList(subnodes_old, serializedDifference).join(SUBNODES_DIDS_SEPARATOR))
  }
  function replace(i) {
    del(i);
    ins(i)
  }
  function ins_at_end() {
    ins(subnodes.length)
  }
  function replace_at_end() {
    replace(subnodes.length)
  }
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  for(i = 0;i <= 100;i++) {
    var op = Math.random();
    var ins_i = getRandomInt(0, subnodes.length);
    var del_i = getRandomInt(0, subnodes.length - 1);
    if(op < 0.2) {
      ins_at_end()
    }else {
      if(op < 0.3) {
        replace_at_end()
      }else {
        if(op < 0.6) {
          replace(del_i)
        }else {
          if(op < 0.69) {
            ins(ins_i)
          }else {
            if(op < 1) {
              del(del_i)
            }
          }
        }
      }
    }
  }
  var subnodes_new = subnodes.slice(0);
  console.log("subnodes_old len:", subnodes_old.length, "serialized length:", subnodes_old.join(SUBNODES_DIDS_SEPARATOR).length);
  console.log("subnodes_new len:", subnodes_new.length, "serialized length:", subnodes_new.join(SUBNODES_DIDS_SEPARATOR).length);
  var serializedDifference = SybnodesChangesMonitor_serializeCurSubnodes(subnodes_new, getBaseSubnodesArray(sdidKnot));
  console.log("serializedDifference len:", JSON.stringify(serializedDifference).length);
  console.log("serializedDifference:", serializedDifference);
  var restoredSubnodes = SybnodesChangesMonitor_restoreSubnodesList(subnodes_old, serializedDifference);
  console.log("COMPARE:", restoredSubnodes.toString() === subnodes_new.toString());
  console.log("old      array:", subnodes_old.toString());
  console.log("new      array:", subnodes_new.toString());
  console.log("retored  array:", restoredSubnodes.toString())
}
function extentToTreeModel(tree, treePersistenceManager) {
  var rootNode = tree[0];
  rootNode.treeModel = tree;
  tree.currentSession_rootNode = rootNode;
  tree.persistenceManager = treePersistenceManager;
  tree.persistenceManager.registerTree(tree);
  tree.saveNowOnViewClose = function() {
    this.persistenceManager.saveNow()
  };
  tree.hierarchyUpdated = function() {
    this.persistenceManager.treeUpdated()
  };
  tree.findActiveWindow = function(windowId) {
    return findNodeById(this, NodeTypesEnum.WINDOW + windowId)
  };
  tree.findActiveTab = function(tabId) {
    return findNodeById(this, NodeTypesEnum.TAB + tabId)
  };
  tree.getAllCollapsedNodes = function() {
    var r = [];
    forEachNodeInTree_noChangesInTree(this, function(node) {
      if(node.colapsed) {
        r.push(node)
      }
    });
    return r
  };
  tree.getListOfAllActiveWindowNodes = function() {
    var r = [];
    forEachNodeInTree_noChangesInTree(this, function(node) {
      if(node.type === NodeTypesEnum.WINDOW) {
        r.push(node)
      }
    });
    return r
  };
  tree.setActiveTabInWindow = function(tabId, windowId) {
    var windowNode = this.findActiveWindow(windowId);
    if(!windowNode) {
      console.log("ERROR NOW SSTIW", tabId, windowId)
    }
    if(windowNode) {
      windowNode.setActiveTab(tabId)
    }
  };
  tree.setFocusedWindow = function(windowId, scrollToView) {
    var lastFocusedWindowNodeModel = this.findActiveWindow(this.lastFocusedWindowId);
    if(lastFocusedWindowNodeModel) {
      lastFocusedWindowNodeModel.setChromeWindowObjFocused(false)
    }
    var nowFocusedWindowNodeModel = this.findActiveWindow(windowId);
    if(nowFocusedWindowNodeModel) {
      if(scrollToView) {
        nowFocusedWindowNodeModel.requestScrollNodeToViewInAutoscrolledViews()
      }
      nowFocusedWindowNodeModel.setChromeWindowObjFocused(true)
    }else {
      console.error("ERROR NOW SFW", windowId)
    }
    this.lastFocusedWindowId = windowId
  };
  tree.isDropAllowed = function(dropTarget, dropedNodeModel) {
    if(!dropTarget) {
      return false
    }
    if(isSameNodeOrPresentInPathToRoot(dropTarget.container, dropedNodeModel)) {
      return false
    }
    return dropTarget.container.isDropAllowed(dropTarget.position, dropedNodeModel)
  };
  tree.moveCopyHierarchy = function(dropTarget, dropedNodeModel, isCopyDrop, treeView) {
    dropTarget = this.ensureAndPrepareTabsOrganizerForActiveTabsMove(dropTarget, dropedNodeModel, isCopyDrop);
    var _this = this;
    (function doRecursiveDrop_(dropTarget, dropedNodeModel, isCopyDrop) {
      var newTarget = function nodeDropMethodCall(dropTarget, dropedNodeModel, isCopyDrop) {
        var nodeModel = isCopyDrop ? dropedNodeModel.cloneForCopyInActiveTree_withoutSubnodes() : dropedNodeModel.copyConstructor_withoutSubnodes();
        return{"container":dropTarget.container.insertCopyAsSubnode_MoveCursor(dropTarget.position, nodeModel, dropedNodeModel, !isCopyDrop), "position":-1}
      }(dropTarget, dropedNodeModel, isCopyDrop);
      dropedNodeModel.subnodes.forEach(function(nodeModel) {
        doRecursiveDrop_(newTarget, nodeModel, isCopyDrop)
      })
    })(dropTarget, dropedNodeModel, isCopyDrop);
    if(!isCopyDrop) {
      dropedNodeModel.removeOwnTreeFromParent()
    }
    var affectedHierarchy = dropTarget.container.findFirstSavedOrOpenTabsOrganizerInPathToRoot();
    if(!affectedHierarchy) {
      affectedHierarchy = dropTarget.container
    }
    this.executeWaitedChromeOperations([affectedHierarchy]);
    if(dropedNodeModel.performAfterDropActionForDragedModelHierarchy) {
      dropedNodeModel.performAfterDropActionForDragedModelHierarchy(treeView)
    }
  };
  tree.executeWaitedChromeOperations = ActiveTree_executeWaitedChromeOperations;
  tree.ensureAndPrepareTabsOrganizerForActiveTabsMove = function(dropTarget, dropedHierarchy, isCopyDrop) {
    var r = dropTarget;
    if(!isCopyDrop && dropedHierarchy.isNotCoveredByWindowActiveTabsPresentInHierarchy()) {
      var tabsOrganizer = dropTarget.container.findFirstSavedOrOpenTabsOrganizerInPathToRoot();
      if(!tabsOrganizer) {
        tabsOrganizer = new NodeWindowSaved;
        dropTarget.container.insertSubnode(dropTarget.position, tabsOrganizer);
        r = {"container":tabsOrganizer, "position":-1}
      }
      if(tabsOrganizer.isRelatedChromeWindowAlive) {
        tabsOrganizer._f_isWhantRequestTabsMove = true
      }else {
        tabsOrganizer._f_isWhantRequestNewWindowCreation = true
      }
    }
    return r
  };
  tree.deleteDeadObservers = function(currentlyClosedDocument, cursorOwner) {
    forEachNodeInTree_noChangesInTree(this, function(nodeModel) {
      nodeModel.deleteDeadObservers(currentlyClosedDocument)
    })
  };
  tree.makeTransferableRepresentation_UriList = function(hierarchy) {
    var r = [];
    (function doRecursiveUrilise_(nodeModel) {
      if(nodeModel.isLink) {
        r.push(nodeModel.getHref())
      }
      if(nodeModel.subnodes.length > 0) {
        for(var i = 0;i < nodeModel.subnodes.length;i++) {
          doRecursiveUrilise_(nodeModel.subnodes[i])
        }
      }
    })(hierarchy);
    return r[0] ? r[0] : ""
  };
  tree.makeTransferableRepresentation_Html = function(hierarchy) {
    var r = "";
    (function doRecursiveHtmlise_(nodeModel) {
      if(nodeModel.isLink) {
        r += '<li><a href="' + nodeModel.getHref() + '">' + nodeModel.getNodeText() + "</a></li>"
      }else {
        r += "<li>" + nodeModel.getNodeText() + "</li>"
      }
      if(nodeModel.subnodes.length > 0) {
        r += "<ul>";
        for(var i = 0;i < nodeModel.subnodes.length;i++) {
          doRecursiveHtmlise_(nodeModel.subnodes[i])
        }
        r += "</ul>"
      }
    })(hierarchy);
    return r
  };
  tree.makeTransferableRepresentation_TextMultiline = function(hierarchy) {
    var r = "";
    var indent = "";
    var ONE_LEVEL_INDENT = "    ";
    (function doRecursiveTxtlise_(nodeModel) {
      if(nodeModel.isLink) {
        r += indent + nodeModel.getNodeText() + " (" + nodeModel.getHref() + ")"
      }else {
        r += indent + nodeModel.getNodeText()
      }
      r += "\n";
      if(nodeModel.subnodes.length > 0) {
        indent += ONE_LEVEL_INDENT;
        for(var i = 0;i < nodeModel.subnodes.length;i++) {
          doRecursiveTxtlise_(nodeModel.subnodes[i])
        }
        indent = indent.slice(0, -ONE_LEVEL_INDENT.length)
      }
    })(hierarchy);
    return r
  };
  tree.makeTransferableRepresentation_TabsOutlinerInterchangeFormat = function(hierarchy) {
    return JSON.stringify(this.serializeHierarchyAsJSO(hierarchy, true))
  };
  tree.createHierarchyFromTabsOutlinerInterchangeFormat = function(data) {
    return restoreHierarchyFromJSO(JSON.parse(data))
  };
  tree.serializeHierarchyAsJSO = function(hierarchy, serializeOpenNodesAsSaved) {
    var r = {};
    (function doRecursiveSerialize_(nodeModel, container) {
      container["n"] = (serializeOpenNodesAsSaved ? nodeModel.cloneForCopyInActiveTree_withoutSubnodes() : nodeModel).serialize();
      if(nodeModel.subnodes.length > 0) {
        container["s"] = [];
        for(var i = 0;i < nodeModel.subnodes.length;i++) {
          container["s"][i] = {};
          doRecursiveSerialize_(nodeModel.subnodes[i], container["s"][i])
        }
      }
    })(hierarchy || this.currentSession_rootNode, r);
    return r
  };
  tree.serializeAsOperationsLog = function() {
    var rOperations = [];
    var rootNode = this.currentSession_rootNode;
    (function doRecursiveSerializeAsOp_(nodeModel, pathToNode) {
      if(pathToNode.length === 0) {
        rOperations.push({"type":DbOperations.OperationsEnum.NODE_NEWROOT, "node":nodeModel.serialize()})
      }else {
        rOperations.push([DbOperations.OperationsEnum.NODE_INSERT, nodeModel.serialize(), pathToNode])
      }
      for(var i = 0;i < nodeModel.subnodes.length;i++) {
        var subnode = nodeModel.subnodes[i];
        var pathToSubnode = pathToNode.concat(i);
        doRecursiveSerializeAsOp_(subnode, pathToSubnode)
      }
    })(rootNode, rootNode.getPathToRoot());
    rOperations.push({"type":DbOperations.OperationsEnum.EOF, "time":Date.now()});
    return rOperations
  };
  tree.assignDIds_beforeDiffSerialize = function() {
    forEachNodeInTree_noChangesInTree(this, function(node) {
      if(node.dId) {
        return
      }
      node.dId = tree.currentSession_rootNode.getNextDid_andAdvance();
      if(!node.cdId) {
        node.cdId = tree.currentSession_rootNode.getNextDid_andAdvance()
      }
      if(!node.sdId && node.subnodes.length > 0) {
        node.sdId = node.dId;
        node.sdIdKnot = null
      }
      if(node.sdId && (node.subnodes.length > 0 && node.subnodes.length <= 1)) {
        node.sdId = node.dId;
        node.sdIdKnot = null
      }
      if(node.sdId && node.subnodes.length == 0) {
        node.sdId = 0;
        node.sdIdKnot = null
      }
    })
  };
  tree.renumerateDidsOnCollision = function(startingDId, newDidForStartingDId, maxFoundDid) {
    var d = newDidForStartingDId - startingDId;
    this.currentSession_rootNode.advanceNextDidToValue(maxFoundDid + d + 1);
    forEachNodeInTree_noChangesInTree(this, function(node) {
      if(node.dId >= startingDId) {
        node.dId += d
      }
      if(node.cdId >= startingDId) {
        node.cdId += d
      }
      if(node.sdId >= startingDId) {
        node.sdId = node.dId;
        node.sdIdKnot = null
      }
    })
  };
  tree.serializeTheDifference = function(startingDId) {
    var differenceAccumulator = {};
    this.assignDIds_beforeDiffSerialize();
    forEachNodeInTree_noChangesInTree(this, function(node) {
      if(node.dId >= startingDId) {
        node.serializeForDiff(startingDId, differenceAccumulator)
      }
    });
    differenceAccumulator["r"] = i2s36(this.currentSession_rootNode.dId);
    return differenceAccumulator
  };
  tree.initialNewWindowPosition = {left:1 + 400 + 5, top:1, width:window.screen.availWidth >> 1 < 1E3 ? window.screen.availWidth >> 1 : 1E3};
  tree.newWindowPositionDisplacement = {left:0, top:0};
  tree.nextWinDisplacement = {"x":34, "y":34};
  tree.calculateAndMoveNextWindowPosition = function(tabsOutliner_chromeWindowObj) {
    var tabsOutlinerRightSideX = tabsOutliner_chromeWindowObj.left + tabsOutliner_chromeWindowObj.width + 5;
    if(this.initialNewWindowPosition.left !== tabsOutlinerRightSideX) {
      if(tabsOutlinerRightSideX < window.screen.availWidth - 399) {
        this.initialNewWindowPosition.left = tabsOutlinerRightSideX;
        this.newWindowPositionDisplacement.top = this.newWindowPositionDisplacement.left = 0
      }
    }
    var r = {left:this.initialNewWindowPosition.left + this.newWindowPositionDisplacement.left, top:this.initialNewWindowPosition.top + this.newWindowPositionDisplacement.top, width:this.initialNewWindowPosition.width};
    this.updateDisplacementForNextWindow(tabsOutlinerRightSideX);
    return r
  };
  tree.updateDisplacementForNextWindow = function(tabsOutlinerRightSideX) {
    this.newWindowPositionDisplacement.left += this.nextWinDisplacement.x;
    this.newWindowPositionDisplacement.top += this.nextWinDisplacement.y;
    if(this.initialNewWindowPosition.top + this.newWindowPositionDisplacement.top > window.screen.availHeight - 399) {
      this.newWindowPositionDisplacement.top = 0
    }
    if(this.initialNewWindowPosition.left + this.newWindowPositionDisplacement.left > window.screen.availWidth - 399) {
      this.newWindowPositionDisplacement.left = 0
    }
  };
  tree.requestNewAlifeTabForNode = function(tabsOrganizer, waitedTabNode) {
    var _this_activetree = this;
    var createProperties = {windowId:tabsOrganizer.chromeWindowObj.id, index:999, url:waitedTabNode.getHref(), active:waitedTabNode.chromeTabObj.active, pinned:waitedTabNode.chromeTabObj.pinned};
    window.chrome.extension.getBackgroundPage().preventScrollToViewInNextOnFocusChangeForWinId(createProperties.windowId);
    window.chrome.tabs.create(createProperties, function creationDone(newTab_chromeTabObj) {
      _this_activetree.replaceTabInWindowByNewlyCreatedRequestedTab_orAttachWaitTab(tabsOrganizer, waitedTabNode, newTab_chromeTabObj);
      tabsOrganizer._f_isWhantRequestTabsMove = true;
      _this_activetree.executeWaitedChromeOperations([tabsOrganizer])
    })
  };
  tree.requestNewAlifeWindowForNode = function(waitedWindowNode) {
    var _this_activetree = this;
    var creationWaitTab = waitedWindowNode.findTabWithActiveRequestForCreation();
    if(creationWaitTab) {
      creationWaitTab._f_isWhantRequestNewTabCreation = false
    }
    var moveWaitTab = null;
    window.chrome.windows.getLastFocused({"populate":false}, function(ourTabsoutlinerWindow_chromeWindowObj) {
      var newWinCoordinates = _this_activetree.calculateAndMoveNextWindowPosition(ourTabsoutlinerWindow_chromeWindowObj);
      var createProperties = {"type":"normal", "left":0, "top":0, "width":500, "focused":false};

      if(localStorage["openSavedWindowsInOriginalPos"]) {
        waitedWindowNode.fillCreatePropertiesByPositionAndSize(createProperties)
      }
      if(creationWaitTab) {
        createProperties.url = creationWaitTab.getHref()
      }
      if(moveWaitTab) {
        createProperties.tabId = moveWaitTab.chromeTabObj.id
      }
      window.chrome.windows.create(createProperties, function creationDone(newWindow_chromeWindowObj) {
        var newlyCreated_chromeTabObj = newWindow_chromeWindowObj.tabs[0];
        var nodeWithOurAlifeWindow = _this_activetree.findActiveWindow(newWindow_chromeWindowObj.id);
        if(!nodeWithOurAlifeWindow) {
          console.error("ERROR requestNewWindowForWaitedWindowNode done callback cannot find related chromeWindowObj in tree");
          return
        }
        var newWinNode = waitedWindowNode.replaceSelfInTreeBy_mergeSubnodesAndMarks(nodeWithOurAlifeWindow);
        if(creationWaitTab) {
          _this_activetree.replaceTabInWindowByNewlyCreatedRequestedTab_orAttachWaitTab(newWinNode, creationWaitTab, newlyCreated_chromeTabObj)
        }else {
          if(moveWaitTab) {
          }else {
            if(waitedWindowNode._f_isWindowScheduledToActivationWithoutAnyTabs) {
            }else {
              var newlyCreatedEmptyTabNode = newWinNode.findAlifeTabInOwnTabsById(newlyCreated_chromeTabObj.id);
              if(newlyCreatedEmptyTabNode.subnodes.length === 0) {
                newlyCreatedEmptyTabNode.removeOwnTreeFromParent()
              }
              newlyCreatedEmptyTabNode.supressUnexpectedIdErrorOnChromeRemovedEvent();
              newWinNode.deleteEmptyTabIdAfterAnyMoveTabOrCreateTabSucceded = newlyCreated_chromeTabObj.id
            }
          }
        }
        nodeWithOurAlifeWindow._f_isWhantRequestTabsMove = true;
        _this_activetree.executeWaitedChromeOperations([nodeWithOurAlifeWindow]);
        window.chrome.windows.update(ourTabsoutlinerWindow_chromeWindowObj.id, {"focused":true})
      })
    })
  };
  tree.findActiveWindowIdForTabId = function(tabId) {
    var activeTab = this.findActiveTab(tabId);
    var tabsOrganizer = activeTab && activeTab.findFirstSavedOrOpenTabsOrganizerInPathToRoot(tabId - 1);
    return tabsOrganizer && (tabsOrganizer.chromeWindowObj && tabsOrganizer.chromeWindowObj.id)
  };
  tree.createNodeNote = function(text) {
    return new NodeNote({"note":text == undefined ? "#" : text})
  };
  tree.createNodeSeparator = function() {
    return new NodeSeparatorLine
  };
  tree.createNodeGroup = function() {
    return new NodeGroup
  };
  tree.gdoc_ = function() {
    return new ActionLinkModelBase(function() {
      return new NodeTabSaved({"url":"https://docs.google.com/document/create", "title":"Untitled document"})
    }, function(node, treeView) {
      node.setCustomColor("#4986E7", "#3460AA");
      node.onNodeDblClicked(tree, treeView)
    })
  };
  tree.note_ = function() {
    return new ActionLinkModelBase(function() {
      return new NodeNote
    }, function(node, treeView) {
      node.onNodeDblClicked(tree, treeView)
    })
  };
  tree.openwin_ = function() {
    return new ActionLinkModelBase(function() {
      return new NodeWindowSaved
    }, function(node, treeView) {
      node.onNodeDblClicked(tree, treeView)
    })
  };
  tree.savedwin_ = function() {
    return new ActionLinkModelBase(function() {
      return new NodeWindowSaved
    }, function(node, treeView, data) {
      if(data) {
        node.setCustomTitle(data.title)
      }
    })
  };
  tree.group_ = function() {
    return new ActionLinkModelBase(function() {
      return new NodeGroup
    }, function(node, treeView, data) {
      if(data) {
        node.setCustomTitle(data.title)
      }
    })
  };
  tree.separator_ = function() {
    return new ActionLinkModelBase(function() {
      return new NodeSeparatorLine
    }, function(node, treeView, data) {
      if(data) {
        node.setSeparatorStyleFromText(data.title)
      }
    })
  };
  tree.link_ = function() {
    return new ActionLinkModelBase(function(data) {
      return new NodeTabSaved({"url":data.url, "title":data.title})
    })
  };
  tree.textline_ = function() {
    return new ActionLinkModelBase(function(data) {
      return new NodeNote({"note":data.title})
    })
  };
  tree.onTabIdReplaced = function(lastKnownActiveTabId, newTabId) {
    var tabNodeToReplace = this.findActiveTab(lastKnownActiveTabId);
    if(!tabNodeToReplace) {
      console.error("ERROR !! NOT UZT");
      return null
    }
    var newChromeTabObj = tabNodeToReplace.chromeTabObj;
    newChromeTabObj["id"] = newTabId;
    return tabNodeToReplace.replaceSelfInTreeBy_mergeSubnodesAndMarks(new NodeTabActive(newChromeTabObj))
  };
  tree.replaceTabInWindowByNewlyCreatedRequestedTab_orAttachWaitTab = function(windowNode, nodeToReplace, newlyCreated_chromeTabObj) {
    var newlyCreatedTabNode = windowNode.findAlifeTabInOwnTabsById(newlyCreated_chromeTabObj.id);
    if(newlyCreatedTabNode) {
      nodeToReplace.replaceSelfInTreeBy_mergeSubnodesAndMarks(newlyCreatedTabNode)
    }else {
      nodeToReplace.replaceSelfInTreeBy_mergeSubnodesAndMarks(new NodeTabActive(newlyCreated_chromeTabObj))
    }
  };
  tree.onActiveTabRemoved = function(tabId, isWindowClosingInfo, doNotReportNoIdError) {
    var tabNode = this.findActiveTab(tabId);
    if(!tabNode) {
      if(!doNotReportNoIdError && window.chrome.extension.getBackgroundPage().isRemovedTabIdUnexpected(tabId)) {
        console.error("Error - removeTabNodeFromTree called with unexisted in tree tabid:", tabId)
      }
      return
    }
    var closedWindowNode;
    if(isWindowClosingInfo && isWindowClosingInfo["isWindowClosing"]) {
      closedWindowNode = this.findActiveWindow(isWindowClosingInfo["windowId"]);
      if(!closedWindowNode) {
        if(!doNotReportNoIdError && window.chrome.extension.getBackgroundPage().isRemovedWindowIdUnexpected(isWindowClosingInfo["windowId"])) {
          console.error("Error - removeTabNodeFromTree called with unexisted in tree windowId during windowClose:", isWindowClosingInfo["windowId"])
        }
      }
    }
    tabNode.onAlifeTabClosedByChrome_removeSelfAndPromoteSubnodesInPlace_orConvertToSavedIfMarksOrTextNodesPresent(closedWindowNode)
  };
  tree.onActiveWindowRemoved = function(windowId, doNotReportNoIdError) {
    var winNode = this.findActiveWindow(windowId);
    if(!winNode) {
      if(!doNotReportNoIdError && window.chrome.extension.getBackgroundPage().isRemovedWindowIdUnexpected(windowId)) {
        console.error("Error - obtain fromChrome_onWindowRemoved for unexisted in tree winid:", windowId)
      }
      return
    }
    winNode.onAlifeWindowClosedByChrome_removeSelfAndPromoteSubnodesInPlace_orConvertToSavedIfMarksOrTextNodesPresent()
  };
  return tree
}
var NodeModelBase = Class.extend({init:function(type, titleBackgroundCssClass) {
  var nowTime = Date.now();
  this.resetStructureDids();
  this.titleCssClass = type;
  this.titleBackgroundCssClass = !!titleBackgroundCssClass ? titleBackgroundCssClass : "defaultFrame";
  this.type = type;
  this.colapsed = false;
  this.marks = {relicons:[]};
  this.created = nowTime;
  this.lastmod = nowTime;
  this.parent = null;
  this.subnodes = [];
  this.observers = [];
  this.isLink = false;
  this.isProtectedFromGoneOnCloseCache = false;
  this.hoveringMenuActions = {};
  this.hoveringMenuActions[hoveringMenuDeleteAction.id] = hoveringMenuDeleteAction;
  this.hoveringMenuActions[hoveringMenuSetCursorAction.id] = hoveringMenuSetCursorAction
}, resetStructureDids:function() {
  this.dId = 0;
  this.cdId = 0;
  this.sdId = 0;
  this.sdIdKnot = null
}, isAnOpenTab:function() {
  return false
}, isAnOpenWindow:function() {
  return false
}, isSavedOrOpenTabsOrganizer:function(forTabsInChromeWindowId) {
  return false
}, getHoveringMenuActions:function() {
  var r = this.hoveringMenuActions;
  if(this.colapsed && !this.hoveringMenuActions[hoveringMenuCloseAction.id]) {
    var stat = this.countSubnodes({"nodesCount":0, "activeWinsCount":0, "activeTabsCount":0});
    if(stat["activeTabsCount"] > 0) {
      r = oneLevelObjectClone(this.hoveringMenuActions);
      r[hoveringMenuCloseAction.id] = hoveringMenuCloseAction
    }
  }
  return r
}, notifyTreeModelAboutUpdate_invalidateDids:function(isNodeContentUpdated_falseIfOnlyTheStructure) {
  var treeModel = this.getTreeModelFromRoot_invalidateDids(isNodeContentUpdated_falseIfOnlyTheStructure);
  if(treeModel) {
    treeModel.hierarchyUpdated()
  }
  return treeModel
}, notifyObserversDeffered:function() {
  var _arguments = arguments;
  var _this = this;
  setTimeout(function() {
    _this._notifyObservers(_arguments)
  }, 200)
}, notifyObservers:function() {
  this._notifyObservers(arguments)
}, _notifyObservers:function(parameters) {
  var args = Array.prototype.slice.apply(parameters);
  var callbackName = args.shift();
  for(var oi = 0;oi < this.observers.length;oi++) {
    var observer = this.observers[oi];
    try {
      if(observer.ownerDocument.defaultView) {
        if(observer[callbackName]) {
          observer[callbackName].apply(observer, args)
        }
      }
    }catch(error) {
      console.error("ERROR on observers notify", callbackName, args, error, error.stack);
      console.log(error.message);
      console.log(error.stack)
    }
  }
}, deleteDeadObservers:function(currentlyClosedDocument) {
  this.observers = this.observers.filter(function(observer) {
    if(!observer.ownerDocument || (!observer.ownerDocument.defaultView || observer.ownerDocument == currentlyClosedDocument)) {
      return false
    }else {
      return true
    }
  })
}, requestScrollNodeToViewInAutoscrolledViews:function() {
  var nodeToScroll = this.findFirstCollapsedNodeInPathFromRoot();
  if(!nodeToScroll) {
    nodeToScroll = this
  }
  nodeToScroll.notifyObservers("fromModel_requestScrollNodeToViewInAutoscrolledViews")
}, setCollapsing:function(newCollapsingState) {
  if(this.subnodes.length == 0) {
    newCollapsingState = false
  }
  if(newCollapsingState === this.colapsed) {
    return
  }
  this.colapsed = newCollapsingState;
  this.notifyObservers("fromModel_onSubnodesCollapsingStatusChanged");
  var treeModel = this.notifyTreeModelAboutUpdate_invalidateDids(true)
}, getMarksClone:function() {
  var r_marks = oneLevelObjectClone(this.marks);
  r_marks.relicons = this.marks.relicons.slice(0);
  return r_marks
}, setNewMarksObject_notifyObserversAndPersitenceManager:function(immutableMarksObject_MustNotBeChangedInFuture) {
  this.marks = immutableMarksObject_MustNotBeChangedInFuture;
  this.calculateIsProtectedFromGoneOnClose();
  if(this.parent) {
    this.notifyObservers("fromModel_onNodeUpdated");
    this.notifyTreeModelAboutUpdate_invalidateDids(true)
  }
}, setCustomColor:function(colorStringActive, colorStringSaved) {
  var new_marks = this.getMarksClone();
  new_marks.customColorActive = colorStringActive;
  new_marks.customColorSaved = colorStringSaved;
  this.setNewMarksObject_notifyObserversAndPersitenceManager(new_marks)
}, notifyAllCollapsedInPathToRoot:function(observerName) {
  for(var testednode = this.parent;testednode;testednode = testednode.parent) {
    if(testednode.colapsed) {
      testednode.notifyObservers(observerName)
    }
  }
}, setCursorHereOrToFirstCollapsedParent:function(ICursorOwner, doNotScrollView) {
  var targetNode = this;
  for(var testednode = this.parent;testednode;testednode = testednode.parent) {
    if(testednode.colapsed) {
      targetNode = testednode
    }
  }
  targetNode.notifyObservers("fromModel_setCursorHere", ICursorOwner, doNotScrollView)
}, removeCursorStyles:function(ICursorOwner) {
  this.notifyObservers("fromModel_removeCursorStyles", ICursorOwner)
}, removeSubnode:function(nodeToDelete) {
  var nodeToDeleteIndex = this.subnodes.indexOf(nodeToDelete);
  if(nodeToDeleteIndex < 0) {
    throw"Error deleteSubnode() cannot find specified nodeToDelete in subnodes list";
  }
  var removedElement = this.subnodes.splice(nodeToDeleteIndex, 1)[0];
  removedElement.parent = null;
  forEachNodeInTree_noChangesInTree([removedElement], clearObserver);
  this.calculateIsProtectedFromGoneOnClose();
  this.notifyObservers("fromModel_onSubnodeDeleted", removedElement, nodeToDeleteIndex, this.subnodes.length === nodeToDeleteIndex, this.subnodes.length === 0);
  this.notifyAllCollapsedInPathToRoot("fromModel_onChangesInSubnodesTrees");
  this.notifyTreeModelAboutUpdate_invalidateDids(false);
  return removedElement;
  function clearObserver(nodeModel) {
    nodeModel.observers = []
  }
}, removeOwnTreeFromParent:function() {
  if(!this.parent) {
    if(console) {
      console.error("Trying to delete node without parent, (it's ok and expected during paste hierarchy) ")
    }
    return
  }
  return this.parent.removeSubnode(this)
}, insertSubnode:function(subnodeIndex, newNode, isInsertedDuringDeserializeFromDb) {
  if(!newNode) {
    console.error("ERROR - node.insertSubnode called without newNode");
    return null
  }
  var newNodeIndex = subnodeIndex === -1 || subnodeIndex > this.subnodes.length ? this.subnodes.length : subnodeIndex;
  var isStartNewList = this.subnodes.length === 0;
  forEachNodeInTree_noChangesInTree([newNode], function(nodeModel) {
    nodeModel.observers = [];
    nodeModel.resetStructureDids()
  });
  this.subnodes.splice(newNodeIndex, 0, newNode);
  if(newNode.parent) {
    console.error("ERROR - Parent in inserted node already present!", this, subnodeIndex, newNode)
  }
  newNode.parent = this;
  this.calculateIsProtectedFromGoneOnClose();
  if(!isInsertedDuringDeserializeFromDb) {
    this.notifyObservers("fromModel_onSubnodeInserted", newNode, newNodeIndex, newNodeIndex === this.subnodes.length - 1, isStartNewList);
    this.notifyAllCollapsedInPathToRoot("fromModel_onChangesInSubnodesTrees");
    this.notifyTreeModelAboutUpdate_invalidateDids(false)
  }
  return newNode
}, insertCopyAsSubnode_MoveCursor:function(subnodeIndex, newNode, originalNode, isMoveOperation) {
  var r = this.insertSubnode(subnodeIndex, newNode, false);
  if(isMoveOperation) {
    originalNode.notifyObservers("fromModel_onCopyPlacedDuringMove_TransferCursor", r)
  }
  return r
}, deleteHierarchy_MoveCursor:function() {
  this.notifyObservers("fromModel_onBeforeDeleteHierarchy_MoveCursor");
  return this.removeOwnTreeFromParent()
}, insertAsFirstSubnode:function(newNode) {
  return this.insertSubnode(0, newNode)
}, insertAsLastSubnode:function(newNode) {
  return this.insertSubnode(-1, newNode)
}, insertParent:function(newParentToInsertBeforeAs) {
  var targetPoint = this.getTargetPointInParent();
  var ourTree = this.removeOwnTreeFromParent();
  newParentToInsertBeforeAs.insertAsLastSubnode(ourTree);
  return targetPoint.container.insertSubnode(targetPoint.position, newParentToInsertBeforeAs)
}, insertAsPreviousSibling:function(newSiblingNode) {
  var insertIndex = this.parent.subnodes.indexOf(this);
  return this.parent.insertSubnode(insertIndex, newSiblingNode)
}, insertAsNextSibling:function(newSiblingNode) {
  var insertIndex = this.parent.subnodes.indexOf(this) + 1;
  return this.parent.insertSubnode(insertIndex, newSiblingNode)
}, findAllTabsOrganizersInsideHierarchy:function(searchResults) {
  for(var i = 0;i < this.subnodes.length;i++) {
    var node = this.subnodes[i];
    if(node.isSavedOrOpenTabsOrganizer()) {
      searchResults.push(node)
    }
    node.findAllTabsOrganizersInsideHierarchy(searchResults)
  }
}, findNodeOnPrevRow:function() {
  var parent = this.parent;
  if(!parent) {
    return null
  }
  var ourIndex = parent.subnodes.indexOf(this);
  if(ourIndex === 0) {
    return parent
  }else {
    return parent.subnodes[ourIndex - 1].findLastNodeInHierarhy()
  }
}, findPrevSibling:function() {
  var parent = this.parent;
  if(!parent) {
    return null
  }
  var ourIndex = parent.subnodes.indexOf(this);
  if(ourIndex === 0) {
    return null
  }else {
    return parent.subnodes[ourIndex - 1]
  }
}, findPrevSibling_ifAbsent_parent:function() {
  var r = this.findPrevSibling();
  if(!r) {
    return this.parent
  }else {
    return r
  }
}, findNodeOnNextRow:function(stayInParentBounds) {
  if(!this.colapsed && this.subnodes.length > 0) {
    return this.subnodes[0]
  }else {
    return this.findNextSibling_ifAbsent_anyParentsNextSibling(stayInParentBounds)
  }
}, findNextSibling_ifAbsent_anyParentsNextSibling:function(stayInParentBounds) {
  var parent = this.parent;
  if(!parent) {
    return null
  }
  var ourIndex = parent.subnodes.indexOf(this);
  if(ourIndex + 1 < parent.subnodes.length) {
    return parent.subnodes[ourIndex + 1]
  }else {
    return stayInParentBounds ? null : parent.findNextSibling_ifAbsent_anyParentsNextSibling(false)
  }
}, findLastNodeInHierarhy:function() {
  if(this.subnodes.length === 0) {
    return this
  }
  return this.subnodes[this.subnodes.length - 1].findLastNodeInHierarhy()
}, removeSelfAndPromoteSubnodesInPlace:function() {
  this.notifyObservers("fromModel_onBeforeRemoveSelfAndPromoteSubnodesInPlace_MoveCursor");
  var parent = this.parent;
  var insertPosition = parent.subnodes.indexOf(this);
  var deletedHierarchy = this.removeOwnTreeFromParent();
  var subnodesFromDeleteHierachy = deletedHierarchy.subnodes.slice(0);
  subnodesFromDeleteHierachy.forEach(function(node) {
    parent.insertSubnode(insertPosition++, node.removeOwnTreeFromParent())
  });
  return deletedHierarchy
}, replaceSelfInTreeBy_mergeSubnodesAndMarks:function(nodeWhichReplaceThis) {
  var parent = this.parent;
  if(nodeWhichReplaceThis.subnodes.length > 0 || nodeWhichReplaceThis.marks.relicons.length > 0) {
    console.log("WARNING - replacer have subnodes or icons, its strange")
  }
  if(nodeWhichReplaceThis.parent) {
    nodeWhichReplaceThis.removeOwnTreeFromParent()
  }
  var replaceIndex = parent.subnodes.indexOf(this);
  this.notifyObservers("fromModel_onBeforeReplaced_RememberCursor");
  this.removeOwnTreeFromParent();
  nodeWhichReplaceThis.mergeSubnodesAndCopyMarksFrom(this);
  var r = parent.insertSubnode(replaceIndex, nodeWhichReplaceThis);
  r.notifyObservers("fromModel_onAfterReplaced_SetCursor");
  return r
}, mergeSubnodesAndCopyMarksFrom:function(source) {
  for(var i = source.subnodes.length - 1;i >= 0;i--) {
    this.insertSubnode(0, source.subnodes[i].removeOwnTreeFromParent())
  }
  this.copyMarksAndCollapsedFrom(source)
}, flattenTabsHierarchy_skipTabsOrganizers:function() {
  var parent = this;
  var currentNodeModel = parent.subnodes[0];
  var nodes = [];
  while(true) {
    if(!currentNodeModel || !currentNodeModel.isSupliedNodePresentInPathToRoot(parent)) {
      break
    }
    if(currentNodeModel.parent == parent || isLinkOrSeparatorOnLink(currentNodeModel)) {
      nodes.push(currentNodeModel)
    }
    if(currentNodeModel.isSavedOrOpenTabsOrganizer()) {
      currentNodeModel = currentNodeModel.findNextSibling_ifAbsent_anyParentsNextSibling(false)
    }else {
      currentNodeModel = currentNodeModel.findNodeOnNextRow(false)
    }
  }
  for(var i = nodes.length - 1;i >= 0;i--) {
    var node = nodes[i];
    node.removeOwnTreeFromParent();
    parent.insertAsFirstSubnode(node)
  }
  function isLinkOrSeparatorOnLink(nodeModel) {
    return nodeModel instanceof NodeTabBase || nodeModel instanceof NodeSeparatorLine && nodeModel.parent instanceof NodeTabBase
  }
}, liberateToLevelDownWithOwnHierarchy:function() {
  var parent = this.parent;
  this.removeOwnTreeFromParent();
  return parent.insertAsNextSibling(this)
}, calculateIsProtectedFromGoneOnClose:function() {
  return this.isProtectedFromGoneOnCloseCache = false
}, isCustomMarksPresent:function() {
  return this.marks.relicons.length > 0 || (this.marks.customFavicon != undefined || (this.marks.customTitle != undefined || (this.marks.customColorActive != undefined || this.marks.customColorSaved != undefined)))
}, isSomethingExeptUnmarkedActiveTabPresentInDirectSubnodes:function() {
  for(var i = 0;i < this.subnodes.length;i++) {
    var directSubnode = this.subnodes[i];
    if(directSubnode.type !== NodeTypesEnum.TAB) {
      return true
    }
    if(directSubnode.isCustomMarksPresent()) {
      return true
    }
  }
  return false
}, cloneForCopyInActiveTree_withoutSubnodes:function() {
  return this.copyConstructor_withoutSubnodes()
}, getIcon:function() {
  return null
}, getIconForHtmlExport:function() {
  return null
}, getNodeContentCssClass:function() {
  return null
}, getNodeTextCustomStyle:function() {
  if(this.type === NodeTypesEnum.TAB || this.type === NodeTypesEnum.WINDOW) {
    return this.marks.customColorActive ? "color:" + this.marks.customColorActive : null
  }else {
    return this.marks.customColorSaved ? "color:" + this.marks.customColorSaved : null
  }
}, getNodeText:function(isForEditPromt) {
  console.error("ERROR getNodeText is not overriden", this);
  return""
}, getTooltipText:function() {
  return""
}, getHref:function() {
  return""
}, isProtectedFromGoneOnClose:function() {
  return this.isProtectedFromGoneOnCloseCache
}, isSelectedTab:function() {
  return false
}, isFocusedWindow:function() {
  return false
}, countSelf:function(statData) {
  statData["nodesCount"] = statData["nodesCount"] ? statData["nodesCount"] + 1 : 1
}, countSubnodes:function(statData) {
  for(var i = 0;i < this.subnodes.length;i++) {
    this.subnodes[i].countSelf(statData);
    this.subnodes[i].countSubnodes(statData)
  }
  return statData
}, copyConstructor_withoutSubnodes:function() {
  console.error("ERROR NodeModelBase::copyConstructor_withoutSubnodes() was not overriden");
  return null
}, copyMarksAndCollapsedFrom:function(sourceNode) {
  this.colapsed = sourceNode.colapsed;
  var new_marks = sourceNode.getMarksClone();
  new_marks.relicons = new_marks.relicons.concat(this.marks.relicons);
  if(!new_marks.customTitle) {
    new_marks.customTitle = this.marks.customTitle
  }
  if(!new_marks.customFavicon) {
    new_marks.customFavicon = this.marks.customFavicon
  }
  this.setNewMarksObject_notifyObserversAndPersitenceManager(new_marks);
  return this
}, deserializeMarksAndCollapsed:function(serializedNodeData) {
  this.colapsed = !!serializedNodeData["colapsed"];
  if(serializedNodeData["marks"]) {
    this.marks = oneLevelObjectClone(serializedNodeData["marks"]);
    this.marks.relicons = serializedNodeData["marks"]["relicons"].slice(0)
  }else {
    this.marks = {};
    this.marks.relicons = []
  }
  if(!!this.marks["U"]) {
    this.marks.customColorActive = this.marks["U"];
    delete this.marks["U"]
  }
  if(!!this.marks["V"]) {
    this.marks.customColorSaved = this.marks["V"];
    delete this.marks["V"]
  }
  if(!!this.marks["J"]) {
    this.marks.customTitle = this.marks["J"];
    delete this.marks["J"]
  }
  if(!!this.marks["u"]) {
    this.marks.customFavicon = this.marks["u"];
    delete this.marks["u"]
  }
  if(!!this.marks["W"]) {
    this.marks.customTitle = this.marks["W"];
    delete this.marks["W"]
  }
  if(!!this.marks["I"]) {
    this.marks.customFavicon = this.marks["I"];
    delete this.marks["I"]
  }
  this.calculateIsProtectedFromGoneOnClose();
  return this
}, serialize:function() {
  var r = {};
  if(this.dId) {
    r["dId"] = this.dId
  }
  if(this.cdId) {
    r["cdId"] = this.cdId
  }
  if(this.sdId) {
    r["sdId"] = this.sdId
  }
  if(this.sdIdKnot) {
    r["sdIdKnot"] = this.sdIdKnot
  }
  if(this.type !== NodeTypesEnum.SAVEDTAB) {
    r["type"] = this.type
  }
  if(Object.keys(this.marks).length > 1 || this.marks.relicons.length > 0) {
    r["marks"] = this.marks
  }
  if(this.colapsed) {
    r["colapsed"] = this.colapsed
  }
  r["data"] = this.polymorficSerializeData();
  return r
}, polymorficSerializeData:function() {
  var r = null;
  if(this.persistentData) {
    r = oneLevelObjectClone(this.persistentData)
  }
  return r
}, serializeNodeBodyContent_forDiff:function() {
  var normalserialize = this.serialize();
  var r = [NodesTypesEnumStr2Num[this.type] * (this.colapsed ? -1 : 1), normalserialize["data"]];
  if(normalserialize["marks"]) {
    r.push(normalserialize["marks"])
  }
  return JSON.stringify(r)
}, serializeNodeStructureAndSubnodesChanges_forDiff:function() {
  var r = [i2s36(this.cdId)];
  if(this.sdId) {
    if(this.sdId === this.dId) {
      r[0] += CDID_SUBNODESLIST_SEPARATOR + this.serializeNodeSubnodesList_forDiff()
    }else {
      r[0] += CDID_SDID_SEPARATOR + i2s36(this.sdId);
      var baseSubnodesList = getBaseSubnodesArray(this.sdIdKnot);
      var currentSubnodesList = this.getSubnodesDidsArray();
      if(SybnodesChangesMonitor_isChangesToBase(currentSubnodesList, baseSubnodesList)) {
        r.push(SybnodesChangesMonitor_serializeCurSubnodes(currentSubnodesList, baseSubnodesList))
      }
    }
  }
  return r.join(CDIDSDID_SUBNODESBASEMODIFICATIONS_SEPARATOR)
}, serializeNodeSubnodesList_forDiff:function() {
  return this.getSubnodesDidsArray().join(SUBNODES_DIDS_SEPARATOR)
}, serializeForDiff:function(startingDId, differenceAccumulator) {
  var knot = this.serializeNodeStructureAndSubnodesChanges_forDiff();
  addToCollectionUnderS36Key(differenceAccumulator, "k", this.dId, knot);
  if(this.sdId === this.dId) {
    this.sdIdKnot = knot
  }
  if(this.sdId >= startingDId && this.sdId !== this.dId) {
    addToCollectionUnderS36Key(differenceAccumulator, "k", this.sdId, this.sdIdKnot)
  }
  if(this.cdId >= startingDId) {
    addToCollectionUnderS36Key(differenceAccumulator, "c", this.cdId, this.serializeNodeBodyContent_forDiff())
  }
}, getSubnodesDidsArray:function() {
  var r = [];
  for(var i = 0;i < this.subnodes.length;i++) {
    r.push(i2s36(this.subnodes[i].dId))
  }
  return r
}, isNotCoveredByWindowActiveTabsPresentInHierarchy:function() {
  if(this.isSavedOrOpenTabsOrganizer() || this.isAnOpenWindow()) {
    return false
  }
  if(this.isAnOpenTab()) {
    return true
  }
  for(var i = 0;i < this.subnodes.length;++i) {
    if(this.subnodes[i].isNotCoveredByWindowActiveTabsPresentInHierarchy()) {
      return true
    }
  }
  return false
}, getTreeModelFromRoot_invalidateDids:function(isCurrentNodeContentAffected) {
  if(isCurrentNodeContentAffected) {
    this.cdId = 0
  }
  var testednode = this;
  testednode.dId = 0;
  while(testednode.parent) {
    testednode = testednode.parent;
    testednode.dId = 0
  }
  return testednode.treeModel
}, isSupliedNodePresentInPathToRoot:function(nodeModel) {
  var testednode = this;
  while(testednode.parent) {
    testednode = testednode.parent;
    if(testednode === nodeModel) {
      return true
    }
  }
  return false
}, getPathToRoot:function() {
  var rPath = [];
  var testednode = this;
  while(testednode.parent) {
    rPath.push(testednode.parent.subnodes.indexOf(testednode));
    testednode = testednode.parent
  }
  return rPath.reverse()
}, isOnRootSubnodesLevel:function() {
  return this.parent && this.parent.parent == null
}, findFirstSavedOrOpenTabsOrganizerInPathToRoot:function(forTabInChromeWindowId) {
  for(var testednode = this;testednode;testednode = testednode.parent) {
    if(testednode.isSavedOrOpenTabsOrganizer(forTabInChromeWindowId)) {
      return testednode
    }
  }
  return null
}, findFirstCollapsedNodeInPathFromRoot:function() {
  var r = null;
  for(var testednode = this.parent;testednode;testednode = testednode.parent) {
    if(testednode.colapsed) {
      r = testednode
    }
  }
  return r
}, findPathStartNodeInRoot:function() {
  for(var testednode = this;testednode.parent.parent;testednode = testednode.parent) {
  }
  return testednode
}, getTargetPointInParent:function() {
  var container = this.parent;
  return{"container":container, "position":container.subnodes.indexOf(this)}
}, isDropAllowed:function(position, dropedNodeModel) {
  return true
}, onNodeDblClicked:function(treeModel, treeView) {
}, performChromeRemove:function(protectFromDeleteOnChromeRemovedEvent) {
}, protectFromDeleteOnClose:function(storeCloseTimeOnClose) {
  this._f_convertToSavedOnClose = true;
  this._f_storeCloseTimeOnClose = storeCloseTimeOnClose;
  this.calculateIsProtectedFromGoneOnClose();
  this.notifyObservers("fromModel_onNodeUpdated")
}, setTheWasSavedOnWinCloseFlagForAlternativeRestore:function() {
}, supressUnexpectedIdErrorOnChromeRemovedEvent:function() {
}, EOC:null});
function findNodeById(nodesarray, id) {
  return findNode(nodesarray, function(node) {
    return node.id === id
  })
}
function findNode(nodesarray, condition) {
  for(var i = 0;i < nodesarray.length;i++) {
    if(condition(nodesarray[i])) {
      return nodesarray[i]
    }
  }
  for(i = 0;i < nodesarray.length;i++) {
    var node = findNode(nodesarray[i].subnodes, condition);
    if(node) {
      return node
    }
  }
  return null
}
function isSameNodeOrPresentInPathToRoot(dropTargetContainer, dropedNode) {
  for(var testnode = dropTargetContainer;testnode;testnode = testnode.parent) {
    if(testnode === dropedNode) {
      return true
    }
  }
  return false
}
function forEachNodeInTree_noChangesInTree(nodes, nodeObserverFn) {
  for(var i = 0;i < nodes.length;++i) {
    var node = nodes[i];
    var originalnode_subnodes = node.subnodes;
    nodeObserverFn(node);
    if(originalnode_subnodes.length > 0) {
      forEachNodeInTree_noChangesInTree(originalnode_subnodes, nodeObserverFn)
    }
  }
}
function forEachNodeInTree_skipSubnodesTraversalOnFalse__noChangesInTree(nodes, nodeObserverFn) {
  for(var i = 0;i < nodes.length;++i) {
    var node = nodes[i];
    var originalnode_subnodes = node.subnodes;
    var isNeedScanSubTree = nodeObserverFn(node);
    if(isNeedScanSubTree && originalnode_subnodes.length > 0) {
      forEachNodeInTree_skipSubnodesTraversalOnFalse__noChangesInTree(originalnode_subnodes, nodeObserverFn)
    }
  }
}
var NodeTypesEnum = {TAB:"tab", SAVEDTAB:"savedtab", WAITINGTAB:"waitingtab", ATTACHWAITINGTAB:"attachwaitingtab", WINDOW:"win", SAVEDWINDOW:"savedwin", WAITINGWINDOW:"waitingwin", SESSION:"session", TEXTNOTE:"textnote", SEPARATORLINE:"separatorline", GROUP:"group"};
var NodesTypesEnumNum2Str = ["ZERO", NodeTypesEnum.SESSION, NodeTypesEnum.TEXTNOTE, NodeTypesEnum.SEPARATORLINE, NodeTypesEnum.TAB, NodeTypesEnum.SAVEDTAB, NodeTypesEnum.GROUP, NodeTypesEnum.WINDOW, NodeTypesEnum.SAVEDWINDOW, NodeTypesEnum.ATTACHWAITINGTAB, NodeTypesEnum.WAITINGWINDOW, NodeTypesEnum.WAITINGTAB];
var NodesTypesEnumStr2Num = function(array) {
  var r = {};
  for(var ijk = 0;ijk < array.length;ijk++) {
    r[array[ijk]] = ijk
  }
  return r
}(NodesTypesEnumNum2Str);
var noFavIconUrl = "img/nofavicon.png";
var chromeWindowRgbFavIconUrl = "img/chrome-window-icon-rgb.png";
function makeFaviconUrl(chromeTabObj) {
  if(!chromeTabObj.favIconUrl) {
    return noFavIconUrl
  }
  if(chromeTabObj.url.indexOf("chrome") === 0) {
    if(chromeTabObj.url.indexOf("chrome-devtools:") === 0) {
      return chromeWindowRgbFavIconUrl
    }
    if(chromeTabObj.favIconUrl.indexOf("chrome://theme/") === 0) {
      return chromeWindowRgbFavIconUrl
    }
    return chromeTabObj.favIconUrl
  }
  return chrome.extension ? "chrome://favicon/" + chromeTabObj.url : httpsTheFavicon(chromeTabObj.favIconUrl)
}
function httpsTheFavicon(favIconUrl) {
  return favIconUrl
}
function NodeTabActive_focusThisTab_withoutScrollToView() {
  window.chrome.extension.getBackgroundPage().focusTab(this.chromeTabObj.windowId, this.chromeTabObj.id, null, true)
}
function NodeWindowActive_focusThisWindow_withoutScrollToView() {
  window.chrome.extension.getBackgroundPage().focusWindow(this.chromeWindowObj.id, true)
}
function deserializeNode(serializedNodeData) {
  var r;
  var type = serializedNodeData["type"];
  if(!type) {
    type = NodeTypesEnum.SAVEDTAB
  }
  var data = serializedNodeData["data"];
  switch(type) {
    case NodeTypesEnum.SESSION:
      r = new NodeSession(data);
      break;
    case NodeTypesEnum.TAB:
      r = new NodeTabActive(data);
      break;
    case NodeTypesEnum.SAVEDTAB:
      r = new NodeTabSaved(data);
      break;
    case NodeTypesEnum.WINDOW:
      r = new NodeWindowActive(data);
      break;
    case NodeTypesEnum.SAVEDWINDOW:
      r = new NodeWindowSaved(data);
      break;
    case NodeTypesEnum.SEPARATORLINE:
      r = new NodeSeparatorLine(data);
      break;
    case NodeTypesEnum.TEXTNOTE:
      r = new NodeNote(data);
      break;
    case NodeTypesEnum.GROUP:
      r = new NodeGroup(data);
      break;
    default:
      console.error("Imposible saved node encountered", serializedNodeData);
      return null
  }
  r.deserializeMarksAndCollapsed(serializedNodeData);
  if(serializedNodeData["dId"]) {
    r.dId = serializedNodeData["dId"]
  }
  if(serializedNodeData["cdId"]) {
    r.cdId = serializedNodeData["cdId"]
  }
  if(serializedNodeData["sdId"]) {
    r.sdId = serializedNodeData["sdId"]
  }
  if(serializedNodeData["sdIdKnot"]) {
    r.sdIdKnot = serializedNodeData["sdIdKnot"]
  }
  return r
}
function restoreHierarchyFromJSO(savedNode) {
  var restoredNode = deserializeNode(savedNode["n"]);
  if(savedNode["s"]) {
    for(var i = 0;i < savedNode["s"].length;i++) {
      restoredNode.insertSubnode(i, restoreHierarchyFromJSO(savedNode["s"][i]), true)
    }
  }
  return restoredNode
}
function restoreTreeFromOperations(operations) {
  var rootNode = null;
  for(var i = 0;i < operations.length;i++) {
    var op = operations[i];
    var op_type = !!op["type"] ? op["type"] : op[0];
    var op_node = !!op["node"] ? op["node"] : op[1];
    var op_path = !!op["path"] ? op["path"] : op[2];
    if(op_type === DbOperations.OperationsEnum.NODE_NEWROOT) {
      rootNode = deserializeNode(op_node)
    }
    if(op_type === DbOperations.OperationsEnum.NODE_INSERT) {
      insertNodeByPathDuringDeserialize(rootNode, op_path, deserializeNode(op_node))
    }
  }
  return rootNode
}
function insertNodeByPathDuringDeserialize(rootNode, path, newNode) {
  if(path.length < 1) {
    console.error("ERROR insertSubnodeToPath - no path", path, this, newNode)
  }
  var container = rootNode;
  for(var i = 0;i < path.length - 1;i++) {
    container = container.subnodes[path[i]];
    if(!container) {
      console.error("ERROR insertSubnodeToPath - unexisted path", path, this, newNode)
    }
  }
  container.insertSubnode(path[path.length - 1], newNode, true)
}
var NodeSession = NodeModelBase.extend({init:function(persistentData) {
  this._super(NodeTypesEnum.SESSION, "windowFrame");
  this.persistentData = persistentData || {};
  if(!this.persistentData["treeId"]) {
    this.persistentData["treeId"] = "" + (Date.now() + Math.random())
  }
  if(!this.persistentData["nextDId"]) {
    this.persistentData["nextDId"] = 1
  }
  if(!this.persistentData["nonDumpedDId"]) {
    this.persistentData["nonDumpedDId"] = 1
  }
  this.needFaviconAndTextHelperContainer = true;
  delete this.hoveringMenuActions[hoveringMenuDeleteAction.id]
}, getIcon:function() {
  return"img/favicon.png"
}, getNodeText:function(isForEditPromt) {
  return"Current Session"
}, getTooltipText:function() {
  return""
}, getNextDid_andAdvance:function() {
  return this.persistentData["nextDId"]++
}, getNextDid_withoutAdvance:function() {
  return this.persistentData["nextDId"]
}, advanceNextDidToValue:function(v) {
  var lastPreparedToSentDId = Number(v) || 1;
  if(lastPreparedToSentDId > this.persistentData["nextDId"]) {
    this.persistentData["nextDId"] = lastPreparedToSentDId
  }
}, getTreeId:function() {
  return this.persistentData["treeId"]
}, copyConstructor_withoutSubnodes:function() {
  var r = new NodeGroup;
  r.colapsed = false;
  r.setCustomTitle("Tree");
  return r
}, EOC:null});
var NodeTabBase = NodeModelBase.extend({init:function(chromeTabObj, nodeTypesEnumType) {
  this._super(nodeTypesEnumType, "tabFrame");
  this.chromeTabObj = chromeTabObj;
  this.isLink = true;
  this.id = nodeTypesEnumType + chromeTabObj.id;
  this.hoveringMenuActions[hoveringMenuEditTitleAction.id] = hoveringMenuEditTitleAction
}, copyConstructor_withoutSubnodes:function() {
  console.error("ERROR NodeTabBase::copyConstructor_withoutSubnodes() was not overriden");
  return(new NodeTabBase(this.chromeTabObj, this.type)).copyMarksAndCollapsedFrom(this)
}, getIcon:function() {
  return this.chromeTabObj.status === "loading" ? "img/loading.gif" : makeFaviconUrl(this.chromeTabObj)
}, getIconForHtmlExport:function() {
  return this.chromeTabObj.favIconUrl
}, getNodeText:function(isForEditPromt) {
  return this.chromeTabObj.title
}, getTooltipText:function() {
  return""
}, getHref:function() {
  return this.chromeTabObj.url
}, getCustomTitle:function() {
  return this.marks.customTitle
}, editTitle:function(treeView) {
  var _this = this;
  treeView.activatePrompt(_this.getCustomTitle() || "#", function onOk(newText) {
    _this.setCustomTitle(newText)
  })
}, setCustomTitle:function(customTitle) {
  var new_marks = this.getMarksClone();
  if(customTitle != new_marks.customTitle) {
    new_marks.customTitle = customTitle;
    this.setNewMarksObject_notifyObserversAndPersitenceManager(new_marks)
  }
}, isSelectedTab:function() {
  return this.chromeTabObj.active
}, updateChromeTabObj:function(chromeTabObj) {
  var serializedProperties = ["id", "windowId", "url", "title", "favIconUrl"];
  var runtimeAffectingProperties = ["openerTabId", "index", "highlighted", "active", "pinned", "status"];
  var isSerializedPropertiesSame = isPropertiesEqual(this.chromeTabObj, chromeTabObj, serializedProperties);
  if(isSerializedPropertiesSame && isPropertiesEqual(this.chromeTabObj, chromeTabObj, runtimeAffectingProperties)) {
    return
  }
  this.chromeTabObj = chromeTabObj;
  this.notifyObservers("fromModel_onNodeUpdated");
  if(!isSerializedPropertiesSame) {
    this.notifyTreeModelAboutUpdate_invalidateDids(true)
  }
}, serializeChromeTabObjMainPropertiesOnly:function(chromeTabObj) {
  var r = oneLevelObjectClone(chromeTabObj);
  if(r.status === "complete") {
    delete r.status
  }
  if(!r.pinned) {
    delete r.pinned
  }
  if(!r.incognito) {
    delete r.incognito
  }
  if(!r.active) {
    delete r.active
  }
  if(!r.highlighted) {
    delete r.highlighted
  }
  delete r.selected;
  delete r.height;
  delete r.width;
  delete r.index;
  return r
}, polymorficSerializeData:function() {
  var r = null;
  if(this.chromeTabObj) {
    r = this.serializeChromeTabObjMainPropertiesOnly(this.chromeTabObj)
  }
  return r
}, setChromeTabObjActive:function(isActive) {
  if(this.chromeTabObj.active === isActive) {
    return
  }
  var newChromeTabObj = oneLevelObjectClone(this.chromeTabObj);
  newChromeTabObj.active = isActive;
  this.updateChromeTabObj(newChromeTabObj)
}, EOC:null});
var NodeTabSaved = NodeTabBase.extend({init:function(chromeTabObj) {
  this._super(chromeTabObj, NodeTypesEnum.SAVEDTAB);
  if(this.chromeTabObj) {
    this.chromeTabObj.status = "complete"
  }
  if(this.chromeTabObj) {
    delete this.chromeTabObj.windowId
  }
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeTabSaved(this.chromeTabObj)).copyMarksAndCollapsedFrom(this)
}, ensureActivatedSavedOrAlreadyOpenTabsOrganizerIsPresentInPathToRoot:function() {
  var tabsOrganizer = this.parent.findFirstSavedOrOpenTabsOrganizerInPathToRoot();
  if(!tabsOrganizer) {
    tabsOrganizer = new NodeWindowSaved;
    var rootContactPoint = this.findPathStartNodeInRoot().insertParent(tabsOrganizer)
  }
  if(!tabsOrganizer.isRelatedChromeWindowAlive) {
    tabsOrganizer._f_isWhantRequestNewWindowCreation = true
  }
  return tabsOrganizer
}, onNodeDblClicked:function(treeModel) {
  if(treeModel.executeWaitedChromeOperations) {
    var tabsOrganizer = this.ensureActivatedSavedOrAlreadyOpenTabsOrganizerIsPresentInPathToRoot();
    this.set_f_isWhantRequestNewTabCreation();
    this.chromeTabObj.active = true;
    treeModel.executeWaitedChromeOperations([tabsOrganizer])
  }else {
  }
}, replaceSelfInTreeBy_mergeSubnodesAndMarks:function(replacer) {
  if(replacer.chromeTabObj && (!replacer.chromeTabObj.title && this.chromeTabObj.title)) {
    replacer.chromeTabObj.title = this.chromeTabObj.title
  }
  return this._super(replacer)
}, set_f_isWhantRequestNewTabCreation:function(dontRestoreIfWasSavedOnLastWinSave) {
  if(dontRestoreIfWasSavedOnLastWinSave && this.chromeTabObj["wasSavedOnLastWinSave"] === true) {
    this._f_isWhantRequestNewTabCreation = false
  }else {
    this._f_isWhantRequestNewTabCreation = true
  }
}, onAfterCrashRestorationDone:function() {
  delete this.chromeTabObj.id;
  delete this.chromeTabObj.windowId
}, setTheWasSavedOnWinCloseFlagForAlternativeRestore:function() {
  if(this.chromeTabObj) {
    this.chromeTabObj["wasSavedOnLastWinSave"] = true
  }
}, EOC:null});
var NodeTabActive = NodeTabBase.extend({init:function(chromeTabObj) {
  this._super(chromeTabObj, NodeTypesEnum.TAB);
  this.hoveringMenuActions[hoveringMenuCloseAction.id] = hoveringMenuCloseAction;
  this.setTheWasSavedOnWinCloseFlagForAlternativeRestore()
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeTabActive(this.chromeTabObj)).copyMarksAndCollapsedFrom(this)
}, cloneForCopyInActiveTree_withoutSubnodes:function() {
  return(new NodeTabSaved(this.chromeTabObj)).copyMarksAndCollapsedFrom(this)
}, isAnOpenTab:function() {
  return true
}, calculateIsProtectedFromGoneOnClose:NodeActiveBase_calculateIsProtectedFromGoneOnClose, onNodeDblClicked:NodeTabActive_focusThisTab_withoutScrollToView, onAlifeTabClosedByChrome_removeSelfAndPromoteSubnodesInPlace_orConvertToSavedIfMarksOrTextNodesPresent:function(closedWindowNode) {
  if(this.calculateIsProtectedFromGoneOnClose() || closedWindowNode && closedWindowNode.isAllOpenTabsProtectedFromGoneOnWindowClose()) {
    this.replaceSelfInTreeBy_mergeSubnodesAndMarks(new NodeTabSaved(this.chromeTabObj))
  }else {
    this.removeSelfAndPromoteSubnodesInPlace()
  }
}, "request\u0421hromeToMoveTab":function(targetWinId, chromeTabIndex) {
  if(window.debugLogChromeOperations) {
    console.log("NodeTabActive_request\u0421hromeToMoveTab, chromeTabIndex:", chromeTabIndex, "targetWinId:", targetWinId, "this.chromeTabObj.id:", this.chromeTabObj.id)
  }
  var thisTabId = this.chromeTabObj.id;
  window.chrome.tabs.move(thisTabId, {"windowId":targetWinId, "index":chromeTabIndex}, function(movedChromeTabObj) {
    window.chrome.tabs.update(thisTabId, {}, null)
  })
}, countSelf:function(statData) {
  statData["nodesCount"] = statData["nodesCount"] ? statData["nodesCount"] + 1 : 1;
  statData["activeTabsCount"] = statData["activeTabsCount"] ? statData["activeTabsCount"] + 1 : 1
}, updateChromeTabObjOrRequestConvertToSavedIfNotInActiveList:function(chromeActiveWindowObjectsList, listOfTabNodesThatMustBeConvertedToSaved) {
  var ourChromeWindowObjInActiveList = findById(chromeActiveWindowObjectsList, this.chromeTabObj.windowId);
  if(ourChromeWindowObjInActiveList) {
    var ourChromeTabObjInActiveList = findById(ourChromeWindowObjInActiveList.tabs, this.chromeTabObj.id)
  }
  if(ourChromeTabObjInActiveList && ourChromeTabObjInActiveList.url == this.chromeTabObj.url) {
    ourChromeTabObjInActiveList.isUsedByNode = true;
    ourChromeWindowObjInActiveList.haveActiveTabNodesInTree = true;
    this.updateChromeTabObj(ourChromeTabObjInActiveList)
  }else {
    listOfTabNodesThatMustBeConvertedToSaved.push(this)
  }
}, performChromeRemove:function(protectFromDeleteOnChromeRemovedEvent) {
  if(protectFromDeleteOnChromeRemovedEvent) {
    this.protectFromDeleteOnClose(false)
  }
  window.chrome.tabs.remove(this.chromeTabObj.id)
}, supressUnexpectedIdErrorOnChromeRemovedEvent:function() {
  window.chrome.extension.getBackgroundPage().supressUnexpectedRemovedTabIdErrorFor(this.chromeTabObj.id)
}, setTheWasSavedOnWinCloseFlagForAlternativeRestore:function() {
  if(this.chromeTabObj) {
    delete this.chromeTabObj["wasSavedOnLastWinSave"]
  }
}, EOC:null});
var NodeTabSavedAfterCrash = NodeTabSaved.extend({init:function(chromeTabObj) {
  this._super(chromeTabObj);
  this.savedAfterCrashCssClass = true
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeTabSavedAfterCrash(this.chromeTabObj)).copyMarksAndCollapsedFrom(this)
}, EOC:null});
var NodeNote = NodeModelBase.extend({init:function(persistentData) {
  this._super(NodeTypesEnum.TEXTNOTE);
  this.persistentData = {"note":"#"};
  if(persistentData) {
    this.persistentData["note"] = persistentData["note"]
  }
  if(this.persistentData["note"] === undefined) {
    this.persistentData["note"] = ""
  }
  this.hoveringMenuActions[hoveringMenuEditTitleAction.id] = hoveringMenuEditTitleAction
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeNote(this.persistentData)).copyMarksAndCollapsedFrom(this)
}, getNodeText:function(isForEditPromt) {
  return this.persistentData["note"]
}, onNodeDblClicked:function(treeModel, treeView) {
  this.editTitle(treeView)
}, editTitle:function(treeView) {
  var _this = this;
  treeView.activatePrompt(this.getNodeText(true), function onOk(newText) {
    if(newText.toLowerCase().indexOf("2g ") == 0) {
      _this.replaceSelfInTreeBy_mergeSubnodesAndMarks(makeGroup(newText))
    }else {
      if(newText.indexOf("----") == 0) {
        _this.replaceSelfInTreeBy_mergeSubnodesAndMarks(new NodeSeparatorLine({"separatorIndx":0}))
      }else {
        if(newText.indexOf("====") == 0) {
          _this.replaceSelfInTreeBy_mergeSubnodesAndMarks(new NodeSeparatorLine({"separatorIndx":1}))
        }else {
          if(newText.indexOf("....") == 0) {
            _this.replaceSelfInTreeBy_mergeSubnodesAndMarks(new NodeSeparatorLine({"separatorIndx":2}))
          }else {
            _this.setNodeTitle(newText)
          }
        }
      }
    }
  });
  function makeGroup(titleStrWith2g) {
    var r = new NodeGroup;
    r.setCustomTitle(titleStrWith2g.substr("2g ".length));
    return r
  }
}, setNodeTitle:function(newText) {
  this.persistentData["note"] = newText;
  this.notifyObservers("fromModel_onNodeUpdated");
  this.notifyTreeModelAboutUpdate_invalidateDids(true)
}, EOC:null});
var NodeSeparatorLine = NodeModelBase.extend({init:function(persistentData) {
  this._super(NodeTypesEnum.SEPARATORLINE);
  this.persistentData = {"separatorIndx":undefined};
  if(persistentData) {
    this.persistentData["separatorIndx"] = persistentData["separatorIndx"]
  }
  if(this.persistentData["separatorIndx"] === undefined) {
    this.persistentData["separatorIndx"] = 0
  }
  this.hoveringMenuActions[hoveringMenuEditTitleAction.id] = hoveringMenuEditTitleAction
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeSeparatorLine(this.persistentData)).copyMarksAndCollapsedFrom(this)
}, separators:[{text:"------------------------------------------------------------------------------------------------------", css:"b"}, {text:"==========================================================", css:"a"}, {text:"- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ", css:"c"}], getNodeText:function(isForEditPromt) {
  return this.separators[this.persistentData["separatorIndx"]].text
}, getNodeContentCssClass:function() {
  return this.separators[this.persistentData["separatorIndx"]].css
}, onNodeDblClicked:function(treeModel, treeView) {
  this.editTitle(treeView)
}, editTitle:function(treeView) {
  var si = this.persistentData["separatorIndx"] + 1;
  if(si >= this.separators.length) {
    si = 0
  }
  this.setSeparatorStyle(si)
}, setSeparatorStyle:function(separatorIndx) {
  if(this.persistentData["separatorIndx"] === separatorIndx) {
    return
  }
  this.persistentData["separatorIndx"] = separatorIndx;
  this.notifyObservers("fromModel_onNodeUpdated");
  this.notifyTreeModelAboutUpdate_invalidateDids(true)
}, setSeparatorStyleFromText:function(innerHtmlTextOfExportedSeparator) {
  for(var i = 0;i < this.separators.length;i++) {
    if(this.separators[i].text == innerHtmlTextOfExportedSeparator) {
      this.setSeparatorStyle(i)
    }
  }
}, EOC:null});
function posAndSizeToString(objWithPosAndSize) {
  return objWithPosAndSize["top"] + "_" + objWithPosAndSize["left"] + "_" + objWithPosAndSize["width"] + "_" + objWithPosAndSize["height"]
}
function strToPosAndSize(str, r) {
  var a = str.split("_");
  if(!isNaN(Number(a[0]))) {
    r["top"] = Number(a[0])
  }
  if(!isNaN(Number(a[1]))) {
    r["left"] = Number(a[1])
  }
  if(!isNaN(Number(a[2]))) {
    r["width"] = Number(a[2])
  }
  if(!isNaN(Number(a[3]))) {
    r["height"] = Number(a[3])
  }
}
function copyPositionAndSize(sourceChromeWindowObj, targetChromeWindowObj) {
  if(sourceChromeWindowObj && targetChromeWindowObj) {
    if(sourceChromeWindowObj["top"]) {
      targetChromeWindowObj["top"] = sourceChromeWindowObj["top"]
    }
    if(sourceChromeWindowObj["left"]) {
      targetChromeWindowObj["left"] = sourceChromeWindowObj["left"]
    }
    if(sourceChromeWindowObj["width"]) {
      targetChromeWindowObj["width"] = sourceChromeWindowObj["width"]
    }
    if(sourceChromeWindowObj["height"]) {
      targetChromeWindowObj["height"] = sourceChromeWindowObj["height"]
    }
  }
}
var NodeWindowBase = NodeModelBase.extend({init:function(nodeTypesEnumType, chromeWindowObj) {
  this._super(nodeTypesEnumType, "windowFrame");
  this.defaultFavicon = "undefined";
  this.defaultTitle = "undefined";
  this.chromeWindowObj = chromeWindowObj;
  if(this.chromeWindowObj && this.chromeWindowObj["rect"]) {
    strToPosAndSize(this.chromeWindowObj["rect"], this.chromeWindowObj)
  }
  this.isRelatedChromeWindowAlive = false;
  this.id = nodeTypesEnumType + (!!chromeWindowObj && !!chromeWindowObj.id ? chromeWindowObj.id : "");
  this.needFaviconAndTextHelperContainer = true;
  this.hoveringMenuActions[hoveringMenuEditTitleAction.id] = hoveringMenuEditTitleAction
}, isSavedOrOpenTabsOrganizer:function() {
  return true
}, getIcon:function() {
  var r = this.marks.customFavicon;
  if(r == undefined) {
    r = this.defaultFavicon
  }
  return r
}, getNodeText:function(isForEditPrompt) {
  var r = this.marks.customTitle;
  if(r == undefined) {
    r = this.defaultTitle
  }
  return r
}, editTitle:function(treeView) {
  var _this = this;
  treeView.activatePrompt(this.getNodeText(true), function onOk(newText) {
    _this.setCustomTitle(newText)
  })
}, setCustomTitle:function(customTitle) {
  var new_marks = this.getMarksClone();
  if(customTitle == this.defaultTitle && new_marks.customTitle != undefined) {
    delete new_marks.customTitle;
    delete new_marks.customFavicon;
    this.setNewMarksObject_notifyObserversAndPersitenceManager(new_marks)
  }else {
    if(new_marks.customTitle != customTitle) {
      new_marks.customTitle = customTitle;
      if(this.type !== NodeTypesEnum.GROUP && this.marks.customFavicon == undefined) {
        new_marks.customFavicon = "img/chrome-window-icon-gold.png"
      }
      this.setNewMarksObject_notifyObserversAndPersitenceManager(new_marks)
    }else {
    }
  }
}, updateChromeWindowObj:function(chromeWindowObj) {
  var serializedProperties = ["id", "type", "incognito", "top", "left", "width", "height"];
  var runtimeAffectingProperties = ["focused"];
  var isSerializedPropertiesSame = isPropertiesEqual(this.chromeWindowObj, chromeWindowObj, serializedProperties);
  if(isSerializedPropertiesSame && isPropertiesEqual(this.chromeWindowObj, chromeWindowObj, runtimeAffectingProperties)) {
    return
  }
  this.chromeWindowObj = chromeWindowObj;
  this.notifyObservers("fromModel_onNodeUpdated");
  if(!isSerializedPropertiesSame) {
    this.notifyTreeModelAboutUpdate_invalidateDids(true)
  }
}, serializeChromeWindowObjMainPropertiesOnly:function(chromeWindowObj) {
  var r = oneLevelObjectClone(chromeWindowObj);
  if(r.state === "normal") {
    delete r.state
  }
  if(!r.incognito) {
    delete r.incognito
  }
  if(!r.alwaysOnTop) {
    delete r.alwaysOnTop
  }
  if(!r.focused) {
    delete r.focused
  }
  r["rect"] = posAndSizeToString(r);
  delete r["top"];
  delete r["left"];
  delete r["width"];
  delete r["height"];
  delete r.tabs;
  return r
}, polymorficSerializeData:function() {
  var r = null;
  if(this.chromeWindowObj) {
    r = this.serializeChromeWindowObjMainPropertiesOnly(this.chromeWindowObj)
  }
  return r
}, fillCreatePropertiesByPositionAndSize:function(createProperties) {
  if(this.chromeWindowObj) {
    copyPositionAndSize(this.chromeWindowObj, createProperties)
  }
}, findTabWithActiveRequestForCreation:function() {
  return this.findNodeInWindowSubtree_skipOnOthereWindowsSubtrees(function(node) {
    return!!node._f_isWhantRequestNewTabCreation
  })
}, findTabWithActiveRequestForMove:function() {
  var _this = this;
  if(this._f_isWhantRequestTabsMove) {
    return this.findNodeInWindowSubtree_skipOnOthereWindowsSubtrees(function(node) {
      return node.type === NodeTypesEnum.TAB && node.chromeTabObj.windowId !== _this.chromeWindowObj.id
    })
  }
  return null
}, findAlifeTabInOwnTabsById:function(tabid) {
  return this.findNodeInWindowSubtree_skipOnOthereWindowsSubtrees(function(node) {
    return node.type === NodeTypesEnum.TAB && node.chromeTabObj.id === tabid
  })
}, findNodeInWindowSubtree_skipOnOthereWindowsSubtrees:function(isSearchedNodeDetector) {
  var r = null;
  forEachNodeInTree_skipSubnodesTraversalOnFalse__noChangesInTree(this.subnodes, function(node) {
    if(r) {
      return false
    }
    if(node.isSavedOrOpenTabsOrganizer()) {
      return false
    }
    if(isSearchedNodeDetector(node)) {
      r = node
    }
    return!r ? true : false
  });
  return r
}, moveToTheEndOfTree:function() {
  var root = this.findPathStartNodeInRoot().parent;
  return root.insertAsLastSubnode(this.removeOwnTreeFromParent())
}, EOC:null});
var NodeWindowSaved = NodeWindowBase.extend({init:function(chromeWindowObj, customType) {
  if(chromeWindowObj) {
    if(chromeWindowObj["sa"]) {
      chromeWindowObj["crashDetectedDate"] = chromeWindowObj["sa"]
    }else {
      if(chromeWindowObj["oa"]) {
        chromeWindowObj["crashDetectedDate"] = chromeWindowObj["oa"]
      }else {
        if(chromeWindowObj["la"]) {
          chromeWindowObj["crashDetectedDate"] = chromeWindowObj["la"]
        }
      }
    }
    if(chromeWindowObj["ta"]) {
      chromeWindowObj["closeDate"] = chromeWindowObj["ta"]
    }else {
      if(chromeWindowObj["pa"]) {
        chromeWindowObj["closeDate"] = chromeWindowObj["pa"]
      }else {
        if(chromeWindowObj["ma"]) {
          chromeWindowObj["closeDate"] = chromeWindowObj["ma"]
        }
      }
    }
  }
  this._super(customType || NodeTypesEnum.SAVEDWINDOW, chromeWindowObj || {});
  this.defaultTitle = "Window";
  this.defaultFavicon = "img/chrome-window-icon-gray.png"
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeWindowSaved(this.chromeWindowObj, this.type)).copyMarksAndCollapsedFrom(this)
}, getNodeText:function(isForEditPrompt) {
  var r = this._super(isForEditPrompt);
  if(!isForEditPrompt) {
    if(this.chromeWindowObj["closeDate"]) {
      r += " (closed " + (new Date(this.chromeWindowObj["closeDate"])).toDateString() + ")"
    }
    if(this.chromeWindowObj["crashDetectedDate"]) {
      r += " (crashed " + (new Date(this.chromeWindowObj["crashDetectedDate"])).toDateString() + ")"
    }
  }
  return r
}, onNodeDblClicked:function(treeModel, treeView, isAlternativeRestore) {
  if(treeModel.executeWaitedChromeOperations) {
    this._f_isWhantRequestNewWindowCreation = true;
    var isSomeTabsScheduledToBeCreated = false;
    this.findNodeInWindowSubtree_skipOnOthereWindowsSubtrees(function(node) {
      if(node.set_f_isWhantRequestNewTabCreation) {
        node.set_f_isWhantRequestNewTabCreation(isAlternativeRestore);
        isSomeTabsScheduledToBeCreated = true
      }
      return false
    });
    if(!isSomeTabsScheduledToBeCreated) {
      this._f_isWindowScheduledToActivationWithoutAnyTabs = true
    }
    treeModel.executeWaitedChromeOperations([this])
  }else {
  }
}, onAfterCrashRestorationDone:function() {
  if(!!this.chromeWindowObj.id) {
    delete this.chromeWindowObj.id
  }
}, EOC:null});
var NodeWindowSavedOnCloseAll = NodeWindowSaved.extend({init:function(chromeWindowObj) {
  chromeWindowObj["closeDate"] = Date.now();
  this._super(chromeWindowObj);
  this.additionalTextCss = "recentlySavedOnCloseAll"
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeWindowSavedOnCloseAll(this.chromeWindowObj)).copyMarksAndCollapsedFrom(this)
}, EOC:null});
var NodeWindowSavedAfterCrash = NodeWindowSaved.extend({init:function(chromeWindowObj) {
  chromeWindowObj["crashDetectedDate"] = Date.now();
  this._super(chromeWindowObj);
  this.additionalTextCss = "recentlyCrashed"
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeWindowSavedAfterCrash(this.chromeWindowObj)).copyMarksAndCollapsedFrom(this)
}, EOC:null});
var NodeGroup = NodeWindowSaved.extend({init:function() {
  this._super(null, NodeTypesEnum.GROUP);
  this.defaultTitle = "Group";
  this.defaultFavicon = "img/group-icon.png"
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeGroup).copyMarksAndCollapsedFrom(this)
}, replaceSelfInTreeBy_mergeSubnodesAndMarks:function(replacer) {
  this.marks.customFavicon = this.getIcon();
  this.marks.customTitle = this.getNodeText();
  return this._super(replacer)
}, EOC:null});
var NodeWindowActive = NodeWindowBase.extend({init:function(chromeWindowObj) {
  this._super(NodeTypesEnum.WINDOW, chromeWindowObj);
  this.defaultTitle = "Window" + (this.chromeWindowObj.type === "normal" ? "" : " (" + this.chromeWindowObj.type + ")");
  this.defaultFavicon = "img/chrome-window-icon-blue.png";
  this.hoveringMenuActions[hoveringMenuCloseAction.id] = hoveringMenuCloseAction;
  this.isRelatedChromeWindowAlive = true
}, copyConstructor_withoutSubnodes:function() {
  return(new NodeWindowActive(this.chromeWindowObj)).copyMarksAndCollapsedFrom(this)
}, cloneForCopyInActiveTree_withoutSubnodes:function() {
  return(new NodeWindowSaved(this.chromeTabObj)).copyMarksAndCollapsedFrom(this)
}, calculateIsProtectedFromGoneOnClose:NodeActiveBase_calculateIsProtectedFromGoneOnClose, isAllOpenTabsProtectedFromGoneOnWindowClose:function() {
  var r = !this.isOnRootSubnodesLevel() || this.calculateIsProtectedFromGoneOnClose();
  if(r) {
    return true
  }
  forEachNodeInTree_skipSubnodesTraversalOnFalse__noChangesInTree(this.subnodes, function(nodeModel) {
    if(nodeModel.type !== NodeTypesEnum.TAB || nodeModel.isCustomMarksPresent()) {
      r = true
    }
    return!r
  });
  return r
}, isAnOpenWindow:function() {
  return true
}, isSavedOrOpenTabsOrganizer:function(forTabInChromeWindowId) {
  if(this.chromeWindowObj && (this.chromeWindowObj.type && (this.chromeWindowObj.type === "popup" && this.chromeWindowObj.id !== forTabInChromeWindowId))) {
    return false
  }
  return true
}, isFocusedWindow:function() {
  return this.chromeWindowObj.focused
}, setChromeWindowObjFocused:function(newFocusedState) {
  if(newFocusedState === this.chromeWindowObj.focused) {
    return
  }
  var newChromeWindowObj = oneLevelObjectClone(this.chromeWindowObj);
  newChromeWindowObj.focused = newFocusedState;
  this.updateChromeWindowObj(newChromeWindowObj)
}, onNodeDblClicked:NodeWindowActive_focusThisWindow_withoutScrollToView, countSelf:function(statData) {
  statData["nodesCount"] = statData["nodesCount"] ? statData["nodesCount"] + 1 : 1;
  statData["activeWinsCount"] = statData["activeWinsCount"] ? statData["activeWinsCount"] + 1 : 1
}, performChromeRemove:function(protectFromDeleteOnChromeRemovedEvent, storeCloseTime) {
  if(protectFromDeleteOnChromeRemovedEvent) {
    this.protectFromDeleteOnClose(storeCloseTime);
    this.findNodeInWindowSubtree_skipOnOthereWindowsSubtrees(function(node) {
      node.protectFromDeleteOnClose(storeCloseTime);
      node.setTheWasSavedOnWinCloseFlagForAlternativeRestore();
      return false
    })
  }
  var this_chromeWindowObj = this.chromeWindowObj;
  if(localStorage["openSavedWindowsInOriginalPos"]) {
    chrome.windows.get(this_chromeWindowObj.id, {}, function(chromeWindowObj) {
      copyPositionAndSize(chromeWindowObj, this_chromeWindowObj);
      window.chrome.windows.remove(this_chromeWindowObj.id)
    })
  }else {
    window.chrome.windows.remove(this_chromeWindowObj.id)
  }
}, iterateOverOurOwnOpenTabNodes:function(f) {
  var tabIndexInHierarchy = 0;
  return this.findNodeInWindowSubtree_skipOnOthereWindowsSubtrees(function(node) {
    if(node.type === NodeTypesEnum.TAB) {
      return f(node, tabIndexInHierarchy++)
    }
    return false
  })
}, getWindowTabIndexOfOpenTabIftheyPlacedDirectlyAfterGivenNode:function(nodeModel) {
  var tabIndexInHierarchy = 0;
  this.findNodeInWindowSubtree_skipOnOthereWindowsSubtrees(function(node) {
    if(node.type === NodeTypesEnum.TAB) {
      tabIndexInHierarchy++
    }
    if(nodeModel === node) {
      return true
    }
    return false
  });
  return tabIndexInHierarchy
}, setActiveTab:function(tabId) {
  var _this = this;
  this.iterateOverOurOwnOpenTabNodes(function(openTabNode) {
    openTabNode.setChromeTabObjActive(openTabNode.chromeTabObj.id === tabId);
    return false
  })
}, reorderAndPerformReattachsAllTabsInChromeWindowAcordingToOrderInTabsOutlinerHierarchy:function() {
  var targetWinId = this.chromeWindowObj.id;
  this.iterateOverOurOwnOpenTabNodes(function(openTabNode, tabIndexInHierarchy) {
    openTabNode.request\u0421hromeToMoveTab(targetWinId, tabIndexInHierarchy);
    return false
  })
}, findAlifeTabInOwnTabsByIndex:function(chromeTabIndexInWindow) {
  return this.iterateOverOurOwnOpenTabNodes(function(openTabNode, tabIndexInHierarchy) {
    if(tabIndexInHierarchy === chromeTabIndexInWindow) {
      return true
    }
    return false
  })
}, onAlifeWindowClosedByChrome_removeSelfAndPromoteSubnodesInPlace_orConvertToSavedIfMarksOrTextNodesPresent:function() {
  if(this.subnodes.length > 0 || this.calculateIsProtectedFromGoneOnClose()) {
    this.replaceSelfInTreeBy_mergeSubnodesAndMarks(this._f_storeCloseTimeOnClose ? new NodeWindowSavedOnCloseAll(this.chromeWindowObj) : new NodeWindowSaved(this.chromeWindowObj))
  }else {
    this.removeOwnTreeFromParent()
  }
}, supressUnexpectedIdErrorOnChromeRemovedEvent:function() {
  window.chrome.extension.getBackgroundPage().supressUnexpectedRemovedWindowIdErrorFor(this.chromeWindowObj.id)
}, fromChrome_onTabCreated:function(chromeTabObj, tryRelateNewTabToOpener) {
  var newTabNode = new NodeTabActive(chromeTabObj);
  var applyTreeStyleTabAlgorith = chromeTabObj.openerTabId && (!isNewTab(chromeTabObj) && tryRelateNewTabToOpener);
  var openerTabNode = applyTreeStyleTabAlgorith ? this.findAlifeTabInOwnTabsById(chromeTabObj.openerTabId) : null;
  if(applyTreeStyleTabAlgorith && !openerTabNode) {
    console.error("ERROR############# onTabCreated # Cannot find openerTabNode in window hierarchy. windowId: ", this.chromeWindowObj.id, "openerTabId:", chromeTabObj.openerTabId)
  }
  var indexInOpenerDirectSubnodes = -1;
  if(openerTabNode) {
    if(openerTabNode.subnodes.length === 0) {
      var chromeWindowTabIndexIfInsertedAfter = this.getWindowTabIndexOfOpenTabIftheyPlacedDirectlyAfterGivenNode(openerTabNode);
      if(chromeWindowTabIndexIfInsertedAfter === chromeTabObj.index) {
        indexInOpenerDirectSubnodes = 0
      }
    }else {
      for(var subnodesIndex = openerTabNode.subnodes.length - 1;subnodesIndex >= 0;subnodesIndex--) {
        var chromeWindowTabIndexIfInsertedAfter = this.getWindowTabIndexOfOpenTabIftheyPlacedDirectlyAfterGivenNode(openerTabNode.subnodes[subnodesIndex]);
        if(chromeWindowTabIndexIfInsertedAfter === chromeTabObj.index) {
          indexInOpenerDirectSubnodes = subnodesIndex + 1;
          break
        }
      }
    }
  }
  if(openerTabNode && indexInOpenerDirectSubnodes >= 0) {
    openerTabNode.insertSubnode(indexInOpenerDirectSubnodes, newTabNode)
  }else {
    var nodeToShiftDown = this.findAlifeTabInOwnTabsByIndex(chromeTabObj.index);
    if(!nodeToShiftDown) {
      this.insertAsLastSubnode(newTabNode)
    }else {
      nodeToShiftDown.insertAsPreviousSibling(newTabNode)
    }
  }
  this.fromChrome_onAlifeTabAppearInHierarchy();
  return newTabNode
}, fromChrome_onAlifeTabAppearInHierarchy:function() {
  if(this.deleteEmptyTabIdAfterAnyMoveTabOrCreateTabSucceded !== undefined) {
    window.chrome.tabs.remove(this.deleteEmptyTabIdAfterAnyMoveTabOrCreateTabSucceded);
    delete this.deleteEmptyTabIdAfterAnyMoveTabOrCreateTabSucceded
  }
}, updateChromeWindowObjOrConvertToSavedIfNoActiveTabNodesCreated:function(chromeActiveWindowObjectsList, listOfWindowNodesThatMustBeConvertedToSaved) {
  var ourChromeWindowObjInActiveList = findById(chromeActiveWindowObjectsList, this.chromeWindowObj.id);
  if(ourChromeWindowObjInActiveList && !!ourChromeWindowObjInActiveList.haveActiveTabNodesInTree) {
    ourChromeWindowObjInActiveList.isUsedByNode = true;
    this.updateChromeWindowObj(ourChromeWindowObjInActiveList)
  }else {
    listOfWindowNodesThatMustBeConvertedToSaved.push(this)
  }
  return null
}, EOC:null});
function NodeActiveBase_calculateIsProtectedFromGoneOnClose() {
  return this.isProtectedFromGoneOnCloseCache = !!this._f_convertToSavedOnClose || (this.isCustomMarksPresent() || this.isSomethingExeptUnmarkedActiveTabPresentInDirectSubnodes())
}
function ActiveTree_executeWaitedChromeOperations(nodesTree) {
  var _this_activetree = this;
  forEachNodeInTree_noChangesInTree(nodesTree, function(node) {
    if(Boolean(node.isSavedOrOpenTabsOrganizer()) && (!Boolean(node.isRelatedChromeWindowAlive) && Boolean(node._f_isWhantRequestNewWindowCreation))) {
      var waitingWin = node;
      waitingWin._f_isWhantRequestNewWindowCreation = false;
      _this_activetree.requestNewAlifeWindowForNode(waitingWin)
    }
    if(Boolean(node.isSavedOrOpenTabsOrganizer()) && (Boolean(node.isRelatedChromeWindowAlive) && Boolean(node._f_isWhantRequestTabsMove))) {
      var targetWin = node;
      targetWin._f_isWhantRequestTabsMove = false;
      targetWin.reorderAndPerformReattachsAllTabsInChromeWindowAcordingToOrderInTabsOutlinerHierarchy()
    }
    var relatedTabOrganizer;
    if(Boolean(node._f_isWhantRequestNewTabCreation) && ((relatedTabOrganizer = node.findFirstSavedOrOpenTabsOrganizerInPathToRoot()) && relatedTabOrganizer.isRelatedChromeWindowAlive)) {
      var waitingTab = node;
      waitingTab._f_isWhantRequestNewTabCreation = false;
      _this_activetree.requestNewAlifeTabForNode(relatedTabOrganizer, waitingTab)
    }
  })
}
function chrome_deleteLastEmptyTabInWindow(windowId) {
  window.chrome.tabs.getAllInWindow(windowId, function(tabsList) {
    if(tabsList.length > 0) {
      var tabToDelete = tabsList[tabsList.length - 1];
      if(tabToDelete.url === "chrome://newtab/") {
        window.chrome.tabs.remove(tabToDelete.id)
      }
    }
  })
}
function chrome_openUrlInNewWindow(url) {
  var createData = {"url":url, "type":"normal", "left":450, "top":1, "width":900, "focused":true};
  window.chrome.windows.create(createData)
}
var hoveringMenuCloseAction = {"id":"closeAction", "performAction":CloseAction_performAction};
var hoveringMenuDeleteAction = {"id":"deleteAction", "performAction":DeleteAction_performAction};
var hoveringMenuEditTitleAction = {"id":"editTitleAction", "performAction":EditTitle_performAction};
var hoveringMenuSetCursorAction = {"id":"setCursorAction", "performAction":SetCursor_performAction};
function performClose(node, protectFromDeleteOnChromeRemovedEvent) {
  node.performChromeRemove(protectFromDeleteOnChromeRemovedEvent);
  if(node.colapsed) {
    forEachNodeInTree_noChangesInTree(node.subnodes, function(node) {
      node.performChromeRemove(protectFromDeleteOnChromeRemovedEvent)
    })
  }
}
function CloseAction_performAction(node) {
  performClose(node, true)
}
function DeleteAction_performAction(node) {
  performClose(node, false);
  var deletedHierarchy;
  if(node.colapsed) {
    deletedHierarchy = node.deleteHierarchy_MoveCursor()
  }else {
    deletedHierarchy = node.removeSelfAndPromoteSubnodesInPlace()
  }
  deletedHierarchy.supressUnexpectedIdErrorOnChromeRemovedEvent();
  forEachNodeInTree_noChangesInTree(deletedHierarchy.subnodes, function(node) {
    node.supressUnexpectedIdErrorOnChromeRemovedEvent()
  })
}
function EditTitle_performAction(node, treeView) {
  node.editTitle(treeView)
}
function SetCursor_performAction(node, treeView) {
  node.setCursorHereOrToFirstCollapsedParent(treeView)
}
var ActionLinkModelBase = Class.extend({init:function(nodeConstructor, postInsertAction) {
  this.nodeConstructor = nodeConstructor;
  this.postInsertAction = postInsertAction;
  this.dataForNodeConstructor = null;
  this.subnodes = [];
  this.newNode = null
}, setDataForNodeConstructor:function(str) {
  this.dataForNodeConstructor = str
}, copyConstructor_withoutSubnodes:function() {
  return this.newNode = this.nodeConstructor(this.dataForNodeConstructor)
}, cloneForCopyInActiveTree_withoutSubnodes:function() {
  return this.copyConstructor_withoutSubnodes()
}, isNotCoveredByWindowActiveTabsPresentInHierarchy:function() {
  return false
}, removeOwnTreeFromParent:function() {
}, notifyObservers:function(message, insertedNode) {
}, performAfterDropAction:function(treeView) {
  if(this.postInsertAction) {
    this.postInsertAction(this.newNode, treeView, this.dataForNodeConstructor)
  }
  this.newNode.setCursorHereOrToFirstCollapsedParent(treeView);
  this.newNode = null
}, performAfterDropActionForDragedModelHierarchy:function(treeView) {
  this.performAfterDropAction(treeView);
  for(var i = 0;i < this.subnodes.length;i++) {
    this.subnodes[i].performAfterDropActionForDragedModelHierarchy(treeView)
  }
}});

