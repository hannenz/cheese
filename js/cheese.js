/**
 * cheese.js
 *
 * @author Johannes Braun <j.braun@agentur-halma.de>
 * @package cheese
 */
$(document).ready(function() {

	var client = new WebSocket( 'ws://127.0.0.1:8084/' );
	var canvas = document.getElementById('videoCanvas');
	var player = new jsmpeg(client, {
		canvas:canvas,
		autoplay:true
	});

	var $preview = $('#js-preview');
	var $thumbsCarousel = $('#js-thumbs');
	var $countdown = $('#js-countdown');

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

	$('.thumb img').on('click', function(ev) {

		// var src = $(this).attr('src');
		// console.log(src);

		// var $previewImage = $('.preview img');
		// if ($previewImage.length > 0){
		// 	$('.preview img').attr('src', src);
		// }
		// else {
		// 	var img = new Image();
		// 	img.src = src;
		// 	$('.preview').append($(img));
		// }
		// $('#filename').attr('value', src);
	});

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
		$owl.trigger('add', [$(img), 0]);
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

