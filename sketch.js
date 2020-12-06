var dog, happyDog, dogImg, happyDogImg;
var database, foodS ,foodStock;
var fedTime, lastFed;
var button1, button2;
var foodObj;
var bedroom, garden, washroom;

function preload()
{
  dogImg = loadImage("dogImg.png");
  happyDogImg = loadImage("dogImg1.png");

  bedroom = loadImage("Bed Room.png");
  garden = loadImage("Garden.png");
  washroom = loadImage("Wash Room.png");
  sadDog = loadImage("Dog.png");
}

function setup() {
   
  canvas = createCanvas(700, 500);
  database = firebase.database(); 

  readState = database.ref('gameState');
  readState.on("value", function(data){
    gameState = data.val();
  });
  
  food = new Food();

  dog = createSprite(550,250,10,10);
  dog.addImage(dogImg);
  dog.scale = 0.35;

  foodStock = database.ref('Food');
  foodStock.on("value",readStock);
  
  fedTime = database.ref('FeedTime');
  fedTime.on("value", function(data){
  lastFed = data.val();
  });  
  
  feed = createButton("Feed the dog");
  feed.position(500,55);
  feed.mousePressed(feedDog);

  addFood = createButton("Add Food");
  addFood.position(400,55);
  addFood.mousePressed(addFoods);
}


function draw() {  
  background(46,139,87);
  fill(255,255,254);
  textSize(15);

  if (lastFed>=12){
    text("Last Feed : "+ lastFed%12 + " PM", 350,30);
  }else if(lastFed==0){
    text("Last Feed : 12 AM",350,30);
  }else{
    text("Last Feed : "+ lastFed + "AM",350,30);
  }

  //food.display(); 

  currentTime = hour();
  if (currentTime==(lastFed+1)){
    update("Playing");
    food.garden();
  } else if(currentTime==(lastFed+2)){
    update("Sleeping");
    food.bedroom();
  }else if(currentTime>(lastFed+2)&& currentTime<=(lastFed+4)){
    update("Bathing");
    food.washroom();
  }else{
    update("Hungry");
    food.display();
  }
    
  if(gameState!= "Hungry"){
    feed.hide();
    addFood.hide();
    dog.remove();
  } else{
    feed.show();
    addFood.show();
    dog.addImage(happyDogImg);
  }

  drawSprites();
  
}

function readStock(data){
   foodS = data.val();
   food.updateFoodStock(foodS);
}

function writeStock(x){
  if(x > 0){
    x = x-1;
  }else{
    x = 0;
  }
  
  database.ref('/').set({
    'Food': x
  })
}

function feedDog(){
  dog.addImage(happyDogImg);

  food.updateFoodStock(food.getFoodStock()-1);
  database.ref('/').update({
    Food: food.getFoodStock(),
    FeedTime: hour(),
    gameState: "Hungry"
  })
}

function addFoods(){
  foodS++;
  database.ref('/').update({
    Food: foodS
  })
}

function update(state){
  database.ref('/').update({
    gameState: state
  });
}