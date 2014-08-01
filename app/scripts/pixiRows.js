

// first tile picked up by the player
var firstTile=null;
// second tile picked up by the player
var secondTile=null;
// can the player pick up a tile?
var canPick=true;
// create an new instance of a pixi stage with a grey background
var stage = new PIXI.Stage(0x888888);
// create a renderer instance width=640 height=480
var renderer = PIXI.autoDetectRenderer(640,480);
// importing a texture atlas created with texturepacker
var tileAtlas = ['images.json'];


// create a new loader
var loader = new PIXI.AssetLoader(tileAtlas);
// create an empty container
var gameContainer = new PIXI.DisplayObjectContainer();
// add the container to the stage
stage.addChild(gameContainer);
// add the renderer view element to the DOM
document.body.appendChild(renderer.view);
// use callback



function animate() {
    requestAnimFrame(animate);
    renderer.render(stage);
}

function onTilesLoaded(){
    // choose 24 random tile images
    var chosenTiles = [];
    while(chosenTiles.length<48){
        var candidate=Math.floor(Math.random()*44);
        if(chosenTiles.indexOf(candidate)===-1){
            chosenTiles.push(candidate,candidate);
        }
    }
    // shuffle the chosen tiles
    for(var i=0;i<96;i++){
        var from = Math.floor(Math.random()*48);
        var to = Math.floor(Math.random()*48);
        var tmp = chosenTiles[from];
        chosenTiles[from]=chosenTiles[to];
        chosenTiles[to]=tmp;
    }
    // place down tiles
    for(i=0;i<8;i++){
        for(j=0;j<6;j++){
            // new sprite
            var tile = PIXI.Sprite.fromFrame(chosenTiles[i*6+j]);
            // buttonmode+interactive = acts like a button
            tile.buttonMode=true;
            tile.interactive = true;
            // is the tile selected?
            tile.isSelected=false;
            // set a tile value
            tile.theVal=chosenTiles[i*6+j];
            // place the tile
            tile.position.x = 7+i*80;
            tile.position.y = 7+  j*80;
            // paint tile black
            tile.tint = 0x000000;
            // set it a bit transparent (it will look grey)
            tile.alpha=0.5;
            // add the tile
            gameContainer.addChild(tile);
            // mouse-touch listener
            tile.mousedown = tile.touchstart = function(data){
                // can I pick a tile?
                if(canPick) {
                    // is the tile already selected?
                    if(!this.isSelected){
                        // set the tile to selected
                        this.isSelected = true;
                        // show the tile
                        this.tint = 0xffffff;
                        this.alpha = 1;
                        // is it the first tile we uncover?
                        if(firstTile===null){
                            firstTile=this;
                        }


                        // this is the second tile
                        else{
                            secondTile=this;
                            // can't pick anymore
                            canPick=false;
                            // did we pick the same tiles?
                            if(firstTile.theVal===secondTile.theVal){
                                // wait a second then remove the tiles and make the player able to pick again
                                setTimeout(function(){
                                    gameContainer.removeChild(firstTile);
                                    gameContainer.removeChild(secondTile);
                                    firstTile=null;
                                    secondTile=null;
                                    canPick=true;
                                },1000);
                            }
                            // we picked different tiles
                            else{
                                // wait a second then cover the tiles and make the player able to pick again
                                setTimeout(function(){
                                    firstTile.isSelected=false;
                                    secondTile.isSelected=false;
                                    firstTile.tint = 0x000000;
                                    secondTile.tint = 0x000000;
                                    firstTile.alpha=0.5;
                                    secondTile.alpha=0.5;
                                    firstTile=null;
                                    secondTile=null;
                                    canPick=true;
                                },1000);
                            }
                        }
                    }
                }
            }
        }
    }
    requestAnimFrame(animate);
}



loader.onComplete = onTilesLoaded;
//begin load
loader.load();