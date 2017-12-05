$(document).ready(()=>{
	$('#sub').click(()=>{
		let nombre = $('#nombre').val();
		let color = $('#clr').val();
		alert(color);
		localStorage.setItem('nombre',nombre);
		localStorage.setItem('color',color);
		window.location.href = '/game.html';
	});
});