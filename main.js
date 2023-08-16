var currentVersion = 0.3;
var gameSpeed = 1;
var playerData = {
  spawnPoint: newSave(),
  isDead: false,
  spawnDelay: Math.floor((options.spawnDelay * 100) / 3),
  spawnTimer: Math.floor((options.spawnDelay * 100) / 3),
  levelCoord: [0, 0],
  get currentLevel() {
    return worldMap[playerData.levelCoord[0]][playerData.levelCoord[1]];
  },
  triggers: [],
  godMode: false,
  reachedHub: false,
  deaths: 0,
  timePlayed: 0,
  branchTime: 0,
  finalDeaths: 0,
  finalTimePlayed: 0,
  gameComplete: false
};
var player1 = {
  x: 0,
  y: 0,
  xv: 0,
  yv: 0,
  g: 325,
  canWalljump: false,
  canJump: true,
  currentJumps: 0,
  maxJumps: 1,
  moveSpeed: 600,
  noFriction: false,
};
var player2 = {
  x: 0,
  y: 0,
  xv: 0,
  yv: 0,
  g: 325,
  canWalljump: false,
  canJump: true,
  currentJumps: 0,
  maxJumps: 1,
  moveSpeed: 600,
  noFriction: false,
};
const control = {
  left1: false,
  right1: false,
  up1: false,
  down1: false,
  space1: false,
  left2: false,
  right2: false,
  up2: false,
  down2: false,
  madeFirstInput: false
};
const hasHitbox = [1, 5, 11, 40];
const prefix = diff === "" ? "" : "../";
const music = {
  hub: initAudio(prefix + "audio/jap_hub.wav"),
  grav: initAudio(prefix + "audio/jap_grav.wav"),
  mj: initAudio(prefix + "audio/jap_mj.wav"),
  wj: initAudio(prefix + "audio/jap_wj.wav"),
  speed: initAudio(prefix + "audio/jap_speed.wav"),
  final: initAudio(prefix + "audio/jap_final.wav"),
  end: initAudio(prefix + "audio/jap_end.wav")
};
var currentlyPlaying = null;
function initAudio(url) {
  let a = new Audio(url);
  a.loop = true;
  a.volume = 0;
  return a;
}
var fadein = null;
var fadeout = null;
var toFadein = null;
function playAudio(target) {
  if (currentlyPlaying === target) return;
  if (currentlyPlaying) {
    if (fadeout) {
      fadeout.volume = 0;
      fadeout.pause();
      fadeout.currentTime = 0;
      fadeout = null;
    }
    fadeout = currentlyPlaying;
  }
  if (toFadein) clearTimeout(toFadein);
  if (target) {
    toFadein = setTimeout(function () {
      target.play();
      fadein = target;
      currentlyPlaying = target;
      toFadein = null;
    }, 2500);
  } else toFadein = null;
}
function updateAudio() {
  switch (true) {
    case playerData.currentLevel === 8 || playerData.currentLevel === 9:
      playAudio(music.hub);
      break;
    case playerData.currentLevel >= 10 && playerData.currentLevel <= 27:
      playAudio(music.grav);
      break;
    case playerData.currentLevel >= 28 && playerData.currentLevel <= 45:
      playAudio(music.mj);
      break;
    case playerData.currentLevel >= 46 && playerData.currentLevel <= 64:
      playAudio(music.wj);
      break;
    case playerData.currentLevel >= 65 && playerData.currentLevel <= 76:
      playAudio(music.speed);
      break;
    case playerData.currentLevel >= 77 && playerData.currentLevel <= 87:
      playAudio(music.final);
      break;
    case playerData.currentLevel === 88:
      playAudio(music.end);
      break;
    default:
      playAudio(null);
  }
}
var audioInitDone = false;
document.addEventListener("keydown", function (input) {
  if (!audioInitDone) {
    updateAudio();
    audioInitDone = true;
  }
  let key = input.code;
  switch (key) {
    case "ArrowUp":
      control.up2 = true;
      control.madeFirstInput = true;
      break;
    case "KeyW":
      control.up1 = true;
      control.madeFirstInput = true;
      break;
    case "ArrowDown":
      control.down2 = true;
      control.madeFirstInput = true;
      break;
    case "KeyS":
      control.down1 = true;
      control.madeFirstInput = true;
      break;
    case "ArrowLeft":
      control.left2 = true;
      control.madeFirstInput = true;
      break;
    case "KeyA":
      control.left1 = true;
      control.madeFirstInput = true;
      break;
    case "ArrowRight":
      control.right2 = true;
      control.madeFirstInput = true;
      break;
    case "KeyD":
      control.right1 = true;
      control.madeFirstInput = true;
      break;
    case "Space":
      control.space1 = true;
      control.madeFirstInput = true;
      break;
    case "Delete":
      wipeSave();
      break;
    case "KeyR":
      if (input.shiftKey) {
        if (playerData.reachedHub) {
          if (confirm("Are you sure you want to go to the hub?")) {
            playerData.spawnPoint = [
              7,
              5,
              5,
              4,
              325,
              1,
              600,
              [...playerData.triggers],
              currentVersion,
              true,
              playerData.timePlayed,
              playerData.deaths,
              playerData.gameComplete,
              playerData.finalTimePlayed,
              playerData.finalDeaths,
              0
            ];
            respawn();
          }
        } else alert("You have not reached the hub yet.");
      } else {
        playerData.isDead = true;
        playerData.spawnTimer = 0;
      }
      break;
    case "KeyC":
      openInfo();
      break;
    case "Backslash":
      if (input.shiftKey) {
        importSave();
      } else exportSave();
      break;
    default:
      break;
  }
});

document.addEventListener("keyup", function (input) {
  let key = input.code;
  switch (key) {
    case "ArrowUp":
      control.up2 = false;
      if (!control.down2) player2.canJump = true;
      break;
    case "KeyW":
      control.up1 = false;
      if (!control.down1 && !control.space1) player1.canJump = true;
      break;
    case "ArrowDown":
      control.down2 = false;
      if (!control.up2) player2.canJump = true;
      break;
    case "KeyS":
      control.down1 = false;
      if (!control.up1 && !control.space1) player1.canJump = true;
      break;
    case "ArrowLeft":
      control.left2 = false;
      break;
    case "KeyA":
      control.left1 = false;
      break;
    case "ArrowRight":
      control.right2 = false;
      break;
    case "KeyD":
      control.right1 = false;
      break;
    case "Space":
      control.space1 = false;
      if (!control.up1 && !control.down1) player1.canJump = true;
      break;
    default:
      break;
  }
});

