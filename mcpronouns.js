ServerEvents.commandRegistry((event) => {
  const { commands: Commands, arguments: Arguments } = event;

  event.register(
    Commands.literal("pronouns")
      .then(
        Commands.literal("set").then(
          Commands.argument(
            "pronouns",
            Arguments.GREEDY_STRING.create(event),
          ).executes((ctx) => {
            const player = ctx.source.player;
            const scoreboard = ctx.source.getServer().getScoreboard();
            const team = scoreboard.getPlayersTeam(player.getUsername());

            const newPronouns = Arguments.GREEDY_STRING.getResult(
              ctx,
              "pronouns",
            );
            const newSuffix = Text.of(` (${newPronouns})`).gray().italic();

            let targetTeam;

            if (team != null && team.getPlayers().size() == 1) {
              // Player is already alone in a team, so just set their suffix

              targetTeam = team;
            } else {
              // Player either isnt in a team or is in a team with others, so
              // we need to put them in a new team and move their prefix over
              // or else staff will lose their prefixes

              const newTeamName = `prn_${player.getUsername()}`;
              targetTeam = scoreboard.addPlayerTeam(newTeamName);

              if (team != null) {
                // Move the prefix over
                targetTeam.setPlayerPrefix(team.getPlayerPrefix());
              }

              scoreboard.addPlayerToTeam(player.getUsername(), targetTeam);
            }

            targetTeam.setPlayerSuffix(newSuffix);

            ctx.source.sendSuccess(Text.of(`[mcpronouns] Updated your pronouns to ${newPronouns}`).aqua(), false);

            return 1;
          }),
        ),
      )
      .then(
        Commands.literal("clear").executes((ctx) => {
          const player = ctx.source.player;
          const scoreboard = ctx.source.getServer().getScoreboard();
          const team = scoreboard.getPlayersTeam(player.getUsername());

          if (team != null) {
            team.setPlayerSuffix(null);
          }

          ctx.source.sendSuccess(Text.of("[mcpronouns] Cleared your pronouns").aqua(), false);

          return 1;
        }),
      ),
  );
});
