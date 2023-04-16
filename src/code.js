function preload() {
    console.log("preload called");
    this.load.spritesheet("player", "astro.png", { frameWidth: 64, frameHeight: 64 });
    this.load.image("wall", "wall.png");
    this.load.image("metal_wall", "metal_wall.png");
    this.load.image("switch", "switch.png");
    this.load.image("bomb", "bomb.png");
    this.load.spritesheet("explosion_anim_sheet", "explosion_anim.png", {
        frameWidth: 96,
        frameHeight: 96,
    });
    this.load.image("bullet", "bullet.png");
    this.load.spritesheet("enemy1", "alien.png", { frameWidth: 32, frameHeight: 32 });
    this.load.image("spawner", "spawner.png");
    this.load.spritesheet("end_img", "spaceship.png", { frameWidth: 64, frameHeight: 64 });
    this.load.image("nothing", "nothing.png");
    this.load.image("explosion_blank", "explosion_blank.png");
    this.load.audio("clap", ["sounds/clap.wav", "sounds/clap.mp3"]);
    this.load.audio("plant_bomb", ["sounds/plant_bomb.wav", "sounds/plant_bomb.mp3"]);
    this.load.audio("switch", ["sounds/switch.wav", "sounds/switch.mp3"]);
    this.load.audio("boom", ["sounds/boom.wav", "sounds/boom.mp3"]);
}
function create() {
    this.input.on("pointerdown", mousedown_call);
    this.data.set("mute", false);
    this.data.set("keys", this.input.keyboard.addKeys('Q,W,E,R,T,A,S,D,F,G'));
    this.data.set("displaying", false);
    this.data.set("player_g", this.physics.add.group());
    this.data.set("end_g", this.physics.add.group());
    this.data.set("walls", this.physics.add.group());
    this.data.set("spawners", this.physics.add.group());
    this.data.set("enemies", this.physics.add.group());
    this.data.set("player_explosions", this.physics.add.group());
    this.data.set("switches", this.physics.add.group());
    this.data.set("player_bullets", this.physics.add.group());
    this.data.set("player_bombs", this.physics.add.group());
    this.data.set("player_explosions", this.physics.add.group());
    this.anims.create({
        key: 'explosion_anim',
        frames: this.anims.generateFrameNumbers('explosion_anim_sheet', { start: 1, end: 14 }),
        frameRate: 24
    });
    this.anims.create({
        key: 'end_anim',
        frames: this.anims.generateFrameNumbers('end_img', { start: 1, end: 12 }),
        frameRate: 24,
        repeat: -1
    });
    this.anims.create({
        key: 'player_anim',
        frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
        frameRate: 7,
        repeat: -1
    });
    this.anims.create({
        key: 'player_anim',
        frames: this.anims.generateFrameNumbers('enemy1', { start: 1, end: 4 }),
        frameRate: 7,
        repeat: -1
    });
    fetch("level_data.json").then(function (x) { return x.text(); }).then(function (obj) {
        load_level(JSON.parse(obj), this);
    }.bind(this));
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
    var switches = this.data.get("switches");
    var player_g = this.data.get("player_g");
    var end_g = this.data.get("end_g");
    collisions.push({ "v1": bullets, "v2": enemies, "fn": function (x, y) { return destroy_obj(y); } });
    collisions.push({ "v1": bullets, "v2": bombs, "fn": function (x, y) { if (_this.data.get("mute") === false) {
            _this.sound.add("boom").play();
        } ; detonate_bomb(y, _this); } });
    collisions.push({ "v1": explosions, "v2": enemies, "fn": function (x, y) { return destroy_obj(y); } });
    collisions.push({ "v1": explosions, "v2": walls, "fn": function (x, y) { if (y.getData("type") === "wood") {
            destroy_obj(y);
        } } });
    collisions.push({ "v1": player_g, "v2": switches, "fn": function (x, y) { if (this.data.get("mute") === false) {
            this.sound.add("switch").play();
        } ; clear_switch(y.getData("key"), this); }.bind(this) });
    collisions.push({ "v1": player_g, "v2": end_g, "fn": function (x, y) { destroy_obj(y); alert("you win!"); }.bind(this) });
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
setTimeout(function () {
    var game = new Phaser.Game(config);
    document.getElementById("game").appendChild(game.canvas);
}, 10);
//# sourceMappingURL=code.js.map