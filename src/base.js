var intravenous= require("intravenous"),
  bootRoot= require("bootstrap/root"),
  bootModuleAutoloader= require("bootstrap/module-autoloader"),
  bootIntrospect= require("bootstrap/introspect")

var _root= intravenous.create()
_root.register("root", bootRoot.makeRootService(_root), "singleton")
_root.register("introspect", bootIntrospect.makeIntrospectService(_root), "singleton")
_root.register("moduleAutoloader", bootModuleAutoloader.makeAutoloadService(_root), "singleton")

var exports= module.exports= _root
