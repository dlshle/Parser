/*
TODO:
[f: font:Times New Roman|size:150%(or 20px)|color:red|bg-color:blue]font setting[/font] <=> <p style
[sup]superscript[/sup]
[sub]subscript[/sub]
[q:author]quote[/q] <=> ???
[li][x]1[x]2[x]3[/li] //list just transfer [ to < and ] to >, simple
[ol][x]a[x]b[x]c[/ol] //ordered list same as above, simple
*/

const regex = /(\[code:.+)|(\[a:.+)|(\[img:.+)|(\[ref:\s*[0-9]+\s*\])|(\[b\])|(\[q\])|(\[i\])|(\[\u\])|(\[s\])|(\[mk\])|(\[size:\s*[0-9]+\s*\].+)|(\[c:.+)|(\[font:.+)|(\[ali:\s*(l|c|r)\s*].+)/g;
const illegalChars = "{}[]\'\"";

const changeArticleFormat = (text, tagId) => {
	document.getElementById(tagId).innerHTML = getFormattedArticle(text);
	//hljs.highlightBlock(document.getElementByTagName(tagId));
}

const getFormattedArticle = (text) => {
	return parseText(text, paraphrase, ["<p>","</p>"]);
}

const parseToHTML = (text) => {
	return parseText(text, paraphrase, ["<p>","</p>"]);
}

/**
 * @params: text, the target text that is going to be parsed, 
 * plainTextHandler, the callback function that is used to transform the plain text
 * pAppend, the list of string that is used to insert and append to the result when pCounter==0(for HTML, ["<p>","</p>"] is used
 */
const parseText = (text, plainTextHandler, pAppend) => {
	let startPos = -1;
	let endPos = -1;
	let result = "";
	let tempResult = "";
	let preText = "";
	let isValidEndPos = true;
	let notEmbedded = false;
	let pCounter = 0;
	do{
		startPos = text.search(regex);
		if(startPos==-1)
			//if no starting indicator found, just skip the loop
			break;
		let pre = text.substring(startPos+1,startPos+3);
		if(pack[pre]) {
			endPos = text.indexOf(pack[pre].endStr);
			if(endPos==-1)
				isValidEndPos = false;
			else {
				if(pack[pre].emb)
					notEmbedded = true;
				tempResult = pack[pre].f(text.substring(startPos, endPos+pack[pre].endPos));
				endPos+=pack[pre].endPos;
			}
		}

		//paragraph the pretext
		preText = text.substring(0,startPos);
		if(isValidEndPos) {
			//if(!notEmbedded)
			//	result+=(preText+tempResult);
			//else {
				result+=(plainTextHandler(preText)+tempResult);
				pCounter++;
			//}
			text = text.substring(endPos);
		} else { 
			//if the end position is not valid, handle the pretext and skip the invalid start position.
			result+=plainTextHandler(preText);
			text = text.substring(startPos+1);
			isValidEndPos = true;
		}
	}while(startPos!=-1);
	if(text.length>0)
		result+=plainTextHandler(text);
	if(pCounter==0)
		result=pAppend[0]+result+pAppend[1];
	return result;
}

const superParse = (code) => {
	let pre = {};
	pre.text = code.substring(0,code.indexOf("]")+1);
	pre.attributes = getAttributes(pre.text.substring(1,pre.text.length-1));
	let body = "";
	if(code.lastIndexOf("[")==0)
		body = null;
	else 
		body = code.substring(code.indexOf("]")+1,code.lastIndexOf("["));
	let suf = {};
	suf.text = code.substring(code.lastIndexOf("["),code.length);
	suf.attributes = getAttributes(suf.text.substring(1,suf.text.length-1));
	return {pre,body,suf};
}

const getAttributes = (str) => {
	if(str==null)
		return null;
	//abc:def
	let result = new Map();
	let index = -1;
	let lis = -1;
	let lie = -1;
	let ris = -1;
	let rie = -1;
	let left = "";
	let right = "";
	let illegal;
	do{
		illegal = false;
		lis = -1;	
		lie = -1;
		ris = -1;
		rie = -1;
		str = str.trim();
		index = str.indexOf(":");
		if(index==-1){
			result.set(str,null);
			return result;
		}
		//skip spaces
		for(let i=index-1;i>=0;i--){
			if(illegalChars.indexOf(str.charAt(i))>0)
				illegal = true;
			if(str.charAt(i)!=' '){
				lie = i;
				break;
			}
		}	
		if(lie==-1){
			//invalid left indicator
			return null;
		}
		for(let i=lie;i>=0;i--){
			if(illegalChars.indexOf(str.charAt(i))>0)
				illegal = true;
			if(str.charAt(i)==' '){
				lis = i+1;
				break;
			}
		}
		if(lis==-1)
			lis = 0;
		//right, skip spaces
		for(let i=index+1;i<str.length;i++){
			if(illegalChars.indexOf(str.charAt(i))>0)
				illegal = true;
			if(str.charAt(i)!=' '){
				ris = i;
				break;
			}
		}
		if(ris==-1){
			//all space, invalid right indicator
			return null;
		}
		for(let i=ris;i<str.length;i++){
			if(illegalChars.indexOf(str.charAt(i))>0)
				illegal = true;
			if(str.charAt(i)==' '){
				rie = i;
				break;
			}
		}
		if(rie==-1)
			rie = str.length-1;
		left = str.substring(lis,lie+1);
		right = str.substring(ris,rie==str.length-1?rie+1:rie);
		if(!illegal)
			result.set(left,right);
		str = str.substring(rie+1);
	}while(str.length>0);
	return result;
}

const paraphrase = (text) => {
	if(text==null||text=="")
		return "";
	let br = -1;
	let result = "";
	do{
		br = text.indexOf("\n");
		if(br==-1) {
			result+="<p>"+text+"</p>";
			break;
		}
		result+="<p>"+text.substring(0,br)+"</p>";
		text = text.substring(br+1);
	}while(true);
	return result;
}

const brReturn = (text) => {
	if(text==null||text=="")
		return "";
	var i;
	do{
		i = text.indexOf("\n");
		if(i==-1)
			return text;
		text = text.substring(0,i)+"<br>"+text.substring(i+1);
	}while(i>0);
	return text;
}

const parseCode = (text) => {
	let pre = text.substring(0,text.indexOf("]")+1);
	let endIndex = text.indexOf("[/code]");	
	let lan = pre.substring(pre.indexOf(":")+1,pre.length-1);
	let code = text.substring(text.indexOf("]")+1,endIndex);
	code = replaceAll(code, "<", "&lt;");
	code = replaceAll(code, ">", "&gt;");
	return "<pre><code class=\""+lan+"\">"+code+"</code></pre>";
}

const superParseImg = (text) => {
	let struct = superParse(text);
	let attrs = struct.pre.attributes;
	let attr = "src=\""+attrs.get("img")+"\" "+(attrs.has("h")?"height=\""+attrs.get("h")+"\" ":"")+(attrs.has("w")?"width=\""+attrs.get("w")+"\" ":"");
	return "<img "+attr+"alt=\""+struct.body+"\">";
}

//--------------legacy code, for art apperaciation only------------------
const parseImg = (text) => {
	let pre = text.substring(0,text.indexOf("]"));
	//[img:src h: w:]desc[/img]
	//<img src="xxx" height=xx width=xx alt=desc>
	let desc = text.substring(text.indexOf("]")+1, text.lastIndexOf("["));
	let attr = getImgAttributes(pre.substring(5,pre.length));
	let attrResult = "src=\""+attr.src+"\" ";
	if(attr.h!=null)
		attrResult+="height=\""+attr.h+"\"";
	if(attr.w!=null)
		attrResult+=" width=\""+attr.w+"\"";
	return "<img "+ attrResult+" alt=\""+desc+"\">";
}
//-----------------------------------------------------------------------

const getImgAttributes = (attr) => {
	let src = attr.substring(0,attr.indexOf(" ")==-1?attr.indexOf("]"):attr.indexOf(" "));
	let iHeight = attr.indexOf("h:");
	let iWidth = attr.indexOf("w:");
	let height = iHeight==-1?-1:parseFloat(attr.substring(iHeight+2).substring(0,indexOfLastNumber(attr.substring(iHeight+2))+1));
	let width = iWidth==-1?-1:parseFloat(attr.substring(iWidth+2).substring(0,indexOfLastNumber(attr.substring(iWidth+2))));
	let result = {};
	result.src = src;
	if(height!=-1)
		result.h = height;
	if(width!=-1)
		result.w = width;
	return result;	
}

const indexOfLastNumber = (str) => {
	for(let i=0;i<str.length;i++)
		if(!isNumber(str.charAt(i)))
			return i;
	return str.length-1;	
}

const isNumber = (c) => {
	return c>'0'&&c<'9';
}
//-------------------------------------EOA--------------------------------
const parseLink = (text) => {
	//[a:link]text or something[/a]
	//<a href="xxx">text or something</a>
	let link = purify(text.substring(3,text.indexOf("]")));
	let content = parseText(text.substring(text.indexOf("]")+1,text.lastIndexOf("[")), keepText, ["",""]);
	return "<a href=\""+link+"\">"+content+"</a>";
}

const keepText = (text) => {
	return text;
}

const parseRef = (text) => {
	//[ref:id]
	let id = purify(text.substring(5,text.length-1));
	return "<a href=\""+id+"\">[To article "+id+"]</a>";
}

const simpleParse = (text) => {
	//[x]text[/x]
	return "<"+text.substring(1,text.indexOf(']'))+">"+parseText(text.substring(3,text.lastIndexOf('[')),keepText,["",""])+"<"+text.substring(text.lastIndexOf('[')+1,text.length-1)+">";
}

const parseStrike = (text) => {
	return "<del>"+parseText(text.substring(3,text.length-4),keepText,["",""])+"</del>";
}

const purify = (text) => {
	text = text.trim();
	let result = "";
	for(let i=0;i<text.length;i++){
		if(illegalChars.indexOf(text.charAt(i))>0)
			continue;
		result+=text.charAt(i);
	}
	return result;
}

const replaceAll = (str, tar, rep) => {
	while(str.indexOf(tar)>=0)
		str = str.replace(tar,rep);
	return str;
}

const setSize = (text) => {
	//[size:123]xxx[/size]
	let index = text.indexOf(']');
	let val = text.substring(text.indexOf(":")+1,index);
	return "<span style=\"font-size:"+purify(val)+"px;\">"+parseText(text.substring(index+1,text.length-7), keepText, ["",""])+"</span>";
}

const setColor = (text) => {
	//[color:123]xxx[/color]
	let index = text.indexOf(']');
	let val = text.substring(text.indexOf(":")+1,index);
	return "<span style=\"color:"+purify(val)+";\">"+parseText(text.substring(index+1,text.length-4), keepText, ["",""])+"</span>";
}

const setFont = (text) => {
	//[font:123]xxx[/font]
	let index = text.indexOf(']');
	let val = text.substring(text.indexOf(":")+1,index);
	return "<span style=\"font-family:"+purify(val)+";\">"+parseText(text.substring(index+1,text.length-7), keepText, ["",""])+"</span>";
}

const align = (text) => {
	//[ali:l|c|r]text or something[/ali]
	let index = text.indexOf(']');
	let attr = purify(text.substring(5,index));
	if(attr.length>1)
		return text;
	return "<div style=\"text-align:"+(attr=='l'?"left":attr=='c'?"center":"right")+";\">"+parseText(text.substring(index+1,text.lastIndexOf('[')),keepText,["",""])+"</div>";
}

const mark = (text) => {
	return "<mark>"+parseText(text.substring(text.indexOf(']')+1,text.lastIndexOf('[')),keepText,["",""])+"</mark>";
}

const quote = (text) => {
	return "<blockquote>"+parseText(text.substring(text.indexOf(']')+1,text.lastIndexOf('[')),keepText,["",""])+"</blockquote>";
}

//LOL, the stupid object that contains the meta-info of all the keywords
const pack = {
	"%(":{endStr:")%", endPos:2, f:keepText},
	"co":{endStr:"[/code]", endPos:7, f:parseCode, nemb:true}, 
	"a:":{endStr:"[/a]", endPos:4, f:parseLink}, 
	"im":{endStr:"[/img]", endPos:6, f:superParseImg}, 
	"re":{endStr:"]", endPos:1, f:parseRef}, 
	"b]":{endStr:"[/b]", endPos:4, f:simpleParse}, 
	"i]":{endStr:"[/i]", endPos:4, f:simpleParse}, 
	"u]":{endStr:"[/u]", endPos:4, f:simpleParse},
	"s]":{endStr:"[/s]", endPos:4, f:simpleParse},
	"si":{endStr:"[/size]",endPos:7,f:setSize},
	"c:":{endStr:"[/c]",endPos:4,f:setColor},
	"fo":{endStr:"[/font]",endPos:7,f:setFont},
	"al":{endStr:"[/ali]",endPos:6,f:align},
	"mk":{endStr:"[/mk]",endPos:5,f:mark},
	"q]":{endStr:"[/q]", endPos:4, f:quote}
	};
