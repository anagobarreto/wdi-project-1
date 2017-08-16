$(function() {
  let currentLevel;  // let so it can update the level when the player dies

  function loadLevel(levelData) {
    currentLevel = levelData;

    $('audio.music').attr('src','audio/' + levelData.audio + '.mp3'); // get the audio

    setHealth(100); // reset the health
    $('.grid').html(''); // empty the grid

    // building the grid
    const level = levelData.level;
    for (let row = 0; row < level.length; row++) {
      const cols = level[row].split('');
      const rowElement = $('<ul />');
      $('.grid').append(rowElement);

      for (let col = 0; col < cols.length; col++) {
        const block = cols[col];
        const colElement = $('<li />');

        if (block === 'X') { //creating walls
          colElement.addClass('wall');
        }

        if (block === 'P') { // creating player
          colElement.addClass('player');
        }

        if (block === 'K') { // creating key
          colElement.addClass('key');
        }

        if (block === 'D') { // creating closed door
          colElement.addClass('door closed');
        }

        if (block === 'H') { // creating hp potion
          colElement.addClass('hp potion');
        }

        if (block === 'S') { // create a strong potion
          colElement.addClass('strong potion');
        }

        if (block === 'M') { // creating coins
          colElement.addClass('coin');
        }
        // enemies
        if (block === 'R') {
          colElement.addClass('rat enemy'); // add class
          colElement.attr('data-damage', 15); // dmg to player
          colElement.attr('data-hit', 25); // dmg from player
          colElement.attr('data-sound', 'squeak'); // sound of enemy
        }

        if (block === 'B') {
          colElement.addClass('bat enemy'); // add class
          colElement.attr('data-damage', 20); // dmg to player
          colElement.attr('data-hit', 25); // dmg from player
          colElement.attr('data-sound', 'batsqueak');
        }

        if (block === 'C') {
          colElement.addClass('crab enemy'); // add class
          colElement.attr('data-damage', 20); // dmg to player
          colElement.attr('data-hit', 25); // dmg from player
          colElement.attr('data-sound', 'crab');
        }

        if (block === 'V') {
          colElement.addClass('snake enemy');
          colElement.attr('data-damage', 20); // to player
          colElement.attr('data-hit', 25); // from player
          colElement.attr('data-sound', 'squeak');
        }

        if (block === 'G') { // boss
          colElement.addClass(' orion enemy');
          colElement.attr('data-damage', 40); // to player
          colElement.attr('data-hit', 20); //from player
          colElement.attr('data-sound', 'meow');
        }

        if (colElement.hasClass('enemy')) { //add health bar if the block is an enemy
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

  function canWalk(block) { // check if player can walk
    return !block.hasClass('wall') && !block.hasClass('enemy') && !block.hasClass('closed');
  }

  function setHealth(health) {
    health = Math.min(health, 100);

    $('.health').attr('data-health', health);
    $('.health .bar').css('width', health + '%');

    if (health <= 0) {
      const lives = $('.life');

      lives.last().removeClass('life');

      if (lives.length === 1) { // if only 1 life left - game over
        $('.player').replaceWith('<li></li>');
        $('.gameover').show();
        $('.grid').css('opacity' , '0.5');
      } else {
        loadLevel(currentLevel);  // reload the lvl n continue
      }
    }
  }

  function getBlock(x,y) {
    return $('.grid ul:nth-child(' + x +') li:nth-child(' + y + ')');
  }

  function hitClosestEnemyTo(block) {
    const blocks = getSurroundingBlocks(block);
    for (const enemy of blocks) {
      if (enemy.hasClass('enemy')) {
        const sound = enemy.attr('data-sound');

        setTimeout(function() {
          playSound(sound);
        }, 300);

        const health = parseInt(enemy.attr('data-health'));
        let hit = parseInt(enemy.attr('data-hit'));
        if ($('.potions .strong').length) {
          hit *= 2;
        }
        const newHealth = health - hit;

        if (newHealth <= 0) {
          enemy.replaceWith('<li></li>');
        } else {
          enemy.attr('data-health', newHealth);
          enemy.find('.bar').css('width', newHealth + '%');
        }
        return;
      }
    }
  }

  let lastAttackTime;
  var score = 0;
  var scoreText = document.querySelector('.score');

  $('body').keydown(function(e) {
    e.preventDefault();

    const player = $('.player');
    if (!player.length) {
      return ;
    }

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
      const timeNow = Date.now();
      const timeMoveDelta = timeNow - lastAttackTime;
      if (lastAttackTime && timeMoveDelta < 300) {
        return;
      } else {
        lastAttackTime = timeNow;
        hitClosestEnemyTo(player);
        playSound('smack');
      }
    }

    const goingLeft = y < originalY;

    const newBlock = getBlock(x,y);
    if (canWalk(newBlock)) {
      player.removeClass('player flip');
      newBlock.addClass('player');

      if (newBlock.hasClass('key')) {
        playSound('pickup-keys');
        newBlock.removeClass('key');
        $('.door').removeClass('closed');
      }

      if (newBlock.hasClass('coin')) {
        playSound('coin');
        newBlock.removeClass('coin');
        score ++;
        scoreText.innerHTML = 'Score: ' + score;
      }

      if (newBlock.hasClass('hp potion')) {
        playSound('potionhealth');
        newBlock.removeClass('hp potion');
        setHealth(parseInt($('.health').attr('data-health')) + 55);
      }

      if (newBlock.hasClass('strong potion')) {
        playSound('potionstrong');
        newBlock.removeClass('strong potion');

        const potion = $('<li />');
        potion.addClass('strong');
        $('.potions').append(potion);

        setTimeout(function() {
          $('.potions .strong').remove();
        }, 10000);

      }

      if (newBlock.hasClass('door')) {
        playSound('door-open');
        $('.grid').fadeOut(1200, function () {
          nextLevel();
          $('.grid').fadeIn(1200);
        });
      }

      if (goingLeft) {
        newBlock.addClass('flip');
      }
    }
  });

  function nextLevel() {
    if (levels.length) {
      loadLevel(levels.shift());
    } else {
      $('.win').show();
      $('.grid').css('opacity', '0.5');
    }
  }

  function playSound(name) {
    const audio = $('<audio />');
    audio.attr('autoplay', true);
    audio.attr('src', 'audio/' + name + '.mp3');
    $('body').append(audio);
  }

  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  setInterval(function() {
    const enemies = $('.enemy');
    enemies.each(function(){
      const enemy = $(this);
      if (Math.random() > 0.3) {
        return;
      }

      const blocks = getSurroundingBlocks(enemy);

      for (const block of blocks) {
        if (block.hasClass('player')) { // attack the player
          const damage = parseInt(enemy.attr('data-damage'));
          const playerHealth = parseInt($('.health').attr('data-health'));
          setHealth(playerHealth - damage);
          playSound('player-hit');

          return; // return to stop the enemy from moving
        }
      }

      const possibleBlocks = blocks.filter(function(block) {
        return block.length && !block.attr('class');
      });
      if (possibleBlocks.length) {
        const newBlock = random(possibleBlocks);

        if (Math.random() > 0.5) { //50% chance of enemy flipping to face other direction
          enemy.toggleClass('flip');
        }

        newBlock.replaceWith(enemy.clone());

        enemy.replaceWith('<li></li>');
      }
    });
  }, 500);

  const levels = [
    {
      audio: 'theme',
      level: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XOOROOOOXXOOROOOOOOOOOXKRX',
        'XXXOXXXOOOOXXXOXXOXOOOXOXX',
        'XOXMXOOOXXOOOOOOXOXXXOOOXX',
        'XOXXXOXXOOOXMXOOOOOOOOOXXX',
        'XOOOXOXXOXOOOOOXXXOXXXOOOX',
        'XXXOOOOXOXOXOXOXOOOOXOOXOX',
        'XOOXXOXMOXOXPXOXOMXOXOXXMX',
        'XMROOOOOOOOXXXOOOOOOXOOXOX',
        'XOOXXOOXXXOOOOOXOXOXXXOOOX',
        'XXXOOOOOOOOOMOXXOOOOOOOOXX',
        'XOOXXOXOXXXOOOOOOOXXXOXOOX',
        'XOOOXOXOOXOOOOXXXOXHXOXXOX',
        'XXOXXOXOOXOXOXMOXOOOOOXXOX',
        'DOROOOOOOOOXOXOOROOOOOOXMX',
        'XXXXXXXXXXXXXXXXXXXXXXXXXX'
      ]
    },
    {
      audio: 'theme',
      level: [
        'XXDXXXXXXXXXXXXXXXXXXXXXXX',
        'XBOOOOOOXMXOOOXMXOOOOOOOBX',
        'XOXOXOXOOOOOXOOOOOXOOXOXOX',
        'XOXOXOXOXXOOXOOXXOXXOXOXOX',
        'XOOOOOOOXOOXOXOOXOOOOOOOOX',
        'XXOXXOXXXOOOOOOOXXXOXXOXOX',
        'XMOXOOOOOOOXOXOOOOOOOXOOOX',
        'XOOXRXOXXXOXPXOXXXOXRXOOOX',
        'XXOXOOOOOOOXXXOOOOOOOXOXOX',
        'XXOXXOOXXOOOOOOOXXOOXXOXOX',
        'XXOOOOOOXOOXXXOOXOOOOOOXOX',
        'XOOXXXXOXXOXMXOXXOXXXXOXOX',
        'XOOOOOOOOOOXHXOOOOOOOOOOMX',
        'XXXOOOOXXOOOROOOXXOOOOXXXX',
        'XMOOXXOOOOXOXOXOOOMXXOOBKX',
        'XXXXXXXXXXXXXXXXXXXXXXXXXX'
      ]
    },
    {
      audio: 'daft',
      level: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XXOOOOOOOOOOMMOOOOOOOOOOXX',
        'XMOXOOXOOXOOXXOOXOOXOOXOMX',
        'XXOXOXKBXOXOOOOXOXOOXOXOXX',
        'XOOOOXXXOOOOXXOOOOXXXOOOVX',
        'XOOXOOOOOXOOOOOOXOOOOOXOOX',
        'XOXOXOOOOOSXOOXOOOOOOXRXOX',
        'XOOOOOOXXXOXPOXOXXXOOOOOOD',
        'XOXXXOOCOOOXXXXOOBOOOXXXOX',
        'XOXMXOXOOXOOOOOOOXOOOXMXOX',
        'XOXOXOXXOOOXXXXOOXXOOXOXOX',
        'XOOOOOOXOOOOMMOOOOXOOOOOOX',
        'XOXXOXOOOXXOXXOXXOOOXOXXVX',
        'XOHXOXXXOOOOXXOOOOXOXOXHOX',
        'XMOOOOOOOXOOOOOOXOOOOOOOMX',
        'XXXXXXXXXXXXXXXXXXXXXXXXXX'
      ]
    },
    {
      audio: 'daft',
      level: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XKBOOOOOOOOOOOOOOOOOOOOOOX',
        'XXXOXXOXXMOXXXOMXXOXXOXXOX',
        'XCOOXOOOOOOOOOOOOOOOXBOXOX',
        'XXOXOOXOOXXXOHXXOOXOOXOXOX',
        'XMOOXOXOSXOOOOOXOOXOXOMXOX',
        'XOXOXOOXOXOXXXOXOXOOXOXXOX',
        'XOXOOXOXOXOXPXOXOXOXOOXVOD',
        'XOXXOXOOOOOOOOOOOOOXOOXXOX',
        'XOMXOOXOXOXOXOXOXOXOOOMXOX',
        'XOXXOOXOXOXXCXXOXOXOXXOXOX',
        'XOXOOOBOOOOOOOOOOOOOOXOXOX',
        'XOXOHXXXOXOOXOOXOXXXOOBOOX',
        'XOXXOOXOOXXXXXXXOOXOOXXXOX',
        'XCOOOOOOOVOOOOOOOOOOOOOOOX',
        'XXXXXXXXXXXXXXXXXXXXXXXXXX'
      ]
    },
    {
      audio: 'castle',
      level: [
        'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        'XMOOOOOOOOOOMOOOOOOOOOOOPX',
        'XOXXXXXXXXXXXXXXXXXXXXOOOX',
        'XOXOOOOOOOOOOOOOOOOROOOOOX',
        'XOXOXXXXXXXXXXXXXXXXXXXXOX',
        'XOXOXOOOOOOOVOOOOOOOOOOXOX',
        'XOXOXOXXXXXXXXXXXXXXXXOXOX',
        'XMXBXOXKOOVOGOVOOOOOOXCXMX',
        'XOXOXOXOOOOOVOOOODXOOXOXOX',
        'XOXOXOXXXXXXXXXXXXXHSXOXOX',
        'XOXOXHOOOOOOOOOOOOOOOXOXOX',
        'XOXOXXXXXXXXXXXXXXXXXXOXOX',
        'XOXHOOOOOOOOCOOOOOOOOOOXOX',
        'XOXXXXXXXXXXXXXXXXXXXXXXOX',
        'XMOOOOOOOOOOMOOOOOOOOOOOMX',
        'XXXXXXXXXXXXXXXXXXXXXXXXXX'
      ]
    }
  ];

  $('.startmenu .button').click(function() {
    if (this.webkitRequestFullscreen) { // for chrome
      this.webkitRequestFullScreen();
    } else if (this.requestFullScreen) { //other browsers
      this.requestFullScreen();
    }

    $('.startmenu').hide();
    $('.grid').css('opacity', '1');
    nextLevel();
  });

  $('.buttonInstructions').click(function() {
    $('.startmenu').hide();
    $('.dialog.instructions').show();
  });
});
