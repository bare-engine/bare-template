<h1>Bare Template</h1>
The starting point for a new project using the <a href="https://github.com/bare-engine/bare-engine">Bare Engine</a>.

<br>
<br>

<h2>Getting Started</h2>

Install <a href="https://nodejs.org/en/download">Node.js</a><br><br>
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

<b>types/globals.d.ts</b> - This just gives you a `__DEV__` keyword. Use `if (__DEV__) {...}` to execute this code during development. It will be completely stripped in production.
<br>
<br>

<h2>Zooming out</h2>
I've mentioned some concepts like gameObjects, entities, and components, but how do they work?
<br><br>

<b>Scene</b> - Scenes are used to organize different parts of a game, such as gameplay screens, UI, or menus. Each scene holds a number of controllers. By default, only the objectController is active, updating and rendering your gameObjects. Once you reference any other controller, e.g. mouseController, every scene will now run this controller as well. This means none of these controllers even exist in code until you reference them.
<br><br>

<b>GameObject</b> - This is the object containing all your basic properties: x, y, scale, rotation, pivot, alpha, etc. Uniquely to Bare, it also has inner-position/scale/rotation fields. This makes transformations much more convenient without the need for nesting gameObjects.
It also supports parent/child hierarchies, components, custom shaders, masks, event callbacks, and pointer interaction (click, hover).
<br><br>

<b>Entity</b> - This is a data object that you generally define in settingsData.json, although it can also be defined in code. An example would be <code>var entity = { name: "test", texture: "ball", x: 50 }</code>. Then you turn it into a GameObject using <code>this.AddGameObject(entity)</code>, which applies the entity's properties to create a new GameObject.
<br><br>

<b>Base Entity</b> - A base entity is not very different from an entity. It can contain the same properties, but you generally don't apply these to gameObjects directly. They are used as building blocks for regular entities. For example, a predefined base entity is ANY_ENTITY. When you give this the property <code>pivot: {x: .5, y: .5}</code>, every entity automatically inherits this. Of course, you can also define your own base entity, say, "myBaseEntity", and let a regular entity extend it, e.g. <code>{ name: "test", baseEntity: "myBaseEntity" }</code>. Base entities can also extend each other in a chain, which regular entities cannot (they can only extend a base entity).
<br><br>

<b>Level</b> - A level holds layers that contain entities. They will turn into gameObjects when loaded. Usually, entities have a name, referring to a predefined entity in settingsData.json. Any extra properties they have will override the ones found in the predefined entity.
<br><br>

<b>Layer</b> - Within a Scene, gameObjects are structured under layers. <code>Data.Layer.OBJECTS</code> is the default one. GameObjects are added to and it will always be there. You can add more in settingsData.json, eg: <code>"layers": ["objects", "background"]</code>. Now Data.Layer is autimatically updated to include the background layer.
<br><br>

<b>Component</b> - They can be attached to gameObjects or entities. They have to extend from <code>Component</code>, which works similarly to Unity. You have <code>OnAdded</code>, <code>OnUpdate</code>, <code>OnRemoved</code>, <code>@InspectorField</code> and more. You can add them during runtime: <code>this.player.AddComponent(PlayerComponent)</code>, or define them in the entity: <code>{ components: { player: {} } }</code>.
<br>
<br>

<h2>Important Classes</h2>
Bare Engine contains a bunch of classes to help you make your game.
<br><br>

<b>bare</b> - This is a reference to the top-level class <code>BareEngine</code>. It runs the main loop (update + render), controls the canvas, sends events, etc. It can restart the entire game with <code>bare.Restart()</code>. It also calls the <code>sceneController</code>, which (no surprise) controls the scenes.
<br><br>

<b>sceneController</b> - Contains all the scenes. It updates and renders them. You can also change the order they are in with methods <code>MoveUp</code>, <code>MoveDown</code>, <code>MoveToFront</code>, and <code>MoveToBack</code>. And there are many more convenience methods. If you're familiar with Phaser, you might recognise a few.
<br><br>

