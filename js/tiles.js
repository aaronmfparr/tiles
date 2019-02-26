// HEADER ---------------------------------------------------
/*
	FILE:		tiles.js
	CREATED:	2013 june 1

	Top down tile based game encapsulated within the TILES namespace

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
var TILES	=
{
	// CONSTANTS
	PLAYAREA							: "playarea",					// reference to canvas ID
	DIM_TILE							: 36,									// dimensions of a tile image
	COOKIE_NAME						: "GrecianCanvas",

	// session-data labels
	PLAYER_POSITION_Y			: "player_position_y",
	PLAYER_POSITION_X			: "player_position_x",
	CURSOR_POSITION_Y			: "cursor_position_y",
	CURSOR_POSITION_X			: "cursor_position_x",
	MOUSE_DOWN_STATE			: "mouse_down_state",
	MOUSE_DOWN_RIGHT			: "mouse_down_right",
	MOUSE_DOWN_POSITION_X	: "mouse_down_x",
	MOUSE_DOWN_POSITION_Y	: "mouse_down_y",
	MOUSE_UP_RIGHT				: "mouse_up_right",
	MOUSE_UP_POSITION_X		: "mouse_up_x",
	MOUSE_UP_POSITION_Y		: "mouse_up_y",

	// Directional constants. Ordering is important!
	DIRS:
	{
		"4":
		[
			[ 0, -1],
			[ 1,  0],
			[ 0,  1],
			[-1,  0]
		],
		"8":
		[
			[ 0, -1],
			[ 1, -1],
			[ 1,  0],
			[ 1,  1],
			[ 0,  1],
			[-1,  1],
			[-1,  0],
			[-1, -1]
		],
		"6":
		[
			[-1, -1],
			[ 1, -1],
			[ 2,  0],
			[ 1,  1],
			[-1,  1],
			[-2,  0]
		]
	}



};

// EXTENSION of TILES "namespace" ----------------------

// FUNCTIONS -------------------------------------------

// ----- UTILITIES

TILES.getTileCoordinatesFromPosition	=  function getTileCoordinatesFromPosition(x,y)
{
	var rowPos			= new Number;
	var colPos			= new Number;
	rowPos	= Math.floor( y/TILES.DIM_TILE );
	colPos	= Math.floor( x/TILES.DIM_TILE );

	return { row:rowPos, col:colPos }
}


// ----- DATA OPERATIONS

// Retrieves game data from the cookie and populates sessionStorage
TILES.initializeGameData	= function initializeGameData(cookieGrecianCanvas)
{
	if(cookieGrecianCanvas==null)
	{
		sessionStorage.setItem(TILES.PLAYER_POSITION_Y, "6");
		sessionStorage.setItem(TILES.PLAYER_POSITION_X, "5");
	}
	else
	{
		var aGameData	= cookieGrecianCanvas.split(":");
		sessionStorage.setItem(TILES.PLAYER_POSITION_Y, aGameData[0]);
		sessionStorage.setItem(TILES.PLAYER_POSITION_X, aGameData[1]);
	}
}

// commits game data to a cookie from data in sessionStorage
TILES.saveGameData	= function saveGameData()
{
	var cookieValue;
	var vert	= sessionStorage.getItem(TILES.PLAYER_POSITION_Y);
	var horz	= sessionStorage.getItem(TILES.PLAYER_POSITION_X);

	cookieValue	= vert+":"+horz+":";

	TILES.setCookie(TILES.COOKIE_NAME, cookieValue, 30);
}


// Looks for a Document's Cookie by unique identifier
// returns a string on success. returns null on error.
// cookieID - string identifier of the specific cookie to be retrieved
TILES.getCookie	= function getCookie(cookieID)
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
TILES.setCookie	= function setCookie(cookieID, cookieValue, cookieDaysAlive, cookiePath, cookieDomain, cookieSecurity)
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

//--------------------------------DRAW

TILES.drawPlayarea	= function drawPlayarea()
{
	var canvas = document.getElementById(TILES.PLAYAREA);
	var canvasPlayarea = canvas.getContext('2d');

	canvasPlayarea.clearRect(0, 0, canvas.width, canvas.height);

	//canvasPlayarea.fillStyle	= "rgba(170, 25, 0, 1.0)";// red
	//canvasPlayarea.fillStyle	= "rgba(252, 175, 22, 1.0)"; // gold
	canvasPlayarea.fillStyle	= "rgba(255, 126, 50, 1.0)"; // orange
	canvasPlayarea.fillRect(0, 0, canvas.width, canvas.height);
	canvasPlayarea.globalCompositeOperation	= "darker";

	var x; // left to right position in row
	var y; // index of row
	var tile_index;

	// handle all rows visible on the screen
	var vert	= sessionStorage.getItem(TILES.PLAYER_POSITION_Y);
	var horz	= sessionStorage.getItem(TILES.PLAYER_POSITION_X);

	canvasPlayarea.globalCompositeOperation	= "source-over";
	var row		= new Array(7);
	for(x=0;x<7;x++)
		row[x]=map[vert-3+x].substring(horz-3,horz+4);

	for(y=0;y<7;y++)
	{
		x	= 0;
		for(x=0;x<7;x++)
		{
			tile_index	= row[y].charAt(x);
			canvasPlayarea.drawImage(imgTile[tile_index], TILES.DIM_TILE*x, TILES.DIM_TILE*y);
		}
	}

	canvasPlayarea.drawImage(imgPlayer, TILES.DIM_TILE*3, TILES.DIM_TILE*3);
}


TILES.drawCursor	= function drawCursor(position)
{
	// if null is passed then the cursor is deleted
	if(position!=null)
	{
		var tile_current	= TILES.getTileCoordinatesFromPosition(position.x, position.y);
		var tile_last			= new Object;
				tile_last.row	= sessionStorage.getItem(TILES.CURSOR_POSITION_Y);
				tile_last.col	= sessionStorage.getItem(TILES.CURSOR_POSITION_X);

		if(tile_last.row!=tile_current.row || tile_last.col!=tile_current.col)
		{
			// clean up area
			TILES.drawPlayarea();

			// update position memory
			sessionStorage.setItem(TILES.CURSOR_POSITION_Y, tile_current.row);
			sessionStorage.setItem(TILES.CURSOR_POSITION_X, tile_current.col);

			// prepare to draw the cursor
			var canvas = document.getElementById(TILES.PLAYAREA);
			var canvasPlayarea = canvas.getContext('2d');
			canvasPlayarea.globalCompositeOperation	= "darker";

			canvasPlayarea.drawImage(imgCursor, TILES.DIM_TILE*tile_current.col, TILES.DIM_TILE*tile_current.row);
		}
	}
	else
	{
		// clean up area
		TILES.drawPlayarea();

		sessionStorage.setItem(TILES.CURSOR_POSITION_Y, -1);
		sessionStorage.setItem(TILES.CURSOR_POSITION_X, -1);
	}
}

//--------------------------------ACTIONS

TILES.doMove	= function doMove(sDir)
{
	var vert	= sessionStorage.getItem(TILES.PLAYER_POSITION_Y)-0;
	var horz	= sessionStorage.getItem(TILES.PLAYER_POSITION_X)-0;
	var moved	= true;

	if(sDir=="n")
		vert-=1;
	else if(sDir=="s")
		vert+=1;
	else if(sDir=="e")
		horz+=1;
	else if(sDir=="w")
		horz-=1;
	else
		moved = false;

	// send enter event?
	if(moved)
	{

	}

	sessionStorage.setItem(TILES.PLAYER_POSITION_Y, vert);
	sessionStorage.setItem(TILES.PLAYER_POSITION_X, horz);
}

// INTERFACE / RESPONSE TO EVENT HANDLING
TILES.doClick	= function doClick()
{
	var rightDown		= sessionStorage.getItem(TILES.MOUSE_DOWN_RIGHT);
	var posXDown		= sessionStorage.getItem(TILES.MOUSE_DOWN_POSITION_X);
	var posYDown		= sessionStorage.getItem(TILES.MOUSE_DOWN_POSITION_Y);

	var rightUp			= sessionStorage.getItem(TILES.MOUSE_UP_RIGHT);
	var posXUp			= sessionStorage.getItem(TILES.MOUSE_UP_POSITION_X);
	var posYUp			= sessionStorage.getItem(TILES.MOUSE_UP_POSITION_Y);

	// not a right click
	if(rightUp=="0")
	{
		var tileDown	= TILES.getTileCoordinatesFromPosition(posXDown, posYDown);
		var tileUp		= TILES.getTileCoordinatesFromPosition(posXUp, posYUp);

		if(			tileDown.row==tileUp.row
				&&	tileDown.col==tileUp.col
			)
		{
			var pcTileX	= sessionStorage.getItem(TILES.PLAYER_POSITION_X)-0;
			var pcTileY	= sessionStorage.getItem(TILES.PLAYER_POSITION_Y)-0;
			var destX		= pcTileX + (tileUp.col-3);
			var destY		= pcTileY + (tileUp.row-3);

			if(destX==0 && destY==0)
			{
				// clicking self
			}
			//else if( TILES.getTileIsPassable(destX,destY) || TILES.getTileIsUsable(destX, destY) )
			else
			{
				// create a path
				var path	= new TILES.PathFromAtoB(pcTileX, pcTileY, destX, destY, TILES.getTileIsPassable, 20);

				// determine direction to move
				var direction	= "";
				if(			path.start.next
						&&	TILES.getTileIsPassable( path.start.next.x, path.start.next.y )
					)
					direction		= TILES.getDirectionToDestination(pcTileX, pcTileY, path.start.next.x, path.start.next.y);
				/*
				if( path.success )
				{

				}
				else
				{

				}
				*/
				TILES.doMove( direction );
			}

			TILES.drawPlayarea();

			// erase memory of cursor position since we just deleted the cursor
			sessionStorage.setItem(TILES.CURSOR_POSITION_Y, -1);
			sessionStorage.setItem(TILES.CURSOR_POSITION_X, -1);
		}
	}
}

