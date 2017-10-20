/**
 *将html文件解析成一颗简易的dom树
 */

var DOCUMENTNODE = 0
var ELEMENTNODE = 1
var TEXTNODE = 2

var _id = 0

function Node() {
	this.nodeValue = ''
	this.nodeType = ''
	this.nodeName = ''
	this.id = _id++
		this.childNodes = []
	this.parentNode = ''
	this.expression = ''
}

Node.prototype.appendChild = function(childNode) {
	this.childNodes.push(childNode)
	childNode.parentNode = this
}

Node.prototype.setNodeValue = function(v) {
	this.nodeValue = v
}

Node.prototype.setNodeName = function(v) {
	this.nodeName = v
}

Node.prototype.setExpression = function(exp) {
	this.expression = exp
}

Node.prototype.getElementsByClassName = function(className) {
	var that = this
	var res = []
	that.class&&that.class.split(/\s+/).forEach(function(splited) {
		if (splited === className) {
			res.push(that)
		}
	})
	this.childNodes.map(function(subNode) {
		res = res.concat(subNode.getElementsByClassName(className))
	})
	return res
}

function DocumentNode() {
	this.super()
	this.nodeType = DOCUMENTNODE
}

function ElementNode() {
	this.super()
	this.nodeType = ELEMENTNODE
}

function TextNode() {
	this.super()
	this.nodeType = TEXTNODE
}

function inherit(Child, Parent) {
	function Dummy() {}
	Dummy.prototype = Parent.prototype
	Child.prototype = new Dummy()
	Child.prototype.super = function() {
		Parent.apply(this, arguments)
	}
	Child.prototype.constructor = Child
}

inherit(DocumentNode, Node)
inherit(ElementNode, Node)
inherit(TextNode, Node)

var label = '<[\\s\\S]+?>'
var endLabel = '<\\/[\\s\\S]+?>'
var text = '[^<>]+'
var labelReg = new RegExp(label, 'im')
var endLabelReg = new RegExp(endLabel, 'im')
var textReg = new RegExp(text, 'im')
var tagReg = new RegExp(`${label}|${text}`, 'gim')

var htmlAST = function(html) {
	var root = new DocumentNode()
	var tempO
	var nodeName
	var pointer = root
	var tokens = html.match(tagReg) || []
	console.log(tokens)

	function _process(token) {
		if (isEndTag(token)) {
			pointer = pointer.parentNode
		} else if (isTag(token)) {
			nodeName = (token.match(/<([\s\S]+?)(\s+|>)/) || [])[1]
			if (nodeName) {
				tempO = new ElementNode()
				tempO.setNodeName(nodeName)
				tempO.setExpression(token)
				pointer.appendChild(tempO)
				pointer = tempO
			}
		} else if (!/^[\t\s]+$/.test(token)) {
			pointer.setNodeValue(token)
		}
	}
	tokens.forEach(_process)
	console.log(root)
	return root
}


function isTag(exp) {
	return labelReg.test(exp)
}

function isEndTag(exp) {
	return endLabelReg.test(exp)
}


var attrParser = function(node) {
	var exp
	var attrExps
	var attrName
	var attrValue
	var attr
	var real = ''
	if (node.nodeType === ELEMENTNODE) {
		exp = node.expression
		if (exp) {
			exp = exp.replace(/^<|>$/gim, '')
			attrExps = exp.split(/\s+/)
			attrExps.shift()
			attrExps.reverse()
			attrExps.forEach(function(fake) {
				real = fake + " " + real
				if (/=/.test(real)) {
					_process(real.replace(/\s+$/, ''))
					real = ''
				}
			})
		}
	}
	node.childNodes.map(function(subNode) {
		attrParser(subNode)
	})

	function _process(attrExp) {
		attr = attrExp.split('=')
		attrName = attr.shift()
		attrValue = attr.join('=') || ''
		if (attrName) {
			node[attrName] = attrValue.replace(/^["'`]|["'`]$/g, '')
		}
	}
	return node
}

htmlAST.DOCUMENTNODE = DOCUMENTNODE
htmlAST.ELEMENTNODE = ELEMENTNODE
htmlAST.TEXTNODE = TEXTNODE
htmlAST.attrParser = attrParser



/**
 *简易测试
 */

var html = `
     <html>
       <head>
         <title>html ast parser</title>
       </head>
       <body>
         <div class="header box" id="h">header</div>
         <div class="container">
            <p>I am container</p>
            <a href="https://v.qq.com"><img src=""></img></a>
         </div>
         <div class="footer">footer</div>
       </body>
     </html>
`

var ast = htmlAST(html)
htmlAST.attrParser(ast)

console.log(ast.getElementsByClassName('header'))