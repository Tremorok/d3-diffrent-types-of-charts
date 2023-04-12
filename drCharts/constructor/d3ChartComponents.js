var d3ChartComponents = {
    main : function({
        type = null,
    } = {}) {
        let result = `
            <div class="d3ChartsList">
                <div class="d3Chart" data-idType=101><img src="/d3imgs/d3pie.png"></div>
                <div class="d3Chart" data-idType=102><img src="/d3imgs/d3ch.png"></div>
                <div class="d3Chart" data-idType=103><img src="/d3imgs/d3cv.png"></div>
                <div class="d3Chart" data-idType=104><img src="/d3imgs/d3gaug.png"></div>
                <div class="d3Chart" data-idType=105><img src="/d3imgs/d3sv.png"></div>
                <div class="d3Chart" data-idType=106><img src="/d3imgs/d3sh.png"></div>
            </div>
            <select class="selectpicker" id="inlineFormCustomSelect">
                <option selected>Choose...</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
            </select>
            <button type="button" id="d3ChartApplyBtn" class="btn btn-success">Apply</button>
        `;
        return result;
    }
}