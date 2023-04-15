/// <reference path="../types/phaser.d.ts"/>
/// <reference path="../types/lodash/index.d.ts"/>
type db = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

type wall_data = {"x" : number, "y":number, "width":number, "height":number, type:"wood"|"metal", switch ?: string}
type spawner_data = {"x":number, "y":number, "delay" : number}; 
type switch_data = {"x":number, "y":number, "delay" : number, "key":string}; 
type level_data = {"player_x" : number, "player_y" : number, walls:wall_data[], spawners:spawner_data[], switches:switch_data[]}

function preload(this : Phaser.Scene ){
	console.log("preload called");
	this.load.image("player", "test.png")
	this.load.image("wall", "wall.png")
	this.load.image("metal_wall", "metal_wall.png")
	
	this.load.image("bomb", "bomb.png")
	this.load.spritesheet("explosion_anim_sheet", "explosion_anim.png", {
		frameWidth: 96,
		frameHeight: 96,
	})
	this.load.image("bullet", "bullet.png")
	this.load.image("enemy1", "enemy1.png")
	this.load.image("spawner", "spawner.png")
	
	this.load.image("nothing", "nothing.png")
	this.load.image("explosion_blank", "explosion_blank.png")


}



function mousedown_call (this:Phaser.Input.InputPlugin ) {
	var in_click_x = this.cameras.main.scrollX + this.x;
	var in_click_y = this.cameras.main.scrollY + this.y
	move_to(in_click_x, in_click_y, this.scene);

}

function keydown_call (letter : string, x : number, y : number, scene : Phaser.Scene ) {
	console.log(letter);
	var in_click_x = scene.cameras.main.scrollX + x;
	var in_click_y = scene.cameras.main.scrollY + y;
	var time = scene.time.now;
	var cooldown = scene.data.get("shoot_cd");
	var bomb_cooldown = scene.data.get("bomb_cd");
	var player : db = scene.data.get("player") ; 
	var way_x = in_click_x - player.x;
	var way_y = in_click_y - player.y;
	
	// shoot now;		
	if(cooldown !== undefined && cooldown > time){
		;
	} else {
		if(letter === "Q"){
			scene.data.set("shoot_cd", time + player_shoot_delay);
			shoot(way_x, way_y, player_bullet_speed, scene);
			player.tint = 0xcccccc;
			scene.time.addEvent({"callback" : (x : {tint : number}) => x.tint = 0xffffff, args:[player], delay:player_shoot_delay})
		}
	}
	// place bomb, 1s cooldown
	if(bomb_cooldown !== undefined && bomb_cooldown > time){
		;
	} else {
		if(letter === "W"){
			scene.data.set("bomb_cd", time + player_bomb_delay);
			bomb(way_x, way_y, player_bomb_speed, scene); 
		}
	}
}


function move_to(x : number, y : number ,  scene : Phaser.Scene){
	scene.data.set("x", x);
	scene.data.set("y", y);
}


function shoot(x : number, y : number, speed : number, scene : Phaser.Scene){
	var px : number = scene.data.get("player").x;
	var py : number = scene.data.get("player").y;
	var v = new Phaser.Math.Vector2(x , y); 
	v.setLength(speed);
	var group :  Phaser.Physics.Arcade.Group = scene.data.get("player_bullets");
	var bullet = scene.physics.add.image(px, py, "bullet");
	group.add(bullet); // adding to group sets velocity to zero, so add to group first before setting velocity.
	bullet.setVelocity(v.x, v.y);
}

function bomb(x : number, y : number, speed : number, scene : Phaser.Scene){
	var px : number = scene.data.get("player").x;
	var py : number = scene.data.get("player").y;
	var v = new Phaser.Math.Vector2(x , y); 
	v.setLength(speed);
	var group :  Phaser.Physics.Arcade.Group = scene.data.get("player_bombs");
	var bomb = scene.physics.add.image(px, py, "bomb");
	group.add(bomb); // adding to group sets velocity to zero, so add to group first before setting velocity.
	// destroy the bomb 
	var timer = scene.time.addEvent({
		callback : (x : any)  => x.setVelocity(0,0),
		delay : player_bomb_move_time,
		args : [bomb]
	})
	bomb.setData("timers", [timer]);

	bomb.setVelocity(v.x, v.y);
}	

