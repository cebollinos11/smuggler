import { RENDER_LAYERS } from '../scripts/utils/rendering.js';

export class EditorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EditorScene' });
        this.currentTool = 'asteroid';
        this.levelData = {
            title: '',
            createdby: '',
            difficulty: '',
            description: '',
            playerStart: { x: 400, y: 300 },
            exit: { x: 1000, y: 600 },
            asteroids: [],
            coins: [],
            enemies: [],
            borderpivots: []
        };
        this.placedObjects = [];
        this.uiElements = [];
        this.isDraggingObject = false;
        this.isPanningCamera = false;

    }

init(data) {
    const fallback = {
        playerStart: { x: 400, y: 300 },
        exit: { x: 1000, y: 600 },
        asteroids: [],
        coins: [],
        enemies: [],
        borderpivots: []
    };

    const incoming = data || {};

    this.levelData = {
        title: incoming.title || '',
        createdby: incoming.createdby || '',
        difficulty: incoming.difficulty || '',
        description: incoming.description || '',
        playerStart: { ...fallback.playerStart, ...(incoming.playerStart || {}) },
        exit: { ...fallback.exit, ...(incoming.exit || {}) },
        asteroids: incoming.asteroids ?? [],
        coins: incoming.coins ?? [],
        enemies: incoming.enemies ?? [],
        borderpivots: incoming.borderpivots ?? []
    };
}


    preload() {
        this.load.image('ship', 'assets/playership.png');
        this.load.image('asteroid256', 'assets/asteroid256.png');
        this.load.image('coin', 'assets/astronaut.png');
        this.load.image('escape', 'assets/blackhole.png');
        this.load.image('enemy_probe', 'assets/enemies/enemy_probe.png');
        this.load.image('enemy_kamikaze', 'assets/enemies/enemy_kamikaze.png');
        this.load.image('enemy_viper', 'assets/enemies/enemy_viper.png');
        this.load.image('pivot', 'assets/reticle.png');
    }

    create() {
        // Hide any other UI
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.display = 'none';
        }

        // Inside create():
        document.getElementById('levelMetaForm').style.display = 'block';

        // Create cameras
        this.cameras.main.setZoom(1);
        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.setScroll(0, 0);
        


        // Create grid
        this.createGrid();

        // Create UI
        this.createEditorUI();
                // Populate form if levelData has values
        document.getElementById('levelTitle').value = this.levelData.title;
        document.getElementById('levelAuthor').value = this.levelData.createdby;
        document.getElementById('levelDifficulty').value = this.levelData.difficulty;
        document.getElementById('levelDescription').value = this.levelData.description;

        // Ignore UI elements on main camera
        this.cameras.main.ignore(this.uiElements);

         // Load existing items
        this.rebuildLevel();

        // Place objects
        this.placePlayerStart();
        this.placeExit();

        // Controls
        this.setupCameraControls();
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.keyboard.on('keydown-DELETE', this.handleDelete, this);

        // Handle resizing
        this.scale.on('resize', (gameSize) => {
            this.uiCamera.setSize(gameSize.width, gameSize.height);
        });

        this.cameras.main.ignore(this.uiElements);
        this.uiCamera.ignore(this.children.list.filter(child => !this.uiElements.includes(child)));

        this.input.mouse.disableContextMenu();

    }

    createGrid() {
        const graphics = this.add.graphics();
        const tileSize = 100;
        const width = this.scale.width * 3;
        const height = this.scale.height * 3;
        const cols = Math.ceil(width / tileSize);
        const rows = Math.ceil(height / tileSize);

        graphics.lineStyle(1, 0x333333, 0.5);

        for (let row = 0; row < rows; row++) {
            graphics.moveTo(0, row * tileSize);
            graphics.lineTo(width, row * tileSize);
        }

        for (let col = 0; col < cols; col++) {
            graphics.moveTo(col * tileSize, 0);
            graphics.lineTo(col * tileSize, height);
        }

        graphics.strokePath();
    }

    attachDeleteOnRightClick(obj) {
    obj.sprite.on('pointerdown', (pointer) => {
        if (pointer.rightButtonDown()) {
            // Remove sprite from scene
            obj.sprite.destroy();

            // Remove from placedObjects
            this.placedObjects = this.placedObjects.filter(o => o !== obj);

            // Remove from levelData
            switch (obj.type) {
                case 'asteroid':
                    this.levelData.asteroids = this.levelData.asteroids.filter(d => d !== obj.data);
                    break;
                case 'coin':
                    this.levelData.coins = this.levelData.coins.filter(d => d !== obj.data);
                    break;
                case 'enemy':
                    this.levelData.enemies = this.levelData.enemies.filter(d => d !== obj.data);
                    break;
                case 'pivot':
                    this.levelData.borderpivots = this.levelData.borderpivots.filter(d => d !== obj.data);
                    break;
                case 'player':
                    // optional: disable deleting player
                    break;
                case 'exit':
                    // optional: disable deleting exit
                    break;
            }
        }
    });
}


    createEditorUI() {
        const addUIElement = (obj) => {
            obj.setScrollFactor(0);
            this.uiElements.push(obj);
        };

        const toolbar = this.add.rectangle(10, 10, 200, this.scale.height - 20, 0x333333, 0.8)
            .setOrigin(0)
            .setDepth(RENDER_LAYERS.UI);
        addUIElement(toolbar);

        const tools = [
            { name: 'player', text: 'Player Start' },
            { name: 'exit', text: 'Exit' },
            { name: 'asteroid', text: 'Asteroid' },
            { name: 'coin', text: 'Coin' },
            { name: 'probe', text: 'Probe Enemy' },
            { name: 'kamikaze', text: 'Kamikaze' },
            { name: 'viper', text: 'Viper' },
            { name: 'pivot', text: 'Border Pivot' }
        ];

        let yPos = 40;
        tools.forEach(tool => {
            const btn = this.add.rectangle(20, yPos, 160, 20,
                this.currentTool === tool.name ? 0x6666ff : 0x666666, 0.8)
                .setOrigin(0)
                .setInteractive()
                .setDepth(RENDER_LAYERS.UI)
                .on('pointerdown', () => {
                    this.currentTool = tool.name;
                    this.updateToolSelection();
                });
            addUIElement(btn);

            const btnText = this.add.text(30, yPos + 0, tool.text, { font: '16px Arial', fill: '#ffffff' })
                .setOrigin(0)
                .setDepth(RENDER_LAYERS.UI);
            addUIElement(btnText);

            yPos += 22;
        });

        yPos += 30;
        const saveBtn = this.add.rectangle(20, yPos, 160, 40, 0x44aa44, 0.8)
            .setOrigin(0)
            .setInteractive()
            .setDepth(RENDER_LAYERS.UI)
            .on('pointerdown', this.saveLevel.bind(this));
        addUIElement(saveBtn);

        const saveText = this.add.text(30, yPos + 10, 'Save Level', { font: '16px Arial', fill: '#ffffff' })
            .setOrigin(0)
            .setDepth(RENDER_LAYERS.UI);
        addUIElement(saveText);

        yPos += 50;
        const loadBtn = this.add.rectangle(20, yPos, 160, 40, 0xaa8844, 0.8)
            .setOrigin(0)
            .setInteractive()
            .setDepth(RENDER_LAYERS.UI)
            .on('pointerdown', this.loadLevel.bind(this));
        addUIElement(loadBtn);

        const loadText = this.add.text(30, yPos + 10, 'Load Level', { font: '16px Arial', fill: '#ffffff' })
            .setOrigin(0)
            .setDepth(RENDER_LAYERS.UI);
        addUIElement(loadText);

        yPos += 50;
        const playBtn = this.add.rectangle(20, yPos, 160, 40, 0x44aa44, 0.8)
            .setOrigin(0)
            .setInteractive()
            .setDepth(RENDER_LAYERS.UI)
            .on('pointerdown', () => {
                document.getElementById('levelMetaForm').style.display = 'none';

                this.scene.start('SpaceScene', { levelData: this.levelData });
            });
        addUIElement(playBtn);

        const playText = this.add.text(30, yPos + 10, 'Play Level', { font: '16px Arial', fill: '#ffffff' })
            .setOrigin(0)
            .setDepth(RENDER_LAYERS.UI);
        addUIElement(playText);

        this.updateToolSelection();
    }

    update()
    {
        this.uiCamera.ignore(this.children.list.filter(child => !this.uiElements.includes(child)));

    }

    updateToolSelection() {
        // Optional: implement button highlighting logic
    }
    placeAsteroid(data) {
        const sprite = this.add.image(data.x, data.y, 'asteroid256')
            .setDepth(RENDER_LAYERS.SPACE_FEATURES)
            .setInteractive({ draggable: true });

        this.input.setDraggable(sprite);

        const obj = { type: 'asteroid', sprite, data };
        sprite.on('drag', (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;
            data.x = dragX;
            data.y = dragY;
        });
        this.attachDeleteOnRightClick(obj); // 👈 Add this line

        this.placedObjects.push(obj);
    }

    placeCoin(data) {
        const sprite = this.add.image(data.x, data.y, 'coin')
            .setDepth(RENDER_LAYERS.COIN)
            .setInteractive({ draggable: true });

        this.input.setDraggable(sprite);

        const obj = { type: 'coin', sprite, data };
        sprite.on('drag', (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;
            data.x = dragX;
            data.y = dragY;
        });
this.attachDeleteOnRightClick(obj); // 👈 Add this line

        this.placedObjects.push(obj);
    }

    placeEnemy(data) {
        const sprite = this.add.image(data.x, data.y, `enemy_${data.enemy_type}`)
            .setDepth(RENDER_LAYERS.ENEMIES)
            .setInteractive({ draggable: true });

        this.input.setDraggable(sprite);

        const obj = { type: 'enemy', sprite, data };
        sprite.on('drag', (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;
            data.x = dragX;
            data.y = dragY;
        });
this.attachDeleteOnRightClick(obj); // 👈 Add this line

        this.placedObjects.push(obj);
    }

    placePivot(data) {
        const sprite = this.add.image(data.x, data.y, 'pivot')
            .setDepth(RENDER_LAYERS.SPACE_FEATURES)
            .setScale(0.5)
            .setInteractive({ draggable: true });

        this.input.setDraggable(sprite);

        const obj = { type: 'pivot', sprite, data };
        sprite.on('drag', (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;
            data.x = dragX;
            data.y = dragY;
        });
this.attachDeleteOnRightClick(obj); // 👈 Add this line

        this.placedObjects.push(obj);
    }
