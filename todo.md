## Add a new level

^

## Refactor code

Currently everything is in a single file, `app.js`

Let's refactor the code to break things out into separate files where it makes sense. For example, the level data could be in its own file.

There are some other improvements to the code that can be made -- we'll talk through these.

* Using constants instead of 'magic letters' (e.g. 'X', 'P', 'K')
* Turning `block` into a first-class object which wraps the jQuery element, and moving block-related logic into it, e.g. `block.isWall()` or `block.isWalkable()`

## Teleport potion

Let's add a new potion, the 'Teleport potion'. When you consume it, you are instantly teleported to a random, free space on the map.

## Lottery potion

Let's add a new potion, the 'Lottery potion'. When you consume it, there is a 50% chance that all enemies on the level have their health reduced by half, and a 50% chance that the player has their health reduced by half.

## Save progress

Problem: if you reload the page, you are back at the start.

Let's automatically save our progress so if you come back to the page during the same browser session, the game state is the same as where you left it. Of course, being a roguelike, if you die any saved state is gone forever.

## High scores

When you successfully complete all levels, let the player enter their initials and save the score in the browser (localstorage). On the game splash page, show the top three high scores
