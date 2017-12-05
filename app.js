"use strict";
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	users = [];
var p1 = {ip:'',frames:[],color:'',nombre:''};
var p2 = {ip:'',frames:[],color:'',nombre:''};
var listo1 = false, listo2 = false;
app.use(express.static('public'));

io.on('connection', function(socket){
	if (p1.ip === '') {
		p1.ip = socket.handshake.address;
		socket.emit('noUser','p1');
		socket.emit('eDat',p2);
	} else if (p2.ip === '') {
		p2.ip = socket.handshake.address;
		socket.emit('noUser','p2');
		socket.emit('eDat',p1);
	}
	if (p1.ip !==''&&p2.ip!=='') {
		console.log('Inicia el juego');
		io.sockets.emit('ready');
	}
	console.log('se conectó un usuario');
	socket.on('disconnect', function(){
		let ip = socket.handshake.address;
		if (p1.ip === ip) {
			p1.ip = '';
		} else if (p2.ip === ip) {
			p2.ip = '';
		}
    	console.log('se desconectó un usuario :c');
  	});
  	socket.on('JugadorListo',(usr)=>{
  		if (usr==='p1') {
  			listo1 = true;
  			socket.broadcast.emit('j1Listo');
  		}else{
  			listo2 = true;
  			socket.broadcast.emit('j2Listo');
  		}
  		if (listo1&&listo2) {
  			io.sockets.emit('OK');
  			listo1 = false;
  			listo2 = false;
  		}
  	});
  	socket.on('newUser',(user)=>{
  		users.push(user);
  	});
	socket.on('mouseMovement', (mouseX, mouseY)=>{
		socket.broadcast.emit('mouseUser',mouseX,mouseY);
	});
	socket.on('score',(score)=>{
		socket.broadcast.emit('enemyPoint',score);
	});
	socket.on('targetPoint',(aber)=>{
		socket.broadcast.emit('enemyTargetPoint',aber);
	});
	socket.on('frames',(frames)=>{
		socket.broadcast.emit('eFrames',frames);
	});
	socket.on('dat',(name,clr,usr)=>{
		if (usr==='p1') {
			p1.nombre = name;
			p1.color = clr;
			socket.emit('valid',true);
		}else if (usr==='p2') {
			p2.nombre = name;
			p2.color = clr;
			socket.emit('valid',true);
		}
	});
	socket.on('nDat',(sr)=>{
		console.log(p1);
		console.log(p2);
		if (sr ==='p1' ) {
			socket.emit('eDat',p2);
		}else if (sr ==='p2') {
			socket.emit('eDat',p1);
		}
	});
	socket.on('scoreMinus',()=>{
		socket.broadcast.emit('scoreMin');
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});