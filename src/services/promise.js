var Q= require("q")

/**
	Registration still awaiting resolve/reject.
*/
function deferRegistration(container, key){
	return { key: key,
	  container: this,
	  value: Q.defer(),
	  lifecycle: "defer"
	}
}

function _beforeResolve(container, key, reg){
	val= reg&& reg.value
	if(val){
		if(!val.promise)
			return { handled: false }
		else
			return { handled: true,
			  data: val.promise }
	}
	var reg= this.registry[key]= deferRegistration(container, key)
	return { handled: true,
	  data: reg.value.promise }
}

/**
	Facility to set up deferRegistrations for all unresolved container.get(key)'s.
*/
var deferFacility= {
	suffixes: ["Eventual","#"],
	beforeResolve: _beforeResolve }

function _generate(){
	return this.container.get(this.key)
}

/**
	Resolve an old deferred registration with the new value from the registry.
*/
function _resolveReg(){
	var defer= this.value,
	  container= this.container,
	  key= this.key,
	  newReg= container.registry[key]
	if(newReg.lifecycle == "unique"){
		return defer.resolve(generate.bind(this))
	}else{
		var val= _generate.call(this)
		if(val instanceof Error)
			return defer.reject(val)
		else
			return defer.resolve(val)
	}
}
	
/**
	Register function that satisfies & clears out deferreds when their key is registered.
*/
function register(key, value, lifecycle){
	var reg= this.registry[key]
	if(reg.lifecycle= "defer"){
		process.nextTick(resolve.bind(reg))
		delete this.registry[key]
	}
	return this._promiseRegisterBackup(key, value, lifecycle)
}
exports.register= register

/**
	Retrieve all injections, while converting deferreds into promises
*/
function getInjections(injects){
	var injections= Array(injects.length)
	for(var i= 0; i< injects.length; ++i){
		var val= this.get(injects[i])
		injections[i]= val.promise|| val
	}
	return injections
}
exports.getInjections= getInjections

/**
	Return a value, or a promise to run the function when satisfied.
*/
function _when(val){
	if(fn instanceof Function){
		var injects= this._introspectGetInjections(val)
		return Q.all(injects).then(this._introspectExecService.bind(this,val))
	}
	return val

}
exports._when= _when

/**
	Return a promise for a service that will run when it's injections can be satisfied.
*/
function getWhen(fn){
	if(fn instanceof String){
		var reg = this.registry[fn]
		if(!reg){
			// create registry entry
		}else if(reg.lifecycle == "defer"){
			return reg.value.promise.then(_when)
		}else{
			return _when(reg.value)
		}
	}else if(fn instanceof Function){
		return _when(fn)
	}else{
		throw "Unknown getWhen parameter type "+(typeof fn)
	}
}
exports.getWhen= getWhen

/**
	Make promise service installs the promise monkey-patch into a container
*/
function makePromiseService(root){
	root= root|| this
	if(this._promiseService)
		return root
	//this.register("promise",promiseService.bind(this),"singleton")
	this.facilities["promise"]= deferFacility
	this._introspectGetInjections= getInjections
	this._promiseRegisterBackup= this.register
	this.register= register
	this.when= when
	this.getWhen= getWhen
	return this
}
exports.makePromiseService= makePromiseService
