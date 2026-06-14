<h1>Bare Template</h1>
The starting point for a new project using the <a href="https://github.com/bare-engine/bare-engine">Bare Engine</a>.

<br>
<br>

<h2>Getting Started</h2>

Install <a href="https://nodejs.org/en/download">Node</a> and <a href="https://git-scm.com/download/win">Git</a><br><br>
<ol>
    <li>Click Code->"Download ZIP" - unzip</li>
    <li>Open the command line in the bare-showcase-main folder</li>
    <li>Run <code>npm install</code> + <code>npm run dev</code></li>
    <li>Ctrl-click the localhost URL shown in the command line.</li>
</ol>
<br>Or:<br>
<ol>
    <li>Click "Use this template" in the top right - create the repo.</li>
    <li><pre><code>git clone https://github.com/PATH-TO-YOUR-REPO.git bare-game
cd bare-game
npm install
npm run dev</code></pre></li>
    <li>Ctrl-click the localhost URL shown in the command line.</li>
</ol>

(An npm create command will be there in the future to make this process easier)
<br><br>

🚧 Note: The engine is still in active development, some features may be unstable 🚧
<br><br>

<h2>Getting Going</h2>
<ol>
    <li><a href="https://chromewebstore.google.com/detail/bare-engine/dbohigkcdpdnchgaffmofeoffnpkmphb">Chrome Extension</a> - Get the extension</li>
    <li><a href="https://github.com/bare-engine/bare-showcase">Bare Showcase</a> - Explore the engine's features</li>
    <li><a href="https://github.com/bare-engine/bare-example-games">Bare Examples</a> - Explore game examples</li>
</ol>
<br>

<h2>Getting Around</h2>
<b>texturePackImages/</b> - This folder currently contains one image: ⚙️. While the Vite server is running, you can add your own images to this folder, and it will automatically turn them into an atlas, placing it in public/initial/generated/.
<br><br>

<b>public/initial/</b> - Anything under this folder will get loaded before your game runs. You can learn more about it in <a href="https://github.com/bare-engine/bare-showcase/blob/main/public/demos/imageLoading/src/DemoImageLoading.ts">DemoImageLoading</a> of the showcase project. This will actualy load in sync with your source source code, making it even faster.
<br><br>

<b>public/data/settingsData.json</b> - This is the heart of the project. All your game data and configuration will live here. Currently, it's empty, but you can get a better idea by looking at the <a href="https://github.com/bare-engine/bare-shmup/blob/main/public/data/settingsData.json">settingsData</a> from the <a href="https://github.com/bare-engine/bare-shmup">bare-shmup</a> example. While you can edit this by hand, the <a href="https://chromewebstore.google.com/detail/bare-engine/dbohigkcdpdnchgaffmofeoffnpkmphb">Chrome Extension</a> is there to help you interface with it.
<br><br>

<b>public/images/</b> - This is where you place your images (.webp) to be streamed in. Once again, <a href="https://github.com/bare-engine/bare-showcase/blob/main/public/demos/imageLoading/src/DemoImageLoading.ts">DemoImageLoading.ts</a> gives a good insight. You could put a ⚙️ png here, remove it from the texturePackImages folder, and it would automatically get streamed in. No changes to the code required. You can see <a href="https://github.com/bare-engine/bare-platformer">platformer</a> for an example where everything gets streamed in, even animations.
<br><br>

<b>src/game.ts</b> - The starting point of the code. It starts with <code>StartBare(Game);</code>, instantiating the class. This class has to extend the engine class <code>Scene</code>. In <code>super</code>, we supply it with the settingsData.json. This lets the scene use the data we provided there (currently none). <code>this.AddGameObject('⚙')</code> will try to resolve the '⚙': first, it will try to find an entity of the matching name, then an image in the initial assets (where it finds it), only then it will look in public/images/ to stream it in. After that, it creates a GameObject and adds it to the scene.
<br><br>

<b>src/components/</b> - Currently empty, but this is where you would place your ...Component.ts files. All game examples use these, but <a href="https://github.com/bare-engine/bare-platformer">platformer</a> is a good reference - <a href="https://github.com/bare-engine/bare-platformer/blob/main/src/components/playerComponent.ts">playerComponent.ts</a>.
<br><br>

<b>src/generated/</b> - Vite has generated assets.ts in here. This file is not for editing. It gives you code access to your asset files. For example, you could call <code>this.AddGameObject(Asset.Image.EMOJI_GEAR)</code>. Any image file used in the project can be found under Asset.Image.xxx, giving you a nice auto-complete.
<br><br>

<h2>Zooming out</h2>
I've mentioned some concepts like gameObjects, entities, and components, but how do they work?
<br><br>

<b>Scene</b> - Scenes are used to organize different parts of a game, such as gameplay screens, UI, or menus. Each scene holds a number of controllers. By default, only the objectController (bare.object) is active, updating and rendering your gameObjects. Once you reference any other controller, e.g. mouseController (bare.mouse), every scene will now run this controller as well. This means none of these controllers even exist in code until you reference them.
<br><br>

