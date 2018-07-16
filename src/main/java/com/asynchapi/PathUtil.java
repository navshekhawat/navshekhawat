package com.asynchapi;

import java.io.File;
import java.nio.file.Paths;

public class PathUtil {

	public static String getCurrentWorkingDirectory(){
		
		return new File(Paths.get(".").toAbsolutePath().normalize().toString()).getName();
	}
}
