"use strict";	// For variable declaration/scope

var $ = function(selector,object){	// Single element selection
	return (object || document).querySelector(selector);
};
var $$ = function(selector,object){	// Multiple elements selection
	return (object || document).querySelectorAll(selector);
};
var _ = function(className,object){	// Class name selector
	return (object || document).getElementsByClassName(className);
};

Object.prototype.each = function(callback){
	for (let i = 0; i<this.length; i ++)
		callback(this[i],i);
	return this;
};
Object.prototype.map = function(callback){
	var r = [];
	for (let i = 0; i<this.length; i ++)
		r.push(callback(this[i],i));
	return r;
};
/* JSON Filter on key	*/
Object.prototype.JSONFilter = function(filter = {'key':null,'value':null},space = 0){
	if (!filter['key']) filter['key'] = '';
	if (!filter['value']) filter['value'] = '';
	let hasKeyFilter = 0<filter['key'].toString().length,
		hasValueFilter = 0<filter['value'].toString().length,
		condition = false;
	return (hasKeyFilter || hasValueFilter)
		? JSON.stringify(this,function(key,value){
			if (typeof value=='object' || typeof value=='array')
				return value;
			if (hasKeyFilter && !hasValueFilter){
				condition = null===key.toString().match(new RegExp(`${filter['key']}`,'i')) ? false : true;
			}else if (!hasKeyFilter && hasValueFilter){
				condition = null===value.toString().match(new RegExp(`${filter['value']}`,'i')) ? false : true;
			}else if (hasKeyFilter && hasValueFilter){
				condition = (null===key.toString().match(new RegExp(`${filter['key']}`,'i')) || null===value.toString().match(new RegExp(`${filter['value']}`,'i'))) ? false : true;
			}
			return condition ? value : undefined;
		},space)
		: JSON.stringify(this,null,space);
}

/* Lowercase the string and uppercase the first letter of each word	*/
String.prototype.ucword = function(){
	return this.toLowerCase().replace(/\b[a-z]/g,letter=>letter.toUpperCase());
};
/* Simple formatted string function using pattern {index} starting at index zero	*/
/*	'H{0}ll{1} W{1}rld {2}'.format(['e','o','!']);	*/
/*	'H{0}ll{1} W{1}rld {2}'.format(['e','o'],(number,format,value)=>`${number}?`);	*/
String.prototype.format = function(value,callback = false){
	if (typeof callback=='function')
		return this.replace(/{(\d+)}/g,(match,number)=>
			void 0!==value[number] ? value[number] : callback(number,this.valueOf(),value) || match
		);
	return this.replace(/{(\d+)}/g,(match,number)=>void 0!==value[number] ? value[number] : match);
};
/* Replace non-matching characters	*/
String.prototype.replaceChar = function(regexp,charList,callback = (c)=>c){
	return this.replace(regexp,(character)=>{
		return charList[character] || callback(character);
	});
};
/* Replace non-latin or specials characters	*/
String.prototype.transliterate = function(){
	return this.replaceChar(/[^A-Za-z0-9 ]/g,{	// Full list at https://stackoverflow.com/questions/286921/efficiently-replace-all-accented-characters-in-a-string/9667817#9667817
		/* 1	*/	'¹':'1',
		/* 2	*/	'²':'2',
		/* 3	*/	'³':'3',
		/* A	*/	'À':'A','Á':'A','Â':'A','Ã':'A','Ä':'A','Å':'A','Æ':'AE',
		/* a	*/	'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae',
		/* C	*/	'Ç':'C','©':'C',
		/* c	*/	'ç':'c',
		/* E	*/	'È':'E','É':'E','Ê':'E','Ë':'E',
		/* e	*/	'è':'e','é':'e','ê':'e','ë':'e',
		/* I	*/	'Ì':'I','Í':'I','Î':'I','Ï':'I',
		/* i	*/	'ì':'i','í':'i','î':'i','ï':'i',
		/* N	*/	'Ñ':'N',
		/* n	*/	'ñ':'n',
		/* O	*/	'Ò':'O','Ó':'O','Ô':'O','Õ':'O','Ö':'O','Ø':'O','Œ':'O',
		/* o	*/	'ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','œ':'o','°':'o',
		/* R	*/	'®':'R',
		/* s	*/	'ß':'ss',
		/* T	*/	'™':'TM',
		/* U	*/	'Ù':'U','Ú':'U','Û':'U','Ü':'U',
		/* u	*/	'ù':'u','ú':'u','û':'u','ü':'u','µ':'u',
		/* Y	*/	'Ý':'Y',
		/* y	*/	'ý':'y','ÿ':'y',
		/* x	*/	'×':'x',
	});
};
/* Generate ID from raw text	*/
String.prototype.idfyRegex = /[^A-Z0-9\-_:\.]/gi;	// Allowed characters in HTML4 ID
String.prototype.idfy = function(){
	var id = this.transliterate().replaceChar(this.idfyRegex,{
		' ':'-'
	},(c)=>{
		console.warn(`String.idfy(): Non-matching character ${c} is removed, check for substitution`);
		return '';
	});
	//console.warn(id);
	if (id.match(/^[A-Z][A-Z0-9\-_:\.]*$/i)!=null)
		return id;
	else	// This should never happend
		console.error(`String.idfy(): '${id}' is not a valid ID`);
};

