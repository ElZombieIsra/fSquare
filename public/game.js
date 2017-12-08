/*
*
* Bueno, aquí estoy usando JQuery para "dibujar" mi juego en un canvas. 
* Esto no es muy difícil de hacer. Puedes buscar una página que se llama 
* canvaNinja o algo así en google para ver cómo hacer juegos con node
* hasta te puedes robar unos juegos de ahí, jajaja.
* Básicmente lo que hago aquí es que le digo a JQuery que cuando la 
* página cargue por completo, realice las sentencias.
*
*/
$(document).ready(()=>{
    //Aquí se hace la conexión
	/*------>*/var socket = io();
    //Definiéndo variables, blablabla
	var user = '';
	var canvas=null,
	ctx=null,
    mousex=0,
    mousey=0,
    x=0,
    y=0,
    userX=0,
    userY=0,
    lastPress=null,
    score=0,
    cubosX = [],
   	cubosY = [],
   	cuboP = [],
   	cuboE = [],
   	cuboRP = [],
   	cuboRE = [],
    yy = 15,
	xx = 20,
	pintar = false,
	cx= 0,
	cy = 0,
	iniciar = false,
	coño = 0,
	score = 0,
	eScore = 0,
	name = localStorage.nombre || 'Desconocido',
	clr = '#'+localStorage.color || '#0f0',
	eName = '',
	eClr = '#fff',
	dat = false,
	j1 = '',
	j2 = '',
	pause = true,
	gameover = true,
	counter = 0,
	lastUpdate=0,
	j1Ready=false,
	j2Ready=false,
	resultado = '',
	vaya = false;
    /*
    * Aquí empieza la magia. Lo mismo que en app.js, le digo a la conexión que cuando
    * detecte el evento 'noUser' realice una acción. Este evento viene desde el 
    * servidor en node.
    */
	socket.on('noUser',(u)=>{
		user = u;
		localStorage.setItem('user',u);
		if (u==='p1') {
			j1 = name;
		} else{
			j2 = name;
		}
	});
	for (var i = 0; i < 9; i++) {
    	cubosX.push(xx);
    	for (var j = 0; j < 6; j++) {
    		cubosY.push(yy);
    		cuboP.push(false);
    		cuboE.push(false);
    		yy += 30;
    		coño +=1;
    	}
    	yy = 15;
    	xx += 30;
    }
    cuboRP = cuboP;
    cuboRE = cuboE;
    coño = 0;
    yy = 15;
    xx = 20;
    // Recibiendo más eventos. Nota que la estructura es:
    // (objeto).on('AquíVaElNombreDeTuEvento', funcion(paramétros, x2){aquí va tu lógica});
	socket.on('mouseUser', (mouseX,mouseY)=>{
		userX=mouseX-canvas.offsetLeft;
		userY=mouseY-canvas.offsetTop;
	});
	socket.on('valid',(booo)=>{
		dat = booo;
	});
	socket.on('enemyPoint', (s)=>{
		eScore = s;
	});
	socket.on('scoreMin',()=>{
		score--;
	});
	socket.on('enemyTargetPoint',(eC)=>{
		cuboE[eC]=true;
		cuboP[eC]=false;
	});
	socket.on('eFrames',(eFrames)=>{
		cuboE=eFrames;
	});
	socket.on('eDat',(eNm)=>{
		eName = eNm.nombre;
		eClr = eNm.color;
		if (j1 === '') {
			j1 = eNm.nombre;
		}else{
			j2 = eNm.nombre;
		}
	});
	socket.on('ready',()=>{
        /*-----------------------------------------------------------------------------
        *-----------------------------------------------------------------------------
        * Esto es importante. Ya te dije que con socket.on escuchas eventos. 
        * Pues aquí vemos el socket.emit() que es la función para enviar eventos
        * Con esta función le mandas eventos al servidor para que realice algo
        * Estructura: 
        * (objeto).emit('DefinesNombreDeTuEvento', (parámetros que vas a mandar(estos son opcionales)))
        * Del lado del front-end sólo usamos el socket.emit que es para responder a 
        * 1 sólo socket, pero en el servidor tenemos diferentes funciones en socket:
        * -"socket.emit()" responde al socket que realizó la peticion.
        * -"socket.broadcast.emit()" responde a todos los sockets conectados 
        * menos al socket que realizó la petición
        * -"io.sockets.emit()" responde a todos los sockets conectados
        * Hay más pero en este proyecto sólo están implementados estos.
        *-----------------------------------------------------------------------------
        *-----------------------------------------------------------------------------
        */
		socket.emit('dat',name,clr,localStorage.user);
		socket.emit('nDat',localStorage.user);
		$('#warn').text('Listo. Iniciando...');
		setTimeout(()=>{
			$('#warn').css('display','none');
			init();
		},3000);
	});
	socket.on('j1Listo',()=>{
		j1Ready= true;
	});
	socket.on('j2Listo',()=>{
		j2Ready = true;
	});
	socket.on('OK',()=>{
		listos();
	});
    /*
    * Hasta aquí es lo más importante de la parte de sockets. 
    * Lo demás es lógica del juego en canvas. Lo puedes seguir checando.
    * Encontrarás que, por ejemplo, al anotar 1 punto, se emite a los contrincantes
    * que este jugador anotó 1 punto, o se emite el movimiento del ratón.
    */
	function init(){
        canvas=document.getElementById('miCanvas');
        ctx=canvas.getContext('2d');
        canvas.width=300;
        canvas.height=200;
        run();
    }

    function run(){
        requestAnimationFrame(run);
        var now=Date.now();
        var deltaTime=(now-lastUpdate)/1000;
        if(deltaTime>1)deltaTime=0;
        lastUpdate=now;
		if(eClr==='#fff') {
			alert('no hay datos');
			socket.emit('nDat',localStorage.user);
		}
        act(deltaTime);
        paint(ctx);
    }

    function act(deltaTime){
    	counter -= deltaTime;
        x=mousex;
        y=mousey;

        if(x<0)
            x=0;
        if(x>canvas.width)
            x=canvas.width;
        if(y<0)
            y=0;
        if(y>canvas.height)
            y=canvas.height;
    	if(counter<=0){
        	pause=true;
        	if (score<eScore) {
        		resultado='Perdiste :C';
        	}else if (eScore<score){
        		resultado='Ganaste :D';
        	}
    	}
    }

    function hitbox(x,y) {
    	if (!pause) {
	    	if(lastPress==1){
	    		var aber = 0;
	    		var term = 0;
	    		if (!dat&&localStorage.user!=='') {
	    			socket.emit('dat',name,clr,localStorage.user);
	    		}
	        	for (var i = 0; i < 9; i++) {
	        		var cubX = cubosX[i],
	        		asd = false;
	        		for (var j = 0; j < 6; j++) {
	        			var cubY = cubosY[j];
	        			if (x>=cubX&&x<=cubX+20&&y>=cubY&&y<=cubY+20) {
	        				if (!cuboP[aber]) {
		        				asd = true;
		        				cX = cubX;
		        				cY = cubY;
						        pintar = true;
						        if (cuboE[aber]) {
						        	socket.emit('scoreMinus');
						        	eScore--;
						        }
						        cuboE[aber] = false;
						        cuboP[aber] = true;
						        score ++;
						        socket.emit('targetPoint',aber);
						        socket.emit('score',score);
						        socket.emit('frames',cuboP);
						        break;	
	        				}
	        			}else{}
	        			aber += 1;
	        			if (term===9) {
	        				break;
	        			}
	        		}
	        		if (term===9) {
	        			break;
	        		}
	        		term +=1;
	        		if (asd) {
	        			break;
	        		}
	        	}
	        	aber = 0;
	        	lastPress=0;
	        }
	    }else if (lastPress===1&&counter<-1) {
	    	socket.emit('JugadorListo',localStorage.user);
	    	vaya=true;
	    }
	    lastPress = null;
    }
    function listos() {
    	pause=false;
        counter=60;
        score=0;
        eScore=0;
        for (var i = 0; i < cuboP.length; i++) {
        	cuboP[i]=false;
        }
        for (var i = 0; i < cuboE.length; i++) {
        	cuboE[i]=false;
        }
        resultado = '';
    }
    function paint(ctx){
        ctx.fillStyle='#000';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle = '#f00';
        var hola = 0;
        for (var i = 0; i < 9; i++) {
        	for (var j = 0; j < 6; j++) {
        		if (cuboP[hola]) {
        			ctx.fillStyle = clr;
        			ctx.fillRect(xx, yy, 20, 20);
        		}
        		if (cuboE[hola]) {
        			ctx.fillStyle = eClr;
        			ctx.fillRect(xx, yy, 20, 20);
        		}
        		ctx.strokeRect(xx, yy, 20, 20);
        		yy += 30;
        		hola +=1;
        	}
        	yy = 15;
        	xx += 30;
        }
        let asdfghjkl='Jugador 1: '+j1;
        if (j1Ready) {
        	asdfghjkl='Jugador 1: '+j1+' OK'
        }
        let lkjhgfdsa = 'Jugador 2: '+j2;
        if (j2Ready) {
        	lkjhgfdsa = 'Jugador 2: '+j2+' OK';
        }
        if (resultado!=='') {
        	ctx.fillStyle='#000';
        	ctx.fillRect((canvas.width/2)-50,(canvas.height/2)-20,100,40)
        }
        ctx.fillStyle = '#fff';
        ctx.fillText('Score: '+score,0,10);
        ctx.fillText('Score enemigo: '+eScore,canvas.width-90,10);
        ctx.fillText(asdfghjkl,5,canvas.height-5);
        ctx.fillText(lkjhgfdsa,canvas.width-100,canvas.height-5);
        ctx.fillText(resultado,(canvas.width/2)-30,(canvas.height/2)-10);
        xx=20;
        yy=15;
        iniciar = true;
        if (pintar) {
        	ctx.fillStyle='#fff';
			ctx.fillRect(cX,cY,20,20);
			pintar = false;
        }

        ctx.strokeStyle=clr;
        ctx.beginPath();
        ctx.arc(x,y,5,0,Math.PI*2,true);
        ctx.stroke();
        ctx.strokeStyle='#fff';
        ctx.strokeStyle=eClr;
        ctx.beginPath();
        ctx.arc(userX,userY,5,0,Math.PI*2,true);
        ctx.stroke();

        if(counter>0)
            ctx.fillText('Tiempo: '+counter.toFixed(1),(canvas.width/2)-20,10);
        else
            ctx.fillText('Tiempo: 0.0',(canvas.width/2)-40,10);
        if(pause){
            ctx.fillText('Score: '+score,120,110);
            if(counter<-1)
                ctx.fillText('Click para iniciar',100,120);
            if (vaya) {
            	ctx.fillText('Esperando al oponente',100,140);
            }
        }
    }

    document.addEventListener('mousemove',function(evt){
        mousex=evt.pageX-canvas.offsetLeft;
        mousey=evt.pageY-canvas.offsetTop;
        socket.emit('mouseMovement',mousex,mousey);
    },false);

    document.addEventListener('mousedown',function(evt){
    	lastPress=evt.which;
    	hitbox(mousex,mousey);
    },false);

    document.addEventListener('mouseup',function(evt){
    	lastPress=0;
    },false);

    window.requestAnimationFrame=(function(){
        return window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            function(callback){window.setTimeout(callback,17);};
    })();
});