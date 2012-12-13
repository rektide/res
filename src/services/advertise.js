var mdns = require("mdns")

function makeAdvertiseService(root){
	root= root|| this
	
}

exports.makeAdvertiseService= makeAdvertiseService


process.exit("")



var ad = mdns.createAdvertisement(mdns.tcp('http'), 4321)
ad.start()

// watch all http servers
var browser = mdns.createBrowser(mdns.tcp('http'))
browser.on('serviceUp', function(service) {
  console.log("service up: ", service)
});
browser.on('serviceDown', function(service) {
  console.log("service down: ", service);
});
browser.start();

// discover all available service types
var all_the_types = mdns.browseThemAll(); // all_the_types is just another browser...
