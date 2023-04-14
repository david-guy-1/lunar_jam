function preload() {
    console.log("preload called");
    this.load.image("player", "test.jpg");
}
function create() {
    this.data.set("player", this.physics.add.image(game_width / 2, game_height / 2, "player"));
    this.input.on("pointerdown", function () {
        console.log(this.x, this.y);
        this.scene.data.set("x", this.x);
        this.scene.data.set("y", this.y);
    });
}
function update() {
    console.log("update called");
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
            debug: false,
            fps: fps
        }
    },
};
var game = new Phaser.Game(config);
document.getElementById("game").appendChild(game.canvas);
//# sourceMappingURL=code.js.map