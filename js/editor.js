// HEADER ---------------------------------------------------
/*
	FILE:		editor.js
	CREATED:	2013 june 4

	Experiments with a user adjustible interface
	
	CHANGELOG:


*/
//--------------------------------

// JAVASCRIPT EXTENSIONS
/*
	Taken from rot.js
 * Sets prototype of this function to an instance of parent function
 * @param {function} parent
 */
Function.prototype.extend = function(parent)
{
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
	return this;
}

// NAMESPACE DEFINED -----------------------------------------------------------
var UI	=
{
	// CONSTANTS
	COOKIE_NAME						: "UserInterface",
	AREA_MAP_WRAPPER			: "area_map_wrapper",
	AREA_MAP_HEADER				: "area_map_header",
	AREA_MAP_FOOTER				: "area_map_footer",
	AREA_MAP_RESIZER			: "area_map_resizer",

	// session-data labels
	PLAYER_POSITION_Y			: "player_position_y",
	PLAYER_POSITION_X			: "player_position_x",
	CURSOR_POSITION_Y			: "cursor_position_y",
	CURSOR_POSITION_X			: "cursor_position_x",
	MOUSE_DOWN_TARGET			: "mouse_down_target",
	MOUSE_DOWN_RIGHT			: "mouse_down_right",
	MOUSE_DOWN_POSITION_X	: "mouse_down_x",
	MOUSE_DOWN_POSITION_Y	: "mouse_down_y",
	MOUSE_UP_RIGHT				: "mouse_up_right",
	MOUSE_UP_POSITION_X		: "mouse_up_x",
	MOUSE_UP_POSITION_Y		: "mouse_up_y",
	MOUSE_LAST_POSITION_X	: "mouse_last_x",
	MOUSE_LAST_POSITION_Y	: "mouse_last_y",

};

// EXTENSION of UI "namespace" ----------------------

// FUNCTIONS -------------------------------------------


// ----- DATA OPERATIONS

// Retrieves game data from the cookie and populates sessionStorage
UI.initializeState	= function initializeState(cookieName)
{

}

// commits game data to a cookie from data in sessionStorage
UI.saveState	= function saveState()
{
	var cookieValue;
	var vert	= sessionStorage.getItem(UI.PLAYER_POSITION_Y);
	var horz	= sessionStorage.getItem(UI.PLAYER_POSITION_X);

	cookieValue	= vert+":"+horz+":";

	UI.setCookie(UI.COOKIE_NAME, cookieValue, 30);
}


// Looks for a Document's Cookie by unique identifier
// returns a string on success. returns null on error.
// cookieID - string identifier of the specific cookie to be retrieved
UI.getCookie	= function getCookie(cookieID)
{
	// Get a string containing all of the cookies
	var allCookies			= document.cookie;
	// search for our cookie amongst all of the cookies except for the first
	var cookieStartPos	= allCookies.indexOf(" " + cookieID + "=");
	// Did our search fail to find our cookie?
	if (cookieStartPos == -1)
		// look for our cookie at the first position in the cookie string
		cookieStartPos = allCookies.indexOf(cookieID + "=");

	// have we found our cookie?
	if (cookieStartPos != -1)
	{
		// determine the start of the data
		cookieStartPos 		= allCookies.indexOf("=", cookieStartPos) + 1;
		// determine the end of the data
		var cookieEndPos	= allCookies.indexOf(";", cookieStartPos);
		if (cookieEndPos == -1)
			cookieEndPos		= allCookies.length;

		// extract our cookie's data from the string containing the list of all the cookies
		var cookieData		= allCookies.substring(cookieStartPos,cookieEndPos);
		// return our cookie's data
		return ( unescape( cookieData ) );
	}

	return null;
}

// Sets a Document's Cookie by Unique Identifier
// cookieID - string, identifier of the specific cookie to set
// cookieValue - string, data
// cookieDaysAlive - integer, number of days from present in which cookie expires
// cookiePath - string, file path to document
// cookieDomain - string, URL domain of website
UI.setCookie	= function setCookie(cookieID, cookieValue, cookieDaysAlive, cookiePath, cookieDomain, cookieSecurity)
{
	var cookieExpires	= new Date();
	cookieExpires.setDate(cookieExpires.getDate() + cookieDaysAlive);

	document.cookie		=		cookieID
											+ "="
											+ escape(cookieValue)
											+ ((cookieExpires==null) ? "" : "; expires="+cookieExpires.toUTCString())
											+ ((typeof cookiePath==='string')			? "; path="+cookiePath : "")
											+ ((typeof cookieDomain==='string')		? "; domain="+cookieDomain : "")
											+ ((typeof cookieSecurity==='boolean')? "; security="+cookieSecurity : "")
										;
}


