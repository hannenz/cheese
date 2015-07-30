<?php
/**
 * class request
 * 
 * Handle Ajax requests
 * 
 * @author: Johannes Braub <j.braun@agentur-halma.de>
 * @package cheese
 */
namespace HALMA\Cheese;

class Request {
	
	/**
	 * POST and GET vars
	 * @var Array
	 */
	public $data;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->data = $_REQUEST;
	}

	/**
	 * isAjax
	 * 
	 * @return boolean
	 */
	public function isAjax() {
		return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
	}
}
?>