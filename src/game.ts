import entityDataJson from '../public/assets/_data/_entityData.json'
import { StartBare, GameObject, BarePlugin, Scene, HitboxController, LevelHandler, tweenController, TweenTo, cameraHandler } from 'bare-engine';

export class Game2 extends Scene
{
    constructor()
    {
        super({entityData: entityDataJson});
    }

    OnStart()
    {
        var obj = this.AddGameObject('⚙')
            .SetPosition(bare.width * .15, bare.height * .5)
            .CenterPivot();
            
        tweenController.TweenTo(obj, 2, {rotation: -360}, true);
    }
}

export class Game extends Scene
{
    obj: GameObject;
    
    constructor()
    {
        super({entityData: entityDataJson});
        
        // UNCOMMENT TO ENABLE PLUGIN
        //if (__DEV__)
        //    this.AddClass(BarePlugin);

        //bareEngine.AddClass(HitboxController)
        //bareEngine.AddClass(LevelHandler)
    }

    OnStart()
    {
        this.obj = this.AddGameObject('⚙')
            .SetPosition(bare.width * .15, bare.height * .5)
            .CenterPivot();
            
        //this.AddScene(Game2);

        //this.LoadLevel('level1');
    }

    override OnUpdate(deltaTime: number): void
    {
        this.obj.rotation++;
        //cameraHandler.SetPosition(bare.width * .5 + Math.sin(bareEngine.time * .01) * 100, bare.height * .5);
    }
}

StartBare(Game, {antiAlias: true});
