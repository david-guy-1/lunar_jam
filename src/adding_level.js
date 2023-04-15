function load_level(val, scene) {
    for (var _i = 0, _a = ["walls", "spawners", "enemies"]; _i < _a.length; _i++) {
        var item = _a[_i];
        if (scene.data.get(item) === undefined) {
            throw item + " must be in scene";
        }
    }
    scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));
    scene.data.get("player_g").add(scene.data.get("player"));
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
}
function add_spawner(x, y, delay, scene) {
    var spawner_obj = scene.physics.add.image(x, y, "spawner");
    scene.time.addEvent({
        callback: function (scene, spawner) {
            if (!spawner.active) {
                return;
            }
            var new_image = scene.physics.add.image(spawner.x, spawner.y, "enemy1");
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
                delay: delay
            });
            var move_timer = scene.time.addEvent({
                callback: function (scene, thing) {
                    if (!thing.active) {
                        return;
                    }
                    move_towards_player(scene, thing, enemy_speed);
                },
                args: [scene, new_image],
                delay: 300,
                repeat: 20
            });
            new_image.setData("timers", [move_timer, destroy_timer]);
        },
        args: [scene, spawner_obj],
        delay: 2600,
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
    wall_obj.setData("switch", switch_);
    scene.data.get("walls").add(wall_obj);
    wall_obj.getBounds = function () { return new Phaser.Geom.Rectangle(x, y, width, height); };
    if (wall_obj.getBounds().width == 600) {
        throw "invalid wall";
    }
}
function add_switch(x, y, key, scene) {
    var switch_obj = scene.physics.add.image(x, y, "switch");
    switch_obj.setData("key", key);
    scene.data.get("switches").add(switch_obj);
}
//# sourceMappingURL=adding_level.js.map