// ----- EVENT HANDLING

// returns 1 if the right mouse button was used. 0 if not
TILES.getRightClick	= function getRightClick(event)
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

// returns the mouse position during the event
TILES.getMousePosition	= function getMousePosition(event)
{
	var canvas			= document.getElementById(TILES.PLAYAREA);

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

	posX -= canvas.offsetLeft;
	posY -= canvas.offsetTop;

	return { x:posX, y:posY }
}


// ...MOUSE EVENTS... these happen for events that occur within the play area

TILES.onMouseDown	= function onMouseDown(event)
{
	// Determine position of mouse down
	var position		= TILES.getMousePosition(event);
	// Determine right click
	var rightclick	= TILES.getRightClick(event);

	sessionStorage.setItem(TILES.MOUSE_DOWN_RIGHT, rightclick);
	sessionStorage.setItem(TILES.MOUSE_DOWN_POSITION_X, position.x);
	sessionStorage.setItem(TILES.MOUSE_DOWN_POSITION_Y, position.y);
}

TILES.onMouseUp	= function	onMouseUp(event)
{
	// Determine position of mouse down
	var position		= TILES.getMousePosition(event);
	// Determine right click
	var rightclick	= TILES.getRightClick(event);

	sessionStorage.setItem(TILES.MOUSE_UP_RIGHT, rightclick);
	sessionStorage.setItem(TILES.MOUSE_UP_POSITION_X, position.x);
	sessionStorage.setItem(TILES.MOUSE_UP_POSITION_Y, position.y);

	// process the click
	TILES.doClick();
}

