var intravenous= require("intravenous"),
  bootRoot= require("./bootstrap/root"),
  bootModuleAutoloader= require("./bootstrap/module-autoloader"),
  bootIntrospect= require("./bootstrap/introspect")

function create(){
	var container= intravenous.create()
	//root.register("root", bootRoot.makeRootService(root), "singleton")
	root.register("introspect", bootIntrospect.makeIntrospectService(root), "singleton")
	root.register("moduleAutoloader", bootModuleAutoloader.makeAutoloadService(root), "singleton")
	return root
}

var exports= module.exports= create()
create.create= create
