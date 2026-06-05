import { GameObject, Scene, StartBare } from 'bare-engine';
//import { ArcadeObject, ArcadePhysicsController } from 'bare-engine/arcade';
import settingsDataJson from '../public/data/settingsData.json';
import { Asset } from './generated/assets';

export class Game extends Scene
{
    obj: GameObject;
    
    constructor()
    {
        super(settingsDataJson);
    }

    OnStart()
    {
        this.obj = this.AddGameObject(Asset.Image.EMOJI_GEAR)
            .SetPosition(bare.width * .5, bare.height * .5)
            .CenterPivot();
    }

    OnFixedUpdate()
    {
        this.obj.rotation++;
    }
}

StartBare(Game);