import { GameObject, Scene, StartBare } from 'bare-engine';
import settingsDataJson from '../public/data/settingsData.json';

export class Game extends Scene
{
    obj!: GameObject;
    
    constructor()
    {
        super({settingsData: settingsDataJson});
    }
    
    override OnStart()
    {
        this.obj = this.AddGameObject('⚙')
            .SetPosition(bare.width * .5, bare.height * .5)
            .CenterPivot();
    }

    override OnUpdate(deltaTime: number): void
    {
        this.obj.rotation += 60 * deltaTime;
    }
}

StartBare(Game);