Array.prototype.unique = function(){
	return this.filter((item,index)=>index==this.indexOf(item),this);
};
Array.prototype.merge = function(array){
	return this.unique().concat(array.unique()).unique();
};

HTMLElement.prototype.$ = function(selector){	return $(selector,this);	};
HTMLElement.prototype.$$ = function(selector){	return $$(selector,this);	};
HTMLElement.prototype._ = function(className){	return _(className,this);	};
HTMLElement.prototype.addMultipleEventListener = function(eventArray,listener,options = false){
	eventArray.forEach(function(event){
		this.addEventListener(event,listener,options);
	},this);
}
HTMLElement.prototype.onMultipleEventTimeout = null;
HTMLElement.prototype.timeoutOnEvent = function(callback,eventArray = [],timeout = 500){
	if (0>=eventArray.length)
		return false;
	this.addMultipleEventListener(eventArray,function(event){
		if (this.onMultipleEventTimeout)
			window.clearTimeout(this.onMultipleEventTimeout);
		this.onMultipleEventTimeout = window.setTimeout(callback,timeout,event);
	});
	return true;
};
HTMLElement.prototype.computedStyle = null;
HTMLElement.prototype.getComputedStyle = function(){	return this.computedStyle = window.getComputedStyle(this);	};
HTMLElement.prototype.copyAllTextTimeout = 100;	// Milliseconds
HTMLElement.prototype.copyAllText = function(){
	try {
		if (this.form){
			this.focus();
			this.select();
			document.execCommand('copy');
			window.setTimeout(function(e){
				e.setSelectionRange(0,0);
			},this.copyAllTextTimeout,this);
		}else if (window.getSelection){
			var range = document.createRange();
			range.selectNode(this);
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(range);
			document.execCommand('copy');
			window.setTimeout(function(){
				window.getSelection().removeAllRanges();
			},this.copyAllTextTimeout);
		}else{
			console.warn(`Could not select text in '${this.tagName}' element`);
		}
	}catch (exception){
		console.error('Unable to copy selected text');
		console.error(exception);
	}
};

CSSStyleDeclaration.prototype.getValue = function(property){	return this.getPropertyValue(property);	};
/* Removes CSS class from similar elements (same name and level) and applies to the current one	*/
HTMLElement.prototype.toggleCss = function(className){
	this.parentNode.$$(`${this.tagName}.${className}`).each(
		(element) => element.classList.remove(className)
	);
	this.classList.add(className);
};

HTMLLIElement.prototype.toggle = function(className){
	this.toggleCss(className);
	$(`section#${this.dataset.id}`).toggleCss(className);
};

