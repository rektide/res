function makeRootService(root){
	if(!(rootService instanceof rootService)){
		return new rootService(root)
	}
	this._root= root|| intravenous.create()
	this._returnRoot= function(){
		return this._root
	}
	return this._returnRoot.bind(this)
}
module.exports.makeRootService= makeRootService
