var d3ChartConstructor = {
    async init(idSettingsEl,idChartsEl) {
        console.log(`idSettings:"${idSettingsEl}"`);
        let settingsHTML = d3ChartComponents.main();

        document.getElementById(idSettingsEl).innerHTML = settingsHTML;


    },
    async rerenderChart() {

    },
}