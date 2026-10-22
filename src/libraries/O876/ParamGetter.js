export const ParamGetter = {
    parse: function(sSearch) {
        let match;
        const pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, query = sSearch || window.location.search.substring(1), _decode = function(s) {
                return decodeURIComponent(s.replace(pl, ' '))
            };
        const oURLParams = {};
        while (match = search.exec(query)) {
            oURLParams[_decode(match[1])] = _decode(match[2])
        }
        return oURLParams
    }
};