TILES.onMouseOver	= function onMouseOver(event)
{
	// Determine position of mouse over
	var position		= TILES.getMousePosition(event);

}

TILES.onMouseOut	= function onMouseOut(event)
{
	// Determine position of mouse over
	//var position		= TILES.getMousePosition(event);

}

TILES.onMouseMove	= function onMouseMove(event)
{
	// Determine position of mouse over
	var position		= TILES.getMousePosition(event);

	TILES.drawCursor(position);
}

// ... WINDOW EVENTS ...

TILES.onLoad	= function onLoad()
{
	TILES.initializeGameData(TILES.getCookie(TILES.COOKIE_NAME));

	var canvas = document.getElementById(TILES.PLAYAREA);
	// determine whether canvas is supported
	if (canvas.getContext)
	{

		TILES.drawPlayarea();

		// CANVAS EVENTS
		if(canvas.attachEvent)
		{
			canvas.attachEvent('mousedown', TILES.onMouseDown);
			canvas.attachEvent('mouseup', TILES.onMouseUp);
			canvas.attachEvent('mouseover', TILES.onMouseOver);
			canvas.attachEvent('mouseout', TILES.onMouseOut);
			canvas.attachEvent('mousemove', TILES.onMouseMove);
		}
		else
		{
			canvas.addEventListener("mousedown", TILES.onMouseDown, false );
			canvas.addEventListener("mouseup", TILES.onMouseUp, false );
			canvas.addEventListener("mouseover", TILES.onMouseOver, false );
			canvas.addEventListener("mouseout", TILES.onMouseOut, false );
			canvas.addEventListener("mousemove", TILES.onMouseMove, false );
		}

	}
	else
	{
		// canvas-unsupported code here
	}
}

