$(function() {
  let currentLevel;
  // TEST // TEST // TEST // TEST // TEST // TEST // TEST // TEST // TEST
  $(function () {
    const body = $('body');
    const backgrounds = [
      'url("images/background1.jpg")',
      'url("images/background2.jpg")',
      'url("images/backhround3.png")',
      'url("images/background4.jpg")'
    ];
    var current = 0;

    function nextBackground() {
      body.css(
        'background',
        backgrounds[current = ++current % backgrounds.length]);

      setTimeout(nextBackground, 10000);
    }
    setTimeout(nextBackground, 10000);
    body.css('background', backgrounds[0]);
  });
/// TEST // TEST // TEST // TEST // TEST // TEST // TEST // TEST

  function loadLevel(levelData) {
    currentLevel = levelData;

    // play the sound
    $('audio.music').attr('src', 'audio/' + levelData.audio + '.mp3');

    // reset health and empty grid
    setHealth(100);
    $('.grid').html('');

    // build the grid
    const level = levelData.level;
    for (let row = 0; row < level.length; row++){
      const cols = level[row].split('');
      const rowElement = $('<ul />');
      $('.grid').append(rowElement);

      for (let col = 0; col < cols.length; col++) {
        const block = cols[col];
        const colElement = $('<li />');

        // create a wall
        if (block === 'X') {
          colElement.addClass('wall');
        }

        // create a player
        if (block === 'P') {
          colElement.addClass('player');
        }

        // create a key
        if (block === 'K') {
          colElement.addClass('key');
        }
        // create a fast potion
        if (block === 'F') {
          colElement.addClass('speed potion');
        }
        // create a health potion
        if (block === 'H') {
          colElement.addClass('hp potion');
        }
        // create a strong potion
        if (block === 'S') {
          colElement.addClass('strong potion');
        }
        if (block === 'M') {
          colElement.addClass('coin');
        }

        // create a closed door
        if (block === 'D') {
          colElement.addClass('door closed');
        }

        // create a rat
        if (block === 'R') {
          colElement.addClass('rat enemy');
          colElement.attr('data-damage', 10);
          colElement.attr('data-hit', 25);
          colElement.attr('data-sound', 'squeak');
        }

        // create a cat
        if (block === 'G') {
          colElement.addClass('orion enemy');
          colElement.attr('data-damage', 20);
          colElement.attr('data-hit', 25);
          colElement.attr('data-sound', 'meow');
        }

        // create a bat
        if (block === 'B') {
          colElement.addClass('bat enemy');
          colElement.attr('data-damage', 15);
          colElement.attr('data-hit', 25);
          colElement.attr('data-sound', 'batsqueak');
        }

        // create a crab
        if (block === 'C') {
          colElement.addClass('crab enemy');
          colElement.attr('data-damage', 20);
          colElement.attr('data-hit', 25);
          colElement.attr('data-sound', 'crab');
        }
        // create a snake
        if (block === 'V') {
          colElement.addClass('snake enemy');
          colElement.attr('data-damage', 25);
          colElement.attr('data-hit', 25);
          colElement.attr('data-sound', 'squeak');
        }

        // add a health bar if this block is an enemy
        if (colElement.hasClass('enemy')) {
          colElement.attr('data-health', 100);

          const health = $('<div />');
          health.addClass('enemy-health');
          colElement.append(health);

          const bar = $('<div />');
          bar.addClass('bar');
          health.append(bar);
        }
        rowElement.append(colElement);
      }
    }
  }

  function getCoordinates(block) {
    const x = block.parent().index() + 1;
    const y = block.index() + 1;
    return {x: x, y: y};
  }

      // get all the blocks surrounding the input block
  function getSurroundingBlocks(block) {
    const surrounding = [];
    const coords = getCoordinates(block);
    surrounding.push(getBlock(coords.x - 1, coords.y)); // top
    surrounding.push(getBlock(coords.x + 1, coords.y)); // bottom
    surrounding.push(getBlock(coords.x, coords.y - 1)); // left
    surrounding.push(getBlock(coords.x, coords.y + 1)); // right
    surrounding.push(getBlock(coords.x - 1, coords.y - 1)); // top left
    surrounding.push(getBlock(coords.x + 1, coords.y - 1)); // bottom left
    surrounding.push(getBlock(coords.x - 1, coords.y + 1)); // top right
    surrounding.push(getBlock(coords.x + 1, coords.y + 1)); // bottom right
    return surrounding;
  }

      // check if the player can walk onto this block
  function canWalk(block) {
    return !block.hasClass('wall') && !block.hasClass('enemy') && !block.hasClass('closed');
  }

  function setHealth(health) {
    health = Math.min(health, 100);
    if (health <= 0) {
      const lives = $('.life');

      // if only one life left, then it's a game over
      if (lives.length === 1) {
        alert('game over');
      } else {
        // otherwise, remove a life
        lives.last().removeClass('life');

        loadLevel(currentLevel);
      }
    } else {
      $('.health').attr('data-health', health);
      $('.health .bar').css('width', health + '%');
    }
  }

  function getBlock(x,y) {
    return $('.grid ul:nth-child(' + x +') li:nth-child(' + y + ')');
  }

  // hit the closest enemy to the player
  function hitClosestEnemyTo(block) {
    const blocks = getSurroundingBlocks(block);
    for (const enemy of blocks) {
      if (enemy.hasClass('enemy')) {
        const sound = enemy.attr('data-sound');

        // play sound with a delay so punch sound can be heard
        setTimeout(function() {
          playSound(sound);
        }, 300);

        const health = parseInt(enemy.attr('data-health'));
        const hit = parseInt(enemy.attr('data-hit'));
        const newHealth = health - hit;

        if (newHealth <= 0) {
          // enemy is dead so replace them with an empty block
          enemy.replaceWith('<li></li>');
        } else {
          enemy.attr('data-health', newHealth);
          enemy.find('.bar').css('width', newHealth + '%');
        }
        return;
      }
    }
  }

  let lastMovementTime;
  let lastAttackTime;
  var score = 0;
  var scoreText = document.querySelector('.score');

  $('body').keydown(function(e) {
    e.preventDefault();

    const timeNow = Date.now();
    const timeMoveDelta = timeNow - lastMovementTime;
    // make sure you can only move 5 blocks a second
    if (lastMovementTime && timeMoveDelta < 130) {
      return;
    } else {
      lastMovementTime = timeNow;
    }

    const player = $('.player');
    const coords = getCoordinates(player);
    let x = coords.x;
    let y = coords.y;

    const originalX = x;
    const originalY = y;

    if (e.key === 's' || e.key === 'ArrowDown') {
      x++;
    }

    if (e.key === 'w' || e.key === 'ArrowUp') {
      x--;
    }

    if (e.key === 'a' || e.key === 'ArrowLeft') {
      y--;
    }

    if (e.key === 'd' || e.key === 'ArrowRight') {
      y++;
    }

    if (e.key === ' ') {
      // make sure you can only attack once every 0.4 seconds
      const timeMoveDelta = timeNow - lastAttackTime;
      if (lastAttackTime && timeMoveDelta < 400) {
        return;
      } else {
        lastAttackTime = timeNow;
        hitClosestEnemyTo(player);
        playSound('smack');
      }
    }


    const goingLeft = y < originalY;

    const newBlock = getBlock(x,y);
    console.log(newBlock.get(0));
    if (canWalk(newBlock)) {
      player.removeClass('player flip');
      newBlock.addClass('player');

      // open door in the level if the block being moved to is a key
      if (newBlock.hasClass('key')) {
        playSound('pickup-keys');
        newBlock.removeClass('key');
        $('.door').removeClass('closed');
      }

      if (newBlock.hasClass('coin')) {
        playSound('coin');
        newBlock.removeClass('coin');
        score ++;
        scoreText.innerHTML = 'Score: '+ score;
      }

      if (newBlock.hasClass('hp potion')) {
        playSound('potionhealth');
        newBlock.removeClass('hp potion');
        setHealth(parseInt($('.health').attr('data-health')) + 55);
      }

      if (newBlock.hasClass('speed potion')) {
        playSound('potionspeed');
        newBlock.removeClass('speed potion');
      }

      if (newBlock.hasClass('strong potion')) {
        playSound('potionstrong');
        newBlock.removeClass('strong potion');
      }

      // advance to the next level if the block being moved to is a door
      if (newBlock.hasClass('door')) {
        playSound('door-open');
        $('.grid').fadeOut(1200, function() {
          nextLevel();
          $('.grid').fadeIn(1200);
        });
      }

      // flip the player so they face left
      if (goingLeft) {
        newBlock.addClass('flip');
      }
    }
  });

  // load the next level on the levels array
  function nextLevel() {
    if (levels.length) {
      loadLevel(levels.shift());
    } else {
      alert('you win');
    }
  }

  // play a sound inside the audio folder
  function playSound(name) {
    const audio = $('<audio />');
    audio.attr('autoplay', true);
    audio.attr('src', 'audio/' + name + '.mp3');
    $('body').append(audio);

  }

  // get a random value from the array
  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // make enemies move every 2 seconds or attack player if nearby
  setInterval(function() {
    const enemies = $('.enemy');
    enemies.each(function(){
      const enemy = $(this);
      const blocks = getSurroundingBlocks(enemy);

      for (const block of blocks) {
        if (block.hasClass('player')) {
          // attack player
          const damage = parseInt(enemy.attr('data-damage'));
          const playerHealth = parseInt($('.health').attr('data-health'));
          setHealth(playerHealth - damage);
          playSound('player-hit');

          // return to stop the enemy from moving
          return;
        }
      }

      const possibleBlocks = blocks.filter(function(block) {
        return block.length && !block.attr('class');
      });
      if (possibleBlocks.length) {
        const newBlock = random(possibleBlocks);

        // 50% chance of the enemy flipping to face the other direction
        if (Math.random() > 0.5) {
          enemy.toggleClass('flip');
        }

        // move the enemy to the new position
        newBlock.replaceWith(enemy.clone());

        // replace the enemy's previous position with an empty block
        enemy.replaceWith('<li></li>');
      }
    });
  }, 2000);

  const levels = [
    {
      audio: 'theme',
      level: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XMOOOCOOXOXOMOXXOOOOOOOOOX',
        'XORXOXOOOOOOXOOXOOMXOOOOOD',
        'XOXOXXOXOOXOXXOOOOOOOXOOOX',
        'XOOOOOOXOMXOFHOXXXXOOOOOOX',
        'XXXXOXXXOXXOXXOXOOOOOOXXXX',
        'XROOOXOOOOOORXOXOXOOOOOOOX',
        'XOXXOXOXXXOXOXOXRMXOOOOXXX',
        'XOXMOXOXOBOXOOOXXXXOOOOOOX',
        'XOXOXXOOKHOOOOOOOOOOOOOOOX',
        'XOOROOPXXOXXXOOXOOXOOOOXXX',
        'XOXOOXOOXOXOXOOXOOXXXOOOOX',
        'XOXXOXXXOOOOOOOXOOOOOOOOOX',
        'XOOOOOOOOOXRXXXXOXXXOOOXXX',
        'XOOMXOOXOOXOOOMXXOXOOOOOOX',
        'XXXXXXXXXXXXXXXXXXXXXXXXXX'
      ]
    },



    {
      audio: 'theme',
      level: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XOXOOOMOOXOOOOOOXOOOOOOOOX',
        'XOXBXXXXOXOXXROXOXOOOXOXOX',
        'XOXOOOOOOOOOOXHXOXOOOXOXOX',
        'XOOOXOXOXXXOXOOXOXOOOXOOOX',
        'XXXOOOOOOOOOXXOOOOOOOOOOXX',
        'XOXXXOXOOXOOOOXOXOOOOXXOXX',
        'XOOOXOOXOXXXXOXOXXOOOOXOOX',
        'XOXKXOXOOXOOXOXOOOOOOOOOOX',
        'XOOXOOOXOOOOXOOXOXOXOOOXXX',
        'XXOOOOPOOXOXXOOXOOOXXOOOXX',
        'XXXOXXXOXOXOOOXXOXOXXXOOOX',
        'XOOOXMXOXOOOXXOOOOOOOOXXOX',
        'XXXXXBXOXOXOOOOXXXOOOXXOOX',
        'XMOOOOOOOOOXOOXMOROXROOOOX',
        'XXXXXXXXXXXXXXXXXXXXXXDXXX'
      ]
    },
    {
      audio: 'theme',
      level: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XOOOOXOOOOOOOOXOOOOOXXOBKX',
        'XPXXOXXXOXXXOOOOXOXOXXOOOX',
        'XOOOOOOXOOOXOVXOXOOOXXOOOX',
        'XOOXOXXXOXOOOXXOXXOOOXXOOX',
        'XOXXOOOHOXOXOOOOOOOOXXOOOX',
        'XOXOOXOXOXOXXOXXOXXXXOOOXX',
        'XOOOOOOOXXOOOOOXOOOOOXXOOX',
        'XOXXOXOXOOBOOXOOOOXXOOOXOX',
        'XOOXOOOOOXXXOXXOXOOOXXOOOX',
        'XOXXOXBXOOOOOOOHXXOOOXXXOX',
        'XOOOOOOOOXXXXXOOOOOOOXXXOX',
        'XXXOXXXOOXOOOXOXXXOXXXOOOX',
        'DOXXXVXXOXOXOXOOOXXXOOOXOX',
        'XOOOOOOOOXOOOOOXOOOOOOOOOX',
        'XXXXXXXXXXXXXXXXXXXXXXXXXX'
      ]
    }
  ];

  nextLevel();
});
