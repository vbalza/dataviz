ProportionChart = (function() {
    function ProportionChart(selector, data) {
    	var self = this;
    	// Get size of element and define size of chart
    	self.container = d3.select(selector);
    	var containerWidth = self.container[0][0].offsetWidth;
    	self.data = data;

    	self.labelHeight = 20;

    	self.margin = m = { 
    	  top: 0, 
    	  bottom: self.data.length * self.labelHeight, 
    	  right: 160, 
    	  left: 30
    	};
    	self.width = (containerWidth - m.left - m.right);
    	self.height = self.width;

        self.preUnit = '$';

    	self.selectedIndex = 0;
    	self.baseValue = self.data[self.selectedIndex].value;

    	self.radius = self.width * 0.45;
    	self.getRadius = function(value) {
    		return self.radius * Math.sqrt(value) / Math.sqrt(self.baseValue);
    	}
    	self.previousBaseValue = self.getRadius( self.baseValue );

    	self.drawBase();
    	self.drawItems();
    	self.update();
    }

    // Draw canvas
    ProportionChart.prototype.drawBase = function() {
    	var self = this;
    	var m = self.margin;
    	self.svg = self.container.append('svg')
    	  .attr('width', self.width + m.left + m.right)
    	  .attr('height', self.height + m.top + m.bottom);

    	// Main canvas
    	self.chart = self.svg
    	  .append('g')
    	  .attr("transform", "translate(" + m.left + "," + m.top + ")")
    }

    // Init nodes
    ProportionChart.prototype.drawItems = function() {
    	var self = this;
    	self.itemGroups = self.chart.selectAll('.item')
    		.data(self.data, function(d) { return d.name; })
    		.enter()
    		.append('g')
    		.attr('class', 'item')
    		.attr('transform', 'translate('+ [self.width / 2, self.height / 2] + ')');

    	self.items = self.itemGroups.append('circle')
    		.attr('stroke', 'orange')
    		.attr('fill', 'orange')
    		.attr('fill-opacity', 0)
    		.attr('r', 0);
    	
    	self.annotationGroups = self.itemGroups.append('g')
    		.attr('transform', function(d) {
    			return 'translate('+ [0, 0] + ')';
    		});

    	self.labels = self.annotationGroups.append('text')
    		.text(function(d) { return d.name + ', ' + self.preUnit + d.value })
    		.attr('dy', '.35em')
    		.attr('x', 10)
    		.attr('fill-opacity', 0);

    	self.ticks = self.annotationGroups.append('line')
    		.attr('stroke', 'orange')
    		.attr('x1', 0)
    		.attr('x2', 7)
    		.attr('stroke-opacity', 0);

    	self.verticalLines = self.annotationGroups.append('line')
    		.attr('stroke', 'orange')
    		.attr('x1', 0)
    		.attr('x2', 0)
    		.attr('y1', 0)
    		.attr('y2', 0)
    		//.attr('stroke-opacity', 0);
    }

    // Update with animation
    ProportionChart.prototype.update = function() {
    	var self = this;

    	self.baseValue = self.data[self.selectedIndex].value;

    	var yOffset = 0;
    	var duration = 700;//400 + Math.sqrt(self.baseValue / self.previousBaseValue) * 40;
    	var ease = 'ease-in';
    	var isVisible = function(d,i) {
    		return i <= self.selectedIndex ? 1 : 0;
    	};
    	var labelPosition = function(d,i) {
			return self.radius + i * self.labelHeight + 10;
    	}

    	self.items.transition()
    		.duration(duration)
    		.ease(ease)
    		.attr('fill-opacity', function(d,index) {
    			return index <= self.selectedIndex ? .1 : 0;
    		})
    		.attr('r', function(d,i) { 
    			return i > self.selectedIndex ? 0 : self.getRadius( d.value );
    		});
    	self.itemGroups.transition()
    		.duration(duration)
    		.ease(ease)
    		.attr('transform', function(d,index) {
    			var radiusOffset = 0;
    			if (index < self.selectedIndex) {
    				radiusOffset = self.radius;
    				for (var i = index; i < self.selectedIndex; i++) {
    					/* 	Get the radius for the first and the last bubble and the
							diameter for the ones in between.
						*/
    					//var factor = (i == index || i == self.selectedIndex - 1) ? 1 : 2;
    					var factor = (i == index) ? 1 : 2;
    					radiusOffset -= self.getRadius( self.data[i].value ) * factor;
    				}
    			}
    			return 'translate(' + [self.width / 2 - radiusOffset, self.height /2] + ')';
    		});

    	self.annotationGroups.transition()
    		.duration(duration)
    		.ease(ease)
    		.attr('transform', function(d, i) {
    			var yOffset = labelPosition(d,i); //self.getRadius( d.value );
    			return 'translate('+ [0, yOffset] + ')';
    		});

    	self.verticalLines.transition()
    		.duration(duration)
    		.ease(ease)
    		.attr('stroke-opacity', isVisible)
    		.attr('y1', 0)
    		.attr('y2', function(d,i) { 
    			var y = - labelPosition(d,i) + self.getRadius( d.value );
    			console.log(i < self.selectedIndex ? 0 : y);
    			return i > self.selectedIndex ? 0 : y;
    		}).each('end', function() {
    			self.labels.transition()
    				.duration(200)
    				.ease(ease)
    				.attr('fill-opacity', isVisible);

    			self.ticks.transition()
    				.duration(200)
    				.ease(ease)
    				.attr('stroke-opacity', isVisible);

    			
    		});


    	



    	self.previousBaseValue = self.baseValue;
    }


    return ProportionChart;
})();

