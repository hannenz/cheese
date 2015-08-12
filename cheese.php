<?php
/**
 * class cheese
 * 
 * Main Application class
 * 
 * @author: Johannes Braub <j.braun@agentur-halma.de>
 * @package cheese
 */
namespace HALMA\Cheese;

class Cheese {

	protected $fotodir = 'fotos/';

	/**
	 * Camera object instance
	 * @var Object
	 */
	protected $Camera;

	/**
	 * Request object instance
	 * @var Object
	 */
	protected $Request;

	/**
	 * Response object instance
	 * @var Object
	 */
	protected $Response;


	/**
	 * Constructor
	 * 
	 * @return void
	 */
	public function __construct () {

		// Start a session
		session_start();

		/** Fixme: Autoload! */
		require_once(__DIR__ . DIRECTORY_SEPARATOR . 'camera.php');
		require_once(__DIR__ . DIRECTORY_SEPARATOR . 'request.php');
		require_once(__DIR__ . DIRECTORY_SEPARATOR . 'response.php');

		$this->Request = new Request();
		$this->Response = new Response();
		$this->Camera = new Camera();
	}


	/**
	 * Main dispatcher
	 * 
	 * @return void
	 */
	public function run() {

		/* Only Ajax requests allowed */
		if (!$this->Request->isAjax()) {
			die ('No direct access!');
		}

		/* Check if an action is given */
		if (empty($this->Request->data['action'])) {
			$ret = json_encode(array(
				'success' => false,
				'message' => 'No action specified'
			));
			print_r($ret);
			die();
		}

		/* Dispatch the action */
		switch ($this->Request->data['action']) {
			case 'take_foto':
				$data = $this->Camera->takeFoto();
				if (empty($data)) {
					$this->Response->setError('Failed to take a foto');
				}
				else {
					$this->Response->setPayload($data);
				}
				break;

			case 'hardcopy':
				$this->hardcopy($_POST['filename']);
				break;

			case 'cancel':
				echo "Starting over...";
				die();
				// unset($_SESSION);
				// session_destory();
				break;

			case 'save_picture':
				if (!empty($this->Request->data['imageData'])) {

					$im = imagecreatefromstring(base64_decode(substr($this->Request->data['imageData'], 22)));
					if ($im === false) {
						$this->Response->setError('imagecreatefromstring() failed');
					}
					else {
						$filename = __DIR__ . DIRECTORY_SEPARATOR . 'pictures' . DIRECTORY_SEPARATOR . uniqid() . '.jpg';
						if (!imagejpeg($im, $filename, 100)) {
							$this->Response->setError('imagejpeg() failed');
						}
						else {
							$this->Response->setMessage($filename);
						}
					}
					imagedestroy($im);
				}
				break;

			case 'get_camera_option':
				$attr = $_GET['attr'];
				$val = shell_exec(sprintf('/usr/bin/v4l2-ctl --get-ctrl %s', $attr));
				$this->Response->setMessage($val);
				break;
				
			case 'set_camera_option':
				$attr = $_GET['attr'];
				$value = intval($_GET['val']);
				shell_exec(sprintf('/usr/bin/v4l2-ctl --set-ctrl %s=%d', $attr, $value));
				break;


			// case 'startvideostream':
			// 	$this->Camera->startVideoStream();
			// 	break;

			// case 'stopvideostream':
			// 	$this->Camera->stopVideoStream();
			// 	break;

			default:
				$this->Response->setError('Invalid action: '.$this->Request->data['action']);
		}

		$this->Response->send();
	}

	public function hardcopy($filename) {
		$cmd = sprintf("lpr %s", $filename);
		exec($cmd, $out, $ret);
		if ($ret != 0) {
			$this->Response->setError($cmd . ' failed');
		}
		else {
			$this->Response->setMessage($cmd . ' ok');
		}
	}
}

//start_session();
$cheese = new Cheese();
$cheese->run();
