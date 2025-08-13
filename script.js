import { InitUIController, viewController, setReferenceZoom,predictOverheat,updateOverheatPreview,UIOnNewTurn } from './scripts/ui/controller.js';
import { onShipCoinCollision, onShipAsteroidCollision, onShipBorderCollision } from './scripts/collisions.js';
import { ProbeEnemy } from './scripts/enemies/ProbeEnemy.js';
import { KamikazeEnemy } from './scripts/enemies/KamikazeEnemy.js';
import { ViperEnemy } from './scripts/enemies/ViperEnemy.js';
import { setupCameraControls, resetCameraToShip } from './scripts/cameraControls.js';
import { flashSprite } from './scripts/utils/combat.js';
import { PlayerShip } from './scripts/PlayerShip.js';
import { showShieldsGettingHit,animatePlayerExit,animatePlayerExploding } from './scripts/utils/animations.js';
import { ReportScene } from './scenes/report.js'; // Import the report scene
import SelectLevelScene from './scenes/selectlevel.js';
import { generateLevel } from './scripts/utils/levelgenerator.js'; // Import the level generator
import { RENDER_LAYERS } from './scripts/utils/rendering.js'; 
import { Radar } from './scripts/utils/radar.js'; // Import the radar class  
import { handleBorderPivots } from './scripts/utils/BorderPivots.js'; // Import the border pivot handler
import { delay } from './scripts/utils/timing.js';
import { EditorScene } from './scenes/EditorScene.js';
import { BootScene } from './scenes/BootScene.js';
import { StatType,EnemyShipTemplates } from './scripts/Stats.js';
import { GameState } from './scripts/GameState.js';
import { UpgradeScene } from './scenes/UpgradeScene.js';
import {SelectShipScene} from './scenes/SelectShipScene.js';
import { drawConePreview, initDrawCone,cleanCone } from './scripts/utils/cone.js';
import {SelectMissionScene} from './scenes/SelectMissionScene.js';
import { Progress } from './scripts/Progress.js';

window.DEBUGMODE = false; // Set to true to enable debug mode
let sceneRef;

class SpaceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SpaceScene' });
    }

    init(data) {
        if (data.levelData) {
            this.levelData = data.levelData;
            this.levelPath = null;
        } else {
            console.error("No level data provided!");
            }
        console.log("Loading ");
        console.log(this.levelData.title);
    }

    preload() {



    }
  

    isTargetInCone(origin, target, maxDistance, coneAngleDeg) {
        const dx = target.x - origin.x;
        const dy = target.y - origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = target.body?.circle?.radius || target.body?.width / 2 || 0;

        if (distance - radius > maxDistance) return false;

        const originAngleRad = Phaser.Math.DegToRad(origin.angle || 0); // fallback to 0 if no angle
        const angleToTarget = Phaser.Math.Angle.Between(origin.x, origin.y, target.x, target.y);
        const angleDiff = Phaser.Math.Angle.Wrap(angleToTarget - originAngleRad);

        const halfCone = Phaser.Math.DegToRad(coneAngleDeg / 2);

        return Math.abs(angleDiff) <= halfCone;
    }



    drawArcPreview(angle, distance) {
        if(!window.DEBUGMODE) return;
        if (this.arcPreview) {
            this.arcPreview.clear();
        } else {
            this.arcPreview = this.add.graphics();
        }

        this.arcPreview.clear();
        this.arcPreview.lineStyle(2, 0x00ff00, 1);
        const steps = 100;
        const arcAngle = angle;
        const arcLength = distance * this.ship.unitDistance;
        const angleIncrement = arcAngle / steps;
        const distancePerStep = arcLength / steps;

        let tempAngle = this.ship.sprite.angle;
        let tempX = this.ship.sprite.x;
        let tempY = this.ship.sprite.y;

        this.arcPreview.beginPath();
        this.arcPreview.moveTo(tempX, tempY);

        for (let i = 0; i < steps; i++) {
            tempAngle += angleIncrement;
            const angleRad = Phaser.Math.DegToRad(tempAngle);
            const dx = Math.cos(angleRad) * distancePerStep;
            const dy = Math.sin(angleRad) * distancePerStep;
            tempX += dx;
            tempY += dy;
            this.arcPreview.lineTo(tempX, tempY);
        }

        this.arcPreview.strokePath();

        // Draw arrowhead
        const arrowSize = 10;
        const finalAngleRad = Phaser.Math.DegToRad(tempAngle);
        const leftWing = Phaser.Math.Rotate(new Phaser.Math.Vector2(-arrowSize, -arrowSize / 2), finalAngleRad);
        const rightWing = Phaser.Math.Rotate(new Phaser.Math.Vector2(-arrowSize, arrowSize / 2), finalAngleRad);

        const leftX = tempX + leftWing.x;
        const leftY = tempY + leftWing.y;
        const rightX = tempX + rightWing.x;
        const rightY = tempY + rightWing.y;

        this.arcPreview.fillStyle(0x00ff00, 1);
        this.arcPreview.beginPath();
        this.arcPreview.moveTo(tempX, tempY);
        this.arcPreview.lineTo(leftX, leftY);
        this.arcPreview.lineTo(rightX, rightY);
        this.arcPreview.closePath();
        this.arcPreview.fillPath();
    }




    create() {
        if (this.levelPath) {
            this.levelData = this.cache.json.get('levelData');
        }

        const levelData = this.levelData;
        if(!levelData) {
            console.error("Level data not found!");
            return;
        }

        //mission things
        if(!GameState.run.currentMission) {
            GameState.run.currentMission = {}
        }
        GameState.run.currentMission.progress = new Progress();

        this.isUTurnEnabled = false; // Initialize U-turn toggle
        this.overheat = 0;
        this.maxOverheat = 100; // Set max overheat level
        this.prevAngle = 0;
        this.prevThrust = 2;
        this.hasCollidedThisTurn = new Set();

        this.game.soundManager.playMusic('bgm_gameplay');

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
            frameRate: 20,
            hideOnComplete: true
        });

        const cam = this.cameras.main;
        const viewWidth = cam.width / cam.zoom;
        const viewHeight = cam.height / cam.zoom;
        const buffer = 1000; // Extra area to avoid edges

        this.background = this.add.tileSprite(
            cam.scrollX - buffer / 2,
            cam.scrollY - buffer / 2,
            viewWidth + buffer,
            viewHeight + buffer,
            'background'
        )
        .setDepth(RENDER_LAYERS.LOWEST)
        .setOrigin(0)
        .setScrollFactor(0);
        // // Draw grid
        // const graphics = this.add.graphics();
        // const tileSize = 100;
        // const cols = Math.ceil(this.scale.width / tileSize);
        // const rows = Math.ceil(this.scale.height / tileSize);

        // for (let row = 0; row < rows; row++) {
        //     for (let col = 0; col < cols; col++) {
        //         graphics.fillStyle((row + col) % 2 === 0 ? 0xcccccc : 0xffffff,0.1);
        //         graphics.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        //         //make it half transparent

        //     }
        // }
        InitUIController(this);
        this.trailContainer = this.add.container(0, 0);
        this.trailContainer.setDepth(RENDER_LAYERS.PLAYER_VISUALS_BEHIND);
        //exit
        this.exit = this.physics.add.image(levelData.exit.x, levelData.exit.y, 'escape');
        this.exit.setDepth(RENDER_LAYERS.SPACE_FEATURES);
        this.exit.setOrigin(0.5, 0.5);
        this.exit.setCircle(64, 0, 0); // Adjust radius and offset as needed
        //add spinning animation to exit
        this.tweens.add({
            targets: this.exit,
            angle: 360,
            duration: 50000,
            repeat: -1, // Infinite repeat
            ease: 'Linear'
        });
        
        // Create a glow effect by adding a second image beneath the main one
        const exitGlow = this.add.image(levelData.exit.x, levelData.exit.y, 'escape');
        exitGlow.setOrigin(0.5, 0.5);
        exitGlow.setScale(1.2);
        exitGlow.setTint(0xffffff); // Yellowish glow
        exitGlow.setAlpha(0.5);

        // Animate the glow (pulsing effect)
        this.tweens.add({
            targets: exitGlow,
            scale: { from: 0.4, to: 1.1 },
            alpha: { from: 0.4, to: 0.8 },
            duration: 5000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        //add spinning animation to exit
        this.tweens.add({
            targets:exitGlow,
            angle: 360,
            duration: 40000,
            repeat: -1, // Infinite repeat
            ease: 'Linear'
        });

        this.add.text(
            levelData.exit.x, 
            levelData.exit.y + 80, // Adjust vertical offset as needed
            'Exit', 
            {
                font: '20px Arial',
                fill: '#00ffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);
        const playerPos = levelData.playerStart;
        const shipSprite = this.physics.add.image(playerPos.x, playerPos.y, GameState.shipData.image);
        this.ship = new PlayerShip(this, shipSprite, playerPos.x, playerPos.y,GameState.shipData);
        this.ship.sprite.setCircle(16, 16, 16);
        this.ship.sprite.setDepth(RENDER_LAYERS.PLAYER);
        //offset the collider
        this.ship.sprite.setAngle(0);
        
        
        this.cameras.main.startFollow(this.ship.sprite);
        const targetShipWidth = this.scale.width * 0.05; // 5% of viewport width
        const zoom = targetShipWidth / 64; // 64 = ship original width
        this.cameras.main.setZoom(zoom);  
        
        
        this.commandInProgress = false;
        
        this.asteroids = this.physics.add.group();
        (levelData.asteroids || []).forEach(pos => {
            const asteroid = this.asteroids.create(pos.x +5, pos.y+5, 'asteroid256')
            .setDepth(RENDER_LAYERS.SPACE_FEATURES)
            
            .setCircle(256/4,256/4,256/4); // adjust radius as needed
            asteroid.body.setImmovable(true);
        });
        

        // Coins
        this.coins = this.physics.add.group();
        (levelData.coins || []).forEach(pos => {
            const coin = this.coins.create(pos.x, pos.y, 'coin');
            coin.setDepth(RENDER_LAYERS.COIN);
            coin.setCircle(64,-32,-32);
        });
        
        //border pivots        
        handleBorderPivots(this, levelData.borderpivots || []);

        this.physics.add.collider(this.ship.sprite, this.asteroids, (ship, asteroid) => onShipAsteroidCollision(this, ship, asteroid), null, this);
        this.physics.add.overlap(this.ship.sprite, this.coins, (ship, coin) => onShipCoinCollision(this, ship, coin), null, this);
                // Step 3: Add collision between player and laser walls
        this.physics.add.collider(this.ship.sprite, this.laserWalls,(ship, wall) => onShipBorderCollision(this, ship, wall), null, this);
        
        // Create enemy ships
        this.enemies = this.physics.add.group();
        
        (levelData.enemies || []).forEach(data => {
            let enemySprite;
switch (data.enemy_type) {
    case 'basic_turret':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_basic_turret');
        new ProbeEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.basic_turret);
        break;
    case 'probe':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_probe');
        new ProbeEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.probe);
        break;
    case 'destroyer':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_kamikaze');
        new ViperEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.destroyer);
        break;
    case 'viper':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_viper');
        new ViperEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.viper);
        break;
    case 'ghost':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_ghost');
        new ViperEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.ghost);
        break;
    case 'deathstar':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_deathstar');
        new ProbeEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.deathstar);
        break;
    case 'carrier':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_carrier');
        new ViperEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.carrier); // Consider creating CarrierEnemy class
        break;
    case 'mine':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_mine');
        new ProbeEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.mine); // Consider creating MineEnemy class
        break;
    case 'turret':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_turret');
        new ProbeEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.turret);
        break;
    case 'advanced_viper':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_advanced_viper');
        new ViperEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.advanced_viper);
        break;
    case 'dreadnoght':
        enemySprite = this.enemies.create(data.x, data.y, 'enemy_dreadnoght');
        new ViperEnemy(this, enemySprite, data.x, data.y, EnemyShipTemplates.dreadnoght);
        break;
    default:
        console.warn('Unknown enemy type:', data.enemy_type);
        return;
}

        });
        
        this.physics.add.overlap(this.enemies, this.asteroids, (enemy) => enemy.getData("controller").OnOverlappingAsteroid(enemy), null, this);
        this.children.moveBelow(this.trailContainer, this.ship.sprite);

        // this.input.keyboard.on('keydown-D', () => {
        //     window.DEBUGMODE = !window.DEBUGMODE;
        //     console.log('Debug mode:', window.DEBUGMODE);
        // });
        
        this.input.keyboard.on('keydown-E', () => {            
            this.scene.start('EditorScene',this.levelData);
        });

        // this.input.keyboard.on('keydown-T', () => {            
        //     this.game.soundManager.playSFX("hit_asteroid");
            
        // });


        this.input.keyboard.on('keydown-F', () => {

            this.ship.resetStats();
            GameState.shipData = this.ship.stats;


            this.scene.stop('SpaceScene'); // or
            //load ReportScene
            GameState.run.currentMission.missionFailed = false; // Set mission success state
            this.scene.launch('ReportScene');
        });

        this.input.keyboard.on('keydown-X', () => {
           // onShipCoinCollision(this, this.ship.sprite, this.coins.getChildren()[0]);
           //player ship take damage
            this.ship.takeDamage(100);
        });

        
        // Improved camera dragging
        setupCameraControls(this);

        //radar
        this.radar = new Radar(this, this.ship.sprite);
        //cones
        initDrawCone(this);
        drawConePreview(this,this.ship.sprite.x, this.ship.sprite.y, this.ship.sprite.angle, this.ship.stats[StatType.ATTACK_RANGE].current, this.ship.stats[StatType.ATTACK_ANGLE].current);


        this.cursors = this.input.keyboard.createCursorKeys();

        //radar
        this.isRadarEnabled = false;

        setReferenceZoom(zoom); // Set reference zoom for UI
        this.storeOriginalYValues();//for the floating idle animation
        this.ship.updateUI();
        this.onTurnStarts();
    }

    OnOverlappingAsteroid(who)
    {
        console.log(who);
    }
    
    triggerExplosion() {
        console.log("🔥 Engine overheated! Ship explodes.");
        const explosion = this.add.sprite(this.ship.sprite.x, this.ship.sprite.y, 'explosion');
        explosion.setScale(3);
        explosion.play('explode');
        
        this.ship.sprite.setVisible(false);
        this.commandInProgress = true;
        
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        });
    }
    



    update(time, delta) {
        if (this.ship.sprite) {
            this.background.tilePositionX = this.cameras.main.scrollX * 0.5;
            this.background.tilePositionY = this.cameras.main.scrollY * 0.5;
        }

        if (this.ship.shieldsEnabled) { //todo, put this in BaseShip??
            this.ship.drawShield();
        }
        //idle animation
        if (!this.commandInProgress) {
            const floatSpeed = 0.002; // smaller = slower
            const floatHeight = 2;


            this.coins.getChildren().forEach(coin => {
                coin.setY(coin.originalY + Math.sin(time * floatSpeed  + coin.originalY) * floatHeight);
                coin.angle+=0.01;
            });

            this.enemies.getChildren().forEach(enemy => {
                enemy.setY(enemy.originalY + Math.sin(time * floatSpeed+ enemy.originalY) * floatHeight);
            });
        }



        if(this.isRadarEnabled)
            this.radar.update(this.enemies, this.coins, this.exit);

    }

    storeOriginalYValues() {
    this.coins.getChildren().forEach(coin => {
        coin.originalY = coin.y;
    });

    this.enemies.getChildren().forEach(enemy => {
        enemy.originalY = enemy.y;
    });
}

  async processEnemyMovementOnly() {
    const playerX = this.ship.sprite.x;
    const playerY = this.ship.sprite.y;
    const playerAngle = this.ship.sprite.angle;

    const enemies = this.enemies.getChildren();
    const controllers = [];

    for (const enemy of enemies) {
        const controller = enemy.getData('controller');
        if (controller) {
            flashSprite(this, enemy, 1, 100, 0xffffff);
            controllers.push({ controller, enemy });
        }
    }

    await delay(this, 1000);

    // Just update behavior (movement)
    await Promise.all(
        controllers.map(({ controller }) =>
            controller.updateBehavior(playerX, playerY, playerAngle)
        )
    );
}

