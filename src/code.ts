/// <reference path="../types/phaser.d.ts"/>
/// <reference path="../types/lodash/index.d.ts"/>


function preload(this : Phaser.Scene ){
	console.log("preload called");
	this.load.image("player", "test.png")
	this.load.image("wall", "wall.png")
	
	this.load.image("bullet", "bullet.png")
	this.load.image("enemy1", "enemy1.png")
	this.load.image("spawner", "spawner.png")
}



function mousedown_call (this:Phaser.Input.InputPlugin ) {
	var in_click_x = this.cameras.main.scrollX + this.x;
	var in_click_y = this.cameras.main.scrollY + this.y
	move_to(in_click_x, in_click_y, this.scene);

}

function keydown_call (letter : string, x : number, y : number, scene : Phaser.Scene ) {
	var in_click_x = scene.cameras.main.scrollX + x;
	var in_click_y = scene.cameras.main.scrollY + y;
	var time = scene.time.now;
	var cooldown = scene.data.get("shoot_cd");
	var player : Phaser.Types.Physics.Arcade.ImageWithDynamicBody = scene.data.get("player") ; 
	
	if(cooldown !== undefined && cooldown > time){
		;
	} else {
		// shoot now;
		scene.data.set("shoot_cd", time + 10000);
		shoot(x, y, player_bullet_speed, scene);
		player.tint = 0xcccccc;
		scene.time.addEvent({"callback" : (x : {tint : number}) => x.tint = 0xffffff, args:[player], delay:10000})
	}

}


function move_to(x : number, y : number ,  scene : Phaser.Scene){
	scene.data.set("x", x);
	scene.data.set("y", y);
}
function shoot(x : number, y : number, speed : number, scene : Phaser.Scene){
	var px : number = scene.data.get("player").x;
	var py : number = scene.data.get("player").y;
	var v = new Phaser.Math.Vector2(x-px , y-py); 
	v.setLength(speed);
	var group :  Phaser.Physics.Arcade.Group = scene.data.get("player_bullets");
	var bullet = scene.physics.add.image(px, py, "bullet");
	group.add(bullet); // adding to group sets velocity to zero.
	bullet.setVelocity(v.x, v.y);
}

function create(this : Phaser.Scene ){

	this.input.on("pointerdown",mousedown_call);
	this.data.set("keys",  this.input.keyboard.addKeys('Q,W,E,R,T,A,S,D,F,G'));
	
	this.data.set("walls", this.physics.add.group());
	this.data.set("spawners", this.physics.add.group());
	this.data.set("enemies", this.physics.add.group());
	this.data.set("player_bullets", this.physics.add.group());

	/*
	this.time.addEvent({
		callback : shoot,
		args : [Math.random () * 300, Math.random() * 300, 1000, this],
		delay : 1000,
		loop : true
	})
	*/

	load_level({"player_x" : 200, "player_y" : 300, walls : 
	[
		{"x" : 4, "y":4, "width":40, "height":100},
		{"x" : 220, "y":30, "width":100, "height":10}
	], "spawners"  : [
		{"x" : 600, "y" : 300}
	]
	}, this)

	
	//add_wall(10, 50, 100, 200, this);
}

function load_level(val : any, scene : Phaser.Scene){
	// player_x, player_y, list of walls 
	// walls are : [x, y, width, height]
	for(var item of ["walls", "spawners", "enemies"]){
		if(scene.data.get(item) === undefined){
			throw item + " must be in scene";
		}
	}
	scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));

	scene.cameras.main.startFollow(scene.data.get("player"));
	
	for(var wall of val.walls){
		add_wall(wall.x, wall.y, wall.width, wall.height, scene); 
	}

	//obj1 is player, obj2 is wall (so opposite order of here)
	scene.physics.add.collider(scene.data.get("walls"), scene.data.get("player"),collide);
	for(var wall of scene.data.get("walls").children.entries){
		wall.setImmovable(true);
	}

	for(var spawner of val.spawners){
		add_spawner(spawner.x, spawner.y, scene)
	}



}

function get_vector_towards_player(scene : Phaser.Scene, obj : {x : number, y : number}, length : number = 1){
	var player : Phaser.Types.Physics.Arcade.ImageWithDynamicBody = scene.data.get("player"); 
	var v = new Phaser.Math.Vector2(player.x  - obj.x, player.y - obj.y );
	v.setLength(length);
	return v;
}
function move_towards_player(scene : Phaser.Scene, object : {x : number, y : number, setVelocity : (x : number,y :  number) => any}, speed : number = 1) {
	var v = get_vector_towards_player(scene, object , speed);
	object.setVelocity(v.x , v.y); 
}

function add_spawner(x : number, y : number, scene : Phaser.Scene){
	var spawner_obj = scene.physics.add.image(x,y, "spawner");
	scene.time.addEvent({
		callback : function(scene : Phaser.Scene, spawner : Phaser.Types.Physics.Arcade.ImageWithDynamicBody){
			var new_image = scene.physics.add.image(spawner.x, spawner.y, "enemy1");
			scene.data.get("enemies").add(new_image);
			var v = get_vector_towards_player(scene, new_image, enemy_speed); 
			new_image.setVelocity(v.x, v.y);
			// destroy after 5 seconds 
			var destroy_timer = scene.time.addEvent({
				callback : function(thing : Phaser.Types.Physics.Arcade.ImageWithDynamicBody){
					thing.getData("move_timer").destroy();
					thing.destroy(); 
					
				}, 
				args : [new_image],
				delay : 5000
			})
			// move towards player
			var move_timer = scene.time.addEvent({
				callback : function(scene : Phaser.Scene, thing : Phaser.Types.Physics.Arcade.ImageWithDynamicBody){
					move_towards_player(scene, thing, enemy_speed); 
				}, 
				args : [scene , new_image],
				delay : 300,
				loop : true
			})
			new_image.setData("move_timer", move_timer);
			
			new_image.setData("destroy_timer", destroy_timer);


		},
		args : [scene, spawner_obj],
		delay : 2600,
		loop : true
	})
	scene.data.get("spawners").add(spawner_obj);
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
	// 
	var keys = this.data.get("keys"); 
	if(keys.Q.isDown ){
		keydown_call("Q", this.input.x, this.input.y, this );
	}

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

