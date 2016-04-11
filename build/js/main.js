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
var masterTimerContainer = document.getElementById('js-master-clock-container');
var newTimerButton = document.getElementById('js-new-timer');

var Clock = function () {
    function Clock(props) {
        _classCallCheck(this, Clock);

        // Props
        this.props = props || {};
        this.parent = props.parent || timersContainer;
        this.isActive = props.isActive || false; // whether or not to start the clock already running
        this.delay = props.delay || 1000; // the amount of time in milliseconds after which to update the clock
        this.isMaster = props.isMaster || false;
        this.title = props.title || '';

        this.offset;
        this.clock;
        this.interval = null;
        this.entries = [];

        // Elements
        this.timer = this.createTimer();

        if (this.isMaster === true) {
            this.parent.appendChild(this.timer);
        } else {
            this.wrapper = this.createWrapper();
            this.titleInput = this.createTitleInput(this);
            this.startStopButton = this.createStartStopButton(this.stopStart, this);
            this.updateStartStopButton();

            // Append elements
            var elem = this.createElement();
            elem.appendChild(this.titleInput);
            elem.appendChild(this.timer);
            elem.appendChild(this.startStopButton);
            this.titleInput.focus();
        }

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
            if (this.isMaster) {
                this.parent.appendChild(element);
            } else {
                this.wrapper.appendChild(element);
            }

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
        value: function createStartStopButton(handler, timer) {
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
                // TODO: Probably don't need this twice
                if (this.isMaster === false) {
                    this.stopAllClocks();
                }

                this.isActive = true;
                this.offset = Date.now();
                this.interval = setInterval(this.update.bind(this), this.delay);
                this.entries.push({ start: this.offset });

                if (this.isMaster === false) {
                    this.updateStartStopButton();
                    timers[0].start();
                }
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
            var i = 0;
            do {
                i++;
                timers[i].stop();
            } while (i < timers.length - 1);
        }
    }]);

    return Clock;
}();