async processEnemyAttackOnly() {
    const playerX = this.ship.sprite.x;
    const playerY = this.ship.sprite.y;
    const playerAngle = this.ship.sprite.angle;

    const enemies = this.enemies.getChildren();

    for (const enemy of enemies) {
        const controller = enemy.getData('controller');
        if (controller) {
            await controller.takeAttackAction(playerX, playerY, playerAngle);
            if (this.ship.stats[StatType.HULL].current < 1) {
                console.log("Player ship destroyed by enemy!");
                await animatePlayerExploding(this, this.ship);
                GameState.run.currentMission.missionFailed = true; // Set mission failed state
                this.scene.start('ReportScene', {
                    missionFailed: true
                });
                return;
            }
        }
    }
}




    async executeArcCommand(angle, distance) {
        if(this.commandInProgress) return;
        this.radar.disableRadar();
        this.hasCollidedThisTurn = new Set();
        this.overheat += predictOverheat(angle, distance,this.isUTurnEnabled).predicted;
        this.overheat = Math.max(this.overheat, 0);
        updateOverheatPreview();

        //remove trails
        this.enemies.getChildren().forEach(enemy => {
    const controller = enemy.getData('controller');
    controller.clearTrail();});
    this.ship.clearTrail();

        this.prevAngle = angle;
        this.prevThrust = distance;

        if (this.overheat >= this.maxOverheat) {
            this.triggerExplosion();
            return;
        }

        if (this.commandInProgress) return;

        // Smoothly reset and follow ship
        await resetCameraToShip(this);
        this.panLocked = true;

        this.commandInProgress = true;

        const arcAngle = angle;
        const arcLength = distance * this.ship.unitDistance;
        const steps = 200;
        const duration = (arcLength / this.ship.moveSpeed) * 1000;
        const angleIncrement = arcAngle / steps;
        const distancePerStep = arcLength / steps;

        let step = 0;
        this.ship.startTrailing();

        this.arcTimer = this.time.addEvent({
            delay: duration / steps,
            repeat: steps - 1,
            callback: () => {
                const prevX = this.ship.sprite.x;
                const prevY = this.ship.sprite.y;

                this.ship.sprite.angle += angleIncrement;
                const angleRad = Phaser.Math.DegToRad(this.ship.sprite.angle);
                const dx = Math.cos(angleRad) * distancePerStep;
                const dy = Math.sin(angleRad) * distancePerStep;

                this.ship.sprite.x += dx;
                this.ship.sprite.y += dy;

                this.ship.updateTrail();

//                 // Add fading trail dot
// // Compute offsets for left and right propellers (±30px from center, perpendicular to ship angle)
//                 const offsetX = Math.sin(angleRad) * 12;
//                 const offsetY = -Math.cos(angleRad) * 12;

//                 // Positions of left and right propellers
//                 const leftX = this.ship.sprite.x - offsetX;
//                 const leftY = this.ship.sprite.y - offsetY;
//                 const rightX = this.ship.sprite.x + offsetX;
//                 const rightY = this.ship.sprite.y + offsetY;

//                 // Add fading trail dots at both positions
//                 [ [leftX, leftY], [rightX, rightY] ].forEach(([x, y]) => {
//                     const dot = this.add.circle(x, y, 5, 0xFFFFFF, 0.8);
//                     this.trailContainer.add(dot);
//                     this.tweens.add({
//                         targets: dot,
//                         alpha: 0,
//                         radius: 1,
//                         duration: 1000*distance,
//                         onComplete: () => dot.destroy()
//                     });
//                 });

                step++;
                drawConePreview(this,this.ship.sprite.x, this.ship.sprite.y, this.ship.sprite.angle, this.ship.stats[StatType.ATTACK_RANGE].current, this.ship.stats[StatType.ATTACK_ANGLE].current);
                if (step >= steps) {
                    this.arcTimer.remove();
                    this.OnPlayerMovementComplete(); 
                    this.ship.stopTrailing();                   
                }
            }
        });
    }

    async OnPlayerMovementComplete() {

        cleanCone(this);

        //check if player has hit a border wall
        if(this.ship.hitBorderWall){            
            await animatePlayerExploding(this, this.ship);
            GameState.run.currentMission.missionFailed = true; // Set mission failed state
            this.scene.start('ReportScene');
            return;
        }

        //check if player has hit an asteroid and died
        if(this.ship.stats[StatType.HULL].current  < 1) {
            GameState.run.currentMission.missionFailed = true; // Set mission failed state

            await animatePlayerExploding(this, this.ship);
            this.scene.start('ReportScene');
            return;
        }
        //check if player is inside the exit
        if (Phaser.Geom.Intersects.CircleToCircle(
            new Phaser.Geom.Circle(this.ship.sprite.x, this.ship.sprite.y, 32),
            new Phaser.Geom.Circle(this.exit.x, this.exit.y, 64)
        )) {
            console.log("Player has exited the level!");
            await animatePlayerExit(this, this.ship, this.exit);
            //save stats
            this.ship.resetStats();
            GameState.shipData  = this.ship.stats;
            //Trigger level completion logic here
            GameState.run.currentMission.missionFailed = false; // Set mission success state
            
            this.scene.start('ReportScene');

           
            return;
        }

        //check for u-turn
        if (this.isUTurnEnabled) {
            await this.ship.performUTurn();
        }

        // Enemies move first
await this.processEnemyMovementOnly();

// Then player shoots
await this.ship.takeAttackAction();

// Then enemies shoot
await this.processEnemyAttackOnly();

        //reset for new turn
        this.commandInProgress = false;
        if (this.arcPreview) this.arcPreview.clear();
        this.storeOriginalYValues();

        
        this.onTurnStarts();
    }

    onTurnStarts()
    {

        this.enemies.getChildren().forEach(enemy => {
            const controller = enemy.getData('controller');
            // if (controller && typeof controller.predictPlayerPosition === 'function') {
            //     controller.predictPlayerPosition(
            //         this, 
            //         this.ship.sprite.x,
            //         this.ship.sprite.y,
            //         90,
            //         500,
            //         this.ship.sprite.angle
            //     );
            // }

            controller.OnTurnStarts();
            
        });

        drawConePreview(this,this.ship.sprite.x, this.ship.sprite.y, this.ship.sprite.angle, this.ship.stats[StatType.ATTACK_RANGE].current, this.ship.stats[StatType.ATTACK_ANGLE].current);
        UIOnNewTurn();
        this.panLocked = false;

    }

//     enemiesPredictPosition()
//     {
//        //all enemies predict movement
//     this.enemies.getChildren().forEach(enemy => {
//     const controller = enemy.getData('controller');
//     if (controller && typeof controller.predictPlayerPosition === 'function') {
//         controller.predictPlayerPosition(
//             this, 
//             this.ship.sprite.x,
//             this.ship.sprite.y,
//             90,
//             500,
//             this.ship.sprite.angle
//         );
//     }
//     else{console.log("not a func")}
// });
//     }


    findTargetsInConeRange(origin, group, maxDistance, coneAngleDeg) {
        return group.getChildren().filter(target =>
            this.isTargetInCone(origin, target, maxDistance, coneAngleDeg)
        );
    }
}

const config = {
    type: Phaser.AUTO,
    scene: [BootScene,SelectMissionScene,SelectShipScene,SelectLevelScene,SpaceScene,ReportScene,EditorScene,UpgradeScene],
    physics: { 
        default: 'arcade',
        arcade: {
            debug: window.DEBUGMODE,
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
    },
    backgroundColor: '#000000'
};

const game = new Phaser.Game(config);
