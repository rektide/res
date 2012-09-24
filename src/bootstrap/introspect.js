var introspect= require("introspect")

var MARK= 1

/**
	Monkey-patched container.register which resolves introspection at the end
*/
function _register(key, value, lifecycle){
	var registerReturn= this._introspectRegisterBackup.apply(this,arguments),
	  registration= this.registry[key]
	if(MARK)
		registration._introspected= true
	registration.value.$inject= this._introspectMakeInjects(value)
	return registerReturn
}
exports._register= _register

/**
	monkey-patch a new container.register which will auto-inject arguments
*/
function makeIntrospectService(){
	this._introspectMakeInjects= makeInjects
	this._introspectGetInjections= getInjections
	this._introspectExecService= execService
	this._introspectRegisterBackup= this.register
	this.register= _register
	return this 
}

/**
	Find necessary injections.
	@param fn a function
	@returns an array of all the parameters of the function, plus $injects it has declared
*/
function makeInjects(fn){
	var serviceArgs= introspect(value),
	  existingArgs= registration.value.$inject
	for(var i in serviceArgs){
		serviceArgs[i]= exports._convertArg(serviceArgs[i])
	}
	return serviceArgs.concat(existingArgs)
}
exports.makeInjects= makeInjects

/**
	@param injects a list of things to get
	@param a1..a4 extra params to pass to container.get()
*/
function getInjections(injects){
	var injections= Array(injects.length)
	for(var i= 0; i< injects.length; ++i){
		injections[i]= this.get(injects[i])
	}
	return injections
}
exports.getInjections= getInjections

/**
	Find a service functions full line of injects, pulls down the corresponding injections down from the container, and execute the service function.
	@param fn a service function to execute
	@param a1..a4 extra params to pass to container.get()
*/
function execService(fn,a1,a2,a3,a4){
	var injects= this._introspectMakeInjects(fn),
	  injections= this._introspectGetInjections(this,injects,a1,a2,a3,a4)
	return fn.apply(this,injections)
}
exports.execService= execService


/**
	Convert a function argument into it's Intravenous short-code
	This transforms a _Factory or _f suffix into a !, and a _n suffix into a ? (nullable)
*/
exports._convertArg= function(name){
	var special= /^(.*?)(_(?:f|Factory|n|Nullable))+$/.exec(name)
	if(!special)
		return name
	var decoded= [special[1]],
	  remains= name.substr(decoded.length)
	if(remains.indexOf("_Factory") != -1 || remains.indexOf("_f" != -1))
		decoded.push("!")
	if(remains.indexOf("_Nullable") != -1 || remains.indexOf("_n" != -1))
		decoded.push("?")
	if(remains.indexOf("_Eventual") != -1 || remains.indexOf("_e" != -1))
		decoded.push("#")
	return decoded.join("")
}
