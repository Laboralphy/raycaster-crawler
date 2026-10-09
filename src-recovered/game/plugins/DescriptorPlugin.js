import { DescriptorWindow } from '../UI/DescriptorWindow.js';
import { UI } from '../UI/UI.js';
import { SPELLS_DATA } from '../data/SPELLS_DATA.js';
import { STRINGS } from '../data/STRINGS.js';
import { KEYS } from '../../libraries/Raycaster/KEYS.js';

export class DescriptorPlugin {
    uiController(sCommand, xParams) {
        let w;
        switch (sCommand) {
            case 'on':
                w = this.oScreen.linkControl(new DescriptorWindow(xParams));
                this.centerWidget(w);
                break
        }
    }

    displayDescriptionWindow(oItem) {
        if (oItem) {
            this.describe(oItem);
            return true
        } else {
            return false
        }
    }

    getSelectedItem() {
        let nIndex, oInv, oItem = null;
        switch (this.oGame.nIntfMode) {
            case UI.INTFMODE_INVENTORY:
                nIndex = this.oGame.oUI.command('Inventory', 'get');
                oInv = this.oGame.oDungeon.getCreatureInventory(oPlayerCreature);
                oItem = null;
                if (nIndex >= 0) {
                    oItem = oInv.aBagSlots[nIndex]
                } else {
                    for (const iSlot in oInv.oEquipSlots) {
                        nIndex++;
                        if (nIndex === 0) {
                            oItem = oInv.oEquipSlots[iSlot]
                        }
                    }
                }
                break;
            case UI.INTFMODE_SHOP:
                oItem = this.oGame.oUI.command('Shop', 'get');
                break
        }
        return oItem
    }

    processKey(nKey) {
        if (this.oGame.nIntfMode == UI.INTFMODE_DESCRIPTOR) {
            switch (nKey) {
                case KEYS._INT_ESCAPE:
                case KEYS._CNT_ACTION:
                    this.oGame.oUI.command('', 'off');
                    this.oGame.nIntfMode = this.nPreviousMode;
                    return true
            }
        }
        return false
    }

    setGame(g) {
        this.oGame = g
    }

    getDurationDescription(nDur) {
        let sDur;
        switch (nDur) {
            case 62:
                sDur = STRINGS._('~med_overtime') + '180 ' + STRINGS._('~med_second');
                break;
            case 61:
                sDur = STRINGS._('~med_overtime') + '120 ' + STRINGS._('~med_second');
                break;
            case 0:
            case 63:
                sDur = '';
                break;
            default:
                sDur = STRINGS._('~med_overtime') + nDur.toString() + ' ' + STRINGS._('~med_second');
                break
        }
        return sDur
    }

    getDamageDescription(nLevel, nDur, nFactor, sEffectStr) {
        return nDur === 0 ? STRINGS._('~desc_' + sEffectStr) + ' ' + nLevel.toString() + '-' + (nFactor * nLevel) : STRINGS._('~desc_' + sEffectStr) + ' ' + (nLevel * nDur).toString() + this.getDurationDescription(nDur)
    }