<b>GameObject</b> - This is the object containing all your basic properties: x, y, scale, rotation, pivot, alpha, etc. Uniquely to Bare, it also has inner-position/scale/rotation fields. This makes transformations much more convenient without the need for nesting gameObjects.
It also supports parent/child hierarchies, components, custom shaders, masks, events, and pointer interaction.
<br><br>

<b>Entity</b> - This is a data object that you generally define in settingsData.json, although it can also be defined in code. An example would be <code>var entity = { name: "test", texture: "ball", x: 50 }</code>. Then you turn it into a GameObject using <code>this.AddGameObject(entity)</code>, which applies the entity's properties to create a new GameObject.
<br><br>

<b>Base Entity</b> - A base entity is not very different from an entity. It can contain the same properties, but you generally don't apply these to gameObjects directly. They are used as building blocks for regular entities. For example, a predefined base entity is ANY_ENTITY. When you give this the property <code>pivot: {x: .5, y: .5}</code>, every entity automatically inherits this. Of course, you can also define your own base entity, say, "myBaseEntity", and let a regular entity extend it, e.g. <code>{ name: "test", baseEntity: "myBaseEntity" }</code>. Another predefined base entity is ANY, this is extended by ANY_ENTITY and any base entity. So as you can see, base entities can extend each other in a chain, which regular entities cannot (they can only extend a base entity).
<br><br>

<b>Level</b> - A level holds layers that contain entities. They will turn into gameObjects when loaded. Usually, entities have a name, referring to a predefined entity in settingsData.json. Any extra properties they have will override the ones found in the predefined entity.
<br><br>

<b>Layer</b> - Within a Scene, gameObjects are structured under layers. <code>Data.Layer.OBJECTS</code> is the default one. GameObjects are added to and it will always be there. You can add more in settingsData.json, eg: <code>"layers": ["objects", "background"]</code>. Now Data.Layer is autimatically updated to include the background layer.
<br><br>

<b>Component</b> - They can be attached to gameObjects or entities. They have to extend from <code>Component</code>, which works similarly to Unity. You have <code>OnAdded</code>, <code>OnUpdate</code>, <code>OnRemoved</code>, <code>@InspectorField</code> and more. You can add them during runtime: <code>this.player.AddComponent(PlayerComponent)</code>, or define them in the entity: <code>{ components: { player: {} } }</code>.
<br>
<br>
<br>

<h2>The bare Object</h2>
<code>bare</code> is the global entry point to the engine — a single instance of the
top-level <code>BareEngine</code> class, available everywhere. You can access three kinds of fields from it: <b>global modules</b>, <b>scene modules</b> and <b>general properties</b>.
<br><br>
<h3>Global modules</h3>
These are instances that are shared across the entire game.<br><br>

<b>bare.keyboard</b> - Reads keyboard input. Check whether
keys are held, pressed this frame, or released.
<br><br>

<b>bare.sound</b> - Plays and manages audio (sound effects and
music).
<br><br>

<b>bare.scene</b> - The scene manager. Add, remove, reorder
and fetch scenes (<code>MoveUp</code>, <code>MoveToFront</code>, etc.).
<br><br>

<b>bare.asset</b> - Loads and holds your assets (images,
fonts, data), so the rest of the engine can pull them by key.
<br><br>

<b>bare.storage</b> - Persistent save data. Read and write
values that survive between sessions.
<br><br>

<b>bare.pool</b> - The object pools, keyed by
type. Used to recycle <code>GameObject</code>s instead of constantly creating and
destroying them.
<br><br>

<b>bare.ui</b> - A special always-on-top UI scene. It's a proxy: the
UI scene is lazily created the first time you reference it. Use
<code>bare.ui.AddGameObject(joystick)</code> to put something on the UI layer.
<br><br>

<b>bare.globalEvents</b> - A game-wide event bus.
Unlike <code>bare.events</code> (which is per-scene), these events are heard across the
whole game.
<br><br>

<b>bare.editor</b> - A getter that returns the level-editor scene
if one is currently active.
<br><br>

<h3>Scene modules</h3>
These are <i>per-scene</i> and automatically resolved to the currently active scene. When you write <code>bare.object</code>, <code>bare.tween</code>, etc., this gets build-time transformed.
<code>bare.[sceneModule]</code> becomes: <code>this.scene.[sceneModule]</code>. So you
always get the controller belonging to the scene the call-site lives in. No manual scene lookup.
<br><br>

<b>bare.events</b> - The current scene's event bus.
Emit and listen for events scoped to this scene only.
<br><br>

<b>bare.object</b> - Add, remove and get
<code>GameObject</code>s in the current scene.
<br><br>

<b>bare.component</b> - Manage components on
GameObjects, e.g. <code>bare.component.AddComponent(gameObject, WobbleComponent)</code> (or
the shorthand <code>gameObject.AddComponent(WobbleComponent)</code>).
<br><br>

