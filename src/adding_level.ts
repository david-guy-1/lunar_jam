
function load_level(val : level_data, scene : Phaser.Scene){
	// player_x, player_y, list of walls 
	// walls are : [x, y, width, height]
	for(let item of ["walls", "spawners", "enemies"]){
		if(scene.data.get(item) === undefined){
			throw item + " must be in scene";
		}
	}
	scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));
    scene.data.get("player_g").add(scene.data.get("player"));

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

    for(let switch_ of val.switches){
        add_switch(switch_.x, switch_.y, switch_.key, scene); 
    }

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
    wall_obj.setData("switch", switch_);
	scene.data.get("walls").add(wall_obj);
	//@ts-ignore 
	wall_obj.getBounds = () => new Phaser.Geom.Rectangle(x, y, width, height); 
	if(wall_obj.getBounds().width == 600){
		throw "invalid wall";
	}
  }

  function add_switch(x : number, y : number, key : string, scene : Phaser.Scene){
    var switch_obj = scene.physics.add.image(x, y, "switch");
    switch_obj.setData("key", key);
    scene.data.get("switches").add(switch_obj);
  }