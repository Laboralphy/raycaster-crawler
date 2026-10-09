export const MapTranslater = {
    process: function(aMap, oDic) {
        let x, y, aRow;
        const aOutput = [];
        let aRowOutput;
        for (y = 0; y < aMap.length; ++y) {
            aRow = aMap[y].split('');
            aRowOutput = [];
            for (x = 0; x < aRow.length; ++x) {
                aRowOutput.push(oDic[aRow[x]])
            }
            aOutput.push(aRowOutput)
        }
        return aOutput
    }
};