TILES.onUnload = function onUnload()
{
	/*
	sessionStorage.setItem(TILES.PLAYER_POSITION_Y, "6");
	sessionStorage.setItem(TILES.PLAYER_POSITION_X, "5");
	*/

	TILES.saveGameData();
}


// PATHFINDING ------------------------------------------

TILES.getManhattanDistance	= function(fromX, fromY, toX, toY)
{
	return (Math.abs(fromX-toX) + Math.abs(fromY-toY));
}

TILES.getNeighboringTiles = function(cx, cy, topology, inclusionCallback)
{
	var result = [];

	if(!topology)
		topology	= "4";

	var dirs		= TILES.DIRS[topology];

	for (var i=0;i<dirs.length;i++)
	{
		var dir = dirs[i];
		var x = cx + dir[0];
		var y = cy + dir[1];
		if( 		!inclusionCallback
				||	inclusionCallback(x,y)
			)
			result.push([x, y]);
	}

	return result;
}

TILES.getTileIsPassable	= function(x,y)
{
	if(map[y].charAt(x)-0<7)
		return true;
	else
		return false;
}

TILES.getTileIsUsable	= function(x,y)
{
	return false;
}

TILES.getDirectionToDestination	= function(fromX,fromY,toX,toY)
{
	var sDir;

	var originID			= (fromY*32)+fromX;
	var destinationID	= (toY*32)+toX;

	var delta				= destinationID - originID

	if(delta<0)
	{
		if(delta==-1)
			sDir	= "w";
		else
			sDir	= "n";
	}
	else
	{
		if(delta==1)
			sDir	= "e";
		else
			sDir	= "s";
	}

	return sDir;
}

// Creates a path object from point A to B
// __arguments__
//	A_X, A_Y					- x and y coordinates of starting tile
//	B_X, B_Y					- x and y coordinates of target/goal
//	passableCallback	- a function, given x and y coordinates as arguments, determining whether a tile at x,y is passable
//	maxIterations			- the maximum number of nodes that the search will explore when looking for a path
										//	if nothing is given, the search will look at a maximum of 100 nodes
// __properties__
// success				- is true if a path was successfully found between the given points
// goal						- coordinate holder for goal of the path	( goal.x goal.y )
// start					- is the starting node of the path
//		start.x
//		start.y
//		start.next	- the next node in the path. which will also have a prev property which points to start
// end						- is the last node of the path, but not necessarily the goal given that searching out the path may have failed
//		end.x
//		end.y
//		end.prev		- the previous node in the path, which will also have a next property which points to the end
// [anonymous nodes] have the following properties (x y prev next)

TILES.PathFromAtoB	= function(A_X, A_Y, B_X, B_Y, passableCallback, maxIterations)
{
	// information about the Path
	this.success	= false;
	this.start		= {};	// starting mode
	this.end			= {};	// end node of the path
	/* // this is unnecessary since start has the same information
	this.from			= {
										x:	A_X,
										y:	A_Y
									};
	*/
	this.goal			= {
										x:	B_X,
										y:	B_Y
									};

	// configuration
	//this._passableCallback = passableCallback;
	if(!maxIterations)
		maxIterations	= 100;

	// private variables
	this._todo = [];
	this._done = {};

	// add the starting node
	this._addCandidate(A_X, A_Y, null);
	this.start	= this._done[A_X+","+A_Y];
	this.end		= this.start;

	// the search for the shortest path from point A to point B begins here
	var iterations	= 0;
	while (this._todo.length && iterations<=maxIterations)
	{
		iterations++;
		var node = this._todo.shift();
		if(this.end.h>node.h)
			this.end	= node;
		if (node.x == B_X && node.y == B_Y)
		{
			this.success	= true;
			this.goal			= node;
			break;
		}

		var neighbors = TILES.getNeighboringTiles(node.x, node.y, "4", passableCallback);
		for (var i=0;i<neighbors.length;i++)
		{
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];

			var id = x+","+y;
			if (id in this._done)
				continue;
			else
				this._addCandidate(x, y, node);
		}
	}

	// build path
	// by hooking up all of the next properties for each node
	var item		= this._done[this.end.x+","+this.end.y];
	while (item)
	{
		if(item.prev)
			item.prev.next	= item;
		item = item.prev;
	}
	this.end.next	= null;
}

