var d3DataParsers = {
    pie : function(data,{group,subGroup = null,val}={}) {
        let preResult = {}
        data.map((el)=>{
            let elGroup = el[group],
                elValue = el[val];

            if (!preResult[elGroup]) {
                preResult[elGroup] = 0;
            }
            preResult[elGroup] += elValue;
        })

        let result = [];
        for (const rGroup in preResult) {
            let info = [];
            if (subGroup) {
                data.map((el)=>{
                    if (el[group] == rGroup) {
                        info.push({
                            "subGroup":el[subGroup],
                            "value":el[val]});
                    }
                });
            }
            result.push({
                "name":rGroup,
                "value":preResult[rGroup],
                "info":info.length > 0 ? info : null});
        }
        return result;
    },
    bar : function() {

    }
}


// y: d => d.value,
// x: d => d.group,
// z: d => d.subGroup,