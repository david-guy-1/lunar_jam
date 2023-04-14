/// <reference path="../types/phaser.d.ts"/>

function preload(this : Phaser.Scene ){
	console.log("preload called");
	this.load.image("player", "test.png")
	this.load.image("wall", "wall.png")
}

function create(this : Phaser.Scene ){
	
	
	this.input.on("pointerdown",function(this : Phaser.Input.InputPlugin){
		console.log(this.x, this.y);
		this.scene.data.set("x", this.x);
		this.scene.data.set("y", this.y);
	}); 
	
	this.data.set("walls", this.physics.add.group());



	
	load_level({"player_x" : 200, "player_y" : 300, walls : 
	[
		{"x" : 20, "y":30, "width":40, "height":100},
		{"x" : 220, "y":30, "width":100, "height":10}
	]
	}, this)
}

function load_level(val : any, scene : Phaser.Scene){
	// player_x, player_y, list of walls 
	// walls are : [x, y, width, height]
	if(scene.data.get("walls") === undefined){
		throw "walls must be in scene";
	}
	
	scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));
	for(var wall of val.walls){
		var wall_obj = scene.physics.add.image(0,0 ,"wall"); 
		wall_obj.setBodySize(wall.width,wall.height, false);
		wall_obj.setCrop(0,0,wall.width,wall.height);
		wall_obj.setPosition(wall.x + wall.width/2 + wall_image_width/2, wall.y + wall.height/2 + wall_image_height/2);
		// it thinks that (300, 300) is top left , because wall image size is 600x600 
		// stop walls from moving when collided with
		scene.data.get("walls").add(wall_obj);
	}

	//obj1 is player, obj2 is wall (so opposite order of here)
	scene.physics.add.collider(scene.data.get("walls"), scene.data.get("player"),collide);

	for(var wall_obj_2 of scene.data.get("walls").children.entries){
		wall_obj_2.setImmovable(true);
	}
	

}

function collide(obj1 : Phaser.Physics.Arcade.Image, obj2 : Phaser.Physics.Arcade.Image){
	console.log(obj1);
	

}

function update(this : Phaser.Scene ){
	const game = this.game;
	w = this.data.get("walls").children.entries[0];

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
		  debug: false,
		  fps: fps
	  }
  },
};

const game = new Phaser.Game(config);
document.getElementById("game").appendChild(game.canvas);