function detonate_bomb(bomb : db, scene  : Phaser.Scene){
	var [bx, by] = [bomb.x, bomb.y];
	var explosion = scene.physics.add.image(bx, by, "explosion_blank");
	var timer = scene.time.addEvent({callback : destroy_obj, delay : player_explosion_lifespan, args : [explosion]});
	explosion.setData("timers", [timer]);
	scene.data.get("player_explosions").add(explosion);
	var sprite = scene.add.sprite(bx, by, "explosion_anim_sheet")
	sprite.anims.play("explosion_anim");
	destroy_obj(bomb);
	
}
function create(this : Phaser.Scene ){

	this.input.on("pointerdown",mousedown_call);
	this.data.set("keys",  this.input.keyboard.addKeys('Q,W,E,R,T,A,S,D,F,G'));
	this.data.set("walls", this.physics.add.group());
	this.data.set("spawners", this.physics.add.group());
	this.data.set("enemies", this.physics.add.group());
	this.data.set("player_bullets", this.physics.add.group());
	this.data.set("player_bombs", this.physics.add.group());
	this.data.set("player_explosions", this.physics.add.group());

	this.anims.create({
		key: 'explosion_anim',
		frames: this.anims.generateFrameNumbers('explosion_anim_sheet', { start: 1, end: 14 }),
		frameRate:24
	})


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
		{"x" : 4, "y":4, "width":40, "height":100, type:"metal"},
		{"x" : 220, "y":30, "width":100, "height":10, type:"wood"}
	], "spawners"  : [
		{"x" : 600, "y" : 300, delay : 2000}
	], "switches" : [

	]
	}, this)

	
	//add_wall(10, 50, 100, 200, this);
}

function load_level(val : level_data, scene : Phaser.Scene){
	// player_x, player_y, list of walls 
	// walls are : [x, y, width, height]
	for(let item of ["walls", "spawners", "enemies"]){
		if(scene.data.get(item) === undefined){
			throw item + " must be in scene";
		}
	}
	scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));

	scene.cameras.main.startFollow(scene.data.get("player"));
	
	for(let wall of val.walls){
		add_wall(wall.x, wall.y, wall.width, wall.height, wall.type, wall.switch, scene); 
	}

	//obj1 is player, obj2 is wall (so opposite order of here)
	scene.physics.add.collider(scene.data.get("walls"), scene.data.get("player"),collide);
	for(let wall of scene.data.get("walls").children.entries){
		wall.setImmovable(true);
	}

	for(let spawner of val.spawners){
		add_spawner(spawner.x, spawner.y,spawner.delay,  scene)
	}



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

function add_spawner(x : number, y : number, delay : number, scene : Phaser.Scene){
	var spawner_obj = scene.physics.add.image(x,y, "spawner");
	
	scene.time.addEvent({
		callback : function(scene : Phaser.Scene, spawner : db){
			if(!spawner.active){
				return;
			}
			var new_image = scene.physics.add.image(spawner.x, spawner.y, "enemy1");
			scene.data.get("enemies").add(new_image);
			var v = get_vector_towards_player(scene, new_image, enemy_speed); 
			new_image.setVelocity(v.x, v.y);
			// destroy after 5 seconds 
			var destroy_timer = scene.time.addEvent({
				callback : function(thing : db){
					if(!thing.active){
						return;
					}
					destroy_obj(thing);
				}, 
				args : [new_image],
				delay : delay
			})
			// move towards player
			var move_timer = scene.time.addEvent({
				callback : function(scene : Phaser.Scene, thing : db){
					if(!thing.active){
						return;
					}
					move_towards_player(scene, thing, enemy_speed); 
				}, 
				args : [scene , new_image],
				delay : 300,
				repeat : 20
			})
			new_image.setData("timers", [move_timer, destroy_timer]);
		},
		args : [scene, spawner_obj],
		delay : 2600,
		loop : true
	})
	scene.data.get("spawners").add(spawner_obj);
}
function add_wall(x: number, y: number, width: number, height: number, type : "metal" | "wood" ,switch_ : string | undefined, scene: Phaser.Scene) {
	var wall_obj = scene.physics.add.image(x, y, type === "metal" ? "metal_wall" : "wall")
	wall_obj.setOrigin(0, 0);
	wall_obj.setCrop(0, 0, width, height);
	wall_obj.body.setSize(width, height, false);
	wall_obj.setData("type", type);
	scene.data.get("walls").add(wall_obj);
	//@ts-ignore 
	wall_obj.getBounds = () => new Phaser.Geom.Rectangle(x, y, width, height); 
	if(wall_obj.getBounds().width == 600){
		throw "invalid wall";
	}
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
	collisions.push({"v1":bullets, "v2":enemies, "fn":(x,y) => destroy_obj(y)}); 
	
	collisions.push({"v1":bullets, "v2":bombs, "fn":(x,y) => detonate_bomb(y, this)}); 

	collisions.push({"v1":explosions, "v2":enemies, "fn":(x,y) => destroy_obj(y)}); 

	collisions.push({"v1":explosions, "v2":walls, "fn":function(x,y){if(y.getData("type")==="wood"){destroy_obj(y)}}});

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

const game = new Phaser.Game(config);
document.getElementById("game").appendChild(game.canvas);