placePlayerStart() {
    const existing = this.placedObjects.find(obj => obj.type === 'player');
    if (existing) {
        existing.sprite.destroy();
        this.placedObjects = this.placedObjects.filter(obj => obj !== existing);
    }

    const sprite = this.add.image(this.levelData.playerStart.x, this.levelData.playerStart.y, 'ship')
        .setDepth(RENDER_LAYERS.PLAYER)
        .setInteractive({ draggable: true });

    this.input.setDraggable(sprite);

    const obj = {
        type: 'player',
        sprite,
        data: this.levelData.playerStart
    };

    sprite.on('drag', (pointer, dragX, dragY) => {
        sprite.x = dragX;
        sprite.y = dragY;
        obj.data.x = dragX;
        obj.data.y = dragY;
    });

    this.placedObjects.push(obj);
}

placeExit() {
    const existing = this.placedObjects.find(obj => obj.type === 'exit');
    if (existing) {
        existing.sprite.destroy();
        this.placedObjects = this.placedObjects.filter(obj => obj !== existing);
    }

    const sprite = this.add.image(this.levelData.exit.x, this.levelData.exit.y, 'escape')
        .setDepth(RENDER_LAYERS.SPACE_FEATURES)
        .setInteractive({ draggable: true });

    this.input.setDraggable(sprite);

    const obj = {
        type: 'exit',
        sprite,
        data: this.levelData.exit
    };

    sprite.on('drag', (pointer, dragX, dragY) => {
        sprite.x = dragX;
        sprite.y = dragY;
        obj.data.x = dragX;
        obj.data.y = dragY;
    });

    this.tweens.add({
        targets: sprite,
        angle: 360,
        duration: 50000,
        repeat: -1,
        ease: 'Linear'
    });

    this.placedObjects.push(obj);
}


