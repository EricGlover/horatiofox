// Dwarf_Sprite_Sheet.png

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function Player(phaser) {
  let sprite = phaser.physics.add
    .sprite(100, 450, "adventurer-right")
    .setScale(2);
  let hp = 2;
  let attackDamage = 3;
  let speed = 180;
  let directionX = 1;
  let isMoveLocked = false;
  let isAttacking = false;

  sprite.setBounce(0.2);
  sprite.setCollideWorldBounds(true);

  // create animations
  phaser.anims.create({
    key: "idle-right",
    frames: phaser.anims.generateFrameNumbers("adventurer-right", {
      start: 0,
      end: 3
    }),
    frameRate: 5
  });

  phaser.anims.create({
    key: "idle-left",
    frames: phaser.anims
      .generateFrameNumbers("adventurer-left", {
        start: 3,
        end: 6
      })
      .reverse(),
    frameRate: 5
  });
  phaser.anims.create({
    key: "walk-right",
    frames: phaser.anims.generateFrameNumbers("adventurer-right", {
      start: 8,
      end: 13
    }),
    frameRate: 10
  });
  phaser.anims.create({
    key: "walk-left",
    frames: phaser.anims
      .generateFrameNumbers("adventurer-left", {
        start: 7,
        end: 12
      })
      .reverse(),
    frameRate: 10
  });

  phaser.anims.create({
    key: "attack-right",
    frames: phaser.anims.generateFrameNumbers("attack02-right"),
    frameRate: 15
  });
  phaser.anims.create({
    key: "attack-left",
    frames: phaser.anims.generateFrameNumbers("attack02-left"),
    frameRate: 15
  });
  phaser.anims.create({
    key: "hurt-right",
    frames: phaser.anims.generateFrameNumbers("adventurer-right", {
      start: 59,
      end: 61
    }),
    frameRate: 15
  });
  phaser.anims.create({
    key: "die-right",
    frames: phaser.anims.generateFrameNumbers("adventurer-right", {
      start: 62,
      end: 71
    }),
    frameRate: 15
  });

  function attack() {
    if (isAttacking) {
      return;
    }
    isAttacking = true;
    isMoveLocked = true;
    //stop movement
    setVelocity(0);
    //play animation
    if (directionX > 0) {
      sprite.anims.play("attack-right", true);
    } else {
      sprite.anims.play("attack-left", true);
    }
    sprite.on("animationcomplete", () => {
      isMoveLocked = false;
      isAttacking = false;
      sprite.off("animationcomplete");
    });
  }

  function setVelocity(x, y) {
    // set direction
    if (x > 0) {
      directionX = 1;
    } else if (x === 0) {
      // do nothing
    } else {
      directionX = -1;
    }
    // set velocity and play animation
    if (x != undefined) {
      sprite.setVelocityX(speed * x);
    }

    // if (y != undefined) {
    //   sprite.setVelocityY(speed * y);
    // }
  }

  function move(x, y) {
    if (isMoveLocked) {
      return;
    }
    setVelocity(x, y);

    // set velocity and play animation
    if (x != undefined) {
      // play animation
      if (x > 0) {
        sprite.anims.play("walk-right", true);
      } else if (x === 0) {
        if (directionX > 0) {
          sprite.anims.play("idle-right", true);
        } else {
          sprite.anims.play("idle-left", true);
        }
      } else if (x < 0) {
        sprite.anims.play("walk-left", true);
      }
    }

    // if (y != undefined) {
    //   sprite.setVelocityY(speed * y);
    // }
  }

  return {
    sprite,
    move,
    attack
  };
}

var player;
var platforms;
var keys;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "/assets/sky.png");
  this.load.image("ground", "/assets/platform.png");
  this.load.spritesheet("adventurer-right", "/assets/adventurer-right.png", {
    frameWidth: 50,
    frameHeight: 37
  });
  this.load.spritesheet("adventurer-left", "/assets/adventurer-left.png", {
    frameWidth: 50,
    frameHeight: 37
  });
  this.load.spritesheet(
    "attack02-left",
    "/assets/adventurer/attack02-left.png",
    {
      frameWidth: 50,
      frameHeight: 37
    }
  );
  this.load.spritesheet(
    "attack02-right",
    "/assets/adventurer/attack02-right.png",
    {
      frameWidth: 50,
      frameHeight: 37
    }
  );
  // this.load.image("dwarf", "/assets/dwarf_sprite.png", {
  //   frameWidth: 32,
  //   frameHeight: 48
  // });
  //
  // this.load.spritesheet("dude", "assets/dude.png", {
  //   frameWidth: 32,
  //   frameHeight: 48
  // });
}

function create() {
  this.add.image(400, 300, "sky");

  platforms = this.physics.add.staticGroup();

  platforms
    .create(400, 568, "ground")
    .setScale(2)
    .refreshBody();

  // player = this.physics.add.sprite(100, 450, "adventurer").setScale(2);
  player = Player(this);

  this.physics.add.collider(player.sprite, platforms);

  // create the keyboard inputs
  //  Input Events
  keys = this.input.keyboard.addKeys("up,left,down,right,w,a,s,d,space");
}

function handlePlayerInput(keys) {
  // attack
  if (keys.space.isDown) {
    player.attack();
  } else {
    // move
    if (keys.left.isDown || keys.a.isDown) {
      player.move(-1);
    } else if (keys.right.isDown || keys.d.isDown) {
      player.move(1);
    } else {
      player.move(0);
    }
  }
}

function update() {
  // handle input
  // refresh player ?
  handlePlayerInput(keys);
}
