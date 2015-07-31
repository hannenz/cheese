cheese

Start streaming server:

~~~
$ node js/streaming-server cheese
~~~

Start ffmpeg streaming from webcam to server

~~~
$ ffmpeg -s 1920x1080 -f video4linux2 -i /dev/video0 -f mpeg1video -b 800k -r 30 http://localhost:8082/cheese/1920/1080
~~~


