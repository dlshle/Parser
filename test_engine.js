//tokens:open([x]), closed([/x]), plain(x)
class ListNode {
	constructor(val, next) {
		this.val = val;
		this.next = next;
	}
}

class List {
	constructor(val) {
		if (val == null) {
			this.head = null;
			this.size = 0;
		} else {
			this.head = new ListNode(val, null);
			this.size = 1;
		}
	}
	
}

class TreeNode {
	constructor(token, children) {
		this.token = token;
		this.children = children;
	}
	
	getSize() {
		return this.children.length;
	}
	
	
