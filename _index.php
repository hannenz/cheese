<?php
session_start();

if (!empty($_POST['trigger'])) {
	$filename = $_POST['fotoid'];
	exec('/usr/bin/fswebcam -r "800x600" --png 9 fotos/'.$filename, $data, $ret);
	if (intval($ret) != 0) {
		die ("Fehler beim Auslösen der Kamera!");
	}
	if (!is_array($_SESSION['fotos'])){
		$_SESSION['fotos'] = array();
	}
	array_unshift($_SESSION['fotos'], $_POST['fotoid']);
}
else if (!empty($_POST['print'])) {
	//exec ("lpr fotos/".$_POST['filename'], $data, $ret);
	// if (intval($ret) != 0) {
	// 	die ("Fehler beim Drucken");
	// }

	$im = imagecreatefrompng('/var/www/html/fototest/'.$_POST['filename']);
	header ('Content-Type:image/png');
	imagepng($im);
	imagedestroy($im);
	die();

}
else if (!empty($_POST['cancel'])) {
	session_unset();
	session_destroy();
	header('Location:/');
}

?>
<!doctype html>
<html lang="de">
<head>
	<meta charset="utf-8">
	<title>Cheese</title>
	<link rel="stylesheet" type="text/css" href="css/main.css" />
	<link rel="stylesheet" href="js/assets/owl.carousel.css">
</head>
<body>
	<div class="container">
		<h1>Cheese<em>!</em><br><span>please</span></h1>


		<?php if ($done): ?>
			<h1>Danke!</h1>
			<p><a href="/">Noch mal ? </a></p>
		<?php else: ?>
			<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post">
				<input type="hidden" value="<?php echo time(); ?>" name="fotoid" />

 				<figure class="preview">
					<?php if (is_file('fotos/'.$filename)):?><img src="fotos/<?php echo $filename; ?>" alt="Preview" title="Preview" /><?php endif ?>
				</figure>
			
				<input class="button" type="submit" name="trigger" value="Kamera auslösen" />

				<?php if (!empty($filename)):?>
					<input type="hidden" id="filename" value="<?php echo $filename; ?>" name="filename"  />
					<input class="button print-button" type="submit" name="print" value="Foto drucken" />
				<?php endif ?>
				<input class="button cancel-button" type="submit" name="cancel" value="Von vorn" />

			</form>
		<?php endif ?>
		<div class="owl-carousel">
			<?php foreach ($_SESSION['fotos'] as $n => $file): ?>
				<?php #if ($n == 0) continue; ?>
				<figure class="thumb">
					<img src="fotos/<?php echo $file; ?>" alt="<?php echo $file; ?>" />
				</figure>
			<?php endforeach ?>
		</div>
	</div>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script src="js/owl.carousel.min.js"></script>

	<script>
		$(document).ready(function() {
			$('.owl-carousel').owlCarousel({
				items:5,
				margin:10
			});
			$('.thumb img').on('click', function(ev) {

				var src = $(this).attr('src');
				console.log(src);

				var $previewImage = $('.preview img');
				if ($previewImage.length > 0){
					$('.preview img').attr('src', src);
				}
				else {
					var img = new Image();
					img.src = src;
					$('.preview').append($(img));
				}
				$('#filename').attr('value', src);
			});
		});
	</script>
</body>
</html>
