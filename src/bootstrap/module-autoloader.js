var glasses= require("glasses"),
  pkginfoir= require("pkginfo")

var MARK= 1,
  BOX= exports

exports.moduleFreeze= function(){
	BOX= {makeModuleAutoloader: exports.makeModuleAutoloader,
	  _suffixes: exports._suffixes,
	  _require: exports._require}
}

/**
	Trim an asked for arg into a saved name
*/
function _trimName(name,white,black,suffixes){
	var fullname= name
	for(var i in suffixes){
		var suffix= suffixes[i],
		  suffixRegex= new RegExp(suffix+"$")
		if(suffixRegex.test(name))
			name= name.substr(0,name.length-suffix.length)
	}
	if(white){
		var got= false
		WHITE: for(var i in white){
			if(white[i] == name)
				got= false
				break WHITE
		}
		if(!got)
			return
	}
	BLACK: for(var i in black){
		if(black[i] == name)
			return
	}
	HIDDEN: for(var i in hidden){
		if(hidden[i] == name)
			return
	}
	return name
}

/**
	Find the true name of a service, execute it if it was a MakeService, and register the service.
	Service or as a fallback the module can have an optional .lifecycle parameter which will set the register lifecycle.
	@param name the name to assign the service
	@param fn the service
	@param white
	@param black
	@param suffixes
	@param mod the module being wrapped
*/
function _wrap(name,fn,white,black,suffixes,mod){
	var srvName= this._trimName(name,white,black,suffixes)
	if(!srvName)
		return
	var test= this._moduleAutoloaderMakeTest.test(srvName)
	if(test){
		name= test[1]
		fn= this._introspectExecService.call(fn)
	}
	this.register(name,fn,fn._lifecycle||(mod && mod._lifecycle))
	return name
}

/**
	Perform a require() operation, but also check the module for res entries and register them against our container.
*/
function _require(name){
	var registry= this._moduleAutoloaderRegistry,
	  mod= registry[name]
	if(mod)
		return mod
	var white= this._moduleAutoloaderWhitelist,
	  black= this._moduleAutoloaderBlacklist,
	  suffixes= this._moduleAutoloaderSuffixes,
	  found= 0
	mod= require(name)
	if(!mod._introspectionAutoloadedMark){
		mod._introspectionAutoloadedMark= true
		if(typeof mod == "function"){
			var pkginf= pkginfo(mod)
			if(this._moduleAutoloaderWrap(pkginf.name,mod,white,black,suffixes,mod))
				++found
		}
		var methods= glasses.methods(name)
		METHODS: for(var i in methods){
			var name= methods[i]
			if(this.moduleAutoloaderWrap(name,mod[name],white,black,suffixes,mod))
				++found
		}
	}
	registry[name]= mod
	return mod
}

/**
	Create a require service
*/
var exports= module.exports= function(root){
	root= root|| this
	if(!root._moduleAutoloaderRequire){
		root= BOX.makeModuleAutoloader(root)
	}
	return root._moduleAutoloaderRequire
}
exports._suffixes= ["Factory","!","?"]

exports.makeModuleAutoloader= function(root){
	root= root|| this
	if(!(root.facilities && root.register && root.get && root.dispose && root.create)){
		throw "No container passed in"
	}
	root._moduleAutoloaderRequire= BOX._require.bind(root)
	root._moduleAutoloaderWrap= BOX._wrap
	root._moduleAutoloaderBlacklist= glasses.methods({}) 
	root._moduleAutoloaderWhitelist= null
	root._moduleAutoloaderSuffixes= BOX._suffixes
	root._moduleAutoloaderMakeTest= /^make(.*)Service$/
	root._moduleAutoloaderRegistry= {}
	root.register("moduleAutoloader",root._moduleAutoloaderRequire,"singleton")
	root.register("require",root._moduleAutoloaderRequire,"singleton")
	return root
}