/* Tri-state checkbox */
HTMLInputElement.prototype.cbTriStateRotate = function(order = 'uic'){
	if (this.type!='checkbox')
		return false;
	if ('uic'==order){	// unchecked > indeterminate > checked <<
		if (!this.readOnly){
			this.readOnly = this.indeterminate = true;
			this.checked = false;
		}else if (!this.checked)
			this.readOnly = false;
	}else if ('uci'==order){	// unchecked > checked > indeterminate <<
		if (this.readOnly)
			this.checked = this.readOnly = false;
		else if (!this.checked)
			this.readOnly = this.indeterminate = true;
	}else
		console.error(`cbTriStateRotate order '${order}' not implemented`);
};
/* Action on text input */
HTMLInputElement.prototype.onTextEntry = function(callback,event = ['keyup','input'],timeout = 500){
	if (-1==['text'].indexOf(this.type))
		return false;
	this.timeoutOnEvent(callback,event,timeout);
};

HTMLTextAreaElement.prototype.jsonString = '';
HTMLTextAreaElement.prototype.jsonObject = {};
HTMLTextAreaElement.prototype.onTextEntry = function(callback,event = ['keyup','input'],timeout = 500){
	this.timeoutOnEvent(callback,event,timeout);
};

XMLHttpRequest.prototype.requestCount = 0;
XMLHttpRequest.prototype.setRequestHeaderObject = function(header){
	/* Method Object.keys() will only show enumerable properties, unlike Object.getOwnPropertyNames()
	See https://stackoverflow.com/a/22658584/10099582 for more details	*/
	Object.keys(header).forEach((key)=>{
		this.setRequestHeader(key,header[key]);
	});
}
var requestCount = 0;
function request(method,url,callback,header = {},debug = false){
	requestCount ++;
	if (debug){
		console.groupCollapsed(`XHR Call #${requestCount}`);
		//console.log((new Date()).toLocaleString('fr-FR',{timeZone:'Europe/Paris'}));
		console.groupEnd();
	}
	let xhr = new XMLHttpRequest();
	xhr.requestCount = requestCount;
	xhr.withCredentials = true;
	url = '<?=$apiUrl?>'+url;
	if (debug){
		console.time(`Request #${xhr.requestCount} duration`);
		console.log(url);
	}
	xhr.open(method,url);
	xhr.setRequestHeaderObject(header);
	xhr.onreadystatechange = function(event){
		// console.log(event); this should be event.target
		switch (this.readyState){
		case XMLHttpRequest.UNSET:	// 0
		case XMLHttpRequest.OPENED:	// 1
			break;
		case XMLHttpRequest.HEADERS_RECEIVED:	// 2
			if (debug){
				console.groupCollapsed(`XHR Header #${this.requestCount}`);
				console.log(decodeURIComponent(this.responseURL));
				console.log(`${this.status} ${this.statusText}`);
			}
			this.header = {};
			//var xhr = this;
			this.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(function(line){
				let keyValue = line.split(/: */,2);
				this.header[keyValue[0].ucword()] = keyValue[1];
			},this);
			if (debug){
				console.table(this.header);
				console.groupEnd();
			}
			break;
		case XMLHttpRequest.LOADING:	// 3
			break;
		case XMLHttpRequest.DONE:	// 4
			if (debug){
				console.groupCollapsed(`XHR Body #${this.requestCount}`);
				console.timeEnd(`Request #${this.requestCount} duration`);
				console.log(this.responseText,"\n\n\n");
				console.groupEnd();
			}
			callback(this);
			break;
		default:
			if (debug)
				console.log(this.readyState);
			break;
		}
	};
	xhr.onprogress = function(event){
		if (event.lengthComputable){
			let totalByteLength = event.total.toString().length;
			console.log('{0}/{1} bytes loaded ({2}%)'.format([
				event.loaded.toString().padStart(totalByteLength,' '),
				event.total,
				Math.round(100*event.loaded/event.total)
			]));
		}else{
			console.log('{0} bytes loaded'.format([
				event.loaded.toString().padStart(10,' '),
			]));
		}
	};
	xhr.send();
}
