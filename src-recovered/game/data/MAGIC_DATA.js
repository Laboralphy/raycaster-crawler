import { MAGIC_DATA_PARAMS } from './MAGIC_DATA_PARAMS.js';
import DrainLife from './magic/DrainLife.json' with { type: 'json' };
import Teleport from './magic/Teleport.json' with { type: 'json' };
import Knock from './magic/Knock.json' with { type: 'json' };
import DeathSpell from './magic/DeathSpell.json' with { type: 'json' };
import MagicMapping from './magic/MagicMapping.json' with { type: 'json' };
import SummonFood from './magic/SummonFood.json' with { type: 'json' };
import Reflect from './magic/Reflect.json' with { type: 'json' };
import Light from './magic/Light.json' with { type: 'json' };
import TimeStop from './magic/TimeStop.json' with { type: 'json' };

/**
 * Un sort par fichier, dans magic/<nom>.json (le nom du fichier est la clé).
 * Dans le JSON, « cooldown » est un nom de MAGIC_DATA_PARAMS.COOLDOWN (SHORT,
 * MEDIUM...) et les couleurs de « visual » sont des chaînes hexadécimales
 * ("0xFF0000") ; elles redeviennent ici des nombres.
 */
export const MAGIC = {
    DrainLife,
    Teleport,
    Knock,
    DeathSpell,
    MagicMapping,
    SummonFood,
    Reflect,
    Light,
    TimeStop
};

export const MAGIC_DATA = {};
for (const sSpell in MAGIC) {
    const oSpell = Object.assign({}, MAGIC[sSpell]);
    if (typeof oSpell.cooldown === 'string') {
        oSpell.cooldown = MAGIC_DATA_PARAMS.COOLDOWN[oSpell.cooldown];
    }
    oSpell.visual = oSpell.visual.map((v) => typeof v === 'string' ? Number(v) : v);
    MAGIC_DATA[sSpell] = oSpell;
}
