O2.createObject('O876.MapTranslater', {
    process: function(aMap, oDic) {
        var x, y, aRow;
        var aOutput = [];
        var aRowOutput;
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
});
