var O2 = {};
/**
 * Enregistre un objet (ou une classe) sous un nom à espaces de noms,
 * ex. 'H5UI.Box' -> window.H5UI.Box ; les espaces de noms manquants sont
 * créés. Si le nom existe déjà, les propriétés de l'objet y sont fusionnées.
 */
O2.createObject = function(sName, oObject) {
    var aName = sName.split('.');
    var sClass = aName.pop();
    var pIndex = window;
    var sNamespace;
    while (aName.length) {
        sNamespace = aName.shift();
        if (!(sNamespace in pIndex)) {
            pIndex[sNamespace] = {}
        }
        pIndex = pIndex[sNamespace]
    }
    if (!(sClass in pIndex)) {
        pIndex[sClass] = oObject
    } else {
        for (var sProp in oObject) {
            pIndex[sClass][sProp] = oObject[sProp]
        }
    }
};
