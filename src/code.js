function preload() {
    console.log("preload called");
    this.load.image("player", "test.png");
    this.load.image("wall", "wall.png");
    this.load.image("enemy1", "enemy1.png");
    this.load.image("spawner", "spawner.png");
}
function mousedown_call() {
    this.scene.data.set("x", this.x);
    this.scene.data.set("y", this.y);
}
function create() {
    var x = _.range(1, 5);
    this.input.on("pointerdown", mousedown_call);
    this.data.set("walls", this.physics.add.group());
    this.data.set("spawners", this.physics.add.group());
    this.data.set("enemies", this.physics.add.group());
    load_level({ "player_x": 200, "player_y": 300, walls: [
            { "x": 4, "y": 4, "width": 40, "height": 100 },
            { "x": 220, "y": 30, "width": 100, "height": 10 }
        ], "spawners": [
            { "x": 600, "y": 300 }
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
    for (var _b = 0, _c = val.walls; _b < _c.length; _b++) {
        var wall = _c[_b];
        add_wall(wall.x, wall.y, wall.width, wall.height, scene);
    }
    scene.physics.add.collider(scene.data.get("walls"), scene.data.get("player"), collide);
    for (var _d = 0, _e = scene.data.get("walls").children.entries; _d < _e.length; _d++) {
        var wall = _e[_d];
        wall.setImmovable(true);
    }
    for (var _f = 0, _g = val.spawners; _f < _g.length; _f++) {
        var spawner = _g[_f];
        add_spawner(spawner.x, spawner.y, scene);
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
function add_spawner(x, y, scene) {
    var spawner_obj = scene.physics.add.image(x, y, "spawner");
    scene.time.addEvent({
        callback: function (scene, spawner) {
            var new_image = scene.physics.add.image(spawner.x, spawner.y, "enemy1");
            scene.data.get("enemies").add(new_image);
            var v = get_vector_towards_player(scene, new_image, enemy_speed);
            new_image.setVelocity(v.x, v.y);
            var destroy_timer = scene.time.addEvent({
                callback: function (thing) {
                    thing.getData("move_timer").destroy();
                    thing.destroy();
                },
                args: [new_image],
                delay: 5000
            });
            var move_timer = scene.time.addEvent({
                callback: function (scene, thing) {
                    move_towards_player(scene, thing, enemy_speed);
                },
                args: [scene, new_image],
                delay: 300,
                loop: true
            });
            new_image.setData("move_timer", move_timer);
            new_image.setData("destroy_timer", destroy_timer);
        },
        args: [scene, spawner_obj],
        delay: 2600,
        loop: true
    });
    scene.data.get("spawners").add(spawner_obj);
}
function add_wall(x, y, width, height, scene) {
    var wall_obj = scene.physics.add.image(x, y, "wall").setOrigin(0, 0);
    wall_obj.setCrop(0, 0, width, height);
    wall_obj.body.setSize(width, height, false);
    scene.data.get("walls").add(wall_obj);
}
function collide(obj1, obj2) {
    console.log(obj1);
}
function update() {
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