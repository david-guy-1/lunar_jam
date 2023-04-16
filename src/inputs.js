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
    if (letter === "Q") {
        if (cooldown !== undefined && cooldown > time) {
            if (scene.data.get("displaying") === false) {
                scene.data.set("displaying", true);
                var text = scene.add.text(scene.cameras.main.scrollX + game_width / 2 - 200, scene.cameras.main.scrollY + 50, "You can only shoot every 10 seconds! (".concat(((cooldown - time) / 1000).toString().slice(0, 4), ")"));
                scene.time.addEvent({
                    callback: function (text, scene) { scene.data.set("displaying", false); text.destroy(); },
                    delay: 400,
                    args: [text, scene]
                });
            }
        }
        else {
            scene.data.set("shoot_cd", time + player_shoot_delay);
            shoot(way_x, way_y, player.x, player.y, player_bullet_speed, scene);
            if (scene.data.get("mute") === false) {
                scene.sound.add("clap").play();
            }
            player.tint = 0xcccccc;
            scene.time.addEvent({ "callback": function (x) { return x.tint = 0xffffff; }, args: [player], delay: player_shoot_delay });
        }
    }
    if (letter === "W") {
        if (bomb_cooldown !== undefined && bomb_cooldown > time) {
            ;
        }
        else {
            var dist = Math.sqrt(Math.pow(way_x, 2) + Math.pow(way_y, 2));
            scene.data.set("bomb_cd", time + player_bomb_delay);
            scene.data.set("bomb_cd", time + player_bomb_delay);
            bomb(way_x, way_y, player_bomb_speed, dist / player_bomb_speed * 1000, scene);
            if (scene.data.get("mute") === false) {
                scene.sound.add("plant_bomb").play();
            }
        }
    }
}
//# sourceMappingURL=inputs.js.map