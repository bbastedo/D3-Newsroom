// @TODO: YOUR CODE HERE!
// Create attritbutes for SVG
var width = parseInt(d3.select("#scatter").style("width"));
var height = width * 2/3;
var margin = 10;
var labelArea = 110;
var padding = 45;

// Create SVG using attritbutes above
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Axis Labels
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

// Update SVG to fit xText
var bottomXText =  (width - labelArea)/2 + labelArea;
var bottomYText = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomXText}, 
    ${bottomYText})`
    );

// Build xText Information 
// Median Age Label
xText.append("text")
    .attr("y", 19)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Median Age");

// Percent in Poverty Label
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("Percent In Poverty");

// Median Household Income
xText.append("text")
.attr("y", 0)
.attr("data-name", "income")
.attr("data-axis", "x")
.attr("class","aText inactive x")
.text("Median Household Income");

// Create Y Axis Information
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// Update SVG to fit yText
var leftXText =  margin + padding;
var leftYText = (height + labelArea) / 2 - labelArea;

yText.attr("transform",`translate(
    ${leftXText}, 
     ${leftYText}
    )rotate(-90)`
    );

// Obesity Percentage
yText.append("text")
    .attr("y", 19)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");
// Smoker Percentage
yText.append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");
// Healthcare Percentage
yText.append("text")
    .attr("y", -19)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");

// Create circle radius
var circleRadius;
function adjustRadius(){
    if (width <= 530){
        circleRadius = 5;
    }
    else{
        circleRadius = 10;
    }
}
adjustRadius();

// Read in CSV Data file
d3.csv("D3_data_journalism/data/data.csv").then(function(d){
    visualizeData(d);
});

function visualizeData (csvData){
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // Default X and Y Axis Label Selections
    var currentX = "poverty";
    var currentY = "obesity";

    // Adding d3.tip()
    var d3Tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40,-60])
        .html(function(d){
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${currentY}: ${d[currentY]}%</div>`
            if (currentX === "poverty"){
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`
            }
            else{
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`}
                return stateLine + xLine + yLine
        });
    // Add d3.tip() to SVG
    svg.call(d3Tip)
    
    // Change Axis Labels when Clicked
    function updateLabels(axis, clickText){
        d3.selectAll(".aText")
        .filter("." + axis)
        .filter(".active")
        .classed("active", false)
        .classed("inactive", true);

        //Change selected text when clicked 
        clickText.classed("inactive", false).classed("active",true);
    }

    // Calculate Min and Max values for SVG Scaling
    function xMinMax(){
        xMin = d3.min(csvData, function(d){
            return parseFloat(d[currentX]) * 0.85;
        });
        xMax = d3.max(csvData, function(d){
            return parseFloat(d[currentX]) * 1.15;
        });
    }

    function yMinMax(){
        yMin = d3.min(csvData, function(d){
            return parseFloat(d[currentY]) * 0.85;
        });
        yMax = d3.max(csvData, function(d){
            return parseFloat(d[currentY]) * 1.15;
        });
    }

    xMinMax();
    yMinMax();
    
    // Determine X Scaling
    var scaleX = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])
    // Determine Y Scaling
    var scaleY = d3
        .scaleLinear()
        .domain([yMin,yMax])
        .range([height - margin - labelArea, margin])

    // Create new scaled X & Y axis 
    var xAxis = d3.axisBottom(scaleX);
    var yAxis = d3.axisLeft(scaleY);

    // Determine number of ticks based on width of SVG
    function numberOfTicks(){
        if(width <= 530){
            xAxis.ticks(5);
            yAxis.ticks(5);
        }
        else{
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }
    numberOfTicks();

    // Add Axis to the SVG
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

        svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );
    
    var completedCircles = svg.selectAll("g allCircles").data(csvData).enter();

    completedCircles.append("circle")
        .attr("cx", function(d){
            return scaleX(d[currentX]);
        })
        .attr("cy", function(d){
            return scaleY(d[currentY])
        })
        .attr("r", circleRadius)
        .attr("class", function(d){
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d){
            d3Tip.show(d,this);
            d3.select(this).style("stroke", "#FF0000")
        })
        .on("mouseout", function(d){
            d3Tip.hide(d);
            d3.select(this).style("stroke", "#e3e3e3")
        });

    completedCircles
        .append("text")
        .attr("font-size", circleRadius)
        .attr("class", "stateText")
        .attr("dx", function(d){
            return scaleX(d[currentX])
        })
        .attr("dy", function(d){
            return scaleY(d[currentY]) + circleRadius/3;
        })
        .text(function(d){
            return d.abbr;
        })
        .on("mouseover", function(d){
            d3Tip.show(d);
            d3.select("." + d.abbr).style("stroke","#FF0000")
        })
        .on("mouseout", function(d){
            d3Tip.hide(d);
            d3.select("." + d.abbr).style("stroke","#e3e3e3")
        });

    // Make SVG Dynamic on Click
    d3.selectAll(".aText").on("click", function(){
        var self = d3.select(this)

        if(self.classed("inactive")){
            var axis = self.attr("data-axis")
            var name = self.attr("data-name")

            if(axis === 'x'){
                currentX = name;

                xMinMax();
                scaleX.domain([xMin, xMax]);
                svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);

                // Update Circle Locations
                d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return scaleX(d[currentX])                
                        });
                  });   

                d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return scaleX(d[currentX])                          
                        });
                  }); 

                // Update labels
                updateLabels(axis, self);
            }

            else{
                currentY = name;
                yMinMax(); 
                scaleY.domain([yMin, yMax]);

                svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);

                    d3.selectAll("circle").each(function() {
                        d3.select(this)
                            .transition().duration(800)
                            .attr("cy", function(d) {
                                return scaleY(d[currentY])                
                            });                       
                        });   

                    d3.selectAll(".stateText").each(function() {
                        d3.select(this)
                            .transition().duration(800)
                            .attr("dy", function(d) {
                                // Center text
                                return scaleY(d[currentY]) + circleRadius/3;
                        });
                    });

                    updateLabels(axis, self);
            }
        }
    })
};