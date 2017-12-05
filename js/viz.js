(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.antal = global.antal || {})));
}(this, (function (exports) { 
    
    'use strict';

    var RScolors = ["#0085a1", "#94948f", "#595959", "#f9e300", "#fecb00", "#fcc860", "#fc9e77", "#ff6d22", "#bd4f19",
    "#e21b23", "#a20234", "	#00b092", "	#4bdbc3", "#d4df4d",  "#9c9a00", "#005c42", "#64bf92", "#6fd4e4", "#3d7edb"];

    function fuldtid(csv){
        
        console.log("Csv: \n");
        console.log(csv); 

          
    
        //Set dimensions
        var margin = {top: 20, right: 20, bottom: 70, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
    
        



        //Set color-scheme 
        var color = d3.scaleOrdinal().range(RScolors);
        
        //Set scales and ranges
        var x_groups = d3.scaleBand().range([0, width]).padding(0.01);
        var x_categories = d3.scaleBand().padding(0.1);
        var y = d3.scaleLinear().range([height, 0]);
    
        //Append svg-object to div
        var svg = d3.select("#Fuldtid").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

            
        //Get data
    
        var ssv = d3.dsvFormat(";");
        var data = ssv.parse(csv);
        console.log(JSON.stringify(data));
    
        data.forEach(function(d){
            //d.Year = + d.Year;
            d.Fuldtid = parseFloat((d.Fuldtid.replace(",",".")));
        });
    
        console.log("With numbers:\n");
        console.log(JSON.stringify(data));
    
    
        //Nest data by virk and gender
        var dataByVirkGender = d3.nest()
            .key(function (d) { return d.Virk; })
            .key(function (d) { return d.Gender; })
            .rollup(function (v) { return d3.sum(v, function (d) {return d.Fuldtid; }); })
            .entries(data);

        /* console.log("DataVirkByGender: " + JSON.stringify(dataByVirkGender));
        console.log("APO kvinde: " + dataByVirkGender[0].values[0].value); */
        //sort
        dataByVirkGender.sort(function (a,b) {return ( b.values.map(function (d) {return d.value; }).reduce (function (x,y) {return x + y;}) 
            - (a.values.map(function (d) {return d.value; })).reduce (function (x,y) {return x + y;})  );  });

        /* console.log ("Mapped a: " + dataByVirkGender[0].values.map(function (d) {return d.value; }) );
        console.log("Sorted: " + JSON.stringify(dataByVirkGender)); */
       
        //Domains
        //var groups = [...new Set(data.map(d => d.Virk))];
        var groups = [...new Set(dataByVirkGender.map(d => d.key))];
        console.log("Groups: " + groups);
        x_groups.domain(groups);
        
        
        //Get categories - exctract the keys from the first entry
        //var categories = dataByVirkGender[0].values.map(function (d) {return d.key; } );
        var categories  = [...new Set(data.map(d => d.Gender))];
        console.log("Categories: " + categories);
        x_categories.domain(categories).rangeRound([0, x_groups.bandwidth()]);
        
        
        //console.log("max fuldtid: " + d3.max(data.map(d => d.Fuldtid)));

        y.domain([0, d3.max(data.map(d => d.Fuldtid))]);

        //Create g for groups (virk)
        var groups_g = svg.selectAll("group")
            .data(dataByVirkGender)
            .enter().append("g")
            .attr("class", function (d) {return 'group group-' + d.key;} )
            .attr("transform", function (d) {
                return "translate(" + x_groups(d.key) + ",0)"; });

        //Append rects (gender)
        var rects = groups_g.selectAll("rect")
            .data(function(d) { return d.values; })
            .enter()
            .append("rect")
            .attr("class", function (d) { return "category category-" + d.key})
            .attr("x", function(d) {return x_categories(d.key);})
            .attr("y", 0)
            //.attr("y", function (d) { return y(d.value); })
            .attr("width", x_categories.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", function(d) { return color(d.key); });
            /* .on("mouseover", function(d) {
                tooltip.style("display", null);
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none")
            })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 5;
                console.log(xPosition);
                var yPosition = d3.mouse(this)[1] - 5;
                console.log(yPosition);
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition +")");
                tooltip.select("text").text(d.key +": " + d.value);
            });
             */
                
         //Enter with transition
         rects.transition()
         .duration(1000)
         //.ease(d3.easeBounce)
         .attr("y", function (d) { return y(d.value); });       


    
        //  Add x axis
            var x_axis = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x_groups))
            .selectAll("text")
            .attr("class", "xaxistext")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");


         //Tooltips1
         /* var tooltip = svg.append("g")
                .attr("class", "tooltip")
                .style("display", "none");

        tooltip.append("rect")
                .attr("width", 80)
                .attr("height", 20)
                .attr("fill", "white")
                .style("opacity", 0.5);

        tooltip.append("text")
                .attr("x", 30)
                .attr("dy", "1.2em")
                .style("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold");
 */
        
         

        
        //Setup tooltips tool-tips
        var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {return d.key + "<br/>" + d.value});

        svg.call(tool_tip); 

        //connect tooltips to rects
        rects
        .on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide);
    
        // Add y axis
        var y_axis = svg.append("g")
            .attr("class","axis")
            .call(d3.axisLeft(y)); 
        
        }

    exports.fuldtid = fuldtid;
    
    
    Object.defineProperty(exports, '__esModule', { value: true });
    
    })));