<b>bare.mouse</b> - Mouse input for this scene. Position via
<code>bare.mouse.screen.position</code> or <code>bare.mouse.world.position</code>, plus
down/up checks.
<br><br>

<b>bare.tween</b> - Tweens for this scene. Note the global
shorthand <code>TweenTo(gameObject, 1.2, { rotation: 45 })</code>, which is equivalent to
<code>bare.tween.To(...)</code>.
<br><br>

<b>bare.particle</b> - Particle emitters. Add one with
<code>bare.particle.Add(this.explosionEmitter)</code>, or attach a
<code>ParticleComponent</code> to a GameObject.
<br><br>

<b>bare.hitbox</b> - Pointer hit detection on GameObjects
with a tapHitbox, e.g. <code>bare.hitbox.OnPointerDown(gameObject, (go) =&gt; {})</code> (or
<code>gameObject.OnPointerDown(...)</code>).
<br><br>

<b>bare.arcade</b> - Simple rectangle/circle
collision physics. Enable it with <code>bare.AddClass(ArcadePhysicsController)</code> in
your Game constructor (import from <code>'bare-engine/arcade'</code>), then use
<code>ArcadeObject</code>s.
<br><br>

<b>bare.sopiro</b> - Realistic physics via
<a href="https://github.com/Sopiro/Physics">Sopiro</a>. Functional but not yet
well-supported.
<br><br>

<b>bare.level</b> - Level loading and saving:
<code>bare.level.LoadLevel("level1")</code>, <code>SaveLevel</code>,
<code>RestartLevel</code>.
<br><br>

<b>bare.camera</b> - The scene camera:
<code>SetPosition</code>, <code>SetDimensions</code>, <code>SetBounds</code>,
<code>SetZoom</code>.
<br><br>

<h3>General properties</h3>
Beyond the modules, <code>bare</code> exposes a set of plain properties and helper methods, here are the most common ones:
<br><br>

<b>bare.deltaTime</b> - Seconds elapsed since the last frame (capped by maxDeltaTime).<br>
<b>bare.count</b> - The number of frames rendered so far.<br>
<b>bare.width</b> / <b>bare.height</b> - The current logical render size of the canvas (in
game units, after resolution scaling).<br>

<b>bare.Restart(sceneClass?, options?)</b> - Clears all scenes and restarts the game,
optionally with a different starting scene and/or new options.<br>
<b>bare.SendEvent(type, ...args)</b> - Fires an event both globally
(<code>bare.globalEvents</code>) and to every active, non-paused scene's
<code>bare.events</code>.<br>
<b>bare.AddClass(SomeClass)</b> - Registers a class with the engine. For a controller (e.g.
<code>ArcadePhysicsController</code>) it activates that module across scenes; for a
<code>GameObject</code> subclass it sets up a pool so the type can be spawned by name.<br>
<b>bare.RegisterGameObjectPool(cls, size?)</b> - Manually registers an object pool for a
<code>GameObject</code> class (what <code>AddClass</code> does for you under the hood).<br>
<b>bare.SetBackgroundColor(color)</b> - Sets the canvas clear color.
<br><br>

### Gotcha:
All these controllers live under a Scene, but you might get a warning if Bare cannot figure out which. Generally, it transforms a call like this: <code>levelHandler.LoadLevel("level1")</code> -> <code>this.scene.levelHandler.LoadLevel("level1")</code>. That means a scene property should always be present, or the call should be in the scene itself. <br><br>
If you wanted to call a method in another scene, you could do: <code>SceneController.Get(Game).levelHandler.LoadLevel("level1")</code>
<br><br>

<h2>Chrome Extension</h2>
The <a href="https://chromewebstore.google.com/detail/bare-engine/dbohigkcdpdnchgaffmofeoffnpkmphb">Chrome Extension</a> helps you interface with the settingsData.json. Install it, press F12 (developer tools) and open the "Bare Engine" tab to start using it. <br><br>

The extension enables you to:
<ul>
    <li>View and edit objects+components in the scene</li>
    <li>View and edit entities</li>
    <li>Jump to any level</li>
    <li>Trigger debug buttons and add your own</li>
    <li>Right click object to move it or see its properties</li>
</ul>
This will become a paid future at some point.<br><br>

It is still being worked on. Coming features will include:
<ul>
    <li>Animations setup</li>
    <li>Particle Editor</li>
    <li>Layers setup</li>
    <li>Collision layers matrix</li>
    <li>Edit settings like gravity</li>
    <li>View/Edit scene properties</li>
    <li>View layers in objects list</li>
    <li>Add/edit presets</li>
    <li>Diagnostics</li>
    <li>View tweens, pools, textures, sounds in memory</li>
    <li>Pause button</li>
</ul>

<h2>Bare Engine coming features:</h2>
<ul>
    <li>Tilemap support</li>
    <li>Enable scaling+rotation of objects in level editor</li>
    <li>FPS counter</li>
    <li>Manipulating object and hitbox properties in entity editor with mouse</li>
    <li>Documentation</li>
</ul>
