var d3Pie = {
    create : function (elementId, data, {
        name = ([x]) => x,  // given d in data, returns the (ordinal) label
        value = ([, y]) => y, // given d in data, returns the (quantitative) value
        info = ([x,y,z]) => z,
        title, // В теории, можно будет переназвать колонки, но пока не пашет
        customLables, // По плану, сюда будет залетать шаблон для лейбла (чтобы потом пропихивать всякие ссылки и прочий калл)
        lablesHandler, // По плану, сюда можно будет передать хэндлер для листнера кликов по лэйблам (чтобы можно было что-то делать по клику)
        width = 640, // Ширина чарта (общая)
        height = 400, // Высота чарта (общая)
        innerRadius = 0, // Внутренний радиус пирога
        outerRadius = Math.min(width, height) / 2, // Внешний радиус пирога
        labelRadius = (innerRadius * 0.2 + outerRadius * 0.8), // Центральный радиус расположений лэйблов
        colorsPreset, //Пресеты цветов (thermal,blues и мб что-то еще)
        colorSchema,
        format = ",", // a format specifier for values (in the label) хз что это
        names, // Массив имён, если укажем, то он смапится с массивом colors 1 к 1, и конкретная группа, будет подсвечиватся конкретным цветом
        colors, // массив текстовых #hex цветов, наложатся по порядку, либо по связе со списком имен
        stroke = innerRadius > 0 ? "none" : "white", // Граница чарта
        strokeWidth = 1, // Ширина границы чарта
        strokeLinejoin = "round", // line join of stroke separating wedges хз что это
        padAngle = stroke === "none" ? 1 / outerRadius : 0, // angular separation between wedges Вообще не ебу что это
        disable = {
            lines : false,
            lables : false, 
        }
    } = {}) {
    
        //Стас, нужно намутить еще тултип, чтобы можно было листнер передать и его форму
        //Еще нужна функция, которая разные палитры генерит (по количеству цветов, укажем 10, вернет 10)
        //Нужна возможность включать и выключать некоторые вещи, например показ лэйбла, либо убирать к хуям стрелочки до лэйблов
        //Нужна хуета, которая может считать суммы по группам
        //Нужна хуета, чтобы можно было сортировку выставить (и обратную)
        //Нужна хуета, чтобы можно было агрегировать (либо оставить это на отдельную функцию)
        //Нужен хэндлер на тултипах, и по кликам на лэйблы с кусочками чартов
    
        // Compute values. Вообще не ебу что это
        const N = d3.map(data, name);
        const V = d3.map(data, value);
        const IN = d3.map(data, info)
        const I = d3.range(N.length).filter(i => !isNaN(V[i]));
    
        // Unique the names.
        if (names === undefined) names = N;
        names = new d3.InternSet(names);
    
        // Chose a default color scheme based on cardinality.
        if (colorSchema === undefined && colors === undefined) {
            colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);
            console.log("123");
        } else if (colorSchema != undefined) {
            //colors = d3[colorsSchemas[colorsPreset]][names.size];
            colors = chroma.scale(colorSchema).colors(names.size);
        }
        // Construct scales.
        const color = d3.scaleOrdinal(names, colors);
    
        let simpleNamePattern = `
                <div class="d3_chart_name_element_default">
                    <name>$name</name>
                    <val>$value</val>
                </div>
            `;
    
        if (title === undefined) {
            const formatValue = d3.format(format);
            title = i => {
                let pt = customLables == null ?
                    simpleNamePattern.replaceAll('$name', N[i]).replaceAll('$value', V[i])
                    : customLables.replaceAll('$name', N[i]).replaceAll('$value', V[i]).replaceAll('$i', i);
    
                let obj = {
                    pattern: pt,
                    imulPlace: `${N[i]}`,
                    lable: `${N[i]}`,
                    tit: `${N[i]}\n${formatValue(V[i])}`
                };
                return obj;
            }
        } else {
            const O = d3.map(data, d => d);
            const T = title;
            title = i => T(O[i], i, data);
        }
        // Construct arcs.
        const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
    
        //Создаем главный элемент, где будет валятся график и названия кусочков
        let chart = d3.create("div")
            .attr("id", "d3_chart-" + elementId)
            .style("width", width)
            .style("height", height)
    

        chart.append("div")
            .attr("id", "d3_tooltip-" + elementId)
            .attr("class","hidden d3_tt")
            .append("strong")
            .text("here will replace lable");
        
        chart.selectAll("#d3_tooltip-" + elementId)
            .append("span")
            .attr("id", "value");

        chart.selectAll("#d3_tooltip-" + elementId)
            .append("span")
            .attr("id", "info");
            
        //Создаем элемент
        chart.append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic; position: absolute;");
    
        //Прорисовка названий половинок
        chart.selectAll("svg")
            .append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 20)
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(arcs)
            .join("text")
            .attr("transform", d => {
                const tspanPosition = arcLabel.centroid(d);
                const tspanPositionAttr = `translate(${tspanPosition})`;
                return tspanPositionAttr;
            })
            .selectAll("tspan")
            .data(d => {
                const lines = [{
                    imulPlace: title(d.data).imulPlace,
                    pattern: title(d.data).pattern
                }];
                return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
            })
            .join("tspan")
            .attr("class", "d3_chart_elem")
            .attr("data", d => d.pattern)
            .attr("fill", "none")//Заливаем текст прозрачным цветом
            .text(d => d.imulPlace);//Я хз насколько это вэлью, но я подсовываю прозрачный текст, чтобы d3 выкупил примерно куда закинуть элемент сам, а потом цепляюсь за его позицию
    
        
        chart.selectAll("svg")
            .append("g")
                .attr("stroke", stroke)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-linejoin", strokeLinejoin)
                .selectAll("path")
                .data(arcs)
                .join("path")
                    .attr("fill", d => color(N[d.data]))
                    .attr("d", arc)
                    .on("mouseover", (event,d) => {
                        chart.select("#d3_tooltip-" + elementId)
                            .style("left", (event.pageX+5) + "px")
                            .style("top", event.pageY + "px")
                            .style("opacity", 1)
                            .select("#value")
                            .text(" сумма:"+d.value);

                        chart.select("#d3_tooltip-" + elementId + " strong")
                            .text(title(d.data).lable+":");
                        
                            
                        let infoList = IN[d.data];
                        let infoBlock = "";
                        if (infoList) {
                            infoList.map((el)=>{
                                let sGroup = el.subGroup,
                                    vl = el.value;
                                infoBlock+=`<p>${sGroup}:${vl}</p>`;
                            })
                            
                        }
                        chart.select("#d3_tooltip-" + elementId + "  #info")
                            .html(infoBlock);
                        
                        //console.log(infoList);
                      })
                    .on("mouseout", () => {
                        // Hide the tooltip
                        chart.select("#d3_tooltip-" + elementId)
                            .style("opacity", 0)
                            .style("left", "0px")
                            .style("top", "0px")
                    });
                    // .append("title")
                    //     .text(d => title(d.data).tit);
        
        
        if (!disable.lines) {
            chart.selectAll("svg")
                .selectAll('allSlices')
                .data(arcs)
                .enter()
                .append('polyline')
                .attr("stroke", "black")
                .style("fill", "gray")
                .attr("stroke-width", 1)
                .attr('points', function (d) {
                    var posA = arc.centroid(d) // line insertion in the slice
                    var posB = arcLabel.centroid(d) // line break: we use the other arc generator that has been built only for that
                    var posC = arcLabel.centroid(d); // Label position = almost the same as posB
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                    posC[0] = outerRadius * 0.85 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                    //var poss = [posA, [posB[0],posB[1]], posC, [posB[0],posB[1]]];
                    var poss = [posA, [posB[0] * 0.83, posB[1] * 0.83]];
                    return poss
                });
            }
        chart.append("div")
            .attr("class", "d3_chart-names");
        let objAssign = Object.assign(chart.node(), { scales: { color } });
    
        //document.querySelector(elementId).innerHTML = "";
        document.getElementById(elementId).append(objAssign);
        if (!disable.lables) {
            d3Pie.putNames(elementId);
        }
    
        return objAssign;
    },
    putNames : function(elementId) {
        let elements = document.querySelectorAll('#d3_chart-' + elementId + ' .d3_chart_elem'),
            mainDiv = document.getElementById('d3_chart-' + elementId),
            ppInfo = mainDiv.getBoundingClientRect(),
            pLeft = ppInfo.left,
            pTop = ppInfo.top,
            namesDiv = document.querySelector('#d3_chart-' + elementId + ' .d3_chart-names');
    
        for (let i = 0; i < elements.length; i++) {
            let el = elements[i],
                text = el.attributes.data.nodeValue,
                positionInfo = el.getBoundingClientRect(),
                top = positionInfo.top - pTop + "px",
                left = positionInfo.left - pLeft + "px";
    
            let htmlToIns = `<div style="position:relative; top:${top}; left:${left};height: 0px;" class="d3_names-element">
                    ${text}
                <div>`;
    
            namesDiv.insertAdjacentHTML('beforeend', htmlToIns);
        }
    }
};

