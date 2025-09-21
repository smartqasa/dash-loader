/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e,this[e]=h.fromAttribute(s,t.type)??this._$Ej?.get(e)??null,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.0");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t$1.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$2="?"+h,n$1=`<${o$2}>`,r$2=document,l=()=>r$2.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$2.createTreeWalker(r$2,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$2)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$2.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$2).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$2,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$2.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.0");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.0");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function executeFullyAction(action) {
    if (typeof window.fully === "undefined")
        return;
    const timings = {
        bringToFore: 1000,
        regainFocus: 500,
        clearCache: 1000,
    };
    if (!window.fully.isInForeground()) {
        window.fully.bringToForeground();
        await delay(timings.bringToFore);
    }
    window.fully.setStringSetting("timeToRegainFocus", "0");
    await delay(timings.regainFocus);
    window.fully.clearCache();
    await delay(timings.clearCache);
    window.fully[action]();
}
function bustCacheAndReload() {
    const url = new URL(window.location.href);
    url.searchParams.set("nocache", Date.now().toString());
    window.history.replaceState(null, "", url.toString());
    window.location.reload();
}
function deviceRefresh() {
    if (typeof window.fully === "undefined") {
        bustCacheAndReload();
    }
    else {
        void executeFullyAction("restartApp");
    }
}
function deviceReboot() {
    if (typeof window.fully === "undefined") {
        bustCacheAndReload();
    }
    else {
        void executeFullyAction("reboot");
    }
}