handlePointerDown(pointer) {
    // Don't place if clicking on UI
    if (pointer.x < 220) return;

    // Prevent placing when dragging or panning
    if (this.isDraggingObject || this.isPanningCamera) return;

    const worldPoint = pointer.positionToCamera(this.cameras.main);
    const x = worldPoint.x;
    const y = worldPoint.y;

    switch (this.currentTool) {
        case 'player':
            this.levelData.playerStart = { x, y };
            this.placePlayerStart();
            break;
        case 'exit':
            this.levelData.exit = { x, y };
            this.placeExit();
            break;
        case 'asteroid':
            if (!this.levelData.asteroids) this.levelData.asteroids = [];
            const asteroidData = { x, y };
            this.levelData.asteroids.push(asteroidData);
            this.placeAsteroid(asteroidData);
            break;
        case 'coin':
            if (!this.levelData.coins) this.levelData.coins = [];
            const coinData = { x, y };
            this.levelData.coins.push(coinData);
            this.placeCoin(coinData);
            break;
        case 'probe':
            if (!this.levelData.enemies) this.levelData.enemies = [];
            const probeData = { x, y, enemy_type: 'probe' };
            this.levelData.enemies.push(probeData);
            this.placeEnemy(probeData);
            break;
        case 'kamikaze':
            if (!this.levelData.enemies) this.levelData.enemies = [];
            const kamikazeData = { x, y, enemy_type: 'kamikaze' };
            this.levelData.enemies.push(kamikazeData);
            this.placeEnemy(kamikazeData);
            break;
        case 'viper':
            if (!this.levelData.enemies) this.levelData.enemies = [];
            const viperData = { x, y, enemy_type: 'viper' };
            this.levelData.enemies.push(viperData);
            this.placeEnemy(viperData);
            break;
        case 'pivot':
            if (!this.levelData.borderpivots) this.levelData.borderpivots = [];
            const pivotData = { x, y };
            this.levelData.borderpivots.push(pivotData);
            this.placePivot(pivotData);
            break;
    }
}



    handlePointerMove(pointer) {
        // Add hover preview if needed
    }

    handleDelete() {
        // Implement selection + delete logic
    }

    

