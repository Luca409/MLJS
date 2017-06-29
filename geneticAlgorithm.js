// chromosome class
var Chromosome = function(code) {
    if (code) this.code = code;
    this.cost = 9999;
};

Chromosome.prototype.code = '';

// generate a random string
Chromosome.prototype.random = function(length) {
    while (length--) {
        this.code += String.fromCharCode(Math.floor(Math.random() * 255));
    }
};

// mutate chromosome slightly
Chromosome.prototype.mutate = function(chance) {
    // might not mutate at all
    if (Math.random() > chance) return;

    // index of character to be mutated
    var index = Math.floor(Math.random() * this.code.length);
    // whether the ascii value will increase or decrease; 50/50 chance
    var direction = Math.random() <= 0.5 ? -1 : 1;

    var scaled_direction = direction * Math.floor(Math.log10(this.cost));    

    scaled_direction = Math.abs(scaled_direction) < 1 ? direction : scaled_direction;

    // change that index by 1
    var next_char = String.fromCharCode(this.code.charCodeAt(index) + scaled_direction);
    var next_string = '';
    // create next_string from old string and char code
    for (i = 0; i < this.code.length; i++) {
        if (i == index) next_string += next_char;
        else next_string += this.code[i];
    }

    this.code = next_string;

};

// mate this chromosome with another input chromosome; this is done by switching up two randomly selected subsections
Chromosome.prototype.mate = function(chromosome) {
    var pivot = Math.round(this.code.length / 2) - 1;

    var child = this.code.substr(0, pivot) + chromosome.code.substr(pivot);
    var child2 = chromosome.code.substr(0, pivot) + this.code.substr(pivot);

    return [new Chromosome(child), new Chromosome(child2)];
};

// calculate how far the chromosome is from the desired string; ascii distance of each character
Chromosome.prototype.calcCost = function(compareTo) {
    var total = 0;
    for (i = 0; i < this.code.length; i++) {
        total += Math.abs(this.code.charCodeAt(i) - compareTo.charCodeAt(i));
    }
    this.cost = total;
};

// population class constructor
var Population = function(goal, size) {
    this.members = [];
    this.goal = goal;
    this.generationNumber = 0;
    while (size--) {
        var chromosome = new Chromosome();
        chromosome.random(this.goal.length);
        this.members.push(chromosome);
    }
};

// display in html
Population.prototype.display = function() {

    var population_display = document.getElementById("population");

    population_display.innerHTML = '';
    population_display.innerHTML += ("Generation: " + this.generationNumber);
    population_display.innerHTML += ("<ul>");
    for (var i = 0; i < this.members.length; i++) {
        population_display.innerHTML += ("<li>" + this.members[i].code + " (" + this.members[i].cost + ")");
    }
    population_display.innerHTML += ("</ul>");
};

// sort population by cost
Population.prototype.sort = function() {
    this.members.sort(function(a, b) {
        return a.cost - b.cost;
    });
}

Population.prototype.generation = function() {
    for (var i = 0; i < this.members.length; i++) {
        this.members[i].calcCost(this.goal);
    }

    this.sort();
    this.display();
    // mate and add to population
    var children = this.members[0].mate(this.members[1]);
    this.members.splice(this.members.length - 2, 2, children[0], children[1]);
    var children2 = this.members[2].mate(this.members[3]);
    this.members.splice(this.members.length - 4, 2, children2[0], children2[1]);

    for (var i = 0; i < this.members.length; i++) {

        this.members[i].mutate(0.5);

        this.members[i].calcCost(this.goal);

        if (this.members[i].code == this.goal) {
            this.sort();
            this.display();
            return true;
        }
    }
    this.generationNumber++;
    var scope = this;
    setTimeout(function() {
        scope.generation();
    }, 30);
};

var evolve = function() {
    var name_field = document.getElementById("name");
    var name = name_field.value;

    if(name.length > 20) {
        var population_display = document.getElementById("population");
        population_display.innerHTML = "Sorry, if you enter a string longer than ";
        population_display.innerHTML += " 20 characters you might be here until tomorrow! Try "
        population_display.innerHTML += " entering something shorter.";

        document.getElementById("explanation").innerHTML = "";
        return;
    }

    var population = new Population(name, 20);
    population.generation();

    document.getElementById("explanation").innerHTML = "Though simply learning to " + 
    " spell an already given string is not very useful, this JavaScript implementation " + 
    " gives a good analogy for how a genetic algorithm works. The program begins by " + 
    "filling a 'population' of strings, which are the same length as the goal, with " + 
    " random characters. Each 'chromosome' in the population is then given a cost " + 
    " score based on how far in accuracy it is from the goal. Over generations, chromosomes " + 
    " 'mutate' by altering a strings characters up or down random small ascii value " + 
    " intervals, and the highest scoring chromosomes 'mate' by combining their substrings " + 
    " at some arbitrary mid point. Industry applications of genetic algorithms " + 
    " include robotic movement, routing optimization, and artificial creativity.";
}

document.getElementById("submit_button").onclick = evolve;