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
            shoot(way_x, way_y, player.x, player.y, player_bullet_speed, scene);
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
//# sourceMappingURL=inputs.js.map