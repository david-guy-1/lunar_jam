function load_level(val, scene) {
    for (var _i = 0, _a = ["walls", "spawners", "enemies"]; _i < _a.length; _i++) {
        var item = _a[_i];
        if (scene.data.get(item) === undefined) {
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
    for (var _b = 0, _c = val.walls; _b < _c.length; _b++) {
        var wall = _c[_b];
        add_wall(wall.x, wall.y, wall.width, wall.height, wall.type, wall.switch, scene);
    }
    scene.physics.add.collider(scene.data.get("walls"), scene.data.get("player"), collide);
    for (var _d = 0, _e = scene.data.get("walls").children.entries; _d < _e.length; _d++) {
        var wall = _e[_d];
        wall.setImmovable(true);
    }
    for (var _f = 0, _g = val.spawners; _f < _g.length; _f++) {
        var spawner = _g[_f];
        add_spawner(spawner.x, spawner.y, spawner.delay, scene);
    }
    for (var _h = 0, _j = val.switches; _h < _j.length; _h++) {
        var switch_ = _j[_h];
        add_switch(switch_.x, switch_.y, switch_.key, scene);
    }
    if (val.texts) {
        for (var _k = 0, _l = val.texts; _k < _l.length; _k++) {
            var text = _l[_k];
            scene.add.text(text.x, text.y, text.key, { color: "#000000", fontSize: 20, fontStyle: "bold " });
        }
    }
}
function add_spawner(x, y, delay, scene) {
    var spawner_obj = scene.physics.add.image(x, y, "spawner");
    scene.time.addEvent({
        callback: function (scene, spawner) {
            if (!spawner.active) {
                return;
            }
            var new_image = scene.physics.add.sprite(spawner.x, spawner.y, "enemy1");
            new_image.anims.play("enemy_anim");
            scene.data.get("enemies").add(new_image);
            var v = get_vector_towards_player(scene, new_image, enemy_speed);
            new_image.setVelocity(v.x, v.y);
            var destroy_timer = scene.time.addEvent({
                callback: function (thing) {
                    if (!thing.active) {
                        return;
                    }
                    destroy_obj(thing);
                },
                args: [new_image],
                delay: enemy_lifespan
            });
            var move_timer = scene.time.addEvent({
                callback: function (scene, thing) {
                    if (!thing.active) {
                        return;
                    }
                    if (Math.random() < 0.7) {
                        move_towards_player(scene, thing, enemy_speed);
                    }
                    else {
                        var theta = Math.random() * 2 * Math.PI;
                        thing.setVelocity(Math.cos(theta) * enemy_speed, Math.sin(theta) * enemy_speed);
                    }
                },
                args: [scene, new_image],
                delay: 300,
                repeat: 20
            });
            new_image.setData("timers", [move_timer, destroy_timer]);
        },
        args: [scene, spawner_obj],
        delay: delay,
        loop: true
    });
    scene.data.get("spawners").add(spawner_obj);
}
function add_wall(x, y, width, height, type, switch_, scene) {
    var wall_obj = scene.physics.add.image(x, y, type === "metal" ? "metal_wall" : "wall");
    wall_obj.setOrigin(0, 0);
    wall_obj.setCrop(0, 0, width, height);
    wall_obj.body.setSize(width, height, false);
    wall_obj.setData("type", type);
    if (switch_) {
        scene.add.text(x, y, "O", { fontSize: "72px" });
        wall_obj.setData("switch", switch_);
        if (!isNaN(parseInt(switch_))) {
            wall_obj.setTint(parseInt(switch_), parseInt(switch_), parseInt(switch_), parseInt(switch_));
        }
    }
    scene.data.get("walls").add(wall_obj);
    wall_obj.getBounds = function () { return new Phaser.Geom.Rectangle(x, y, width, height); };
    if (wall_obj.getBounds().width == 600) {
        throw "invalid wall";
    }
}
function add_switch(x, y, key, scene) {
    var switch_obj = scene.physics.add.image(x, y, "switch");
    switch_obj.setData("key", key);
    if (!isNaN(parseInt(key))) {
        switch_obj.setTint(parseInt(key), parseInt(key), parseInt(key), parseInt(key));
    }
    scene.data.get("switches").add(switch_obj);
}
//# sourceMappingURL=adding_level.js.map