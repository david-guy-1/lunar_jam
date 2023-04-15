function preload() {
    console.log("preload called");
    this.load.image("player", "test.png");
    this.load.image("wall", "wall.png");
    this.load.image("metal_wall", "metal_wall.png");
    this.load.image("bomb", "bomb.png");
    this.load.image("explosion", "explosion.png");
    this.load.image("bullet", "bullet.png");
    this.load.image("enemy1", "enemy1.png");
    this.load.image("spawner", "spawner.png");
}
function mousedown_call() {
    var in_click_x = this.cameras.main.scrollX + this.x;
    var in_click_y = this.cameras.main.scrollY + this.y;
    move_to(in_click_x, in_click_y, this.scene);
}
function keydown_call(letter, x, y, scene) {
    console.log(letter);
    var in_click_x = scene.cameras.main.scrollX + x;
    var in_click_y = scene.cameras.main.scrollY + y;
    var time = scene.time.now;
    var cooldown = scene.data.get("shoot_cd");
    var bomb_cooldown = scene.data.get("bomb_cd");
    var player = scene.data.get("player");
    var way_x = in_click_x - player.x;
    var way_y = in_click_y - player.y;
    if (cooldown !== undefined && cooldown > time) {
        ;
    }
    else {
        if (letter === "Q") {
            scene.data.set("shoot_cd", time + player_shoot_delay);
            shoot(way_x, way_y, player_bullet_speed, scene);
            player.tint = 0xcccccc;
            scene.time.addEvent({ "callback": function (x) { return x.tint = 0xffffff; }, args: [player], delay: player_shoot_delay });
        }
    }
    if (bomb_cooldown !== undefined && bomb_cooldown > time) {
        ;
    }
    else {
        if (letter === "W") {
            scene.data.set("bomb_cd", time + player_bomb_delay);
            bomb(way_x, way_y, player_bomb_speed, scene);
        }
    }
}
function move_to(x, y, scene) {
    scene.data.set("x", x);
    scene.data.set("y", y);
}
function shoot(x, y, speed, scene) {
    var px = scene.data.get("player").x;
    var py = scene.data.get("player").y;
    var v = new Phaser.Math.Vector2(x, y);
    v.setLength(speed);
    var group = scene.data.get("player_bullets");
    var bullet = scene.physics.add.image(px, py, "bullet");
    group.add(bullet);
    bullet.setVelocity(v.x, v.y);
}
function bomb(x, y, speed, scene) {
    var px = scene.data.get("player").x;
    var py = scene.data.get("player").y;
    var v = new Phaser.Math.Vector2(x, y);
    v.setLength(speed);
    var group = scene.data.get("player_bombs");
    var bomb = scene.physics.add.image(px, py, "bomb");
    group.add(bomb);
    var timer = scene.time.addEvent({
        callback: function (x) { return x.setVelocity(0, 0); },
        delay: player_bomb_move_time,
        args: [bomb]
    });
    bomb.setData("timers", [timer]);
    bomb.setVelocity(v.x, v.y);
}
function detonate_bomb(bomb, scene) {
    var _a = [bomb.x, bomb.y], bx = _a[0], by = _a[1];
    var explosion = scene.physics.add.image(bx, by, "explosion");
    var timer = scene.time.addEvent({ callback: destroy_obj, delay: player_explosion_lifespan, args: [explosion] });
    explosion.setData("timers", [timer]);
    scene.data.get("player_explosions").add(explosion);
    destroy_obj(bomb);
}
function create() {
    this.input.on("pointerdown", mousedown_call);
    this.data.set("keys", this.input.keyboard.addKeys('Q,W,E,R,T,A,S,D,F,G'));
    this.data.set("walls", this.physics.add.group());
    this.data.set("spawners", this.physics.add.group());
    this.data.set("enemies", this.physics.add.group());
    this.data.set("player_bullets", this.physics.add.group());
    this.data.set("player_bombs", this.physics.add.group());
    this.data.set("player_explosions", this.physics.add.group());
    load_level({ "player_x": 200, "player_y": 300, walls: [
            { "x": 4, "y": 4, "width": 40, "height": 100, type: "metal" },
            { "x": 220, "y": 30, "width": 100, "height": 10, type: "wood" }
        ], "spawners": [
            { "x": 600, "y": 300, delay: 2000 }
        ]
    }, this);
}
function load_level(val, scene) {
    for (var _i = 0, _a = ["walls", "spawners", "enemies"]; _i < _a.length; _i++) {
        var item = _a[_i];
        if (scene.data.get(item) === undefined) {
            throw item + " must be in scene";
        }
    }
    scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));
    scene.cameras.main.startFollow(scene.data.get("player"));
    for (var _b = 0, _c = val.walls; _b < _c.length; _b++) {
        var wall = _c[_b];
        add_wall(wall.x, wall.y, wall.width, wall.height, wall.type, scene);
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
}
function get_vector_towards_player(scene, obj, length) {
    if (length === void 0) { length = 1; }
    var player = scene.data.get("player");
    var v = new Phaser.Math.Vector2(player.x - obj.x, player.y - obj.y);
    v.setLength(length);
    return v;
}
function move_towards_player(scene, object, speed) {
    if (speed === void 0) { speed = 1; }
    var v = get_vector_towards_player(scene, object, speed);
    object.setVelocity(v.x, v.y);
}
function destroy_obj(obj) {
    var items = obj.getData("timers");
    if (items !== undefined) {
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            item.destroy();
        }
    }
    obj.destroy();
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
function add_wall(x, y, width, height, type, scene) {
    var wall_obj = scene.physics.add.image(x, y, type === "metal" ? "metal_wall" : "wall");
    wall_obj.setOrigin(0, 0);
    wall_obj.setCrop(0, 0, width, height);
    wall_obj.body.setSize(width, height, false);
    wall_obj.setData("type", type);
    scene.data.get("walls").add(wall_obj);
    wall_obj.getBounds = function () { return new Phaser.Geom.Rectangle(x, y, width, height); };
    if (wall_obj.getBounds().width == 600) {
        throw "invalid wall";
    }
}
function collide(obj1, obj2) {
    console.log(obj1);
}
function update() {
    var _this = this;
    var game = this.game;
    var player = this.data.get("player");
    if (this.data.get("x") !== undefined && this.data.get("y") !== undefined) {
        var direction = new Phaser.Math.Vector2(this.data.get("x") - player.x, this.data.get("y") - player.y);
        if (direction.length() < player_speed / fps) {
            direction = new Phaser.Math.Vector2(0, 0);
        }
        direction = direction.setLength(player_speed);
        player.setVelocity(direction.x, direction.y);
    }
    ;
    var keys = this.data.get("keys");
    for (var item in keys) {
        if (keys[item].isDown) {
            keydown_call(item, this.input.x, this.input.y, this);
        }
    }
    var collisions = [];
    var bullets = this.data.get("player_bullets");
    var enemies = this.data.get("enemies");
    var bombs = this.data.get("player_bombs");
    var explosions = this.data.get("player_explosions");
    var walls = this.data.get("walls");
    collisions.push({ "v1": bullets, "v2": enemies, "fn": function (x, y) { return destroy_obj(y); } });
    collisions.push({ "v1": bullets, "v2": bombs, "fn": function (x, y) { return detonate_bomb(y, _this); } });
    collisions.push({ "v1": explosions, "v2": enemies, "fn": function (x, y) { return destroy_obj(y); } });
    collisions.push({ "v1": explosions, "v2": walls, "fn": function (x, y) { if (y.getData("type") === "wood") {
            destroy_obj(y);
        } } });
    for (var _i = 0, collisions_1 = collisions; _i < collisions_1.length; _i++) {
        var collider_check = collisions_1[_i];
        for (var _a = 0, _b = collider_check.v1.children.entries; _a < _b.length; _a++) {
            var item = _b[_a];
            if (item.active === false) {
                continue;
            }
            for (var _c = 0, _d = collider_check.v2.children.entries; _c < _d.length; _c++) {
                var item2 = _d[_c];
                if (item2.active === false) {
                    continue;
                }
                if (Phaser.Geom.Intersects.RectangleToRectangle(item.getBounds(), item2.getBounds())) {
                    collider_check.fn(item, item2);
                }
            }
        }
    }
}
var config = {
    type: Phaser.AUTO,
    width: game_width,
    height: game_height,
    parent: undefined,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    fps: {
        min: fps,
        target: fps
    },
    render: {
        powerPreference: "low-power"
    },
    physics: {
        default: 'arcade',
        arcade: {
            fixedStep: true,
            debug: true,
            fps: fps
        }
    },
};
var game = new Phaser.Game(config);
document.getElementById("game").appendChild(game.canvas);
//# sourceMappingURL=code.js.map