    getEffectDescription(sEffect) {
        const ep = this.oGame.oDungeon.oEffectProcessor;
        const sSubType = ep.getEffectSubType(sEffect);
        const nLevel = ep.getEffectLevel(sEffect);
        const nDur = ep.getEffectDuration(sEffect);
        let sDur = this.getDurationDescription(nDur);
        sDur = sDur ? ' ' + sDur : '';
        switch (sSubType) {
            case 'ahld':
                return STRINGS._('~attr_held') + sDur;
            case 'aroo':
                return STRINGS._('~attr_rooted') + sDur;
            case 'asnr':
                return STRINGS._('~attr_snared') + ' +' + nLevel + sDur;
            case 'avul':
                return STRINGS._('~attr_vulnerability') + ' +' + nLevel + sDur;
            case 'awea':
                return STRINGS._('~attr_power') + ' -' + nLevel + sDur;
            case 'aill':
                return STRINGS._('~attr_pharma') + ' -' + nLevel + sDur;
            case 'abld':
                return STRINGS._('~attr_blind') + sDur;
            case 'acnf':
                return STRINGS._('~attr_confused') + sDur;
            case 'adhp':
                return STRINGS._('~attr_vitality') + ' -' + (nLevel * ep.HEAL_FACTOR) + sDur;
            case 'ajnx':
                return STRINGS._('~attr_luck') + ' -' + nLevel + sDur;
            case 'admp':
                return STRINGS._('~attr_energy') + ' -' + (nLevel * ep.ENERGY_FACTOR) + sDur;
            case 'ahun':
                return STRINGS._('~attr_foodc') + ' +' + nLevel + sDur;
            case 'bpow':
                return STRINGS._('~attr_power') + ' +' + nLevel + sDur;
            case 'bhst':
                return STRINGS._('~attr_speed') + ' +' + nLevel + sDur;
            case 'bpha':
                return STRINGS._('~attr_pharma') + ' +' + nLevel + sDur;
            case 'binv':
                return STRINGS._('~attr_invulnerability') + sDur;
            case 'besp':
                return STRINGS._('~attr_esp') + sDur;
            case 'bclk':
                return STRINGS._('~attr_invisibility') + sDur;
            case 'bxhp':
                return STRINGS._('~attr_vitality') + ' +' + (nLevel * ep.HEAL_FACTOR) + sDur;
            case 'blck':
                return STRINGS._('~attr_invisibility') + sDur;
            case 'bxmp':
                return STRINGS._('~attr_energy') + ' +' + (nLevel * ep.ENERGY_FACTOR) + sDur;
            case 'bsfc':
                return STRINGS._('~attr_foodc') + ' -' + nLevel + sDur;
            case 'rant':
                return STRINGS._('~attr_antidote') + sDur;
            case 'rhea':
                return STRINGS._('~attr_hp') + ' +' + (nDur ? (nDur * nLevel).toString() + sDur : (nLevel * ep.HEAL_FACTOR));
            case 'rbod':
                return STRINGS._('~attr_health') + sDur;
            case 'rmin':
                return STRINGS._('~attr_clearmind') + sDur;
            case 'rmov':
                return STRINGS._('~attr_freedom') + sDur;
            case 'rene':
                return STRINGS._('~attr_mp') + ' +' + (nLevel * ep.ENERGY_FACTOR);
            case 'rfdp':
                return STRINGS._('~attr_foodp') + ' +' + nLevel + '0';
            case 'rphy':
                return STRINGS._('~attr_drphysical') + ' +' + nLevel + sDur;
            case 'rfir':
                return STRINGS._('~attr_drfire') + ' +' + nLevel + sDur;
            case 'rcld':
                return STRINGS._('~attr_drcold') + ' +' + nLevel + sDur;
            case 'rele':
                return STRINGS._('~attr_drelectricity') + ' +' + nLevel + sDur;
            case 'rtox':
                return STRINGS._('~attr_drtoxic') + ' +' + nLevel + sDur;
            case 'rmag':
                return STRINGS._('~attr_drmagical') + ' +' + nLevel + sDur;
            case 'rdth':
                return STRINGS._('~attr_drdeath') + ' +' + nLevel + sDur;
            case 'xphy':
                return this.getDamageDescription(nLevel, nDur, ep.DAMAGE_FACTOR_PHYSICAL, 'effect_xphy');
            case 'xmag':
                return this.getDamageDescription(nLevel, nDur, ep.DAMAGE_FACTOR_MAGICAL, 'effect_xmag');
            case 'xcld':
                return this.getDamageDescription(nLevel, nDur, ep.DAMAGE_FACTOR_COLD, 'effect_xcld');
            case 'xfir':
                return this.getDamageDescription(nLevel, nDur, ep.DAMAGE_FACTOR_FIRE, 'effect_xfir');
            case 'xele':
                return this.getDamageDescription(nLevel, nDur, ep.DAMAGE_FACTOR_ELECTRICITY, 'effect_xele');
            case 'xtox':
                return this.getDamageDescription(nLevel, nDur, ep.DAMAGE_FACTOR_TOXIC, 'effect_xtox');
            case 'xene':
                return this.getDamageDescription(nLevel, nDur, ep.ENERGY_FACTOR, 'effect_xene');
            case 'disp':
                return STRINGS._('~desc_effect_disp') + ' ' + nLevel;
            case 'null':
                return STRINGS._('~desc_effect_null');
            default:
                return sSubType
        }
    }

