ServerEvents.commandRegistry(event => {
  const {commands: Commands} = event;
  event.register('rescueevent').requires(s => s.hasPermission(2)).executes(ctx => {
    const server = ctx.source.server;
    const players = server.players;
    if (players.length < 4) {
      ctx.source.sendFailure(Text.of('Need at least 4 players online.'));
      return 0;
    }
    const target = players[Math.floor(Math.random() * players.length)];
    const world = target.level;
    const pos = target.position();
    const tx = pos.x + (Math.random() * 2000 - 1000);
    const tz = pos.z + (Math.random() * 2000 - 1000);
    const y = world.getHeight(Heightmap.Types.MOTION_BLOCKING, tx, tz) + 1;
    target.teleportTo(tx, y, tz);
    target.addEffect('minecraft:slowness', 36000, 9);
    server.tell(Text.of(target.name.string + ' has been lost! Rescue them!'));

    const interval = 20; // check every second
    const limit = 36000; // 1.5 Minecraft days
    const mobs = [
      'born_in_chaos_v1:decrepit_skeleton',
      'creepingwoods:rare_lighter',
      'undead_revamp2:bomber',
      'sons_of_sins:prowler',
      'alexsmobs:grizzly_bear'
    ];
    let time = 0;
    let spawned = false;
    const checkRescue = () => {
      time += interval;
      let rescued = false;
      for (const p of server.players) {
        if (p != target && p.distanceTo(target) <= 5) {
          if (!spawned) {
            const mob = mobs[Math.floor(Math.random() * mobs.length)];
            server.runCommandSilent(
              `execute in ${world.dimension()} run summon ${mob} ${target.x} ${target.y} ${target.z}`
            );
            spawned = true;
          }
          rescued = true;
          break;
        }
      }

      if (rescued) {
        target.removeEffect('minecraft:slowness');
        server.tell(Text.of(target.name.string + ' was saved!'));
      } else if (time >= limit) {
        target.inventory.clear();
        target.kill();
        const tx2 = tx + (Math.random() * 2000 - 1000);
        const tz2 = tz + (Math.random() * 2000 - 1000);
        const y2 = world.getHeight(Heightmap.Types.MOTION_BLOCKING, tx2, tz2) + 1;
        target.teleportTo(tx2, y2, tz2);
      } else {
        server.scheduleInTicks(interval, checkRescue);
      }
    };

    server.scheduleInTicks(interval, checkRescue);
    return 1;
  });
});
