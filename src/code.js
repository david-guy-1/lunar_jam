System.register(["lodash"], function (exports_1, context_1) {
    "use strict";
    var lodash_1, config, game;
    var __moduleName = context_1 && context_1.id;
    function preload() {
        console.log("preload called");
        this.load.image("player", "test.png");
        this.load.image("wall", "wall.png");
    }
    function create() {
        var x = lodash_1.default.range(1, 5);
        this.input.on("pointerdown", function () {
            console.log(this.x, this.y);
            this.scene.data.set("x", this.x);
            this.scene.data.set("y", this.y);
        });
        this.data.set("walls", this.physics.add.group());
        load_level({ "player_x": 200, "player_y": 300, walls: [
                { "x": 4, "y": 4, "width": 40, "height": 100 },
                { "x": 220, "y": 30, "width": 100, "height": 10 }
            ]
        }, this);
    }
    function load_level(val, scene) {
        if (scene.data.get("walls") === undefined) {
            throw "walls must be in scene";
        }
        scene.data.set("player", scene.physics.add.image(val.player_x, val.player_y, "player"));
        for (var _i = 0, _a = val.walls; _i < _a.length; _i++) {
            var wall = _a[_i];
            add_wall(wall.x, wall.y, wall.width, wall.height, scene);
        }
        scene.physics.add.collider(scene.data.get("walls"), scene.data.get("player"), collide);
        for (var _b = 0, _c = scene.data.get("walls").children.entries; _b < _c.length; _b++) {
            var wall = _c[_b];
            wall.setImmovable(true);
        }
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
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }
        ],
        execute: function () {
            config = {
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
            game = new Phaser.Game(config);
            document.getElementById("game").appendChild(game.canvas);
        }
    };
});
//# sourceMappingURL=code.js.map