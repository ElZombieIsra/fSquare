"use strict";
/*
* Te voy a explicar un poco cómo funciona esto
*
* Aquí estoy haciendo el import de los módulos que necesito.
* Y defino algunas variables que necesito (p1, p2, listo1)
*/
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	users = [];
var p1 = {ip:'',frames:[],color:'',nombre:''};
var p2 = {ip:'',frames:[],color:'',nombre:''};
var listo1 = false, listo2 = false;

/*
* Establezco que el servidor de express va a usar la 
* carpeta public para enviar los archivos HTML
*/

app.use(express.static('public'));

/*
* Aquí inicio el módulo de socket.io  haciendo io.on()
* le paso el evento que va a escuchar "connection" y una función 
* que va a realizar cuando encuentre ese evento.
*/
io.on('connection', function(socket){
	// Algo de lógica por aquí
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
	//Una impresión a consola por acá
	console.log('se conectó un usuario');
	//Aquí le digo al módulo que cuando encuentre el evento 'disconnect'
	//haga una función
	socket.on('disconnect', function(){
		let ip = socket.handshake.address;
		if (p1.ip === ip) {
			p1.ip = '';
		} else if (p2.ip === ip) {
			p2.ip = '';
		}
    	console.log('se desconectó un usuario :c');
  	});
  	//Igual. Escucha el evento 'JugadorListo' que se envía desde el front-end
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
  	//Básicamente es lo mismo con las siguientes sentencias
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
	/*
	 *! Todos los eventos que ves arriba los definí yo. 
	 *! Puedes definir tus propios eventos desde el front-end
	 *! Sólo necesitas instanciar el .js de socket.io 
	 *! y realizar la conexión. Te explico más en public/game.js
	 */
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});