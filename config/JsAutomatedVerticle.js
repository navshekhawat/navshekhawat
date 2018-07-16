var PathUtil = Java.type('com.asynchapi.PathUtil');
var DEV_WORKING_DIRECTORY = 'vertx-js-project';
var DEV_PATH = "config";

//Load Dependencies
load( getCorrectPath('_init_.js') );

//Function to Derive the corect path if DEV or not
function getCorrectPath( fileName ){
	
	if(PathUtil.getCurrentWorkingDirectory().equals( DEV_WORKING_DIRECTORY ))
  		return DEV_PATH + "/" + fileName;	
		
	//Must be running from IDE
	return "../" + DEV_WORKING_DIRECTORY + "/" + DEV_PATH + "/" + fileName;

}