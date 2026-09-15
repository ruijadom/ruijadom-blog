# Manual fire → automation

New missions start with manual firing. Hold Space or the Fire button on touchscreens. Choosing Developer tooling at a checkpoint unlocks and enables auto-fire. Later upgrades improve firing speed and add dual shots. Test satellites remain a separate form of automation.

Simplified controls are available in the welcome and pause screens for players who want auto-fire immediately. Controls and upgrades persist when continuing a saved mission. New missions reset earned upgrades; simplified controls remain your choice.

## Apply only this update

If you already have the previously delivered game, commit or stash your changes, then run from your repository (replace the path):

```sh
git apply --check /path/to/extracted/ruijadom-blog/game-automation.patch
git apply /path/to/extracted/ruijadom-blog/game-automation.patch
```

Do not apply the patch to the full updated source in this ZIP: it already includes the changes. If the check fails, compare the affected files rather than forcing the patch. This patch changes only the game module.

Validation: TypeScript and changed-file lint passed; all 13 logic tests passed. Browser visual and interaction checks remain pending because local preview access was denied earlier in the session.
