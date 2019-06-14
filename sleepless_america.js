var svg = d3.select('svg#bar')
var lineSvg = d3.select('svg#line')
var ageGroup = []
var year = []
var typesDays = []
var sex = []

var yearWidth = 700;
var sleepHeight = 500;
var maxVal = 0;
var minVal = 0;
var filteredData = [];
var csvData = '';

var xAxisG = '';
var yAxisG = '';
var lineXAxisG = '';
var lineYAxisG = '';
var rectG = '';
var errorRect = '';
var text = '';
var errorTextG = '';
var menLineG = '';

var yearAxis = '';
var sleepAxis = '';
var xAxis = '';
var yAxis = '';
var lineYearAxis = '';
var lineSleepAxis = '';
var lineXAxis = '';
var lineYAxis = '';

var parseTime = d3.timeParse("%Y");

// Adding Tooltip in body
var div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 1);

// define the line
var line = '';

// Age Group
function ageSelect() {
    var ageSelect = d3.select("#age_group").selectAll('option').data(ageGroup);
    ageSelect.enter().append('option').text(function (d) { return d; }).attr("value", function (d) { return d; });
}

// types of days
function typesDaysSelect() {
    var typesDaysSelect = d3.select("#day_type").selectAll('option').data(typesDays);
    typesDaysSelect.enter().append('option').text(function (d) { return d; }).attr("value", function (d) { return d; });
}

// sex
function sexSelect() {
    var sexSelect = d3.select("#sex").selectAll('option').data(sex);
    sexSelect.enter().append('option').text(function (d) { return d; }).attr("value", function (d) { return d; });
}

d3.csv('./Time Americans Spend Sleeping.csv').then(function(data, error) {
    csvData = data;
    data.forEach(function(d){
        if (!year.includes(d['Year'])) { year.push(d['Year'])}
        if (!ageGroup.includes(d['Age Group'])) { ageGroup.push(d['Age Group'])}
        if (!typesDays.includes(d['Type of Days'])) { typesDays.push(d['Type of Days'])}
        if (!sex.includes(d['Sex'])) { sex.push(d['Sex'])}
        
        d['Avg hrs per day sleeping'] = +d['Avg hrs per day sleeping']
        d['Standard Error'] = +d['Standard Error']
    })

    ageSelect()
    typesDaysSelect()
    sexSelect()

    ageFilter = d3.select('#age_group').property("value")
    dayTypeFilter = d3.select('#day_type').property("value")
    sexFilter = d3.select('#sex').property("value")

    filteredData = data.filter(function(d){ return ((d['Age Group'] == ageFilter) && (d['Type of Days'] == dayTypeFilter) && (d['Sex'] == sexFilter)) })
    
    yearAxis = d3.scaleBand().range([0, yearWidth-50]).domain(year);
    sleepAxis = d3.scaleLinear().range([0,sleepHeight-45]).domain([d3.max(csvData,function(d){ return d['Avg hrs per day sleeping'];})-0.1,d3.min(csvData,function(d){ return d['Avg hrs per day sleeping'];})-0.1]);
    xAxis = d3.axisBottom().scale(yearAxis).tickSize(10);
    yAxis = d3.axisLeft().scale(sleepAxis).tickSize(10);

    yAxisG = svg.append('g').attr('class','yaxis').attr("transform", "translate(40,30)").call(yAxis);
    xAxisG = svg.append('g').attr('class','xaxis').attr("transform", "translate(40," + (sleepHeight-25) + ")");
    lineYAxisG = lineSvg.append('g').attr('class','yaxis').attr("transform", "translate(40,30)").call(yAxis);
    lineXAxisG = lineSvg.append('g').attr('class','xaxis').attr("transform", "translate(40," + (sleepHeight-25) + ")");

    // append the rectangles for the bar chart
    rectG = svg.append("g").attr('class','rect_bar').attr('transform','translate(45,19)');
    errorRectG = svg.append("g").attr('class','error_rect_bar').attr('transform','translate(45,19)');
    menLineG = lineSvg.append('g').attr('class','line_men').attr('transform','translate(65,20)');
    womenLineG = lineSvg.append('g').attr('class','line_women').attr('transform','translate(65,20)');

    update()
    d3.select("#show_error").on("change",update);
    d3.select("#age_group").on("change",update);
    d3.select("#day_type").on("change",update);
    d3.select("#sex").on("change",update);

})

function updateRectBar(y,h){
    rectBar = rectG.selectAll("rect.bar").data(filteredData);
    rectBar.exit().remove();
    rectBarTmp = rectBar.enter().append("rect")
    rectBar = rectBarTmp.merge(rectBar)
    rectBar.transition().duration(1000).attr("class", "bar")
        .attr("x", function(d) { return yearAxis(d['Year']); })
        .attr("width", yearAxis.bandwidth()-10)
        .attr("y", y)
        .style('fill','#FFAE34')
        .attr("height", h);
}

