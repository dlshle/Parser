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
		return size == 0;
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
		this.content = content;
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

class Parser {
	//TODO:
	//pre_reg is the str, post_reg is the str, both is for the real regex
	constructor (original, mPack) {
		this.original = original;
		this.mPack = mPack;
		//build regex
		//this.regex = 
		//tokenize
		//this.tokens = tokenize(original)
		//stack algo
	}

	//tokenize classifies tokens in the text by checking if a token is a tag or a pure text
	//matches = str.match(regex); matches = ["xx", "x*", "x.x"]...
	//matches would be an array of every open and close tags
	tokenize () {
		let tokens = new Stack();
		let last = 0;
		let index = -1
		let text = "";
		while ((match = this.regex.exec(this.original)) != null) {
			index = match.index;
			text = this.original.substring(last, index);
			last = index + match.length;
			if (text.length > 0)
				tokens.push(text);
			tokens.push(match);
		}
		return tokens;
	}

	parse (tokens) {

	}
}

//a markdown language usually contains normal texts and tags. A tag maps a function from one markdown language to another.
//a mapping pack describes how tags in a markdown language behaves and defines the mapping function of each tag. 
//usually, a parser is constructed with the original markdown text and a mapping pack along with mapping functions, and then it generates one regex that contains all the open tags and close tags.
//after that, it will call the tokenizer that tokenizes the original text and then the parser will be initiated and uses a stack to parse and convert the original text to the desired markdown text.
//
//in the mapping pack, a open tag has three elements, e(end with), r(recursive folding(recursively convert inner nodes)), f(converting or mapping fucntion)
var eb2h = {
	"[b]": {e: "[/b]", r: true, f: bold},
	"[i]": {e: "[/i]", r: true, f: italic}, 
	"[u]": {e: "[/u]", r: true, f: underline}, 
	"[q]": {e: "[/q]", r: true, f:quote}
};
