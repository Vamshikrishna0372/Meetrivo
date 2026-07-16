import { R as React } from "./react.mjs";
var DefaultContext = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
};
var IconContext = React.createContext && /* @__PURE__ */ React.createContext(DefaultContext);
var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o, r, i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /* @__PURE__ */ React.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return (props) => /* @__PURE__ */ React.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = (conf) => {
    var {
      attr,
      size,
      title
    } = props, svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /* @__PURE__ */ React.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /* @__PURE__ */ React.createElement("title", null, title), props.children);
  };
  return IconContext !== void 0 ? /* @__PURE__ */ React.createElement(IconContext.Consumer, null, (conf) => elem(conf)) : elem(DefaultContext);
}
function FiX(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "18", "y1": "6", "x2": "6", "y2": "18" }, "child": [] }, { "tag": "line", "attr": { "x1": "6", "y1": "6", "x2": "18", "y2": "18" }, "child": [] }] })(props);
}
function FiWifi(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M5 12.55a11 11 0 0 1 14.08 0" }, "child": [] }, { "tag": "path", "attr": { "d": "M1.42 9a16 16 0 0 1 21.16 0" }, "child": [] }, { "tag": "path", "attr": { "d": "M8.53 16.11a6 6 0 0 1 6.95 0" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "20", "x2": "12.01", "y2": "20" }, "child": [] }] })(props);
}
function FiVolume2(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polygon", "attr": { "points": "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }, "child": [] }, { "tag": "path", "attr": { "d": "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" }, "child": [] }] })(props);
}
function FiVideo(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polygon", "attr": { "points": "23 7 16 12 23 17 23 7" }, "child": [] }, { "tag": "rect", "attr": { "x": "1", "y": "5", "width": "15", "height": "14", "rx": "2", "ry": "2" }, "child": [] }] })(props);
}
function FiVideoOff(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" }, "child": [] }, { "tag": "line", "attr": { "x1": "1", "y1": "1", "x2": "23", "y2": "23" }, "child": [] }] })(props);
}
function FiUsers(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }, "child": [] }, { "tag": "circle", "attr": { "cx": "9", "cy": "7", "r": "4" }, "child": [] }, { "tag": "path", "attr": { "d": "M23 21v-2a4 4 0 0 0-3-3.87" }, "child": [] }, { "tag": "path", "attr": { "d": "M16 3.13a4 4 0 0 1 0 7.75" }, "child": [] }] })(props);
}
function FiUser(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }, "child": [] }, { "tag": "circle", "attr": { "cx": "12", "cy": "7", "r": "4" }, "child": [] }] })(props);
}
function FiUserX(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }, "child": [] }, { "tag": "circle", "attr": { "cx": "8.5", "cy": "7", "r": "4" }, "child": [] }, { "tag": "line", "attr": { "x1": "18", "y1": "8", "x2": "23", "y2": "13" }, "child": [] }, { "tag": "line", "attr": { "x1": "23", "y1": "8", "x2": "18", "y2": "13" }, "child": [] }] })(props);
}
function FiUserPlus(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }, "child": [] }, { "tag": "circle", "attr": { "cx": "8.5", "cy": "7", "r": "4" }, "child": [] }, { "tag": "line", "attr": { "x1": "20", "y1": "8", "x2": "20", "y2": "14" }, "child": [] }, { "tag": "line", "attr": { "x1": "23", "y1": "11", "x2": "17", "y2": "11" }, "child": [] }] })(props);
}
function FiUserMinus(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }, "child": [] }, { "tag": "circle", "attr": { "cx": "8.5", "cy": "7", "r": "4" }, "child": [] }, { "tag": "line", "attr": { "x1": "23", "y1": "11", "x2": "17", "y2": "11" }, "child": [] }] })(props);
}
function FiUserCheck(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }, "child": [] }, { "tag": "circle", "attr": { "cx": "8.5", "cy": "7", "r": "4" }, "child": [] }, { "tag": "polyline", "attr": { "points": "17 11 19 13 23 9" }, "child": [] }] })(props);
}
function FiUploadCloud(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "16 16 12 12 8 16" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "12", "x2": "12", "y2": "21" }, "child": [] }, { "tag": "path", "attr": { "d": "M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" }, "child": [] }, { "tag": "polyline", "attr": { "points": "16 16 12 12 8 16" }, "child": [] }] })(props);
}
function FiTwitter(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" }, "child": [] }] })(props);
}
function FiTrendingUp(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "23 6 13.5 15.5 8.5 10.5 1 18" }, "child": [] }, { "tag": "polyline", "attr": { "points": "17 6 23 6 23 12" }, "child": [] }] })(props);
}
function FiTrash2(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "3 6 5 6 21 6" }, "child": [] }, { "tag": "path", "attr": { "d": "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }, "child": [] }, { "tag": "line", "attr": { "x1": "10", "y1": "11", "x2": "10", "y2": "17" }, "child": [] }, { "tag": "line", "attr": { "x1": "14", "y1": "11", "x2": "14", "y2": "17" }, "child": [] }] })(props);
}
function FiStar(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polygon", "attr": { "points": "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }, "child": [] }] })(props);
}
function FiSquare(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2", "ry": "2" }, "child": [] }] })(props);
}
function FiSmile(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "path", "attr": { "d": "M8 14s1.5 2 4 2 4-2 4-2" }, "child": [] }, { "tag": "line", "attr": { "x1": "9", "y1": "9", "x2": "9.01", "y2": "9" }, "child": [] }, { "tag": "line", "attr": { "x1": "15", "y1": "9", "x2": "15.01", "y2": "9" }, "child": [] }] })(props);
}
function FiSmartphone(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "5", "y": "2", "width": "14", "height": "20", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "18", "x2": "12.01", "y2": "18" }, "child": [] }] })(props);
}
function FiShield(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }, "child": [] }] })(props);
}
function FiShare2(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "18", "cy": "5", "r": "3" }, "child": [] }, { "tag": "circle", "attr": { "cx": "6", "cy": "12", "r": "3" }, "child": [] }, { "tag": "circle", "attr": { "cx": "18", "cy": "19", "r": "3" }, "child": [] }, { "tag": "line", "attr": { "x1": "8.59", "y1": "13.51", "x2": "15.42", "y2": "17.49" }, "child": [] }, { "tag": "line", "attr": { "x1": "15.41", "y1": "6.51", "x2": "8.59", "y2": "10.49" }, "child": [] }] })(props);
}
function FiSettings(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "3" }, "child": [] }, { "tag": "path", "attr": { "d": "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" }, "child": [] }] })(props);
}
function FiSend(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "22", "y1": "2", "x2": "11", "y2": "13" }, "child": [] }, { "tag": "polygon", "attr": { "points": "22 2 15 22 11 13 2 9 22 2" }, "child": [] }] })(props);
}
function FiSearch(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "11", "cy": "11", "r": "8" }, "child": [] }, { "tag": "line", "attr": { "x1": "21", "y1": "21", "x2": "16.65", "y2": "16.65" }, "child": [] }] })(props);
}
function FiSave(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }, "child": [] }, { "tag": "polyline", "attr": { "points": "17 21 17 13 7 13 7 21" }, "child": [] }, { "tag": "polyline", "attr": { "points": "7 3 7 8 15 8" }, "child": [] }] })(props);
}
function FiRotateCw(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "23 4 23 10 17 10" }, "child": [] }, { "tag": "path", "attr": { "d": "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" }, "child": [] }] })(props);
}
function FiRotateCcw(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "1 4 1 10 7 10" }, "child": [] }, { "tag": "path", "attr": { "d": "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" }, "child": [] }] })(props);
}
function FiPlus(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "12", "y1": "5", "x2": "12", "y2": "19" }, "child": [] }, { "tag": "line", "attr": { "x1": "5", "y1": "12", "x2": "19", "y2": "12" }, "child": [] }] })(props);
}
function FiPlusCircle(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "8", "x2": "12", "y2": "16" }, "child": [] }, { "tag": "line", "attr": { "x1": "8", "y1": "12", "x2": "16", "y2": "12" }, "child": [] }] })(props);
}
function FiPlay(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polygon", "attr": { "points": "5 3 19 12 5 21 5 3" }, "child": [] }] })(props);
}
function FiPhoneOff(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" }, "child": [] }, { "tag": "line", "attr": { "x1": "23", "y1": "1", "x2": "1", "y2": "23" }, "child": [] }] })(props);
}
function FiMoon(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }, "child": [] }] })(props);
}
function FiMonitor(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "2", "y": "3", "width": "20", "height": "14", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "line", "attr": { "x1": "8", "y1": "21", "x2": "16", "y2": "21" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "17", "x2": "12", "y2": "21" }, "child": [] }] })(props);
}
function FiMinus(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "5", "y1": "12", "x2": "19", "y2": "12" }, "child": [] }] })(props);
}
function FiMic(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" }, "child": [] }, { "tag": "path", "attr": { "d": "M19 10v2a7 7 0 0 1-14 0v-2" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "19", "x2": "12", "y2": "23" }, "child": [] }, { "tag": "line", "attr": { "x1": "8", "y1": "23", "x2": "16", "y2": "23" }, "child": [] }] })(props);
}
function FiMicOff(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "1", "y1": "1", "x2": "23", "y2": "23" }, "child": [] }, { "tag": "path", "attr": { "d": "M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" }, "child": [] }, { "tag": "path", "attr": { "d": "M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "19", "x2": "12", "y2": "23" }, "child": [] }, { "tag": "line", "attr": { "x1": "8", "y1": "23", "x2": "16", "y2": "23" }, "child": [] }] })(props);
}
function FiMessageSquare(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }, "child": [] }] })(props);
}
function FiMenu(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "3", "y1": "12", "x2": "21", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "3", "y1": "6", "x2": "21", "y2": "6" }, "child": [] }, { "tag": "line", "attr": { "x1": "3", "y1": "18", "x2": "21", "y2": "18" }, "child": [] }] })(props);
}
function FiMaximize(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" }, "child": [] }] })(props);
}
function FiLogOut(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }, "child": [] }, { "tag": "polyline", "attr": { "points": "16 17 21 12 16 7" }, "child": [] }, { "tag": "line", "attr": { "x1": "21", "y1": "12", "x2": "9", "y2": "12" }, "child": [] }] })(props);
}
function FiLogIn(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }, "child": [] }, { "tag": "polyline", "attr": { "points": "10 17 15 12 10 7" }, "child": [] }, { "tag": "line", "attr": { "x1": "15", "y1": "12", "x2": "3", "y2": "12" }, "child": [] }] })(props);
}
function FiLock(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "3", "y": "11", "width": "18", "height": "11", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "path", "attr": { "d": "M7 11V7a5 5 0 0 1 10 0v4" }, "child": [] }] })(props);
}
function FiLoader(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "12", "y1": "2", "x2": "12", "y2": "6" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "18", "x2": "12", "y2": "22" }, "child": [] }, { "tag": "line", "attr": { "x1": "4.93", "y1": "4.93", "x2": "7.76", "y2": "7.76" }, "child": [] }, { "tag": "line", "attr": { "x1": "16.24", "y1": "16.24", "x2": "19.07", "y2": "19.07" }, "child": [] }, { "tag": "line", "attr": { "x1": "2", "y1": "12", "x2": "6", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "18", "y1": "12", "x2": "22", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "4.93", "y1": "19.07", "x2": "7.76", "y2": "16.24" }, "child": [] }, { "tag": "line", "attr": { "x1": "16.24", "y1": "7.76", "x2": "19.07", "y2": "4.93" }, "child": [] }] })(props);
}
function FiLinkedin(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }, "child": [] }, { "tag": "rect", "attr": { "x": "2", "y": "9", "width": "4", "height": "12" }, "child": [] }, { "tag": "circle", "attr": { "cx": "4", "cy": "4", "r": "2" }, "child": [] }] })(props);
}
function FiLayers(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polygon", "attr": { "points": "12 2 2 7 12 12 22 7 12 2" }, "child": [] }, { "tag": "polyline", "attr": { "points": "2 17 12 22 22 17" }, "child": [] }, { "tag": "polyline", "attr": { "points": "2 12 12 17 22 12" }, "child": [] }] })(props);
}
function FiInfo(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "16", "x2": "12", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "8", "x2": "12.01", "y2": "8" }, "child": [] }] })(props);
}
function FiInbox(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "22 12 16 12 14 15 10 15 8 12 2 12" }, "child": [] }, { "tag": "path", "attr": { "d": "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" }, "child": [] }] })(props);
}
function FiImage(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "circle", "attr": { "cx": "8.5", "cy": "8.5", "r": "1.5" }, "child": [] }, { "tag": "polyline", "attr": { "points": "21 15 16 10 5 21" }, "child": [] }] })(props);
}
function FiHome(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }, "child": [] }, { "tag": "polyline", "attr": { "points": "9 22 9 12 15 12 15 22" }, "child": [] }] })(props);
}
function FiHelpCircle(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "path", "attr": { "d": "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "17", "x2": "12.01", "y2": "17" }, "child": [] }] })(props);
}
function FiHardDrive(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "22", "y1": "12", "x2": "2", "y2": "12" }, "child": [] }, { "tag": "path", "attr": { "d": "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" }, "child": [] }, { "tag": "line", "attr": { "x1": "6", "y1": "16", "x2": "6.01", "y2": "16" }, "child": [] }, { "tag": "line", "attr": { "x1": "10", "y1": "16", "x2": "10.01", "y2": "16" }, "child": [] }] })(props);
}
function FiGrid(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "3", "y": "3", "width": "7", "height": "7" }, "child": [] }, { "tag": "rect", "attr": { "x": "14", "y": "3", "width": "7", "height": "7" }, "child": [] }, { "tag": "rect", "attr": { "x": "14", "y": "14", "width": "7", "height": "7" }, "child": [] }, { "tag": "rect", "attr": { "x": "3", "y": "14", "width": "7", "height": "7" }, "child": [] }] })(props);
}
function FiGithub(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" }, "child": [] }] })(props);
}
function FiFolder(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" }, "child": [] }] })(props);
}
function FiFile(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" }, "child": [] }, { "tag": "polyline", "attr": { "points": "13 2 13 9 20 9" }, "child": [] }] })(props);
}
function FiFileText(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }, "child": [] }, { "tag": "polyline", "attr": { "points": "14 2 14 8 20 8" }, "child": [] }, { "tag": "line", "attr": { "x1": "16", "y1": "13", "x2": "8", "y2": "13" }, "child": [] }, { "tag": "line", "attr": { "x1": "16", "y1": "17", "x2": "8", "y2": "17" }, "child": [] }, { "tag": "polyline", "attr": { "points": "10 9 9 9 8 9" }, "child": [] }] })(props);
}
function FiEye(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }, "child": [] }, { "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "3" }, "child": [] }] })(props);
}
function FiEyeOff(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }, "child": [] }, { "tag": "line", "attr": { "x1": "1", "y1": "1", "x2": "23", "y2": "23" }, "child": [] }] })(props);
}
function FiEdit(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }, "child": [] }, { "tag": "path", "attr": { "d": "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" }, "child": [] }] })(props);
}
function FiEdit3(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M12 20h9" }, "child": [] }, { "tag": "path", "attr": { "d": "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" }, "child": [] }] })(props);
}
function FiEdit2(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" }, "child": [] }] })(props);
}
function FiDownload(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }, "child": [] }, { "tag": "polyline", "attr": { "points": "7 10 12 15 17 10" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "15", "x2": "12", "y2": "3" }, "child": [] }] })(props);
}
function FiDollarSign(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "12", "y1": "1", "x2": "12", "y2": "23" }, "child": [] }, { "tag": "path", "attr": { "d": "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }, "child": [] }] })(props);
}
function FiDatabase(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "ellipse", "attr": { "cx": "12", "cy": "5", "rx": "9", "ry": "3" }, "child": [] }, { "tag": "path", "attr": { "d": "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" }, "child": [] }, { "tag": "path", "attr": { "d": "M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" }, "child": [] }] })(props);
}
function FiCreditCard(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "1", "y": "4", "width": "22", "height": "16", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "line", "attr": { "x1": "1", "y1": "10", "x2": "23", "y2": "10" }, "child": [] }] })(props);
}
function FiCpu(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "4", "y": "4", "width": "16", "height": "16", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "rect", "attr": { "x": "9", "y": "9", "width": "6", "height": "6" }, "child": [] }, { "tag": "line", "attr": { "x1": "9", "y1": "1", "x2": "9", "y2": "4" }, "child": [] }, { "tag": "line", "attr": { "x1": "15", "y1": "1", "x2": "15", "y2": "4" }, "child": [] }, { "tag": "line", "attr": { "x1": "9", "y1": "20", "x2": "9", "y2": "23" }, "child": [] }, { "tag": "line", "attr": { "x1": "15", "y1": "20", "x2": "15", "y2": "23" }, "child": [] }, { "tag": "line", "attr": { "x1": "20", "y1": "9", "x2": "23", "y2": "9" }, "child": [] }, { "tag": "line", "attr": { "x1": "20", "y1": "14", "x2": "23", "y2": "14" }, "child": [] }, { "tag": "line", "attr": { "x1": "1", "y1": "9", "x2": "4", "y2": "9" }, "child": [] }, { "tag": "line", "attr": { "x1": "1", "y1": "14", "x2": "4", "y2": "14" }, "child": [] }] })(props);
}
function FiCopy(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "9", "y": "9", "width": "13", "height": "13", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "path", "attr": { "d": "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" }, "child": [] }] })(props);
}
function FiCode(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "16 18 22 12 16 6" }, "child": [] }, { "tag": "polyline", "attr": { "points": "8 6 2 12 8 18" }, "child": [] }] })(props);
}
function FiClock(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "polyline", "attr": { "points": "12 6 12 12 16 14" }, "child": [] }] })(props);
}
function FiCircle(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }] })(props);
}
function FiChevronLeft(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "15 18 9 12 15 6" }, "child": [] }] })(props);
}
function FiCheck(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "20 6 9 17 4 12" }, "child": [] }] })(props);
}
function FiCheckCircle(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M22 11.08V12a10 10 0 1 1-5.93-9.14" }, "child": [] }, { "tag": "polyline", "attr": { "points": "22 4 12 14.01 9 11.01" }, "child": [] }] })(props);
}
function FiCalendar(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "rect", "attr": { "x": "3", "y": "4", "width": "18", "height": "18", "rx": "2", "ry": "2" }, "child": [] }, { "tag": "line", "attr": { "x1": "16", "y1": "2", "x2": "16", "y2": "6" }, "child": [] }, { "tag": "line", "attr": { "x1": "8", "y1": "2", "x2": "8", "y2": "6" }, "child": [] }, { "tag": "line", "attr": { "x1": "3", "y1": "10", "x2": "21", "y2": "10" }, "child": [] }] })(props);
}
function FiBell(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }, "child": [] }, { "tag": "path", "attr": { "d": "M13.73 21a2 2 0 0 1-3.46 0" }, "child": [] }] })(props);
}
function FiArrowRight(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "5", "y1": "12", "x2": "19", "y2": "12" }, "child": [] }, { "tag": "polyline", "attr": { "points": "12 5 19 12 12 19" }, "child": [] }] })(props);
}
function FiArchive(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "21 8 21 21 3 21 3 8" }, "child": [] }, { "tag": "rect", "attr": { "x": "1", "y": "3", "width": "22", "height": "5" }, "child": [] }, { "tag": "line", "attr": { "x1": "10", "y1": "12", "x2": "14", "y2": "12" }, "child": [] }] })(props);
}
function FiAlertCircle(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "8", "x2": "12", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "16", "x2": "12.01", "y2": "16" }, "child": [] }] })(props);
}
function FiActivity(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "22 12 18 12 15 21 9 3 6 12 2 12" }, "child": [] }] })(props);
}
function BsEraser(props) {
  return GenIcon({ "attr": { "fill": "currentColor", "viewBox": "0 0 16 16" }, "child": [{ "tag": "path", "attr": { "d": "M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z" }, "child": [] }] })(props);
}
function TbHandStop(props) {
  return GenIcon({ "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5" }, "child": [] }, { "tag": "path", "attr": { "d": "M11 5.5v-2a1.5 1.5 0 1 1 3 0v8.5" }, "child": [] }, { "tag": "path", "attr": { "d": "M14 5.5a1.5 1.5 0 0 1 3 0v6.5" }, "child": [] }, { "tag": "path", "attr": { "d": "M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" }, "child": [] }] })(props);
}
export {
  FiInbox as $,
  FiFile as A,
  BsEraser as B,
  FiCpu as C,
  FiGrid as D,
  FiInfo as E,
  FiEdit2 as F,
  FiPhoneOff as G,
  FiCopy as H,
  FiUserCheck as I,
  FiUserX as J,
  FiUserMinus as K,
  FiWifi as L,
  FiLayers as M,
  FiPlus as N,
  FiSearch as O,
  FiPlusCircle as P,
  FiEdit as Q,
  FiUserPlus as R,
  FiCheckCircle as S,
  TbHandStop as T,
  FiVolume2 as U,
  FiSettings as V,
  FiAlertCircle as W,
  FiArrowRight as X,
  FiMaximize as Y,
  FiUser as Z,
  FiChevronLeft as _,
  FiMinus as a,
  FiUploadCloud as a0,
  FiArchive as a1,
  FiFileText as a2,
  FiImage as a3,
  FiDownload as a4,
  FiStar as a5,
  FiLogIn as a6,
  FiHardDrive as a7,
  FiTrendingUp as a8,
  FiCalendar as a9,
  FiActivity as aa,
  FiEyeOff as ab,
  FiEye as ac,
  FiDatabase as ad,
  FiDollarSign as ae,
  FiLogOut as af,
  FiHome as ag,
  FiFolder as ah,
  FiEdit3 as ai,
  FiCreditCard as aj,
  FiPlay as ak,
  FiMenu as al,
  FiTwitter as am,
  FiGithub as an,
  FiLinkedin as ao,
  FiCode as ap,
  FiSmartphone as aq,
  FiSquare as b,
  FiCircle as c,
  FiRotateCcw as d,
  FiRotateCw as e,
  FiSave as f,
  FiTrash2 as g,
  FiLoader as h,
  FiCheck as i,
  FiX as j,
  FiHelpCircle as k,
  FiSend as l,
  FiMoon as m,
  FiBell as n,
  FiMic as o,
  FiShield as p,
  FiLock as q,
  FiShare2 as r,
  FiClock as s,
  FiMonitor as t,
  FiMicOff as u,
  FiVideo as v,
  FiVideoOff as w,
  FiSmile as x,
  FiUsers as y,
  FiMessageSquare as z
};
