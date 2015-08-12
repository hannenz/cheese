<?php
/**
 * class reponse
 * 
 * Handle Ajax response
 * 
 * @author: Johannes Braub <j.braun@agentur-halma.de>
 * @package cheese
 */
namespace HALMA\Cheese;

class Response {
	
	/**
	 * @var Array
	 * 
	 * fields:
	 * error bool 		whether an error occured
	 * message string 	error message, if any
	 * payload string 	base64encoded data
	 */
	protected $data;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->data['error'] = false;
		$this->data['message'] = '';
		$this->data['payload'] = null;
	}

	/**
	 * setError
	 * 
	 * @param string  	The error message
	 * @return void
	 */
	public function setError($message) {
		$this->data['error'] = true;
		$this->data['message'] = $message;
	}

	/**
	 * clearError
	 * 
	 * @return void
	 */
	public function clearError() {
		$this->data['error'] = false;
		$this->data['message'] = '';
	}

	/**
	 * setMessage
	 * 
	 * @param string  	The message
	 * @return void
	 */
	public function setMessage($message) {
		$this->data['message'] = $message;
	}

	/**
	 * setPayload
	 * 
	 * @param mixed 	The data to pass
	 * @return void
	 */
	public function setPayload($payload) {
		$this->data['payload'] = base64_encode($payload);
	}

	/**
	 * clearPayload
	 * 
	 * @return void
	 */
	public function clearPayload() {
		$this->data['payload'] = null;
	}

	/**
	 * send
	 * 
	 * Send the request back via Ajax
	 * 
	 * @return boolean 	success
	 */
	public function send() {
		$response = json_encode($this->data);
		if ($response !== FALSE){
			echo $response;
			return true;
		}
		return false;
	}
}