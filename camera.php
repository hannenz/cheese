<?php
/**
 * class Camera
 * 
 * Handle interaction with webcam
 * 
 * @author: Johannes Braub <j.braun@agentur-halma.de>
 * @package cheese
 */
namespace HALMA\Cheese;

class Camera {

	/**
	 * path to fswebcam command
	 * @var string
	 */
	protected $fswebcamPath;

	/**
	 * PID of ffmpeg process streaming the webcams video
	 * @var int
	 */
	protected $videoStreamPID;

	public function __construct() {
		$this->fswebcamPath = trim(shell_exec("which fswebcam"));
	}


	/**
	 * takeFoto
	 * 
	 * Takes a foto and returns the binary data
	 * 
	 * @param Array 	Options
	 * 					fields:
	 * 						resolution string 	e.g. "800x600"
	 * 						format string 		"png" or "jpg"
	 * @return mixed 	The binary data of the image or null in case of an error
	 */
	public function takeFoto ($options = array()) {

		// Merge with default options
		$options = array_merge (
			array(
				'resolution' => '19200x1080',
				'format' => 'png'
			),
			$options
		);

		$cmd = sprintf("%s -r \"%s\" -", $this->fswebcamPath, $options['resolution']);
		return shell_exec ($cmd);
	}

	// public function startVideoStream() {
	// 	$this->videoStreamPID = exec("ffmpeg -s 640x480 -f video4linux2 -i /dev/video0 -f mpeg1video -b 800k -r 30 http://127.0.0.1:8082/horst/640/480");
	// }

	// public function stopVideoStream() {
	// 	exec("kill " . $this->videoStreamPID);
	// }
}
