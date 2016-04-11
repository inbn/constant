(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in window.self) {

  // Full polyfill for browsers with no classList support
  if (!("classList" in document.createElement("_"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window.self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

},{}],2:[function(require,module,exports){
!function(){window.flexibility={},Array.prototype.forEach||(Array.prototype.forEach=function(t){if(void 0===this||null===this)throw new TypeError(this+"is not an object");if(!(t instanceof Function))throw new TypeError(t+" is not a function");for(var e=Object(this),i=arguments[1],n=e instanceof String?e.split(""):e,r=Math.max(Math.min(n.length,9007199254740991),0)||0,o=-1;++o<r;)o in n&&t.call(i,n[o],o,e)}),function(t,e){"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?module.exports=e():t.computeLayout=e()}(flexibility,function(){var t=function(){function t(e){if((!e.layout||e.isDirty)&&(e.layout={width:void 0,height:void 0,top:0,left:0,right:0,bottom:0}),e.style||(e.style={}),e.children||(e.children=[]),e.style.measure&&e.children&&e.children.length)throw new Error("Using custom measure function is supported only for leaf nodes.");return e.children.forEach(t),e}function e(t){return void 0===t}function i(t){return t===q||t===G}function n(t){return t===U||t===Z}function r(t,e){if(void 0!==t.style.marginStart&&i(e))return t.style.marginStart;var n=null;switch(e){case"row":n=t.style.marginLeft;break;case"row-reverse":n=t.style.marginRight;break;case"column":n=t.style.marginTop;break;case"column-reverse":n=t.style.marginBottom}return void 0!==n?n:void 0!==t.style.margin?t.style.margin:0}function o(t,e){if(void 0!==t.style.marginEnd&&i(e))return t.style.marginEnd;var n=null;switch(e){case"row":n=t.style.marginRight;break;case"row-reverse":n=t.style.marginLeft;break;case"column":n=t.style.marginBottom;break;case"column-reverse":n=t.style.marginTop}return null!=n?n:void 0!==t.style.margin?t.style.margin:0}function l(t,e){if(void 0!==t.style.paddingStart&&t.style.paddingStart>=0&&i(e))return t.style.paddingStart;var n=null;switch(e){case"row":n=t.style.paddingLeft;break;case"row-reverse":n=t.style.paddingRight;break;case"column":n=t.style.paddingTop;break;case"column-reverse":n=t.style.paddingBottom}return null!=n&&n>=0?n:void 0!==t.style.padding&&t.style.padding>=0?t.style.padding:0}function a(t,e){if(void 0!==t.style.paddingEnd&&t.style.paddingEnd>=0&&i(e))return t.style.paddingEnd;var n=null;switch(e){case"row":n=t.style.paddingRight;break;case"row-reverse":n=t.style.paddingLeft;break;case"column":n=t.style.paddingBottom;break;case"column-reverse":n=t.style.paddingTop}return null!=n&&n>=0?n:void 0!==t.style.padding&&t.style.padding>=0?t.style.padding:0}function d(t,e){if(void 0!==t.style.borderStartWidth&&t.style.borderStartWidth>=0&&i(e))return t.style.borderStartWidth;var n=null;switch(e){case"row":n=t.style.borderLeftWidth;break;case"row-reverse":n=t.style.borderRightWidth;break;case"column":n=t.style.borderTopWidth;break;case"column-reverse":n=t.style.borderBottomWidth}return null!=n&&n>=0?n:void 0!==t.style.borderWidth&&t.style.borderWidth>=0?t.style.borderWidth:0}function s(t,e){if(void 0!==t.style.borderEndWidth&&t.style.borderEndWidth>=0&&i(e))return t.style.borderEndWidth;var n=null;switch(e){case"row":n=t.style.borderRightWidth;break;case"row-reverse":n=t.style.borderLeftWidth;break;case"column":n=t.style.borderBottomWidth;break;case"column-reverse":n=t.style.borderTopWidth}return null!=n&&n>=0?n:void 0!==t.style.borderWidth&&t.style.borderWidth>=0?t.style.borderWidth:0}function u(t,e){return l(t,e)+d(t,e)}function y(t,e){return a(t,e)+s(t,e)}function c(t,e){return d(t,e)+s(t,e)}function f(t,e){return r(t,e)+o(t,e)}function h(t,e){return u(t,e)+y(t,e)}function m(t){return t.style.justifyContent?t.style.justifyContent:"flex-start"}function v(t){return t.style.alignContent?t.style.alignContent:"flex-start"}function p(t,e){return e.style.alignSelf?e.style.alignSelf:t.style.alignItems?t.style.alignItems:"stretch"}function x(t,e){if(e===N){if(t===q)return G;if(t===G)return q}return t}function g(t,e){var i;return i=t.style.direction?t.style.direction:M,i===M&&(i=void 0===e?A:e),i}function b(t){return t.style.flexDirection?t.style.flexDirection:U}function w(t,e){return n(t)?x(q,e):U}function W(t){return t.style.position?t.style.position:"relative"}function L(t){return W(t)===tt&&t.style.flex>0}function E(t){return"wrap"===t.style.flexWrap}function S(t,e){return t.layout[ot[e]]+f(t,e)}function k(t,e){return void 0!==t.style[ot[e]]&&t.style[ot[e]]>=0}function C(t,e){return void 0!==t.style[e]}function T(t){return void 0!==t.style.measure}function H(t,e){return void 0!==t.style[e]?t.style[e]:0}function $(t,e,i){var n={row:t.style.minWidth,"row-reverse":t.style.minWidth,column:t.style.minHeight,"column-reverse":t.style.minHeight}[e],r={row:t.style.maxWidth,"row-reverse":t.style.maxWidth,column:t.style.maxHeight,"column-reverse":t.style.maxHeight}[e],o=i;return void 0!==r&&r>=0&&o>r&&(o=r),void 0!==n&&n>=0&&n>o&&(o=n),o}function z(t,e){return t>e?t:e}function B(t,e){void 0===t.layout[ot[e]]&&k(t,e)&&(t.layout[ot[e]]=z($(t,e,t.style[ot[e]]),h(t,e)))}function D(t,e,i){e.layout[nt[i]]=t.layout[ot[i]]-e.layout[ot[i]]-e.layout[rt[i]]}function I(t,e){return void 0!==t.style[it[e]]?H(t,it[e]):-H(t,nt[e])}function R(t,n,l,a){var s=g(t,a),R=x(b(t),s),M=w(R,s),A=x(q,s);B(t,R),B(t,M),t.layout.direction=s,t.layout[it[R]]+=r(t,R)+I(t,R),t.layout[nt[R]]+=o(t,R)+I(t,R),t.layout[it[M]]+=r(t,M)+I(t,M),t.layout[nt[M]]+=o(t,M)+I(t,M);var N=t.children.length,lt=h(t,A),at=h(t,U);if(T(t)){var dt=!e(t.layout[ot[A]]),st=F;st=k(t,A)?t.style.width:dt?t.layout[ot[A]]:n-f(t,A),st-=lt;var ut=F;ut=k(t,U)?t.style.height:e(t.layout[ot[U]])?l-f(t,A):t.layout[ot[U]],ut-=h(t,U);var yt=!k(t,A)&&!dt,ct=!k(t,U)&&e(t.layout[ot[U]]);if(yt||ct){var ft=t.style.measure(st,ut);yt&&(t.layout.width=ft.width+lt),ct&&(t.layout.height=ft.height+at)}if(0===N)return}var ht,mt,vt,pt,xt=E(t),gt=m(t),bt=u(t,R),wt=u(t,M),Wt=h(t,R),Lt=h(t,M),Et=!e(t.layout[ot[R]]),St=!e(t.layout[ot[M]]),kt=i(R),Ct=null,Tt=null,Ht=F;Et&&(Ht=t.layout[ot[R]]-Wt);for(var $t=0,zt=0,Bt=0,Dt=0,It=0,Rt=0;N>zt;){var jt,Ft,Mt=0,At=0,Nt=0,qt=0,Gt=Et&&gt===O||!Et&&gt!==_,Ut=Gt?N:$t,Zt=!0,Ot=N,_t=null,Jt=null,Kt=bt,Pt=0;for(ht=$t;N>ht;++ht){vt=t.children[ht],vt.lineIndex=Rt,vt.nextAbsoluteChild=null,vt.nextFlexChild=null;var Qt=p(t,vt);if(Qt===Y&&W(vt)===tt&&St&&!k(vt,M))vt.layout[ot[M]]=z($(vt,M,t.layout[ot[M]]-Lt-f(vt,M)),h(vt,M));else if(W(vt)===et)for(null===Ct&&(Ct=vt),null!==Tt&&(Tt.nextAbsoluteChild=vt),Tt=vt,mt=0;2>mt;mt++)pt=0!==mt?q:U,!e(t.layout[ot[pt]])&&!k(vt,pt)&&C(vt,it[pt])&&C(vt,nt[pt])&&(vt.layout[ot[pt]]=z($(vt,pt,t.layout[ot[pt]]-h(t,pt)-f(vt,pt)-H(vt,it[pt])-H(vt,nt[pt])),h(vt,pt)));var Vt=0;if(Et&&L(vt)?(At++,Nt+=vt.style.flex,null===_t&&(_t=vt),null!==Jt&&(Jt.nextFlexChild=vt),Jt=vt,Vt=h(vt,R)+f(vt,R)):(jt=F,Ft=F,kt?Ft=k(t,U)?t.layout[ot[U]]-at:l-f(t,U)-at:jt=k(t,A)?t.layout[ot[A]]-lt:n-f(t,A)-lt,0===Bt&&j(vt,jt,Ft,s),W(vt)===tt&&(qt++,Vt=S(vt,R))),xt&&Et&&Mt+Vt>Ht&&ht!==$t){qt--,Bt=1;break}Gt&&(W(vt)!==tt||L(vt))&&(Gt=!1,Ut=ht),Zt&&(W(vt)!==tt||Qt!==Y&&Qt!==Q||e(vt.layout[ot[M]]))&&(Zt=!1,Ot=ht),Gt&&(vt.layout[rt[R]]+=Kt,Et&&D(t,vt,R),Kt+=S(vt,R),Pt=z(Pt,$(vt,M,S(vt,M)))),Zt&&(vt.layout[rt[M]]+=Dt+wt,St&&D(t,vt,M)),Bt=0,Mt+=Vt,zt=ht+1}var Xt=0,Yt=0,te=0;if(te=Et?Ht-Mt:z(Mt,0)-Mt,0!==At){var ee,ie,ne=te/Nt;for(Jt=_t;null!==Jt;)ee=ne*Jt.style.flex+h(Jt,R),ie=$(Jt,R,ee),ee!==ie&&(te-=ie,Nt-=Jt.style.flex),Jt=Jt.nextFlexChild;for(ne=te/Nt,0>ne&&(ne=0),Jt=_t;null!==Jt;)Jt.layout[ot[R]]=$(Jt,R,ne*Jt.style.flex+h(Jt,R)),jt=F,k(t,A)?jt=t.layout[ot[A]]-lt:kt||(jt=n-f(t,A)-lt),Ft=F,k(t,U)?Ft=t.layout[ot[U]]-at:kt&&(Ft=l-f(t,U)-at),j(Jt,jt,Ft,s),vt=Jt,Jt=Jt.nextFlexChild,vt.nextFlexChild=null}else gt!==O&&(gt===_?Xt=te/2:gt===J?Xt=te:gt===K?(te=z(te,0),Yt=At+qt-1!==0?te/(At+qt-1):0):gt===P&&(Yt=te/(At+qt),Xt=Yt/2));for(Kt+=Xt,ht=Ut;zt>ht;++ht)vt=t.children[ht],W(vt)===et&&C(vt,it[R])?vt.layout[rt[R]]=H(vt,it[R])+d(t,R)+r(vt,R):(vt.layout[rt[R]]+=Kt,Et&&D(t,vt,R),W(vt)===tt&&(Kt+=Yt+S(vt,R),Pt=z(Pt,$(vt,M,S(vt,M)))));var re=t.layout[ot[M]];for(St||(re=z($(t,M,Pt+Lt),Lt)),ht=Ot;zt>ht;++ht)if(vt=t.children[ht],W(vt)===et&&C(vt,it[M]))vt.layout[rt[M]]=H(vt,it[M])+d(t,M)+r(vt,M);else{var oe=wt;if(W(vt)===tt){var Qt=p(t,vt);if(Qt===Y)e(vt.layout[ot[M]])&&(vt.layout[ot[M]]=z($(vt,M,re-Lt-f(vt,M)),h(vt,M)));else if(Qt!==Q){var le=re-Lt-S(vt,M);oe+=Qt===V?le/2:le}}vt.layout[rt[M]]+=Dt+oe,St&&D(t,vt,M)}Dt+=Pt,It=z(It,Kt),Rt+=1,$t=zt}if(Rt>1&&St){var ae=t.layout[ot[M]]-Lt,de=ae-Dt,se=0,ue=wt,ye=v(t);ye===X?ue+=de:ye===V?ue+=de/2:ye===Y&&ae>Dt&&(se=de/Rt);var ce=0;for(ht=0;Rt>ht;++ht){var fe=ce,he=0;for(mt=fe;N>mt;++mt)if(vt=t.children[mt],W(vt)===tt){if(vt.lineIndex!==ht)break;e(vt.layout[ot[M]])||(he=z(he,vt.layout[ot[M]]+f(vt,M)))}for(ce=mt,he+=se,mt=fe;ce>mt;++mt)if(vt=t.children[mt],W(vt)===tt){var me=p(t,vt);if(me===Q)vt.layout[rt[M]]=ue+r(vt,M);else if(me===X)vt.layout[rt[M]]=ue+he-o(vt,M)-vt.layout[ot[M]];else if(me===V){var ve=vt.layout[ot[M]];vt.layout[rt[M]]=ue+(he-ve)/2}else me===Y&&(vt.layout[rt[M]]=ue+r(vt,M))}ue+=he}}var pe=!1,xe=!1;if(Et||(t.layout[ot[R]]=z($(t,R,It+y(t,R)),Wt),(R===G||R===Z)&&(pe=!0)),St||(t.layout[ot[M]]=z($(t,M,Dt+Lt),Lt),(M===G||M===Z)&&(xe=!0)),pe||xe)for(ht=0;N>ht;++ht)vt=t.children[ht],pe&&D(t,vt,R),xe&&D(t,vt,M);for(Tt=Ct;null!==Tt;){for(mt=0;2>mt;mt++)pt=0!==mt?q:U,!e(t.layout[ot[pt]])&&!k(Tt,pt)&&C(Tt,it[pt])&&C(Tt,nt[pt])&&(Tt.layout[ot[pt]]=z($(Tt,pt,t.layout[ot[pt]]-c(t,pt)-f(Tt,pt)-H(Tt,it[pt])-H(Tt,nt[pt])),h(Tt,pt))),C(Tt,nt[pt])&&!C(Tt,it[pt])&&(Tt.layout[it[pt]]=t.layout[ot[pt]]-Tt.layout[ot[pt]]-H(Tt,nt[pt]));vt=Tt,Tt=Tt.nextAbsoluteChild,vt.nextAbsoluteChild=null}}function j(t,e,i,n){t.shouldUpdate=!0;var r=t.style.direction||A,o=!t.isDirty&&t.lastLayout&&t.lastLayout.requestedHeight===t.layout.height&&t.lastLayout.requestedWidth===t.layout.width&&t.lastLayout.parentMaxWidth===e&&t.lastLayout.parentMaxHeight===i&&t.lastLayout.direction===r;o?(t.layout.width=t.lastLayout.width,t.layout.height=t.lastLayout.height,t.layout.top=t.lastLayout.top,t.layout.left=t.lastLayout.left):(t.lastLayout||(t.lastLayout={}),t.lastLayout.requestedWidth=t.layout.width,t.lastLayout.requestedHeight=t.layout.height,t.lastLayout.parentMaxWidth=e,t.lastLayout.parentMaxHeight=i,t.lastLayout.direction=r,t.children.forEach(function(t){t.layout.width=void 0,t.layout.height=void 0,t.layout.top=0,t.layout.left=0}),R(t,e,i,n),t.lastLayout.width=t.layout.width,t.lastLayout.height=t.layout.height,t.lastLayout.top=t.layout.top,t.lastLayout.left=t.layout.left)}var F,M="inherit",A="ltr",N="rtl",q="row",G="row-reverse",U="column",Z="column-reverse",O="flex-start",_="center",J="flex-end",K="space-between",P="space-around",Q="flex-start",V="center",X="flex-end",Y="stretch",tt="relative",et="absolute",it={row:"left","row-reverse":"right",column:"top","column-reverse":"bottom"},nt={row:"right","row-reverse":"left",column:"bottom","column-reverse":"top"},rt={row:"left","row-reverse":"right",column:"top","column-reverse":"bottom"},ot={row:"width","row-reverse":"width",column:"height","column-reverse":"height"};return{layoutNodeImpl:R,computeLayout:j,fillNodes:t}}();return"object"==typeof exports&&(module.exports=t),function(e){t.fillNodes(e),t.computeLayout(e)}}),!window.addEventListener&&window.attachEvent&&function(){Window.prototype.addEventListener=HTMLDocument.prototype.addEventListener=Element.prototype.addEventListener=function(t,e){this.attachEvent("on"+t,e)},Window.prototype.removeEventListener=HTMLDocument.prototype.removeEventListener=Element.prototype.removeEventListener=function(t,e){this.detachEvent("on"+t,e)}}(),flexibility.detect=function(){var t=document.createElement("p");try{return t.style.display="flex","flex"===t.style.display}catch(e){return!1}},!flexibility.detect()&&document.attachEvent&&document.documentElement.currentStyle&&document.attachEvent("onreadystatechange",function(){flexibility.onresize({target:document.documentElement})}),flexibility.init=function(t){var e=t.onlayoutcomplete;return e||(e=t.onlayoutcomplete={node:t,style:{},children:[]}),e.style.display=t.currentStyle["-js-display"]||t.currentStyle.display,e};var t,e=1e3,i=15,n=document.documentElement,r=0,o=0;flexibility.onresize=function(l){if(n.clientWidth!==r||n.clientHeight!==o){r=n.clientWidth,o=n.clientHeight,clearTimeout(t),window.removeEventListener("resize",flexibility.onresize);var a=l.target&&1===l.target.nodeType?l.target:document.documentElement;flexibility.walk(a),t=setTimeout(function(){window.addEventListener("resize",flexibility.onresize)},e/i)}};var l={alignContent:{initial:"stretch",valid:/^(flex-start|flex-end|center|space-between|space-around|stretch)/},alignItems:{initial:"stretch",valid:/^(flex-start|flex-end|center|baseline|stretch)$/},boxSizing:{initial:"content-box",valid:/^(border-box|content-box)$/},flexDirection:{initial:"row",valid:/^(row|row-reverse|column|column-reverse)$/},flexWrap:{initial:"nowrap",valid:/^(nowrap|wrap|wrap-reverse)$/},justifyContent:{initial:"flex-start",valid:/^(flex-start|flex-end|center|space-between|space-around)$/}};flexibility.updateFlexContainerCache=function(t){var e=t.style,i=t.node.currentStyle,n=t.node.style,r={};(i["flex-flow"]||n["flex-flow"]||"").replace(/^(row|row-reverse|column|column-reverse)\s+(nowrap|wrap|wrap-reverse)$/i,function(t,e,i){r.flexDirection=e,r.flexWrap=i});for(var o in l){var a=o.replace(/[A-Z]/g,"-$&").toLowerCase(),d=l[o],s=i[a]||n[a];e[o]=d.valid.test(s)?s:r[o]||d.initial}};var a={alignSelf:{initial:"auto",valid:/^(auto|flex-start|flex-end|center|baseline|stretch)$/},boxSizing:{initial:"content-box",valid:/^(border-box|content-box)$/},flexBasis:{initial:"auto",valid:/^((?:[-+]?0|[-+]?[0-9]*\.?[0-9]+(?:%|ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmax|vmin|vw))|auto|fill|max-content|min-content|fit-content|content)$/},flexGrow:{initial:0,valid:/^\+?(0|[1-9][0-9]*)$/},flexShrink:{initial:0,valid:/^\+?(0|[1-9][0-9]*)$/},order:{initial:0,valid:/^([-+]?[0-9]+)$/}};flexibility.updateFlexItemCache=function(t){var e=t.style,i=t.node.currentStyle,n=t.node.style,r={};(i.flex||n.flex||"").replace(/^\+?(0|[1-9][0-9]*)/,function(t){r.flexGrow=t});for(var o in a){var l=o.replace(/[A-Z]/g,"-$&").toLowerCase(),d=a[o],s=i[l]||n[l];e[o]=d.valid.test(s)?s:r[o]||d.initial}};var d="border:0 solid;clip:rect(0 0 0 0);display:inline-block;font:0/0 serif;margin:0;max-height:none;max-width:none;min-height:0;min-width:0;overflow:hidden;padding:0;position:absolute;width:1em;",s={medium:4,none:0,thick:6,thin:2},u={borderBottomWidth:0,borderLeftWidth:0,borderRightWidth:0,borderTopWidth:0,height:0,paddingBottom:0,paddingLeft:0,paddingRight:0,paddingTop:0,marginBottom:0,marginLeft:0,marginRight:0,marginTop:0,maxHeight:0,maxWidth:0,minHeight:0,minWidth:0,width:0},y=/^([-+]?0|[-+]?[0-9]*\.?[0-9]+)/,c=100;flexibility.updateLengthCache=function(t){var e,i,n,r=t.node,o=t.style,l=r.parentNode,a=document.createElement("_"),f=a.runtimeStyle,h=r.currentStyle;f.cssText=d+"font-size:"+h.fontSize,l.insertBefore(a,r.nextSibling),o.fontSize=a.offsetWidth,f.fontSize=o.fontSize+"px";for(var m in u){var v=h[m];y.test(v)||"auto"===v&&!/(width|height)/i.test(m)?/%$/.test(v)?(/^(bottom|height|top)$/.test(m)?(i||(i=l.offsetHeight),n=i):(e||(e=l.offsetWidth),n=e),o[m]=parseFloat(v)*n/c):(f.width=v,o[m]=a.offsetWidth):/^border/.test(m)&&v in s?o[m]=s[v]:delete o[m]}l.removeChild(a),"none"===h.borderTopStyle&&(o.borderTopWidth=0),"none"===h.borderRightStyle&&(o.borderRightWidth=0),"none"===h.borderBottomStyle&&(o.borderBottomWidth=0),"none"===h.borderLeftStyle&&(o.borderLeftWidth=0),o.originalWidth=o.width,o.originalHeight=o.height,o.width||o.minWidth||(/flex/.test(o.display)?o.width=r.offsetWidth:o.minWidth=r.offsetWidth),o.height||o.minHeight||/flex/.test(o.display)||(o.minHeight=r.offsetHeight)},flexibility.walk=function(t){var e=flexibility.init(t),i=e.style,n=i.display;if("none"===n)return{};var r=n.match(/^(inline)?flex$/);if(r&&(flexibility.updateFlexContainerCache(e),t.runtimeStyle.cssText="display:"+(r[1]?"inline-block":"block"),e.children=[]),Array.prototype.forEach.call(t.childNodes,function(t,n){if(1===t.nodeType){var o=flexibility.walk(t),l=o.style;o.index=n,r&&(flexibility.updateFlexItemCache(o),"auto"===l.alignSelf&&(l.alignSelf=i.alignItems),l.flex=l.flexGrow,t.runtimeStyle.cssText="display:inline-block",e.children.push(o))}}),r){e.children.forEach(function(t){flexibility.updateLengthCache(t)}),e.children.sort(function(t,e){return t.style.order-e.style.order||t.index-e.index}),/-reverse$/.test(i.flexDirection)&&(e.children.reverse(),i.flexDirection=i.flexDirection.replace(/-reverse$/,""),"flex-start"===i.justifyContent?i.justifyContent="flex-end":"flex-end"===i.justifyContent&&(i.justifyContent="flex-start")),flexibility.updateLengthCache(e),delete e.lastLayout,delete e.layout;var o=i.borderTopWidth,l=i.borderBottomWidth;i.borderTopWidth=0,i.borderBottomWidth=0,i.borderLeftWidth=0,"column"===i.flexDirection&&(i.width-=i.borderRightWidth),flexibility.computeLayout(e),t.runtimeStyle.cssText="box-sizing:border-box;display:block;position:relative;width:"+(e.layout.width+i.borderRightWidth)+"px;height:"+(e.layout.height+o+l)+"px";var a=[],d=1,s="column"===i.flexDirection?"width":"height";e.children.forEach(function(t){a[t.lineIndex]=Math.max(a[t.lineIndex]||0,t.layout[s]),d=Math.max(d,t.lineIndex+1)}),e.children.forEach(function(t){var e=t.layout;"stretch"===t.style.alignSelf&&(e[s]=a[t.lineIndex]),t.node.runtimeStyle.cssText="box-sizing:border-box;display:block;position:absolute;margin:0;width:"+e.width+"px;height:"+e.height+"px;top:"+e.top+"px;left:"+e.left+"px"})}return e}}();
},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('flexibility');
require('classlist-polyfill');

// create an array to contain all timers
var timers = [];

// get elements
var timersContainer = document.getElementById('js-timers-container');
var newTimerButton = document.getElementById('js-new-timer');

var Clock = function () {
    function Clock(parent, props) {
        _classCallCheck(this, Clock);

        // Props
        this.props = props || {};
        this.isActive = props.isActive || false; // whether or not to start the clock already running
        this.delay = props.delay || 1000; // the amount of time in milliseconds after which to update the clock
        this.isGlobal = props.isGlobal || false;
        this.title = props.title || '';

        // Elements
        this.parent = parent;
        this.wrapper = this.createWrapper();
        this.timer = this.createTimer();
        this.titleInput = this.createTitleInput(this);
        this.startStopButton = this.createStartStopButton('Start', this.stopStart, this);
        this.updateStartStopButton();

        this.offset;
        this.clock;
        this.interval = null;
        this.entries = [];

        var elem = this.createElement();

        // Append elements
        elem.appendChild(this.titleInput);
        elem.appendChild(this.timer);
        elem.appendChild(this.startStopButton);

        this.titleInput.focus();

        this.reset();
    }

    // Create the clock wrapper div


    _createClass(Clock, [{
        key: 'createWrapper',
        value: function createWrapper() {
            var element = document.createElement('div');
            element.className = 'l-flex-item';
            this.parent.appendChild(element);
            return element;
        }

        // Create the clock container element

    }, {
        key: 'createElement',
        value: function createElement() {
            var element = document.createElement('div');
            element.className = 'clock';
            this.wrapper.appendChild(element);
            return element;
        }

        // Create the timer element

    }, {
        key: 'createTimer',
        value: function createTimer() {
            var span = document.createElement('span');
            span.className = 'clock__timer';
            return span;
        }
    }, {
        key: 'createStartStopButton',
        value: function createStartStopButton(action, handler, timer) {
            var button = document.createElement('button');
            button.classList.add('clock__button', 'button');
            button.addEventListener('click', function (event) {
                return handler.call(timer);
            });
            return button;
        }
    }, {
        key: 'updateStartStopButton',
        value: function updateStartStopButton() {
            if (this.isActive === true) {
                this.startStopButton.innerHTML = 'Stop';
                this.startStopButton.classList.toggle('is-active');
            } else {
                this.startStopButton.innerHTML = 'Start';
                this.startStopButton.classList.remove('is-active');
            }
        }
    }, {
        key: 'stopStart',
        value: function stopStart() {
            this.isActive ? this.stop() : this.start();
        }
    }, {
        key: 'createTitleInput',
        value: function createTitleInput(scope) {
            var _this = this;

            var input = document.createElement('input');
            input.className = 'clock__title-input';
            input.placeholder = 'New timer';
            input.type = 'text';
            input.addEventListener('keyup', function (event) {
                return _this.updateTimerTitle.call(scope);
            });
            return input;
        }
    }, {
        key: 'updateTimerTitle',
        value: function updateTimerTitle() {
            this.props.title = this.titleInput.value;
        }
    }, {
        key: 'parseTime',
        value: function parseTime(number) {
            var sec_num = parseInt(number, 10);
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - hours * 3600) / 60);
            var seconds = sec_num - hours * 3600 - minutes * 60;

            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            var time = hours + ':' + minutes + ':' + seconds;
            return time;
        }

        // Reset the clock counter to 0

    }, {
        key: 'reset',
        value: function reset() {
            this.clock = 0;
            this.render();
        }
    }, {
        key: 'delta',
        value: function delta() {
            var now = Date.now();
            var d = now - this.offset;

            this.offset = now;
            return d;
        }
    }, {
        key: 'update',
        value: function update() {
            this.clock += this.delta();
            this.render();
        }
    }, {
        key: 'render',
        value: function render() {
            this.timer.innerHTML = this.parseTime(this.clock / 1000);
        }
    }, {
        key: 'start',
        value: function start() {
            if (!this.interval) {
                this.isActive = true;
                this.stopAllClocks();
                this.offset = Date.now();
                this.interval = setInterval(this.update.bind(this), this.delay);
                this.entries.push({ start: this.offset });
                this.updateStartStopButton();
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this.interval) {
                this.isActive = false;
                clearInterval(this.interval);
                this.interval = null;
                this.entries[this.entries.length - 1].stop = Date.now();
                this.entries[this.entries.length - 1].duration = this.entries[this.entries.length - 1].stop - this.entries[this.entries.length - 1].start;
                this.updateStartStopButton();
            }
        }
    }, {
        key: 'stopAllClocks',
        value: function stopAllClocks() {
            for (var i = 0; i < timers.length; i++) {
                timers[i].stop();
            }
        }
    }]);

    return Clock;
}();

window.addEventListener('load', function load(event) {

    window.removeEventListener("load", load, false); //remove listener, no longer needed

    // TODO: Local storage stuff
    if ('localStorage' in window && window['localStorage'] !== null) {
        timers = JSON.parse(localStorage['timers'] || null);

        if (timers === null) {
            timers = [];
        }
    }

    if (timers.length == 0) {
        timers.push(new Clock(timersContainer, { isGlobal: true }));
    };

    newTimerButton.onclick = function () {
        timers.push(new Clock(timersContainer, { isGlobal: true }));
    };
});

},{"classlist-polyfill":1,"flexibility":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xhc3NsaXN0LXBvbHlmaWxsL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbGV4aWJpbGl0eS9kaXN0L2ZsZXhpYmlsaXR5LmpzIiwic3JjXFxqc1xcbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIGNsYXNzTGlzdC5qczogQ3Jvc3MtYnJvd3NlciBmdWxsIGVsZW1lbnQuY2xhc3NMaXN0IGltcGxlbWVudGF0aW9uLlxuICogMjAxNC0wNy0yM1xuICpcbiAqIEJ5IEVsaSBHcmV5LCBodHRwOi8vZWxpZ3JleS5jb21cbiAqIFB1YmxpYyBEb21haW4uXG4gKiBOTyBXQVJSQU5UWSBFWFBSRVNTRUQgT1IgSU1QTElFRC4gVVNFIEFUIFlPVVIgT1dOIFJJU0suXG4gKi9cblxuLypnbG9iYWwgc2VsZiwgZG9jdW1lbnQsIERPTUV4Y2VwdGlvbiAqL1xuXG4vKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvY2xhc3NMaXN0LmpzL2Jsb2IvbWFzdGVyL2NsYXNzTGlzdC5qcyovXG5cbi8qIENvcGllZCBmcm9tIE1ETjpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L2NsYXNzTGlzdFxuICovXG5cbmlmIChcImRvY3VtZW50XCIgaW4gd2luZG93LnNlbGYpIHtcblxuICAvLyBGdWxsIHBvbHlmaWxsIGZvciBicm93c2VycyB3aXRoIG5vIGNsYXNzTGlzdCBzdXBwb3J0XG4gIGlmICghKFwiY2xhc3NMaXN0XCIgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIl9cIikpKSB7XG5cbiAgKGZ1bmN0aW9uICh2aWV3KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICghKCdFbGVtZW50JyBpbiB2aWV3KSkgcmV0dXJuO1xuXG4gICAgdmFyXG4gICAgICAgIGNsYXNzTGlzdFByb3AgPSBcImNsYXNzTGlzdFwiXG4gICAgICAsIHByb3RvUHJvcCA9IFwicHJvdG90eXBlXCJcbiAgICAgICwgZWxlbUN0clByb3RvID0gdmlldy5FbGVtZW50W3Byb3RvUHJvcF1cbiAgICAgICwgb2JqQ3RyID0gT2JqZWN0XG4gICAgICAsIHN0clRyaW0gPSBTdHJpbmdbcHJvdG9Qcm9wXS50cmltIHx8IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIik7XG4gICAgICB9XG4gICAgICAsIGFyckluZGV4T2YgPSBBcnJheVtwcm90b1Byb3BdLmluZGV4T2YgfHwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyXG4gICAgICAgICAgICBpID0gMFxuICAgICAgICAgICwgbGVuID0gdGhpcy5sZW5ndGhcbiAgICAgICAgO1xuICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgLy8gVmVuZG9yczogcGxlYXNlIGFsbG93IGNvbnRlbnQgY29kZSB0byBpbnN0YW50aWF0ZSBET01FeGNlcHRpb25zXG4gICAgICAsIERPTUV4ID0gZnVuY3Rpb24gKHR5cGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gdHlwZTtcbiAgICAgICAgdGhpcy5jb2RlID0gRE9NRXhjZXB0aW9uW3R5cGVdO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgfVxuICAgICAgLCBjaGVja1Rva2VuQW5kR2V0SW5kZXggPSBmdW5jdGlvbiAoY2xhc3NMaXN0LCB0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4gPT09IFwiXCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRE9NRXgoXG4gICAgICAgICAgICAgIFwiU1lOVEFYX0VSUlwiXG4gICAgICAgICAgICAsIFwiQW4gaW52YWxpZCBvciBpbGxlZ2FsIHN0cmluZyB3YXMgc3BlY2lmaWVkXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvXFxzLy50ZXN0KHRva2VuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBET01FeChcbiAgICAgICAgICAgICAgXCJJTlZBTElEX0NIQVJBQ1RFUl9FUlJcIlxuICAgICAgICAgICAgLCBcIlN0cmluZyBjb250YWlucyBhbiBpbnZhbGlkIGNoYXJhY3RlclwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJySW5kZXhPZi5jYWxsKGNsYXNzTGlzdCwgdG9rZW4pO1xuICAgICAgfVxuICAgICAgLCBDbGFzc0xpc3QgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICB2YXJcbiAgICAgICAgICAgIHRyaW1tZWRDbGFzc2VzID0gc3RyVHJpbS5jYWxsKGVsZW0uZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIilcbiAgICAgICAgICAsIGNsYXNzZXMgPSB0cmltbWVkQ2xhc3NlcyA/IHRyaW1tZWRDbGFzc2VzLnNwbGl0KC9cXHMrLykgOiBbXVxuICAgICAgICAgICwgaSA9IDBcbiAgICAgICAgICAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoXG4gICAgICAgIDtcbiAgICAgICAgZm9yICg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIHRoaXMucHVzaChjbGFzc2VzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVDbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZWxlbS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLnRvU3RyaW5nKCkpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLCBjbGFzc0xpc3RQcm90byA9IENsYXNzTGlzdFtwcm90b1Byb3BdID0gW11cbiAgICAgICwgY2xhc3NMaXN0R2V0dGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IENsYXNzTGlzdCh0aGlzKTtcbiAgICAgIH1cbiAgICA7XG4gICAgLy8gTW9zdCBET01FeGNlcHRpb24gaW1wbGVtZW50YXRpb25zIGRvbid0IGFsbG93IGNhbGxpbmcgRE9NRXhjZXB0aW9uJ3MgdG9TdHJpbmcoKVxuICAgIC8vIG9uIG5vbi1ET01FeGNlcHRpb25zLiBFcnJvcidzIHRvU3RyaW5nKCkgaXMgc3VmZmljaWVudCBoZXJlLlxuICAgIERPTUV4W3Byb3RvUHJvcF0gPSBFcnJvcltwcm90b1Byb3BdO1xuICAgIGNsYXNzTGlzdFByb3RvLml0ZW0gPSBmdW5jdGlvbiAoaSkge1xuICAgICAgcmV0dXJuIHRoaXNbaV0gfHwgbnVsbDtcbiAgICB9O1xuICAgIGNsYXNzTGlzdFByb3RvLmNvbnRhaW5zID0gZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICB0b2tlbiArPSBcIlwiO1xuICAgICAgcmV0dXJuIGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbikgIT09IC0xO1xuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8uYWRkID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyXG4gICAgICAgICAgdG9rZW5zID0gYXJndW1lbnRzXG4gICAgICAgICwgaSA9IDBcbiAgICAgICAgLCBsID0gdG9rZW5zLmxlbmd0aFxuICAgICAgICAsIHRva2VuXG4gICAgICAgICwgdXBkYXRlZCA9IGZhbHNlXG4gICAgICA7XG4gICAgICBkbyB7XG4gICAgICAgIHRva2VuID0gdG9rZW5zW2ldICsgXCJcIjtcbiAgICAgICAgaWYgKGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbikgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5wdXNoKHRva2VuKTtcbiAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKCsraSA8IGwpO1xuXG4gICAgICBpZiAodXBkYXRlZCkge1xuICAgICAgICB0aGlzLl91cGRhdGVDbGFzc05hbWUoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNsYXNzTGlzdFByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhclxuICAgICAgICAgIHRva2VucyA9IGFyZ3VtZW50c1xuICAgICAgICAsIGkgPSAwXG4gICAgICAgICwgbCA9IHRva2Vucy5sZW5ndGhcbiAgICAgICAgLCB0b2tlblxuICAgICAgICAsIHVwZGF0ZWQgPSBmYWxzZVxuICAgICAgICAsIGluZGV4XG4gICAgICA7XG4gICAgICBkbyB7XG4gICAgICAgIHRva2VuID0gdG9rZW5zW2ldICsgXCJcIjtcbiAgICAgICAgaW5kZXggPSBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pO1xuICAgICAgICB3aGlsZSAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgIGluZGV4ID0gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2hpbGUgKCsraSA8IGwpO1xuXG4gICAgICBpZiAodXBkYXRlZCkge1xuICAgICAgICB0aGlzLl91cGRhdGVDbGFzc05hbWUoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNsYXNzTGlzdFByb3RvLnRvZ2dsZSA9IGZ1bmN0aW9uICh0b2tlbiwgZm9yY2UpIHtcbiAgICAgIHRva2VuICs9IFwiXCI7XG5cbiAgICAgIHZhclxuICAgICAgICAgIHJlc3VsdCA9IHRoaXMuY29udGFpbnModG9rZW4pXG4gICAgICAgICwgbWV0aG9kID0gcmVzdWx0ID9cbiAgICAgICAgICBmb3JjZSAhPT0gdHJ1ZSAmJiBcInJlbW92ZVwiXG4gICAgICAgIDpcbiAgICAgICAgICBmb3JjZSAhPT0gZmFsc2UgJiYgXCJhZGRcIlxuICAgICAgO1xuXG4gICAgICBpZiAobWV0aG9kKSB7XG4gICAgICAgIHRoaXNbbWV0aG9kXSh0b2tlbik7XG4gICAgICB9XG5cbiAgICAgIGlmIChmb3JjZSA9PT0gdHJ1ZSB8fCBmb3JjZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZvcmNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICFyZXN1bHQ7XG4gICAgICB9XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmpvaW4oXCIgXCIpO1xuICAgIH07XG5cbiAgICBpZiAob2JqQ3RyLmRlZmluZVByb3BlcnR5KSB7XG4gICAgICB2YXIgY2xhc3NMaXN0UHJvcERlc2MgPSB7XG4gICAgICAgICAgZ2V0OiBjbGFzc0xpc3RHZXR0ZXJcbiAgICAgICAgLCBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgICwgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9O1xuICAgICAgdHJ5IHtcbiAgICAgICAgb2JqQ3RyLmRlZmluZVByb3BlcnR5KGVsZW1DdHJQcm90bywgY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0UHJvcERlc2MpO1xuICAgICAgfSBjYXRjaCAoZXgpIHsgLy8gSUUgOCBkb2Vzbid0IHN1cHBvcnQgZW51bWVyYWJsZTp0cnVlXG4gICAgICAgIGlmIChleC5udW1iZXIgPT09IC0weDdGRjVFQzU0KSB7XG4gICAgICAgICAgY2xhc3NMaXN0UHJvcERlc2MuZW51bWVyYWJsZSA9IGZhbHNlO1xuICAgICAgICAgIG9iakN0ci5kZWZpbmVQcm9wZXJ0eShlbGVtQ3RyUHJvdG8sIGNsYXNzTGlzdFByb3AsIGNsYXNzTGlzdFByb3BEZXNjKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2JqQ3RyW3Byb3RvUHJvcF0uX19kZWZpbmVHZXR0ZXJfXykge1xuICAgICAgZWxlbUN0clByb3RvLl9fZGVmaW5lR2V0dGVyX18oY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0R2V0dGVyKTtcbiAgICB9XG5cbiAgICB9KHdpbmRvdy5zZWxmKSk7XG5cbiAgICB9IGVsc2Uge1xuICAgIC8vIFRoZXJlIGlzIGZ1bGwgb3IgcGFydGlhbCBuYXRpdmUgY2xhc3NMaXN0IHN1cHBvcnQsIHNvIGp1c3QgY2hlY2sgaWYgd2UgbmVlZFxuICAgIC8vIHRvIG5vcm1hbGl6ZSB0aGUgYWRkL3JlbW92ZSBhbmQgdG9nZ2xlIEFQSXMuXG5cbiAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAgIHZhciB0ZXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJfXCIpO1xuXG4gICAgICB0ZXN0RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYzFcIiwgXCJjMlwiKTtcblxuICAgICAgLy8gUG9seWZpbGwgZm9yIElFIDEwLzExIGFuZCBGaXJlZm94IDwyNiwgd2hlcmUgY2xhc3NMaXN0LmFkZCBhbmRcbiAgICAgIC8vIGNsYXNzTGlzdC5yZW1vdmUgZXhpc3QgYnV0IHN1cHBvcnQgb25seSBvbmUgYXJndW1lbnQgYXQgYSB0aW1lLlxuICAgICAgaWYgKCF0ZXN0RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJjMlwiKSkge1xuICAgICAgICB2YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICAgICAgdmFyIG9yaWdpbmFsID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZVttZXRob2RdO1xuXG4gICAgICAgICAgRE9NVG9rZW5MaXN0LnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICAgIHZhciBpLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICAgIG9yaWdpbmFsLmNhbGwodGhpcywgdG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIGNyZWF0ZU1ldGhvZCgnYWRkJyk7XG4gICAgICAgIGNyZWF0ZU1ldGhvZCgncmVtb3ZlJyk7XG4gICAgICB9XG5cbiAgICAgIHRlc3RFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoXCJjM1wiLCBmYWxzZSk7XG5cbiAgICAgIC8vIFBvbHlmaWxsIGZvciBJRSAxMCBhbmQgRmlyZWZveCA8MjQsIHdoZXJlIGNsYXNzTGlzdC50b2dnbGUgZG9lcyBub3RcbiAgICAgIC8vIHN1cHBvcnQgdGhlIHNlY29uZCBhcmd1bWVudC5cbiAgICAgIGlmICh0ZXN0RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJjM1wiKSkge1xuICAgICAgICB2YXIgX3RvZ2dsZSA9IERPTVRva2VuTGlzdC5wcm90b3R5cGUudG9nZ2xlO1xuXG4gICAgICAgIERPTVRva2VuTGlzdC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24odG9rZW4sIGZvcmNlKSB7XG4gICAgICAgICAgaWYgKDEgaW4gYXJndW1lbnRzICYmICF0aGlzLmNvbnRhaW5zKHRva2VuKSA9PT0gIWZvcmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9yY2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdG9nZ2xlLmNhbGwodGhpcywgdG9rZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgfVxuXG4gICAgICB0ZXN0RWxlbWVudCA9IG51bGw7XG4gICAgfSgpKTtcbiAgfVxufVxuIiwiIWZ1bmN0aW9uKCl7d2luZG93LmZsZXhpYmlsaXR5PXt9LEFycmF5LnByb3RvdHlwZS5mb3JFYWNofHwoQXJyYXkucHJvdG90eXBlLmZvckVhY2g9ZnVuY3Rpb24odCl7aWYodm9pZCAwPT09dGhpc3x8bnVsbD09PXRoaXMpdGhyb3cgbmV3IFR5cGVFcnJvcih0aGlzK1wiaXMgbm90IGFuIG9iamVjdFwiKTtpZighKHQgaW5zdGFuY2VvZiBGdW5jdGlvbikpdGhyb3cgbmV3IFR5cGVFcnJvcih0K1wiIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO2Zvcih2YXIgZT1PYmplY3QodGhpcyksaT1hcmd1bWVudHNbMV0sbj1lIGluc3RhbmNlb2YgU3RyaW5nP2Uuc3BsaXQoXCJcIik6ZSxyPU1hdGgubWF4KE1hdGgubWluKG4ubGVuZ3RoLDkwMDcxOTkyNTQ3NDA5OTEpLDApfHwwLG89LTE7KytvPHI7KW8gaW4gbiYmdC5jYWxsKGksbltvXSxvLGUpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LmNvbXB1dGVMYXlvdXQ9ZSgpfShmbGV4aWJpbGl0eSxmdW5jdGlvbigpe3ZhciB0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdChlKXtpZigoIWUubGF5b3V0fHxlLmlzRGlydHkpJiYoZS5sYXlvdXQ9e3dpZHRoOnZvaWQgMCxoZWlnaHQ6dm9pZCAwLHRvcDowLGxlZnQ6MCxyaWdodDowLGJvdHRvbTowfSksZS5zdHlsZXx8KGUuc3R5bGU9e30pLGUuY2hpbGRyZW58fChlLmNoaWxkcmVuPVtdKSxlLnN0eWxlLm1lYXN1cmUmJmUuY2hpbGRyZW4mJmUuY2hpbGRyZW4ubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcIlVzaW5nIGN1c3RvbSBtZWFzdXJlIGZ1bmN0aW9uIGlzIHN1cHBvcnRlZCBvbmx5IGZvciBsZWFmIG5vZGVzLlwiKTtyZXR1cm4gZS5jaGlsZHJlbi5mb3JFYWNoKHQpLGV9ZnVuY3Rpb24gZSh0KXtyZXR1cm4gdm9pZCAwPT09dH1mdW5jdGlvbiBpKHQpe3JldHVybiB0PT09cXx8dD09PUd9ZnVuY3Rpb24gbih0KXtyZXR1cm4gdD09PVV8fHQ9PT1afWZ1bmN0aW9uIHIodCxlKXtpZih2b2lkIDAhPT10LnN0eWxlLm1hcmdpblN0YXJ0JiZpKGUpKXJldHVybiB0LnN0eWxlLm1hcmdpblN0YXJ0O3ZhciBuPW51bGw7c3dpdGNoKGUpe2Nhc2VcInJvd1wiOm49dC5zdHlsZS5tYXJnaW5MZWZ0O2JyZWFrO2Nhc2VcInJvdy1yZXZlcnNlXCI6bj10LnN0eWxlLm1hcmdpblJpZ2h0O2JyZWFrO2Nhc2VcImNvbHVtblwiOm49dC5zdHlsZS5tYXJnaW5Ub3A7YnJlYWs7Y2FzZVwiY29sdW1uLXJldmVyc2VcIjpuPXQuc3R5bGUubWFyZ2luQm90dG9tfXJldHVybiB2b2lkIDAhPT1uP246dm9pZCAwIT09dC5zdHlsZS5tYXJnaW4/dC5zdHlsZS5tYXJnaW46MH1mdW5jdGlvbiBvKHQsZSl7aWYodm9pZCAwIT09dC5zdHlsZS5tYXJnaW5FbmQmJmkoZSkpcmV0dXJuIHQuc3R5bGUubWFyZ2luRW5kO3ZhciBuPW51bGw7c3dpdGNoKGUpe2Nhc2VcInJvd1wiOm49dC5zdHlsZS5tYXJnaW5SaWdodDticmVhaztjYXNlXCJyb3ctcmV2ZXJzZVwiOm49dC5zdHlsZS5tYXJnaW5MZWZ0O2JyZWFrO2Nhc2VcImNvbHVtblwiOm49dC5zdHlsZS5tYXJnaW5Cb3R0b207YnJlYWs7Y2FzZVwiY29sdW1uLXJldmVyc2VcIjpuPXQuc3R5bGUubWFyZ2luVG9wfXJldHVybiBudWxsIT1uP246dm9pZCAwIT09dC5zdHlsZS5tYXJnaW4/dC5zdHlsZS5tYXJnaW46MH1mdW5jdGlvbiBsKHQsZSl7aWYodm9pZCAwIT09dC5zdHlsZS5wYWRkaW5nU3RhcnQmJnQuc3R5bGUucGFkZGluZ1N0YXJ0Pj0wJiZpKGUpKXJldHVybiB0LnN0eWxlLnBhZGRpbmdTdGFydDt2YXIgbj1udWxsO3N3aXRjaChlKXtjYXNlXCJyb3dcIjpuPXQuc3R5bGUucGFkZGluZ0xlZnQ7YnJlYWs7Y2FzZVwicm93LXJldmVyc2VcIjpuPXQuc3R5bGUucGFkZGluZ1JpZ2h0O2JyZWFrO2Nhc2VcImNvbHVtblwiOm49dC5zdHlsZS5wYWRkaW5nVG9wO2JyZWFrO2Nhc2VcImNvbHVtbi1yZXZlcnNlXCI6bj10LnN0eWxlLnBhZGRpbmdCb3R0b219cmV0dXJuIG51bGwhPW4mJm4+PTA/bjp2b2lkIDAhPT10LnN0eWxlLnBhZGRpbmcmJnQuc3R5bGUucGFkZGluZz49MD90LnN0eWxlLnBhZGRpbmc6MH1mdW5jdGlvbiBhKHQsZSl7aWYodm9pZCAwIT09dC5zdHlsZS5wYWRkaW5nRW5kJiZ0LnN0eWxlLnBhZGRpbmdFbmQ+PTAmJmkoZSkpcmV0dXJuIHQuc3R5bGUucGFkZGluZ0VuZDt2YXIgbj1udWxsO3N3aXRjaChlKXtjYXNlXCJyb3dcIjpuPXQuc3R5bGUucGFkZGluZ1JpZ2h0O2JyZWFrO2Nhc2VcInJvdy1yZXZlcnNlXCI6bj10LnN0eWxlLnBhZGRpbmdMZWZ0O2JyZWFrO2Nhc2VcImNvbHVtblwiOm49dC5zdHlsZS5wYWRkaW5nQm90dG9tO2JyZWFrO2Nhc2VcImNvbHVtbi1yZXZlcnNlXCI6bj10LnN0eWxlLnBhZGRpbmdUb3B9cmV0dXJuIG51bGwhPW4mJm4+PTA/bjp2b2lkIDAhPT10LnN0eWxlLnBhZGRpbmcmJnQuc3R5bGUucGFkZGluZz49MD90LnN0eWxlLnBhZGRpbmc6MH1mdW5jdGlvbiBkKHQsZSl7aWYodm9pZCAwIT09dC5zdHlsZS5ib3JkZXJTdGFydFdpZHRoJiZ0LnN0eWxlLmJvcmRlclN0YXJ0V2lkdGg+PTAmJmkoZSkpcmV0dXJuIHQuc3R5bGUuYm9yZGVyU3RhcnRXaWR0aDt2YXIgbj1udWxsO3N3aXRjaChlKXtjYXNlXCJyb3dcIjpuPXQuc3R5bGUuYm9yZGVyTGVmdFdpZHRoO2JyZWFrO2Nhc2VcInJvdy1yZXZlcnNlXCI6bj10LnN0eWxlLmJvcmRlclJpZ2h0V2lkdGg7YnJlYWs7Y2FzZVwiY29sdW1uXCI6bj10LnN0eWxlLmJvcmRlclRvcFdpZHRoO2JyZWFrO2Nhc2VcImNvbHVtbi1yZXZlcnNlXCI6bj10LnN0eWxlLmJvcmRlckJvdHRvbVdpZHRofXJldHVybiBudWxsIT1uJiZuPj0wP246dm9pZCAwIT09dC5zdHlsZS5ib3JkZXJXaWR0aCYmdC5zdHlsZS5ib3JkZXJXaWR0aD49MD90LnN0eWxlLmJvcmRlcldpZHRoOjB9ZnVuY3Rpb24gcyh0LGUpe2lmKHZvaWQgMCE9PXQuc3R5bGUuYm9yZGVyRW5kV2lkdGgmJnQuc3R5bGUuYm9yZGVyRW5kV2lkdGg+PTAmJmkoZSkpcmV0dXJuIHQuc3R5bGUuYm9yZGVyRW5kV2lkdGg7dmFyIG49bnVsbDtzd2l0Y2goZSl7Y2FzZVwicm93XCI6bj10LnN0eWxlLmJvcmRlclJpZ2h0V2lkdGg7YnJlYWs7Y2FzZVwicm93LXJldmVyc2VcIjpuPXQuc3R5bGUuYm9yZGVyTGVmdFdpZHRoO2JyZWFrO2Nhc2VcImNvbHVtblwiOm49dC5zdHlsZS5ib3JkZXJCb3R0b21XaWR0aDticmVhaztjYXNlXCJjb2x1bW4tcmV2ZXJzZVwiOm49dC5zdHlsZS5ib3JkZXJUb3BXaWR0aH1yZXR1cm4gbnVsbCE9biYmbj49MD9uOnZvaWQgMCE9PXQuc3R5bGUuYm9yZGVyV2lkdGgmJnQuc3R5bGUuYm9yZGVyV2lkdGg+PTA/dC5zdHlsZS5ib3JkZXJXaWR0aDowfWZ1bmN0aW9uIHUodCxlKXtyZXR1cm4gbCh0LGUpK2QodCxlKX1mdW5jdGlvbiB5KHQsZSl7cmV0dXJuIGEodCxlKStzKHQsZSl9ZnVuY3Rpb24gYyh0LGUpe3JldHVybiBkKHQsZSkrcyh0LGUpfWZ1bmN0aW9uIGYodCxlKXtyZXR1cm4gcih0LGUpK28odCxlKX1mdW5jdGlvbiBoKHQsZSl7cmV0dXJuIHUodCxlKSt5KHQsZSl9ZnVuY3Rpb24gbSh0KXtyZXR1cm4gdC5zdHlsZS5qdXN0aWZ5Q29udGVudD90LnN0eWxlLmp1c3RpZnlDb250ZW50OlwiZmxleC1zdGFydFwifWZ1bmN0aW9uIHYodCl7cmV0dXJuIHQuc3R5bGUuYWxpZ25Db250ZW50P3Quc3R5bGUuYWxpZ25Db250ZW50OlwiZmxleC1zdGFydFwifWZ1bmN0aW9uIHAodCxlKXtyZXR1cm4gZS5zdHlsZS5hbGlnblNlbGY/ZS5zdHlsZS5hbGlnblNlbGY6dC5zdHlsZS5hbGlnbkl0ZW1zP3Quc3R5bGUuYWxpZ25JdGVtczpcInN0cmV0Y2hcIn1mdW5jdGlvbiB4KHQsZSl7aWYoZT09PU4pe2lmKHQ9PT1xKXJldHVybiBHO2lmKHQ9PT1HKXJldHVybiBxfXJldHVybiB0fWZ1bmN0aW9uIGcodCxlKXt2YXIgaTtyZXR1cm4gaT10LnN0eWxlLmRpcmVjdGlvbj90LnN0eWxlLmRpcmVjdGlvbjpNLGk9PT1NJiYoaT12b2lkIDA9PT1lP0E6ZSksaX1mdW5jdGlvbiBiKHQpe3JldHVybiB0LnN0eWxlLmZsZXhEaXJlY3Rpb24/dC5zdHlsZS5mbGV4RGlyZWN0aW9uOlV9ZnVuY3Rpb24gdyh0LGUpe3JldHVybiBuKHQpP3gocSxlKTpVfWZ1bmN0aW9uIFcodCl7cmV0dXJuIHQuc3R5bGUucG9zaXRpb24/dC5zdHlsZS5wb3NpdGlvbjpcInJlbGF0aXZlXCJ9ZnVuY3Rpb24gTCh0KXtyZXR1cm4gVyh0KT09PXR0JiZ0LnN0eWxlLmZsZXg+MH1mdW5jdGlvbiBFKHQpe3JldHVyblwid3JhcFwiPT09dC5zdHlsZS5mbGV4V3JhcH1mdW5jdGlvbiBTKHQsZSl7cmV0dXJuIHQubGF5b3V0W290W2VdXStmKHQsZSl9ZnVuY3Rpb24gayh0LGUpe3JldHVybiB2b2lkIDAhPT10LnN0eWxlW290W2VdXSYmdC5zdHlsZVtvdFtlXV0+PTB9ZnVuY3Rpb24gQyh0LGUpe3JldHVybiB2b2lkIDAhPT10LnN0eWxlW2VdfWZ1bmN0aW9uIFQodCl7cmV0dXJuIHZvaWQgMCE9PXQuc3R5bGUubWVhc3VyZX1mdW5jdGlvbiBIKHQsZSl7cmV0dXJuIHZvaWQgMCE9PXQuc3R5bGVbZV0/dC5zdHlsZVtlXTowfWZ1bmN0aW9uICQodCxlLGkpe3ZhciBuPXtyb3c6dC5zdHlsZS5taW5XaWR0aCxcInJvdy1yZXZlcnNlXCI6dC5zdHlsZS5taW5XaWR0aCxjb2x1bW46dC5zdHlsZS5taW5IZWlnaHQsXCJjb2x1bW4tcmV2ZXJzZVwiOnQuc3R5bGUubWluSGVpZ2h0fVtlXSxyPXtyb3c6dC5zdHlsZS5tYXhXaWR0aCxcInJvdy1yZXZlcnNlXCI6dC5zdHlsZS5tYXhXaWR0aCxjb2x1bW46dC5zdHlsZS5tYXhIZWlnaHQsXCJjb2x1bW4tcmV2ZXJzZVwiOnQuc3R5bGUubWF4SGVpZ2h0fVtlXSxvPWk7cmV0dXJuIHZvaWQgMCE9PXImJnI+PTAmJm8+ciYmKG89ciksdm9pZCAwIT09biYmbj49MCYmbj5vJiYobz1uKSxvfWZ1bmN0aW9uIHoodCxlKXtyZXR1cm4gdD5lP3Q6ZX1mdW5jdGlvbiBCKHQsZSl7dm9pZCAwPT09dC5sYXlvdXRbb3RbZV1dJiZrKHQsZSkmJih0LmxheW91dFtvdFtlXV09eigkKHQsZSx0LnN0eWxlW290W2VdXSksaCh0LGUpKSl9ZnVuY3Rpb24gRCh0LGUsaSl7ZS5sYXlvdXRbbnRbaV1dPXQubGF5b3V0W290W2ldXS1lLmxheW91dFtvdFtpXV0tZS5sYXlvdXRbcnRbaV1dfWZ1bmN0aW9uIEkodCxlKXtyZXR1cm4gdm9pZCAwIT09dC5zdHlsZVtpdFtlXV0/SCh0LGl0W2VdKTotSCh0LG50W2VdKX1mdW5jdGlvbiBSKHQsbixsLGEpe3ZhciBzPWcodCxhKSxSPXgoYih0KSxzKSxNPXcoUixzKSxBPXgocSxzKTtCKHQsUiksQih0LE0pLHQubGF5b3V0LmRpcmVjdGlvbj1zLHQubGF5b3V0W2l0W1JdXSs9cih0LFIpK0kodCxSKSx0LmxheW91dFtudFtSXV0rPW8odCxSKStJKHQsUiksdC5sYXlvdXRbaXRbTV1dKz1yKHQsTSkrSSh0LE0pLHQubGF5b3V0W250W01dXSs9byh0LE0pK0kodCxNKTt2YXIgTj10LmNoaWxkcmVuLmxlbmd0aCxsdD1oKHQsQSksYXQ9aCh0LFUpO2lmKFQodCkpe3ZhciBkdD0hZSh0LmxheW91dFtvdFtBXV0pLHN0PUY7c3Q9ayh0LEEpP3Quc3R5bGUud2lkdGg6ZHQ/dC5sYXlvdXRbb3RbQV1dOm4tZih0LEEpLHN0LT1sdDt2YXIgdXQ9Rjt1dD1rKHQsVSk/dC5zdHlsZS5oZWlnaHQ6ZSh0LmxheW91dFtvdFtVXV0pP2wtZih0LEEpOnQubGF5b3V0W290W1VdXSx1dC09aCh0LFUpO3ZhciB5dD0hayh0LEEpJiYhZHQsY3Q9IWsodCxVKSYmZSh0LmxheW91dFtvdFtVXV0pO2lmKHl0fHxjdCl7dmFyIGZ0PXQuc3R5bGUubWVhc3VyZShzdCx1dCk7eXQmJih0LmxheW91dC53aWR0aD1mdC53aWR0aCtsdCksY3QmJih0LmxheW91dC5oZWlnaHQ9ZnQuaGVpZ2h0K2F0KX1pZigwPT09TilyZXR1cm59dmFyIGh0LG10LHZ0LHB0LHh0PUUodCksZ3Q9bSh0KSxidD11KHQsUiksd3Q9dSh0LE0pLFd0PWgodCxSKSxMdD1oKHQsTSksRXQ9IWUodC5sYXlvdXRbb3RbUl1dKSxTdD0hZSh0LmxheW91dFtvdFtNXV0pLGt0PWkoUiksQ3Q9bnVsbCxUdD1udWxsLEh0PUY7RXQmJihIdD10LmxheW91dFtvdFtSXV0tV3QpO2Zvcih2YXIgJHQ9MCx6dD0wLEJ0PTAsRHQ9MCxJdD0wLFJ0PTA7Tj56dDspe3ZhciBqdCxGdCxNdD0wLEF0PTAsTnQ9MCxxdD0wLEd0PUV0JiZndD09PU98fCFFdCYmZ3QhPT1fLFV0PUd0P046JHQsWnQ9ITAsT3Q9TixfdD1udWxsLEp0PW51bGwsS3Q9YnQsUHQ9MDtmb3IoaHQ9JHQ7Tj5odDsrK2h0KXt2dD10LmNoaWxkcmVuW2h0XSx2dC5saW5lSW5kZXg9UnQsdnQubmV4dEFic29sdXRlQ2hpbGQ9bnVsbCx2dC5uZXh0RmxleENoaWxkPW51bGw7dmFyIFF0PXAodCx2dCk7aWYoUXQ9PT1ZJiZXKHZ0KT09PXR0JiZTdCYmIWsodnQsTSkpdnQubGF5b3V0W290W01dXT16KCQodnQsTSx0LmxheW91dFtvdFtNXV0tTHQtZih2dCxNKSksaCh2dCxNKSk7ZWxzZSBpZihXKHZ0KT09PWV0KWZvcihudWxsPT09Q3QmJihDdD12dCksbnVsbCE9PVR0JiYoVHQubmV4dEFic29sdXRlQ2hpbGQ9dnQpLFR0PXZ0LG10PTA7Mj5tdDttdCsrKXB0PTAhPT1tdD9xOlUsIWUodC5sYXlvdXRbb3RbcHRdXSkmJiFrKHZ0LHB0KSYmQyh2dCxpdFtwdF0pJiZDKHZ0LG50W3B0XSkmJih2dC5sYXlvdXRbb3RbcHRdXT16KCQodnQscHQsdC5sYXlvdXRbb3RbcHRdXS1oKHQscHQpLWYodnQscHQpLUgodnQsaXRbcHRdKS1IKHZ0LG50W3B0XSkpLGgodnQscHQpKSk7dmFyIFZ0PTA7aWYoRXQmJkwodnQpPyhBdCsrLE50Kz12dC5zdHlsZS5mbGV4LG51bGw9PT1fdCYmKF90PXZ0KSxudWxsIT09SnQmJihKdC5uZXh0RmxleENoaWxkPXZ0KSxKdD12dCxWdD1oKHZ0LFIpK2YodnQsUikpOihqdD1GLEZ0PUYsa3Q/RnQ9ayh0LFUpP3QubGF5b3V0W290W1VdXS1hdDpsLWYodCxVKS1hdDpqdD1rKHQsQSk/dC5sYXlvdXRbb3RbQV1dLWx0Om4tZih0LEEpLWx0LDA9PT1CdCYmaih2dCxqdCxGdCxzKSxXKHZ0KT09PXR0JiYocXQrKyxWdD1TKHZ0LFIpKSkseHQmJkV0JiZNdCtWdD5IdCYmaHQhPT0kdCl7cXQtLSxCdD0xO2JyZWFrfUd0JiYoVyh2dCkhPT10dHx8TCh2dCkpJiYoR3Q9ITEsVXQ9aHQpLFp0JiYoVyh2dCkhPT10dHx8UXQhPT1ZJiZRdCE9PVF8fGUodnQubGF5b3V0W290W01dXSkpJiYoWnQ9ITEsT3Q9aHQpLEd0JiYodnQubGF5b3V0W3J0W1JdXSs9S3QsRXQmJkQodCx2dCxSKSxLdCs9Uyh2dCxSKSxQdD16KFB0LCQodnQsTSxTKHZ0LE0pKSkpLFp0JiYodnQubGF5b3V0W3J0W01dXSs9RHQrd3QsU3QmJkQodCx2dCxNKSksQnQ9MCxNdCs9VnQsenQ9aHQrMX12YXIgWHQ9MCxZdD0wLHRlPTA7aWYodGU9RXQ/SHQtTXQ6eihNdCwwKS1NdCwwIT09QXQpe3ZhciBlZSxpZSxuZT10ZS9OdDtmb3IoSnQ9X3Q7bnVsbCE9PUp0OyllZT1uZSpKdC5zdHlsZS5mbGV4K2goSnQsUiksaWU9JChKdCxSLGVlKSxlZSE9PWllJiYodGUtPWllLE50LT1KdC5zdHlsZS5mbGV4KSxKdD1KdC5uZXh0RmxleENoaWxkO2ZvcihuZT10ZS9OdCwwPm5lJiYobmU9MCksSnQ9X3Q7bnVsbCE9PUp0OylKdC5sYXlvdXRbb3RbUl1dPSQoSnQsUixuZSpKdC5zdHlsZS5mbGV4K2goSnQsUikpLGp0PUYsayh0LEEpP2p0PXQubGF5b3V0W290W0FdXS1sdDprdHx8KGp0PW4tZih0LEEpLWx0KSxGdD1GLGsodCxVKT9GdD10LmxheW91dFtvdFtVXV0tYXQ6a3QmJihGdD1sLWYodCxVKS1hdCksaihKdCxqdCxGdCxzKSx2dD1KdCxKdD1KdC5uZXh0RmxleENoaWxkLHZ0Lm5leHRGbGV4Q2hpbGQ9bnVsbH1lbHNlIGd0IT09TyYmKGd0PT09Xz9YdD10ZS8yOmd0PT09Sj9YdD10ZTpndD09PUs/KHRlPXoodGUsMCksWXQ9QXQrcXQtMSE9PTA/dGUvKEF0K3F0LTEpOjApOmd0PT09UCYmKFl0PXRlLyhBdCtxdCksWHQ9WXQvMikpO2ZvcihLdCs9WHQsaHQ9VXQ7enQ+aHQ7KytodCl2dD10LmNoaWxkcmVuW2h0XSxXKHZ0KT09PWV0JiZDKHZ0LGl0W1JdKT92dC5sYXlvdXRbcnRbUl1dPUgodnQsaXRbUl0pK2QodCxSKStyKHZ0LFIpOih2dC5sYXlvdXRbcnRbUl1dKz1LdCxFdCYmRCh0LHZ0LFIpLFcodnQpPT09dHQmJihLdCs9WXQrUyh2dCxSKSxQdD16KFB0LCQodnQsTSxTKHZ0LE0pKSkpKTt2YXIgcmU9dC5sYXlvdXRbb3RbTV1dO2ZvcihTdHx8KHJlPXooJCh0LE0sUHQrTHQpLEx0KSksaHQ9T3Q7enQ+aHQ7KytodClpZih2dD10LmNoaWxkcmVuW2h0XSxXKHZ0KT09PWV0JiZDKHZ0LGl0W01dKSl2dC5sYXlvdXRbcnRbTV1dPUgodnQsaXRbTV0pK2QodCxNKStyKHZ0LE0pO2Vsc2V7dmFyIG9lPXd0O2lmKFcodnQpPT09dHQpe3ZhciBRdD1wKHQsdnQpO2lmKFF0PT09WSllKHZ0LmxheW91dFtvdFtNXV0pJiYodnQubGF5b3V0W290W01dXT16KCQodnQsTSxyZS1MdC1mKHZ0LE0pKSxoKHZ0LE0pKSk7ZWxzZSBpZihRdCE9PVEpe3ZhciBsZT1yZS1MdC1TKHZ0LE0pO29lKz1RdD09PVY/bGUvMjpsZX19dnQubGF5b3V0W3J0W01dXSs9RHQrb2UsU3QmJkQodCx2dCxNKX1EdCs9UHQsSXQ9eihJdCxLdCksUnQrPTEsJHQ9enR9aWYoUnQ+MSYmU3Qpe3ZhciBhZT10LmxheW91dFtvdFtNXV0tTHQsZGU9YWUtRHQsc2U9MCx1ZT13dCx5ZT12KHQpO3llPT09WD91ZSs9ZGU6eWU9PT1WP3VlKz1kZS8yOnllPT09WSYmYWU+RHQmJihzZT1kZS9SdCk7dmFyIGNlPTA7Zm9yKGh0PTA7UnQ+aHQ7KytodCl7dmFyIGZlPWNlLGhlPTA7Zm9yKG10PWZlO04+bXQ7KyttdClpZih2dD10LmNoaWxkcmVuW210XSxXKHZ0KT09PXR0KXtpZih2dC5saW5lSW5kZXghPT1odClicmVhaztlKHZ0LmxheW91dFtvdFtNXV0pfHwoaGU9eihoZSx2dC5sYXlvdXRbb3RbTV1dK2YodnQsTSkpKX1mb3IoY2U9bXQsaGUrPXNlLG10PWZlO2NlPm10OysrbXQpaWYodnQ9dC5jaGlsZHJlblttdF0sVyh2dCk9PT10dCl7dmFyIG1lPXAodCx2dCk7aWYobWU9PT1RKXZ0LmxheW91dFtydFtNXV09dWUrcih2dCxNKTtlbHNlIGlmKG1lPT09WCl2dC5sYXlvdXRbcnRbTV1dPXVlK2hlLW8odnQsTSktdnQubGF5b3V0W290W01dXTtlbHNlIGlmKG1lPT09Vil7dmFyIHZlPXZ0LmxheW91dFtvdFtNXV07dnQubGF5b3V0W3J0W01dXT11ZSsoaGUtdmUpLzJ9ZWxzZSBtZT09PVkmJih2dC5sYXlvdXRbcnRbTV1dPXVlK3IodnQsTSkpfXVlKz1oZX19dmFyIHBlPSExLHhlPSExO2lmKEV0fHwodC5sYXlvdXRbb3RbUl1dPXooJCh0LFIsSXQreSh0LFIpKSxXdCksKFI9PT1HfHxSPT09WikmJihwZT0hMCkpLFN0fHwodC5sYXlvdXRbb3RbTV1dPXooJCh0LE0sRHQrTHQpLEx0KSwoTT09PUd8fE09PT1aKSYmKHhlPSEwKSkscGV8fHhlKWZvcihodD0wO04+aHQ7KytodCl2dD10LmNoaWxkcmVuW2h0XSxwZSYmRCh0LHZ0LFIpLHhlJiZEKHQsdnQsTSk7Zm9yKFR0PUN0O251bGwhPT1UdDspe2ZvcihtdD0wOzI+bXQ7bXQrKylwdD0wIT09bXQ/cTpVLCFlKHQubGF5b3V0W290W3B0XV0pJiYhayhUdCxwdCkmJkMoVHQsaXRbcHRdKSYmQyhUdCxudFtwdF0pJiYoVHQubGF5b3V0W290W3B0XV09eigkKFR0LHB0LHQubGF5b3V0W290W3B0XV0tYyh0LHB0KS1mKFR0LHB0KS1IKFR0LGl0W3B0XSktSChUdCxudFtwdF0pKSxoKFR0LHB0KSkpLEMoVHQsbnRbcHRdKSYmIUMoVHQsaXRbcHRdKSYmKFR0LmxheW91dFtpdFtwdF1dPXQubGF5b3V0W290W3B0XV0tVHQubGF5b3V0W290W3B0XV0tSChUdCxudFtwdF0pKTt2dD1UdCxUdD1UdC5uZXh0QWJzb2x1dGVDaGlsZCx2dC5uZXh0QWJzb2x1dGVDaGlsZD1udWxsfX1mdW5jdGlvbiBqKHQsZSxpLG4pe3Quc2hvdWxkVXBkYXRlPSEwO3ZhciByPXQuc3R5bGUuZGlyZWN0aW9ufHxBLG89IXQuaXNEaXJ0eSYmdC5sYXN0TGF5b3V0JiZ0Lmxhc3RMYXlvdXQucmVxdWVzdGVkSGVpZ2h0PT09dC5sYXlvdXQuaGVpZ2h0JiZ0Lmxhc3RMYXlvdXQucmVxdWVzdGVkV2lkdGg9PT10LmxheW91dC53aWR0aCYmdC5sYXN0TGF5b3V0LnBhcmVudE1heFdpZHRoPT09ZSYmdC5sYXN0TGF5b3V0LnBhcmVudE1heEhlaWdodD09PWkmJnQubGFzdExheW91dC5kaXJlY3Rpb249PT1yO28/KHQubGF5b3V0LndpZHRoPXQubGFzdExheW91dC53aWR0aCx0LmxheW91dC5oZWlnaHQ9dC5sYXN0TGF5b3V0LmhlaWdodCx0LmxheW91dC50b3A9dC5sYXN0TGF5b3V0LnRvcCx0LmxheW91dC5sZWZ0PXQubGFzdExheW91dC5sZWZ0KToodC5sYXN0TGF5b3V0fHwodC5sYXN0TGF5b3V0PXt9KSx0Lmxhc3RMYXlvdXQucmVxdWVzdGVkV2lkdGg9dC5sYXlvdXQud2lkdGgsdC5sYXN0TGF5b3V0LnJlcXVlc3RlZEhlaWdodD10LmxheW91dC5oZWlnaHQsdC5sYXN0TGF5b3V0LnBhcmVudE1heFdpZHRoPWUsdC5sYXN0TGF5b3V0LnBhcmVudE1heEhlaWdodD1pLHQubGFzdExheW91dC5kaXJlY3Rpb249cix0LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24odCl7dC5sYXlvdXQud2lkdGg9dm9pZCAwLHQubGF5b3V0LmhlaWdodD12b2lkIDAsdC5sYXlvdXQudG9wPTAsdC5sYXlvdXQubGVmdD0wfSksUih0LGUsaSxuKSx0Lmxhc3RMYXlvdXQud2lkdGg9dC5sYXlvdXQud2lkdGgsdC5sYXN0TGF5b3V0LmhlaWdodD10LmxheW91dC5oZWlnaHQsdC5sYXN0TGF5b3V0LnRvcD10LmxheW91dC50b3AsdC5sYXN0TGF5b3V0LmxlZnQ9dC5sYXlvdXQubGVmdCl9dmFyIEYsTT1cImluaGVyaXRcIixBPVwibHRyXCIsTj1cInJ0bFwiLHE9XCJyb3dcIixHPVwicm93LXJldmVyc2VcIixVPVwiY29sdW1uXCIsWj1cImNvbHVtbi1yZXZlcnNlXCIsTz1cImZsZXgtc3RhcnRcIixfPVwiY2VudGVyXCIsSj1cImZsZXgtZW5kXCIsSz1cInNwYWNlLWJldHdlZW5cIixQPVwic3BhY2UtYXJvdW5kXCIsUT1cImZsZXgtc3RhcnRcIixWPVwiY2VudGVyXCIsWD1cImZsZXgtZW5kXCIsWT1cInN0cmV0Y2hcIix0dD1cInJlbGF0aXZlXCIsZXQ9XCJhYnNvbHV0ZVwiLGl0PXtyb3c6XCJsZWZ0XCIsXCJyb3ctcmV2ZXJzZVwiOlwicmlnaHRcIixjb2x1bW46XCJ0b3BcIixcImNvbHVtbi1yZXZlcnNlXCI6XCJib3R0b21cIn0sbnQ9e3JvdzpcInJpZ2h0XCIsXCJyb3ctcmV2ZXJzZVwiOlwibGVmdFwiLGNvbHVtbjpcImJvdHRvbVwiLFwiY29sdW1uLXJldmVyc2VcIjpcInRvcFwifSxydD17cm93OlwibGVmdFwiLFwicm93LXJldmVyc2VcIjpcInJpZ2h0XCIsY29sdW1uOlwidG9wXCIsXCJjb2x1bW4tcmV2ZXJzZVwiOlwiYm90dG9tXCJ9LG90PXtyb3c6XCJ3aWR0aFwiLFwicm93LXJldmVyc2VcIjpcIndpZHRoXCIsY29sdW1uOlwiaGVpZ2h0XCIsXCJjb2x1bW4tcmV2ZXJzZVwiOlwiaGVpZ2h0XCJ9O3JldHVybntsYXlvdXROb2RlSW1wbDpSLGNvbXB1dGVMYXlvdXQ6aixmaWxsTm9kZXM6dH19KCk7cmV0dXJuXCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz10KSxmdW5jdGlvbihlKXt0LmZpbGxOb2RlcyhlKSx0LmNvbXB1dGVMYXlvdXQoZSl9fSksIXdpbmRvdy5hZGRFdmVudExpc3RlbmVyJiZ3aW5kb3cuYXR0YWNoRXZlbnQmJmZ1bmN0aW9uKCl7V2luZG93LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyPUhUTUxEb2N1bWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcj1FbGVtZW50LnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyPWZ1bmN0aW9uKHQsZSl7dGhpcy5hdHRhY2hFdmVudChcIm9uXCIrdCxlKX0sV2luZG93LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyPUhUTUxEb2N1bWVudC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcj1FbGVtZW50LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyPWZ1bmN0aW9uKHQsZSl7dGhpcy5kZXRhY2hFdmVudChcIm9uXCIrdCxlKX19KCksZmxleGliaWxpdHkuZGV0ZWN0PWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7dHJ5e3JldHVybiB0LnN0eWxlLmRpc3BsYXk9XCJmbGV4XCIsXCJmbGV4XCI9PT10LnN0eWxlLmRpc3BsYXl9Y2F0Y2goZSl7cmV0dXJuITF9fSwhZmxleGliaWxpdHkuZGV0ZWN0KCkmJmRvY3VtZW50LmF0dGFjaEV2ZW50JiZkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY3VycmVudFN0eWxlJiZkb2N1bWVudC5hdHRhY2hFdmVudChcIm9ucmVhZHlzdGF0ZWNoYW5nZVwiLGZ1bmN0aW9uKCl7ZmxleGliaWxpdHkub25yZXNpemUoe3RhcmdldDpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnR9KX0pLGZsZXhpYmlsaXR5LmluaXQ9ZnVuY3Rpb24odCl7dmFyIGU9dC5vbmxheW91dGNvbXBsZXRlO3JldHVybiBlfHwoZT10Lm9ubGF5b3V0Y29tcGxldGU9e25vZGU6dCxzdHlsZTp7fSxjaGlsZHJlbjpbXX0pLGUuc3R5bGUuZGlzcGxheT10LmN1cnJlbnRTdHlsZVtcIi1qcy1kaXNwbGF5XCJdfHx0LmN1cnJlbnRTdHlsZS5kaXNwbGF5LGV9O3ZhciB0LGU9MWUzLGk9MTUsbj1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQscj0wLG89MDtmbGV4aWJpbGl0eS5vbnJlc2l6ZT1mdW5jdGlvbihsKXtpZihuLmNsaWVudFdpZHRoIT09cnx8bi5jbGllbnRIZWlnaHQhPT1vKXtyPW4uY2xpZW50V2lkdGgsbz1uLmNsaWVudEhlaWdodCxjbGVhclRpbWVvdXQodCksd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIixmbGV4aWJpbGl0eS5vbnJlc2l6ZSk7dmFyIGE9bC50YXJnZXQmJjE9PT1sLnRhcmdldC5ub2RlVHlwZT9sLnRhcmdldDpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7ZmxleGliaWxpdHkud2FsayhhKSx0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLGZsZXhpYmlsaXR5Lm9ucmVzaXplKX0sZS9pKX19O3ZhciBsPXthbGlnbkNvbnRlbnQ6e2luaXRpYWw6XCJzdHJldGNoXCIsdmFsaWQ6L14oZmxleC1zdGFydHxmbGV4LWVuZHxjZW50ZXJ8c3BhY2UtYmV0d2VlbnxzcGFjZS1hcm91bmR8c3RyZXRjaCkvfSxhbGlnbkl0ZW1zOntpbml0aWFsOlwic3RyZXRjaFwiLHZhbGlkOi9eKGZsZXgtc3RhcnR8ZmxleC1lbmR8Y2VudGVyfGJhc2VsaW5lfHN0cmV0Y2gpJC99LGJveFNpemluZzp7aW5pdGlhbDpcImNvbnRlbnQtYm94XCIsdmFsaWQ6L14oYm9yZGVyLWJveHxjb250ZW50LWJveCkkL30sZmxleERpcmVjdGlvbjp7aW5pdGlhbDpcInJvd1wiLHZhbGlkOi9eKHJvd3xyb3ctcmV2ZXJzZXxjb2x1bW58Y29sdW1uLXJldmVyc2UpJC99LGZsZXhXcmFwOntpbml0aWFsOlwibm93cmFwXCIsdmFsaWQ6L14obm93cmFwfHdyYXB8d3JhcC1yZXZlcnNlKSQvfSxqdXN0aWZ5Q29udGVudDp7aW5pdGlhbDpcImZsZXgtc3RhcnRcIix2YWxpZDovXihmbGV4LXN0YXJ0fGZsZXgtZW5kfGNlbnRlcnxzcGFjZS1iZXR3ZWVufHNwYWNlLWFyb3VuZCkkL319O2ZsZXhpYmlsaXR5LnVwZGF0ZUZsZXhDb250YWluZXJDYWNoZT1mdW5jdGlvbih0KXt2YXIgZT10LnN0eWxlLGk9dC5ub2RlLmN1cnJlbnRTdHlsZSxuPXQubm9kZS5zdHlsZSxyPXt9OyhpW1wiZmxleC1mbG93XCJdfHxuW1wiZmxleC1mbG93XCJdfHxcIlwiKS5yZXBsYWNlKC9eKHJvd3xyb3ctcmV2ZXJzZXxjb2x1bW58Y29sdW1uLXJldmVyc2UpXFxzKyhub3dyYXB8d3JhcHx3cmFwLXJldmVyc2UpJC9pLGZ1bmN0aW9uKHQsZSxpKXtyLmZsZXhEaXJlY3Rpb249ZSxyLmZsZXhXcmFwPWl9KTtmb3IodmFyIG8gaW4gbCl7dmFyIGE9by5yZXBsYWNlKC9bQS1aXS9nLFwiLSQmXCIpLnRvTG93ZXJDYXNlKCksZD1sW29dLHM9aVthXXx8blthXTtlW29dPWQudmFsaWQudGVzdChzKT9zOnJbb118fGQuaW5pdGlhbH19O3ZhciBhPXthbGlnblNlbGY6e2luaXRpYWw6XCJhdXRvXCIsdmFsaWQ6L14oYXV0b3xmbGV4LXN0YXJ0fGZsZXgtZW5kfGNlbnRlcnxiYXNlbGluZXxzdHJldGNoKSQvfSxib3hTaXppbmc6e2luaXRpYWw6XCJjb250ZW50LWJveFwiLHZhbGlkOi9eKGJvcmRlci1ib3h8Y29udGVudC1ib3gpJC99LGZsZXhCYXNpczp7aW5pdGlhbDpcImF1dG9cIix2YWxpZDovXigoPzpbLStdPzB8Wy0rXT9bMC05XSpcXC4/WzAtOV0rKD86JXxjaHxjbXxlbXxleHxpbnxtbXxwY3xwdHxweHxyZW18dmh8dm1heHx2bWlufHZ3KSl8YXV0b3xmaWxsfG1heC1jb250ZW50fG1pbi1jb250ZW50fGZpdC1jb250ZW50fGNvbnRlbnQpJC99LGZsZXhHcm93Ontpbml0aWFsOjAsdmFsaWQ6L15cXCs/KDB8WzEtOV1bMC05XSopJC99LGZsZXhTaHJpbms6e2luaXRpYWw6MCx2YWxpZDovXlxcKz8oMHxbMS05XVswLTldKikkL30sb3JkZXI6e2luaXRpYWw6MCx2YWxpZDovXihbLStdP1swLTldKykkL319O2ZsZXhpYmlsaXR5LnVwZGF0ZUZsZXhJdGVtQ2FjaGU9ZnVuY3Rpb24odCl7dmFyIGU9dC5zdHlsZSxpPXQubm9kZS5jdXJyZW50U3R5bGUsbj10Lm5vZGUuc3R5bGUscj17fTsoaS5mbGV4fHxuLmZsZXh8fFwiXCIpLnJlcGxhY2UoL15cXCs/KDB8WzEtOV1bMC05XSopLyxmdW5jdGlvbih0KXtyLmZsZXhHcm93PXR9KTtmb3IodmFyIG8gaW4gYSl7dmFyIGw9by5yZXBsYWNlKC9bQS1aXS9nLFwiLSQmXCIpLnRvTG93ZXJDYXNlKCksZD1hW29dLHM9aVtsXXx8bltsXTtlW29dPWQudmFsaWQudGVzdChzKT9zOnJbb118fGQuaW5pdGlhbH19O3ZhciBkPVwiYm9yZGVyOjAgc29saWQ7Y2xpcDpyZWN0KDAgMCAwIDApO2Rpc3BsYXk6aW5saW5lLWJsb2NrO2ZvbnQ6MC8wIHNlcmlmO21hcmdpbjowO21heC1oZWlnaHQ6bm9uZTttYXgtd2lkdGg6bm9uZTttaW4taGVpZ2h0OjA7bWluLXdpZHRoOjA7b3ZlcmZsb3c6aGlkZGVuO3BhZGRpbmc6MDtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoxZW07XCIscz17bWVkaXVtOjQsbm9uZTowLHRoaWNrOjYsdGhpbjoyfSx1PXtib3JkZXJCb3R0b21XaWR0aDowLGJvcmRlckxlZnRXaWR0aDowLGJvcmRlclJpZ2h0V2lkdGg6MCxib3JkZXJUb3BXaWR0aDowLGhlaWdodDowLHBhZGRpbmdCb3R0b206MCxwYWRkaW5nTGVmdDowLHBhZGRpbmdSaWdodDowLHBhZGRpbmdUb3A6MCxtYXJnaW5Cb3R0b206MCxtYXJnaW5MZWZ0OjAsbWFyZ2luUmlnaHQ6MCxtYXJnaW5Ub3A6MCxtYXhIZWlnaHQ6MCxtYXhXaWR0aDowLG1pbkhlaWdodDowLG1pbldpZHRoOjAsd2lkdGg6MH0seT0vXihbLStdPzB8Wy0rXT9bMC05XSpcXC4/WzAtOV0rKS8sYz0xMDA7ZmxleGliaWxpdHkudXBkYXRlTGVuZ3RoQ2FjaGU9ZnVuY3Rpb24odCl7dmFyIGUsaSxuLHI9dC5ub2RlLG89dC5zdHlsZSxsPXIucGFyZW50Tm9kZSxhPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJfXCIpLGY9YS5ydW50aW1lU3R5bGUsaD1yLmN1cnJlbnRTdHlsZTtmLmNzc1RleHQ9ZCtcImZvbnQtc2l6ZTpcIitoLmZvbnRTaXplLGwuaW5zZXJ0QmVmb3JlKGEsci5uZXh0U2libGluZyksby5mb250U2l6ZT1hLm9mZnNldFdpZHRoLGYuZm9udFNpemU9by5mb250U2l6ZStcInB4XCI7Zm9yKHZhciBtIGluIHUpe3ZhciB2PWhbbV07eS50ZXN0KHYpfHxcImF1dG9cIj09PXYmJiEvKHdpZHRofGhlaWdodCkvaS50ZXN0KG0pPy8lJC8udGVzdCh2KT8oL14oYm90dG9tfGhlaWdodHx0b3ApJC8udGVzdChtKT8oaXx8KGk9bC5vZmZzZXRIZWlnaHQpLG49aSk6KGV8fChlPWwub2Zmc2V0V2lkdGgpLG49ZSksb1ttXT1wYXJzZUZsb2F0KHYpKm4vYyk6KGYud2lkdGg9dixvW21dPWEub2Zmc2V0V2lkdGgpOi9eYm9yZGVyLy50ZXN0KG0pJiZ2IGluIHM/b1ttXT1zW3ZdOmRlbGV0ZSBvW21dfWwucmVtb3ZlQ2hpbGQoYSksXCJub25lXCI9PT1oLmJvcmRlclRvcFN0eWxlJiYoby5ib3JkZXJUb3BXaWR0aD0wKSxcIm5vbmVcIj09PWguYm9yZGVyUmlnaHRTdHlsZSYmKG8uYm9yZGVyUmlnaHRXaWR0aD0wKSxcIm5vbmVcIj09PWguYm9yZGVyQm90dG9tU3R5bGUmJihvLmJvcmRlckJvdHRvbVdpZHRoPTApLFwibm9uZVwiPT09aC5ib3JkZXJMZWZ0U3R5bGUmJihvLmJvcmRlckxlZnRXaWR0aD0wKSxvLm9yaWdpbmFsV2lkdGg9by53aWR0aCxvLm9yaWdpbmFsSGVpZ2h0PW8uaGVpZ2h0LG8ud2lkdGh8fG8ubWluV2lkdGh8fCgvZmxleC8udGVzdChvLmRpc3BsYXkpP28ud2lkdGg9ci5vZmZzZXRXaWR0aDpvLm1pbldpZHRoPXIub2Zmc2V0V2lkdGgpLG8uaGVpZ2h0fHxvLm1pbkhlaWdodHx8L2ZsZXgvLnRlc3Qoby5kaXNwbGF5KXx8KG8ubWluSGVpZ2h0PXIub2Zmc2V0SGVpZ2h0KX0sZmxleGliaWxpdHkud2Fsaz1mdW5jdGlvbih0KXt2YXIgZT1mbGV4aWJpbGl0eS5pbml0KHQpLGk9ZS5zdHlsZSxuPWkuZGlzcGxheTtpZihcIm5vbmVcIj09PW4pcmV0dXJue307dmFyIHI9bi5tYXRjaCgvXihpbmxpbmUpP2ZsZXgkLyk7aWYociYmKGZsZXhpYmlsaXR5LnVwZGF0ZUZsZXhDb250YWluZXJDYWNoZShlKSx0LnJ1bnRpbWVTdHlsZS5jc3NUZXh0PVwiZGlzcGxheTpcIisoclsxXT9cImlubGluZS1ibG9ja1wiOlwiYmxvY2tcIiksZS5jaGlsZHJlbj1bXSksQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0LmNoaWxkTm9kZXMsZnVuY3Rpb24odCxuKXtpZigxPT09dC5ub2RlVHlwZSl7dmFyIG89ZmxleGliaWxpdHkud2Fsayh0KSxsPW8uc3R5bGU7by5pbmRleD1uLHImJihmbGV4aWJpbGl0eS51cGRhdGVGbGV4SXRlbUNhY2hlKG8pLFwiYXV0b1wiPT09bC5hbGlnblNlbGYmJihsLmFsaWduU2VsZj1pLmFsaWduSXRlbXMpLGwuZmxleD1sLmZsZXhHcm93LHQucnVudGltZVN0eWxlLmNzc1RleHQ9XCJkaXNwbGF5OmlubGluZS1ibG9ja1wiLGUuY2hpbGRyZW4ucHVzaChvKSl9fSkscil7ZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKHQpe2ZsZXhpYmlsaXR5LnVwZGF0ZUxlbmd0aENhY2hlKHQpfSksZS5jaGlsZHJlbi5zb3J0KGZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQuc3R5bGUub3JkZXItZS5zdHlsZS5vcmRlcnx8dC5pbmRleC1lLmluZGV4fSksLy1yZXZlcnNlJC8udGVzdChpLmZsZXhEaXJlY3Rpb24pJiYoZS5jaGlsZHJlbi5yZXZlcnNlKCksaS5mbGV4RGlyZWN0aW9uPWkuZmxleERpcmVjdGlvbi5yZXBsYWNlKC8tcmV2ZXJzZSQvLFwiXCIpLFwiZmxleC1zdGFydFwiPT09aS5qdXN0aWZ5Q29udGVudD9pLmp1c3RpZnlDb250ZW50PVwiZmxleC1lbmRcIjpcImZsZXgtZW5kXCI9PT1pLmp1c3RpZnlDb250ZW50JiYoaS5qdXN0aWZ5Q29udGVudD1cImZsZXgtc3RhcnRcIikpLGZsZXhpYmlsaXR5LnVwZGF0ZUxlbmd0aENhY2hlKGUpLGRlbGV0ZSBlLmxhc3RMYXlvdXQsZGVsZXRlIGUubGF5b3V0O3ZhciBvPWkuYm9yZGVyVG9wV2lkdGgsbD1pLmJvcmRlckJvdHRvbVdpZHRoO2kuYm9yZGVyVG9wV2lkdGg9MCxpLmJvcmRlckJvdHRvbVdpZHRoPTAsaS5ib3JkZXJMZWZ0V2lkdGg9MCxcImNvbHVtblwiPT09aS5mbGV4RGlyZWN0aW9uJiYoaS53aWR0aC09aS5ib3JkZXJSaWdodFdpZHRoKSxmbGV4aWJpbGl0eS5jb21wdXRlTGF5b3V0KGUpLHQucnVudGltZVN0eWxlLmNzc1RleHQ9XCJib3gtc2l6aW5nOmJvcmRlci1ib3g7ZGlzcGxheTpibG9jaztwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDpcIisoZS5sYXlvdXQud2lkdGgraS5ib3JkZXJSaWdodFdpZHRoKStcInB4O2hlaWdodDpcIisoZS5sYXlvdXQuaGVpZ2h0K28rbCkrXCJweFwiO3ZhciBhPVtdLGQ9MSxzPVwiY29sdW1uXCI9PT1pLmZsZXhEaXJlY3Rpb24/XCJ3aWR0aFwiOlwiaGVpZ2h0XCI7ZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKHQpe2FbdC5saW5lSW5kZXhdPU1hdGgubWF4KGFbdC5saW5lSW5kZXhdfHwwLHQubGF5b3V0W3NdKSxkPU1hdGgubWF4KGQsdC5saW5lSW5kZXgrMSl9KSxlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGU9dC5sYXlvdXQ7XCJzdHJldGNoXCI9PT10LnN0eWxlLmFsaWduU2VsZiYmKGVbc109YVt0LmxpbmVJbmRleF0pLHQubm9kZS5ydW50aW1lU3R5bGUuY3NzVGV4dD1cImJveC1zaXppbmc6Ym9yZGVyLWJveDtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO21hcmdpbjowO3dpZHRoOlwiK2Uud2lkdGgrXCJweDtoZWlnaHQ6XCIrZS5oZWlnaHQrXCJweDt0b3A6XCIrZS50b3ArXCJweDtsZWZ0OlwiK2UubGVmdCtcInB4XCJ9KX1yZXR1cm4gZX19KCk7IiwicmVxdWlyZSgnZmxleGliaWxpdHknKTtcbnJlcXVpcmUoJ2NsYXNzbGlzdC1wb2x5ZmlsbCcpO1xuXG4vLyBjcmVhdGUgYW4gYXJyYXkgdG8gY29udGFpbiBhbGwgdGltZXJzXG52YXIgdGltZXJzID0gW107XG5cbi8vIGdldCBlbGVtZW50c1xudmFyIHRpbWVyc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqcy10aW1lcnMtY29udGFpbmVyJyk7XG52YXIgbmV3VGltZXJCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtbmV3LXRpbWVyJyk7XG5cbnZhciBDbG9jayA9IGNsYXNzIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHByb3BzKSB7XG5cbiAgICAgICAgLy8gUHJvcHNcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzIHx8IHt9O1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gcHJvcHMuaXNBY3RpdmUgfHwgZmFsc2U7IC8vIHdoZXRoZXIgb3Igbm90IHRvIHN0YXJ0IHRoZSBjbG9jayBhbHJlYWR5IHJ1bm5pbmdcbiAgICAgICAgdGhpcy5kZWxheSA9IHByb3BzLmRlbGF5IHx8IDEwMDA7IC8vIHRoZSBhbW91bnQgb2YgdGltZSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdG8gdXBkYXRlIHRoZSBjbG9ja1xuICAgICAgICB0aGlzLmlzR2xvYmFsID0gcHJvcHMuaXNHbG9iYWwgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMudGl0bGUgPSBwcm9wcy50aXRsZSB8fCAnJztcblxuICAgICAgICAvLyBFbGVtZW50c1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy53cmFwcGVyID0gdGhpcy5jcmVhdGVXcmFwcGVyKCk7XG4gICAgICAgIHRoaXMudGltZXIgPSB0aGlzLmNyZWF0ZVRpbWVyKCk7XG4gICAgICAgIHRoaXMudGl0bGVJbnB1dCA9IHRoaXMuY3JlYXRlVGl0bGVJbnB1dCh0aGlzKTtcbiAgICAgICAgdGhpcy5zdGFydFN0b3BCdXR0b24gPSB0aGlzLmNyZWF0ZVN0YXJ0U3RvcEJ1dHRvbignU3RhcnQnLCB0aGlzLnN0b3BTdGFydCwgdGhpcyk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhcnRTdG9wQnV0dG9uKCk7XG5cbiAgICAgICAgdGhpcy5vZmZzZXQ7XG4gICAgICAgIHRoaXMuY2xvY2s7XG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB0aGlzLmVudHJpZXMgPSBbXTtcblxuXG4gICAgICAgIHZhciBlbGVtID0gdGhpcy5jcmVhdGVFbGVtZW50KCk7XG5cbiAgICAgICAgLy8gQXBwZW5kIGVsZW1lbnRzXG4gICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQodGhpcy50aXRsZUlucHV0KTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnRpbWVyKTtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZCh0aGlzLnN0YXJ0U3RvcEJ1dHRvbik7XG5cbiAgICAgICAgdGhpcy50aXRsZUlucHV0LmZvY3VzKCk7XG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgY2xvY2sgd3JhcHBlciBkaXZcbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdsLWZsZXgtaXRlbSc7XG4gICAgICAgIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIGNsb2NrIGNvbnRhaW5lciBlbGVtZW50XG4gICAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSAnY2xvY2snO1xuICAgICAgICB0aGlzLndyYXBwZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgdGltZXIgZWxlbWVudFxuICAgIGNyZWF0ZVRpbWVyKCkge1xuICAgICAgICB2YXIgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgc3Bhbi5jbGFzc05hbWUgPSAnY2xvY2tfX3RpbWVyJztcbiAgICAgICAgcmV0dXJuIHNwYW47XG4gICAgfVxuXG4gICAgY3JlYXRlU3RhcnRTdG9wQnV0dG9uKGFjdGlvbiwgaGFuZGxlciwgdGltZXIpIHtcbiAgICAgICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBidXR0b24uY2xhc3NMaXN0LmFkZCgnY2xvY2tfX2J1dHRvbicsICdidXR0b24nKTtcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4gaGFuZGxlci5jYWxsKHRpbWVyKSk7XG4gICAgICAgIHJldHVybiBidXR0b247XG4gICAgfVxuXG4gICAgdXBkYXRlU3RhcnRTdG9wQnV0dG9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc0FjdGl2ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5zdGFydFN0b3BCdXR0b24uaW5uZXJIVE1MID0gJ1N0b3AnO1xuICAgICAgICAgICAgdGhpcy5zdGFydFN0b3BCdXR0b24uY2xhc3NMaXN0LnRvZ2dsZSgnaXMtYWN0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0U3RvcEJ1dHRvbi5pbm5lckhUTUwgPSAnU3RhcnQnO1xuICAgICAgICAgICAgdGhpcy5zdGFydFN0b3BCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wU3RhcnQoKSB7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPyB0aGlzLnN0b3AoKSA6IHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBjcmVhdGVUaXRsZUlucHV0KHNjb3BlKSB7XG4gICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGlucHV0LmNsYXNzTmFtZSA9ICdjbG9ja19fdGl0bGUtaW5wdXQnO1xuICAgICAgICBpbnB1dC5wbGFjZWhvbGRlciA9ICdOZXcgdGltZXInO1xuICAgICAgICBpbnB1dC50eXBlID0gJ3RleHQnO1xuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2ZW50ID0+IHRoaXMudXBkYXRlVGltZXJUaXRsZS5jYWxsKHNjb3BlKSk7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG5cbiAgICB1cGRhdGVUaW1lclRpdGxlKCkge1xuICAgICAgICB0aGlzLnByb3BzLnRpdGxlID0gdGhpcy50aXRsZUlucHV0LnZhbHVlO1xuICAgIH1cblxuICAgIHBhcnNlVGltZShudW1iZXIpIHtcbiAgICAgICAgdmFyIHNlY19udW0gPSBwYXJzZUludChudW1iZXIsIDEwKTtcbiAgICAgICAgdmFyIGhvdXJzICAgPSBNYXRoLmZsb29yKHNlY19udW0gLyAzNjAwKTtcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKChzZWNfbnVtIC0gKGhvdXJzICogMzYwMCkpIC8gNjApO1xuICAgICAgICB2YXIgc2Vjb25kcyA9IHNlY19udW0gLSAoaG91cnMgKiAzNjAwKSAtIChtaW51dGVzICogNjApO1xuXG4gICAgICAgIGlmIChob3VycyA8IDEwKSB7XG4gICAgICAgICAgICBob3VycyAgID0gJzAnICsgaG91cnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1pbnV0ZXMgPCAxMCkge1xuICAgICAgICAgICAgbWludXRlcyA9ICcwJyArIG1pbnV0ZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlY29uZHMgPCAxMCkge1xuICAgICAgICAgICAgc2Vjb25kcyA9ICcwJyArIHNlY29uZHM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRpbWUgPSBob3VycyArICc6JyArIG1pbnV0ZXMgKyAnOicgKyBzZWNvbmRzO1xuICAgICAgICByZXR1cm4gdGltZTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCB0aGUgY2xvY2sgY291bnRlciB0byAwXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuY2xvY2sgPSAwO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIGRlbHRhKCkge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIGQgICA9IG5vdyAtIHRoaXMub2Zmc2V0O1xuXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gbm93O1xuICAgICAgICByZXR1cm4gZDtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuY2xvY2sgKz0gdGhpcy5kZWx0YSgpO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy50aW1lci5pbm5lckhUTUwgPSB0aGlzLnBhcnNlVGltZSh0aGlzLmNsb2NrIC8gMTAwMCk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5pbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0b3BBbGxDbG9ja3MoKTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgICAgIHRoaXMuZW50cmllcy5wdXNoKHsgc3RhcnQ6IHRoaXMub2Zmc2V0IH0pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGFydFN0b3BCdXR0b24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0b3AoKSB7XG4gICAgICAgIGlmICh0aGlzLmludGVydmFsKSB7XG4gICAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmVudHJpZXNbdGhpcy5lbnRyaWVzLmxlbmd0aCAtIDFdLnN0b3AgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgdGhpcy5lbnRyaWVzW3RoaXMuZW50cmllcy5sZW5ndGggLSAxXS5kdXJhdGlvbiA9IHRoaXMuZW50cmllc1t0aGlzLmVudHJpZXMubGVuZ3RoIC0gMV0uc3RvcCAtIHRoaXMuZW50cmllc1t0aGlzLmVudHJpZXMubGVuZ3RoIC0gMV0uc3RhcnQ7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXJ0U3RvcEJ1dHRvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RvcEFsbENsb2NrcygpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRpbWVyc1tpXS5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiBsb2FkKGV2ZW50KSB7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZCwgZmFsc2UpOyAvL3JlbW92ZSBsaXN0ZW5lciwgbm8gbG9uZ2VyIG5lZWRlZFxuXG4gICAgLy8gVE9ETzogTG9jYWwgc3RvcmFnZSBzdHVmZlxuICAgIGlmICgnbG9jYWxTdG9yYWdlJyBpbiB3aW5kb3cgJiYgd2luZG93Wydsb2NhbFN0b3JhZ2UnXSAhPT0gbnVsbCkge1xuICAgICAgICB0aW1lcnMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZVsndGltZXJzJ10gfHwgbnVsbCk7XG5cbiAgICAgICAgaWYgKHRpbWVycyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGltZXJzID0gW107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGltZXJzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKG5ldyBDbG9jayh0aW1lcnNDb250YWluZXIsIHsgaXNHbG9iYWw6IHRydWUgfSkpO1xuICAgIH07XG5cbiAgICBuZXdUaW1lckJ1dHRvbi5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKG5ldyBDbG9jayh0aW1lcnNDb250YWluZXIsIHsgaXNHbG9iYWw6IHRydWUgfSkpO1xuICAgIH07XG59KTtcblxuIl19
