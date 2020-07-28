// eslint-disable-next-line no-unused-vars
function openTab(evt, tabName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName('tabcontent');
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = 'none';
	}
	tablinks = document.getElementsByClassName('tablinks');
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(' active', '');
	}
	document.getElementById(tabName).style.display = 'block';
	evt.currentTarget.className += ' active';
}

// Get the element with id="defaultOpen" and click on it
if(document.getElementById('defaultOpen')) {
	document.getElementById('defaultOpen')
		.click();
}


