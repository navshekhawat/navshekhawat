package com.asynchapi;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import io.vertx.core.DeploymentOptions;
import io.vertx.core.Launcher;
import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.core.spi.cluster.ClusterManager;
import io.vertx.spi.cluster.hazelcast.HazelcastClusterManager;

/**
 * Hello world!
 *
 */
public class JsAutomatedLauncher extends Launcher {
	
	static final Logger LOG = LoggerFactory.getLogger(JsAutomatedLauncher.class);
	public static void main(String[] args) {
		
		Vertx vertx = Vertx.vertx();
		//deploy(MainVerticle.class, "vertx-js-project");	
		//deployVerticleFromScript("vertx-js-project", "JsAutomatedVerticle.js");
		deployVerticleFromScript("vertx-js-project", JsAutomatedVerticle.class.getSimpleName() + ".js");
	}
	
	private static VertxOptions getCommonVertxOptions(){
		
		VertxOptions vo = new VertxOptions();
		
		ClusterManager clusterManager = new HazelcastClusterManager();			
		vo.setClusterManager(clusterManager);
		
		return vo;
	}
	
	public static void deploy(Class cls, String parentFolderName){
		
		String srcPath = "config";
		String path = getConfigPath(parentFolderName, srcPath);
  		//Check current path

		LOG.info("Deploying from config: " + path + "/" + parentFolderName + ".config.json");
		deploy(cls.getName(), path + "/" + parentFolderName + ".config.json");
	}
	
	public static void deployVerticleFromScript(String parentFolderName, String jsVerticleFilename){
		
		String srcPath = "config";
		String path = getConfigPath(parentFolderName, srcPath);
  		//Check current path

		LOG.info("Deploying from config: " + path + "/" + parentFolderName + ".config.json");
  		
		deploy(path + "/" + jsVerticleFilename, path + "/" + parentFolderName + ".config.json");
  		
	}

	private static String getConfigPath(String parentFolderName, String srcPath) {
		String path = "";
		if(getCurrentWorkingDirectory().equals( parentFolderName ))
	  		path = "config";
		else
			path = "../" + parentFolderName + "/" + srcPath + "/";
		return path;
	}
	
    public static String getCurrentWorkingDirectory(){
		
		return new File(Paths.get(".").toAbsolutePath().normalize().toString()).getName();
	}
    
    public static String getText(String filepath){
		try {
			String response = new String(Files.readAllBytes(Paths.get(new File(filepath).getCanonicalPath())));
			return response;
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
    
    public static void deploy(String mainFile, String configPath){
		
		LOG.info("ConfigPath = " + configPath);

		JsonObject jo = new JsonObject(getText(configPath));	

		Vertx.clusteredVertx( getCommonVertxOptions() , ar -> {						
			
			ar.result().deployVerticle(mainFile, getDeploymentOptions(jo) );
			
		});		
				
	}
	
	private static DeploymentOptions getDeploymentOptions(JsonObject config){
		
		if(!config.containsKey("instances") && !config.containsKey("worker") )
			return new DeploymentOptions().setConfig(config);
		
		if(config.containsKey("instances") && config.containsKey("worker") )
			return new DeploymentOptions().setConfig(config).setInstances(config.getInteger("instances")).setWorker(config.getBoolean("worker"));
		
		if(config.containsKey("instances"))
			return new DeploymentOptions().setConfig(config).setInstances(config.getInteger("instances")) ;
		
		return new DeploymentOptions().setConfig(config).setWorker(config.getBoolean("worker"));
		
	}
}