// INTERFACE / RESPONSE TO EVENT HANDLING
UI.doClick	= function doClick(event)
{
	var target			= event.target;
	var rightDown		= sessionStorage.getItem(UI.MOUSE_DOWN_RIGHT);
	var posXDown		= sessionStorage.getItem(UI.MOUSE_DOWN_POSITION_X);
	var posYDown		= sessionStorage.getItem(UI.MOUSE_DOWN_POSITION_Y);	

	var rightUp			= sessionStorage.getItem(UI.MOUSE_UP_RIGHT);
	var posXUp			= sessionStorage.getItem(UI.MOUSE_UP_POSITION_X);
	var posYUp			= sessionStorage.getItem(UI.MOUSE_UP_POSITION_Y);

	// not a right click
	if(rightUp=="0")
	{


	}

	//target.style.height	= posYUp+"px";
	//target.style.width	= posXUp+"px";
}

UI.doDrag	= function doDrag(event)
{
	var targetId		= sessionStorage.getItem(UI.MOUSE_DOWN_TARGET);
	if(targetId	== UI.AREA_MAP_RESIZER)
		UI.resizeMap(UI.getMousePosition(event));
	else if(targetId	== UI.AREA_MAP_HEADER)
		UI.moveMap(UI.getMousePosition(event));
}

UI.resizeMap	= function resizeMap(position)
{
	var lastX		= sessionStorage.getItem(UI.MOUSE_LAST_POSITION_X)-0;
	var lastY		= sessionStorage.getItem(UI.MOUSE_LAST_POSITION_Y)-0;

	//alert("LastX("+lastX+") LastY("+lastY+")");

	var changeX	= position.x - lastX;
	var changeY	= position.y - lastY;

	//alert("resizing map. position(x:"+changeX+", y:"+changeY+")");
	// area_map_wrapper  (height and width)
	var area_map_wrapper	= document.getElementById(UI.AREA_MAP_WRAPPER);
	area_map_wrapper.style.width	= (area_map_wrapper.offsetWidth + changeX)+"px";
	area_map_wrapper.style.height	= (area_map_wrapper.offsetHeight + changeY)+"px";

	// area_map_header (width)
	var area_map_header	= document.getElementById(UI.AREA_MAP_HEADER);
	area_map_header.style.width		= (area_map_header.offsetWidth + changeX)+"px";

	// area_map_header (width)
	var area_map_footer	= document.getElementById(UI.AREA_MAP_FOOTER);
	area_map_footer.style.width		= (area_map_footer.offsetWidth + changeX)+"px";

	/*
	// area_map_focus (height and width)
	var area_map_focus	= document.getElementById("area_map_focus");
	var focusWidth			= area_map_focus.offsetWidth + changeX;
	var focusHeight			= area_map_focus.offsetHeight + changeY;
	if(			area_map_wrapper.offsetWidth>2
			&&	focusWidth>(area_map_wrapper.offsetWidth+2)
		)
		focusWidth			= area_map_wrapper.offsetWidth-2;
	if(			area_map_wrapper.offsetHeigth>20
			&&	focusWidth>(area_map_wrapper.offsetWidth+20)
		)
		focusWidth			= area_map_wrapper.offsetWidth-2;
	
	
	area_map_focus.style.width		= focusWidth+"px";
	area_map_focus.style.height		= focusHeight+"px";
	*/
}

UI.moveMap	= function moveMap(position)
{
	// area_map_wrapper
	var area_map_wrapper	= document.getElementById(UI.AREA_MAP_WRAPPER);
	
	if(position.x>0)
	{
		var lastX		= sessionStorage.getItem(UI.MOUSE_LAST_POSITION_X)-0;
		var changeX	= position.x - lastX;
		area_map_wrapper.style.left	= (area_map_wrapper.offsetLeft + changeX)+"px";
	}
	
	if(position.y>0)
	{
		var lastY		= sessionStorage.getItem(UI.MOUSE_LAST_POSITION_Y)-0;
		var changeY	= position.y - lastY;
		area_map_wrapper.style.top	= (area_map_wrapper.offsetTop + changeY)+"px";
	}

}

