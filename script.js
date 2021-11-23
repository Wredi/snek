const canvas = document.querySelector('canvas');

class Cell{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

let snek = {
    cell_width: 10,
    cell_height: 10,
    points: 0,
    food: {x: 0, y: 0},
    cells: [],
    head: {
        x: 0,
        y: 0,
        dir: {
            x: 0,
            y: 0,
        },
        setDir: function(dirx, diry){
            this.dir.x = dirx;
            this.dir.y = diry;
        }
    },
    
    collide: function(){
        let head_pos = {x: this.head.x + this.head.dir.x * 10, y: this.head.y + this.head.dir.y * 10};
        let b = false;
        this.cells.forEach(i => {
            if(head_pos.x == i.x && head_pos.y == i.y){
                b = true;
            }
        });
        if(head_pos.x >= canvas.width || head_pos.x < 0 || head_pos.y >= canvas.height || head_pos.y < 0) b = true;
        return b;
    },

    gen_food: function(){
        let maxx = canvas.width / this.cell_width;
        let maxy = canvas.height / this.cell_height;

        let is_overlapping = false;
        do{
            this.food.x = getRand(0, maxx) * 10;
            this.food.y = getRand(0, maxy) * 10;
            is_overlapping = this.is_eating();
            this.cells.forEach(i => {
                if(this.food.x == i.x && this.food.y == i.y) is_overlapping = true;
            });
        }while(is_overlapping);
    },

    is_eating: function(){
        if(this.head.x + snek.head.dir.x * 10 == this.food.x && this.head.y + snek.head.dir.y * 10 == this.food.y) return true;
        return false;
    }
};
let old = null;

function getRand(min, max){
    return Math.floor(Math.random() * (max - min) + min);
};

let currKey = null;
let fps = 0;
(function main()
{
	let choice = Number(prompt("Select difficulty level (easy - 1, normal - 2, hard - 3): "));
	switch(choice){
		case 1:
			fps = 10;
			break;
		case 2:
		default:
			fps = 15;
			break;
		case 3:
			fps = 30;
			break;
	}
	
    let ctx;
    if(canvas.getContext('2d')){
        ctx = canvas.getContext('2d');
    }else{
        ctx = null;
        alert("Can't initialize canvas context");
    }

    document.addEventListener('keydown', (e) => {
        currKey = e.key;
    });

    snek.gen_food();
    requestAnimationFrame((time) => {frame(ctx, time);});
}())

let last = 0;
function frame(ctx, time){
    let isColliding = false;
    if(time > last + (1000/fps)){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        isColliding = controls();
        graphics(ctx, isColliding);

        last = time;
    }
    if(!isColliding) requestAnimationFrame((time) => {frame(ctx, time);});
}

function graphics(ctx, isColliding)
{
    let to_draw = isColliding ? old : snek.cells;

    ctx.fillStyle = 'rgb(0, 255, 0)';
    ctx.fillRect(snek.food.x, snek.food.y, snek.cell_width, snek.cell_height);

    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(snek.head.x, snek.head.y, snek.cell_width, snek.cell_height);
    to_draw.forEach(i => ctx.fillRect(i.x, i.y, snek.cell_width, snek.cell_height));

    document.getElementById("points").innerHTML = isColliding ? "You Lost!" : snek.points;
}

function controls()
{
	let dir = {x: 0, y: 0};
    switch(currKey){
        case 'ArrowUp': case 'w': dir = {x: 0, y: -1}; break;
        case 'ArrowDown': case 's': dir = {x: 0, y: 1}; break;
        case 'ArrowRight': case 'd': dir = {x: 1, y: 0}; break;
        case 'ArrowLeft': case 'a': dir = {x: -1, y: 0}; break;
    }
	if(!(snek.head.dir.x == -dir.x) || !(snek.head.dir.y == -dir.y)){
		snek.head.setDir(dir.x, dir.y);
	}
	
    if(snek.is_eating()){
        snek.cells.push(new Cell(0, 0));
    }

    old = JSON.parse(JSON.stringify(snek.cells));
    if(snek.cells.length > 0){
        for(let i = snek.cells.length - 1; i > 0; --i){
            snek.cells[i].x = snek.cells[i - 1].x;
            snek.cells[i].y = snek.cells[i - 1].y;
        }
        snek.cells[0].x = snek.head.x; 
        snek.cells[0].y = snek.head.y; 
    }
	
	if(snek.is_eating()){
		snek.gen_food();
		++snek.points;
	}
    
    let isColliding = snek.collide();
    if(!isColliding){
        snek.head.x += snek.head.dir.x * 10;
        snek.head.y += snek.head.dir.y * 10;
    }
    
    return isColliding;
}