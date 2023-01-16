// Discrete convolution of functions f and g
var convolute = function(f, g) {
	
	// Initialize result function
	var result = {
		domain: [false,false],
		values: {},
		max: 0,
	};
	
	// Calculate the non-trivial domain for the summation
	var gSpan = Math.max(Math.abs(g.domain[0]), Math.abs(g.domain[1]));
	var from = f.domain[0] - gSpan;
	var to = f.domain[1] + gSpan;
	
	// Calculate values for all integers in the non-trivial domain
	for(var i=from; i<=to; i++) {
		
		// Perform the convolution (f and g are 0 outside the non-trivial domain)
		var sum = 0;
		for(var j=from; j<=to; j++) {
			var fVal = f.values[j] || 0;
			var gVal = g.values[i-j] || 0;
			sum+= fVal*gVal;
		}
		
		// Store the value, update maximum and domain of the new function
		if(sum == 0) continue;
		result.values[i] = sum;
		if(sum > result.max) result.max = sum;
		if(result.domain[0] === false || i < result.domain[0]) result.domain[0] = i;
		if(result.domain[1] === false || i > result.domain[1]) result.domain[1] = i;
	}
	return result;
}

// Delayed function for setting the bar height
var setHeight = function(element, height) {
	element.style.height = height+'%';
}

// Utility function for creating a scale tick
var makeTick = function(value) {
	var tick = document.createElement('div');
	tick.className = 'tick';
	tick.dataset.value = value;
	return tick;
}

// Utility function to display a value in [0,1] as percentage with two decimals
var toPercent = function(value) {
	return Math.round(value*10000)/100+'%';
}

// Assemble the bar chart
var visualize = function(f) {
	
	// Clear the chart
	var chart = document.getElementById('chart');
	chart.innerHTML = '';
	
	// Append bars to chart
	for(var i=f.domain[0]; i<=f.domain[1]; i++) {
		var bar = document.createElement('div');
		bar.title = i+' ('+toPercent(f.values[i])+')';
		chart.appendChild(bar);
		window.setTimeout(setHeight, 1, bar, f.values[i]*100/f.max);
	}
	
	// Draw the vertical scale
	var vScale = document.getElementById('scale-vertical');
	vScale.innerHTML = '';
	for(var i=8; i>=0; i--) vScale.appendChild(makeTick(toPercent(f.max*i/8)));
	
	// Draw the horizontal scale
	var hScale = document.getElementById('scale-horizontal');
	hScale.innerHTML = '';
	var span = f.domain[1] - f.domain[0];
	var modulo = Math.floor(span/3) || 1;
	while(span % modulo > 0) modulo--;
	for(var i=0; i<=modulo; i++) hScale.appendChild(makeTick(f.domain[0] + i*span/modulo));
}

// Find control inputs
var convolutionCount = document.getElementById('convolution-count');
var facesStart = document.getElementById('faces-start');
var facesCount = document.getElementById('faces-count');

// Main drawing function
var compute = function() {
	
	// Setup the base probability distribution density function
	var base = {
		domain: [parseInt(facesStart.value), parseInt(facesStart.value)+parseInt(facesCount.value)-1],
		values: {}
	}
	
	// Set equal values (Laplace probabilty)
	var span = base.domain[1] - base.domain[0] + 1;
	base.max = 1/span;
	for(var i=base.domain[0]; i<=base.domain[1]; i++) base.values[i] = base.max;
	
	// Perform the convolution and visualize the result
	var result = base;
	for(var i=1; i<convolutionCount.value; i++) result = convolute(result, base);
	visualize(result);
}

// Register event listeners and initially call drawing function
convolutionCount.addEventListener('input', compute);
facesStart.addEventListener('input', compute);
facesCount.addEventListener('input', compute);
compute();
