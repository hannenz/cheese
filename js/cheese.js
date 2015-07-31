/**
 * cheese.js
 *
 * @author Johannes Braun <j.braun@agentur-halma.de>
 * @package cheese
 */
$(document).ready(function() {

	var video = document.querySelector('#video');
	var canvas = document.querySelector('#canvas');
	var ctx = canvas.getContext('2d');

	var webcamStream = null;

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	if (navigator.getUserMedia && true) {
		navigator.getUserMedia(
			{
				audio : false,
				video : {
					mandatory : {
						minWidth:1920,
						minHeight:1080
					}
				}
			},
			function(stream) {
				webcamStream = stream
				video.src = window.URL.createObjectURL(stream);
			},
			function(err) {
				alert ('Video error!');
				console.log(err);
			}
		);
	}
	else {
		console.log ('getUserMedia seems not to be supported!');
	}


	var $preview = $('#js-preview');
	var $thumbsCarousel = $('#js-thumbs');
	var $countdown = $('#js-countdown');
	var $overlay = $('#js-overlay')

	$countdown.on('animationend', function() {
		$countdown.removeClass('is-active');
		takeFoto();
	});


	$overlay.on('click', function() {
		$overlay.removeClass('is-active').empty();
	});

	$('#js-cheese-button').on('click', onCheeseButtonClicked);
	$('#js-print-button').on('click', onPrintButtonClicked);
	$('#js-cancel-button').on('click', onCancelButtonClicked);

	var $owl = $('.owl-carousel');

	$owl.owlCarousel({
		items:3,
		margin:10
	});

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
	 * Callback when Cheese button has been clicked
	 */
	function onCheeseButtonClicked () {
		// srart countdown, then...

		$countdown.addClass('is-active');

	}

	/**
	 * Request foto from server, display it in preview and
	 * update thumbnails history
	 */
	function takeFoto() {
		if (webcamStream != null) {

			ctx.drawImage(video, 0, 0);

			var ribbonImg = new Image();
			ribbonImg.onload = function() {

				ctx.drawImage(ribbonImg, 1600, 0);

				var img = new Image();
				var dataURL = canvas.toDataURL('image/png');
				img.src = dataURL;

				var $img = $(img);
				$img.on('click', previewImage);

				$owl.trigger('add', [$img, 0]);
				$owl.trigger('refresh');
				$owl.trigger('to', [0, 400]);

				$.ajax(
					{
						type : 'POST',
						url : 'cheese.php?action=save_picture',
						data : {
							imageData : dataURL
						},
					},
					function(response) {
						console.log(response);
					}
				);
			}
			ribbonImg.src = 'img/ribbon.png';
		}
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