var lastFrame = 0;
var simReruns = 20;
var sinceLastSave = 0;
var branchInProgress = true;
function nextFrame(timeStamp) {
  // setup stuff
  let dt = timeStamp - lastFrame;
  if (dt === 0) {
    window.requestAnimationFrame(nextFrame);
    return;
  }
  if (control.madeFirstInput) {
    playerData.timePlayed += dt;
    if (branchInProgress) playerData.branchTime += dt;
  }
  playerData.spawnPoint[10] = playerData.timePlayed;
  playerData.spawnPoint[15] = playerData.branchTime;
  id("timePlayed").innerHTML = formatTime(playerData.timePlayed);
  id("branchTime").innerHTML = formatTime(playerData.branchTime);
  id("timer").innerHTML =
    formatTime(playerData.timePlayed, false) +
    "<br>" +
    formatTime(playerData.branchTime, false);
  sinceLastSave += dt;
  if (sinceLastSave >= 5000) {
    save();
    sinceLastSave -= 5000;
  }
  if (fadein) {
    fadein.volume = Math.min(
      fadein.volume + (dt / 5000) * options.volume,
      options.volume
    );
    if (fadein.volume === options.volume) fadein = null;
  }
  if (fadeout) {
    fadeout.volume = Math.max(fadeout.volume - (dt / 5000) * options.volume, 0);
    if (fadeout.volume === 0) {
      fadeout.pause();
      fadeout.currentTime = 0;
      fadeout = null;
    }
  }
  dt *= gameSpeed;
  lastFrame = timeStamp;
  if (dt < 100 * gameSpeed) {
    dt = dt / simReruns;
    let xprev1 = player1.x;
    let yprev1 = player1.y;
    let xprev2 = player2.x;
    let yprev2 = player2.y;
    let onFloor1 = false;
    let onFloor2 = false;
    let lvlxprev = playerData.levelCoord[0];
    let lvlyprev = playerData.levelCoord[1];
    let triggersPrev = [...playerData.triggers];
    let shouldDrawLevel = false;
    for (let i = 0; i < simReruns; i++) {
      // some weird fricker to do stuff
      if (!playerData.isDead) {
        player1.x += (player1.xv * dt) / 500;
        player1.y +=
          (player1.yv * dt) / 500 + ((player1.g / 2) * dt * dt) / 500 / 500;
        player2.x += (player2.xv * dt) / 500;
        player2.y +=
          (player2.yv * dt) / 500 + ((player2.g / 2) * dt * dt) / 500 / 500;
        // velocity change
        if (!player1.noFriction) {
          player1.xv *= Math.pow(0.5, dt / 6);
          if (Math.abs(player1.xv) < 5) player1.xv = 0;
        }
        if (!player2.noFriction) {
          player2.xv *= Math.pow(0.5, dt / 6);
          if (Math.abs(player2.xv) < 5) player2.xv = 0;
        }
        if (
          (player1.yv > player1.g && player1.g > 0) ||
          (player1.yv < player1.g && player1.g < 0)
        ) {
          player1.yv -= (player1.g * dt) / 500;
          if (Math.abs(player1.yv) < player1.g) player1.yv = player1.g;
        } else {
          player1.yv += (player1.g * dt) / 500;
        }
        if (
          (player2.yv > player2.g && player2.g > 0) ||
          (player2.yv < player2.g && player2.g < 0)
        ) {
          player2.yv -= (player2.g * dt) / 500;
          if (Math.abs(player2.yv) < player2.g) player2.yv = player2.g;
        } else {
          player2.yv += (player2.g * dt) / 500;
        }
      }
      // collision detection
      if (i === 0) {
        player1.canWalljump = false;
        player2.canWalljump = false;
      }
      let level = levels[playerData.currentLevel];
      let onIce1 = false;
      let onIce2 = false;
      let shouldDie = false;
      let bx11 = Math.floor((player1.x - 0.001) / blockSize);
      let bx12 = Math.floor((player1.x + playerSize) / blockSize);
      let by11 = Math.floor((player1.y - 0.001) / blockSize);
      let by12 = Math.floor((player1.y + playerSize) / blockSize);
      let bx21 = Math.floor((player2.x - 0.001) / blockSize);
      let bx22 = Math.floor((player2.x + playerSize) / blockSize);
      let by21 = Math.floor((player2.y - 0.001) / blockSize);
      let by22 = Math.floor((player2.y + playerSize) / blockSize);
      let wallLeft1 = false;
      let wallRight1 = false;
      let wallTop1 = false;
      let wallBottom1 = false;
      let wallLeft2 = false;
      let wallRight2 = false;
      let wallTop2 = false;
      let wallBottom2 = false;
      // solid blocks
      for (let x = bx11; x <= bx12; x++) {
        for (let y = by11; y <= by12; y++) {
          if (
            lvlxprev !== playerData.levelCoord[0] ||
            lvlyprev !== playerData.levelCoord[1]
          )
            break;
          let type = getBlockType(x, y);
          let props = type;
          if (typeof type === "object") type = type[0];
          let onLeft = false;
          let onRight = false;
          let onTop = false;
          let onBottom = false;
          if (hasHitbox.includes(type)) {
            let dx1 = Math.abs(
              (player1.x - (x + 1) * blockSize) / Math.min(-1, player1.xv)
            );
            let dx2 = Math.abs(
              (player1.x + playerSize - x * blockSize) / Math.max(1, player1.xv)
            );
            let dy1 = Math.abs(
              (player1.y - (y + 1) * blockSize) / Math.min(-1, player1.yv)
            );
            let dy2 = Math.abs(
              (player1.y + playerSize - y * blockSize) / Math.max(1, player1.yv)
            );
            // top left corner
            if (x === bx11 && y === by11) {
              if (dx1 < dy1 && !hasHitbox.includes(getBlockType(x + 1, y))) {
                onLeft = true;
              } else if (!hasHitbox.includes(getBlockType(x, y + 1))) {
                onTop = true;
              }
            }
            // bottom left corner
            else if (x === bx11 && y === by12) {
              if (dx1 < dy2 && !hasHitbox.includes(getBlockType(x + 1, y))) {
                onLeft = true;
              } else if (!hasHitbox.includes(getBlockType(x, y - 1))) {
                onBottom = true;
              }
            }
            // top right corner
            else if (x === bx12 && y === by11) {
              if (dx2 < dy1 && !hasHitbox.includes(getBlockType(x - 1, y))) {
                onRight = true;
              } else if (!hasHitbox.includes(getBlockType(x, y + 1))) {
                onTop = true;
              }
            }
            // bottom right corner
            else if (x === bx12 && y === by12) {
              if (dx2 < dy2 && !hasHitbox.includes(getBlockType(x - 1, y))) {
                onRight = true;
              } else if (!hasHitbox.includes(getBlockType(x, y - 1))) {
                onBottom = true;
              }
            }
            // bottom right corner
            else if (x === bx12 && y === by12) {
              if (
                Math.abs(
                  (x * blockSize - (player1.x + playerSize)) /
                    Math.max(1, Math.abs(player1.xv))
                ) <
                  Math.abs(
                    (y * blockSize - (player1.y + playerSize)) /
                      Math.max(1, Math.abs(player1.yv))
                  ) &&
                !hasHitbox.includes(getBlockType(x - 1, y))
              ) {
                onRight = true;
              } else if (!hasHitbox.includes(getBlockType(x, y - 1))) {
                onBottom = true;
              }
            }
            // left bound
            else if (x === bx11) wallLeft1 = true;
            // right bound
            else if (x === bx12) wallRight1 = true;
            // top bound
            else if (y === by11) wallTop1 = true;
            // bottom bound
            else if (y === by12) wallBottom1 = true;
            // inside
            else shouldDie = true;
            // velocity check
            if (player1.xv < 0) {
              onRight = false;
            } else if (player1.xv > 0) onLeft = false;
            if (player1.yv < 0) {
              onBottom = false;
            } else if (player1.yv > 0) onTop = false;
            // touching side special event
            if (onLeft) {
              wallLeft1 = true;
              switch (type) {
                case 11:
                  if (!player1.xg) {
                    player1.canWalljump = true;
                    player1.wallJumpDir = "right";
                    if (player1.yv > player1.g / 10 && player1.g > 0)
                      player1.yv = player1.g / 10;
                    if (player1.yv < player1.g / 10 && player1.g < 0)
                      player1.yv = player1.g / 10;
                  }
                  break;
                default:
                  break;
              }
            }
            if (onRight) {
              wallRight1 = true;
              switch (type) {
                case 11:
                  if (!player1.xg) {
                    player1.canWalljump = true;
                    player1.wallJumpDir = "left";
                    if (player1.yv > player1.g / 10 && player1.g > 0)
                      player1.yv = player1.g / 10;
                    if (player1.yv < player1.g / 10 && player1.g < 0)
                      player1.yv = player1.g / 10;
                  }
                  break;
                default:
                  break;
              }
            }
            if (onTop) {
              wallTop1 = true;
              switch (type) {
                case 5:
                  for (let j = bx11; j <= bx12; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 5 &&
                      !hasHitbox.includes(getBlockType(j, y + 1))
                    )
                      break;
                    if (j === bx12 && player1.g < 0)
                      player1.yv = Math.max(275, player1.yv);
                  }
                  break;
                case 40:
                  for (let j = bx11; j <= bx12; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 40 &&
                      !hasHitbox.includes(getBlockType(j, y + 1))
                    )
                      break;
                    if (j === bx2) onIce1 = true;
                  }
                  break;
                default:
                  break;
              }
            }
            if (onBottom) {
              wallBottom1 = true;
              switch (type) {
                case 5:
                  for (let j = bx11; j <= bx12; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 5 &&
                      !hasHitbox.includes(getBlockType(j, y - 1))
                    )
                      break;
                    if (j === bx12 && player1.g > 0)
                      player1.yv = Math.min(-275, player1.yv);
                  }
                  break;
                case 40:
                  for (let j = bx11; j <= bx12; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 40 &&
                      !hasHitbox.includes(getBlockType(j, y - 1))
                    )
                      break;
                    if (j === bx12) onIce1 = true;
                  }
                  break;
                default:
                  break;
              }
            }
          }
        }
      }
      for (let x = bx21; x <= bx22; x++) {
        for (let y = by21; y <= by22; y++) {
          if (
            lvlxprev !== playerData.levelCoord[0] ||
            lvlyprev !== playerData.levelCoord[1]
          )
            break;
          let type = getBlockType(x, y);
          let props = type;
          if (typeof type === "object") type = type[0];
          let onLeft = false;
          let onRight = false;
          let onTop = false;
          let onBottom = false;
          if (hasHitbox.includes(type)) {
            let dx1 = Math.abs(
              (player2.x - (x + 1) * blockSize) / Math.min(-1, player2.xv)
            );
            let dx2 = Math.abs(
              (player2.x + playerSize - x * blockSize) / Math.max(1, player2.xv)
            );
            let dy1 = Math.abs(
              (player2.y - (y + 1) * blockSize) / Math.min(-1, player2.yv)
            );
            let dy2 = Math.abs(
              (player2.y + playerSize - y * blockSize) / Math.max(1, player2.yv)
            );
            // top left corner
            if (x === bx21 && y === by21) {
              if (dx1 < dy1 && !hasHitbox.includes(getBlockType(x + 1, y))) {
                onLeft = true;
              } else if (!hasHitbox.includes(getBlockType(x, y + 1))) {
                onTop = true;
              }
            }
            // bottom left corner
            else if (x === bx21 && y === by22) {
              if (dx1 < dy2 && !hasHitbox.includes(getBlockType(x + 1, y))) {
                onLeft = true;
              } else if (!hasHitbox.includes(getBlockType(x, y - 1))) {
                onBottom = true;
              }
            }
            // top right corner
            else if (x === bx22 && y === by21) {
              if (dx2 < dy1 && !hasHitbox.includes(getBlockType(x - 1, y))) {
                onRight = true;
              } else if (!hasHitbox.includes(getBlockType(x, y + 1))) {
                onTop = true;
              }
            }
            // bottom right corner
            else if (x === bx22 && y === by22) {
              if (dx2 < dy2 && !hasHitbox.includes(getBlockType(x - 1, y))) {
                onRight = true;
              } else if (!hasHitbox.includes(getBlockType(x, y - 1))) {
                onBottom = true;
              }
            }
            // bottom right corner
            else if (x === bx22 && y === by22) {
              if (
                Math.abs(
                  (x * blockSize - (player2.x + playerSize)) /
                    Math.max(1, Math.abs(player2.xv))
                ) <
                  Math.abs(
                    (y * blockSize - (player2.y + playerSize)) /
                      Math.max(1, Math.abs(player2.yv))
                  ) &&
                !hasHitbox.includes(getBlockType(x - 1, y))
              ) {
                onRight = true;
              } else if (!hasHitbox.includes(getBlockType(x, y - 1))) {
                onBottom = true;
              }
            }
            // left bound
            else if (x === bx21) wallLeft2 = true;
            // right bound
            else if (x === bx22) wallRight2 = true;
            // top bound
            else if (y === by21) wallTop2 = true;
            // bottom bound
            else if (y === by22) wallBottom2 = true;
            // inside
            else shouldDie = true;
            // velocity check
            if (player2.xv < 0) {
              onRight = false;
            } else if (player2.xv > 0) onLeft = false;
            if (player2.yv < 0) {
              onBottom = false;
            } else if (player2.yv > 0) onTop = false;
            // touching side special event
            if (onLeft) {
              wallLeft2 = true;
              switch (type) {
                case 11:
                  if (!player2.xg) {
                    player2.canWalljump = true;
                    player2.wallJumpDir = "right";
                    if (player2.yv > player2.g / 10 && player2.g > 0)
                      player2.yv = player2.g / 10;
                    if (player2.yv < player2.g / 10 && player2.g < 0)
                      player2.yv = player2.g / 10;
                  }
                  break;
                default:
                  break;
              }
            }
            if (onRight) {
              wallRight2 = true;
              switch (type) {
                case 11:
                  if (!player2.xg) {
                    player2.canWalljump = true;
                    player2.wallJumpDir = "left";
                    if (player2.yv > player2.g / 10 && player2.g > 0)
                      player2.yv = player2.g / 10;
                    if (player2.yv < player2.g / 10 && player2.g < 0)
                      player2.yv = player2.g / 10;
                  }
                  break;
                default:
                  break;
              }
            }
            if (onTop) {
              wallTop2 = true;
              switch (type) {
                case 5:
                  for (let j = bx21; j <= bx22; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 5 &&
                      !hasHitbox.includes(getBlockType(j, y + 1))
                    )
                      break;
                    if (j === bx22 && player2.g < 0)
                      player2.yv = Math.max(275, player2.yv);
                  }
                  break;
                case 40:
                  for (let j = bx21; j <= bx22; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 40 &&
                      !hasHitbox.includes(getBlockType(j, y + 1))
                    )
                      break;
                    if (j === bx22) onIce2 = true;
                  }
                  break;
                default:
                  break;
              }
            }
            if (onBottom) {
              wallBottom2 = true;
              switch (type) {
                case 5:
                  for (let j = bx21; j <= bx22; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 5 &&
                      !hasHitbox.includes(getBlockType(j, y - 1))
                    )
                      break;
                    if (j === bx22 && player2.g > 0)
                      player2.yv = Math.min(-275, player2.yv);
                  }
                  break;
                case 40:
                  for (let j = bx21; j <= bx22; j++) {
                    let jtype = getBlockType(j, y);
                    if (
                      hasHitbox.includes(jtype) &&
                      jtype !== 40 &&
                      !hasHitbox.includes(getBlockType(j, y - 1))
                    )
                      break;
                    if (j === bx22) onIce2 = true;
                  }
                  break;
                default:
                  break;
              }
            }
          }
        }
      }
      if (
        lvlxprev !== playerData.levelCoord[0] ||
        lvlyprev !== playerData.levelCoord[1]
      )
        break;
      // ice lol
      if (onIce1) {
        player1.noFriction = true;
      } else player1.noFriction = false;
      if (onIce2) {
        player2.noFriction = true;
      } else player2.noFriction = false;
      // collision action
      if (wallLeft1) {
        player1.x = (bx11 + 1) * blockSize;
        player1.xv = Math.max(0, player1.xv);
      }
      if (wallRight1) {
        player1.x = bx12 * blockSize - playerSize;
        player1.xv = Math.min(0, player1.xv);
      }
      if (wallTop1) {
        player1.y = (by11 + 1) * blockSize;
        player1.yv = Math.max(0, player1.yv);
        if (player1.g < 0 && player1.yv <= 0) onFloor1 = true;
      }
      if (wallBottom1) {
        player1.y = by12 * blockSize - playerSize;
        player1.yv = Math.min(0, player1.yv);
        if (player1.g > 0 && player1.yv >= 0) onFloor1 = true;
      }
      if (wallLeft2) {
        player2.x = (bx21 + 1) * blockSize;
        player2.xv = Math.max(0, player2.xv);
      }
      if (wallRight2) {
        player2.x = bx22 * blockSize - playerSize;
        player2.xv = Math.min(0, player2.xv);
      }
      if (wallTop2) {
        player2.y = (by21 + 1) * blockSize;
        player2.yv = Math.max(0, player2.yv);
        if (player2.g < 0 && player2.yv <= 0) onFloor2 = true;
      }
      if (wallBottom2) {
        player2.y = by22 * blockSize - playerSize;
        player2.yv = Math.min(0, player2.yv);
        if (player2.g > 0 && player2.yv >= 0) onFloor2 = true;
      }
      // fully in block
      if (
        hasHitbox.includes(getBlockType(bx11, by11)) &&
        hasHitbox.includes(getBlockType(bx11, by12)) &&
        hasHitbox.includes(getBlockType(bx12, by11)) &&
        hasHitbox.includes(getBlockType(bx12, by12))
      )
        shouldDie = true;
      if (
        hasHitbox.includes(getBlockType(bx21, by21)) &&
        hasHitbox.includes(getBlockType(bx21, by22)) &&
        hasHitbox.includes(getBlockType(bx22, by21)) &&
        hasHitbox.includes(getBlockType(bx22, by22))
      )
        shouldDie = true;
      if (!shouldDie) {
        for (let x = bx11; x <= bx12; x++) {
          for (let y = by11; y <= by12; y++) {
            if (
              lvlxprev !== playerData.levelCoord[0] ||
              lvlyprev !== playerData.levelCoord[1]
            )
              break;
            let type = getBlockType(x, y);
            let props = type;
            if (typeof type === "object") type = type[0];
            if (
              player1.x < (x + 1) * blockSize - 0.01 &&
              player1.x + playerSize > x * blockSize + 0.01 &&
              player1.y < (y + 1) * blockSize - 0.01 &&
              player1.y + playerSize > y * blockSize + 0.01
            ) {
              switch (type) {
                // grav-dir
                case 6:
                  player1.xg = false;
                  if (player1.g > 0) player1.g = -player1.g;
                  break;
                case 7:
                  player1.xg = false;
                  if (player1.g < 0) player1.g = -player1.g;
                  break;
                // grav magnitude
                case 8:
                  player1.g = Math.sign(player1.g) * 170;
                  break;
                case 9:
                  player1.g = Math.sign(player1.g) * 325;
                  break;
                case 10:
                  player1.g = Math.sign(player1.g) * 650;
                  break;
                // multi-jump
                case 12:
                  player1.maxJumps = 0;
                  player1.currentJumps = player1.maxJumps;
                  break;
                case 13:
                  player1.maxJumps = 1;
                  player1.currentJumps = player1.maxJumps;
                  break;
                case 14:
                  player1.maxJumps = 2;
                  player1.currentJumps = player1.maxJumps;
                  break;
                case 15:
                  player1.maxJumps = 3;
                  player1.currentJumps = player1.maxJumps;
                  break;
                case 16:
                  player1.maxJumps = Infinity;
                  player1.currentJumps = player1.maxJumps;
                  break;
                // checkpoint
                case -5:
                  if (!playerData.gameComplete) {
                    playerData.gameComplete = true;
                    playerData.finalTimePlayed = playerData.timePlayed;
                    playerData.finalDeaths = playerData.deaths;
                    id("endStat").style.display = "inline";
                    id("timePlayedEnd").innerHTML = formatTime(
                      playerData.finalTimePlayed
                    );
                    id("deathCountEnd").innerHTML = playerData.finalDeaths;
                    if (id("mainInfo").style.bottom != "0%") openInfo();
                  }
                case 3:
                  if (!isSpawn(x, y)) {
                    if (playerData.currentLevel === 8) {
                      branchInProgress = false;
                      playerData.reachedHub = true;
                    }
                    playerData.spawnPoint = [
                      x,
                      y,
                      playerData.levelCoord[0],
                      playerData.levelCoord[1],
                      player1.g,
                      player1.maxJumps,
                      player1.moveSpeed,
                      [...playerData.triggers],
                      currentVersion,
                      playerData.reachedHub,
                      playerData.timePlayed,
                      playerData.deaths,
                      playerData.gameComplete,
                      playerData.finalTimePlayed,
                      playerData.finalDeaths,
                      playerData.branchTime
                    ];
                    shouldDrawLevel = true;
                    save();
                  }
                  break;
                // speed change
                case 21:
                  player1.moveSpeed = 300;
                  break;
                case 22:
                  player1.moveSpeed = 600;
                  break;
                case 23:
                  player1.moveSpeed = 1200;
                  break;
                // death block
                case 2:
                case -4:
                  shouldDie = true;
                  break;
                // special
                case -3:
                  if (!playerData.triggers.includes(props[1]))
                    playerData.triggers.push(props[1]);
                  if (props[1] < 0) branchInProgress = false;
                  break;
                case -2:
                  if (playerData.currentLevel === 8) {
                    branchInProgress = true;
                    playerData.branchTime = 0;
                  }
                  let warpId = props[1];
                  if (bx11 < 0) {
                    // left
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[0]--;
                    player1.x =
                      levels[playerData.currentLevel].length * blockSize -
                      playerSize;
                    player1.y =
                      blockSize *
                        levels[playerData.currentLevel][
                          levels[playerData.currentLevel].length - 1
                        ].findIndex((x) => x[0] == -1 && x[1] == warpId) +
                      ((player1.y + blockSize) % blockSize);
                    player2.x =
                      levels[playerData.currentLevel].length * blockSize -
                      playerSize;
                    player2.y =
                      blockSize *
                        levels[playerData.currentLevel][
                          levels[playerData.currentLevel].length - 1
                        ].findIndex((x) => x[0] == -1 && x[1] == warpId) +
                      ((player2.y + blockSize) % blockSize);
                  } else if (bx12 >= level.length) {
                    // right
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[0]++;
                    player1.x = 0;
                    player1.y =
                      blockSize *
                        levels[playerData.currentLevel][0].findIndex(
                          (x) => x[0] == -1 && x[1] == warpId
                        ) +
                      ((player1.y + blockSize) % blockSize);
                    player2.x = 0;
                    player2.y =
                      blockSize *
                        levels[playerData.currentLevel][0].findIndex(
                          (x) => x[0] == -1 && x[1] == warpId
                        ) +
                      ((player2.y + blockSize) % blockSize);
                  } else if (by11 < 0) {
                    // up
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[1]++;
                    player1.y =
                      levels[playerData.currentLevel][0].length * blockSize -
                      playerSize;
                    player1.x =
                      blockSize *
                        levels[player1.currentLevel].findIndex(
                          (x) =>
                            x[x.length - 1][0] == -1 &&
                            x[x.length - 1][1] == warpId
                        ) +
                      ((player1.x + blockSize) % blockSize);
                    player2.y =
                      levels[playerData.currentLevel][0].length * blockSize -
                      playerSize;
                    player2.x =
                      blockSize *
                        levels[player2.currentLevel].findIndex(
                          (x) =>
                            x[x.length - 1][0] == -1 &&
                            x[x.length - 1][1] == warpId
                        ) +
                      ((player2.x + blockSize) % blockSize);
                  } else if (by12 >= level[0].length) {
                    // down
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[1]--;
                    player1.y = 0;
                    player1.x =
                      blockSize *
                        levels[playerData.currentLevel].findIndex(
                          (x) => x[0][0] == -1 && x[0][1] == warpId
                        ) +
                      ((player1.x + blockSize) % blockSize);
                    player2.y = 0;
                    player2.x =
                      blockSize *
                        levels[playerData.currentLevel].findIndex(
                          (x) => x[0][0] == -1 && x[0][1] == warpId
                        ) +
                      ((player2.x + blockSize) % blockSize);
                  }
                  updateAudio();
                  break;
                default:
                  break;
              }
            }
          }
        }
        for (let x = bx21; x <= bx22; x++) {
          for (let y = by21; y <= by22; y++) {
            if (
              lvlxprev !== playerData.levelCoord[0] ||
              lvlyprev !== playerData.levelCoord[1]
            )
              break;
            let type = getBlockType(x, y);
            let props = type;
            if (typeof type === "object") type = type[0];
            if (
              player2.x < (x + 1) * blockSize - 0.01 &&
              player2.x + playerSize > x * blockSize + 0.01 &&
              player2.y < (y + 1) * blockSize - 0.01 &&
              player2.y + playerSize > y * blockSize + 0.01
            ) {
              switch (type) {
                // grav-dir
                case 6:
                  player2.xg = false;
                  if (player2.g > 0) player2.g = -player2.g;
                  break;
                case 7:
                  player2.xg = false;
                  if (player2.g < 0) player2.g = -player2.g;
                  break;
                // grav magnitude
                case 8:
                  player2.g = Math.sign(player2.g) * 170;
                  break;
                case 9:
                  player2.g = Math.sign(player2.g) * 325;
                  break;
                case 10:
                  player2.g = Math.sign(player2.g) * 650;
                  break;
                // multi-jump
                case 12:
                  player2.maxJumps = 0;
                  player2.currentJumps = player2.maxJumps;
                  break;
                case 13:
                  player2.maxJumps = 1;
                  player2.currentJumps = player2.maxJumps;
                  break;
                case 14:
                  player2.maxJumps = 2;
                  player2.currentJumps = player2.maxJumps;
                  break;
                case 15:
                  player2.maxJumps = 3;
                  player2.currentJumps = player2.maxJumps;
                  break;
                case 16:
                  player2.maxJumps = Infinity;
                  player2.currentJumps = player2.maxJumps;
                  break;
                // checkpoint
                case -5:
                  if (!playerData.gameComplete) {
                    playerData.gameComplete = true;
                    playerData.finalTimePlayed = playerData.timePlayed;
                    playerData.finalDeaths = playerData.deaths;
                    id("endStat").style.display = "inline";
                    id("timePlayedEnd").innerHTML = formatTime(
                      playerData.finalTimePlayed
                    );
                    id("deathCountEnd").innerHTML = playerData.finalDeaths;
                    if (id("mainInfo").style.bottom != "0%") openInfo();
                  }
                case 3:
                  if (!isSpawn(x, y)) {
                    if (playerData.currentLevel === 8) {
                      branchInProgress = false;
                      playerData.reachedHub = true;
                    }
                    playerData.spawnPoint = [
                      x,
                      y,
                      playerData.levelCoord[0],
                      playerData.levelCoord[1],
                      player2.g,
                      player2.maxJumps,
                      player2.moveSpeed,
                      [...playerData.triggers],
                      currentVersion,
                      playerData.reachedHub,
                      playerData.timePlayed,
                      playerData.deaths,
                      playerData.gameComplete,
                      playerData.finalTimePlayed,
                      playerData.finalDeaths,
                      playerData.branchTime
                    ];
                    shouldDrawLevel = true;
                    save();
                  }
                  break;
                // speed change
                case 21:
                  player1.moveSpeed = 300;
                  break;
                case 22:
                  player1.moveSpeed = 600;
                  break;
                case 23:
                  player1.moveSpeed = 1200;
                  break;
                // death block
                case 2:
                case -4:
                  shouldDie = true;
                  break;
                // special
                case -3:
                  if (!playerData.triggers.includes(props[1]))
                    playerData.triggers.push(props[1]);
                  if (props[1] < 0) branchInProgress = false;
                  break;
                case -2:
                  if (playerData.currentLevel === 8) {
                    branchInProgress = true;
                    playerData.branchTime = 0;
                  }
                  let warpId = props[1];
                  if (bx21 < 0) {
                    // left
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[0]--;
                    player1.x =
                      levels[playerData.currentLevel].length * blockSize -
                      playerSize;
                    player1.y =
                      blockSize *
                        levels[playerData.currentLevel][
                          levels[playerData.currentLevel].length - 1
                        ].findIndex((x) => x[0] == -1 && x[1] == warpId) +
                      ((player1.y + blockSize) % blockSize);
                    player2.x =
                      levels[playerData.currentLevel].length * blockSize -
                      playerSize;
                    player2.y =
                      blockSize *
                        levels[playerData.currentLevel][
                          levels[playerData.currentLevel].length - 1
                        ].findIndex((x) => x[0] == -1 && x[1] == warpId) +
                      ((player2.y + blockSize) % blockSize);
                  } else if (bx22 >= level.length) {
                    // right
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[0]++;
                    player1.x = 0;
                    player1.y =
                      blockSize *
                        levels[playerData.currentLevel][0].findIndex(
                          (x) => x[0] == -1 && x[1] == warpId
                        ) +
                      ((player1.y + blockSize) % blockSize);
                    player2.x = 0;
                    player2.y =
                      blockSize *
                        levels[playerData.currentLevel][0].findIndex(
                          (x) => x[0] == -1 && x[1] == warpId
                        ) +
                      ((player2.y + blockSize) % blockSize);
                  } else if (by21 < 0) {
                    // up
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[1]++;
                    player1.y =
                      levels[playerData.currentLevel][0].length * blockSize -
                      playerSize;
                    player1.x =
                      blockSize *
                        levels[playerData.currentLevel].findIndex(
                          (x) =>
                            x[x.length - 1][0] == -1 &&
                            x[x.length - 1][1] == warpId
                        ) +
                      ((player1.x + blockSize) % blockSize);
                    player2.y =
                      levels[playerData.currentLevel][0].length * blockSize -
                      playerSize;
                    player2.x =
                      blockSize *
                        levels[playerData.currentLevel].findIndex(
                          (x) =>
                            x[x.length - 1][0] == -1 &&
                            x[x.length - 1][1] == warpId
                        ) +
                      ((player2.x + blockSize) % blockSize);
                  } else if (by22 >= level[0].length) {
                    // down
                    if (props[2] != undefined) {
                      playerData.levelCoord[0] += props[2];
                      playerData.levelCoord[1] += props[3];
                    } else playerData.levelCoord[1]--;
                    player1.y = 0;
                    player1.x =
                      blockSize *
                        levels[playerData.currentLevel].findIndex(
                          (x) => x[0][0] == -1 && x[0][1] == warpId
                        ) +
                      ((player1.x + blockSize) % blockSize);
                    player2.y = 0;
                    player2.x =
                      blockSize *
                        levels[playerData.currentLevel].findIndex(
                          (x) => x[0][0] == -1 && x[0][1] == warpId
                        ) +
                      ((player2.x + blockSize) % blockSize);
                  }
                  updateAudio();
                  break;
                default:
                  break;
              }
            }
          }
        }
      }
      if (onFloor1) {
        player1.currentJumps = player1.maxJumps;
      } else if (player1.currentJumps === player1.maxJumps) player1.currentJumps--;
      if (onFloor2) {
        player2.currentJumps = player2.maxJumps;
      } else if (player2.currentJumps === player2.maxJumps) player2.currentJumps--;
      // die
      if (!playerData.godMode && shouldDie && !playerData.isDead) playerData.isDead = true;
      if (playerData.isDead) {
        playerData.spawnTimer -= dt;
        if (playerData.spawnTimer <= 0) respawn();
      }
      // triggers
      if (!playerData.triggers.includes(-1)) {
        levels[9][5][5] = 0;
        levels[9][5][4] = 0;
        levels[9][5][2] = 0;
        levels[9][5][1] = 0;
        levels[9][8][5] = 0;
        levels[9][10][1] = 0;
        levels[9][13][1] = 0;
      } else {
        levels[9][5][5] = 7;
        levels[9][5][4] = 6;
        levels[9][5][2] = 7;
        levels[9][5][1] = 6;
        levels[9][8][5] = 7;
        levels[9][10][1] = 6;
        levels[9][13][1] = 7;
      }
      if (!playerData.triggers.includes(-2)) {
        levels[9][7][5] = 0;
        levels[9][7][4] = 0;
        levels[9][7][2] = 0;
        levels[9][7][1] = 0;
      } else {
        levels[9][7][5] = 13;
        levels[9][7][4] = 16;
        levels[9][7][2] = 16;
        levels[9][7][1] = 13;
      }
      if (!playerData.triggers.includes(-3)) {
        levels[9][10][2] = 1;
        levels[9][10][3] = 1;
        levels[9][10][5] = 1;
      } else {
        levels[9][10][2] = 11;
        levels[9][10][3] = 11;
        levels[9][10][5] = 11;
      }
      if (!playerData.triggers.includes(-4)) {
        levels[9][11][1] = 0;
        levels[9][11][5] = 0;
        levels[9][13][5] = 0;
      } else {
        levels[9][11][1] = 22;
        levels[9][11][5] = 23;
        levels[9][13][5] = 22;
      }
      if (playerData.triggers.includes(0)) {
        levels[22][6][4] = 0;
      } else levels[22][6][4] = -4;
      if (playerData.triggers.includes(1)) {
        levels[22][6][5] = 0;
      } else levels[22][6][5] = -4;
      if (playerData.triggers.includes(2)) {
        levels[26][27][1] = 0;
        levels[26][27][2] = 0;
      } else {
        levels[26][27][1] = -4;
        levels[26][27][2] = -4;
      }
      if (playerData.triggers.includes(3)) {
        levels[26][28][1] = 0;
        levels[26][28][2] = 0;
      } else {
        levels[26][28][1] = -4;
        levels[26][28][2] = -4;
      }
      if (playerData.triggers.includes(4)) {
        levels[26][29][1] = 0;
        levels[26][29][2] = 0;
      } else {
        levels[26][29][1] = -4;
        levels[26][29][2] = -4;
      }
      if (playerData.triggers.includes(5)) {
        levels[26][31][11] = 0;
        levels[26][31][12] = 0;
      } else {
        levels[26][31][11] = -4;
        levels[26][31][12] = -4;
      }
      if (playerData.triggers.includes(6)) {
        levels[26][32][11] = 0;
        levels[26][32][12] = 0;
      } else {
        levels[26][32][11] = -4;
        levels[26][32][12] = -4;
      }
      if (playerData.triggers.includes(7)) {
        levels[26][33][11] = 0;
        levels[26][33][12] = 0;
      } else {
        levels[26][33][11] = -4;
        levels[26][33][12] = -4;
      }
      if (playerData.triggers.includes(8)) {
        levels[26][38][1] = 0;
      } else levels[26][38][1] = -4;
      if (playerData.triggers.includes(9)) {
        levels[26][39][1] = 0;
      } else levels[26][39][1] = -4;
      if (playerData.triggers.includes(10)) {
        levels[32][15][3] = 0;
      } else levels[32][15][3] = -4;
      if (playerData.triggers.includes(11)) {
        levels[32][9][1] = 0;
      } else levels[32][9][1] = -4;
      if (playerData.triggers.includes(12)) {
        levels[32][7][3] = 0;
      } else levels[32][7][3] = -4;
      if (playerData.triggers.includes(13)) {
        levels[32][3][3] = 0;
      } else levels[32][3][3] = -4;
      if (playerData.triggers.includes(14)) {
        levels[32][1][4] = 0;
      } else levels[32][1][4] = -4;
      if (playerData.triggers.includes(15)) {
        levels[35][15][4] = 0;
        levels[35][15][5] = 0;
      } else {
        levels[35][15][4] = -4;
        levels[35][15][5] = -4;
      }
      if (playerData.triggers.includes(16)) {
        levels[42][12][9] = 0;
      } else levels[42][12][9] = -4;
      if (playerData.triggers.includes(17)) {
        levels[42][1][1] = 0;
      } else levels[42][1][1] = -4;
      if (playerData.triggers.includes(18)) {
        levels[43][10][6] = 0;
      } else levels[43][10][6] = -4;
      if (playerData.triggers.includes(19)) {
        levels[43][5][9] = 0;
      } else levels[43][5][9] = -4;
      if (playerData.triggers.includes(20)) {
        levels[43][7][10] = 0;
        if (diff === "-HARD") levels[43][6][9] = -4;
      } else {
        levels[43][7][10] = -4;
        if (diff === "-HARD") levels[43][6][9] = 0;
      }
      if (playerData.triggers.includes(21)) {
        levels[43][6][12] = 0;
      } else levels[43][6][12] = -4;
      if (playerData.triggers.includes(22)) {
        levels[52][1][2] = 0;
      } else levels[52][1][2] = -4;
      if (playerData.triggers.includes(23)) {
        levels[63][27][5] = 0;
      } else levels[63][27][5] = -4;
      if (playerData.triggers.includes(24)) {
        levels[63][27][2] = 0;
      } else levels[63][27][2] = -4;
      if (playerData.triggers.includes(25)) {
        levels[63][25][5] = 0;
      } else levels[63][25][5] = -4;
      if (playerData.triggers.includes(26)) {
        levels[63][25][8] = 0;
      } else levels[63][25][8] = -4;
      if (playerData.triggers.includes(27)) {
        levels[73][13][4] = 0;
      } else levels[73][13][4] = -4;
      if (playerData.triggers.includes(28)) {
        levels[73][13][3] = 0;
      } else levels[73][13][3] = -4;
      if (playerData.triggers.includes(29)) {
        levels[74][4][8] = 0;
        levels[74][4][9] = 0;
      } else {
        levels[74][4][8] = -4;
        levels[74][4][9] = -4;
      }
      if (playerData.triggers.includes(30)) {
        levels[74][6][4] = 0;
      } else levels[74][6][4] = -4;
      if (playerData.triggers.includes(31)) {
        levels[74][5][20] = 0;
      } else levels[74][5][20] = -4;
      if (playerData.triggers.includes(32)) {
        levels[75][5][4] = 0;
      } else levels[75][5][4] = -4;
      if (playerData.triggers.includes(33)) {
        levels[75][5][2] = 0;
      } else levels[75][5][2] = -4;
      if (playerData.triggers.includes(34)) {
        levels[75][7][10] = 0;
      } else levels[75][7][10] = -4;
      if (playerData.triggers.includes(35)) {
        levels[85][16][11] = 0;
      } else levels[85][16][11] = -4;
      if (playerData.triggers.includes(36)) {
        levels[85][18][11] = 0;
      } else levels[85][18][11] = -4;
      if (playerData.triggers.includes(37)) {
        levels[85][19][3] = 0;
      } else levels[85][19][3] = -4;
      if (playerData.triggers.includes(38)) {
        levels[85][19][1] = 0;
      } else levels[85][19][1] = -4;
      if (playerData.triggers.includes(39)) {
        levels[87][16][11] = 0;
        levels[87][16][12] = 0;
      } else {
        levels[87][16][11] = -4;
        levels[87][16][12] = -4;
      }
      if (playerData.triggers.includes(40)) {
        levels[87][18][11] = 0;
        levels[87][18][12] = 0;
      } else {
        levels[87][18][11] = -4;
        levels[87][18][12] = -4;
      }
      if (playerData.triggers.includes(41)) {
        levels[87][20][11] = 0;
        levels[87][20][12] = 0;
      } else {
        levels[87][20][11] = -4;
        levels[87][20][12] = -4;
      }
      if (playerData.triggers.includes(42)) {
        levels[87][22][11] = 0;
        levels[87][22][12] = 0;
      } else {
        levels[87][22][11] = -4;
        levels[87][22][12] = -4;
      }
    }
    dt = dt * simReruns;
    // rope physics
    let ropex = player1.x - player2.x;
    let ropey = player1.y - player2.y;
    if (onFloor1) {
      player1.x -= Math.max(Math.pow(Math.abs(ropex), 1.1) * Math.sign(ropex) - player1.g / 2, 0) / 100;
      player1.y += Math.max(Math.pow(Math.abs(ropey), 1.1) * Math.sign(ropey) - player1.g / 2, 0) / 100;
    } else {
      player1.x -= Math.pow(Math.abs(ropex), 1.1) * Math.sign(ropex) / 100;
      player1.y -= Math.pow(Math.abs(ropey), 1.1) * Math.sign(ropey) / 100;
    }
    if (onFloor2) {
      player2.x += Math.max(Math.pow(Math.abs(ropex), 1.1) * Math.sign(ropex) - player2.g / 2, 0) / 100;
      player2.y += Math.max(Math.pow(Math.abs(ropey), 1.1) * Math.sign(ropey) - player2.g / 2, 0) / 100;
    } else {
      player2.x += Math.pow(Math.abs(ropex), 1.1) * Math.sign(ropex) / 100;
      player2.y += Math.pow(Math.abs(ropey), 1.1) * Math.sign(ropey) / 100;
    }
    // key input
    if (control.left1 && player1.xv > -player1.moveSpeed) {
      player1.xv -= (player1.moveSpeed * dt) / 50 / (player1.noFriction ? 6 : 1);
      if (player1.xv < -player1.moveSpeed / (player1.noFriction ? 6 : 1))
        player1.xv = -player1.moveSpeed / (player1.noFriction ? 6 : 1);
    }
    if (control.right1 && player1.xv < player1.moveSpeed) {
      player1.xv += (player1.moveSpeed * dt) / 50 / (player1.noFriction ? 6 : 1);
      if (player1.xv > player1.moveSpeed / (player1.noFriction ? 6 : 1))
        player1.xv = player1.moveSpeed / (player1.noFriction ? 6 : 1);
    }
    if (control.up1 || control.down1 || control.space1) {
      if (player1.canWalljump) {
        if (player1.wallJumpDir === "left" && control.left1) {
          player1.canJump = false;
          player1.xv = -600;
          player1.yv = -Math.sign(player1.g) * 205;
        }
        if (player1.wallJumpDir === "right" && control.right1) {
          player1.canJump = false;
          player1.xv = 600;
          player1.yv = -Math.sign(player1.g) * 205;
        }
      } else if (
        player1.canJump &&
        (player1.currentJumps > 0 || playerData.godMode)
      ) {
        player1.canJump = false;
        player1.yv = -Math.sign(player1.g) * 205;
        player1.currentJumps--;
      }
    }
    if (control.left2 && player2.xv > -player2.moveSpeed) {
      player2.xv -= (player2.moveSpeed * dt) / 50 / (player2.noFriction ? 6 : 1);
      if (player2.xv < -player2.moveSpeed / (player2.noFriction ? 6 : 1))
        player2.xv = -player2.moveSpeed / (player2.noFriction ? 6 : 1);
    }
    if (control.right2 && player2.xv < player2.moveSpeed) {
      player2.xv += (player2.moveSpeed * dt) / 50 / (player2.noFriction ? 6 : 1);
      if (player2.xv > player2.moveSpeed / (player2.noFriction ? 6 : 1))
        player2.xv = player2.moveSpeed / (player2.noFriction ? 6 : 1);
    }
    if (control.up2 || control.down2) {
      if (player2.canWalljump) {
        if (player2.wallJumpDir === "left" && control.left2) {
          player2.canJump = false;
          player2.xv = -600;
          player2.yv = -Math.sign(player2.g) * 205;
        }
        if (player2.wallJumpDir === "right" && control.right2) {
          player2.canJump = false;
          player2.xv = 600;
          player2.yv = -Math.sign(player2.g) * 205;
        }
      } else if (
        player2.canJump &&
        (player2.currentJumps > 0 || playerData.godMode)
      ) {
        player2.canJump = false;
        player2.yv = -Math.sign(player2.g) * 205;
        player2.currentJumps--;
      }
    }
    // draw checks
    if (player1.x != xprev1 || player1.y != yprev1) drawPlayers();
    if (player2.x != xprev2 || player2.y != yprev2) drawPlayers();
    if (
      playerData.levelCoord[0] !== lvlxprev ||
      playerData.levelCoord[1] !== lvlyprev ||
      !arraysEqual(playerData.triggers, triggersPrev) ||
      shouldDrawLevel
    )
      drawLevel();
    if (camx !== lvlx || camy !== lvly)
      adjustScreen(
        playerData.levelCoord[0] !== lvlxprev || playerData.levelCoord[1] !== lvlyprev
      );
  }
  window.requestAnimationFrame(nextFrame);
}

