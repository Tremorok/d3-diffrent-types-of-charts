var d3SolidGauga = {
    create: function (elementId, {
        value,
        name,
        minVal,
        maxVal,
        // colorLeft = "#55BF3B",
        // colorRight = "#55BF3B",
        innerRadius = 60,
        outerRadius = 100,
        width = 200,
        height = 200,
        colors = ["#BC1812","#55BF3B"],
        intervals = [minVal,minVal+((maxVal-minVal)/2),maxVal]
    } = {}) {
        // let colorKoef = (value - minVal)/(maxVal - minVal);
        // let finalColor = chroma.mix(colorLeft, colorRight, colorKoef,'hsl');
        // console.log(colorKoef);

        // Эта хуйня пригодится позже, чтобы можно было указать несколько цветов и их промежутки
        // пока закоментил, ибо еще хз как нужно докручивать логику
        // const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
        // const minValue = 0;
        // const maxValue = 100;
        // const currentValue = 90;
        // const intervals = [0, 25, 50, 75, 100];

        // const bezierScale = chroma.bezier(colors, intervals);
        // const scale = bezierScale.scale().domain([minValue, maxValue]);
        // const color = scale(currentValue).hex();

        // console.log(color); // e.g. #00ff00

        // const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
        // const minValue = 0;
        // const maxValue = 100;
        // const currentValue = 90;
        // const intervals = [0, 25, 50, 75, 100];

        const bezierScale = chroma.bezier(colors, intervals);
        const scale = bezierScale.scale().domain([minVal, maxVal]);
        const finalColor = scale(value).hex();

        //console.log(color); // e.g. #00ff00

        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(-Math.PI / 2);

        var svg = d3.select("#" + elementId)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", finalColor)
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", finalColor)
            .attr("stop-opacity", 1); //Контролит стартовый цвет

        var background = svg.append("path")
            .datum({ endAngle: Math.PI / 2 })
            .style("fill", "#EEE")
            .style("stroke","#CCC")
            .style("stroke-width","1px")
            .attr("d", arc);

        var foreground = svg.append("path")
            .datum({ endAngle: -Math.PI / 2 })
            .style("fill", "url(#gradient)")
            .attr("d", arc);

        var text = svg.append("text")
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("fill", "#333")
            .text(value);

        var range = maxVal - minVal;
        var valuePercent = (value - minVal) / range;
        var endAngle = (valuePercent * Math.PI) - (Math.PI / 2);
        foreground.transition()
            .duration(100)
            .attrTween("d", function (d) {
                var interpolate = d3.interpolate(d.endAngle, endAngle);
                return function (t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                }
            });
    }
}