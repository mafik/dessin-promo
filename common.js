
// $('input').fancyInput();

function validate(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

$('#leave_mail').click(function() {
    var email = $('#email').val();
	if(validate(email)) {
		_gaq.push(['_trackEvent', 'Email', 'Validated', 'Email']);
	    $('#error, #email_div, #leave_mail, #info').slideUp();
	    $('#message').text(email);
	    $('#message').slideDown();
        $.post('/save.php', email);
	} else {
		_gaq.push(['_trackEvent', 'Email', 'Invalid', 'Email']);
	    $('#error').slideDown();
	    $('#message').slideUp();
    }
    return false;
});

var count = function() {
	document.getElementById('countdown').textContent = countdown( null, new Date(2013, 9, 1) ).toString();
};
setInterval(count, 1000);
count();

var canvas = document.getElementById('background');
var ctx = canvas.getContext('2d');

var loop = window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function(f) { setTimeout(f, 1000 / 30); };

var nodes = [];

var make_node = function(connection_count) {
	var n = {
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		z: Math.random() * .2 - .1,
		vx: 0,
		vy: 0,
		c: []
	};
	var already_in = {};
	for(var i = 0; i < connection_count; ++i) {
		var index = Math.floor(Math.random() * nodes.length);
		if(already_in[index]) {
			continue;
		}
		already_in[index] = true;
		n.c.push(nodes[index]);
		nodes[index].c.push(n);
	}
	return n;
};

var node_count = 25;

for(var i = 0; i < node_count; ++i) {
	var connection_count = Math.min(3, Math.max(0, i - 10));
	nodes.push(make_node(connection_count));
}

document.body.addEventListener('click', function(e) {
	var n = make_node(3);
	n.x = e.x + canvas.width / 2;
	n.y = e.y;
	nodes.push(n);
}, false);

var last_add = 0;
var lastX = lastY = 0;

var mx = function(x, y, z) {
	var dx = x - lastX;
	var dy = y - lastY;
	var l = Math.max(1, Math.sqrt(dx*dx + dy*dy));
	return -dx / l * 50 + dx * z;
};

var my = function(x, y, z) {
	var dx = x - lastX;
	var dy = y - lastY;
	var l = Math.max(1, Math.sqrt(dx*dx + dy*dy));
	return -dy / l * 50 + dy * z;
};
var t0 = (new Date).getTime();
var tick = function() {
	loop(tick);
	var t = (new Date).getTime();
    var time = t - t0;
	if(last_add + 490 < time) {
		last_add = time;
		if(nodes.length >= node_count) {
			var index = Math.floor(Math.random() * nodes.length);
			var n = nodes[index];
			n.c.forEach(function(x) {
				var found = x.c.indexOf(n);
				x.c.splice(found, 1);
			});
			nodes.splice(index, 1);
		} else {
			nodes.push(make_node(3));
		}
	}
	ctx.strokeStyle = ctx.fillStyle = '#fff';
	ctx.lineWidth = 1;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var w = canvas.width / 2;

	nodes.forEach(function(n) {
		ctx.beginPath();
		ctx.arc(n.x - w + mx(n.x - w, n.y, n.z), n.y + my(n.x - w, n.y, n.z),Math.sin(time / 1000 * Math.PI + n.x / 150) * 2 + 3,0,2*Math.PI,true);
		ctx.fill();
		ctx.arc(-n.x + 3*w + mx(-n.x + 3*w, n.y, n.z), n.y + my(-n.x + 3*w, n.y, n.z),Math.sin(time / 1000 * Math.PI + n.x / 150) * 2 + 3,0,2*Math.PI,true);
		ctx.fill();
		n.c.forEach(function(b) {
			if(n.z < b.z) return;
			ctx.beginPath();
			ctx.moveTo(n.x - w + mx(n.x - w, n.y, n.z), n.y + my(n.x - w, n.y, n.z));
			ctx.lineTo(b.x - w + mx(b.x - w, b.y, b.z), b.y + my(b.x - w, b.y, b.z));
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(3*w - n.x + mx(3*w - n.x, n.y, n.z), n.y + my(3*w - n.x, n.y, n.z));
			ctx.lineTo(3*w - b.x + mx(3*w - b.x, b.y, b.z), b.y + my(3*w - b.x, b.y, b.z));
			ctx.stroke();
		});
	});

	nodes.forEach(function(a) {
		var fx = 0;
		var fy = 0;
		fx += (canvas.width / 2 - a.x) / 100;
		fy += (canvas.height / 2 - a.y) / 100;
		a.c.forEach(function(b) {
			var k = 20;
			fx -= (a.x - b.x) / k;
			fy -= (a.y - b.y) / k;
		});
		nodes.forEach(function(b) {
			if(a == b) return;
			var dx = a.x - b.x;
			var dy = a.y - b.y;
			var l = Math.sqrt(dx*dx + dy*dy) / 10;
			fx += dx / l / l;
			fy += dy / l / l;
		});
		a.vx += fx;
		a.vy += fy;
		var damping = 0.8;
		a.vx *= damping;
		a.vy *= damping;
		a.x += a.vx;
		a.y += a.vy;
	});



};
loop(tick);

var lastScroll = window.pageYOffset;

// $('section').addClass('past');

window.addEventListener('scroll', function(e) {

	$('section').each(function(i, el) {
		if(el.offsetTop < window.pageYOffset + window.innerHeight - 200) {
			$(el).removeClass('past'); //.addClass('future');
		} else if(el.offsetTop > window.pageYOffset + window.innerHeight) {
			$(el).addClass('past'); //.addClass('future');

		}
	});


	var d = window.pageYOffset - lastScroll;
	var a = d / 1000 * Math.PI;
	nodes.forEach(function(n) {
		var x = n.x - canvas.width / 2, y = n.y - canvas.height / 2;
		n.x = Math.cos(a) * x - Math.sin(a) * y + canvas.width / 2;
		n.y = Math.sin(a) * x + Math.cos(a) * y + canvas.height / 2;
	});
	lastScroll = window.pageYOffset;
}, true);

window.addEventListener('mousemove', function(e) {
	lastX = e.clientX;
	lastY = e.clientY;
}, true);

onresize = function(e) {
	nodes.forEach(function(n) {
		n.x *= window.innerWidth / canvas.width;
		n.y *= window.innerHeight / canvas.height;
	});
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

onresize();


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-39331535-1']);
_gaq.push(['_setDomainName', 'dessin.it']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('movie', {
        height: '480',
        width: '800',
        videoId: 'HHgvEveQsqQ',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
	    _gaq.push(['_trackEvent', 'Videos', 'Play', 'Trailer']);
	    document.getElementById("audioElement").pause();
    } else if(event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
		if(event.data == YT.PlayerState.PAUSED) {
			_gaq.push(['_trackEvent', 'Videos', 'Pause', 'Trailer']);
		} else {
			_gaq.push(['_trackEvent', 'Videos', 'Ended', 'Trailer']);
		}
	    document.getElementById("audioElement").play();
	}
}
