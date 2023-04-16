/// <reference path="../types/phaser.d.ts"/>
/// <reference path="../types/lodash/index.d.ts"/>
type db = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

type wall_data = {"x" : number, "y":number, "width":number, "height":number, type:"wood"|"metal", switch ?: string}
type spawner_data = {"x":number, "y":number, "delay" : number}; 
type switch_data = {"x":number, "y":number,  "key":string}; 
type level_data = {"player_x" : number, "player_y" : number, walls:wall_data[], spawners:spawner_data[], switches:switch_data[], "end_x" : number, "end_y" : number}

function preload(this : Phaser.Scene ){
	console.log("preload called");
	this.load.spritesheet("player", "astro.png",{frameWidth:54/2, frameHeight : 72/2})
	this.load.image("wall", "wall.png")
	this.load.image("metal_wall", "metal_wall.png")
	
	this.load.image("switch", "switch.png")
	this.load.image("bomb", "bomb.png")
	this.load.spritesheet("explosion_anim_sheet", "explosion_anim.png", {
		frameWidth: 768/4,
		frameHeight: 768/4,
	})
	this.load.image("bullet", "bullet.png")
	this.load.spritesheet("enemy1", "alien.png", {frameWidth:32, frameHeight : 32})
	this.load.image("spawner", "spawner.png")
	this.load.spritesheet("end_img", "spaceship.png", {frameWidth:64, frameHeight : 64})
	
	
	this.load.image("nothing", "nothing.png")
	this.load.image("explosion_blank", "explosion_blank.png")

	this.load.audio("clap", ["sounds/clap.wav", "sounds/clap.mp3"]);
	this.load.audio("plant_bomb", ["sounds/plant_bomb.wav", "sounds/plant_bomb.mp3"]);
	this.load.audio("switch",[ "sounds/switch.wav","sounds/switch.mp3"]);
	this.load.audio("boom", ["sounds/boom.wav", "sounds/boom.mp3"]);
}



function create(this : Phaser.Scene ){

	this.input.on("pointerdown",mousedown_call);
	this.data.set("mute",false);
	this.data.set("keys",  this.input.keyboard.addKeys('Q,W,E,R,T,A,S,D,F,G'));
	this.data.set("displaying", false);

	this.data.set("player_g", this.physics.add.group());
	this.data.set("end_g", this.physics.add.group());
	this.data.set("walls", this.physics.add.group());
	this.data.set("spawners", this.physics.add.group());
	this.data.set("enemies", this.physics.add.group());	this.data.set("player_explosions", this.physics.add.group());
	this.data.set("switches", this.physics.add.group());

	this.data.set("player_bullets", this.physics.add.group());
	this.data.set("player_bombs", this.physics.add.group());
	this.data.set("player_explosions", this.physics.add.group());

	this.anims.create({
		key: 'explosion_anim',
		frames: this.anims.generateFrameNumbers('explosion_anim_sheet', { start: 1, end: 14 }),
		frameRate:24
	})
	this.anims.create({
		key: 'end_anim',
		frames: this.anims.generateFrameNumbers('end_img', { start: 1, end: 12 }),
		frameRate:24,
		repeat : -1
	})
	this.anims.create({
		key: 'player_anim',
		frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
		frameRate:7,
		repeat : -1
	})

	this.anims.create({
		key: 'player_anim',
		frames: this.anims.generateFrameNumbers('enemy1', { start: 1, end: 4 }),
		frameRate:7,
		repeat : -1
	})
	/*
	this.time.addEvent({
		callback : shoot,
		args : [Math.random () * 300, Math.random() * 300, 1000, this],
		delay : 1000,
		loop : true
	})
	*/

	/*
	load_level({"player_x" : 200, "player_y" : 300, "end_x" : 500, "end_y" : 1000,  walls : 
	[
		{"x" : 4, "y":4, "width":40, "height":100, type:"metal"},
		{"x" : 220, "y":30, "width":100, "height":10, type:"wood"},
		{"x" : 220, "y":400, "width":60, "height":30, type:"metal", switch:"0xff7777"},
		{"x" : 820, "y":400, "width":60, "height":30, type:"metal", switch:"0xff7777"}
	], "spawners"  : [
		{"x" : 600, "y" : 300, delay : 2000}
	], "switches" : [
		{"x":900, "y": 300, key : "0xff7777"}
	]
	}, this)
*/
// load a level
	fetch("level_data.json").then((x) => x.text()).then(function(obj : string) {
		load_level(JSON.parse(obj), this)
	}.bind(this));


	
	
	//add_wall(10, 50, 100, 200, this);
}


