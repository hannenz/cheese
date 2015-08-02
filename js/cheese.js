(function(doc, nav){
	console.debug(doc);
	console.debug(nav);
})(document, navigator);


/**
 * cheese.js
 *
 * @author Johannes Braun <j.braun@agentur-halma.de>
 * @package cheese
 */
$(document).ready(function() {

	// HiRes picture resolution (depends on the webcam)
	var pictureWidth = 1280;
	var pictureHeight = 720;

	var video = document.getElementById('video');
	var canvas = document.getElementById('canvas');

	var flashMessage = document.getElementById('js-flash-message');
	flashMessage.addEventListener('click', function(ev){
		this.classList.add('is-hidden');
	});

	// Set canvas dimensions to (hires) picture size
	canvas.style.width = pictureWidth + 'px';
	canvas.style.height = pictureHeight + 'px';

	var webcamStream = null;

	// Setup video stream
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	if (navigator.getUserMedia && true) {
		navigator.getUserMedia(
			{
				audio : false,
				video : {
					mandatory : {
						// minWidth:1920,
						// minHeight:1080
						minWidth: pictureWidth,
						minHeight: pictureHeight
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
		setFlashMessage('Camera initialized successfully', 'success');
	}
	else {
		console.log ('getUserMedia seems not to be supported!');
		setFlashMessage('Could not access camera', 'error');
	}


	var $countdown = $('#js-countdown');
	var $overlay = $('#js-overlay')

	$countdown.on('animationend', function() {
		$countdown.removeClass('is-active');
		takePicture();
	});


	$overlay.on('click', function() {
		$overlay.removeClass('is-active').empty();
	});

	$('#js-cheese-button').on('click', onCheeseButtonClicked);
	$('#js-print-button').on('click', onPrintButtonClicked);
	$('#js-cancel-button').on('click', onCancelButtonClicked);
	$('#js-mirror-button').on('click', onMirrorButtonClicked);

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
	 * Take a foto
	 */
	function takePicture() {
		if (webcamStream == null) {
			return false;
		}

		// Capture frame from video into canvas
		var ctx = canvas.getContext('2d');

		// mirror canvas if video element is mirrored
		if (video.classList.contains('is-mirrored')){
			ctx.translate(pictureWidth, 0);
			ctx.scale(-1, 1);
		}
		ctx.drawImage(video, 0, 0);

		// Add layers for »fun«
		addLayers(ctx);

		// Create dataURL (base64 encoded string)
		var img = new Image();
		var dataURL = canvas.toDataURL('image/png');
		

		// Send picture to server
		$.ajax(
			{
				type : 'POST',
				url : 'cheese.php?action=save_picture',
				data : {
					imageData : dataURL
				},
				success : function(response, textStatus, jqXHR) {
					var r = JSON.parse(response);
					console.debug(r);
					if (r.error) {
						console.error('Picture could not been saved!');
						console.debug (r);
					}

					img.src = dataURL;
					var $img = $(img);
					$img.on('click', previewImage);

					// Add image to thumbnail history
					$owl.trigger('add', [$img, 0]);
					$owl.trigger('refresh');
					$owl.trigger('to', [0, 400]);
				},
				error : function(jqXHR, textStatus) {
					console.error('Ajax request failed: ' + text.status);

				}
			}
		);
	}

	function addLayers(ctx) {
		var layers = [
			{
				type : 'image',
				image : 'img/ribbon.png',
				position : [1600, 0]
			},
			{
				type : 'text',
				text : 'Hello, World..!',
				color : '#fff',
				position : [500, 500]
			}
		];

		for (var i = 0; i < layers.length; i++) {
			var layer = layers[i];
			switch (layer.type) {
				case 'image':
					var img = new Image();
					img.onload = function() {
						ctx.drawImage(img, layer.position[0], layer.position[1]);
					};
					img.src = layer.image;
//					addImageLayer(ctx, layer.image, layer.position);
					break;
				case 'text':
					addTextLayer(ctx, layer.text, layer.color);
					break;
				default:
					break;
			}
		}
	}

	function addImageLayer(ctx, image, pos) {

 
	}

	function addTextLayer(ctx, text, color) {

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

	function onMirrorButtonClicked() {
		video.classList.toggle('is-mirrored');
	}

	function setFlashMessage(mssg, type) {

		flashMessage.textContent = mssg;
		flashMessage.removeAttribute('class');

		switch (type) {
			case 'error':
				flashMessage.classList.add('flash-error');
				break;
			case 'warning':
				flashMessage.classList.add('flash-alert');
				break;
			case 'success':
				flashMessage.classList.add('flash-success');
				break;
			default:
				flashMessage.classList.add('flash-notice');
				break;
		}

		flashMessage.classList.remove('is-hidden');
		setTimeout(function() {
			flashMessage.classList.add('is-hidden');
		}, 3000);
	}

});

