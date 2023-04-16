
function load_level(val : level_data, scene : Phaser.Scene){
	// player_x, player_y, list of walls 
	// walls are : [x, y, width, height]
	for(let item of ["walls", "spawners", "enemies"]){
		if(scene.data.get(item) === undefined){
			throw item + " must be in scene";
		}
	}
	var player = scene.physics.add.sprite(val.player_x, val.player_y, "player");
	player.anims.play("player_anim");
	scene.data.set("player", player);
    scene.data.get("player_g").add(player);
	
	var end = scene.physics.add.sprite(val.end_x, val.end_y, "end_img");
	end.anims.play("end_anim");
    scene.data.get("end_g").add(end);
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
	// spawn enemies
	scene.time.addEvent({
		callback : function(scene : Phaser.Scene, spawner : db){
			if(!spawner.active){
				return;
			}
			var new_image = scene.physics.add.sprite(spawner.x, spawner.y, "enemy1");
			new_image.anims.play("")
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
				delay : enemy_lifespan
			})
			// move in a random direction or towards the player
			var move_timer = scene.time.addEvent({
				callback : function(scene : Phaser.Scene, thing : db){
					if(!thing.active){
						return;
					}
					if(Math.random () < 0.7){ 
						move_towards_player(scene, thing, enemy_speed); 
					} else {
						var theta = Math.random() * 2 * Math.PI;
						thing.setVelocity(Math.cos(theta) * enemy_speed, Math.sin(theta) * enemy_speed);
					}
					
				}, 
				args : [scene , new_image],
				delay : 300,
				repeat : 20
			})
			new_image.setData("timers", [move_timer, destroy_timer]);
		},
		args : [scene, spawner_obj],
		delay : delay,
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
    if(switch_){
        wall_obj.setData("switch", switch_);
		if(!isNaN(parseInt(switch_))){
        	wall_obj.setTint(parseInt(switch_),parseInt(switch_),parseInt(switch_),parseInt(switch_));
		}
    }
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
	if(!isNaN(parseInt(key))){
		switch_obj.setTint(parseInt(key),parseInt(key),parseInt(key),parseInt(key));
	}
    scene.data.get("switches").add(switch_obj);
  }