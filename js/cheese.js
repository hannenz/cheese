/**
 * cheese.js
 *
 * @author Johannes Braun <j.braun@agentur-halma.de>
 * @package cheese
 */
$(document).ready(function() {

	var pictures = [];

	var client = new WebSocket( 'ws://127.0.0.1:8084/' );
	var canvas = document.getElementById('videoCanvas');
	var player = new jsmpeg(client, {
		canvas:canvas,
		autoplay:true
	});

	var $preview = $('#js-preview');
	var $thumbsCarousel = $('#js-thumbs');
	var $countdown = $('#js-countdown');
	var $overlay = $('#js-overlay')

	$overlay.on('click', function() {
		$overlay.removeClass('is-active').empty();
	});

	$('#js-cheese-button').on('click', onCheeseButtonClicked);
	$('#js-print-button').on('click', onPrintButtonClicked);
	$('#js-cancel-button').on('click', onCancelButtonClicked);

	var $owl = $('.owl-carousel');

	$owl.owlCarousel({
		items:5,
		margin:10
	});

	// $('#js-preview').on('click', function() {
	// 	console.log('Starting video playback');
	// 	player.play();
	// });

	function previewImage() {

		var $img = $(this).clone();
		$img.removeAttr('style');

		$overlay
			.empty()
			.append($img)
			.addClass('is-active')
		;
	}

	/**
	 * Callback when Chees button has been clicked
	 */
	function onCheeseButtonClicked () {

		takeFoto();

		// $countdown.addClass('is-active');
		// $countdown.on('animationend', function(e){
		// 	$countdown.removeClass('is-active');
		// 	takeFoto();
		// });
	}

	/**
	 * Request foto from server, display it in preview and
	 * update thumbnails history
	 */
	function takeFoto() {
		var img = new Image();
		img.src = canvas.toDataURL();
		var $img = $(img);
		$img.on('click', previewImage);

		$owl.trigger('add', [$img, 0]);
		$owl.trigger('refresh');
	}

	function onPrintButtonClicked () {
		$.get('/cheese.php?action=hardcopy', function(response, status) {
			console.log(status + ',' + response);
		});
	}
	function onCancelButtonClicked () {
		$.get('/cheese.php?action=cancel', function(response, status) {
			console.log(status + ',' + response);
		});
	}
});

