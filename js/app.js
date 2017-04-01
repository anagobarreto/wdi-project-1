$(function() {
  function loadLevel(level) {
    setHealth(100);
    $('.grid').html('');

    for (let row = 0; row < level.length; row++){
      const cols = level[row].split('');
      const rowElement = $('<ul />');
      $('.grid').append(rowElement);

      for (let col = 0; col < cols.length; col++) {
        const block = cols[col];
        const colElement = $('<li />');
        if (block === 'X') {
          colElement.addClass('wall');
        }
        if (block === 'P') {
          colElement.addClass('player');
        }
        if (block === 'K') {
          colElement.addClass('key');
        }
        if (block === 'D') {
          colElement.addClass('door closed');
        }
        if (block === 'R') {
          colElement.addClass('rat enemy');
          colElement.attr('data-hit', 25);
        }
        if (colElement.hasClass('enemy')) {
          colElement.attr('data-health', 100);
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

  function canWalk(block) {
    return !block.hasClass('wall') && !block.hasClass('enemy') && !block.hasClass('closed');
  }

  function setHealth(health) {
    $('.health').attr('data-health', health);
    $('.health .bar').css('width', health + '%')
  }

  function getBlock(x,y) {
    return $('ul:nth-child(' + x +') li:nth-child(' + y + ')');
  }

  function hitClosestEnemyTo(block) {
    const blocks = getSurroundingBlocks(block);
    for (const block of blocks) {
      if (block.hasClass('enemy')) {
        const health = parseInt(block.attr('data-health'));
        const hit = parseInt(block.attr('data-hit'));
        const newHealth = health - hit;
        if (newHealth <= 0) {
          block.attr('class', '');
        } else {
          block.attr('data-health', newHealth);
        }
      }
    }
  }

  $('body').keydown(function(e) {
    const player = $('.player');
    const coords = getCoordinates(player);
    let x = coords.x;
    let y = coords.y;

    const originalX = x;
    const originalY = y;

    if (e.key === 's') {
      x++;
    }

    if (e.key === 'w') {
      x--;
    }

    if (e.key === 'a') {
      y--;
    }

    if (e.key === 'd') {
      y++;
    }

    if (e.key === ' ') {
      hitClosestEnemyTo(player);
    }

    const goingLeft = y < originalY;

    const newBlock = getBlock(x,y);
    if (canWalk(newBlock)) {
      player.removeClass('player flip');
      newBlock.addClass('player');

      if (newBlock.hasClass('key')) {
        newBlock.removeClass('key');
        $('.door').removeClass('closed');
      }

      if (newBlock.hasClass('door')) {
        nextLevel();
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
      alert('you win')
    }
  }

  const levels = [
    [
      'XXXXXXXXXXXXXXXXXX',
      'XOOOOOOOOOOOOOOOOX',
      'XOOOOOOOROOOOOOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'XOOOOOOOOOOOOKOOOX',
      'XOOOOOOOPOOOOOOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'DOOOOOOOOOOOOOOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'XXXXXXXXXXXXXXXXXX'
    ],
    [
      'XXXXXXXXXXXXXXXXXX',
      'XOOOOOOOOOOOOOOOOX',
      'XOOOOOOORRRRROOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'XOOOOOOOOOOOOKOOOX',
      'XOOOOOOOPOOOOOOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'DOOOOOOOOOOOOOOOOX',
      'XOOOOOOOOOOOOOOOOX',
      'XXXXXXXXXXXXXXXXXX'
    ]
  ];

  nextLevel();
});
