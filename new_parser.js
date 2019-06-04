class Stack {
	constructor(list) {
		this.head = null;
		this.size = 0;
		if (list != undefined) {
			for (let i in list) {
				this.push(i);
			}
		}
	}

	push(val) {
		if (this.head == null) {
			this.head = new Node(val, null);
		} else {
			let temp = this.head;
			let node = new Node(val, temp);
			this.head = node;
		}
		this.size ++;
	}
	
	peek() {
		if (this.size == 0)
			return null;
		return this.head.val;
	}

	pop() {
		if (this.size == 0)
			return null;
		let temp = this.head;
		this.head = this.head.next;
		this.size --;
		return temp.val;
	}
	
	isEmpty() {
		return this.size == 0;
	}
}

class Node {
	constructor(val, next) {
		this.val = val;
		this.next = next;
	}
}

//pNode is a parserNode that contains information of a certain node at the parsing tree
class pNode {
	constructor (type, content, children) {
		this.children = (children != undefined ? new Stack(children) : new Stack());
		this.type = type;
		this.content = content;//for tags, content={o:xx, c:xx}
	}

	addChildren (children) {
		if (!(children && typeof children === 'object' && children.constructor === Array)) {
			console.error("children is not an array.\nThe parameter for addChildren of pNode should be an array of pNodes.");
		}

		for (let i = 0; i < children.length; i++) {
			this.children.push(children[i]);
		}
	}

	addChild (child) {
		if (!(child && typeof child === "object" && child.constructor === pNode))
			console.error("child is not an pNode object.\nThe parameter for addChild of pNode should be of pNode object.");
		this.children.push(child);
	}
}

//makeRegex makes the regex pack for the mPack
function makeRegex (mPack) {
	let regex = "";
	let openTags = "";
	let closeTags = "";
	for (e in mPack) {
		//push a "\" infromt of special chars
		let s = generateRegStr(mPack[e].s);
		e = generateRegStr(e);
		closeTags += ("(" + e + ")" + "|");
		openTags += ("(" + s + ")" + "|");
		regex += "(" + e + ")|" + "(" + s + ")|";
	}
	//to remove the last |s
	closeTags = closeTags.substring(0, closeTags.length - 1);
	openTags = openTags.substring(0, openTags.length - 1);
	regex = regex.substring(0, regex.length - 1);	
	return {o:new RegExp(openTags, "g"), c:new RegExp(closeTags, "g"), r:new RegExp(regex, "g")};
}

function generateRegStr (s) {
	let result = "";
	let special = "()[]{}\"\'\\/";
	for (var i = 0; i < s.length; i++) {
		if (special.includes(s.charAt(i)))
			result += "\\" + s.charAt(i);
		else
			result += s.charAt(i);
	}
	return result;
}	

class Parser {
	//TODO:
	//pre_reg is the str, post_reg is the str, both is for the real regex
	constructor (original, mPack) {
		this.original = original;
		this.mPack = mPack;
		let regexs = makeRegex(mPack);
		//build regex
		this.openTags = regexs.o;
		this.closeTags = regexs.c;
		this.regex = regexs.r;
		//tokenize
		let tokens = this.tokenize(this.original);
		//stack algo
		this.tree = this.buildParsingTree(tokens);
		

		
	}

	//tokenize function classifies tokens in the text by checking if a token is a tag or a pure text
	//matches = str.match(regex); matches = ["xx", "x*", "x.x"]...
	//matches would be an array of every open and close tags
	tokenize () {
		let tokens = new Stack();
		let last = 0;
		let index = -1
		let text = "";
		let match = null;
		while ((match = this.regex.exec(this.original)) != null) {
			index = match.index;
			text = this.original.substring(last, index);
			last = index + match[0].length;
			if (text.length > 0)
				tokens.push({type:"text", content:text});
			tokens.push({type:(this.isOpenTag(match[0])?"open":"close"), content:match[0]});
		}
		//in the tokens stack, the object is modeled as {type:"text""open"/"close", content:"content"}
		return tokens;
	}