TILES.PathFromAtoB.prototype._addCandidate	= function(x, y, prev)
{
	var obj = {
							x: x,
							y: y,
							prev: prev,
							next: null,
							g: (prev ? prev.g+1 : 0),
							h: (TILES.getManhattanDistance(x, y, this.goal.x, this.goal.y))
						}
	this._done[x+","+y] = obj;

	// insert into queue of candidates (_todo) to check next
	var f = obj.g + obj.h;
	for (var i=0;i<this._todo.length;i++)
	{
		var item = this._todo[i];
		if (f < item.g + item.h)
		{
			this._todo.splice(i, 0, obj);
			return;
		}
	}

	this._todo.push(obj);
}

// MAPS

// Objects

TILES.Area	= function (id, width, height)
{
	this.id						= id;					// unique identifier of the area
	this.height				= height;			// height+1 = number of rows of tiles in the area
	this.width				= width;			// width+1 = number of columns of tiles in the area
	this.tiles				= [];					// each item in this 2d array is a Tile object.
}

TILES.Tile	= function()
{
	// these properties may be unnecessary since this information is known when you can access the Location object
	//this.area					= area;					// object reference to the area containing this location
	//this.x						= x;						// integer - column position
	//this.y						= y;						// integer - row position

	// need to decide whether these properties are of terrain or of location
	//this.image				= new Image();
	//this.enterable		= new Number();
	//this.visibility		= new Number();
	this.terrain			= new Terrain();	// object reference to the Terrain at this location
	this.feature			= {};
	this.creature			= {};

	//this.onEnter			= null;					// function/script executed when the player enters
}

TILES.Terrain		= function()
{
	this.name					= new String();	// name of the terrain type - used in the editor
	this.image				= new Image();	// 32x32 image file - likely received as DATA
	this.enterable		= new Number();	// contains various bit flags for how the terrain is entered
	this.visibility		= new Number();	// contains various bit flags for visibility of light through the tile
}

/*
// MAP
	map			: {},
	tile		: {},
	tileset	: {},

	getMap	: function(map_name)
	{
		// use map_name to access database
		// get tileset identifier
		//height:  ,
		//width:  ,
		//tile: [],  // array of tile objects
		//tileset:  ,
	},

	getTileset	: function(tileset_name)
	{
		// ???
		// index
		// array of tile types
		// array of images
	},
*/

// INITIALIZATION --------------------------------------------------------------
// runs when script is loaded - but before page is finished loading

	// MAP
	var map						= new Array(24);
	map[ 0]="77772722227277777777777777777777";
	map[ 1]="77227222227777277777777777777777";
	map[ 2]="77279999999977772277777777777777";
	map[ 3]="77729555555922272777223333333777";
	map[ 4]="77729585585999277222277777333777";
	map[ 5]="22729553335555277277777777333777";
	map[ 6]="27729563335555222222222227377777";
	map[ 7]="77729553335555277772777722277777";
	map[ 8]="77729585585999272772777777277777";
	map[ 9]="77729555555922277722777777277777";
	map[10]="77729999999922227227777772277777";
	map[11]="77722222222227777277777772777777";
	map[12]="77272222222277722222222222222777";
	map[13]="77777777777277777777777777772777";
	map[14]="77777777722277777777722227772777";
	map[15]="77772222222222222777777722222777";
	map[16]="77722222222222222222777777777777";
	map[17]="77793339933399333972777777777777";
	map[18]="77799999333439999972227777777777";
	map[19]="77777779333339772222222222777777";
	map[20]="77777779999999722222227777777777";
	map[21]="77777777777777777777777777777777";
	map[22]="77777777777777777777777777777777";
	map[23]="77777777777777777777777777777777";

	// IMAGE CACHING
	var urlPlayerIcon	= "img/character0.png";
	var imgPlayer			= new Image();
	imgPlayer.src			= urlPlayerIcon;

	var urlCursor			= "img/tile_outline.gif";
	var imgCursor			= new Image();
	imgCursor.src			= urlCursor;

//	var	imgBak				= new Image();
//	imgBak.src				= "img/grid.png";

	var urlTile				= new Array(10);
	var imgTile				= new Array(10);
	for (var x=0; x<10; x++)
	{
		urlTile[x]			= "img/tile"+x+".png";
		imgTile[x]			= new Image();
		imgTile[x].src	= urlTile[x];
	}

// SETUP EVENTS
if(window.attachEvent)
{
	window.attachEvent('onload', TILES.onLoad);
	window.attachEvent('unload', TILES.onUnload);
}
else
{
	window.addEventListener("load", TILES.onLoad, false );
	window.addEventListener("unload", TILES.onUnload, false );
}
