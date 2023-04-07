/*!
 * LiquorTree v0.2.67
 * (c) 2019 amsik
 * Released under the MIT License.
 */
!function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : e.LiquorTree = t()
}(this, function() {
    "use strict";
    !function() {
        if ("undefined" != typeof document) {
            var e = document.head || document.getElementsByTagName("head")[0]
              , t = document.createElement("style")
              , n = ' .tree-node { white-space: nowrap; display: flex; flex-direction: column; position: relative; box-sizing: border-box; } .tree-content { display: flex; align-items: center; padding: 3px; cursor: pointer; width: 100%; box-sizing: border-box; } .tree-node:not(.selected) > .tree-content:hover { background: #f6f8fb; } .tree-node.selected > .tree-content { background-color: #e7eef7; } .tree-node.disabled > .tree-content:hover { background: inherit; } .tree-arrow { flex-shrink: 0; height: 30px; cursor: pointer; margin-left: 30px; width: 0; } .tree-arrow.has-child { margin-left: 0; width: 30px; position: relative; } .tree-arrow.has-child:after { border: 1.5px solid #494646; position: absolute; border-left: 0; border-top: 0; left: 9px; top: 50%; height: 9px; width: 9px; transform: rotate(-45deg) translateY(-50%) translateX(0); transition: transform .25s; transform-origin: center; } .tree-arrow.has-child.rtl:after { border: 1.5px solid #494646; position: absolute; border-right: 0; border-bottom: 0; right: 0px; top: 50%; height: 9px; width: 9px; transform: rotate(-45deg) translateY(-50%) translateX(0); transition: transform .25s; transform-origin: center; } .tree-arrow.expanded.has-child:after { transform: rotate(45deg) translateY(-50%) translateX(-5px); } .tree-checkbox { flex-shrink: 0; position: relative; width: 30px; height: 30px; box-sizing: border-box; border: 1px solid #dadada; border-radius: 2px; background: #fff; transition: border-color .25s, background-color .25s; } .tree-checkbox:after, .tree-arrow:after { position: absolute; display: block; content: ""; } .tree-checkbox.checked, .tree-checkbox.indeterminate { background-color: #3a99fc; border-color: #218eff; } .tree-checkbox.checked:after { box-sizing: content-box; border: 1.5px solid #fff; /* probably width would be rounded in most cases */ border-left: 0; border-top: 0; left: 9px; top: 3px; height: 15px; width: 8px; transform: rotate(45deg) scaleY(0); transition: transform .25s; transform-origin: center; } .tree-checkbox.checked:after { transform: rotate(45deg) scaleY(1); } .tree-checkbox.indeterminate:after { background-color: #fff; top: 50%; left: 20%; right: 20%; height: 2px; } .tree-anchor { flex-grow: 2; outline: none; display: flex; text-decoration: none; color: #343434; vertical-align: top; margin-left: 3px; line-height: 24px; padding: 3px 6px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } .tree-node.selected > .tree-content > .tree-anchor { outline: none; } .tree-node.disabled > .tree-content > .tree-anchor { color: #989191; background: #fff; opacity: .6; cursor: default; outline: none; } .tree-input { display: block; width: 100%; height: 24px; line-height: 24px; outline: none; border: 1px solid #3498db; padding: 0 4px; } .l-fade-enter-active, .l-fade-leave-active { transition: opacity .3s, transform .3s; transform: translateX(0); } .l-fade-enter, .l-fade-leave-to { opacity: 0; transform: translateX(-2em); } .tree--small .tree-anchor { line-height: 19px; } .tree--small .tree-checkbox { width: 23px; height: 23px; } .tree--small .tree-arrow { height: 23px; } .tree--small .tree-checkbox.checked:after { left: 7px; top: 3px; height: 11px; width: 5px; } .tree-node.has-child.loading > .tree-content > .tree-arrow, .tree-node.has-child.loading > .tree-content > .tree-arrow:after { border-radius: 50%; width: 15px; height: 15px; border: 0; } .tree-node.has-child.loading > .tree-content > .tree-arrow { font-size: 3px; position: relative; border-top: 1.1em solid rgba(45,45,45, 0.2); border-right: 1.1em solid rgba(45,45,45, 0.2); border-bottom: 1.1em solid rgba(45,45,45, 0.2); border-left: 1.1em solid #2d2d2d; -webkit-transform: translateZ(0); -ms-transform: translateZ(0); transform: translateZ(0); left: 5px; -webkit-animation: loading 1.1s infinite linear; animation: loading 1.1s infinite linear; margin-right: 8px; } @-webkit-keyframes loading { 0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); } } @keyframes loading { 0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); } } ';
            t.type = "text/css",
            t.styleSheet ? t.styleSheet.cssText = n : t.appendChild(document.createTextNode(n)),
            e.appendChild(t)
        }
    }();
    var e = {
        render: function() {
            var e = this
              , t = e.$createElement
              , n = e._self._c || t;
            return n("li", {
                staticClass: "tree-node",
                class: e.nodeClass,
                attrs: {
                    "data-id": e.node.id
                },
                on: {
                    mousedown: function(t) {
                        return t.stopPropagation(),
                        e.handleMouseDown(t)
                    }
                }
            }, [n("div", {
                staticClass: "tree-content",
                style: ["ltr" == e.options.direction ? {
                    "padding-left": e.padding
                } : {
                    "padding-right": e.padding
                }],
                on: {
                    click: function(t) {
                        return t.stopPropagation(),
                        e.select(t)
                    }
                }
            }, [n("i", {
                staticClass: "tree-arrow",
                class: [{
                    expanded: e.node.states.expanded,
                    "has-child": e.node.children.length || e.node.isBatch
                }, e.options.direction],
                on: {
                    click: function(t) {
                        return t.stopPropagation(),
                        e.toggleExpand(t)
                    }
                }
            }), e._v(" "), e.options.checkbox ? n("i", {
                staticClass: "tree-checkbox",
                class: {
                    checked: e.node.states.checked,
                    indeterminate: e.node.states.indeterminate
                },
                on: {
                    click: function(t) {
                        return t.stopPropagation(),
                        e.check(t)
                    }
                }
            }) : e._e(), e._v(" "), n("span", {
                ref: "anchor",
                staticClass: "tree-anchor",
                attrs: {
                    tabindex: "-1"
                },
                on: {
                    focus: e.onNodeFocus,
                    dblclick: function(t) {
                        e.tree.$emit("node:dblclick", e.node)
                    }
                }
            }, [n("node-content", {
                attrs: {
                    node: e.node
                }
            })], 1)]), e._v(" "), n("transition", {
                attrs: {
                    name: "l-fade"
                }
            }, [e.hasChildren() && e.node.states.expanded ? n("ul", {
                staticClass: "tree-children"
            }, e._l(e.node.children, function(t) {
                return t && t.visible() ? n("node", {
                    key: t.id,
                    attrs: {
                        node: t,
                        options: e.options
                    }
                }) : e._e()
            })) : e._e()])], 1)
        },
        staticRenderFns: [],
        name: "Node",
        inject: ["tree"],
        props: ["node", "options"],
        components: {
            NodeContent: {
                name: "node-content",
                props: ["node"],
                render: function(e) {
                    var t = this
                      , n = this.node
                      , i = this.node.tree.vm;
                    if (n.isEditing) {
                        var r = n.text;
                        return this.$nextTick(function(e) {
                            t.$refs.editCtrl.focus()
                        }),
                        e("input", {
                            domProps: {
                                value: n.text,
                                type: "text"
                            },
                            class: "tree-input",
                            on: {
                                input: function(e) {
                                    r = e.target.value
                                },
                                blur: function() {
                                    n.stopEditing(r)
                                },
                                keyup: function(e) {
                                    13 === e.keyCode && n.stopEditing(r)
                                },
                                mouseup: function(e) {
                                    e.stopPropagation()
                                }
                            },
                            ref: "editCtrl"
                        })
                    }
                    return i.$scopedSlots.default ? i.$scopedSlots.default({
                        node: this.node
                    }) : e("span", {
                        domProps: {
                            innerHTML: n.text
                        }
                    })
                }
            }
        },
        watch: {
            node: function() {
                this.node.vm = this
            }
        },
        data: function() {
            return this.node.vm = this,
            {
                loading: !1
            }
        },
        computed: {
            padding: function() {
                return this.node.depth * (this.options.paddingLeft ? this.options.paddingLeft : this.options.nodeIndent) + "px"
            },
            nodeClass: function() {
                var e = this.node.states
                  , t = this.hasChildren()
                  , n = {
                    "has-child": t,
                    expanded: t && e.expanded,
                    selected: e.selected,
                    disabled: e.disabled,
                    matched: e.matched,
                    dragging: e.dragging,
                    loading: this.loading,
                    draggable: e.draggable
                };
                return this.options.checkbox && (n.checked = e.checked,
                n.indeterminate = e.indeterminate),
                n
            }
        },
        methods: {
            onNodeFocus: function() {
                this.tree.activeElement = this.node
            },
            focus: function() {
                this.$refs.anchor.focus(),
                this.node.select()
            },
            check: function() {
                this.node.checked() ? this.node.uncheck() : this.node.check()
            },
            select: function(e) {
                void 0 === e && (e = evnt);
                var t = e.metaKey
                  , n = this.options
                  , i = this.tree
                  , r = this.node;
                if (i.$emit("node:clicked", r),
                !n.editing || !r.isEditing) {
                    if (n.editing && r.editable())
                        return this.startEditing();
                    if (n.checkbox && n.checkOnSelect)
                        return !n.parentSelect && this.hasChildren() ? this.toggleExpand() : this.check(t);
                    !n.parentSelect && this.hasChildren() && this.toggleExpand(),
                    n.multiple ? r.selected() ? t ? r.unselect() : 1 != this.tree.selectedNodes.length && (i.unselectAll(),
                    r.select()) : r.select(t) : r.selected() && t ? r.unselect() : r.select()
                }
            },
            toggleExpand: function() {
                this.hasChildren() && this.node.toggleExpand()
            },
            hasChildren: function() {
                return this.node.hasChildren()
            },
            startEditing: function() {
                this.tree._editingNode && this.tree._editingNode.stopEditing(),
                this.node.startEditing()
            },
            stopEditing: function() {
                this.node.stopEditing()
            },
            handleMouseDown: function(e) {
                this.options.dnd && this.tree.vm.startDragging(this.node, e)
            }
        }
    };
    !function() {
        if ("undefined" != typeof document) {
            var e = document.head || document.getElementsByTagName("head")[0]
              , t = document.createElement("style")
              , n = " .tree-dragnode { padding: 10px; border: 1px solid #e7eef7; position: fixed; border-radius: 8px; background: #fff; transform: translate(-50%, -110%); z-index: 10; } ";
            t.type = "text/css",
            t.styleSheet ? t.styleSheet.cssText = n : t.appendChild(document.createTextNode(n)),
            e.appendChild(t)
        }
    }();
    var t = {
        render: function() {
            var e = this.$createElement;
            return (this._self._c || e)("div", {
                staticClass: "tree-dragnode",
                style: this.style
            }, [this._v(" " + this._s(this.target.node.text) + " ")])
        },
        staticRenderFns: [],
        name: "DragNode",
        props: ["target"],
        computed: {
            style: function() {
                return void 0 === this.target.top ? "display: none" : "top: " + this.target.top + "px; left: " + this.target.left + "px"
            }
        }
    };
    function n(e, t) {
        var i;
        return Array.isArray(e) ? e.map(function(e) {
            return n(e, t)
        }) : (!1 !== (i = t(e)) && e.children && e.children.length && (i = n(e.children, t)),
        i)
    }
    function i(e) {
        return !1 == !!document ? e : (i.__element || (i.__element = document.createElement("div")),
        i.__element.innerHTML = e,
        i.__element.innerText)
    }
    function r(e) {
        return function(t) {
            return Object.keys(e).every(function(n) {
                if ("text" === n || "id" === n) {
                    var r = e[n]
                      , o = t[n];
                    return o = i(o),
                    function(e) {
                        return e instanceof RegExp
                    }(r) ? r.test(o) : r === o
                }
                var s = e[n];
                return "state" === n && (n = "states"),
                Object.keys(s).every(function(e) {
                    return t[n][e] === s[e]
                })
            })
        }
    }
    function o(e, t, n) {
        if (void 0 === n && (n = !0),
        !e || !e.length || !t)
            return null;
        if (n && (e = function(e) {
            var t = [];
            return e.forEach(function e(n) {
                t.push(n),
                n.children && n.children.forEach(e)
            }),
            t
        }(e)),
        "number" == typeof t)
            return e[t] || null;
        ("string" == typeof t || t instanceof RegExp) && (t = {
            text: t
        }),
        "function" != typeof t && (t = r(t));
        var i = e.filter(t);
        return i.length ? i : null
    }
    function s() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
    }
    function a() {
        return s() + s() + "-" + s() + "-" + s() + "-" + s() + "-" + s() + s() + s()
    }
    function d(e, t) {
        for (var n = [], i = arguments.length - 2; i-- > 0; )
            n[i] = arguments[i + 2];
        e.forEach(function(e) {
            return e[t].apply(e, n)
        })
    }
    var c = function(e) {
        function t(t, n) {
            var i;
            void 0 === n && (n = []),
            e.call(this),
            this.tree = t,
            (i = this).push.apply(i, n)
        }
        return e && (t.__proto__ = e),
        t.prototype = Object.create(e && e.prototype),
        t.prototype.constructor = t,
        t.prototype.remove = function() {
            return d(this, "remove"),
            this
        }
        ,
        t.prototype.expand = function() {
            return d(this, "expand"),
            this
        }
        ,
        t.prototype.collapse = function() {
            return d(this, "collapse"),
            this
        }
        ,
        t.prototype.select = function(e) {
            return d(this, "select", e),
            this
        }
        ,
        t.prototype.unselect = function() {
            return d(this, "unselect"),
            this
        }
        ,
        t.prototype.check = function() {
            return this.tree.options.checkbox && d(this, "check"),
            this
        }
        ,
        t.prototype.uncheck = function() {
            return this.tree.options.checkbox && d(this, "uncheck"),
            this
        }
        ,
        t.prototype.disable = function() {
            return d(this, "disable"),
            this
        }
        ,
        t.prototype.enable = function() {
            return d(this, "enable"),
            this
        }
        ,
        t
    }(Array)
      , h = function(e, t) {
        if (!t)
            throw new Error("Node can not be empty");
        if (this.id = t.id || a(),
        this.states = t.state || {},
        this.showChildren = !0,
        this.children = t.children || [],
        this.parent = t.parent || null,
        this.isBatch = t.isBatch || !1,
        this.isEditing = !1,
        this.data = Object.assign({}, t.data || {}, {
            text: t.text
        }),
        !e)
            throw new Error("Node must has a Tree context!");
        this.tree = e
    }
      , l = {
        key: {
            configurable: !0
        },
        depth: {
            configurable: !0
        },
        text: {
            configurable: !0
        }
    };
    h.prototype.$emit = function(e) {
        for (var t, n = [], i = arguments.length - 1; i-- > 0; )
            n[i] = arguments[i + 1];
        (t = this.tree).$emit.apply(t, ["node:" + e, this].concat(n))
    }
    ,
    h.prototype.getPath = function() {
        if (!this.parent)
            return [this];
        for (var e = [this], t = this; null !== (t = t.parent); )
            e.push(t);
        return e
    }
    ,
    l.key.get = function() {
        return this.id + this.text
    }
    ,
    l.depth.get = function() {
        var e = 0
          , t = this.parent;
        if (!t || !1 === this.showChildren)
            return e;
        do {
            e++
        } while (t = t.parent);return e
    }
    ,
    l.text.get = function() {
        return this.data.text
    }
    ,
    l.text.set = function(e) {
        var t = this.text;
        t !== e && (this.data.text = e,
        this.$emit("text:changed", e, t))
    }
    ,
    h.prototype.state = function(e, t) {
        return void 0 === t ? this.states[e] : (this.states[e] = t,
        this)
    }
    ,
    h.prototype.recurseUp = function(e, t) {
        if (void 0 === t && (t = this),
        t.parent)
            return !1 !== e(t.parent) ? this.recurseUp(e, t.parent) : void 0
    }
    ,
    h.prototype.recurseDown = function(e, t) {
        !0 !== t && e(this),
        this.hasChildren() && n(this.children, e)
    }
    ,
    h.prototype.refreshIndeterminateState = function() {
        if (!this.tree.options.autoCheckChildren)
            return this;
        if (this.state("indeterminate", !1),
        this.hasChildren()) {
            var e = this.children.length
              , t = 0
              , n = 0
              , i = 0;
            this.children.forEach(function(e) {
                e.checked() && t++,
                e.disabled() && i++,
                e.indeterminate() && n++
            }),
            t > 0 && t === e - i ? this.checked() || (this.state("checked", !0),
            this.tree.check(this),
            this.$emit("checked")) : (this.checked() && (this.state("checked", !1),
            this.tree.uncheck(this),
            this.$emit("unchecked")),
            this.state("indeterminate", n > 0 || t > 0 && t < e))
        }
        this.parent && this.parent.refreshIndeterminateState()
    }
    ,
    h.prototype.indeterminate = function() {
        return this.state("indeterminate")
    }
    ,
    h.prototype.editable = function() {
        return !this.state("disabled") && this.state("editable")
    }
    ,
    h.prototype.selectable = function() {
        return !this.state("disabled") && this.state("selectable")
    }
    ,
    h.prototype.selected = function() {
        return this.state("selected")
    }
    ,
    h.prototype.select = function(e) {
        return !this.selectable() || this.selected() ? this : (this.tree.select(this, e),
        this.state("selected", !0),
        this.$emit("selected"),
        this)
    }
    ,
    h.prototype.unselect = function() {
        return this.selectable() && this.selected() ? (this.tree.unselect(this),
        this.state("selected", !1),
        this.$emit("unselected"),
        this) : this
    }
    ,
    h.prototype.checked = function() {
        return this.state("checked")
    }
    ,
    h.prototype.check = function() {
        var e = this;
        if (this.checked() || this.disabled())
            return this;
        if (this.indeterminate())
            return this.uncheck();
        var t = this.tree.options.checkDisabledChildren;
        return this.tree.options.autoCheckChildren ? (this.recurseDown(function(n) {
            n.state("indeterminate", !1),
            n.disabled() && !t || n.checked() || (e.tree.check(n),
            n.state("checked", !0),
            n.$emit("checked"))
        }),
        this.parent && this.parent.refreshIndeterminateState()) : (this.tree.check(this),
        this.state("checked", !0),
        this.$emit("checked")),
        this
    }
    ,
    h.prototype.uncheck = function() {
        var e = this;
        return !this.indeterminate() && !this.checked() || this.disabled() ? this : (this.tree.options.autoCheckChildren ? (this.recurseDown(function(t) {
            t.state("indeterminate", !1),
            t.checked() && (e.tree.uncheck(t),
            t.state("checked", !1),
            t.$emit("unchecked"))
        }),
        this.parent && this.parent.refreshIndeterminateState()) : (this.tree.uncheck(this),
        this.state("checked", !1),
        this.$emit("unchecked")),
        this)
    }
    ,
    h.prototype.show = function() {
        return this.visible() ? this : (this.state("visible", !0),
        this.$emit("shown"),
        this)
    }
    ,
    h.prototype.hide = function() {
        return this.hidden() ? this : (this.state("visible", !1),
        this.$emit("hidden"),
        this)
    }
    ,
    h.prototype.visible = function() {
        return this.state("visible")
    }
    ,
    h.prototype.hidden = function() {
        return !this.state("visible")
    }
    ,
    h.prototype.enable = function() {
        return this.enabled() ? this : (this.tree.options.autoDisableChildren ? this.recurseDown(function(e) {
            e.disabled() && (e.state("disabled", !1),
            e.$emit("enabled"))
        }) : (this.state("disabled", !1),
        this.$emit("enabled")),
        this)
    }
    ,
    h.prototype.enabled = function() {
        return !this.state("disabled")
    }
    ,
    h.prototype.disable = function() {
        return this.disabled() ? this : (this.tree.options.autoDisableChildren ? this.recurseDown(function(e) {
            e.enabled() && (e.state("disabled", !0),
            e.$emit("disabled"))
        }) : (this.state("disabled", !0),
        this.$emit("disabled")),
        this)
    }
    ,
    h.prototype.disabled = function() {
        return this.state("disabled")
    }
    ,
    h.prototype.expandTop = function(e) {
        var t = this;
        this.recurseUp(function(n) {
            n.state("expanded", !0),
            !0 !== e && t.$emit("expanded", n)
        })
    }
    ,
    h.prototype.expand = function() {
        var e = this;
        return this.canExpand() ? (this.isBatch ? this.tree.loadChildren(this).then(function(t) {
            e.state("expanded", !0),
            e.$emit("expanded")
        }) : (this.state("expanded", !0),
        this.$emit("expanded")),
        this) : this
    }
    ,
    h.prototype.canExpand = function() {
        return !(this.disabled() || !this.hasChildren()) && (this.collapsed() && (!this.tree.autoDisableChildren || this.disabled()))
    }
    ,
    h.prototype.canCollapse = function() {
        return !(this.disabled() || !this.hasChildren()) && (this.expanded() && (!this.tree.autoDisableChildren || this.disabled()))
    }
    ,
    h.prototype.expanded = function() {
        return this.state("expanded")
    }
    ,
    h.prototype.collapse = function() {
        return this.canCollapse() ? (this.state("expanded", !1),
        this.$emit("collapsed"),
        this) : this
    }
    ,
    h.prototype.collapsed = function() {
        return !this.state("expanded")
    }
    ,
    h.prototype.toggleExpand = function() {
        return this._toggleOpenedState()
    }
    ,
    h.prototype.toggleCollapse = function() {
        return this._toggleOpenedState()
    }
    ,
    h.prototype._toggleOpenedState = function() {
        return this.canCollapse() ? this.collapse() : this.canExpand() ? this.expand() : void 0
    }
    ,
    h.prototype.isDropable = function() {
        return this.enabled() && this.state("dropable")
    }
    ,
    h.prototype.isDraggable = function() {
        return this.enabled() && this.state("draggable") && !this.isEditing
    }
    ,
    h.prototype.startDragging = function() {
        return !(!this.isDraggable() || this.state("dragging")) && ((!this.isRoot() || 1 !== this.tree.model.length) && (this.tree.options.store && (this.tree.__silence = !0),
        this.select(),
        this.state("dragging", !0),
        this.$emit("dragging:start"),
        this.tree.__silence = !1,
        !0))
    }
    ,
    h.prototype.finishDragging = function(e, t) {
        if (e.isDropable() || "drag-on" !== t) {
            var n = this.tree
              , i = this.clone()
              , r = this.parent;
            i.id = this.id,
            n.__silence = !0,
            this.remove(),
            "drag-on" === t ? n.append(e, i) : "drag-below" === t ? n.after(e, i) : "drag-above" === t && n.before(e, i),
            e.refreshIndeterminateState(),
            r && r.refreshIndeterminateState(),
            n.__silence = !1,
            i.state("dragging", !1),
            this.state("dragging", !1),
            i.$emit("dragging:finish", e, t),
            i.state("selected") && (n.selectedNodes.remove(this),
            n.selectedNodes.add(i),
            n.vm.$set(this.state, "selected", !1),
            n.vm.$set(i.state, "selected", !0)),
            this.tree.options.store && this.tree.vm.$emit("LIQUOR_NOISE")
        }
    }
    ,
    h.prototype.startEditing = function() {
        if (this.disabled())
            return !1;
        this.isEditing || (this.tree._editingNode = this,
        this.tree.activeElement = this,
        this.isEditing = !0,
        this.$emit("editing:start"))
    }
    ,
    h.prototype.stopEditing = function(e) {
        if (this.isEditing) {
            this.isEditing = !1,
            this.tree._editingNode = null,
            this.tree.activeElement = null;
            var t = this.text;
            e && !1 !== e && this.text !== e && (this.text = e),
            this.$emit("editing:stop", t)
        }
    }
    ,
    h.prototype.index = function(e) {
        return this.tree.index(this, e)
    }
    ,
    h.prototype.first = function() {
        return this.hasChildren() ? this.children[0] : null
    }
    ,
    h.prototype.last = function() {
        return this.hasChildren() ? this.children[this.children.length - 1] : null
    }
    ,
    h.prototype.next = function() {
        return this.tree.nextNode(this)
    }
    ,
    h.prototype.prev = function() {
        return this.tree.prevNode(this)
    }
    ,
    h.prototype.insertAt = function(e, t) {
        var n = this;
        if (void 0 === t && (t = this.children.length),
        e)
            return e = this.tree.objectToNode(e),
            Array.isArray(e) ? (e.reverse().map(function(e) {
                return n.insertAt(e, t)
            }),
            new c(this.tree,[].concat(e))) : (e.parent = this,
            this.children.splice(t, 0, e),
            e.disabled() && e.hasChildren() && e.recurseDown(function(e) {
                e.state("disabled", !0)
            }),
            this.isBatch || this.$emit("added", e),
            e)
    }
    ,
    h.prototype.addChild = function(e) {
        return this.insertAt(e)
    }
    ,
    h.prototype.append = function(e) {
        return this.addChild(e)
    }
    ,
    h.prototype.prepend = function(e) {
        return this.insertAt(e, 0)
    }
    ,
    h.prototype.before = function(e) {
        return this.tree.before(this, e)
    }
    ,
    h.prototype.after = function(e) {
        return this.tree.after(this, e)
    }
    ,
    h.prototype.empty = function() {
        for (var e; e = this.children.pop(); )
            e.remove();
        return this
    }
    ,
    h.prototype.remove = function() {
        return this.tree.removeNode(this)
    }
    ,
    h.prototype.removeChild = function(e) {
        var t = this.find(e);
        return t ? this.tree.removeNode(t) : null
    }
    ,
    h.prototype.find = function(e, t) {
        return this.tree.isNode(e) ? e : o(this.children, e, t)
    }
    ,
    h.prototype.focus = function() {
        this.vm && this.vm.focus()
    }
    ,
    h.prototype.hasChildren = function() {
        return this.showChildren && this.isBatch || this.children.length > 0
    }
    ,
    h.prototype.isRoot = function() {
        return null === this.parent
    }
    ,
    h.prototype.clone = function() {
        return this.tree.objectToNode(this.toJSON())
    }
    ,
    h.prototype.toJSON = function() {
        var e = this;
        return {
            text: this.text,
            data: this.data,
            state: this.states,
            children: this.children.map(function(t) {
                return e.tree.objectToNode(t).toJSON()
            })
        }
    }
    ,
    Object.defineProperties(h.prototype, l);
    var p = {
        selected: !1,
        selectable: !0,
        checked: !1,
        expanded: !1,
        disabled: !1,
        visible: !0,
        indeterminate: !1,
        matched: !1,
        editable: !0,
        dragging: !1,
        draggable: !0,
        dropable: !0
    };
    function u(e) {
        return void 0 === e && (e = {}),
        Object.assign({}, p, e)
    }
    function f(e, t) {
        var n = null;
        if (t instanceof h)
            return t;
        if ("string" == typeof t)
            n = new h(e,{
                text: t,
                state: u(),
                id: a()
            });
        else {
            if (Array.isArray(t))
                return t.map(function(t) {
                    return f(e, t)
                });
            (n = new h(e,t)).states = u(n.states),
            n.id || (n.id = a()),
            n.children.length && (n.children = n.children.map(function(t) {
                return (t = f(e, t)).parent = n,
                t
            }))
        }
        return n
    }
    var g = function(e) {
        function t() {
            e.apply(this, arguments)
        }
        return e && (t.__proto__ = e),
        t.prototype = Object.create(e && e.prototype),
        t.prototype.constructor = t,
        t.prototype.empty = function() {
            return this.splice(0, this.length),
            this
        }
        ,
        t.prototype.has = function(e) {
            return this.includes(e)
        }
        ,
        t.prototype.add = function() {
            for (var e, t = [], n = arguments.length; n--; )
                t[n] = arguments[n];
            return (e = this).push.apply(e, t),
            this
        }
        ,
        t.prototype.remove = function(e) {
            var t = this.indexOf(e);
            return -1 === t ? this : (this.splice(t, 1),
            this)
        }
        ,
        t.prototype.removeAll = function(e) {
            for (; this.includes(e); )
                this.remove(e);
            return this
        }
        ,
        t.prototype.top = function() {
            return this[this.length - 1]
        }
        ,
        t
    }(Array)
      , m = {
        id: "id",
        text: "text",
        children: "children",
        state: "state",
        data: "data",
        isBatch: "isBatch"
    };
    var b = function(e, t, n) {
        void 0 === n && (n = {}),
        "string" == typeof e && (e = JSON.parse(e)),
        Array.isArray(e) || (e = [e]);
        var i = Object.assign({}, m, n);
        return e.map(function e(t) {
            var n, r, o = {
                id: (n = t)[(r = i).id],
                text: n[r.text],
                children: n[r.children],
                state: n[r.state],
                data: n[r.data],
                isBatch: n[r.isBatch]
            };
            return o.children && !Array.isArray(o.children) && (o.children = [o.children]),
            o.children && (o.children = o.children.map(e)),
            o
        }).map(function(e) {
            return f(t, e)
        })
    };
    function v(e) {
        return function(e) {
            return new Promise(function(t, n) {
                var i = new XMLHttpRequest;
                i.open("GET", e),
                i.setRequestHeader("Content-Type", "application/json"),
                i.addEventListener("load", function(e) {
                    try {
                        var r = JSON.parse(i.response);
                        t(r)
                    } catch (e) {
                        n(e)
                    }
                }),
                i.send(null)
            }
            )
        }(e)
    }
    function y(e, t) {
        return e.text < t.text ? -1 : e.text > t.text ? 1 : 0
    }
    function x(e, t) {
        return e.text < t.text ? 1 : e.text > t.text ? -1 : 0
    }
    function k(e, t) {
        "string" == typeof t && (t = function(e) {
            switch (e.toLowerCase()) {
            case "asc":
                return y;
            case "desc":
                return x
            }
        }(t)),
        Array.isArray(e) && "function" == typeof t && e.sort(t)
    }
    var N = function(e) {
        var t = this;
        this.vm = e,
        this.options = e.opts,
        this.activeElement = null;
        var n, i = this.options.fetchData;
        "string" == typeof i && (this.options.fetchData = (n = function(e) {
            return function(t) {
                for (var n, i = /{([^}]+)}/, r = e; n = i.exec(r); )
                    r = r.replace(n[0], t[n[1]]);
                return r
            }
        }(i),
        function(e) {
            return v(n(e)).catch(t.options.onFetchError)
        }
        ))
    };
    N.prototype.$on = function(e) {
        for (var t, n = [], i = arguments.length - 1; i-- > 0; )
            n[i] = arguments[i + 1];
        (t = this.vm).$on.apply(t, [e].concat(n))
    }
    ,
    N.prototype.$once = function(e) {
        for (var t, n = [], i = arguments.length - 1; i-- > 0; )
            n[i] = arguments[i + 1];
        (t = this.vm).$once.apply(t, [e].concat(n))
    }
    ,
    N.prototype.$off = function(e) {
        for (var t, n = [], i = arguments.length - 1; i-- > 0; )
            n[i] = arguments[i + 1];
        (t = this.vm).$off.apply(t, [e].concat(n))
    }
    ,
    N.prototype.$emit = function(e) {
        for (var t, n = [], i = arguments.length - 1; i-- > 0; )
            n[i] = arguments[i + 1];
        this.__silence || ((t = this.vm).$emit.apply(t, [e].concat(n)),
        this.options.store && this.vm.$emit("LIQUOR_NOISE"))
    }
    ,
    N.prototype._sort = function(e, t, n) {
        !1 !== n && this.recurseDown(e, function(e) {
            e.hasChildren() && k(e.children, t)
        }),
        k(e, t)
    }
    ,
    N.prototype.sortTree = function(e, t) {
        this._sort(this.model, e, t)
    }
    ,
    N.prototype.sort = function(e, t, n) {
        var i = this
          , r = this.find(e, !0);
        r && t && r.forEach(function(e) {
            i._sort(e.children, t, n)
        })
    }
    ,
    N.prototype.clearFilter = function() {
        this.recurseDown(function(e) {
            e.state("matched", !1),
            e.state("visible", !0),
            e.state("expanded", e.__expanded),
            e.__expanded = void 0,
            e.showChildren = !0
        }),
        this.vm.matches.length = 0,
        this.vm.$emit("tree:filtered", [], "")
    }
    ,
    N.prototype.filter = function(e) {
        if (!e)
            return this.clearFilter();
        var t = []
          , n = this.options.filter.matcher
          , i = this.options.filter
          , r = i.showChildren
          , o = i.plainList;
        return this.recurseDown(function(i) {
            n(e, i) && t.push(i),
            i.showChildren = !0,
            void 0 === i.__expanded && (i.__expanded = i.state("expanded")),
            i.state("visible", !1),
            i.state("matched", !1),
            i.state("expanded", !0)
        }),
        t.reverse().forEach(function(e) {
            e.state("matched", !0),
            e.state("visible", !0),
            e.showChildren = !o,
            e.hasChildren() && e.recurseDown(function(e) {
                e.state("visible", !!r)
            }, !0),
            e.recurseUp(function(e) {
                e.state("visible", !0),
                e.state("expanded", !0)
            }),
            e.hasChildren() && e.state("expanded", !1)
        }),
        this.vm.matches = t,
        this.vm.$emit("tree:filtered", t, e),
        t
    }
    ,
    N.prototype.selected = function() {
        return new (Function.prototype.bind.apply(c, [null].concat([this], this.selectedNodes)))
    }
    ,
    N.prototype.checked = function() {
        return this.options.checkbox ? new (Function.prototype.bind.apply(c, [null].concat([this], this.checkedNodes))) : null
    }
    ,
    N.prototype.loadChildren = function(e) {
        var t = this;
        if (e) {
            this.$emit("tree:data:fetch", e),
            this.options.minFetchDelay > 0 && e.vm && (e.vm.loading = !0);
            var n, i = this.fetch(e).then(function(n) {
                e.append(n),
                e.isBatch = !1,
                t.options.autoCheckChildren && (e.checked() && e.recurseDown(function(e) {
                    e.state("checked", !0)
                }),
                e.refreshIndeterminateState()),
                t.$emit("tree:data:received", e)
            });
            return Promise.all([(n = this.options.minFetchDelay,
            new Promise(function(e) {
                setTimeout(e, n)
            }
            )), i]).then(function(t) {
                return e.vm && (e.vm.loading = !1),
                i
            })
        }
    }
    ,
    N.prototype.fetch = function(e, t) {
        var n = this
          , i = this.options.fetchData(e);
        return i.then || (i = v(i).catch(this.options.onFetchError)),
        !1 === t ? i : i.then(function(e) {
            return n.parse(e, n.options.modelParse)
        }).catch(this.options.onFetchError)
    }
    ,
    N.prototype.fetchInitData = function() {
        return this.fetch({
            id: "root",
            name: "root"
        }, !1)
    }
    ,
    N.prototype.setModel = function(e) {
        var t = this;
        if (this.model = this.parse(e, this.options.modelParse),
        requestAnimationFrame(function(e) {
            t.vm.model = t.model
        }),
        this.selectedNodes = new g,
        this.checkedNodes = new g,
        n(this.model, function(e) {
            e.tree = t,
            e.selected() && t.selectedNodes.add(e),
            e.checked() && (t.checkedNodes.add(e),
            e.parent && e.parent.refreshIndeterminateState()),
            t.options.autoDisableChildren && e.disabled() && e.recurseDown(function(e) {
                e.state("disabled", !0)
            })
        }),
        !this.options.multiple && this.selectedNodes.length) {
            var i = this.selectedNodes.top();
            this.selectedNodes.forEach(function(e) {
                i !== e && e.state("selected", !1)
            }),
            this.selectedNodes.empty().add(i)
        }
        this.options.checkOnSelect && this.options.checkbox && this.unselectAll()
    }
    ,
    N.prototype.recurseDown = function(e, t) {
        return !t && e && (t = e,
        e = this.model),
        n(e, t)
    }
    ,
    N.prototype.select = function(e, t) {
        var n = this.getNode(e);
        return !!n && (this.options.multiple && t ? this.selectedNodes.add(n) : (this.unselectAll(),
        this.selectedNodes.empty().add(n)),
        !0)
    }
    ,
    N.prototype.selectAll = function() {
        var e = this;
        return !!this.options.multiple && (this.selectedNodes.empty(),
        this.recurseDown(function(t) {
            e.selectedNodes.add(t.select(!0))
        }),
        !0)
    }
    ,
    N.prototype.unselect = function(e) {
        var t = this.getNode(e);
        return !!t && (this.selectedNodes.remove(t),
        !0)
    }
    ,
    N.prototype.unselectAll = function() {
        for (var e; e = this.selectedNodes.pop(); )
            e.unselect();
        return !0
    }
    ,
    N.prototype.check = function(e) {
        this.checkedNodes.add(e)
    }
    ,
    N.prototype.uncheck = function(e) {
        this.checkedNodes.remove(e)
    }
    ,
    N.prototype.checkAll = function() {
        this.recurseDown(function(e) {
            0 === e.depth && (e.indeterminate() && e.state("indeterminate", !1),
            e.check())
        })
    }
    ,
    N.prototype.uncheckAll = function() {
        for (var e; e = this.checkedNodes.pop(); )
            e.uncheck();
        return !0
    }
    ,
    N.prototype.expand = function(e) {
        return !e.expanded() && (e.expand(),
        !0)
    }
    ,
    N.prototype.collapse = function(e) {
        return !e.collapsed() && (e.collapse(),
        !0)
    }
    ,
    N.prototype.toggleExpand = function(e) {
        return !!e.hasChildren() && (e.toggleExpand(),
        !0)
    }
    ,
    N.prototype.toggleCollapse = function(e) {
        return !!e.hasChildren() && (e.toggleCollapse(),
        !0)
    }
    ,
    N.prototype.expandAll = function() {
        this.recurseDown(function(e) {
            e.hasChildren() && e.collapsed() && e.expand()
        })
    }
    ,
    N.prototype.collapseAll = function() {
        this.recurseDown(function(e) {
            e.hasChildren() && e.expanded() && e.collapse()
        })
    }
    ,
    N.prototype.index = function(e, t) {
        var n = e.parent
          , i = (n = n ? n.children : this.model).indexOf(e);
        return t ? {
            index: i,
            target: n,
            node: n[i]
        } : i
    }
    ,
    N.prototype.nextNode = function(e) {
        var t = this.index(e, !0);
        return t.target[t.index + 1] || null
    }
    ,
    N.prototype.nextVisibleNode = function(e) {
        if (e.hasChildren() && e.expanded())
            return e.first();
        var t = this.nextNode(e);
        return !t && e.parent ? e.parent.next() : t
    }
    ,
    N.prototype.prevNode = function(e) {
        var t = this.index(e, !0);
        return t.target[t.index - 1] || null
    }
    ,
    N.prototype.prevVisibleNode = function(e) {
        var t = this.prevNode(e);
        return t ? t.hasChildren() && t.expanded() ? t.last() : t : e.parent
    }
    ,
    N.prototype.addToModel = function(e, t) {
        var n = this;
        return void 0 === t && (t = this.model.length),
        e = this.objectToNode(e),
        this.model.splice(t, 0, e),
        this.recurseDown(e, function(e) {
            e.tree = n
        }),
        this.$emit("node:added", e),
        e
    }
    ,
    N.prototype.append = function(e, t) {
        var n = this.find(e);
        return !!n && n.append(t)
    }
    ,
    N.prototype.prepend = function(e, t) {
        var n = this.find(e);
        return !!n && n.prepend(t)
    }
    ,
    N.prototype.before = function(e, t) {
        e = this.find(e);
        var n = this.index(e, !0)
          , i = this.objectToNode(t);
        return !!~n.index && (n.target.splice(n.index, 0, i),
        i.parent = e.parent,
        this.$emit("node:added", i),
        i)
    }
    ,
    N.prototype.after = function(e, t) {
        e = this.find(e);
        var n = this.index(e, !0)
          , i = this.objectToNode(t);
        return !!~n.index && (n.target.splice(n.index + 1, 0, i),
        i.parent = e.parent,
        this.$emit("node:added", i),
        i)
    }
    ,
    N.prototype.addNode = function(e) {
        var t = this.model.length;
        return e = f(e),
        this.model.splice(t, 0, e),
        this.$emit("node:added", e),
        e
    }
    ,
    N.prototype.remove = function(e, t) {
        return this.removeNode(this.find(e, t))
    }
    ,
    N.prototype.removeNode = function(e) {
        if (e instanceof c)
            return e.remove();
        if (!e)
            return !1;
        if (e.parent) {
            var t = e.parent.children;
            ~t.indexOf(e) && t.splice(t.indexOf(e), 1)
        } else
            ~this.model.indexOf(e) && this.model.splice(this.model.indexOf(e), 1);
        e.parent && e.parent.indeterminate() && !e.parent.hasChildren() && e.parent.state("indeterminate", !1),
        null !== this.activeElement && e.id === this.activeElement.id && (this.activeElement = null),
        e.parent = null,
        this.$emit("node:removed", e),
        this.selectedNodes.remove(e),
        this.checkedNodes.remove(e);
        var n = this.vm.matches;
        return n && n.length && n.includes(e) && n.splice(n.indexOf(e), 1),
        e
    }
    ,
    N.prototype.isNode = function(e) {
        return e instanceof h
    }
    ,
    N.prototype.find = function(e, t) {
        if (this.isNode(e))
            return e;
        var n = o(this.model, e);
        return n && n.length ? new c(this,!0 === t ? n : [n[0]]) : new c(this,[])
    }
    ,
    N.prototype.getNodeById = function(e) {
        var t = null;
        return n(this.model, function(n) {
            if ("" + n.id === e)
                return t = n,
                !1
        }),
        t
    }
    ,
    N.prototype.getNode = function(e) {
        return this.isNode(e) ? e : null
    }
    ,
    N.prototype.objectToNode = function(e) {
        return f(this, e)
    }
    ,
    N.prototype.parse = function(e, t) {
        t || (t = this.options.propertyNames);
        try {
            return b(e, this, t)
        } catch (e) {
            return console.error(e),
            []
        }
    }
    ;
    var $ = {
        ARROW_LEFT: 37,
        ARROW_TOP: 38,
        ARROW_RIGHT: 39,
        ARROW_BOTTOM: 40,
        SPACE: 32,
        DELETE: 46,
        ENTER: 13,
        ESC: 27
    }
      , w = [37, 38, 39, 40, 32];
    function E(e) {
        e.vm.$el.addEventListener("keydown", function(t) {
            var n = t.keyCode
              , i = e.activeElement;
            if (e.isNode(i))
                if (i.isEditing)
                    switch (n) {
                    case $.ESC:
                        return i.stopEditing(!1)
                    }
                else
                    switch (w.includes(n) && (t.preventDefault(),
                    t.stopPropagation()),
                    n) {
                    case $.ARROW_LEFT:
                        return function(e, t) {
                            if (t.expanded())
                                t.collapse();
                            else {
                                var n = t.parent;
                                n && n.focus()
                            }
                        }(0, i);
                    case $.ARROW_RIGHT:
                        return function(e, t) {
                            if (t.collapsed())
                                t.expand();
                            else {
                                var n = t.first();
                                n && n.focus()
                            }
                        }(0, i);
                    case $.ARROW_TOP:
                        return function e(t, n) {
                            var i = t.prevVisibleNode(n);
                            if (i)
                                return i.disabled() ? e(t, i) : void i.focus()
                        }(e, i);
                    case $.ARROW_BOTTOM:
                        return function e(t, n) {
                            var i = t.nextVisibleNode(n);
                            if (i)
                                return i.disabled() ? e(t, i) : void i.focus()
                        }(e, i);
                    case $.SPACE:
                    case $.ENTER:
                        return function(e, t) {
                            e.options.checkbox && (t.checked() ? t.uncheck() : t.check())
                        }(e, i);
                    case $.DELETE:
                        return function(e, t) {
                            var n = e.options.deletion;
                            n && ("function" == typeof n ? !0 === n(t) && t.remove() : !0 === n && t.remove())
                        }(e, i)
                    }
        }, !0)
    }
    function D(e, t) {
        if (!1 === e)
            throw new Error(t)
    }
    var C = {
        mounted: function() {
            var e, t = this, n = new N(this);
            this.tree = n,
            this._provided.tree = n,
            !this.data && this.opts.fetchData ? e = n.fetchInitData() : this.data && this.data.then ? (e = this.data,
            this.loading = !0) : e = Promise.resolve(this.data),
            e.then(function(e) {
                var n, i, r, o, s, a;
                e || (e = []),
                t.opts.store ? t.connectStore(t.opts.store) : t.tree.setModel(e),
                t.loading && (t.loading = !1),
                t.$emit("tree:mounted", t),
                i = (n = t).opts,
                r = i.multiple,
                o = i.checkbox,
                s = n.tree,
                (a = function(e) {
                    var t = n.selected();
                    o ? n.$emit("input", {
                        selected: r ? t : t[0] || null,
                        checked: n.checked()
                    }) : n.$emit("input", r ? t : t[0] || null)
                }
                )(),
                s.$on("node:selected", a),
                s.$on("node:unselected", a),
                o && (s.$on("node:checked", a),
                s.$on("node:unchecked", a)),
                s.$on("node:added", function(e, t) {
                    var n = t || e;
                    o && (n.state("checked") && !s.checkedNodes.has(n) && s.checkedNodes.add(n),
                    n.refreshIndeterminateState()),
                    n.state("selected") && !s.selectedNodes.has(n) && s.select(n),
                    a()
                })
            }),
            !1 !== this.opts.keyboardNavigation && E(n)
        },
        methods: {
            connectStore: function(e) {
                var t = this
                  , n = e.store
                  , i = e.mutations
                  , r = e.getter
                  , o = e.dispatcher;
                D("function" == typeof r, "`getter` must be a function"),
                D("function" == typeof o, "`dispatcher` must be a function"),
                void 0 !== i && D(Array.isArray(i), "`mutations` must be an array"),
                n.subscribe(function(e, n) {
                    i ? i.includes(e.type) && t.tree.setModel(r()) : t.tree.setModel(r())
                }),
                this.tree.setModel(r()),
                this.$on("LIQUOR_NOISE", function() {
                    t.$nextTick(function(e) {
                        o(t.toJSON())
                    })
                })
            },
            recurseDown: function(e) {
                this.tree.recurseDown(e)
            },
            selected: function() {
                return this.tree.selected()
            },
            checked: function() {
                return this.tree.checked()
            },
            append: function(e, t) {
                return t ? this.tree.append(e, t) : this.tree.addToModel(e, this.tree.model.length)
            },
            prepend: function(e, t) {
                return t ? this.tree.prepend(e, t) : this.tree.addToModel(e, 0)
            },
            addChild: function(e, t) {
                return this.append(e, t)
            },
            remove: function(e, t) {
                return this.tree.remove(e, t)
            },
            before: function(e, t) {
                return t ? this.tree.before(e, t) : this.prepend(e)
            },
            after: function(e, t) {
                return t ? this.tree.after(e, t) : this.append(e)
            },
            find: function(e, t) {
                return this.tree.find(e, t)
            },
            findAll: function(e) {
                return this.tree.find(e, !0)
            },
            expandAll: function() {
                return this.tree.expandAll()
            },
            collapseAll: function() {
                return this.tree.collapseAll()
            },
            sortTree: function(e, t) {
                return this.tree.sortTree(e, t)
            },
            sort: function() {
                for (var e, t = [], n = arguments.length; n--; )
                    t[n] = arguments[n];
                return (e = this.tree).sort.apply(e, t)
            },
            setModel: function(e) {
                return this.tree.setModel(e)
            },
            getRootNode: function() {
                return 1 === this.tree.model.length ? this.tree.model[0] : this.tree.model
            },
            toJSON: function() {
                return JSON.parse(JSON.stringify(this.model))
            }
        }
    }
      , _ = {
        ABOVE: "drag-above",
        BELOW: "drag-below",
        ON: "drag-on"
    };
    function O(e) {
        return e.path ? e.path : e.composedPath ? e.composedPath() : function(e) {
            for (var t = e.target, n = []; t; ) {
                if (n.push(t),
                "HTML" === t.tagName)
                    return n.push(document),
                    n.push(window),
                    n;
                t = t.parentElement
            }
            return n
        }(e)
    }
    function T(e) {
        var t = function(e) {
            for (var t, n = 0, i = O(e); n < i.length; n++)
                if (t = i[n].className || "",
                /tree-node/.test(t))
                    return i[n];
            return null
        }(e);
        return t || null
    }
    function S(e, t) {
        if (e) {
            var n = e.className;
            if (t)
                new RegExp(t).test(n) || (n += " " + t);
            else {
                for (var i in _)
                    n = n.replace(_[i], "");
                n.replace("dragging", "")
            }
            e.className = n.replace(/\s+/g, " ")
        }
    }
    function A(e, t, n) {
        if (t && t[n] && "function" == typeof t[n])
            return !1 !== t[n].apply(t, e)
    }
    var R = {
        methods: {
            onDragStart: function(e) {
                e.preventDefault()
            },
            startDragging: function(e, t) {
                e.isDraggable() && !1 !== A([e], this.tree.options.dnd, "onDragStart") && (this.$$startDragPosition = [t.clientX, t.clientY],
                this.$$possibleDragNode = e,
                this.initDragListeners())
            },
            initDragListeners: function() {
                var e, t = this, n = function() {
                    window.removeEventListener("mouseup", i, !0),
                    window.removeEventListener("mousemove", r, !0)
                }, i = function(i) {
                    (t.$$startDragPosition || i.stopPropagation(),
                    t.draggableNode && t.draggableNode.node.state("dragging", !1),
                    t.$$dropDestination && t.tree.isNode(t.$$dropDestination) && t.$$dropDestination.vm) && (S(t.$$dropDestination.vm.$el, null),
                    !1 !== A([t.draggableNode.node, t.$$dropDestination, e], t.tree.options.dnd, "onDragFinish") && (t.$$dropDestination.isDropable() || e !== _.ON) && e && (t.draggableNode.node.finishDragging(t.$$dropDestination, e),
                    t.draggableNode.node.parent = t.$$dropDestination),
                    t.$$dropDestination = null);
                    t.$$possibleDragNode = null,
                    t.$set(t, "draggableNode", null),
                    n()
                }, r = function(i) {
                    if (!t.$$startDragPosition || (r = i,
                    o = t.$$startDragPosition,
                    Math.abs(r.clientX - o[0]) > 5 || Math.abs(r.clientY - o[1]) > 5)) {
                        var r, o;
                        if (t.$$startDragPosition = null,
                        t.$$possibleDragNode) {
                            if (!1 === t.$$possibleDragNode.startDragging())
                                return n(),
                                void (t.$$possibleDragNode = null);
                            t.$set(t, "draggableNode", {
                                node: t.$$possibleDragNode,
                                left: 0,
                                top: 0
                            }),
                            t.$$possibleDragNode = null
                        }
                        t.draggableNode.left = i.clientX,
                        t.draggableNode.top = i.clientY;
                        var s = T(i);
                        if (function(e) {
                            for (var t in _)
                                for (var n = e.querySelectorAll("." + _[t]), i = 0; i < n.length; i++)
                                    S(n[i])
                        }(t.$el),
                        s) {
                            var a = s.getAttribute("data-id");
                            if (t.draggableNode.node.id === a)
                                return;
                            if (t.$$dropDestination && t.$$dropDestination.id === a || (t.$$dropDestination = t.tree.getNodeById(a)),
                            t.$$dropDestination && t.draggableNode.node)
                                if (t.$$dropDestination.getPath().includes(t.draggableNode.node))
                                    return void (t.$$dropDestination = null);
                            e = function(e, t) {
                                var n = t.getBoundingClientRect()
                                  , i = n.height / 3
                                  , r = _.ON;
                                return n.top + i >= e.clientY ? r = _.ABOVE : n.top + 2 * i <= e.clientY && (r = _.BELOW),
                                r
                            }(i, s);
                            var d = A([t.draggableNode.node, t.$$dropDestination, e], t.tree.options.dnd, "onDragOn");
                            t.$$dropDestination.isDropable() && !1 !== d || e !== _.ON || (e = null),
                            S(s, e)
                        }
                    }
                };
                window.addEventListener("mouseup", i, !0),
                window.addEventListener("mousemove", r, !0)
            }
        }
    };
    !function() {
        if ("undefined" != typeof document) {
            var e = document.head || document.getElementsByTagName("head")[0]
              , t = document.createElement("style")
              , n = " .tree { overflow: auto; } .tree-root, .tree-children { list-style: none; padding: 0; } .tree > .tree-root, .tree > .tree-filter-empty { padding: 3px; box-sizing: border-box; } .tree.tree--draggable .tree-node:not(.selected) > .tree-content:hover { background: transparent; } .drag-above, .drag-below, .drag-on { position: relative; z-index: 1; } .drag-on > .tree-content { background: #fafcff; outline: 1px solid #7baff2; } .drag-above > .tree-content::before, .drag-below > .tree-content::after { display: block; content: ''; position: absolute; height: 8px; left: 0; right: 0; z-index: 2; box-sizing: border-box; background-color: #3367d6; border: 3px solid #3367d6; background-clip: padding-box; border-bottom-color: transparent; border-top-color: transparent; border-radius: 0; } .drag-above > .tree-content::before { top: 0; transform: translateY(-50%); } .drag-below > .tree-content::after { bottom: 0; transform: translateY(50%); } ";
            t.type = "text/css",
            t.styleSheet ? t.styleSheet.cssText = n : t.appendChild(document.createTextNode(n)),
            e.appendChild(t)
        }
    }();
    var P = {
        direction: "ltr",
        multiple: !0,
        checkbox: !1,
        checkOnSelect: !1,
        autoCheckChildren: !0,
        autoDisableChildren: !0,
        checkDisabledChildren: !0,
        parentSelect: !1,
        keyboardNavigation: !0,
        nodeIndent: 24,
        minFetchDelay: 0,
        fetchData: null,
        propertyNames: null,
        deletion: !1,
        dnd: !1,
        editing: !1,
        onFetchError: function(e) {
            throw e
        }
    }
      , L = {
        emptyText: "Nothing found!",
        matcher: function(e, t) {
            var n = new RegExp(e,"i").test(t.text);
            return !(n && t.parent && new RegExp(e,"i").test(t.parent.text)) && n
        },
        plainList: !1,
        showChildren: !0
    }
      , B = {
        render: function() {
            var e = this
              , t = e.$createElement
              , n = e._self._c || t;
            return n(e.tag, {
                tag: "component",
                class: {
                    tree: !0,
                    "tree-loading": this.loading,
                    "tree--draggable": !!this.draggableNode
                },
                attrs: {
                    role: "tree"
                }
            }, [e.filter && 0 == e.matches.length ? [n("div", {
                staticClass: "tree-filter-empty",
                domProps: {
                    innerHTML: e._s(e.opts.filter.emptyText)
                }
            })] : [n("ul", {
                staticClass: "tree-root",
                on: {
                    dragstart: e.onDragStart
                }
            }, [e.opts.filter.plainList && e.matches.length > 0 ? e._l(e.matches, function(t) {
                return t.visible() ? n("TreeNode", {
                    key: t.id,
                    attrs: {
                        node: t,
                        options: e.opts
                    }
                }) : e._e()
            }) : e._l(e.model, function(t) {
                return t && t.visible() ? n("TreeNode", {
                    key: t.id,
                    attrs: {
                        node: t,
                        options: e.opts
                    }
                }) : e._e()
            })], 2)], e._v(" "), e.draggableNode ? n("DraggableNode", {
                attrs: {
                    target: e.draggableNode
                }
            }) : e._e()], 2)
        },
        staticRenderFns: [],
        name: "Tree",
        components: {
            TreeNode: e,
            DraggableNode: t
        },
        mixins: [C, R],
        provide: function(e) {
            return {
                tree: null
            }
        },
        props: {
            data: {},
            options: {
                type: Object,
                default: function(e) {
                    return {}
                }
            },
            filter: String,
            tag: {
                type: String,
                default: "div"
            }
        },
        watch: {
            filter: function(e) {
                this.tree.filter(e)
            }
        },
        data: function() {
            var e = Object.assign({}, P, this.options);
            return e.filter = Object.assign({}, L, e.filter),
            {
                model: null,
                tree: null,
                loading: !1,
                opts: e,
                matches: [],
                draggableNode: null
            }
        }
    };
    return B.install = function(e) {
        e.component(B.name, B)
    }
    ,
    "undefined" != typeof window && window.Vue && window.Vue.use(B),
    B
});