window.addEventListener('load', function load(event) {

    window.removeEventListener('load', load, false); //remove listener, no longer needed

    // TODO: Local storage stuff
    if ('localStorage' in window && window['localStorage'] !== null) {
        timers = JSON.parse(localStorage['timers'] || null);

        if (timers === null) {
            timers = [];
        }
    }

    if (timers.length === 0) {
        timers.push(new Clock({ parent: masterTimerContainer, isMaster: true }));
    };

    newTimerButton.onclick = function () {
        timers.push(new Clock({ parent: timersContainer }));
        console.log(timers);
    };
});

},{"classlist-polyfill":1,"flexibility":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2xhc3NsaXN0LXBvbHlmaWxsL3NyYy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbGV4aWJpbGl0eS9kaXN0L2ZsZXhpYmlsaXR5LmpzIiwic3JjXFxqc1xcbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFTLEVBQVQsQ0FEaUI7U0FBckI7S0FISjs7QUFRQSxRQUFJLE9BQU8sTUFBUCxLQUFrQixDQUFsQixFQUFxQjtBQUNyQixlQUFPLElBQVAsQ0FBWSxJQUFJLEtBQUosQ0FBVSxFQUFFLFFBQVEsb0JBQVIsRUFBOEIsVUFBVSxJQUFWLEVBQTFDLENBQVosRUFEcUI7S0FBekIsQ0FiaUQ7O0FBaUJqRCxtQkFBZSxPQUFmLEdBQXlCLFlBQVc7QUFDaEMsZUFBTyxJQUFQLENBQVksSUFBSSxLQUFKLENBQVUsRUFBRSxRQUFRLGVBQVIsRUFBWixDQUFaLEVBRGdDO0FBRWhDLGdCQUFRLEdBQVIsQ0FBWSxNQUFaLEVBRmdDO0tBQVgsQ0FqQndCO0NBQXJCLENBQWhDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBjbGFzc0xpc3QuanM6IENyb3NzLWJyb3dzZXIgZnVsbCBlbGVtZW50LmNsYXNzTGlzdCBpbXBsZW1lbnRhdGlvbi5cbiAqIDIwMTQtMDctMjNcbiAqXG4gKiBCeSBFbGkgR3JleSwgaHR0cDovL2VsaWdyZXkuY29tXG4gKiBQdWJsaWMgRG9tYWluLlxuICogTk8gV0FSUkFOVFkgRVhQUkVTU0VEIE9SIElNUExJRUQuIFVTRSBBVCBZT1VSIE9XTiBSSVNLLlxuICovXG5cbi8qZ2xvYmFsIHNlbGYsIGRvY3VtZW50LCBET01FeGNlcHRpb24gKi9cblxuLyohIEBzb3VyY2UgaHR0cDovL3B1cmwuZWxpZ3JleS5jb20vZ2l0aHViL2NsYXNzTGlzdC5qcy9ibG9iL21hc3Rlci9jbGFzc0xpc3QuanMqL1xuXG4vKiBDb3BpZWQgZnJvbSBNRE46XG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9jbGFzc0xpc3RcbiAqL1xuXG5pZiAoXCJkb2N1bWVudFwiIGluIHdpbmRvdy5zZWxmKSB7XG5cbiAgLy8gRnVsbCBwb2x5ZmlsbCBmb3IgYnJvd3NlcnMgd2l0aCBubyBjbGFzc0xpc3Qgc3VwcG9ydFxuICBpZiAoIShcImNsYXNzTGlzdFwiIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJfXCIpKSkge1xuXG4gIChmdW5jdGlvbiAodmlldykge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBpZiAoISgnRWxlbWVudCcgaW4gdmlldykpIHJldHVybjtcblxuICAgIHZhclxuICAgICAgICBjbGFzc0xpc3RQcm9wID0gXCJjbGFzc0xpc3RcIlxuICAgICAgLCBwcm90b1Byb3AgPSBcInByb3RvdHlwZVwiXG4gICAgICAsIGVsZW1DdHJQcm90byA9IHZpZXcuRWxlbWVudFtwcm90b1Byb3BdXG4gICAgICAsIG9iakN0ciA9IE9iamVjdFxuICAgICAgLCBzdHJUcmltID0gU3RyaW5nW3Byb3RvUHJvcF0udHJpbSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL15cXHMrfFxccyskL2csIFwiXCIpO1xuICAgICAgfVxuICAgICAgLCBhcnJJbmRleE9mID0gQXJyYXlbcHJvdG9Qcm9wXS5pbmRleE9mIHx8IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAsIGxlbiA9IHRoaXMubGVuZ3RoXG4gICAgICAgIDtcbiAgICAgICAgZm9yICg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIC8vIFZlbmRvcnM6IHBsZWFzZSBhbGxvdyBjb250ZW50IGNvZGUgdG8gaW5zdGFudGlhdGUgRE9NRXhjZXB0aW9uc1xuICAgICAgLCBET01FeCA9IGZ1bmN0aW9uICh0eXBlLCBtZXNzYWdlKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuY29kZSA9IERPTUV4Y2VwdGlvblt0eXBlXTtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgIH1cbiAgICAgICwgY2hlY2tUb2tlbkFuZEdldEluZGV4ID0gZnVuY3Rpb24gKGNsYXNzTGlzdCwgdG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuID09PSBcIlwiKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IERPTUV4KFxuICAgICAgICAgICAgICBcIlNZTlRBWF9FUlJcIlxuICAgICAgICAgICAgLCBcIkFuIGludmFsaWQgb3IgaWxsZWdhbCBzdHJpbmcgd2FzIHNwZWNpZmllZFwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL1xccy8udGVzdCh0b2tlbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRE9NRXgoXG4gICAgICAgICAgICAgIFwiSU5WQUxJRF9DSEFSQUNURVJfRVJSXCJcbiAgICAgICAgICAgICwgXCJTdHJpbmcgY29udGFpbnMgYW4gaW52YWxpZCBjaGFyYWN0ZXJcIlxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFyckluZGV4T2YuY2FsbChjbGFzc0xpc3QsIHRva2VuKTtcbiAgICAgIH1cbiAgICAgICwgQ2xhc3NMaXN0ID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgdmFyXG4gICAgICAgICAgICB0cmltbWVkQ2xhc3NlcyA9IHN0clRyaW0uY2FsbChlbGVtLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpXG4gICAgICAgICAgLCBjbGFzc2VzID0gdHJpbW1lZENsYXNzZXMgPyB0cmltbWVkQ2xhc3Nlcy5zcGxpdCgvXFxzKy8pIDogW11cbiAgICAgICAgICAsIGkgPSAwXG4gICAgICAgICAgLCBsZW4gPSBjbGFzc2VzLmxlbmd0aFxuICAgICAgICA7XG4gICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICB0aGlzLnB1c2goY2xhc3Nlc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXBkYXRlQ2xhc3NOYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGVsZW0uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgdGhpcy50b1N0cmluZygpKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgICwgY2xhc3NMaXN0UHJvdG8gPSBDbGFzc0xpc3RbcHJvdG9Qcm9wXSA9IFtdXG4gICAgICAsIGNsYXNzTGlzdEdldHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDbGFzc0xpc3QodGhpcyk7XG4gICAgICB9XG4gICAgO1xuICAgIC8vIE1vc3QgRE9NRXhjZXB0aW9uIGltcGxlbWVudGF0aW9ucyBkb24ndCBhbGxvdyBjYWxsaW5nIERPTUV4Y2VwdGlvbidzIHRvU3RyaW5nKClcbiAgICAvLyBvbiBub24tRE9NRXhjZXB0aW9ucy4gRXJyb3IncyB0b1N0cmluZygpIGlzIHN1ZmZpY2llbnQgaGVyZS5cbiAgICBET01FeFtwcm90b1Byb3BdID0gRXJyb3JbcHJvdG9Qcm9wXTtcbiAgICBjbGFzc0xpc3RQcm90by5pdGVtID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgIHJldHVybiB0aGlzW2ldIHx8IG51bGw7XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by5jb250YWlucyA9IGZ1bmN0aW9uICh0b2tlbikge1xuICAgICAgdG9rZW4gKz0gXCJcIjtcbiAgICAgIHJldHVybiBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pICE9PSAtMTtcbiAgICB9O1xuICAgIGNsYXNzTGlzdFByb3RvLmFkZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhclxuICAgICAgICAgIHRva2VucyA9IGFyZ3VtZW50c1xuICAgICAgICAsIGkgPSAwXG4gICAgICAgICwgbCA9IHRva2Vucy5sZW5ndGhcbiAgICAgICAgLCB0b2tlblxuICAgICAgICAsIHVwZGF0ZWQgPSBmYWxzZVxuICAgICAgO1xuICAgICAgZG8ge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG4gICAgICAgIGlmIChjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pID09PSAtMSkge1xuICAgICAgICAgIHRoaXMucHVzaCh0b2tlbik7XG4gICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2kgPCBsKTtcblxuICAgICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2xhc3NOYW1lKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXJcbiAgICAgICAgICB0b2tlbnMgPSBhcmd1bWVudHNcbiAgICAgICAgLCBpID0gMFxuICAgICAgICAsIGwgPSB0b2tlbnMubGVuZ3RoXG4gICAgICAgICwgdG9rZW5cbiAgICAgICAgLCB1cGRhdGVkID0gZmFsc2VcbiAgICAgICAgLCBpbmRleFxuICAgICAgO1xuICAgICAgZG8ge1xuICAgICAgICB0b2tlbiA9IHRva2Vuc1tpXSArIFwiXCI7XG4gICAgICAgIGluZGV4ID0gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKTtcbiAgICAgICAgd2hpbGUgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICBpbmRleCA9IGNoZWNrVG9rZW5BbmRHZXRJbmRleCh0aGlzLCB0b2tlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2kgPCBsKTtcblxuICAgICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2xhc3NOYW1lKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjbGFzc0xpc3RQcm90by50b2dnbGUgPSBmdW5jdGlvbiAodG9rZW4sIGZvcmNlKSB7XG4gICAgICB0b2tlbiArPSBcIlwiO1xuXG4gICAgICB2YXJcbiAgICAgICAgICByZXN1bHQgPSB0aGlzLmNvbnRhaW5zKHRva2VuKVxuICAgICAgICAsIG1ldGhvZCA9IHJlc3VsdCA/XG4gICAgICAgICAgZm9yY2UgIT09IHRydWUgJiYgXCJyZW1vdmVcIlxuICAgICAgICA6XG4gICAgICAgICAgZm9yY2UgIT09IGZhbHNlICYmIFwiYWRkXCJcbiAgICAgIDtcblxuICAgICAgaWYgKG1ldGhvZCkge1xuICAgICAgICB0aGlzW21ldGhvZF0odG9rZW4pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm9yY2UgPT09IHRydWUgfHwgZm9yY2UgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmb3JjZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAhcmVzdWx0O1xuICAgICAgfVxuICAgIH07XG4gICAgY2xhc3NMaXN0UHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5qb2luKFwiIFwiKTtcbiAgICB9O1xuXG4gICAgaWYgKG9iakN0ci5kZWZpbmVQcm9wZXJ0eSkge1xuICAgICAgdmFyIGNsYXNzTGlzdFByb3BEZXNjID0ge1xuICAgICAgICAgIGdldDogY2xhc3NMaXN0R2V0dGVyXG4gICAgICAgICwgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICAsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfTtcbiAgICAgIHRyeSB7XG4gICAgICAgIG9iakN0ci5kZWZpbmVQcm9wZXJ0eShlbGVtQ3RyUHJvdG8sIGNsYXNzTGlzdFByb3AsIGNsYXNzTGlzdFByb3BEZXNjKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7IC8vIElFIDggZG9lc24ndCBzdXBwb3J0IGVudW1lcmFibGU6dHJ1ZVxuICAgICAgICBpZiAoZXgubnVtYmVyID09PSAtMHg3RkY1RUM1NCkge1xuICAgICAgICAgIGNsYXNzTGlzdFByb3BEZXNjLmVudW1lcmFibGUgPSBmYWxzZTtcbiAgICAgICAgICBvYmpDdHIuZGVmaW5lUHJvcGVydHkoZWxlbUN0clByb3RvLCBjbGFzc0xpc3RQcm9wLCBjbGFzc0xpc3RQcm9wRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9iakN0cltwcm90b1Byb3BdLl9fZGVmaW5lR2V0dGVyX18pIHtcbiAgICAgIGVsZW1DdHJQcm90by5fX2RlZmluZUdldHRlcl9fKGNsYXNzTGlzdFByb3AsIGNsYXNzTGlzdEdldHRlcik7XG4gICAgfVxuXG4gICAgfSh3aW5kb3cuc2VsZikpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAvLyBUaGVyZSBpcyBmdWxsIG9yIHBhcnRpYWwgbmF0aXZlIGNsYXNzTGlzdCBzdXBwb3J0LCBzbyBqdXN0IGNoZWNrIGlmIHdlIG5lZWRcbiAgICAvLyB0byBub3JtYWxpemUgdGhlIGFkZC9yZW1vdmUgYW5kIHRvZ2dsZSBBUElzLlxuXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgICB2YXIgdGVzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiX1wiKTtcblxuICAgICAgdGVzdEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImMxXCIsIFwiYzJcIik7XG5cbiAgICAgIC8vIFBvbHlmaWxsIGZvciBJRSAxMC8xMSBhbmQgRmlyZWZveCA8MjYsIHdoZXJlIGNsYXNzTGlzdC5hZGQgYW5kXG4gICAgICAvLyBjbGFzc0xpc3QucmVtb3ZlIGV4aXN0IGJ1dCBzdXBwb3J0IG9ubHkgb25lIGFyZ3VtZW50IGF0IGEgdGltZS5cbiAgICAgIGlmICghdGVzdEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYzJcIikpIHtcbiAgICAgICAgdmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgIHZhciBvcmlnaW5hbCA9IERPTVRva2VuTGlzdC5wcm90b3R5cGVbbWV0aG9kXTtcblxuICAgICAgICAgIERPTVRva2VuTGlzdC5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgICB2YXIgaSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgICBvcmlnaW5hbC5jYWxsKHRoaXMsIHRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICBjcmVhdGVNZXRob2QoJ2FkZCcpO1xuICAgICAgICBjcmVhdGVNZXRob2QoJ3JlbW92ZScpO1xuICAgICAgfVxuXG4gICAgICB0ZXN0RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiYzNcIiwgZmFsc2UpO1xuXG4gICAgICAvLyBQb2x5ZmlsbCBmb3IgSUUgMTAgYW5kIEZpcmVmb3ggPDI0LCB3aGVyZSBjbGFzc0xpc3QudG9nZ2xlIGRvZXMgbm90XG4gICAgICAvLyBzdXBwb3J0IHRoZSBzZWNvbmQgYXJndW1lbnQuXG4gICAgICBpZiAodGVzdEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYzNcIikpIHtcbiAgICAgICAgdmFyIF90b2dnbGUgPSBET01Ub2tlbkxpc3QucHJvdG90eXBlLnRvZ2dsZTtcblxuICAgICAgICBET01Ub2tlbkxpc3QucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKHRva2VuLCBmb3JjZSkge1xuICAgICAgICAgIGlmICgxIGluIGFyZ3VtZW50cyAmJiAhdGhpcy5jb250YWlucyh0b2tlbikgPT09ICFmb3JjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZvcmNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3RvZ2dsZS5jYWxsKHRoaXMsIHRva2VuKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgIH1cblxuICAgICAgdGVzdEVsZW1lbnQgPSBudWxsO1xuICAgIH0oKSk7XG4gIH1cbn1cbiIsIiFmdW5jdGlvbigpe3dpbmRvdy5mbGV4aWJpbGl0eT17fSxBcnJheS5wcm90b3R5cGUuZm9yRWFjaHx8KEFycmF5LnByb3RvdHlwZS5mb3JFYWNoPWZ1bmN0aW9uKHQpe2lmKHZvaWQgMD09PXRoaXN8fG51bGw9PT10aGlzKXRocm93IG5ldyBUeXBlRXJyb3IodGhpcytcImlzIG5vdCBhbiBvYmplY3RcIik7aWYoISh0IGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IodCtcIiBpcyBub3QgYSBmdW5jdGlvblwiKTtmb3IodmFyIGU9T2JqZWN0KHRoaXMpLGk9YXJndW1lbnRzWzFdLG49ZSBpbnN0YW5jZW9mIFN0cmluZz9lLnNwbGl0KFwiXCIpOmUscj1NYXRoLm1heChNYXRoLm1pbihuLmxlbmd0aCw5MDA3MTk5MjU0NzQwOTkxKSwwKXx8MCxvPS0xOysrbzxyOylvIGluIG4mJnQuY2FsbChpLG5bb10sbyxlKX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5jb21wdXRlTGF5b3V0PWUoKX0oZmxleGliaWxpdHksZnVuY3Rpb24oKXt2YXIgdD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7aWYoKCFlLmxheW91dHx8ZS5pc0RpcnR5KSYmKGUubGF5b3V0PXt3aWR0aDp2b2lkIDAsaGVpZ2h0OnZvaWQgMCx0b3A6MCxsZWZ0OjAscmlnaHQ6MCxib3R0b206MH0pLGUuc3R5bGV8fChlLnN0eWxlPXt9KSxlLmNoaWxkcmVufHwoZS5jaGlsZHJlbj1bXSksZS5zdHlsZS5tZWFzdXJlJiZlLmNoaWxkcmVuJiZlLmNoaWxkcmVuLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJVc2luZyBjdXN0b20gbWVhc3VyZSBmdW5jdGlvbiBpcyBzdXBwb3J0ZWQgb25seSBmb3IgbGVhZiBub2Rlcy5cIik7cmV0dXJuIGUuY2hpbGRyZW4uZm9yRWFjaCh0KSxlfWZ1bmN0aW9uIGUodCl7cmV0dXJuIHZvaWQgMD09PXR9ZnVuY3Rpb24gaSh0KXtyZXR1cm4gdD09PXF8fHQ9PT1HfWZ1bmN0aW9uIG4odCl7cmV0dXJuIHQ9PT1VfHx0PT09Wn1mdW5jdGlvbiByKHQsZSl7aWYodm9pZCAwIT09dC5zdHlsZS5tYXJnaW5TdGFydCYmaShlKSlyZXR1cm4gdC5zdHlsZS5tYXJnaW5TdGFydDt2YXIgbj1udWxsO3N3aXRjaChlKXtjYXNlXCJyb3dcIjpuPXQuc3R5bGUubWFyZ2luTGVmdDticmVhaztjYXNlXCJyb3ctcmV2ZXJzZVwiOm49dC5zdHlsZS5tYXJnaW5SaWdodDticmVhaztjYXNlXCJjb2x1bW5cIjpuPXQuc3R5bGUubWFyZ2luVG9wO2JyZWFrO2Nhc2VcImNvbHVtbi1yZXZlcnNlXCI6bj10LnN0eWxlLm1hcmdpbkJvdHRvbX1yZXR1cm4gdm9pZCAwIT09bj9uOnZvaWQgMCE9PXQuc3R5bGUubWFyZ2luP3Quc3R5bGUubWFyZ2luOjB9ZnVuY3Rpb24gbyh0LGUpe2lmKHZvaWQgMCE9PXQuc3R5bGUubWFyZ2luRW5kJiZpKGUpKXJldHVybiB0LnN0eWxlLm1hcmdpbkVuZDt2YXIgbj1udWxsO3N3aXRjaChlKXtjYXNlXCJyb3dcIjpuPXQuc3R5bGUubWFyZ2luUmlnaHQ7YnJlYWs7Y2FzZVwicm93LXJldmVyc2VcIjpuPXQuc3R5bGUubWFyZ2luTGVmdDticmVhaztjYXNlXCJjb2x1bW5cIjpuPXQuc3R5bGUubWFyZ2luQm90dG9tO2JyZWFrO2Nhc2VcImNvbHVtbi1yZXZlcnNlXCI6bj10LnN0eWxlLm1hcmdpblRvcH1yZXR1cm4gbnVsbCE9bj9uOnZvaWQgMCE9PXQuc3R5bGUubWFyZ2luP3Quc3R5bGUubWFyZ2luOjB9ZnVuY3Rpb24gbCh0LGUpe2lmKHZvaWQgMCE9PXQuc3R5bGUucGFkZGluZ1N0YXJ0JiZ0LnN0eWxlLnBhZGRpbmdTdGFydD49MCYmaShlKSlyZXR1cm4gdC5zdHlsZS5wYWRkaW5nU3RhcnQ7dmFyIG49bnVsbDtzd2l0Y2goZSl7Y2FzZVwicm93XCI6bj10LnN0eWxlLnBhZGRpbmdMZWZ0O2JyZWFrO2Nhc2VcInJvdy1yZXZlcnNlXCI6bj10LnN0eWxlLnBhZGRpbmdSaWdodDticmVhaztjYXNlXCJjb2x1bW5cIjpuPXQuc3R5bGUucGFkZGluZ1RvcDticmVhaztjYXNlXCJjb2x1bW4tcmV2ZXJzZVwiOm49dC5zdHlsZS5wYWRkaW5nQm90dG9tfXJldHVybiBudWxsIT1uJiZuPj0wP246dm9pZCAwIT09dC5zdHlsZS5wYWRkaW5nJiZ0LnN0eWxlLnBhZGRpbmc+PTA/dC5zdHlsZS5wYWRkaW5nOjB9ZnVuY3Rpb24gYSh0LGUpe2lmKHZvaWQgMCE9PXQuc3R5bGUucGFkZGluZ0VuZCYmdC5zdHlsZS5wYWRkaW5nRW5kPj0wJiZpKGUpKXJldHVybiB0LnN0eWxlLnBhZGRpbmdFbmQ7dmFyIG49bnVsbDtzd2l0Y2goZSl7Y2FzZVwicm93XCI6bj10LnN0eWxlLnBhZGRpbmdSaWdodDticmVhaztjYXNlXCJyb3ctcmV2ZXJzZVwiOm49dC5zdHlsZS5wYWRkaW5nTGVmdDticmVhaztjYXNlXCJjb2x1bW5cIjpuPXQuc3R5bGUucGFkZGluZ0JvdHRvbTticmVhaztjYXNlXCJjb2x1bW4tcmV2ZXJzZVwiOm49dC5zdHlsZS5wYWRkaW5nVG9wfXJldHVybiBudWxsIT1uJiZuPj0wP246dm9pZCAwIT09dC5zdHlsZS5wYWRkaW5nJiZ0LnN0eWxlLnBhZGRpbmc+PTA/dC5zdHlsZS5wYWRkaW5nOjB9ZnVuY3Rpb24gZCh0LGUpe2lmKHZvaWQgMCE9PXQuc3R5bGUuYm9yZGVyU3RhcnRXaWR0aCYmdC5zdHlsZS5ib3JkZXJTdGFydFdpZHRoPj0wJiZpKGUpKXJldHVybiB0LnN0eWxlLmJvcmRlclN0YXJ0V2lkdGg7dmFyIG49bnVsbDtzd2l0Y2goZSl7Y2FzZVwicm93XCI6bj10LnN0eWxlLmJvcmRlckxlZnRXaWR0aDticmVhaztjYXNlXCJyb3ctcmV2ZXJzZVwiOm49dC5zdHlsZS5ib3JkZXJSaWdodFdpZHRoO2JyZWFrO2Nhc2VcImNvbHVtblwiOm49dC5zdHlsZS5ib3JkZXJUb3BXaWR0aDticmVhaztjYXNlXCJjb2x1bW4tcmV2ZXJzZVwiOm49dC5zdHlsZS5ib3JkZXJCb3R0b21XaWR0aH1yZXR1cm4gbnVsbCE9biYmbj49MD9uOnZvaWQgMCE9PXQuc3R5bGUuYm9yZGVyV2lkdGgmJnQuc3R5bGUuYm9yZGVyV2lkdGg+PTA/dC5zdHlsZS5ib3JkZXJXaWR0aDowfWZ1bmN0aW9uIHModCxlKXtpZih2b2lkIDAhPT10LnN0eWxlLmJvcmRlckVuZFdpZHRoJiZ0LnN0eWxlLmJvcmRlckVuZFdpZHRoPj0wJiZpKGUpKXJldHVybiB0LnN0eWxlLmJvcmRlckVuZFdpZHRoO3ZhciBuPW51bGw7c3dpdGNoKGUpe2Nhc2VcInJvd1wiOm49dC5zdHlsZS5ib3JkZXJSaWdodFdpZHRoO2JyZWFrO2Nhc2VcInJvdy1yZXZlcnNlXCI6bj10LnN0eWxlLmJvcmRlckxlZnRXaWR0aDticmVhaztjYXNlXCJjb2x1bW5cIjpuPXQuc3R5bGUuYm9yZGVyQm90dG9tV2lkdGg7YnJlYWs7Y2FzZVwiY29sdW1uLXJldmVyc2VcIjpuPXQuc3R5bGUuYm9yZGVyVG9wV2lkdGh9cmV0dXJuIG51bGwhPW4mJm4+PTA/bjp2b2lkIDAhPT10LnN0eWxlLmJvcmRlcldpZHRoJiZ0LnN0eWxlLmJvcmRlcldpZHRoPj0wP3Quc3R5bGUuYm9yZGVyV2lkdGg6MH1mdW5jdGlvbiB1KHQsZSl7cmV0dXJuIGwodCxlKStkKHQsZSl9ZnVuY3Rpb24geSh0LGUpe3JldHVybiBhKHQsZSkrcyh0LGUpfWZ1bmN0aW9uIGModCxlKXtyZXR1cm4gZCh0LGUpK3ModCxlKX1mdW5jdGlvbiBmKHQsZSl7cmV0dXJuIHIodCxlKStvKHQsZSl9ZnVuY3Rpb24gaCh0LGUpe3JldHVybiB1KHQsZSkreSh0LGUpfWZ1bmN0aW9uIG0odCl7cmV0dXJuIHQuc3R5bGUuanVzdGlmeUNvbnRlbnQ/dC5zdHlsZS5qdXN0aWZ5Q29udGVudDpcImZsZXgtc3RhcnRcIn1mdW5jdGlvbiB2KHQpe3JldHVybiB0LnN0eWxlLmFsaWduQ29udGVudD90LnN0eWxlLmFsaWduQ29udGVudDpcImZsZXgtc3RhcnRcIn1mdW5jdGlvbiBwKHQsZSl7cmV0dXJuIGUuc3R5bGUuYWxpZ25TZWxmP2Uuc3R5bGUuYWxpZ25TZWxmOnQuc3R5bGUuYWxpZ25JdGVtcz90LnN0eWxlLmFsaWduSXRlbXM6XCJzdHJldGNoXCJ9ZnVuY3Rpb24geCh0LGUpe2lmKGU9PT1OKXtpZih0PT09cSlyZXR1cm4gRztpZih0PT09RylyZXR1cm4gcX1yZXR1cm4gdH1mdW5jdGlvbiBnKHQsZSl7dmFyIGk7cmV0dXJuIGk9dC5zdHlsZS5kaXJlY3Rpb24/dC5zdHlsZS5kaXJlY3Rpb246TSxpPT09TSYmKGk9dm9pZCAwPT09ZT9BOmUpLGl9ZnVuY3Rpb24gYih0KXtyZXR1cm4gdC5zdHlsZS5mbGV4RGlyZWN0aW9uP3Quc3R5bGUuZmxleERpcmVjdGlvbjpVfWZ1bmN0aW9uIHcodCxlKXtyZXR1cm4gbih0KT94KHEsZSk6VX1mdW5jdGlvbiBXKHQpe3JldHVybiB0LnN0eWxlLnBvc2l0aW9uP3Quc3R5bGUucG9zaXRpb246XCJyZWxhdGl2ZVwifWZ1bmN0aW9uIEwodCl7cmV0dXJuIFcodCk9PT10dCYmdC5zdHlsZS5mbGV4PjB9ZnVuY3Rpb24gRSh0KXtyZXR1cm5cIndyYXBcIj09PXQuc3R5bGUuZmxleFdyYXB9ZnVuY3Rpb24gUyh0LGUpe3JldHVybiB0LmxheW91dFtvdFtlXV0rZih0LGUpfWZ1bmN0aW9uIGsodCxlKXtyZXR1cm4gdm9pZCAwIT09dC5zdHlsZVtvdFtlXV0mJnQuc3R5bGVbb3RbZV1dPj0wfWZ1bmN0aW9uIEModCxlKXtyZXR1cm4gdm9pZCAwIT09dC5zdHlsZVtlXX1mdW5jdGlvbiBUKHQpe3JldHVybiB2b2lkIDAhPT10LnN0eWxlLm1lYXN1cmV9ZnVuY3Rpb24gSCh0LGUpe3JldHVybiB2b2lkIDAhPT10LnN0eWxlW2VdP3Quc3R5bGVbZV06MH1mdW5jdGlvbiAkKHQsZSxpKXt2YXIgbj17cm93OnQuc3R5bGUubWluV2lkdGgsXCJyb3ctcmV2ZXJzZVwiOnQuc3R5bGUubWluV2lkdGgsY29sdW1uOnQuc3R5bGUubWluSGVpZ2h0LFwiY29sdW1uLXJldmVyc2VcIjp0LnN0eWxlLm1pbkhlaWdodH1bZV0scj17cm93OnQuc3R5bGUubWF4V2lkdGgsXCJyb3ctcmV2ZXJzZVwiOnQuc3R5bGUubWF4V2lkdGgsY29sdW1uOnQuc3R5bGUubWF4SGVpZ2h0LFwiY29sdW1uLXJldmVyc2VcIjp0LnN0eWxlLm1heEhlaWdodH1bZV0sbz1pO3JldHVybiB2b2lkIDAhPT1yJiZyPj0wJiZvPnImJihvPXIpLHZvaWQgMCE9PW4mJm4+PTAmJm4+byYmKG89biksb31mdW5jdGlvbiB6KHQsZSl7cmV0dXJuIHQ+ZT90OmV9ZnVuY3Rpb24gQih0LGUpe3ZvaWQgMD09PXQubGF5b3V0W290W2VdXSYmayh0LGUpJiYodC5sYXlvdXRbb3RbZV1dPXooJCh0LGUsdC5zdHlsZVtvdFtlXV0pLGgodCxlKSkpfWZ1bmN0aW9uIEQodCxlLGkpe2UubGF5b3V0W250W2ldXT10LmxheW91dFtvdFtpXV0tZS5sYXlvdXRbb3RbaV1dLWUubGF5b3V0W3J0W2ldXX1mdW5jdGlvbiBJKHQsZSl7cmV0dXJuIHZvaWQgMCE9PXQuc3R5bGVbaXRbZV1dP0godCxpdFtlXSk6LUgodCxudFtlXSl9ZnVuY3Rpb24gUih0LG4sbCxhKXt2YXIgcz1nKHQsYSksUj14KGIodCkscyksTT13KFIscyksQT14KHEscyk7Qih0LFIpLEIodCxNKSx0LmxheW91dC5kaXJlY3Rpb249cyx0LmxheW91dFtpdFtSXV0rPXIodCxSKStJKHQsUiksdC5sYXlvdXRbbnRbUl1dKz1vKHQsUikrSSh0LFIpLHQubGF5b3V0W2l0W01dXSs9cih0LE0pK0kodCxNKSx0LmxheW91dFtudFtNXV0rPW8odCxNKStJKHQsTSk7dmFyIE49dC5jaGlsZHJlbi5sZW5ndGgsbHQ9aCh0LEEpLGF0PWgodCxVKTtpZihUKHQpKXt2YXIgZHQ9IWUodC5sYXlvdXRbb3RbQV1dKSxzdD1GO3N0PWsodCxBKT90LnN0eWxlLndpZHRoOmR0P3QubGF5b3V0W290W0FdXTpuLWYodCxBKSxzdC09bHQ7dmFyIHV0PUY7dXQ9ayh0LFUpP3Quc3R5bGUuaGVpZ2h0OmUodC5sYXlvdXRbb3RbVV1dKT9sLWYodCxBKTp0LmxheW91dFtvdFtVXV0sdXQtPWgodCxVKTt2YXIgeXQ9IWsodCxBKSYmIWR0LGN0PSFrKHQsVSkmJmUodC5sYXlvdXRbb3RbVV1dKTtpZih5dHx8Y3Qpe3ZhciBmdD10LnN0eWxlLm1lYXN1cmUoc3QsdXQpO3l0JiYodC5sYXlvdXQud2lkdGg9ZnQud2lkdGgrbHQpLGN0JiYodC5sYXlvdXQuaGVpZ2h0PWZ0LmhlaWdodCthdCl9aWYoMD09PU4pcmV0dXJufXZhciBodCxtdCx2dCxwdCx4dD1FKHQpLGd0PW0odCksYnQ9dSh0LFIpLHd0PXUodCxNKSxXdD1oKHQsUiksTHQ9aCh0LE0pLEV0PSFlKHQubGF5b3V0W290W1JdXSksU3Q9IWUodC5sYXlvdXRbb3RbTV1dKSxrdD1pKFIpLEN0PW51bGwsVHQ9bnVsbCxIdD1GO0V0JiYoSHQ9dC5sYXlvdXRbb3RbUl1dLVd0KTtmb3IodmFyICR0PTAsenQ9MCxCdD0wLER0PTAsSXQ9MCxSdD0wO04+enQ7KXt2YXIganQsRnQsTXQ9MCxBdD0wLE50PTAscXQ9MCxHdD1FdCYmZ3Q9PT1PfHwhRXQmJmd0IT09XyxVdD1HdD9OOiR0LFp0PSEwLE90PU4sX3Q9bnVsbCxKdD1udWxsLEt0PWJ0LFB0PTA7Zm9yKGh0PSR0O04+aHQ7KytodCl7dnQ9dC5jaGlsZHJlbltodF0sdnQubGluZUluZGV4PVJ0LHZ0Lm5leHRBYnNvbHV0ZUNoaWxkPW51bGwsdnQubmV4dEZsZXhDaGlsZD1udWxsO3ZhciBRdD1wKHQsdnQpO2lmKFF0PT09WSYmVyh2dCk9PT10dCYmU3QmJiFrKHZ0LE0pKXZ0LmxheW91dFtvdFtNXV09eigkKHZ0LE0sdC5sYXlvdXRbb3RbTV1dLUx0LWYodnQsTSkpLGgodnQsTSkpO2Vsc2UgaWYoVyh2dCk9PT1ldClmb3IobnVsbD09PUN0JiYoQ3Q9dnQpLG51bGwhPT1UdCYmKFR0Lm5leHRBYnNvbHV0ZUNoaWxkPXZ0KSxUdD12dCxtdD0wOzI+bXQ7bXQrKylwdD0wIT09bXQ/cTpVLCFlKHQubGF5b3V0W290W3B0XV0pJiYhayh2dCxwdCkmJkModnQsaXRbcHRdKSYmQyh2dCxudFtwdF0pJiYodnQubGF5b3V0W290W3B0XV09eigkKHZ0LHB0LHQubGF5b3V0W290W3B0XV0taCh0LHB0KS1mKHZ0LHB0KS1IKHZ0LGl0W3B0XSktSCh2dCxudFtwdF0pKSxoKHZ0LHB0KSkpO3ZhciBWdD0wO2lmKEV0JiZMKHZ0KT8oQXQrKyxOdCs9dnQuc3R5bGUuZmxleCxudWxsPT09X3QmJihfdD12dCksbnVsbCE9PUp0JiYoSnQubmV4dEZsZXhDaGlsZD12dCksSnQ9dnQsVnQ9aCh2dCxSKStmKHZ0LFIpKTooanQ9RixGdD1GLGt0P0Z0PWsodCxVKT90LmxheW91dFtvdFtVXV0tYXQ6bC1mKHQsVSktYXQ6anQ9ayh0LEEpP3QubGF5b3V0W290W0FdXS1sdDpuLWYodCxBKS1sdCwwPT09QnQmJmoodnQsanQsRnQscyksVyh2dCk9PT10dCYmKHF0KyssVnQ9Uyh2dCxSKSkpLHh0JiZFdCYmTXQrVnQ+SHQmJmh0IT09JHQpe3F0LS0sQnQ9MTticmVha31HdCYmKFcodnQpIT09dHR8fEwodnQpKSYmKEd0PSExLFV0PWh0KSxadCYmKFcodnQpIT09dHR8fFF0IT09WSYmUXQhPT1RfHxlKHZ0LmxheW91dFtvdFtNXV0pKSYmKFp0PSExLE90PWh0KSxHdCYmKHZ0LmxheW91dFtydFtSXV0rPUt0LEV0JiZEKHQsdnQsUiksS3QrPVModnQsUiksUHQ9eihQdCwkKHZ0LE0sUyh2dCxNKSkpKSxadCYmKHZ0LmxheW91dFtydFtNXV0rPUR0K3d0LFN0JiZEKHQsdnQsTSkpLEJ0PTAsTXQrPVZ0LHp0PWh0KzF9dmFyIFh0PTAsWXQ9MCx0ZT0wO2lmKHRlPUV0P0h0LU10OnooTXQsMCktTXQsMCE9PUF0KXt2YXIgZWUsaWUsbmU9dGUvTnQ7Zm9yKEp0PV90O251bGwhPT1KdDspZWU9bmUqSnQuc3R5bGUuZmxleCtoKEp0LFIpLGllPSQoSnQsUixlZSksZWUhPT1pZSYmKHRlLT1pZSxOdC09SnQuc3R5bGUuZmxleCksSnQ9SnQubmV4dEZsZXhDaGlsZDtmb3IobmU9dGUvTnQsMD5uZSYmKG5lPTApLEp0PV90O251bGwhPT1KdDspSnQubGF5b3V0W290W1JdXT0kKEp0LFIsbmUqSnQuc3R5bGUuZmxleCtoKEp0LFIpKSxqdD1GLGsodCxBKT9qdD10LmxheW91dFtvdFtBXV0tbHQ6a3R8fChqdD1uLWYodCxBKS1sdCksRnQ9RixrKHQsVSk/RnQ9dC5sYXlvdXRbb3RbVV1dLWF0Omt0JiYoRnQ9bC1mKHQsVSktYXQpLGooSnQsanQsRnQscyksdnQ9SnQsSnQ9SnQubmV4dEZsZXhDaGlsZCx2dC5uZXh0RmxleENoaWxkPW51bGx9ZWxzZSBndCE9PU8mJihndD09PV8/WHQ9dGUvMjpndD09PUo/WHQ9dGU6Z3Q9PT1LPyh0ZT16KHRlLDApLFl0PUF0K3F0LTEhPT0wP3RlLyhBdCtxdC0xKTowKTpndD09PVAmJihZdD10ZS8oQXQrcXQpLFh0PVl0LzIpKTtmb3IoS3QrPVh0LGh0PVV0O3p0Pmh0OysraHQpdnQ9dC5jaGlsZHJlbltodF0sVyh2dCk9PT1ldCYmQyh2dCxpdFtSXSk/dnQubGF5b3V0W3J0W1JdXT1IKHZ0LGl0W1JdKStkKHQsUikrcih2dCxSKToodnQubGF5b3V0W3J0W1JdXSs9S3QsRXQmJkQodCx2dCxSKSxXKHZ0KT09PXR0JiYoS3QrPVl0K1ModnQsUiksUHQ9eihQdCwkKHZ0LE0sUyh2dCxNKSkpKSk7dmFyIHJlPXQubGF5b3V0W290W01dXTtmb3IoU3R8fChyZT16KCQodCxNLFB0K0x0KSxMdCkpLGh0PU90O3p0Pmh0OysraHQpaWYodnQ9dC5jaGlsZHJlbltodF0sVyh2dCk9PT1ldCYmQyh2dCxpdFtNXSkpdnQubGF5b3V0W3J0W01dXT1IKHZ0LGl0W01dKStkKHQsTSkrcih2dCxNKTtlbHNle3ZhciBvZT13dDtpZihXKHZ0KT09PXR0KXt2YXIgUXQ9cCh0LHZ0KTtpZihRdD09PVkpZSh2dC5sYXlvdXRbb3RbTV1dKSYmKHZ0LmxheW91dFtvdFtNXV09eigkKHZ0LE0scmUtTHQtZih2dCxNKSksaCh2dCxNKSkpO2Vsc2UgaWYoUXQhPT1RKXt2YXIgbGU9cmUtTHQtUyh2dCxNKTtvZSs9UXQ9PT1WP2xlLzI6bGV9fXZ0LmxheW91dFtydFtNXV0rPUR0K29lLFN0JiZEKHQsdnQsTSl9RHQrPVB0LEl0PXooSXQsS3QpLFJ0Kz0xLCR0PXp0fWlmKFJ0PjEmJlN0KXt2YXIgYWU9dC5sYXlvdXRbb3RbTV1dLUx0LGRlPWFlLUR0LHNlPTAsdWU9d3QseWU9dih0KTt5ZT09PVg/dWUrPWRlOnllPT09Vj91ZSs9ZGUvMjp5ZT09PVkmJmFlPkR0JiYoc2U9ZGUvUnQpO3ZhciBjZT0wO2ZvcihodD0wO1J0Pmh0OysraHQpe3ZhciBmZT1jZSxoZT0wO2ZvcihtdD1mZTtOPm10OysrbXQpaWYodnQ9dC5jaGlsZHJlblttdF0sVyh2dCk9PT10dCl7aWYodnQubGluZUluZGV4IT09aHQpYnJlYWs7ZSh2dC5sYXlvdXRbb3RbTV1dKXx8KGhlPXooaGUsdnQubGF5b3V0W290W01dXStmKHZ0LE0pKSl9Zm9yKGNlPW10LGhlKz1zZSxtdD1mZTtjZT5tdDsrK210KWlmKHZ0PXQuY2hpbGRyZW5bbXRdLFcodnQpPT09dHQpe3ZhciBtZT1wKHQsdnQpO2lmKG1lPT09USl2dC5sYXlvdXRbcnRbTV1dPXVlK3IodnQsTSk7ZWxzZSBpZihtZT09PVgpdnQubGF5b3V0W3J0W01dXT11ZStoZS1vKHZ0LE0pLXZ0LmxheW91dFtvdFtNXV07ZWxzZSBpZihtZT09PVYpe3ZhciB2ZT12dC5sYXlvdXRbb3RbTV1dO3Z0LmxheW91dFtydFtNXV09dWUrKGhlLXZlKS8yfWVsc2UgbWU9PT1ZJiYodnQubGF5b3V0W3J0W01dXT11ZStyKHZ0LE0pKX11ZSs9aGV9fXZhciBwZT0hMSx4ZT0hMTtpZihFdHx8KHQubGF5b3V0W290W1JdXT16KCQodCxSLEl0K3kodCxSKSksV3QpLChSPT09R3x8Uj09PVopJiYocGU9ITApKSxTdHx8KHQubGF5b3V0W290W01dXT16KCQodCxNLER0K0x0KSxMdCksKE09PT1HfHxNPT09WikmJih4ZT0hMCkpLHBlfHx4ZSlmb3IoaHQ9MDtOPmh0OysraHQpdnQ9dC5jaGlsZHJlbltodF0scGUmJkQodCx2dCxSKSx4ZSYmRCh0LHZ0LE0pO2ZvcihUdD1DdDtudWxsIT09VHQ7KXtmb3IobXQ9MDsyPm10O210KyspcHQ9MCE9PW10P3E6VSwhZSh0LmxheW91dFtvdFtwdF1dKSYmIWsoVHQscHQpJiZDKFR0LGl0W3B0XSkmJkMoVHQsbnRbcHRdKSYmKFR0LmxheW91dFtvdFtwdF1dPXooJChUdCxwdCx0LmxheW91dFtvdFtwdF1dLWModCxwdCktZihUdCxwdCktSChUdCxpdFtwdF0pLUgoVHQsbnRbcHRdKSksaChUdCxwdCkpKSxDKFR0LG50W3B0XSkmJiFDKFR0LGl0W3B0XSkmJihUdC5sYXlvdXRbaXRbcHRdXT10LmxheW91dFtvdFtwdF1dLVR0LmxheW91dFtvdFtwdF1dLUgoVHQsbnRbcHRdKSk7dnQ9VHQsVHQ9VHQubmV4dEFic29sdXRlQ2hpbGQsdnQubmV4dEFic29sdXRlQ2hpbGQ9bnVsbH19ZnVuY3Rpb24gaih0LGUsaSxuKXt0LnNob3VsZFVwZGF0ZT0hMDt2YXIgcj10LnN0eWxlLmRpcmVjdGlvbnx8QSxvPSF0LmlzRGlydHkmJnQubGFzdExheW91dCYmdC5sYXN0TGF5b3V0LnJlcXVlc3RlZEhlaWdodD09PXQubGF5b3V0LmhlaWdodCYmdC5sYXN0TGF5b3V0LnJlcXVlc3RlZFdpZHRoPT09dC5sYXlvdXQud2lkdGgmJnQubGFzdExheW91dC5wYXJlbnRNYXhXaWR0aD09PWUmJnQubGFzdExheW91dC5wYXJlbnRNYXhIZWlnaHQ9PT1pJiZ0Lmxhc3RMYXlvdXQuZGlyZWN0aW9uPT09cjtvPyh0LmxheW91dC53aWR0aD10Lmxhc3RMYXlvdXQud2lkdGgsdC5sYXlvdXQuaGVpZ2h0PXQubGFzdExheW91dC5oZWlnaHQsdC5sYXlvdXQudG9wPXQubGFzdExheW91dC50b3AsdC5sYXlvdXQubGVmdD10Lmxhc3RMYXlvdXQubGVmdCk6KHQubGFzdExheW91dHx8KHQubGFzdExheW91dD17fSksdC5sYXN0TGF5b3V0LnJlcXVlc3RlZFdpZHRoPXQubGF5b3V0LndpZHRoLHQubGFzdExheW91dC5yZXF1ZXN0ZWRIZWlnaHQ9dC5sYXlvdXQuaGVpZ2h0LHQubGFzdExheW91dC5wYXJlbnRNYXhXaWR0aD1lLHQubGFzdExheW91dC5wYXJlbnRNYXhIZWlnaHQ9aSx0Lmxhc3RMYXlvdXQuZGlyZWN0aW9uPXIsdC5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QubGF5b3V0LndpZHRoPXZvaWQgMCx0LmxheW91dC5oZWlnaHQ9dm9pZCAwLHQubGF5b3V0LnRvcD0wLHQubGF5b3V0LmxlZnQ9MH0pLFIodCxlLGksbiksdC5sYXN0TGF5b3V0LndpZHRoPXQubGF5b3V0LndpZHRoLHQubGFzdExheW91dC5oZWlnaHQ9dC5sYXlvdXQuaGVpZ2h0LHQubGFzdExheW91dC50b3A9dC5sYXlvdXQudG9wLHQubGFzdExheW91dC5sZWZ0PXQubGF5b3V0LmxlZnQpfXZhciBGLE09XCJpbmhlcml0XCIsQT1cImx0clwiLE49XCJydGxcIixxPVwicm93XCIsRz1cInJvdy1yZXZlcnNlXCIsVT1cImNvbHVtblwiLFo9XCJjb2x1bW4tcmV2ZXJzZVwiLE89XCJmbGV4LXN0YXJ0XCIsXz1cImNlbnRlclwiLEo9XCJmbGV4LWVuZFwiLEs9XCJzcGFjZS1iZXR3ZWVuXCIsUD1cInNwYWNlLWFyb3VuZFwiLFE9XCJmbGV4LXN0YXJ0XCIsVj1cImNlbnRlclwiLFg9XCJmbGV4LWVuZFwiLFk9XCJzdHJldGNoXCIsdHQ9XCJyZWxhdGl2ZVwiLGV0PVwiYWJzb2x1dGVcIixpdD17cm93OlwibGVmdFwiLFwicm93LXJldmVyc2VcIjpcInJpZ2h0XCIsY29sdW1uOlwidG9wXCIsXCJjb2x1bW4tcmV2ZXJzZVwiOlwiYm90dG9tXCJ9LG50PXtyb3c6XCJyaWdodFwiLFwicm93LXJldmVyc2VcIjpcImxlZnRcIixjb2x1bW46XCJib3R0b21cIixcImNvbHVtbi1yZXZlcnNlXCI6XCJ0b3BcIn0scnQ9e3JvdzpcImxlZnRcIixcInJvdy1yZXZlcnNlXCI6XCJyaWdodFwiLGNvbHVtbjpcInRvcFwiLFwiY29sdW1uLXJldmVyc2VcIjpcImJvdHRvbVwifSxvdD17cm93Olwid2lkdGhcIixcInJvdy1yZXZlcnNlXCI6XCJ3aWR0aFwiLGNvbHVtbjpcImhlaWdodFwiLFwiY29sdW1uLXJldmVyc2VcIjpcImhlaWdodFwifTtyZXR1cm57bGF5b3V0Tm9kZUltcGw6Uixjb21wdXRlTGF5b3V0OmosZmlsbE5vZGVzOnR9fSgpO3JldHVyblwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiYobW9kdWxlLmV4cG9ydHM9dCksZnVuY3Rpb24oZSl7dC5maWxsTm9kZXMoZSksdC5jb21wdXRlTGF5b3V0KGUpfX0pLCF3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciYmd2luZG93LmF0dGFjaEV2ZW50JiZmdW5jdGlvbigpe1dpbmRvdy5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcj1IVE1MRG9jdW1lbnQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI9RWxlbWVudC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbih0LGUpe3RoaXMuYXR0YWNoRXZlbnQoXCJvblwiK3QsZSl9LFdpbmRvdy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcj1IVE1MRG9jdW1lbnQucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI9RWxlbWVudC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbih0LGUpe3RoaXMuZGV0YWNoRXZlbnQoXCJvblwiK3QsZSl9fSgpLGZsZXhpYmlsaXR5LmRldGVjdD1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO3RyeXtyZXR1cm4gdC5zdHlsZS5kaXNwbGF5PVwiZmxleFwiLFwiZmxleFwiPT09dC5zdHlsZS5kaXNwbGF5fWNhdGNoKGUpe3JldHVybiExfX0sIWZsZXhpYmlsaXR5LmRldGVjdCgpJiZkb2N1bWVudC5hdHRhY2hFdmVudCYmZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmN1cnJlbnRTdHlsZSYmZG9jdW1lbnQuYXR0YWNoRXZlbnQoXCJvbnJlYWR5c3RhdGVjaGFuZ2VcIixmdW5jdGlvbigpe2ZsZXhpYmlsaXR5Lm9ucmVzaXplKHt0YXJnZXQ6ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50fSl9KSxmbGV4aWJpbGl0eS5pbml0PWZ1bmN0aW9uKHQpe3ZhciBlPXQub25sYXlvdXRjb21wbGV0ZTtyZXR1cm4gZXx8KGU9dC5vbmxheW91dGNvbXBsZXRlPXtub2RlOnQsc3R5bGU6e30sY2hpbGRyZW46W119KSxlLnN0eWxlLmRpc3BsYXk9dC5jdXJyZW50U3R5bGVbXCItanMtZGlzcGxheVwiXXx8dC5jdXJyZW50U3R5bGUuZGlzcGxheSxlfTt2YXIgdCxlPTFlMyxpPTE1LG49ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LHI9MCxvPTA7ZmxleGliaWxpdHkub25yZXNpemU9ZnVuY3Rpb24obCl7aWYobi5jbGllbnRXaWR0aCE9PXJ8fG4uY2xpZW50SGVpZ2h0IT09byl7cj1uLmNsaWVudFdpZHRoLG89bi5jbGllbnRIZWlnaHQsY2xlYXJUaW1lb3V0KHQpLHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsZmxleGliaWxpdHkub25yZXNpemUpO3ZhciBhPWwudGFyZ2V0JiYxPT09bC50YXJnZXQubm9kZVR5cGU/bC50YXJnZXQ6ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O2ZsZXhpYmlsaXR5LndhbGsoYSksdD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIixmbGV4aWJpbGl0eS5vbnJlc2l6ZSl9LGUvaSl9fTt2YXIgbD17YWxpZ25Db250ZW50Ontpbml0aWFsOlwic3RyZXRjaFwiLHZhbGlkOi9eKGZsZXgtc3RhcnR8ZmxleC1lbmR8Y2VudGVyfHNwYWNlLWJldHdlZW58c3BhY2UtYXJvdW5kfHN0cmV0Y2gpL30sYWxpZ25JdGVtczp7aW5pdGlhbDpcInN0cmV0Y2hcIix2YWxpZDovXihmbGV4LXN0YXJ0fGZsZXgtZW5kfGNlbnRlcnxiYXNlbGluZXxzdHJldGNoKSQvfSxib3hTaXppbmc6e2luaXRpYWw6XCJjb250ZW50LWJveFwiLHZhbGlkOi9eKGJvcmRlci1ib3h8Y29udGVudC1ib3gpJC99LGZsZXhEaXJlY3Rpb246e2luaXRpYWw6XCJyb3dcIix2YWxpZDovXihyb3d8cm93LXJldmVyc2V8Y29sdW1ufGNvbHVtbi1yZXZlcnNlKSQvfSxmbGV4V3JhcDp7aW5pdGlhbDpcIm5vd3JhcFwiLHZhbGlkOi9eKG5vd3JhcHx3cmFwfHdyYXAtcmV2ZXJzZSkkL30sanVzdGlmeUNvbnRlbnQ6e2luaXRpYWw6XCJmbGV4LXN0YXJ0XCIsdmFsaWQ6L14oZmxleC1zdGFydHxmbGV4LWVuZHxjZW50ZXJ8c3BhY2UtYmV0d2VlbnxzcGFjZS1hcm91bmQpJC99fTtmbGV4aWJpbGl0eS51cGRhdGVGbGV4Q29udGFpbmVyQ2FjaGU9ZnVuY3Rpb24odCl7dmFyIGU9dC5zdHlsZSxpPXQubm9kZS5jdXJyZW50U3R5bGUsbj10Lm5vZGUuc3R5bGUscj17fTsoaVtcImZsZXgtZmxvd1wiXXx8bltcImZsZXgtZmxvd1wiXXx8XCJcIikucmVwbGFjZSgvXihyb3d8cm93LXJldmVyc2V8Y29sdW1ufGNvbHVtbi1yZXZlcnNlKVxccysobm93cmFwfHdyYXB8d3JhcC1yZXZlcnNlKSQvaSxmdW5jdGlvbih0LGUsaSl7ci5mbGV4RGlyZWN0aW9uPWUsci5mbGV4V3JhcD1pfSk7Zm9yKHZhciBvIGluIGwpe3ZhciBhPW8ucmVwbGFjZSgvW0EtWl0vZyxcIi0kJlwiKS50b0xvd2VyQ2FzZSgpLGQ9bFtvXSxzPWlbYV18fG5bYV07ZVtvXT1kLnZhbGlkLnRlc3Qocyk/czpyW29dfHxkLmluaXRpYWx9fTt2YXIgYT17YWxpZ25TZWxmOntpbml0aWFsOlwiYXV0b1wiLHZhbGlkOi9eKGF1dG98ZmxleC1zdGFydHxmbGV4LWVuZHxjZW50ZXJ8YmFzZWxpbmV8c3RyZXRjaCkkL30sYm94U2l6aW5nOntpbml0aWFsOlwiY29udGVudC1ib3hcIix2YWxpZDovXihib3JkZXItYm94fGNvbnRlbnQtYm94KSQvfSxmbGV4QmFzaXM6e2luaXRpYWw6XCJhdXRvXCIsdmFsaWQ6L14oKD86Wy0rXT8wfFstK10/WzAtOV0qXFwuP1swLTldKyg/OiV8Y2h8Y218ZW18ZXh8aW58bW18cGN8cHR8cHh8cmVtfHZofHZtYXh8dm1pbnx2dykpfGF1dG98ZmlsbHxtYXgtY29udGVudHxtaW4tY29udGVudHxmaXQtY29udGVudHxjb250ZW50KSQvfSxmbGV4R3Jvdzp7aW5pdGlhbDowLHZhbGlkOi9eXFwrPygwfFsxLTldWzAtOV0qKSQvfSxmbGV4U2hyaW5rOntpbml0aWFsOjAsdmFsaWQ6L15cXCs/KDB8WzEtOV1bMC05XSopJC99LG9yZGVyOntpbml0aWFsOjAsdmFsaWQ6L14oWy0rXT9bMC05XSspJC99fTtmbGV4aWJpbGl0eS51cGRhdGVGbGV4SXRlbUNhY2hlPWZ1bmN0aW9uKHQpe3ZhciBlPXQuc3R5bGUsaT10Lm5vZGUuY3VycmVudFN0eWxlLG49dC5ub2RlLnN0eWxlLHI9e307KGkuZmxleHx8bi5mbGV4fHxcIlwiKS5yZXBsYWNlKC9eXFwrPygwfFsxLTldWzAtOV0qKS8sZnVuY3Rpb24odCl7ci5mbGV4R3Jvdz10fSk7Zm9yKHZhciBvIGluIGEpe3ZhciBsPW8ucmVwbGFjZSgvW0EtWl0vZyxcIi0kJlwiKS50b0xvd2VyQ2FzZSgpLGQ9YVtvXSxzPWlbbF18fG5bbF07ZVtvXT1kLnZhbGlkLnRlc3Qocyk/czpyW29dfHxkLmluaXRpYWx9fTt2YXIgZD1cImJvcmRlcjowIHNvbGlkO2NsaXA6cmVjdCgwIDAgMCAwKTtkaXNwbGF5OmlubGluZS1ibG9jaztmb250OjAvMCBzZXJpZjttYXJnaW46MDttYXgtaGVpZ2h0Om5vbmU7bWF4LXdpZHRoOm5vbmU7bWluLWhlaWdodDowO21pbi13aWR0aDowO292ZXJmbG93OmhpZGRlbjtwYWRkaW5nOjA7cG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MWVtO1wiLHM9e21lZGl1bTo0LG5vbmU6MCx0aGljazo2LHRoaW46Mn0sdT17Ym9yZGVyQm90dG9tV2lkdGg6MCxib3JkZXJMZWZ0V2lkdGg6MCxib3JkZXJSaWdodFdpZHRoOjAsYm9yZGVyVG9wV2lkdGg6MCxoZWlnaHQ6MCxwYWRkaW5nQm90dG9tOjAscGFkZGluZ0xlZnQ6MCxwYWRkaW5nUmlnaHQ6MCxwYWRkaW5nVG9wOjAsbWFyZ2luQm90dG9tOjAsbWFyZ2luTGVmdDowLG1hcmdpblJpZ2h0OjAsbWFyZ2luVG9wOjAsbWF4SGVpZ2h0OjAsbWF4V2lkdGg6MCxtaW5IZWlnaHQ6MCxtaW5XaWR0aDowLHdpZHRoOjB9LHk9L14oWy0rXT8wfFstK10/WzAtOV0qXFwuP1swLTldKykvLGM9MTAwO2ZsZXhpYmlsaXR5LnVwZGF0ZUxlbmd0aENhY2hlPWZ1bmN0aW9uKHQpe3ZhciBlLGksbixyPXQubm9kZSxvPXQuc3R5bGUsbD1yLnBhcmVudE5vZGUsYT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiX1wiKSxmPWEucnVudGltZVN0eWxlLGg9ci5jdXJyZW50U3R5bGU7Zi5jc3NUZXh0PWQrXCJmb250LXNpemU6XCIraC5mb250U2l6ZSxsLmluc2VydEJlZm9yZShhLHIubmV4dFNpYmxpbmcpLG8uZm9udFNpemU9YS5vZmZzZXRXaWR0aCxmLmZvbnRTaXplPW8uZm9udFNpemUrXCJweFwiO2Zvcih2YXIgbSBpbiB1KXt2YXIgdj1oW21dO3kudGVzdCh2KXx8XCJhdXRvXCI9PT12JiYhLyh3aWR0aHxoZWlnaHQpL2kudGVzdChtKT8vJSQvLnRlc3Qodik/KC9eKGJvdHRvbXxoZWlnaHR8dG9wKSQvLnRlc3QobSk/KGl8fChpPWwub2Zmc2V0SGVpZ2h0KSxuPWkpOihlfHwoZT1sLm9mZnNldFdpZHRoKSxuPWUpLG9bbV09cGFyc2VGbG9hdCh2KSpuL2MpOihmLndpZHRoPXYsb1ttXT1hLm9mZnNldFdpZHRoKTovXmJvcmRlci8udGVzdChtKSYmdiBpbiBzP29bbV09c1t2XTpkZWxldGUgb1ttXX1sLnJlbW92ZUNoaWxkKGEpLFwibm9uZVwiPT09aC5ib3JkZXJUb3BTdHlsZSYmKG8uYm9yZGVyVG9wV2lkdGg9MCksXCJub25lXCI9PT1oLmJvcmRlclJpZ2h0U3R5bGUmJihvLmJvcmRlclJpZ2h0V2lkdGg9MCksXCJub25lXCI9PT1oLmJvcmRlckJvdHRvbVN0eWxlJiYoby5ib3JkZXJCb3R0b21XaWR0aD0wKSxcIm5vbmVcIj09PWguYm9yZGVyTGVmdFN0eWxlJiYoby5ib3JkZXJMZWZ0V2lkdGg9MCksby5vcmlnaW5hbFdpZHRoPW8ud2lkdGgsby5vcmlnaW5hbEhlaWdodD1vLmhlaWdodCxvLndpZHRofHxvLm1pbldpZHRofHwoL2ZsZXgvLnRlc3Qoby5kaXNwbGF5KT9vLndpZHRoPXIub2Zmc2V0V2lkdGg6by5taW5XaWR0aD1yLm9mZnNldFdpZHRoKSxvLmhlaWdodHx8by5taW5IZWlnaHR8fC9mbGV4Ly50ZXN0KG8uZGlzcGxheSl8fChvLm1pbkhlaWdodD1yLm9mZnNldEhlaWdodCl9LGZsZXhpYmlsaXR5LndhbGs9ZnVuY3Rpb24odCl7dmFyIGU9ZmxleGliaWxpdHkuaW5pdCh0KSxpPWUuc3R5bGUsbj1pLmRpc3BsYXk7aWYoXCJub25lXCI9PT1uKXJldHVybnt9O3ZhciByPW4ubWF0Y2goL14oaW5saW5lKT9mbGV4JC8pO2lmKHImJihmbGV4aWJpbGl0eS51cGRhdGVGbGV4Q29udGFpbmVyQ2FjaGUoZSksdC5ydW50aW1lU3R5bGUuY3NzVGV4dD1cImRpc3BsYXk6XCIrKHJbMV0/XCJpbmxpbmUtYmxvY2tcIjpcImJsb2NrXCIpLGUuY2hpbGRyZW49W10pLEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodC5jaGlsZE5vZGVzLGZ1bmN0aW9uKHQsbil7aWYoMT09PXQubm9kZVR5cGUpe3ZhciBvPWZsZXhpYmlsaXR5LndhbGsodCksbD1vLnN0eWxlO28uaW5kZXg9bixyJiYoZmxleGliaWxpdHkudXBkYXRlRmxleEl0ZW1DYWNoZShvKSxcImF1dG9cIj09PWwuYWxpZ25TZWxmJiYobC5hbGlnblNlbGY9aS5hbGlnbkl0ZW1zKSxsLmZsZXg9bC5mbGV4R3Jvdyx0LnJ1bnRpbWVTdHlsZS5jc3NUZXh0PVwiZGlzcGxheTppbmxpbmUtYmxvY2tcIixlLmNoaWxkcmVuLnB1c2gobykpfX0pLHIpe2UuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbih0KXtmbGV4aWJpbGl0eS51cGRhdGVMZW5ndGhDYWNoZSh0KX0pLGUuY2hpbGRyZW4uc29ydChmdW5jdGlvbih0LGUpe3JldHVybiB0LnN0eWxlLm9yZGVyLWUuc3R5bGUub3JkZXJ8fHQuaW5kZXgtZS5pbmRleH0pLC8tcmV2ZXJzZSQvLnRlc3QoaS5mbGV4RGlyZWN0aW9uKSYmKGUuY2hpbGRyZW4ucmV2ZXJzZSgpLGkuZmxleERpcmVjdGlvbj1pLmZsZXhEaXJlY3Rpb24ucmVwbGFjZSgvLXJldmVyc2UkLyxcIlwiKSxcImZsZXgtc3RhcnRcIj09PWkuanVzdGlmeUNvbnRlbnQ/aS5qdXN0aWZ5Q29udGVudD1cImZsZXgtZW5kXCI6XCJmbGV4LWVuZFwiPT09aS5qdXN0aWZ5Q29udGVudCYmKGkuanVzdGlmeUNvbnRlbnQ9XCJmbGV4LXN0YXJ0XCIpKSxmbGV4aWJpbGl0eS51cGRhdGVMZW5ndGhDYWNoZShlKSxkZWxldGUgZS5sYXN0TGF5b3V0LGRlbGV0ZSBlLmxheW91dDt2YXIgbz1pLmJvcmRlclRvcFdpZHRoLGw9aS5ib3JkZXJCb3R0b21XaWR0aDtpLmJvcmRlclRvcFdpZHRoPTAsaS5ib3JkZXJCb3R0b21XaWR0aD0wLGkuYm9yZGVyTGVmdFdpZHRoPTAsXCJjb2x1bW5cIj09PWkuZmxleERpcmVjdGlvbiYmKGkud2lkdGgtPWkuYm9yZGVyUmlnaHRXaWR0aCksZmxleGliaWxpdHkuY29tcHV0ZUxheW91dChlKSx0LnJ1bnRpbWVTdHlsZS5jc3NUZXh0PVwiYm94LXNpemluZzpib3JkZXItYm94O2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6XCIrKGUubGF5b3V0LndpZHRoK2kuYm9yZGVyUmlnaHRXaWR0aCkrXCJweDtoZWlnaHQ6XCIrKGUubGF5b3V0LmhlaWdodCtvK2wpK1wicHhcIjt2YXIgYT1bXSxkPTEscz1cImNvbHVtblwiPT09aS5mbGV4RGlyZWN0aW9uP1wid2lkdGhcIjpcImhlaWdodFwiO2UuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbih0KXthW3QubGluZUluZGV4XT1NYXRoLm1heChhW3QubGluZUluZGV4XXx8MCx0LmxheW91dFtzXSksZD1NYXRoLm1heChkLHQubGluZUluZGV4KzEpfSksZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBlPXQubGF5b3V0O1wic3RyZXRjaFwiPT09dC5zdHlsZS5hbGlnblNlbGYmJihlW3NdPWFbdC5saW5lSW5kZXhdKSx0Lm5vZGUucnVudGltZVN0eWxlLmNzc1RleHQ9XCJib3gtc2l6aW5nOmJvcmRlci1ib3g7ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTttYXJnaW46MDt3aWR0aDpcIitlLndpZHRoK1wicHg7aGVpZ2h0OlwiK2UuaGVpZ2h0K1wicHg7dG9wOlwiK2UudG9wK1wicHg7bGVmdDpcIitlLmxlZnQrXCJweFwifSl9cmV0dXJuIGV9fSgpOyIsInJlcXVpcmUoJ2ZsZXhpYmlsaXR5Jyk7XG5yZXF1aXJlKCdjbGFzc2xpc3QtcG9seWZpbGwnKTtcblxuLy8gY3JlYXRlIGFuIGFycmF5IHRvIGNvbnRhaW4gYWxsIHRpbWVyc1xudmFyIHRpbWVycyA9IFtdO1xuXG4vLyBnZXQgZWxlbWVudHNcbnZhciB0aW1lcnNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnanMtdGltZXJzLWNvbnRhaW5lcicpO1xudmFyIG1hc3RlclRpbWVyQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pzLW1hc3Rlci1jbG9jay1jb250YWluZXInKTtcbnZhciBuZXdUaW1lckJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqcy1uZXctdGltZXInKTtcblxudmFyIENsb2NrID0gY2xhc3Mge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIC8vIFByb3BzXG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcyB8fCB7fTtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwcm9wcy5wYXJlbnQgfHwgdGltZXJzQ29udGFpbmVyO1xuICAgICAgICB0aGlzLmlzQWN0aXZlID0gcHJvcHMuaXNBY3RpdmUgfHwgZmFsc2U7IC8vIHdoZXRoZXIgb3Igbm90IHRvIHN0YXJ0IHRoZSBjbG9jayBhbHJlYWR5IHJ1bm5pbmdcbiAgICAgICAgdGhpcy5kZWxheSA9IHByb3BzLmRlbGF5IHx8IDEwMDA7IC8vIHRoZSBhbW91bnQgb2YgdGltZSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdG8gdXBkYXRlIHRoZSBjbG9ja1xuICAgICAgICB0aGlzLmlzTWFzdGVyID0gcHJvcHMuaXNNYXN0ZXIgfHwgZmFsc2U7XG4gICAgICAgIHRoaXMudGl0bGUgPSBwcm9wcy50aXRsZSB8fCAnJztcblxuICAgICAgICB0aGlzLm9mZnNldDtcbiAgICAgICAgdGhpcy5jbG9jaztcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoaXMuZW50cmllcyA9IFtdO1xuXG4gICAgICAgIC8vIEVsZW1lbnRzXG4gICAgICAgIHRoaXMudGltZXIgPSB0aGlzLmNyZWF0ZVRpbWVyKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNNYXN0ZXIgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKHRoaXMudGltZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53cmFwcGVyID0gdGhpcy5jcmVhdGVXcmFwcGVyKCk7XG4gICAgICAgICAgICB0aGlzLnRpdGxlSW5wdXQgPSB0aGlzLmNyZWF0ZVRpdGxlSW5wdXQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0U3RvcEJ1dHRvbiA9IHRoaXMuY3JlYXRlU3RhcnRTdG9wQnV0dG9uKHRoaXMuc3RvcFN0YXJ0LCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhcnRTdG9wQnV0dG9uKCk7XG5cbiAgICAgICAgICAgIC8vIEFwcGVuZCBlbGVtZW50c1xuICAgICAgICAgICAgdmFyIGVsZW0gPSB0aGlzLmNyZWF0ZUVsZW1lbnQoKTtcbiAgICAgICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQodGhpcy50aXRsZUlucHV0KTtcbiAgICAgICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQodGhpcy50aW1lcik7XG4gICAgICAgICAgICBlbGVtLmFwcGVuZENoaWxkKHRoaXMuc3RhcnRTdG9wQnV0dG9uKTtcbiAgICAgICAgICAgIHRoaXMudGl0bGVJbnB1dC5mb2N1cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgY2xvY2sgd3JhcHBlciBkaXZcbiAgICBjcmVhdGVXcmFwcGVyKCkge1xuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdsLWZsZXgtaXRlbSc7XG4gICAgICAgIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIGNsb2NrIGNvbnRhaW5lciBlbGVtZW50XG4gICAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSAnY2xvY2snO1xuICAgICAgICBpZiAodGhpcy5pc01hc3Rlcikge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndyYXBwZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHRpbWVyIGVsZW1lbnRcbiAgICBjcmVhdGVUaW1lcigpIHtcbiAgICAgICAgdmFyIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHNwYW4uY2xhc3NOYW1lID0gJ2Nsb2NrX190aW1lcic7XG4gICAgICAgIHJldHVybiBzcGFuO1xuICAgIH1cblxuICAgIGNyZWF0ZVN0YXJ0U3RvcEJ1dHRvbihoYW5kbGVyLCB0aW1lcikge1xuICAgICAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdjbG9ja19fYnV0dG9uJywgJ2J1dHRvbicpO1xuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiBoYW5kbGVyLmNhbGwodGltZXIpKTtcbiAgICAgICAgcmV0dXJuIGJ1dHRvbjtcbiAgICB9XG5cbiAgICB1cGRhdGVTdGFydFN0b3BCdXR0b24oKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0U3RvcEJ1dHRvbi5pbm5lckhUTUwgPSAnU3RvcCc7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0U3RvcEJ1dHRvbi5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTdG9wQnV0dG9uLmlubmVySFRNTCA9ICdTdGFydCc7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0U3RvcEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0b3BTdGFydCgpIHtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA/IHRoaXMuc3RvcCgpIDogdGhpcy5zdGFydCgpO1xuICAgIH1cblxuICAgIGNyZWF0ZVRpdGxlSW5wdXQoc2NvcGUpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgaW5wdXQuY2xhc3NOYW1lID0gJ2Nsb2NrX190aXRsZS1pbnB1dCc7XG4gICAgICAgIGlucHV0LnBsYWNlaG9sZGVyID0gJ05ldyB0aW1lcic7XG4gICAgICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZlbnQgPT4gdGhpcy51cGRhdGVUaW1lclRpdGxlLmNhbGwoc2NvcGUpKTtcbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH1cblxuICAgIHVwZGF0ZVRpbWVyVGl0bGUoKSB7XG4gICAgICAgIHRoaXMucHJvcHMudGl0bGUgPSB0aGlzLnRpdGxlSW5wdXQudmFsdWU7XG4gICAgfVxuXG4gICAgcGFyc2VUaW1lKG51bWJlcikge1xuICAgICAgICB2YXIgc2VjX251bSA9IHBhcnNlSW50KG51bWJlciwgMTApO1xuICAgICAgICB2YXIgaG91cnMgICA9IE1hdGguZmxvb3Ioc2VjX251bSAvIDM2MDApO1xuICAgICAgICB2YXIgbWludXRlcyA9IE1hdGguZmxvb3IoKHNlY19udW0gLSAoaG91cnMgKiAzNjAwKSkgLyA2MCk7XG4gICAgICAgIHZhciBzZWNvbmRzID0gc2VjX251bSAtIChob3VycyAqIDM2MDApIC0gKG1pbnV0ZXMgKiA2MCk7XG5cbiAgICAgICAgaWYgKGhvdXJzIDwgMTApIHtcbiAgICAgICAgICAgIGhvdXJzICAgPSAnMCcgKyBob3VycztcbiAgICAgICAgfVxuICAgICAgICBpZiAobWludXRlcyA8IDEwKSB7XG4gICAgICAgICAgICBtaW51dGVzID0gJzAnICsgbWludXRlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2Vjb25kcyA8IDEwKSB7XG4gICAgICAgICAgICBzZWNvbmRzID0gJzAnICsgc2Vjb25kcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGltZSA9IGhvdXJzICsgJzonICsgbWludXRlcyArICc6JyArIHNlY29uZHM7XG4gICAgICAgIHJldHVybiB0aW1lO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IHRoZSBjbG9jayBjb3VudGVyIHRvIDBcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5jbG9jayA9IDA7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgZGVsdGEoKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgZCAgID0gbm93IC0gdGhpcy5vZmZzZXQ7XG5cbiAgICAgICAgdGhpcy5vZmZzZXQgPSBub3c7XG4gICAgICAgIHJldHVybiBkO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5jbG9jayArPSB0aGlzLmRlbHRhKCk7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnRpbWVyLmlubmVySFRNTCA9IHRoaXMucGFyc2VUaW1lKHRoaXMuY2xvY2sgLyAxMDAwKTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmludGVydmFsKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBQcm9iYWJseSBkb24ndCBuZWVkIHRoaXMgdHdpY2VcbiAgICAgICAgICAgIGlmICh0aGlzLmlzTWFzdGVyID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcEFsbENsb2NrcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgICAgIHRoaXMuZW50cmllcy5wdXNoKHsgc3RhcnQ6IHRoaXMub2Zmc2V0IH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pc01hc3RlciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXJ0U3RvcEJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRpbWVyc1swXS5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RvcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuZW50cmllc1t0aGlzLmVudHJpZXMubGVuZ3RoIC0gMV0uc3RvcCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLmVudHJpZXNbdGhpcy5lbnRyaWVzLmxlbmd0aCAtIDFdLmR1cmF0aW9uID0gdGhpcy5lbnRyaWVzW3RoaXMuZW50cmllcy5sZW5ndGggLSAxXS5zdG9wIC0gdGhpcy5lbnRyaWVzW3RoaXMuZW50cmllcy5sZW5ndGggLSAxXS5zdGFydDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RhcnRTdG9wQnV0dG9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdG9wQWxsQ2xvY2tzKCkge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHRpbWVyc1tpXS5zdG9wKCk7XG4gICAgICAgIH0gd2hpbGUgKGkgPCB0aW1lcnMubGVuZ3RoIC0gMSk7XG4gICAgfVxuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gbG9hZChldmVudCkge1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsb2FkLCBmYWxzZSk7IC8vcmVtb3ZlIGxpc3RlbmVyLCBubyBsb25nZXIgbmVlZGVkXG5cbiAgICAvLyBUT0RPOiBMb2NhbCBzdG9yYWdlIHN0dWZmXG4gICAgaWYgKCdsb2NhbFN0b3JhZ2UnIGluIHdpbmRvdyAmJiB3aW5kb3dbJ2xvY2FsU3RvcmFnZSddICE9PSBudWxsKSB7XG4gICAgICAgIHRpbWVycyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlWyd0aW1lcnMnXSB8fCBudWxsKTtcblxuICAgICAgICBpZiAodGltZXJzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aW1lcnMgPSBbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aW1lcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRpbWVycy5wdXNoKG5ldyBDbG9jayh7IHBhcmVudDogbWFzdGVyVGltZXJDb250YWluZXIsIGlzTWFzdGVyOiB0cnVlIH0pKTtcbiAgICB9O1xuXG4gICAgbmV3VGltZXJCdXR0b24ub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lcnMucHVzaChuZXcgQ2xvY2soeyBwYXJlbnQ6IHRpbWVyc0NvbnRhaW5lciB9KSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRpbWVycyk7XG4gICAgfTtcbn0pO1xuXG4iXX0=