<b>uiScene</b> - This is a UI scene, automatically added when you refernce it. You can do: <code>uiScene.AddGameObject(joystick)</code> (as seen in bare-rpg) to add something to the uiScene. This uiScene is always on top.
<br><br>

### Each scene can contain the following classes:

<b>objectController</b> (standard) - Contains methods to add, remove and get gameObjects.
<br><br>

<b>mouseController</b> - Handles everything around the mouse. To get its position, use <code>mouseController.screen.position</code> or <code>mouseController.world.position</code>. There are more methods to check if mouse is down and such.
<br><br>

<b>componentController</b> - Handles the components. You can add one to a GameObject using <code>componentController.AddComponent(gameObject, WobbleComponent)</code>. For convenience, you can also apply this straight to the GameObject: <code>gameObject.AddComponent(WobbleComponent)</code>.
<br><br>

<b>tweenController</b> - Contains all your methods to manage tweens. To save you some typing, you can do a global call like: <code>TweenTo(gameObject, 1.2, { rotation: 45 });</code>. This is the equivalent of <code>tweenController.TweenTo(...);</code>.
<br><br>

<b>hitboxController</b> - This detects if you click on a gameObject with a tapHitbox. You could call <code>hitboxController.OnPointerDown(gameObject, (go) => { trace("clicked " + go.name) })</code>. Once again, you can also apply this to a GameObject directly: <code>gameObject.OnPointerDown((go) => { trace("clicked " + go.name) })</code>.
<br><br>

<b>arcadePhysicsController</b> - This enables simple rectangle and circle collisions. Not realistic, but perfect for many games. You can enable it by calling <code>bare.AddClass(ArcadePhysicsController)</code> in your Game constructor with <code>import { ArcadePhysicsController } from 'bare-engine/arcade'</code>. I mention the import because IntelliSense doesn't give it to you. Then you can create an <code>ArcadeObject</code> that will be controlled by it.
<br><br>

<b>sopiroPhysicsController</b> - This gives you realistic physics using <a href="https://github.com/Sopiro/Physics">Sopiro</a>. It's functional, and you can see it in the showcase project, but it's not very well supported yet.
<br><br>

<b>particleController</b> - Particles! Gotta have them. You can add an emitter with <code>particleController.Add(this.explosionEmitter)</code>. See the showcase project once again. Though generally, you would attach a <code>ParticleComponent</code> to a gameObject, either by code or in an entity. The game examples show this well.
<br><br>

<b>levelHandler</b> - The main method here is <code>levelHandler.LoadLevel("level1")</code>, which will try to load "level1" from public/data/levels/level1.json. Or, if the level was saved, it will load that. Other methods include <code>LoadLevel</code>, <code>SaveLevel</code>, and <code>RestartLevel</code>.
<br><br>

<b>cameraHandler</b> - Manages the camera: <code>SetPosition</code>, <code>SetDimensions</code>, <code>SetBounds</code>, and <code>SetZoom</code>.
<br><br>

### Gotcha:
All these controllers live under a Scene, but you might get a warning if Bare cannot figure out which. Generally, it transforms a call like this: <code>levelHandler.LoadLevel("level1")</code> -> <code>this.scene.levelHandler.LoadLevel("level1")</code>. That means a scene property should always be present, or the call should be in the scene itself. <br><br>
If you wanted to call a method in another scene, you could do: <code>SceneController.Get(Game).levelHandler.LoadLevel("level1")</code>
<br><br>

<h2>Chrome Extension</h2>
The <a href="https://chromewebstore.google.com/detail/bare-engine/dbohigkcdpdnchgaffmofeoffnpkmphb">Chrome Extension</a> helps you interface with the settingsData.json. Install it, press F12 (developer tools) and open the "Bare Engine" tab to start using it. <br><br>

The extension enables you to:<ul>
    <li>View and edit objects+components in the scene</li>
    <li>View and edit entities</li>
    <li>Jump to any level</li>
    <li>Trigger debug buttons and add your own</li>
</ul>
This will become a paid future at some point.