function openInfo() {
  if (id("mainInfo").style.bottom == "0%") {
    id("mainInfo").style.bottom = "100%";
    id("mainInfo").style.opacity = 0;
  } else {
    id("mainInfo").style.bottom = "0%";
    id("mainInfo").style.opacity = 1;
  }
}
function newSave() {
  return [
    1,
    6,
    0,
    8,
    325,
    1,
    600,
    [],
    currentVersion,
    false,
    0,
    0,
    false,
    0,
    0,
    0
  ];
}
function save() {
  let saveData = deepCopy(playerData.spawnPoint);
  if (saveData[5] == Infinity) saveData[5] = "Infinity";
  localStorage.setItem("just-a-save" + diff, JSON.stringify(saveData));
}
function load() {
  if (localStorage.getItem("just-a-save" + diff)) {
    let saveData = JSON.parse(localStorage.getItem("just-a-save" + diff));
    if (saveData[5] == "Infinity") saveData[5] = Infinity;
    if (saveData[8] == undefined) {
      saveData[8] = newSave()[8];
      saveData[3] += 3;
    }
    playerData.spawnPoint = saveData;
    playerData.timePlayed = playerData.spawnPoint[10] ?? 0;
    playerData.deaths = playerData.spawnPoint[11] ?? 0;
    playerData.gameComplete = playerData.spawnPoint[12] ?? false;
    playerData.finalTimePlayed = playerData.spawnPoint[13] ?? 0;
    playerData.finalDeaths = playerData.spawnPoint[14] ?? 0;
    playerData.branchTime = playerData.spawnPoint[15] ?? 0;
    id("timePlayed").innerHTML = formatTime(playerData.timePlayed);
    id("deathCount").innerHTML = playerData.deaths;
    if (playerData.gameComplete) {
      id("endStat").style.display = "inline";
      id("timePlayedEnd").innerHTML = formatTime(playerData.finalTimePlayed);
      id("deathCountEnd").innerHTML = playerData.finalDeaths;
    }
    save();
  }
}
function wipeSave() {
  if (
    !options.wipeConfirm ||
    confirm("Are you sure you want to delete your save?")
  ) {
    playerData.spawnPoint = newSave();
    save();
    load();
    respawn(false);
    branchInProgress = true;
    drawLevel();
    drawPlayers();
    adjustScreen(true);
    control.madeFirstInput = false;
  }
}
function exportSave() {
  let saveData = btoa(localStorage.getItem("just-a-save" + diff));
  id("exportArea").value = saveData;
  id("exportArea").style.display = "inline";
  id("exportArea").focus();
  id("exportArea").select();
  document.execCommand("copy");
  id("exportArea").style.display = "none";
  alert("Save data copied to clipboard!");
}
function importSave() {
  let saveData = prompt("Please input save data");
  if (saveData) {
    saveData = atob(saveData);
    localStorage.setItem("just-a-save" + diff, saveData);
    load();
    respawn(false);
    drawLevel();
    drawPlayer();
    adjustScreen(true);
  }
}
function isSpawn(x, y) {
  return (
    playerData.spawnPoint[2] == playerData.levelCoord[0] &&
    playerData.spawnPoint[3] == playerData.levelCoord[1] &&
    playerData.spawnPoint[0] == x &&
    playerData.spawnPoint[1] == y
  );
}
function respawn(death = true) {
  if (death) {
    playerData.deaths++;
    playerData.spawnPoint[11] = playerData.deaths;
    id("deathCount").innerHTML = playerData.deaths;
    save();
  }
  playerData.spawnTimer = playerData.spawnDelay;
  playerData.isDead = false;
  playerData.levelCoord = [playerData.spawnPoint[2], playerData.spawnPoint[3]];
  player1.xv = 0;
  player1.yv = 0;
  player1.g = playerData.spawnPoint[4];
  player1.maxJumps = playerData.spawnPoint[5];
  player1.currentJumps = player1.maxJumps;
  player1.moveSpeed = playerData.spawnPoint[6];
  player2.xv = 0;
  player2.yv = 0;
  player2.g = playerData.spawnPoint[4];
  player2.maxJumps = playerData.spawnPoint[5];
  player2.currentJumps = player2.maxJumps;
  player2.moveSpeed = playerData.spawnPoint[6];
  playerData.triggers = [...playerData.spawnPoint[7]];
  playerData.reachedHub = playerData.spawnPoint[9];
  let spawnx = playerData.spawnPoint[0] * blockSize + (blockSize - playerSize) / 2;
  let spawny = playerData.spawnPoint[1] * blockSize;
  if (player1.g > 0) spawny += blockSize - playerSize;
  player1.x = spawnx;
  player1.y = spawny;
  player2.x = spawnx;
  player2.y = spawny;
  drawLevel();
  drawPlayers();
  if (audioInitDone) updateAudio();
}
function getBlockType(x, y) {
  let level = levels[playerData.currentLevel];
  if (x < 0 || x >= level.length || y < 0 || y >= level[0].length) {
    if (level[x - 1] != undefined) {
      if (typeof level[x - 1][y] == "object") {
        if (level[x - 1][y][0] == -1) {
          return [
            -2,
            level[x - 1][y][1],
            level[x - 1][y][2],
            level[x - 1][y][3]
          ];
        }
      }
    }
    if (level[x + 1] != undefined) {
      if (typeof level[x + 1][y] == "object") {
        if (level[x + 1][y][0] == -1) {
          return [
            -2,
            level[x + 1][y][1],
            level[x + 1][y][2],
            level[x + 1][y][3]
          ];
        }
      }
    }
    if (level[x] != undefined) {
      if (typeof level[x][y - 1] == "object") {
        if (level[x][y - 1][0] == -1) {
          return [
            -2,
            level[x][y - 1][1],
            level[x][y - 1][2],
            level[x][y - 1][3]
          ];
        }
      }
      if (typeof level[x][y + 1] == "object") {
        if (level[x][y + 1][0] == -1) {
          return [
            -2,
            level[x][y + 1][1],
            level[x][y + 1][2],
            level[x][y + 1][3]
          ];
        }
      }
    }
    return 1;
  }
  return level[x][y];
}
function deepCopy(inObject) {
  //definitely not copied from somewhere else
  let outObject, value, key;
  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }
  outObject = Array.isArray(inObject) ? [] : {};
  for (key in inObject) {
    value = inObject[key];
    outObject[key] = deepCopy(value);
  }
  return outObject;
}
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
function formatTime(ms, word = true) {
  let s = ms / 1000;
  let ds = s % 60;
  let m = Math.floor(s / 60);
  let dm = m % 60;
  let h = Math.floor(m / 60);
  let dh = h % 24;
  let d = Math.floor(h / 24);
  let dd = d % 30.43685;
  let mo = Math.floor(d / 30.43685);
  let dmo = mo % 12;
  let dy = Math.floor(mo / 365.2422);
  let time = "";
  if (word) {
    if (s < 60) {
      time = ds.toFixed(3) + " second" + pluralCheck(ds);
    } else {
      time = "and " + ds.toFixed(3) + " second" + pluralCheck(ds);
    }
    if (dm >= 1) time = dm + " minute" + pluralCheck(dm) + ", " + time;
    if (dh >= 1) time = dh + " hour" + pluralCheck(dh) + ", " + time;
    if (dd >= 1) time = dd + " day" + pluralCheck(dd) + ", " + time;
    if (dmo >= 1) time = dmo + " month" + pluralCheck(dmo) + ", " + time;
    if (dy >= 1) time = dy + " year" + pluralCheck(dy) + ", " + time;
    if (m < 60) time = time.replace(",", "");
    return time;
  } else {
    time = (ds < 10 ? "0" : "") + ds.toFixed(2);
    time = (dm < 10 ? "0" : "") + dm + ":" + time;
    if (dh >= 1) time = (dh < 10 ? "0" : "") + dh + ":" + time;
    if (dd >= 1) time = dd + ":" + time;
    if (dmo >= 1) time = dmo + ":" + time;
    if (dy >= 1) time = dy + ":" + time;
    return time;
  }
}
function pluralCheck(n) {
  return n === 1 ? "" : "s";
}
var id = (x) => document.getElementById(x);

load();
respawn(false);
adjustScreen(true);
window.requestAnimationFrame(nextFrame);
setTimeout(drawLevel, 100);
