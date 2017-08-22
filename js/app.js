const levels = window.levels;

$(function() {
  let currentLevel;  // let so it can update the level when the player dies
  let blockElements

  function loadLevel(levelData) {
    currentLevel = levelData;
    blockElements = []

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
        const BLOCK_WALL = 'X';
        const BLOCK_PLAYER = 'P';
        const BLOCK_KEY = 'K';
        const BLOCK_CLOSED_DOOR = 'D';
        const BLOCK_HP_POTION = 'H';
        const BLOCK_FIFTY_POTION = 'F';
        const BLOCK_TELEPORT_POTION = 'T';
        const BLOCK_STRONG_POTION = 'S';
        const BLOCK_COIN = 'M';
        const BLOCK_RAT = 'R';
        const BLOCK_BAT = 'B';
        const BLOCK_CRAB = 'C';
        const BLOCK_SNAKE = 'V';
        const BLOCK_BOSS = 'G';

        if (block === BLOCK_WALL) { //creating walls
          colElement.addClass('wall');
        }

        if (block === BLOCK_PLAYER) { // creating player
          colElement.addClass('player');
        }

        if (block === BLOCK_KEY) { // creating key
          colElement.addClass('key');
        }

        if (block === BLOCK_CLOSED_DOOR) { // creating closed door
          colElement.addClass('door closed');
        }

        if (block === BLOCK_HP_POTION) { // creating hp potion
          colElement.addClass('hp potion');
        }
        if (block === BLOCK_FIFTY_POTION) { // creating hp potion
          colElement.addClass('fifty potion');
        }

        if (block === BLOCK_STRONG_POTION) { // create a strong potion
          colElement.addClass('strong potion');
        }

        if (block === BLOCK_TELEPORT_POTION) { // creating hp potion
          colElement.addClass('teleport potion');
        }

        if (block === BLOCK_COIN) { // creating coins
          colElement.addClass('coin');
        }
        // enemies
        if (block === BLOCK_RAT) {
          colElement.addClass('rat enemy'); // add class
          colElement.attr('data-damage', 15); // dmg to player
          colElement.attr('data-hit', 25); // dmg from player
          colElement.attr('data-sound', 'squeak'); // sound of enemy
        }

        if (block === BLOCK_BAT) {
          colElement.addClass('bat enemy'); // add class
          colElement.attr('data-damage', 20); // dmg to player
          colElement.attr('data-hit', 25); // dmg from player
          colElement.attr('data-sound', 'batsqueak');
        }

        if (block === BLOCK_CRAB) {
          colElement.addClass('crab enemy'); // add class
          colElement.attr('data-damage', 20); // dmg to player
          colElement.attr('data-hit', 25); // dmg from player
          colElement.attr('data-sound', 'crab');
        }

        if (block === BLOCK_SNAKE) {
          colElement.addClass('snake enemy');
          colElement.attr('data-damage', 20); // to player
          colElement.attr('data-hit', 25); // from player
          colElement.attr('data-sound', 'squeak');
        }

        if (block === BLOCK_BOSS) { // boss
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
        blockElements.push(new Block(colElement))
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
    surrounding.push(getBlock(coords.x - 1, coords.y).$el); // top
    surrounding.push(getBlock(coords.x + 1, coords.y).$el); // bottom
    surrounding.push(getBlock(coords.x, coords.y - 1).$el); // left
    surrounding.push(getBlock(coords.x, coords.y + 1).$el); // right
    surrounding.push(getBlock(coords.x - 1, coords.y - 1).$el); // top left
    surrounding.push(getBlock(coords.x + 1, coords.y - 1).$el); // bottom left
    surrounding.push(getBlock(coords.x - 1, coords.y + 1).$el); // top right
    surrounding.push(getBlock(coords.x + 1, coords.y + 1).$el); // bottom right
    return surrounding;
  }
  //
  // block.isWalkable()
  // block.isWall()
  // block.isEnemy()
  // block.el

  class Block {
    constructor($el) {
      this.$el = $el
    }

    isWalkable() {
      return !this.$el.hasClass('wall') && !this.$el.hasClass('enemy') && !this.$el.hasClass('closed');
    }

    isKey() {
      return this.$el.hasClass('key')
    }

    isCoin() {
      return this.$el.hasClass('coin')
    }

    isPotion() {
      return this.$el.hasClass('potion')
    }
  }

  // const block = new Block($('div'))
  // block.isWalkable()

  // const t = new Thing()
  // t.sayHello()

  // function canWalk(block) { // check if player can walk
  //   return !block.hasClass('wall') && !block.hasClass('enemy') && !block.hasClass('closed');
  // }

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

  // canWalk(getBlock(10, 70))
  // getBlock(10, 70).isWalkable()

  function getBlock(x,y) {
    const $el = $('.grid ul:nth-child(' + x +') li:nth-child(' + y + ')');
    return new Block($el)
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

    console.log(x, y)

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
    if (newBlock.isWalkable()) {
      player.removeClass('player flip');
      newBlock.$el.addClass('player');

      // switch (newBlock.getBlockType()) {
      //   case BLOCK_KEY:
      //     newBlock.removeItem()
      //     blocks.find(e => e.getBlockType() === BLOCK_DOOR).removeItem()
      //   case BLOCK_COIN:
          // it's a coin
      // }

      if (newBlock.$el.hasClass('key')) {
        playSound('pickup-keys');
        newBlock.$el.removeClass('key');
        $('.door').removeClass('closed');
      }

      if (newBlock.$el.hasClass('coin')) {
        playSound('coin');
        newBlock.$el.removeClass('coin');
        score ++;
        scoreText.innerHTML = 'Score: ' + score;
      }

      if (newBlock.$el.hasClass('hp potion')) {
        playSound('potionhealth');
        newBlock.$el.removeClass('hp potion');
        setHealth(parseInt($('.health').attr('data-health')) + 55);
      }

      if (newBlock.$el.hasClass('teleport potion')) {
        playSound('potionstrong');
        newBlock.$el.removeClass('teleport potion');
        newBlock.$el.removeClass('player');
        var walkableBlocks = blockElements.filter(function(block) {
          return block.isWalkable() && !block.isKey() && !block.isCoin() && !block.isPotion()
        })

        var destinationBlock = walkableBlocks[Math.floor(Math.random()*walkableBlocks.length)];
        destinationBlock.$el.addClass('player');

      }

      if (newBlock.$el.hasClass('fifty potion')) {
        playSound('potionhealth');
        newBlock.$el.removeClass('fifty potion');

        if (Math.random() > 0.5) { //50% chance of enemy flipping to face other direction
          const currentHealth = parseInt($('.health').attr('data-health'))
          setHealth(
            currentHealth - (currentHealth / 2)
          );
        } else {
          const enemies = $('.enemy');
          enemies.each(function() {
            const enemy = $(this)
            const health = parseInt(enemy.attr('data-health'));
            const newHealth = health - (health / 2)
            enemy.attr('data-health', newHealth);
            enemy.find('.bar').css('width', newHealth + '%');
          })
        }
      }

      if (newBlock.$el.hasClass('strong potion')) {
        playSound('potionstrong');
        newBlock.$el.removeClass('strong potion');

        const potion = $('<li />');
        potion.addClass('strong');
        $('.potions').append(potion);

        setTimeout(function() {
          $('.potions .strong').remove();
        }, 10000);

      }

      if (newBlock.$el.hasClass('door')) {
        playSound('door-open');
        $('.grid').fadeOut(1200, function () {
          nextLevel();
          $('.grid').fadeIn(1200);
        });
      }

      if (goingLeft) {
        newBlock.$el.addClass('flip');
      }
    }
  });

  function nextLevel() {
    if (levels.length) {
      loadLevel(levels.shift());
      console.log(blockElements)
    } else {
      addLocalHighscore(score);
      $('.win').show();
      $('.grid').css('opacity', '0.5');
    }
  }

  function getLocalHighscores() {
    const highscores = localStorage.getItem('high_scores')
    return JSON.parse(highscores) || []
  }

  function addLocalHighscore(score) {
    var highscores = getLocalHighscores()
    highscores.push(score)
    localStorage.setItem(
      'high_scores',
      JSON.stringify(highscores)
    )
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


  $('.startmenu .button').click(function() {
    // if (this.webkitRequestFullscreen) { // for chrome
    //   this.webkitRequestFullScreen();
    // } else if (this.requestFullScreen) { //other browsers
    //   this.requestFullScreen();
    // }

    $('.startmenu').hide();
    $('.grid').css('opacity', '1');
    nextLevel();
  });

  $('.buttonInstructions').click(function() {
    $('.startmenu').hide();
    $('.dialog.instructions').show();
  });
  getLocalHighscores().forEach(function(score) {
    $('<li>').css({ float: 'none' }).text(score).appendTo(
      $('.highscores ul')
    )
  })
});