setupCameraControls() {
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
        const zoom = this.cameras.main.zoom;
        if (deltaY > 0 && zoom > 0.5) {
            this.cameras.main.setZoom(zoom * 0.95);
        } else if (deltaY < 0 && zoom < 2) {
            this.cameras.main.setZoom(zoom * 1.05);
        }
    });

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    this.input.on('dragstart', (pointer) => {
        this.isDraggingObject = true;
    });

    this.input.on('dragend', (pointer) => {
        this.isDraggingObject = false;
    });

    this.input.on('pointerdown', (pointer) => {
        // Start panning only if middle mouse button is pressed
        if (pointer.middleButtonDown()) {
            isDragging = true;
            this.isPanningCamera = true;
            lastX = pointer.x;
            lastY = pointer.y;
        }
    });

    this.input.on('pointerup', () => {
        isDragging = false;
        this.isPanningCamera = false;
    });

    this.input.on('pointermove', (pointer) => {
        if (isDragging && this.isPanningCamera) {
            const dx = pointer.x - lastX;
            const dy = pointer.y - lastY;
            this.cameras.main.scrollX -= dx / this.cameras.main.zoom;
            this.cameras.main.scrollY -= dy / this.cameras.main.zoom;
            lastX = pointer.x;
            lastY = pointer.y;
        }
    });
}


    saveLevel() {
    // Save metadata from HTML inputs
    this.levelData.title = document.getElementById('levelTitle').value;
    this.levelData.createdby = document.getElementById('levelAuthor').value;
    this.levelData.difficulty = document.getElementById('levelDifficulty').value;
    this.levelData.description = document.getElementById('levelDescription').value;

    const json = JSON.stringify(this.levelData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'level.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


    async loadLevel() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        this.levelData = JSON.parse(event.target.result);
                        this.clearLevel();
                        this.rebuildLevel();
                                                
                        // Update form fields
                        document.getElementById('levelTitle').value = this.levelData.title || '';
                        document.getElementById('levelAuthor').value = this.levelData.createdby || '';
                        document.getElementById('levelDifficulty').value = this.levelData.difficulty || '';
                        document.getElementById('levelDescription').value = this.levelData.description || '';
                        resolve();
                    } catch (err) {
                        console.error('Error loading level:', err);
                        resolve();
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        });
    }

    clearLevel() {
        this.placedObjects.forEach(obj => obj.sprite.destroy());
        this.placedObjects = [];
    }

    rebuildLevel() {
        this.placePlayerStart();
        this.placeExit();
        this.levelData.asteroids.forEach(data => this.placeAsteroid(data));
        this.levelData.coins.forEach(data => this.placeCoin(data));
        this.levelData.enemies.forEach(data => this.placeEnemy(data));
        this.levelData.borderpivots.forEach(data => this.placePivot(data));
    }
}
