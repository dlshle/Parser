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
		if (this.head = null) {
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


