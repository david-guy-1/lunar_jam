function move_to(x, y, scene) {
    scene.data.set("x", x);
    scene.data.set("y", y);
}
function shoot(x, y, px, py, speed, scene) {
    var v = new Phaser.Math.Vector2(x, y);
    v.setLength(speed);
    var group = scene.data.get("player_bullets");
    var bullet = scene.physics.add.image(px, py, "bullet");
    group.add(bullet);
    bullet.setVelocity(v.x, v.y);
    bullet.setData("timer", [scene.time.addEvent({ "callback": function (x) { return destroy_obj(x); }, args: [bullet], delay: 5000 })]);
}
function bomb(x, y, speed, travel_time, scene) {
    var px = scene.data.get("player").x;
    var py = scene.data.get("player").y;
    var v = new Phaser.Math.Vector2(x, y);
    v.setLength(speed);
    var group = scene.data.get("player_bombs");
    var bomb = scene.physics.add.image(px, py, "bomb");
    group.add(bomb);
    var timer = scene.time.addEvent({
        callback: function (x) { return x.setVelocity(0, 0); },
        delay: travel_time,
        args: [bomb]
    });
    bomb.setData("timers", [timer]);
    bomb.setVelocity(v.x, v.y);
}
function detonate_bomb(bomb, scene) {
    var _a = [bomb.x, bomb.y], bx = _a[0], by = _a[1];
    var explosion = scene.physics.add.image(bx, by, "explosion_blank");
    var timer = scene.time.addEvent({ callback: destroy_obj, delay: player_explosion_lifespan, args: [explosion] });
    explosion.setData("timers", [timer]);
    scene.data.get("player_explosions").add(explosion);
    var sprite = scene.add.sprite(bx, by, "explosion_anim_sheet");
    sprite.anims.play("explosion_anim");
    for (var i = 0; i < bomb_bullet_count; i++) {
        var theta = 2 * Math.PI / bomb_bullet_count * i;
        shoot(Math.cos(theta), Math.sin(theta), bx, by, player_bullet_speed, scene);
    }
    destroy_obj(bomb);
}
function clear_switch(key, scene) {
    var to_destroy = [];
    for (var _i = 0, _a = scene.data.get("walls").children.entries; _i < _a.length; _i++) {
        var item = _a[_i];
        if (item.getData("switch") === key) {
            to_destroy.push(item);
        }
    }
    for (var _b = 0, _c = scene.data.get("switches").children.entries; _b < _c.length; _b++) {
        var item = _c[_b];
        if (item.getData("key") === key) {
            to_destroy.push(item);
        }
    }
    to_destroy.forEach(function (x) { return destroy_obj(x); });
}
//# sourceMappingURL=player_actions.js.map