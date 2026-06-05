<h1>Bare-Template</h1>
The starting point for a new project.

<br>
<br>

<h2>Getting Started</h2>

<p>Install Node.js first</p>

<pre><code>https://nodejs.org</code></pre>

<p>Then</p>
<pre><code>git clone https://github.com/bare-engine/bare-template.git my-game
cd my-game
npm install
npm run dev</code></pre>

Open the URL shown in the terminal to start developing.
<br><br>
<h2>Getting Going</h2>
<ol>
    <li><a href="https://github.com/bare-engine/bare-template](https://chromewebstore.google.com/detail/bare-engine/dbohigkcdpdnchgaffmofeoffnpkmphb)">Chrome Extension</a> - Get the extension</li>
    <li><a href="https://github.com/bare-engine/bare-showcase">Bare Showcase</a> - Explore the engine's features</li>
    <li><a href="https://github.com/bare-engine/bare-demos">Bare Demos</a> - Explore game examples</li>
</ol>
<br>
<h2>Going Around</h2>
<b>texturePackImages/</b> - This folder currently contains one image: ⚙️. While the vite server is running, you can add your own images to this folder and it will automatically turn these into an atlas, placing it in public/initial/generated/. 
<br><br>
<b>public/initial/</b> - Anything under this folder will get loaded before your game runs. You can learn more about it in <a href="https://github.com/bare-engine/bare-showcase/blob/main/public/demos/imageLoading/src/DemoImageLoading.ts">DemoImageLoading</a> of the showcase project.
<br><br>
<b>public/data/settingsData.json</b> - This is the heart of the project, all your game data and configuration will live here. Currently it's empty, but you can get a better idea by looking the <a href="https://github.com/bare-engine/bare-shmup/blob/main/public/data/settingsData.json">settingsData</a> from the <a href="https://github.com/bare-engine/bare-shmup">bare-shmup</a> example. While you can edit this by hand, the <a href="https://github.com/bare-engine/bare-template](https://chromewebstore.google.com/detail/bare-engine/dbohigkcdpdnchgaffmofeoffnpkmphb)">Chrome Extension</a> is there to help you interface with it.
<br><br>
<b>public/images/</b> - This is where you place your images (.webp) to be streamed in. Once again, <a href="https://github.com/bare-engine/bare-showcase/blob/main/public/demos/imageLoading/src/DemoImageLoading.ts">DemoImageLoading.ts</a> gives a good insight. You could put a ⚙️ png here, remove it from the texturePackImages folder, and it would automatically get streamed in. No changes to the code needed. You can see <a href="https://github.com/bare-engine/bare-platformer">platformer</a> for an example where everything gets streamed in, even animations.

<br><br>
<b>src/game.ts</b> - The starting point of the code. It start with `StartBare(Game);` instantiating the class. This class has to extend the engine class `Scene`. We supply it the settingsData.json mentioned before in super to let this scene use the data we provided there (currently none). `this.AddGameObject('⚙')` will first try to resolve the '⚙': first it will try to find an entity of the matching name, then an image in the initial assets (where it finds it), and then it will look in public/images/ to stream in it in. After that, it creates a GameObject and adds it to the scene.
<br><br>
<b>src/components/</b> - Currently empty, but this is where you would place your ...Component.ts files. All game example use these, but <a href="https://github.com/bare-engine/bare-platformer">platformer</a> is a good reference - <a href="https://github.com/bare-engine/bare-platformer/blob/main/src/components/playerComponent.ts)">playerComponent.ts</a>.
<br><br>
<b>src/generated/</b> - Vite has generated assets.ts in here. This file is not for editing. It gives you code access to your asset files. For example, you could call `this.AddGameObject(Asset.Image.EMOJI_GEAR)`. Any image file used in the project can be found under Asset.Image.xxx, giving you a nice auto-complete.
<br><br>
<b>types/globals.d.ts</b> - This just gives you a __DEV__ keyword. Use any `if (__DEV__) {...}` to execute this code during development and completely strip it from production.
<br>
<br>
<h2>Zooming out</h2>
I've mentioned some concepts like gameObjects, entities, components, but how do they work?
<br><br>
<b>Scene</b> - A Scene is a container of gameObjects. It manages their lifecycle, updates them every frame, handles rendering, and provides access to shared systems such as input, audio, and physics. Scenes are typically used to organize different parts of a game, such as gameplay screens, UI or menus.
<br><br>
<b>GameObject</b> - This is the object containing all your basic properties: x, y, scale, rotation, pivot, alpha etc. Unique to Bare, it also has innner-postion/scale/rotation fields. This makes transformations much more convenient without the need for nesting gameObjects.
It also supports: parent/child hierarchies, components, custom shaders, masks, event callbacks and pointer interaction (click, hover, touch)
<br><br>
<b>Entity</b> - This is a data object that you generally define in settingsData.json, although it can also be defined in code. An example would be var <code>entity = { name: "test", texture: "ball", x: 50 }</code>. Then you turn it into a GameObject like so: <code>this.AddGameObject(entity)</code>, applying the entity's properties to the GameObject.
<br><br>
<b>Base Entitiy</b> - A base entity is not very different from an entity, it can contain the same properties, but, you generally don't turn these into gameObjects directly. They are used as building block for regular entities. For example, a predefined base entity is ANY_ENTITY. When you would give this the property <code>pivot: {x: .5, y: .5}</code>, every entity automatically inherits this. Of course, you can also define your own base entity "myBaseEntiy" and let a regular entity extend it, eg: <code>{ name: "test", baseEntity: "myBaseEntiy" }</code>. Base entity can also extend each other in a chain, which regular entities cannot (can only extend a bare entity).
<br><br>
<b>Level</b> - A level is simply a collection of entities. They will turn into gameObjects when loaded. Usually entities have a name, refering to a predefined entity in settingsData.json.
<br><br>
<b>Component</b> - They can be attached to gameObjects or entities. They have to extends from <code>Component</code>, which works similarly to Unity. You have and <code>OnAdded</code>, <code>OnUpdate</code>, <code>OnRemoved</code>, <code>@InspectorField</code> and more. You can add them during runtime: <code>this.player.AddComponent(PlayerComponent)</code> or define them in the entity: <code>{components: {player: {}}</code>