function updatedRectText(txt,y){
    text = rectG.selectAll('text.hrs_text').data(filteredData);
    text.exit().remove();
    textTmp = text.enter().append('text')
    text = textTmp.merge(text)
    text.transition().duration(1000)
                .attr('class','hrs_text')
                .attr('x',function(d) { return yearAxis(d['Year'])+18; })
                .attr('y',y)
                // .attr('dx','.2em')
                .attr('stroke-width', '0.5px')
                .attr('stroke','black')
                .attr('text-anchor','middle')
                .attr('font-size',11)
                .style('display',function(d){ if ((sleepHeight - sleepAxis(d['Avg hrs per day sleeping'])) > 20) {return 'inline'} else { return 'none'}})
                .text(txt);
}

function errorRectBar(height){
    errorRect = errorRectG.selectAll('rect.error_bar').data(filteredData);
    errorRect.exit().remove();
    errorRectTmp = errorRect.enter().append('rect')
    errorRect = errorRectTmp.merge(errorRect);
    errorRect.transition().duration(1000).attr('class','error_bar')
                    .attr("x", function(d) { return yearAxis(d['Year']); })
                    .attr("width", yearAxis.bandwidth()-10)
                    .attr("y", function(d) { return Math.abs(sleepAxis(d['Avg hrs per day sleeping']-d['Standard Error']) - Math.abs(sleepAxis(d['Avg hrs per day sleeping']) - sleepAxis(d['Avg hrs per day sleeping']-d['Standard Error']))); })
                    .style('fill','#849DB1')
                    .attr('height',height);
}

function errorRectText(dis){
    errorText = errorRectG.selectAll('text.error_text').data(filteredData);
    errorText.exit().remove();
    errorTextTmp = errorText.enter().append('text')
    errorText = errorTextTmp.merge(errorText)
    errorText.transition().duration(1000)
                    .attr('class','error_text')
                    .attr('x',function(d) { return yearAxis(d['Year'])+18; })
                    .attr('y',function(d) { return sleepAxis(d['Avg hrs per day sleeping'])-5; })
                    .attr('stroke-width', '0.5px')
                    .attr('stroke','black')
                    .attr('text-anchor','middle')
                    .attr('font-size',11)
                    .attr('display',dis)
                    .text(function(d){ return d['Standard Error'];});
}

function drawLine(menData,womenData){
    // add the valueline path.
    menLine = menLineG.selectAll('path.men').data([menData]);
    menLine.exit().remove();
    menLineTmp = menLine.enter().append("path")
    menLine = menLineTmp.merge(menLine)
    menLine.transition().duration(1000)
                .attr("class", "men")
                .attr("d", line);

    menSvg = menLineG.selectAll('image.men').data(menData);
    menSvg.exit().remove();
    menSvgTmp = menSvg.enter().append('svg:image')
    menSvg = menSvgTmp.merge(menSvg)
    menSvg.transition().duration(1000) 
                .attr('class','men')
                .attr("xlink:href",'./male.svg')
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", function(d) { return lineYearAxis(d['Year'])-10;})
                .attr("y", function(d){ return lineSleepAxis(d['Avg hrs per day sleeping'])-10;});

    womenLine = menLineG.selectAll('path.women').data([womenData]);
    womenLine.exit().remove();
    womenLineTmp = womenLine.enter().append("path")
    womenLine = womenLineTmp.merge(womenLine)
    womenLine.transition().duration(1000)
                .attr("class", "women")
                .attr("d", line);

    womenSvg = womenLineG.selectAll('image.men').data(womenData);
    womenSvg.exit().remove();
    womenSvgTmp = womenSvg.enter().append('svg:image')
    womenSvg = womenSvgTmp.merge(womenSvg)
    womenSvg.transition().duration(1000) 
                .attr('class','men')
                .attr("xlink:href",'./female.svg')
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", function(d) { return lineYearAxis(d['Year'])-10;})
                .attr("y", function(d){ return lineSleepAxis(d['Avg hrs per day sleeping'])-10;});
}

