

function move_to(x : number, y : number ,  scene : Phaser.Scene){
	scene.data.set("x", x);
	scene.data.set("y", y);
}


function shoot(x : number, y : number, px : number, py : number, speed : number, scene : Phaser.Scene){
	//var px : number = scene.data.get("player").x;
	//var py : number = scene.data.get("player").y;
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
    for(var i=0; i < bomb_bullet_count; i++){
        var theta=2 * Math.PI / bomb_bullet_count * i
        shoot(Math.cos(theta), Math.sin(theta), bx, by, player_bullet_speed, scene); 
    }
	destroy_obj(bomb);
	
}

function clear_switch(key : string, scene : Phaser.Scene){
    // all associated walls need to be destroyed
    for(var item of scene.data.get("walls").children.entries){
        if(item.getData("switch") === key){
            destroy_obj(item);
        }
    }
    // destroy the switch as well
    for(var item of scene.data.get("switches").children.entries){
        if(item.getData("key") === key){
            destroy_obj(item);
        }
    }
    
}