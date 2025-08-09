import { RENDER_LAYERS } from '../scripts/utils/rendering.js';
import { EnemyShipTemplates } from '../scripts/Stats.js';

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
        // Preload assets externally as needed.
    }

    create() {
        const ui = document.getElementById('ui');
        if (ui) ui.style.display = 'none';

        document.getElementById('levelMetaForm').style.display = 'block';

        this.cameras.main.setZoom(1);
        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.setScroll(0, 0);

        this.createGrid();
        this.createHtmlUI();

        document.getElementById('levelTitle').value = this.levelData.title;
        document.getElementById('levelAuthor').value = this.levelData.createdby;
        document.getElementById('levelDifficulty').value = this.levelData.difficulty;
        document.getElementById('levelDescription').value = this.levelData.description;

        this.cameras.main.ignore(this.uiElements);
        this.rebuildLevel();

        this.placePlayerStart();
        this.placeExit();

        this.setupCameraControls();

        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.keyboard.on('keydown-DELETE', this.handleDelete, this);

        this.scale.on('resize', (gameSize) => {
            this.uiCamera.setSize(gameSize.width, gameSize.height);
        });

        this.input.mouse.disableContextMenu();
    }

    createHtmlUI() {
        const container = document.createElement('div');
        container.id = 'editorToolbar';
        Object.assign(container.style, {
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: '200px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '10px',
            color: 'white',
            zIndex: 1000,
            display: 'block'
        });

        const title = document.createElement('h3');
        title.textContent = 'Tools';
        container.appendChild(title);

        const toolButtonsContainer = document.createElement('div');
        toolButtonsContainer.id = 'toolButtons';

        const tools = [
            { name: 'player', text: 'Player Start' },
            { name: 'exit', text: 'Exit' },
            { name: 'asteroid', text: 'Asteroid' },
            { name: 'coin', text: 'Coin' },
            { name: 'pivot', text: 'Border Pivot' },
            ...Object.entries(EnemyShipTemplates).map(([key, template]) => ({
                name: key,
                text: template.editorName || key
            }))
        ];

        tools.forEach(tool => {
            const button = document.createElement('button');
            button.textContent = tool.text;
            button.dataset.tool = tool.name;
            Object.assign(button.style, {
                display: 'block',
                marginBottom: '4px',
                width: '100%'
            });
            button.addEventListener('click', () => {
                this.currentTool = tool.name;
                this.updateToolButtonHighlight();
            });
            toolButtonsContainer.appendChild(button);
        });

        container.appendChild(toolButtonsContainer);
        container.appendChild(document.createElement('hr'));

        const makeButton = (text, id, onClick) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.id = id;
            Object.assign(btn.style, {
                display: 'block',
                marginBottom: '6px',
                width: '100%'
            });
            btn.addEventListener('click', onClick);
            return btn;
        };

        container.appendChild(makeButton('Save Level', 'saveLevelBtn', () => this.saveLevel()));
        container.appendChild(makeButton('Load Level', 'loadLevelBtn', () => this.loadLevel()));
        container.appendChild(makeButton('Play Level', 'playLevelBtn', () => {
            document.getElementById('editorToolbar').remove();
            document.getElementById('levelMetaForm').style.display = 'none';
            this.scene.start('SpaceScene', { levelData: this.levelData });
        }));

        document.body.appendChild(container);
        this.updateToolButtonHighlight();
    }

    updateToolButtonHighlight() {
        document.querySelectorAll('#toolButtons button').forEach(btn => {
            btn.style.backgroundColor = (btn.dataset.tool === this.currentTool) ? '#6666ff' : '';
        });
    }

    handlePointerDown(pointer) {
        if (pointer.x < 220 || this.isDraggingObject || this.isPanningCamera) return;

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
                const asteroidData = { x, y };
                this.levelData.asteroids.push(asteroidData);
                this.placeAsteroid(asteroidData);
                break;
            case 'coin':
                const coinData = { x, y };
                this.levelData.coins.push(coinData);
                this.placeCoin(coinData);
                break;
            case 'pivot':
                const pivotData = { x, y };
                this.levelData.borderpivots.push(pivotData);
                this.placePivot(pivotData);
                break;
            default:
                if (EnemyShipTemplates[this.currentTool]) {
                    const enemyData = { x, y, enemy_type: this.currentTool };
                    this.levelData.enemies.push(enemyData);
                    this.placeEnemy(enemyData);
                }
                break;
        }
    }

    placeEnemy(data) {
        const template = EnemyShipTemplates[data.enemy_type];
        if (!template) {
            console.warn(`Unknown enemy type: ${data.enemy_type}`);
            return;
        }

        const spriteKey = template.spriteKey || `enemy_${data.enemy_type}`;
        const sprite = this.add.image(data.x, data.y, spriteKey)
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
        this.attachDeleteOnRightClick(obj);
        this.placedObjects.push(obj);
    }

    // All other placeX methods remain unchanged...
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
        this.attachDeleteOnRightClick(obj);
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
        this.attachDeleteOnRightClick(obj);
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
        this.attachDeleteOnRightClick(obj);
        this.placedObjects.push(obj);
    }

    placePlayerStart() {
        const existing = this.placedObjects.find(obj => obj.type === 'player');
        if (existing) existing.sprite.destroy();
        this.placedObjects = this.placedObjects.filter(obj => obj.type !== 'player');
        const sprite = this.add.image(this.levelData.playerStart.x, this.levelData.playerStart.y, 'ship')
            .setDepth(RENDER_LAYERS.PLAYER)
            .setInteractive({ draggable: true });
        this.input.setDraggable(sprite);
        const obj = { type: 'player', sprite, data: this.levelData.playerStart };
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
        if (existing) existing.sprite.destroy();
        this.placedObjects = this.placedObjects.filter(obj => obj.type !== 'exit');
        const sprite = this.add.image(this.levelData.exit.x, this.levelData.exit.y, 'escape')
            .setDepth(RENDER_LAYERS.SPACE_FEATURES)
            .setInteractive({ draggable: true });
        this.input.setDraggable(sprite);
        const obj = { type: 'exit', sprite, data: this.levelData.exit };
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

    attachDeleteOnRightClick(obj) {
        obj.sprite.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                obj.sprite.destroy();
                this.placedObjects = this.placedObjects.filter(o => o !== obj);
                switch (obj.type) {
                    case 'asteroid': this.levelData.asteroids = this.levelData.asteroids.filter(d => d !== obj.data); break;
                    case 'coin': this.levelData.coins = this.levelData.coins.filter(d => d !== obj.data); break;
                    case 'enemy': this.levelData.enemies = this.levelData.enemies.filter(d => d !== obj.data); break;
                    case 'pivot': this.levelData.borderpivots = this.levelData.borderpivots.filter(d => d !== obj.data); break;
                }
            }
        });
    }

    update() {
        this.uiCamera.ignore(this.children.list.filter(child => !this.uiElements.includes(child)));
    }

    handlePointerMove(pointer) {}
    handleDelete() {}

    setupCameraControls() {
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const zoom = this.cameras.main.zoom;
            this.cameras.main.setZoom(Phaser.Math.Clamp(zoom * (deltaY > 0 ? 0.95 : 1.05), 0.5, 2));
        });

        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        this.input.on('dragstart', () => { this.isDraggingObject = true; });
        this.input.on('dragend', () => { this.isDraggingObject = false; });

        this.input.on('pointerdown', (pointer) => {
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
}