function get_vector_towards_player(scene : Phaser.Scene, obj : {x : number, y : number}, length : number = 1){
	var player : db = scene.data.get("player"); 
	var v = new Phaser.Math.Vector2(player.x  - obj.x, player.y - obj.y );
	v.setLength(length);
	return v;
}
function move_towards_player(scene : Phaser.Scene, object : {x : number, y : number, setVelocity : (x : number,y :  number) => any}, speed : number = 1) {
	var v = get_vector_towards_player(scene, object , speed);
	object.setVelocity(v.x , v.y); 
}

function destroy_obj(obj : {destroy : () => any, getData : any}){
	var items : ({destroy : () => void })[] | undefined = obj.getData("timers");
	if(items !== undefined){
		for(let item of items){
			item.destroy();
		}
	}
	obj.destroy();
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
	// check keys 
	var keys = this.data.get("keys"); 
	for(let item in keys) {
		if(keys[item].isDown ){
			keydown_call(item, this.input.x, this.input.y, this );
		}
	}
	// bullet and enemy collision
	var collisions : {v1 :  Phaser.Physics.Arcade.Group, v2 :  Phaser.Physics.Arcade.Group, fn : (x : db, y : db) => any }[] = [];
	var bullets :  Phaser.Physics.Arcade.Group= this.data.get("player_bullets");
	var enemies :  Phaser.Physics.Arcade.Group= this.data.get("enemies");
	var bombs :  Phaser.Physics.Arcade.Group= this.data.get("player_bombs");
	var explosions :  Phaser.Physics.Arcade.Group= this.data.get("player_explosions");
	var walls :  Phaser.Physics.Arcade.Group= this.data.get("walls");
	var switches :  Phaser.Physics.Arcade.Group= this.data.get("switches");
	var player_g :  Phaser.Physics.Arcade.Group= this.data.get("player_g");
	var end_g :  Phaser.Physics.Arcade.Group= this.data.get("end_g");


	collisions.push({"v1":bullets, "v2":enemies, "fn":(x,y) => destroy_obj(y)}); 
	
	collisions.push({"v1":bullets, "v2":bombs, "fn":(x,y) => {if(this.data.get("mute") === false ) { this.sound.add("boom").play();}; detonate_bomb(y, this)}} ); 

	collisions.push({"v1":explosions, "v2":enemies, "fn":(x,y) => destroy_obj(y)}); 

	collisions.push({"v1":explosions, "v2":walls, "fn":function(x,y){if(y.getData("type")==="wood"){destroy_obj(y)}}});

	collisions.push({"v1":player_g, "v2":switches, "fn":function(x : any,y : any){if(this.data.get("mute") === false ) { this.sound.add("switch").play();}; clear_switch(y.getData("key"), this)}.bind(this)});

	collisions.push({"v1":player_g, "v2":end_g, "fn":function(x : any,y : any){destroy_obj(y); alert("you win!")}.bind(this)});

	for(let collider_check of collisions){
		for(let item of collider_check.v1.children.entries){
			if(item.active === false){
				continue;
			}
			for(let item2 of collider_check.v2.children.entries){
				if(item2.active === false ){
					continue;
				}
				if(Phaser.Geom.Intersects.RectangleToRectangle((item as db).getBounds() ,(item2 as db).getBounds())){
					collider_check.fn(item as db, item2 as db); 
				}
			}
		}
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
setTimeout(() => {
const game = new Phaser.Game(config);
document.getElementById("game").appendChild(game.canvas);
}, 10);
