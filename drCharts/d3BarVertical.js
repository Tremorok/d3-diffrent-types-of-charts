var d3BarVertical = {
    create: function (elementId, data, {
        x = (d, i) => i, // given d in data, returns the (ordinal) x-value
        y = d => d, // given d in data, returns the (quantitative) y-value
        title, // given d in data, returns the title text
        marginTop = 20, // the top margin, in pixels
        marginRight = 0, // the right margin, in pixels
        marginBottom = 30, // the bottom margin, in pixels
        marginLeft = 40, // the left margin, in pixels
        width = 640, // the outer width of the chart, in pixels
        height = 400, // the outer height of the chart, in pixels
        xDomain, // an array of (ordinal) x-values
        xRange = [marginLeft, width - marginRight], // [left, right]
        yType = d3.scaleLinear, // y-scale type
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        xPadding = 0.1, // amount of x-range to reserve to separate bars
        yFormat, // a format specifier string for the y-axis
        yLabel, // a label for the y-axis
        //color = "steelblue", // bar fill color
        colorSchema,
        names, // Массив имён, если укажем, то он смапится с массивом colors 1 к 1, и конкретная группа, будет подсвечиватся конкретным цветом
        colors, // массив текстовых #hex цветов, наложатся по порядку, либо по связе со списком имен
    } = {}) {
        // Compute values.
        const N = d3.map(data, x);
        const X = d3.map(data, x);
        const Y = d3.map(data, y);
        // Compute default domains, and unique the x-domain.
        if (xDomain === undefined) xDomain = X;
        if (yDomain === undefined) yDomain = [0, d3.max(Y)];
        xDomain = new d3.InternSet(xDomain);

        // Omit any data not present in the x-domain.
        const I = d3.range(X.length).filter(i => xDomain.has(X[i]));

        // Construct scales, axes, and formats.
        // const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
        // const yScale = yType(yDomain, yRange);
        // const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        // const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

        const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

        // const xScale = xType(xDomain, xRange);
        // const yScale = d3.scaleBand(yDomain, yRange).padding(yPadding);
        // const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
        // const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

        // Compute titles.
        if (title === undefined) {
            const formatValue = yScale.tickFormat(100, yFormat);
            title = i => `${X[i]}\n${formatValue(Y[i])}`;
        } else {
            const O = d3.map(data, d => d);
            const T = title;
            title = i => T(O[i], i, data);
        }

        // Unique the names.
        if (names === undefined) names = N;
        names = new d3.InternSet(names);
    
        // Chose a default color scheme based on cardinality.
        if (colorSchema === undefined && colors === undefined) {
            colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);
        } else if (colorSchema != undefined) {
            //colors = d3[colorsSchemas[colorsPreset]][names.size];
            colors = chroma.scale(colorSchema).colors(names.size);
        }
        
        // Construct scales.
        const color = d3.scaleOrdinal(names, colors);
        
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(yLabel));

        const bar = svg.append("g")
            .selectAll("rect")
            .data(I)
            .join("rect")
            .attr("fill", i => color(N[i]))
            .attr("x", i => xScale(X[i]))
            .attr("y", i => yScale(Y[i]))
            .attr("height", i => yScale(0) - yScale(Y[i]))
            .attr("width", xScale.bandwidth());

        if (title) bar.append("title")
            .text(title);

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis);

        document.getElementById(elementId).append(svg.node());
        return svg.node();
    }
};