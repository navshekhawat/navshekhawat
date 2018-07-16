var PathUtil = Java.type('com.asynchapi.PathUtil');
var InetAddress = Java.type('java.net.InetAddress');
var DEV_WORKING_DIRECTORY = 'vertx-js-project';
var CONFIG_FILE = 'vertx-js-project.config.json';
var DEV_PATH = "config";

var map = {};
var errorMap = {};
var campaignErrorMap = {};

//load("./webroot/lib/*.js");

//Function to Derive the corect path if DEV or not
function getCorrectPath( fileName ){
	
	if(PathUtil.getCurrentWorkingDirectory().equals( DEV_WORKING_DIRECTORY ))
  		return DEV_PATH + "/" + fileName;	
		
	//Must be running from IDE
	return "../" + DEV_WORKING_DIRECTORY + "/" + DEV_PATH + "/" + fileName;

}

var mainStackMap = {};

function loadMainStackMap(sessionId, testLocation, testId){
    console.log("--Inside mainDataStack start--");
    
    var uniqueId = String(sessionId+testLocation+"_"+testId);
    console.log("--uniqueId in mainDataStack--"+uniqueId);
    
    mainStackMap[ uniqueId ] = {
		sessionId: sessionId,
		testLocation: testLocation,
		testId: testId,
		status: undefined,
		uniqueId: uniqueId
	}
    console.log("mainStackMap-->"+mainStackMap);
    console.log("--Inside mainDataStack end--");
}


//Load Config files
var config =  vertx.fileSystem().readFileBlocking( getCorrectPath( CONFIG_FILE ) ) ;
//Load Global Variables
var configJSON = JSON.parse(config.toString());
console.log("Hostname from Config file: "+configJSON.hostname );
console.log("Port from Config file: "+configJSON.port )

//Load Dependencies if required

var Vertx = require("vertx-js/vertx");
//Load Eventbus
var eb = vertx.eventBus();

var server = vertx.createHttpServer();

// Route Matcher
var route = require("vertx-web-js/route");
var SockJSHandler = require("vertx-web-js/sock_js_handler");

var StaticHandler = require("vertx-web-js/static_handler");
var BodyHandler = require("vertx-web-js/body_handler");

var html = '<link rel="stylesheet" href="https://goo.gl/fUS2lx">'
    + '<h1 style="color:navy;position:relative;top:50%;transform:translateY(-50%);"'
    + 'align="center" class="animated infinite rubberBand">My Vertx JS!!</h1>';

	var Router = require("vertx-web-js/router");
	var router = Router.router(vertx);
	
	router.route().handler(StaticHandler.create().handle);
	router.route().handler(BodyHandler.create().handle);


	var router = Router.router(vertx);

	router.route('/base').handler(function (routingContext) {
		console.log("Inside base route")
		var html = '<link rel="stylesheet" href="https://goo.gl/fUS2lx">'
	    + '<h1 style="color:navy;position:relative;top:50%;transform:translateY(-50%);"'
	    + 'align="center" class="animated infinite rubberBand">My first Vertx JS Verticle!!</h1>';

	  // This handler will be called for every request
	  var response = routingContext.response();
	  response.putHeader("content-type", "text/html");
	  // Write to the response and end it
	  response.end(html);
	  
	});
	
	router.route('/run/:sessionID/:testLocation/:testId').handler(function (routingContext) {
		
		//Load the requests in data structure
		console.log("--Before calling loadMainStackMap--");
		loadMainStackMap(routingContext.pathParam('sessionID'), routingContext.pathParam('testLocation'), routingContext.pathParam('testId'));
		console.log("--After calling loadMainStackMap--");

		console.log("--Before calling processMessagesFromStack--");
		processMessagesFromStack();
		console.log("--After calling processMessagesFromStack--");

	});

	
	
	server.requestHandler(router.accept).listen(configJSON.port);

	print('Go to http://localhost:8085!');
	
	function processMessagesFromStack(){
		
		console.log("--Inside processMessagesFromStack start--");
		
		for( var j in mainStackMap ){
			//console.log("UniqueId from mainStackMap-->"+mainStackMap[j].uniqueId);
			if(mainStackMap[j].status == undefined && mainStackMap[j].status != 'In-Progress'){
				console.log("UniqueId from mainStackMap-->"+mainStackMap[j].uniqueId);
				mainStackMap[j].status = 'In-Progress';
				eb.send("messages.automated", mainStackMap[j], function (ar, ar_err) {
				  if (ar_err == null) {
					  console.log("Received reply: " + ar.body());
				  }
				});
			    console.log("status from mainStackMap-->"+mainStackMap[j].status);
			}
		}
		console.log("--Inside processMessagesFromStack end--");
		
	}

	eb.consumer("messages.automated", function (message) {
		if(message.body().status == 'In-Progress'){
		  console.log("I have received a message: " + message.body());
		  
		  var map = message.body();
		  console.log("map.uniqueId-->"+map.uniqueId);
		  console.log("map.testLocation-->"+map.testLocation);
		  console.log("map.testId-->"+map.testId);
//		  var runner = new TestRunner(map.sessionId, map.testId, map.testLocation);
//		  runner.run(map.testLocation, map.testId);
		  // TestRunner is the main java script file which forms a stack by loading the another javascript files internally which has steps of execution and business
		  // logic which internally call SOAP services and they are blocking calls.
		}

		  
	});