// ----- EVENT HANDLING

// returns 1 if the right mouse button was used. 0 if not
UI.getRightClick	= function getRightClick(event)
{
	var rightclick;

	if (event.which)
		rightclick		= (event.which == 3);
	else if (event.button)
		rightclick		= (event.button == 2);

	if(rightclick)
		return 1;
	else
		return 0;
}

// returns the mouse position within the window during the event
UI.getMousePosition	= function getMousePosition(event)
{
	var posX = new Number();
	var posY = new Number();

	if (event.pagex != undefined && event.pagey != undefined)
	{
		posX = event.pagex;
		posY = event.pagey;
	}
	else // Firefox method to get the position
	{
		posX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return { x:posX, y:posY }
}


// ...MOUSE EVENTS... these happen for events that occur within the play area

UI.onMouseDown	= function onMouseDown(event)
{
	var position		= UI.getMousePosition(event);
	var rightclick	= UI.getRightClick(event);

	sessionStorage.setItem(UI.MOUSE_DOWN_TARGET, event.target.id);
	sessionStorage.setItem(UI.MOUSE_DOWN_RIGHT, rightclick);
	sessionStorage.setItem(UI.MOUSE_DOWN_POSITION_X, position.x);
	sessionStorage.setItem(UI.MOUSE_DOWN_POSITION_Y, position.y);
	sessionStorage.setItem(UI.MOUSE_LAST_POSITION_X, position.x);
	sessionStorage.setItem(UI.MOUSE_LAST_POSITION_Y, position.y);
}

UI.onMouseUp	= function	onMouseUp(event)
{
	var position		= UI.getMousePosition(event);
	var rightclick	= UI.getRightClick(event);

	sessionStorage.setItem(UI.MOUSE_UP_RIGHT, rightclick);
	sessionStorage.setItem(UI.MOUSE_UP_POSITION_X, position.x);
	sessionStorage.setItem(UI.MOUSE_UP_POSITION_Y, position.y);

	// process the click
	UI.doClick(event);
	
	sessionStorage.removeItem(UI.MOUSE_DOWN_TARGET);
}

UI.onMouseOver	= function onMouseOver(event)
{
	//var position		= UI.getMousePosition(event);

}

UI.onMouseOut	= function onMouseOut(event)
{
	//var position		= UI.getMousePosition(event);

}

UI.onMouseMove	= function onMouseMove(event)
{

	if(sessionStorage.getItem(UI.MOUSE_DOWN_TARGET))
	{
		var position		= UI.getMousePosition(event);
		UI.doDrag(event);
		sessionStorage.setItem(UI.MOUSE_LAST_POSITION_X, position.x);
		sessionStorage.setItem(UI.MOUSE_LAST_POSITION_Y, position.y);
	}

}

// ... WINDOW EVENTS ...

UI.onLoad	= function onLoad()
{
	//var target = document.getElementById(UI.FOCUS);
	var target = window;

	// CANVAS EVENTS
	if(target.attachEvent)
	{
		target.attachEvent('mousedown', UI.onMouseDown);
		target.attachEvent('mouseup', UI.onMouseUp);
		target.attachEvent('mouseover', UI.onMouseOver);
		target.attachEvent('mouseout', UI.onMouseOut);
		target.attachEvent('mousemove', UI.onMouseMove);
	}
	else
	{
		target.addEventListener("mousedown", UI.onMouseDown, false );
		target.addEventListener("mouseup", UI.onMouseUp, false );
		target.addEventListener("mouseover", UI.onMouseOver, false );
		target.addEventListener("mouseout", UI.onMouseOut, false );
		target.addEventListener("mousemove", UI.onMouseMove, false );
	}

}

UI.onUnload = function onUnload()
{

}

// INITIALIZATION --------------------------------------------------------------
// runs when script is loaded - but before page is finished loading

// SETUP EVENTS
if(window.attachEvent)
{
	window.attachEvent('onload', UI.onLoad);
	window.attachEvent('unload', UI.onUnload);
}
else
{
	window.addEventListener("load", UI.onLoad, false );
	window.addEventListener("unload", UI.onUnload, false );
}