const SCREENSAVER_TIMEOUT = 1 * 60 * 1000;
window.customCards.push({
    type: "panel-card",
    name: "Panel Card",
    preview: true,
    description: "A SmartQasa card for displaying the Main panel card.",
});
let PanelCard = class PanelCard extends i {
    constructor() {
        super(...arguments);
        this.isSaverActive = false;
        this.fadeRequested = false;
        this.isAdminView = false;
        this.rebootTime = null;
        this.refreshTime = null;
        this.handleVisibility = () => {
            this.requestUpdate();
        };
        this.boundHandleFade = () => this.handleFade();
        this.boundTouchHandler = () => this.resetSaver();
        this.boundMouseHandler = () => this.resetSaver();
        this.boundKeyHandler = () => this.resetSaver();
        this.saverTimer = null;
    }
    getCardSize() {
        return 20;
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("visibilitychange", this.handleVisibility);
        window.addEventListener("sq-fade-request", this.boundHandleFade);
        if (window.fully) {
            window.addEventListener("touchstart", this.boundTouchHandler, {
                passive: true,
            });
            window.addEventListener("mousemove", this.boundMouseHandler);
            window.addEventListener("keydown", this.boundKeyHandler);
            window.onFullyMotion = () => this.resetSaver();
            if (window.fully.bind) {
                window.fully.bind("onMotion", "onFullyMotion()");
            }
            this.resetSaver();
        }
    }
    disconnectedCallback() {
        document.removeEventListener("visibilitychange", this.handleVisibility);
        window.removeEventListener("sq-fade-request", this.boundHandleFade);
        if (window.fully) {
            window.removeEventListener("touchstart", this.boundTouchHandler);
            window.removeEventListener("mousemove", this.boundMouseHandler);
            window.removeEventListener("keydown", this.boundKeyHandler);
        }
        if (this.saverTimer) {
            clearTimeout(this.saverTimer);
            this.saverTimer = null;
        }
        super.disconnectedCallback();
    }
    setConfig(config) {
        this.config = config;
    }
    willUpdate(changedProps) {
        if (changedProps.has("hass")) {
            const isAdmin = this.hass?.user?.is_admin || false;
            const isAdminMode = this.hass?.states["input_boolean.admin_mode"]?.state === "on" || false;
            this.isAdminView = isAdmin || isAdminMode;
        }
    }
    render() {
        this.classList.toggle("admin-view", this.isAdminView);
        if (!this.mainCard || !this.config || !this.hass) {
            return x `
        <div class="container loader">
          <div class="loading-text">SmartQasa is loading</div>
          <div class="dots"><span></span><span></span><span></span></div>
        </div>
      `;
        }
        if (this.isSaverActive) {
            return x `
        <div class="container">
          <screensaver-card
            .config=${this.config}
            .hass=${this.hass}
          ></screensaver-card>
        </div>
      `;
        }
        return x ` <div class="container">${this.mainCard}</div> `;
    }
    firstUpdated() {
        this.createMainCard();
        this.fadeRequested = true;
    }
    async updated(changedProps) {
        if (!this.mainCard)
            return;
        if (changedProps.has("config") && this.config) {
            this.mainCard.setConfig(this.config);
        }
        if (changedProps.has("hass") && this.hass) {
            this.syncHass();
            this.checkDeviceTriggers();
        }
        if (changedProps.has("fadeRequested")) {
            const container = this.shadowRoot?.querySelector(".container");
            if (container) {
                if (this.fadeRequested) {
                    container.classList.remove("visible");
                    setTimeout(() => {
                        this.fadeRequested = false;
                    }, 250);
                }
                else {
                    container.classList.add("visible");
                }
            }
        }
    }
    async createMainCard(retries = 5) {
        try {
            await customElements.whenDefined("main-card");
            if (!this.mainCard) {
                const element = document.createElement("main-card");
                if (this.config)
                    element.setConfig(this.config);
                if (this.hass)
                    element.hass = this.hass;
                this.mainCard = element;
            }
        }
        catch (err) {
            console.error("[PanelCard] Error waiting for main-card:", err);
            if (retries > 0) {
                this.mainCard = undefined;
                setTimeout(() => this.createMainCard(retries - 1), 1000);
            }
        }
    }
    syncHass() {
        if (!this.hass)
            return;
        if (this.mainCard)
            this.mainCard.hass = this.hass;
        document.querySelectorAll("popup-dialog").forEach((popup) => {
            if (popup.hass !== undefined) {
                popup.hass = this.hass;
            }
        });
    }
    resetSaver() {
        if (!window.fully)
            return;
        if (this.isSaverActive)
            this.exitSaver();
        if (this.saverTimer)
            clearTimeout(this.saverTimer);
        this.saverTimer = setTimeout(() => {
            this.showSaver();
        }, SCREENSAVER_TIMEOUT);
    }
    async showSaver() {
        this.isSaverActive = true;
    }
    exitSaver() {
        this.isSaverActive = false;
        this.handleFade();
    }
    checkDeviceTriggers() {
        if (!this.hass)
            return;
        const rebootState = this.hass?.states?.["input_button.reboot_devices"]?.state;
        if (this.rebootTime !== null && rebootState !== this.rebootTime) {
            try {
                deviceReboot();
            }
            catch (err) {
                console.error("[PanelCard] Device reboot failed:", err);
            }
        }
        this.rebootTime = rebootState || null;
        const refreshState = this.hass?.states?.["input_button.refresh_devices"]?.state;
        if (this.refreshTime !== null && refreshState !== this.refreshTime) {
            try {
                deviceRefresh();
            }
            catch (err) {
                console.error("[PanelCard] Device refresh failed:", err);
            }
        }
        this.refreshTime = refreshState || null;
    }
    handleFade() {
        this.fadeRequested = true;
        this.requestUpdate();
    }
    static get styles() {
        return i$3 `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        background-color: var(--panel-color, #000);
      }

      :host(.admin-view) {
        height: calc(100vh - 56px);
      }

      .container {
        width: 100%;
        height: 100%;
        opacity: 0;
        will-change: opacity;
        transition: opacity 250ms ease-in-out;
      }

      .container.visible {
        opacity: 1;
      }

      .container.loader {
        display: flex;
        flex-direction: column;
        height: 100%;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .loading-text {
        font-size: 1.5rem;
        font-weight: 300;
        margin-bottom: 1rem;
        color: var(--primary-text-color);
      }

      .dots {
        display: flex;
        gap: 0.5rem;
      }

      .dots span {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--primary-text-color);
        animation: bounce 1.4s infinite ease-in-out both;
      }

      .dots span:nth-child(1) {
        animation-delay: -0.32s;
      }
      .dots span:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }
    `;
    }
};
__decorate([
    n({ attribute: false })
], PanelCard.prototype, "config", void 0);
__decorate([
    n({ attribute: false })
], PanelCard.prototype, "hass", void 0);
__decorate([
    r()
], PanelCard.prototype, "mainCard", void 0);
__decorate([
    r()
], PanelCard.prototype, "isSaverActive", void 0);
__decorate([
    r()
], PanelCard.prototype, "fadeRequested", void 0);
PanelCard = __decorate([
    t("panel-card")
], PanelCard);

