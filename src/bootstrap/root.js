/*
function _returnRoot(){
	return this._root
}

function makeRootService(root){
	root= root||this
	this._root= root|| intravenous.create()
	return _returnRoot.bind(this)
}
*/

function identity(io){
	return io
}

function makeRootService(root){
	return identity.bind(null,root)
}

module.exports.makeRootService= makeRootService
