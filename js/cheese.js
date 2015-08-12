/**
 * cheese.js
 *
 * @author Johannes Braun <j.braun@agentur-halma.de>
 * @package cheese
 */
$(document).ready(function() {

	// HiRes picture resolution (depends on the webcam)
	var pictureWidth = 1920;
	var pictureHeight = 1080;

	var video = document.getElementById('video');

	var canvas = document.createElement('canvas');
	canvas.setAttribute('width', pictureWidth);
	canvas.setAttribute('height', pictureHeight);
	canvas.style.display = 'none';
	canvas.style.width = pictureWidth + 'px';
	canvas.style.height = pictureHeight + 'px';
	canvas.style.backgroundColor = 'gainsboro';
	document.body.appendChild(canvas);

	$('#controls input[type=range').on('input', updateSetting);
	$('#controls input[type=checkbox]').on('change', updateSetting);

	function updateSetting(ev) {
		var attribute = $(this).attr('id');
		var value = this.value;

		$.get('cheese.php?action=set_camera_option&attr=' + attribute + '&val=' + value);
	}

	// Reset inputs to the camera's current settings
	$('#controls input').each(function(i, el){
		var $el = $(el);

		$.get('cheese.php?action=get_camera_option&attr=' + $el.attr('id'), function(response) {
			var r = JSON.parse(response);
			var v = parseInt(r.message.match(/([0-9]+)/)[0]);
			console.log(v);
			$el.val(v);
		});
	});

	var flashMessage = document.getElementById('js-flash-message');
	flashMessage.addEventListener('click', function(ev){
		this.classList.add('is-hidden');
	});

	// Set canvas dimensions to (hires) picture size

	var webcamStream = null;

	// Setup video stream
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	if (navigator.getUserMedia) {
		navigator.getUserMedia(
			{
				audio : false,
				video : {
					mandatory : {
						minWidth: pictureWidth,
						minHeight: pictureHeight
					}
				}
			},
			function(stream) {
				webcamStream = stream
				video.src = window.URL.createObjectURL(stream);
				video.addEventListener('timeupdate', function onTimeupdate(event){

					if (event.target.videoWidth && event.target.videoHeight) {
						videoWidth = event.target.videoWidth;
						videoHeight = event.target.videoHeight;
						video.removeEventListener('timeupdate', onTimeupdate, false);
						console.log('The video stream\'s size is: ' + videoWidth + 'x' + videoHeight);
					}
				}, false);
			},
			function(err) {
				setFlashMessage('Could not get video stream: ' + err.name, 'error');
			}
		);
	}
	else {
		console.log ('getUserMedia seems not to be supported!');
		setFlashMessage('Camera access is not supported', 'error');
	}

	var $countdown = $('.countdown').first();
	var $overlay = $('#js-overlay')

	$('.numbers').first().on('animationend', function() {
		console.log('animation ended');
		$countdown.removeClass('is-active');
		takePicture();
	});

	$overlay.on('click', function() {
		$overlay.removeClass('is-active').empty();
	});


	document.addEventListener('keyup', function(ev) {
		switch (ev.keyCode ){
			case 32:
			case 13:
				onCheeseButtonClicked();
		}
	});
	$('#js-cheese-button').on('click', onCheeseButtonClicked);
	$('#js-print-button').on('click', onPrintButtonClicked);
	$('#js-cancel-button').on('click', onCancelButtonClicked);
	$('#js-mirror-button').on('click', onMirrorButtonClicked);
	$('#js-mirror-checkbox').on('change', onMirrorCheckboxChanged);
	$('#js-settings-button').on('click', onSettingsButtonClicked);
	$('#js-reset-settings').on('click', onSettingsResetButtonClicked);


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

		if ($countdown.length > 0){
			$countdown.addClass('is-active');
		}
		else {
			takePicture();
		}
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

		ctx.drawImage(video, 0, 0, pictureWidth, pictureHeight);

		// Add layers for »fun«
		//addLayers(ctx);

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

					var filename = r.message;

					if (confirm('Möchten Sie dieses Foto drucken?')) {
						$.post('cheese.php?action=hardcopy', { filename : filename});
					}
				},
				error : function(jqXHR, textStatus) {
					console.error('Ajax request failed: ' + text.status);

				}
			}
		);
	}

	/**
	 * Talke a foto / variant
	 *
	 * Stop webcam stream, call php script to take a single foto from cli with fswebcam
	 * Might be better quality than capturing from the webcam video stream,
	 * but it turned out that both methods seem to be equal. regarding the resulting picture's quality
	 */
	function takePicture2() {

		// Stop webcam's video stream
		webcamStream.getVideoTracks()[0].stop();
		webcamStream.stop();

		// Give the hardware a short moment to release
		setTimeout(function() {
			// Capture frame from video into canvas
			var ctx = canvas.getContext('2d');

			// mirror canvas if video element is mirrored
			if (video.classList.contains('is-mirrored')){
				ctx.translate(pictureWidth, 0);
				ctx.scale(-1, 1);
			}

			// Request foto from PHP / cli
			$.get('cheese.php?action=take_foto', function(response) {
				var r = JSON.parse(response);
				if (r.error) {
					setFlashMessage('Error when trying to take a picture: ' + r.message, 'error');
					return;
				}

				var img = new Image();
				img.src = 'data:image/png;base64,' + r.payload;

				ctx.drawImage(img, 0, 0);

				//addLayers(ctx);

				var $img = $(img);
				$img.on('click', previewImage);

				// Add image to thumbnail history
				$owl.trigger('add', [$img, 0]);
				$owl.trigger('refresh');
				$owl.trigger('to', [0, 400]);

				webcamStream.play();
			});
		}, 500);

	}


	function addLayers(ctx) {
		var layers = [
			{
				type : 'image',
				image : 'img/ribbon.png',
				position : [0, 0]
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

	function onMirrorCheckboxChanged () {
		if (this.checked) {
			video.classList.add('is-mirrored');
		}
		else {
			video.classList.remove('is-mirrored');
		}
	}

	function onSettingsButtonClicked() {
		document.body.classList.toggle('settings-active');
	}

	function onSettingsResetButtonClicked() {
		$('#controls input').each (function(i, el) {
			var $el = $(el);

			var type = $el.attr('type');
			var defaultValue = parseInt($el.attr('data-default'));

			console.log(type + ' ' + defaultValue);

			switch (type) {
				case 'checkbox':
					$el.prop('checked', defaultValue);
					$el.trigger('change')
					break;
				case 'range':
				default:
					$el.val(defaultValue);
					$el.trigger('input');
					break;
			}

		});
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
