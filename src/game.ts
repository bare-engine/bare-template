import { GameObject, Scene, StartBare } from 'bare-engine';
import settingsDataJson from '../public/data/settingsData.json';

export class Game extends Scene
{
    obj!: GameObject;
    
    constructor()
    {
        super(settingsDataJson);
    }
    
    OnStart()
    {
        this.obj = this.AddGameObject('⚙')
            .SetPosition(bare.width * .5, bare.height * .5)
            .CenterPivot();
    }

    OnFixedUpdate()
    {
        this.obj.rotation++;
    }
}

StartBare(Game);