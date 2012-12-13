var _on= false

process.on('USR1',function(){
	_on= !_on
}

function toggleDebugging(){
	process.kill(process.pid, "SIGUSR1")
}


var exports= module.exports= function(){
	
}



function debuggingGenerator(){
	toggleDebugging()
	return
}