	buildParsingTree (tokens) {
		let root = new pNode("root", null);
		while (!tokens.isEmpty()) {
			let token = tokens.peek();
			//check if curr is an ending tag
			if (token.type === "close") {
				root.addChild(this.makeTagNode(tokens));
			} else if (token.type === "text") {
				root.addChild(new pNode("text", token.content));
				tokens.pop();
			} else {
				// shouldn't have an unclosed open tag here alone
				console.log("ERROR: unclosed tag spotted!\nThis tag will be regarded as a text.");
				root.addChild(new pNode("text", token.content));
				tokens.pop();
			}
		}
		return root;
	}

	//make a pNode on the closed tag(top of stack)
	makeTagNode (tokens) {
		let token = tokens.pop();
		let recursive = this.mPack[token.content].r;
		let target = this.mPack[token.content].s;
		let root = new pNode("tag", {o:null, c:token.content});
		while (!tokens.isEmpty()) {
			let curr = tokens.pop();
			if (curr.type === "open" && curr.content === target) {
				//found the corresponding open tag
				root.content.o = curr.content;
				break ;
			}
			if (curr.type === "text") 
				root.addChild(new pNode("text", curr.content));	
			else if (curr.type === "close") {
				if (recursive) {
					tokens.push(curr);
					root.addChild(this.makeTagNode(tokens));
				} else {
					root.addChild(new pNode("text", curr.content));
				}
			} else {
				//must be an open node
				if (recursive) {
					//shouldn't have an unclosed open tag here
					console.log("ERROR: unclosed tag spotted!\nThis tag will be regarded as a text.");
					root.addChild(new pNode("text", token.content));
				} else {
					root.addChild(new pNode("text", token.content));
				}
			}
		}
		if (!root.content.o) {
			//if this tag is unmatched, convert it to the text node
			root.type = "text";
			root.content = root.content.c;
		}
		return root;
	}

	isOpenTag (token) {
		let result = this.openTags.exec(token) == null?false:true;
		this.openTags.lastIndex = 0;
		return result;
	}

	isCloseTag (token) {
		let result = this.closeTags.exec(token).length == null?false:true;
		this.closeTags.lastIndex = 0;
		return result;
	}

	expandTree (pNode root) {
		console.log(root.content);
		let cStack = root.children;
		let head = cStack.head;
		//TODO: this function expands the tree
	}

}

function simpleReplace(o, c, t) {
	return o.substring(1, o.lastIndexOf("]")) + t + c.substring(1, c.lastIndexOf("]"));
}

function bold(open, close, text) {
	return simpleReplace(open, close, text);
}

function italic(open, close, text) {
	return simpleReplace(open, close, text);
}

function underline(open, close, text) {
	return simpleReplace(open, close, text);
}

function quote(open, close, text) {
	return simpleReplace(open, close, text);
}

//a markdown language usually contains normal texts and tags. A tag maps a function from one markdown language to another.
//a mapping pack describes how tags in a markdown language behaves and defines the mapping function of each tag. 
//usually, a parser is constructed with the original markdown text and a mapping pack along with mapping functions, and then it generates one regex that contains all the open tags and close tags.
//after that, it will call the tokenizer that tokenizes the original text and then the parser will be initiated and uses a stack to parse and convert the original text to the desired markdown text.
//
//in the mapping pack, a open tag has three elements, s(start with), r(recursive folding(recursively convert inner nodes)), f(converting or mapping fucntion)
//f should take 3 params open, close, content
var eb2h = {
	"[/b]": {s: "[b]", r: true, f: bold},
	"[/i]": {s: "[i]", r: true, f: italic}, 
	"[/u]": {s: "[u]", r: true, f: underline}, 
	"[/q]": {s: "[q]", r: true, f:quote}
};