    getSpellProjectionDescription(s) {
        const sMain = s.substr(0, 2);
        const aDesc = [STRINGS._('~desc_spell_project_' + sMain)];
        const aOptions = s.substr(2);
        let sKey;
        for (let i = 0; i < aOptions.length; i++) {
            sKey = '~desc_spell_project_' + aOptions[i];
            aDesc.push(STRINGS._(sKey))
        }
        return aDesc.join(' - ')
    }

    getSpellDescription(oSpell) {
        let i;
        const aSpellDesc = [];
        let sDesc, sChance;
        for (i = 0; i < oSpell.effects.length; i++) {
            sDesc = this.getEffectDescription(oSpell.effects[i]);
            sChance = '';
            switch (oSpell.chances[i]) {
                case 0:
                    continue;
                case 1:
                    break;
                default:
                    sChance = ' (' + (100 * oSpell.chances[i]).toString() + '%)'
            }
            aSpellDesc.push(sDesc + sChance)
        }
        return aSpellDesc
    }

    getMultipleSpellDescription(aSpells) {
        let oSpell;
        const aDesc = [];
        let oSpellData, aSpellDesc, sLine, aLine;
        for (let i = 0; i < aSpells.length; i++) {
            oSpell = aSpells[i];
            oSpellData = SPELLS_DATA[oSpell.ref];
            aLine = [STRINGS._('~desc_spell_num') + (i + 1).toString()];
            if (oSpell.time) {
                aLine.push(STRINGS._('~desc_spell_charge') + ': ' + (oSpell.time / 1000).toString() + STRINGS._('~med_second'))
            }
            if (oSpellData.cost) {
                aLine.push(STRINGS._('~desc_spell_cost') + ': ' + oSpellData.cost)
            }
            aLine.push(this.getSpellProjectionDescription(oSpellData.options));
            sLine = aLine.join(' - ');
            aSpellDesc = [sLine];
            aSpellDesc = aSpellDesc.concat(this.getSpellDescription(oSpellData));
            aDesc.push(aSpellDesc.join('\n'))
        }
        return aDesc
    }

    getDaggerSpellDescription(aSpells) {
        let oSpell, aDesc, oSpellData, aSpellDesc;
        oSpell = aSpells[0];
        oSpellData = SPELLS_DATA[oSpell.ref];
        aSpellDesc = this.getSpellDescription(oSpellData);
        aDesc = [aSpellDesc.join('\n')];
        return aDesc
    }

    getWornPropertiesDescription(aEffects) {
        const a = [];
        for (let i = 0; i < aEffects.length; i++) {
            a.push(this.getEffectDescription(aEffects[i]))
        }
        return a
    }

    makeString(o) {
        return o.properties
    }

    describe(oItem) {
        let sProperties;
        switch (oItem.type) {
            case 'potion':
            case 'ccc':
            case 'earings':
            case 'amulet':
            case 'ring':
                sProperties = this.getWornPropertiesDescription(oItem.properties).join('\n');
                break;
            case 'dagger':
                sProperties = this.getDaggerSpellDescription(oItem.spells).join('');
                break;
            case 'wand':
                sProperties = this.getMultipleSpellDescription(oItem.spells).join('\n\n');
                break;
            default:
                sProperties = '';
                break
        }
        let sMessage = '';
        const sDIType = 'desc_item_' + oItem.type;
        const sDIItem = 'desc_item_' + oItem.resref;
        if (sDIItem in STRINGS.l) {
            sMessage += STRINGS._('~' + sDIItem) + '\n'
        }
        if (sDIType in STRINGS.l) {
            sMessage += STRINGS._('~' + sDIType) + '\n'
        }
        sMessage += '\n' + sProperties;
        this.nPreviousMode = this.oGame.nIntfMode;
        this.oGame.oUI.command('Descriptor', 'on', {
            message: sMessage,
            title: oItem.getName(),
            icon: oItem.icon,
            previousUI: this.oGame.oUI.sScreen
        });
        this.oGame.nIntfMode = UI.INTFMODE_DESCRIPTOR
    }
}
Object.assign(DescriptorPlugin.prototype, {
    oGame: null,
    oEffectProcessor: null,
    nPreviousMode: 0
});
