/// <reference path="../types/phaser.d.ts"/>
/// <reference path="../types/lodash/index.d.ts"/>


function preload(this : Phaser.Scene ){
	console.log("preload called");
	this.load.image("player", "test.png")
	this.load.image("wall", "wall.png")
}

function create(this : Phaser.Scene ){
	
	var x = _.range(1, 5); 
	this.input.on("pointerdown",function(this : Phaser.Input.InputPlugin){
		console.log(this.x, this.y);
		this.scene.data.set("x", this.x);
		this.scene.data.set("y", this.y);
	}); 
	
	this.data.set("walls", this.physics.add.group());



	
	load_level({"player_x" : 200, "player_y" : 300, walls : 
	[
		{"x" : 4, "y":4, "width":40, "height":100},
		{"x" : 220, "y":30, "width":100, "height":10}
	]
	}, this)

	
	//add_wall(10, 50, 100, 200, this);
}

function load_level(val : any, scene : Phaser.Scene){
	// player_x, player_y, list of walls 
	// walls are : [x, y, width, height]
	if(scene.data.get("walls") === undefined){
		throw "walls must be in scene";
	}
	
	scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));
	for(var wall of val.walls){
		add_wall(wall.x, wall.y, wall.width, wall.height, scene); 
	}

	//obj1 is player, obj2 is wall (so opposite order of here)
	scene.physics.add.collider(scene.data.get("walls"), scene.data.get("player"),collide);
	for(var wall of scene.data.get("walls").children.entries){
		wall.setImmovable(true);
	}


}

function add_wall(x: number, y: number, width: number, height: number, scene: Phaser.Scene) {
	var wall_obj = scene.physics.add.image(x, y, "wall").setOrigin(0, 0);
	wall_obj.setCrop(0, 0, width, height);
	wall_obj.body.setSize(width, height, false);
	scene.data.get("walls").add(wall_obj);
  }
  /*
function add_wall(x:number, y:number, width:number, height:number, scene:Phaser.Scene){
	var wall_obj = scene.physics.add.image(0,0 ,"wall"); 
	wall_obj.setCrop(0,0,width, height); 
	wall_obj.setSize(width, height);// crops image and object
	wall_obj.setDisplayOrigin(0,0);  // display in correct location
	wall_obj.setPosition(x, y); 
	wall_obj.body.setOffset(0, 0); // collider in correct location
	scene.data.get("walls").add(wall_obj);
	// note : need to call setImmovable !
}
*/
function collide(obj1 : Phaser.Physics.Arcade.Image, obj2 : Phaser.Physics.Arcade.Image){
	console.log(obj1);
	

}

function update(this : Phaser.Scene ){
	const game = this.game;

	var player : Phaser.Physics.Arcade.Image = this.data.get("player") ;
	if(this.data.get("x") !== undefined && this.data.get("y") !== undefined){ 
		var direction = new Phaser.Math.Vector2( this.data.get("x")-player.x  , this.data.get("y")- player.y );
		if(direction.length() < player_speed/fps){
			direction = new Phaser.Math.Vector2(0,0);
		}
		
		direction = direction.setLength(player_speed);
		
		player.setVelocity(direction.x, direction.y);
	}; 

}


const config = {
	type: Phaser.AUTO,
	width: game_width,
	height: game_height,
	parent : undefined as any,
	scene : {
		preload: preload,
		create: create,
		update: update
	} ,
	fps : {
		min : fps,
		target : fps
	},
	render : {
		powerPreference : "low-power"
	} ,
	physics: {
	  default: 'arcade',
	  arcade: {
		  fixedStep : true,
		  debug: true,
		  fps: fps
	  }
  },
};

const game = new Phaser.Game(config);
document.getElementById("game").appendChild(game.canvas);

