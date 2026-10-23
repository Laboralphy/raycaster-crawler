import { BoomerThinker } from './BoomerThinker.js';
import { CasterThinker } from './CasterThinker.js';
import { ChargerThinker } from './ChargerThinker.js';
import { DasherThinker } from './DasherThinker.js';
import { HealerThinker } from './HealerThinker.js';
import { MagicMissileThinker } from './MagicMissileThinker.js';
import { MobThinker } from './MobThinker.js';
import { PlayerKeyboardThinker } from './PlayerKeyboardThinker.js';
import { RusherThinker } from './RusherThinker.js';
import { RushooterThinker } from './RushooterThinker.js';
import { SentryThinker } from './SentryThinker.js';
import { ShooterThinker } from './ShooterThinker.js';
import { StealerThinker } from './StealerThinker.js';
import { TimedThinker } from './TimedThinker.js';
import { WavedasherThinker } from './WavedasherThinker.js';
import { LinearThinker } from '../../libraries/Raycaster/LinearThinker.js';
import { NonLinearThinker } from '../../libraries/Raycaster/NonLinearThinker.js';

// thinkers désignés par leur nom dans les données (blueprints, cutscenes) :
// ThinkerManager.createThinker('Rusher') instancie RusherThinker
export const THINKERS = {
    Boomer: BoomerThinker,
    Caster: CasterThinker,
    Charger: ChargerThinker,
    Dasher: DasherThinker,
    Healer: HealerThinker,
    MagicMissile: MagicMissileThinker,
    Mob: MobThinker,
    PlayerKeyboard: PlayerKeyboardThinker,
    Rusher: RusherThinker,
    Rushooter: RushooterThinker,
    Sentry: SentryThinker,
    Shooter: ShooterThinker,
    Stealer: StealerThinker,
    Timed: TimedThinker,
    Wavedasher: WavedasherThinker,
    'O876_Raycaster.Linear': LinearThinker,
    'O876_Raycaster.NonLinear': NonLinearThinker
};