const formattedDate = (date = new Date()) => {
    if (isNaN(date.getTime()))
        return "Unknown";
    const options = {
        weekday: "long",
        month: "short",
        day: "numeric",
    };
    try {
        return date.toLocaleDateString(undefined, options);
    }
    catch (e) {
        return date.toDateString();
    }
};
const formattedTime = (date = new Date()) => {
    if (isNaN(date.getTime()))
        return "Unknown";
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours % 12 || 12}:${minutes < 10 ? "0" + minutes : minutes}`;
};

var img = "data:image/png;base64,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AAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACASkAHAAAAAAAAgEpABwAAAAAAAIBKQAcAAAAAAACAqj41AQAA33v37p0RAM7k7du3RgAAAIAL4wQ6AAAAAAAAACSgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAAQCWgAwAAAAAAAEAloAMAAAAAAABAJaADAAAAAAAA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";

window.customCards.push({
    type: "screensaver-card",
    name: "Screen Saver Card",
    preview: true,
    description: "A SmartQasa card for displaying a screen saver.",
});
let ScreenSaver = class ScreenSaver extends i {
    constructor() {
        super(...arguments);
        this.time = "Loading...";
        this.date = "Loading...";
    }
    getCardSize() {
        return 100;
    }
    setConfig(config) {
        this.config = config;
    }
    render() {
        if (!this.config)
            return E;
        return x `
      <div class="container">
        <div class="element">
          ${this.config?.saver_type === "logo"
            ? x `
                <div class="logo">
                  <img
                    src=${img}
                    alt="Logo"
                    @error=${() => this.handleImageError()}
                  />
                  ${this.config.saver_title
                ? x ` <div class="name">${this.config.saver_title}</div> `
                : ""}
                </div>
              `
            : x `
                <div class="time">${this.time}</div>
                <div class="date">${this.date}</div>
              `}
        </div>
      </div>
    `;
    }
    firstUpdated(_changedProps) {
        this.updateElement();
        this.startClock();
        this.cycleElement();
    }
    updated(changedProps) {
        if (changedProps.has("hass") && this.hass) {
            const rebootTime = this.hass.states["input_button.reboot_devices"]?.state;
            if (this.rebootTime !== undefined && this.rebootTime !== rebootTime) {
                deviceReboot();
            }
            this.rebootTime = rebootTime;
            const refreshTime = this.hass.states["input_button.refresh_devices"]?.state;
            if (this.refreshTime !== undefined && this.refreshTime !== refreshTime) {
                deviceRefresh();
            }
            this.refreshTime = refreshTime;
        }
    }
    disconnectedCallback() {
        if (this.timeIntervalId !== undefined) {
            window.clearInterval(this.timeIntervalId);
        }
        if (this.moveTimerId !== undefined) {
            window.clearInterval(this.moveTimerId);
        }
        super.disconnectedCallback();
    }
    startClock() {
        this.timeIntervalId = window.setInterval(() => {
            this.updateElement();
        }, 1000);
    }
    cycleElement() {
        const element = this.shadowRoot?.querySelector(".element");
        if (!element) {
            console.error("Element not found in shadow DOM.");
            return;
        }
        const moveTimer = (this.config?.saver_interval ?? 30) * 1000;
        const runCycle = () => {
            element.style.opacity = "0";
            setTimeout(() => {
                this.moveElement();
                element.style.opacity = "1";
            }, 1000);
        };
        runCycle();
        this.moveTimerId = window.setInterval(runCycle, moveTimer);
    }
    updateElement() {
        const now = new Date();
        this.time = formattedTime(now);
        this.date = formattedDate(now);
    }
    moveElement() {
        const container = this.shadowRoot?.querySelector(".container");
        const element = this.shadowRoot?.querySelector(".element");
        if (container && element) {
            const maxWidth = container.clientWidth - element.clientWidth;
            const maxHeight = container.clientHeight - element.clientHeight;
            const randomX = Math.floor(Math.random() * maxWidth);
            const randomY = Math.floor(Math.random() * maxHeight);
            element.style.left = `${randomX}px`;
            element.style.top = `${randomY}px`;
        }
    }
    handleImageError() {
        console.error("Failed to load image.");
    }
    static get styles() {
        return i$3 `
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background-color: black;
      }

      .container {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .element {
        display: flex;
        flex-direction: column;
        position: absolute;
        padding: 2rem;
        background-color: transparent;
        opacity: 1;
        transition: opacity 1s ease-in-out;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .time,
      .date {
        text-align: center;
        line-height: normal;
        white-space: nowrap;
        transition: all 0.5s ease-in-out;
        max-width: 100vw;
      }

      .time {
        font-size: 7rem;
        font-weight: 300;
        color: rgb(140, 140, 140);
      }

      .date {
        font-size: 2.5rem;
        font-weight: 200;
        color: rgb(140, 140, 140);
      }

      .logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: transparent;
      }

      .logo img {
        object-fit: contain;
        width: 150px;
        opacity: 0.5;
      }

      .name {
        margin-top: 10px;
        padding: 0.5rem 1rem;
        background-color: rgba(200, 200, 200, 0.5);
        color: rgba(0, 0, 0, 1);
        font-size: 1.5rem;
        font-weight: 400;
        text-align: center;
        border-radius: 0.25rem;
        word-wrap: break-word;
        width: 100%;
      }
    `;
    }
};
__decorate([
    n({ attribute: false })
], ScreenSaver.prototype, "config", void 0);
__decorate([
    n({ attribute: false })
], ScreenSaver.prototype, "hass", void 0);
__decorate([
    r()
], ScreenSaver.prototype, "time", void 0);
__decorate([
    r()
], ScreenSaver.prototype, "date", void 0);
ScreenSaver = __decorate([
    t("screensaver-card")
], ScreenSaver);

window.smartqasa = window.smartqasa || {};
console.info(`%c SmartQasa Loader ⏏ ${"6.1.14-beta.20"} (Built: ${"2025-09-21T17:21:00.352Z"}) `, "background-color: #0000ff; color: #ffffff; font-weight: 700;");
//# sourceMappingURL=loader.js.map
