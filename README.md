# StarSmuggler
Phaser3 game

# attributions
asteroid sprite 
https://opengameart.org/content/four-asteroids-in-four-variants?destination=node/54809
ships (kamikaze)
http://opengameart.org/users/varkalandar
energy shield
https://opengameart.org/content/shield-effect
Lasers Hitting Wall4 by inkyframes -- https://freesound.org/s/783881/ -- License: Attribution 4.0
Click SFX (Acquire) by moodyfingers -- https://freesound.org/s/810307/ -- License: Attribution 4.0
Shield.ogg by MortisBlack -- https://freesound.org/s/385051/ -- License: Attribution 4.0
THE CRASH.wav by sandyrb -- https://freesound.org/s/95078/ -- License: Attribution 4.0
cardlock-open.wav by wildweasel -- https://freesound.org/s/39028/ -- License: Attribution 4.0

Hansjörg Malthaner, and link here: http://opengameart.org/users/varkalandar

# possible assets
https://opengameart.org/content/shmup-ships

#todo

Improve destroyer - maybe it spawns fighters? / tractor beam
Zoom button
Try again to move camera when combat
make a "ready label" to show the player can play again
make viper more intelligent (slow when close)
damaged ships should get some smoke
bug: overheating explosion -> Mission failed
Bug: if the enemy is inside of an asteroid, they skip their attack
Max moves system
end level -> select next level + upgrade ship
Asteroid piercer

Plan
Create a structure of Enemies > difficulty
Improve level generator so it uses enemy tiers
generate missions
Roguelike modeedit

Mission Generator:
params:
    Difficulty Level
    Mission type
        - Destroy X ships of type X
        - Collect X coins
        - Deliver package in less than X turns