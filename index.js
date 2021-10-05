
// extract the properties needed for the Matter object
const  { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// creat a new engine instance 
const engine = Engine.create();
// disable gravity
engine.world.gravity.y=0;
// get the world that got created with the engine
const { world } = engine;


// global vars
const cellsHorizontal = 12;
const cellsVertical = 9;

// declaring the width and height of the canvass window
const width = window.innerWidth;
const height = window.innerHeight;
// declaring the width and height of the canvass cell
const unitLengthX = width / cellsHorizontal;  
const unitLengthY = height / cellsVertical;  

// creat a render obj
const render = Render.create({
   // tell the render which to show the representation inside the html
   element: document.body,
   // choose which engine to use
   engine: engine,
   // pass the customized options
   options:  {
      width,
      height,
      wireframes: false
   }
});

// draw the updates of world on the screen
Render.run(render);
Runner.run(Runner.create(), engine);



// walls
const walls = [
   // make 4 recs => x(centre), y(centre), width, height, {body status}
   Bodies.rectangle(width/2, 0   ,width, 2 , { isStatic: true})  ,
   Bodies.rectangle(width/2, height ,width, 2 , { isStatic: true})  ,
   Bodies.rectangle(0      , height/2 ,2 , height, { isStatic: true})  ,
   Bodies.rectangle(width, height/2 ,2 , height, { isStatic: true})
];
World.add(world, walls);

// maze generation

// shuffle an array
const shuffle = arr => {
   let counter = arr.length;

   while(counter > 0){
      const index = Math.floor(Math.random() * counter);
      counter --;
      
      const temp = arr[counter];
      arr[counter] = arr[index];
      arr[index] = temp;
   }
   return arr;
};



// make array of n(cells) arrays with false value
const grid= Array(cellsVertical).fill(null)
.map( () => Array(cellsHorizontal).fill(false));


// make two arrays for vertical and horizontal walls with false value
const verticals = Array(cellsVertical).fill(null)
.map( () => Array(cellsHorizontal-1).fill(false));

const horizontals = Array(cellsVertical-1).fill(null)
.map( () => Array(cellsHorizontal).fill(false));

// select the starting cell

const startRow = Math.floor(Math.random()* cellsVertical);
const startColumn = Math.floor(Math.random()* cellsHorizontal);


// visit a cell to generate the maze
const stepThroughCell = (row, column) =>{
   // check if the cell is visited or not, if so return
   if(grid[row][column]){  return;}
   // mark this cell as visited
   grid[row][column] = true;
   // assemble randomly-ordered list of neighbors
   const neighbors = shuffle([
      [row -1 , column, 'up'],
      [row , column + 1, 'right'],
      [row +1 , column, 'down'],
      [row  , column -1, 'left']
   ]);

   // for each neighbor...
   for(let neighbor of neighbors ){
      const [ nextRow, nextColumn, direction] =neighbor;

      // check if that neighbor is out of the boundaries
      if(nextRow <0 || nextRow >= cellsVertical ||nextColumn <0 || nextColumn >= cellsHorizontal){
         // go check another neighbor
         continue;
      }
      // if this neighbor is visited 
      if(grid[nextRow][nextColumn]){
          // if true go check another neighbor
         continue;
      }
      // remove the wall from either the horizontals or verticals arrays
      if(direction === 'left' || direction === 'right'){
         if(direction === 'left'){
            verticals[row][column-1] = true;
         }else{
            //right
            verticals[row][column] = true;
         }
      }
      //this means it's either up or down
      else{
         if(direction === 'up'){
            horizontals[row-1][column] = true;
         }else{
            // down
            horizontals[row][column] = true;
         }
      }
      stepThroughCell(nextRow,nextColumn);
   }

   // visit that next cell 

};


// call the maze creator function with the start cell
stepThroughCell(startRow,startColumn);


// loop over horizontals to create walls
horizontals.forEach((row, rowIndex) =>{
   // check if that cell is true(don't draw) or false(draw)
   row.forEach((column, columnIndex) =>{
      if(column === true){
         // keep it open and go to the next cell
         return;
      }else{
         // create a horizontal line at this cell
         const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX/2, // X
            rowIndex * unitLengthY + unitLengthY,     // Y
            unitLengthX,                            // width
            5,                                    // height
            {
               label: 'wall',
               friction: 0,
               isStatic: true,
               render: {
                  fillStyle: 'orange'
               }
            }
         );
         // add the horizontal line (wall) to the world
         World.add( world, wall);

      }

   })
});



// loop over verticals to create walls
verticals.forEach((row, rowIndex)=>{
   row.forEach((column, columnIndex) =>{
      if(column === true){
         // keep it open and go to the next cell
         return;
      }else{
         // create a vertical line at this cell
         const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX, // X
            rowIndex * unitLengthY + unitLengthY/2, // Y
            5,                                    // width
            unitLengthY,                           // height
            {
               label: 'wall',
               friction: 0,
               isStatic: true,
               render: {
                  fillStyle: 'orange'
               }
            }
         );
         // add the horizontal line (wall) to the world
         World.add( world, wall);

      }
   });

});

// create the goal at the end of the maze
const goal =Bodies.rectangle(
   width - unitLengthX/2 ,// X
   height - unitLengthY/2,   // Y
   unitLengthX* .7,                               // width
   unitLengthY* .7,                               // height
   {
      isStatic: true,
      label: 'goal',
      render:{
         fillStyle: 'green'
      }
   }
         );
World.add(world, goal);

const ballRadius = Math.min(unitLengthX,unitLengthY) / 4;
const ball = Bodies.circle(
   unitLengthX/2 ,      // X
   unitLengthY/2,       // Y
   ballRadius,        // radius
   {
      label: 'ball',
      render:{
         fillStyle: 'red'
      }
   }
   );
World.add(world, ball);


// detect any key press by the user
document.addEventListener('keydown',event =>{
   // grab the X, Y velocity
   const {x, y} = ball.velocity;

   
   if(event.code === 'KeyW' || event.code === 'ArrowUp'){
      Body.setVelocity(ball,{x, y: y-5});
   }
   if(event.code === 'KeyA' || event.code === 'ArrowLeft'){
      Body.setVelocity(ball,{x: x-5, y});
   }
   if(event.code === 'KeyS' || event.code === 'ArrowDown'){
      Body.setVelocity(ball,{x, y: y+5});
   }
   if(event.code === 'KeyD' || event.code === 'ArrowRight'){
      Body.setVelocity(ball,{x: x+5, y}); 
   }
});



// Win condition
// add event when ball hits the goal
Events.on(engine, 'collisionStart', event => {
   // check every collision
   event.pairs.forEach((collision)=>{
      // to avoid not knowing bodyA and bodyB is the goal or the ball
      const labels =['ball', 'goal'];

      if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
         document.querySelector('.winner').classList.remove('hidden');
         document.querySelector('.winner2').classList.remove('hidden');
         world.gravity.y = 0.25;
         // make the walls fall upon winning
         world.bodies.forEach(body => {
            if(body.label === 'wall'){
               Body.setStatic(body, false);
            }
         })
      }
   });
});

// reset the velocity after every click 
document.addEventListener('keyup', () =>{
   const {x, y} = ball.velocity;
   Body.setVelocity(ball, {x:0,y:0} )
});

function refreshPage(){
   window.location.reload();
} 