function update() {
    ageFilter = d3.select('#age_group').property("value")
    dayTypeFilter = d3.select('#day_type').property("value")
    sexFilter = d3.select('#sex').property("value")
    
    filteredData = csvData.filter(function(d){ return ((d['Age Group'] == ageFilter) && (d['Type of Days'] == dayTypeFilter) && (d['Sex'] == sexFilter)) })
    
    yearAxis = d3.scaleBand().range([0, yearWidth-50]).domain(year);
    sleepAxis = d3.scaleLinear().range([0,sleepHeight-45]).domain([d3.max(csvData,function(d){ return d['Avg hrs per day sleeping'];})+0.1,d3.min(csvData,function(d){ return d['Avg hrs per day sleeping'];})-0.1]);
    xAxis = d3.axisBottom().scale(yearAxis).tickSize(10);
    yAxis = d3.axisLeft().scale(sleepAxis).tickSize(10);
    yAxisG.transition().duration(1000).attr("transform", "translate(40,20)").call(yAxis);
    xAxisG.transition().duration(1000).attr("transform", "translate(40," + (sleepHeight-25) + ")").call(xAxis);
    
    lineYearAxis = d3.scaleBand().range([0, yearWidth-50]).domain(year);
    lineSleepAxis = d3.scaleLinear().range([0,sleepHeight-45]).domain([d3.max(csvData,function(d){ return d['Avg hrs per day sleeping'];})+0.1,d3.min(csvData,function(d){ return d['Avg hrs per day sleeping'];})-0.1]);
    lineXAxis = d3.axisBottom().scale(lineYearAxis).tickSize(10);
    lineYAxis = d3.axisLeft().scale(lineSleepAxis).tickSize(10);
    lineYAxisG.transition().duration(1000).attr("transform", "translate(40,20)").call(lineYAxis);
    lineXAxisG.transition().duration(1000).attr("transform", "translate(40," + (sleepHeight-25) + ")").call(lineXAxis);

    line = d3.line().x(function(d) { return lineYearAxis(d['Year']); }).y(function(d) { return lineSleepAxis(d['Avg hrs per day sleeping']); });
    menData  = csvData.filter(function(d){ return ((d['Age Group'] == ageFilter) && (d['Type of Days'] == dayTypeFilter) && (d['Sex'] == 'Men')) })
    womenData = csvData.filter(function(d){ return ((d['Age Group'] == ageFilter) && (d['Type of Days'] == dayTypeFilter) && (d['Sex'] == 'Women')) })

    if(d3.select("#show_error").property("checked")) {
        updateRectBar(function(d) { return sleepAxis(d['Avg hrs per day sleeping']-d['Standard Error']); },function(d) { return (sleepHeight - sleepAxis(d['Avg hrs per day sleeping']-d['Standard Error'])-45); })
        updatedRectText(function(d){ return (d['Avg hrs per day sleeping']-d['Standard Error']).toFixed(2)},function(d) { return sleepAxis(d3.min(csvData,function(d){ return d['Avg hrs per day sleeping'];})); })
        errorRectBar(function(d) { return Math.abs(sleepAxis(d['Avg hrs per day sleeping']) - sleepAxis(d['Avg hrs per day sleeping']-d['Standard Error'])); })
        errorRectText('inline')
        drawLine(menData,womenData)
    }
    else {
        updateRectBar(function(d) { return sleepAxis(d['Avg hrs per day sleeping']); },function(d) { return sleepHeight - sleepAxis(d['Avg hrs per day sleeping'])-45; })
        // updateRectBar(function(d) { return sleepAxis(7.8); },function(d) { return sleepHeight - 45 - sleepAxis(10.6); })
        txt = function(d){ return d['Avg hrs per day sleeping'];}
        updatedRectText(txt,function(d) { return sleepAxis(d['Avg hrs per day sleeping'])+20; })
        errorRectBar(0)
        errorRectText('none')
        drawLine(menData,womenData)   
    }

    d3.selectAll("rect")
        .on('mouseover',function(d){
            div.transition().duration(100).style('display','inline')
        })  
        .on('mouseout',function(d){
            div.transition().duration(100).style('display','none')
        })
        .on('mousemove',function(d){
            msg = 'Year: <b>' + d['Year'] + '</b></br> Sex: <b>' +d['Sex'] +'</b></br> Type of Days: <b>' + d['Type of Days'] + '</b></br> Avg. Hrs Per Day Sleeping: <b>' + d['Avg hrs per day sleeping'] + '</b></br> Standard Error: <b>' + d['Standard Error'] + '</b></br>';
            div.html(msg).style("left", (d3.event.pageX + 20) + "px").style("top", (d3.event.pageY + 10) + "px");
        });
    d3.selectAll("image")
        .on('mouseover',function(d){
            div.transition().duration(100).style('display','inline')
        })  
        .on('mouseout',function(d){
            div.transition().duration(100).style('display','none')
        })
        .on('mousemove',function(d){
            msg = 'Year: <b>' + d['Year'] + '</b></br> Sex: <b>' +d['Sex'] +'</b></br> Type of Days: <b>' + d['Type of Days'] + '</b></br> Avg. Hrs Per Day Sleeping: <b>' + d['Avg hrs per day sleeping'] + '</b></br> Standard Error: <b>' + d['Standard Error'] + '</b></br>';
            div.html(msg).style("left", (d3.event.pageX + 20) + "px").style("top", (d3.event.pageY + 10) + "px");
        });

}
