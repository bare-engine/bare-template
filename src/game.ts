import entityDataJson from '../public/assets/_data/_entityData.json'
import { StartBare, BareGame, GameObject, BarePlugin, game } from 'bare-engine';

export class Game extends BareGame
{
    obj: GameObject;
    
    constructor()
    {
        super(entityDataJson);
        
        // UNCOMMENT TO ENABLE PLUGIN
        if (__DEV__)
            this.plugin = new BarePlugin();
    }

    OnStart()
    {
        this.obj = bare.AddGameObject('⚙')
            .SetPosition(bare.width * .5, bare.height * .5)
            .CenterPivot();
    }

    override OnUpdate(deltaTime: number): void
    {
        this.obj.rotation++;
    }
}

StartBare(Game, {antiAlias: true});
