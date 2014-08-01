/**
 * A Javascript implementation of a Sudoku game, including a
 * backtracking algorithm solver. For example usage see the
 * attached index.html demo.
 *
 */

var Sudoku = ( function ( $ ){
    var _instance, _game, conf,
        defaultConfig = {
            'validate_on_insert': true,
            'show_solver_timer': true,
            'show_recursion_counter': true,
            'solver_shuffle_numbers': true
        };

    function init( config ) {
        conf = $.extend( {}, defaultConfig, config );
        _game = new Game( conf );

        return {

            setDomModel: function() {
                _game.setDM();
            },

            reset: function() {
                _game.resetGame();
                this.newGame();
            },

            newGame: function(){

                _game.initMatrices();
                _game.setDM();
                _game.solveGame( 0, 0 );
                this.setDifficulty();

            },

            setDifficulty: function(){

                console.log('setting difficulty');

                switch(_game.config.difficulty){
                    case 'easy':
                        _game.removeCells(10); //removes mirror too 26*2 = 52 (81 - 52 == 29 clues)
                        break;
                    case 'medium':
                        _game.removeCells(11);
                        break;
                    case 'hard':
                        _game.removeCells(12);
                        break;
                    default:
                        _game.removeCells(10);
                        break;
                }
            },

            validateUniqueness: function(){

                _game.validateUniq();

            },

            validate: function() {

                var isValid = _game.validateMatrix();
                if(isValid === true){
                alert('good game!');
                    return isValid;
                }else{
                    return false;
                }
            },

            solve: function() {
                var starttime, endtime, elapsed;

                // Reset counters
                _game.recursionCounter = 0;
                _game.backtrackCounter = 0;

                // Check start time
                starttime = Date.now();

                // Solve the game
                _game.solveGame( 0, 0 );

                // Get solving end time
                endtime = Date.now();

                elapsed = endtime - starttime;

                console.log( 'Solver elapsed time: ' + elapsed + 'ms' );
                console.log( 'Solver recursions: ' + _game.recursionCounter );
                console.log( 'Solver backtracks: ' + _game.backtrackCounter );
            }

        };
    }

    function Game( config ) {
        this.config = config;

        // Initialize game parameters
        this.recursionCounter = 0;
        this.$cellMatrix = {};
        this.matrix = {};
        this.validation = {};
        this.removedCellCount = 0;
        this.completeSolution = [];
        this.validationArray = [];
        this.uniqueCounter = 0;

        return this;
    }

    Game.prototype = {

        setDM: function() {
            for( var i = 0; i < 9; i++ ) {
                for ( var j = 0; j < 9; j++ ) {
                    // Build the input
                    var col = document.getElementsByClassName('row')[i].getElementsByClassName('col')[j];
                    //console.log($(col));
                    this.$cellMatrix.row[i][j] = $(col);
                }
            }
            console.log(this.$cellMatrix.row);
            return true
        },

        onKeyUp: function( e ) {
            var sectRow, sectCol, secIndex,
                starttime, endtime, elapsed,
                isValid = true;

            // Calculate section identifiers
            sectRow = Math.floor( row / 3 );
            sectCol = Math.floor( col / 3 );
            secIndex = ( row % 3 ) * 3 + ( col % 3 );

            // Cache value in matrix
            this.matrix.row[row][col] = val;
            this.matrix.col[col][row] = val;
            this.matrix.sect[sectRow][sectCol][secIndex] = val;
        },

        resetGame: function() {
            this.initMatrices();
            this.removedCellCount = 0;
            this.completeSolution = [];
        },

        initMatrices: function() {

            console.log('init matrices');
            this.matrix = { 'row': {}, 'col': {}, 'sect': {} };
            this.validation = { 'row': {}, 'col': {}, 'sect': {} };
            this.$cellMatrix = { 'row': {}, 'col': {}, 'sect': {} };


            // Build the row/col matrix and validation arrays
            for ( var i = 0; i < 9; i++ ) {
                this.matrix.row[i] = [ '', '', '', '', '', '', '', '', '' ];
                this.matrix.col[i] = [ '', '', '', '', '', '', '', '', '' ];
                this.validation.row[i] = [];
                this.validation.col[i] = [];
                this.$cellMatrix.row[i] = [];
                this.$cellMatrix.col[i] = [];
            }

            // Build the section matrix and validation arrays
            for ( var row = 0; row < 3; row++ ) {
                this.matrix.sect[row] = [];
                this.validation.sect[row] = [];
                this.$cellMatrix.sect[row] = [];
                for ( var col = 0; col < 3; col++ ) {
                    this.matrix.sect[row][col] = [ '', '', '', '', '', '', '', '', '' ];
                    this.validation.sect[row][col] = [];
                    this.$cellMatrix.sect[row][col] = [];
                }
            }

            console.log('matrices', this.matrix, this.validation, this.$cellMatrix);

        },

        solveGame: function( row, col ) {
            var cval, sqRow, sqCol, nextSquare, legalValues,
                sectRow, sectCol, secIndex;

            this.recursionCounter++;

            nextSquare = this.findClosestEmptySquare( row, col );

            if ( !nextSquare ) {
                // End of board
                return true;
            } else {

                sqRow = nextSquare.y;
                sqCol = nextSquare.x;
                legalValues = this.findLegalValuesForSquare( sqRow, sqCol );

                // Find the segment id
                sectRow = Math.floor( sqRow / 3 );
                sectCol = Math.floor( sqCol / 3 );
                secIndex = ( sqRow % 3 ) * 3 + ( sqCol % 3 );

                // Try out legal values for this cell
                for ( var i = 0; i < legalValues.length; i++ ) {
                    cval = legalValues[i];

                    // Update in matrices
                    this.matrix.row[sqRow][sqCol] = cval;
                    this.matrix.col[sqCol][sqRow] = cval;
                    this.matrix.sect[sectRow][sectCol][secIndex] = cval;
                    this.$cellMatrix.row[sqRow][sqCol].data( 'value', cval).html(cval);

                    //update complete solution
                    this.completeSolution.push(cval);

                    // Recursively keep trying
                    if ( this.solveGame( sqRow, sqCol ) ) {
                        return true;
                    } else {
                        // There was a problem, we should backtrack
                        this.backtrackCounter++;

                        // Remove value from matrices
                        this.matrix.row[sqRow][sqCol] = '';
                        this.matrix.col[sqCol][sqRow] = '';
                        this.matrix.sect[sectRow][sectCol][secIndex] = '';
                        this.$cellMatrix.row[sqRow][sqCol].data('value', 0).html('');

                        this.completeSolution.pop(cval);
                    }
                }
                // If there was no success with any of the legal
                // numbers, call backtrack recursively backwards

                return false;
            }
        },

        validateUniq: function(){

            console.log('validating uniqueness');

            //Validate solution
            for(i = 0; i < 14; i++){

                this.uniqueCounter = i;
                this.validation = {};
                console.log('this.validation',this.validation);
                this.validation = $.extend({}, this.matrix);
                console.log('this.validation',this.validation);

                this.validateSolution( 0,0 );

            }

            return true;
        },
        
        validateSolution: function( row, col ) {
            var cval, sqRow, sqCol, nextSquare, legalValues,
                sectRow, sectCol, secIndex;

            var prevArray = this.validationArray.slice();

            nextSquare = this.findClosestEmptySquare( row, col );
//            console.log('solveGame row, col, nextSquare', row, col, nextSquare);

            if ( !nextSquare ) {
                // Filled or end of board
                return true;

            } else {

                sqRow = nextSquare.y;
                sqCol = nextSquare.x;
                legalValues = this.findLegalValuesForSquare( sqRow, sqCol );

                // Find the segment id
                sectRow = Math.floor( sqRow / 3 );
                sectCol = Math.floor( sqCol / 3 );
                secIndex = ( sqRow % 3 ) * 3 + ( sqCol % 3 );

                // Try out legal values for this cell
                for ( var i = 0; i < legalValues.length; i++ ) {
                    cval = legalValues[i];

                    // Update in matrices
                    this.validation.row[sqRow][sqCol] = cval;
                    this.validation.col[sqCol][sqRow] = cval;
                    this.validation.sect[sectRow][sectCol][secIndex] = cval;

                    //update complete solution
                    this.validationArray.push(cval);

                    var currentArray = this.validationArray.slice();
                    console.log('prevArray', prevArray, 'currentArray', currentArray);
                    console.log('uniqueCounter', this.uniqueCounter);
                    if(!currentArray.equals(prevArray) && this.uniqueCounter > 1){
                        console.log('validation arrays are not equal');
                        debugger;
                    }

                    // Recursively keep trying
                    if ( this.validateSolution( sqRow, sqCol ) ) {
                        return true;
                    } else {
                        // There was a problem, we should backtrack
                        this.backtrackCounter++;

                        // Remove value from matrices
                        this.validation.row[sqRow][sqCol] = '';
                        this.validation.col[sqCol][sqRow] = '';
                        this.validation.sect[sectRow][sectCol][secIndex] = '';

                        this.completeSolution.pop(cval);
                    }
                }
                // If there was no success with any of the legal
                // numbers, call backtrack recursively backwards
                return false;

            }
        },

        findClosestEmptySquare: function( row, col ) {

            var walkingRow, walkingCol;
            for ( var i = ( col + 9*row ); i < 81; i++ ) {
                walkingRow = Math.floor( i / 9 );
                walkingCol = i % 9;
                if ( this.matrix.row[walkingRow][walkingCol] === '' ) {
                    return {y: walkingRow, x: walkingCol};
                }
            }
        },

        findLegalValuesForSquare: function( row, col ) {
            var legalNums, val, i, sectRow, sectCol;

            legalNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            //console.log('the matrix', this.matrix);
//            if(typeof this.matrix.row[row][i] !=

            // Check existing numbers in col
            for ( i = 0; i < 9; i++ ) {
                val = Number( this.matrix.col[col][i] );
                if ( val > 0 ) {
                    // Remove from array
                    if ( legalNums.indexOf( val ) > -1 ) {
                        legalNums.splice( legalNums.indexOf( val ), 1 );
                    }
                }
            }

            // Check existing numbers in row
            for ( i = 0; i < 9; i++ ) {
                val = Number( this.matrix.row[row][i] );
                if ( val > 0 ) {
                    // Remove from array
                    if ( legalNums.indexOf( val ) > -1 ) {
                        legalNums.splice( legalNums.indexOf( val ), 1 );
                    }
                }
            }

            // Check existing numbers in section
            sectRow = Math.floor( row / 3 );
            sectCol = Math.floor( col / 3 );
            for ( i = 0; i < 9; i++ ) {
                val = Number( this.matrix.sect[sectRow][sectCol][i] );
                if ( val > 0 ) {
                    // Remove from array
                    if ( legalNums.indexOf( val ) > -1 ) {
                        legalNums.splice( legalNums.indexOf( val ), 1 );
                    }
                }
            }

            if ( this.config.solver_shuffle_numbers ) {
                // Shuffling the resulting 'legalNums' array will
                // make sure the solver produces different answers
                // for the same scenario. Otherwise, 'legalNums'
                // will be chosen in sequence.
                for ( i = legalNums.length - 1; i > 0; i-- ) {
                    var rand = getRandomInt( 0, i );
                    temp = legalNums[i];
                    legalNums[i] = legalNums[rand];
                    legalNums[rand] = temp;
                }
            }

            return legalNums;
        },

        removeCells: function(amt){

            while (this.removedCellCount < amt) {
                    remove(this);
            }

            function remove(s){

                var sectRow, sectCol, sectIndex, sectRowOpp, sectColOpp, sectIndexOpp;
                var self = s;
                var y = getRandomInt(0, 8);
                var x = getRandomInt(0, 8);
                var o = getMirrorCell(y,x);
                var val = self.matrix.row[y][x];
                if( val === '' ){
                    return false;
                }

                if(self.removedCellCount > 10){

                    //Start checking removals
                    var cellsThere = self.minCellsAreThere();
                    var legalValues = self.findLegalValuesForSquare( y, x );

                    //self.validateUniq();

                    if( !cellsThere || legalValues.length > 1 ){
                        return false;
                    }
                }

                self.matrix.row[y][x] = '';
                self.matrix.col[x][y] = '';

                self.matrix.row[o.y][o.x] = '';
                self.matrix.col[o.x][o.y] = '';

                // Section
                sectRow = Math.floor( y / 3 );
                sectCol = Math.floor( x / 3 );
                sectIndex = ( y % 3 ) * 3 + ( x % 3 );

                self.matrix.sect[sectRow][sectCol][sectIndex] = '';

                //and its opposite
                sectRowOpp = Math.floor(o.y / 3 ),
                sectColOpp = Math.floor(o.x / 3 );
                sectIndexOpp = ( o.y % 3 ) * 3 + ( o.x % 3 );

                self.matrix.sect[sectRowOpp][sectColOpp][sectIndexOpp] = '';

                //remove data from view
                self.$cellMatrix.row[y][x].data('value', 0).html('');
                self.$cellMatrix.row[o.y][o.x].data('value', 0).html('');


                //increment and next
                self.removedCellCount++;
                return true;

            }
            console.log('removedCellCount', this.removedCellCount * 2);
        },

        minCellsAreThere: function(){

            var count = 0;
            for(row = 0; row < 9; row++){
                for(col = 0; col < 9; col++){
                    var seen = 0;
                    if(this.matrix.row[row][col] === 1||2||3||4||5||6||7||8 && seen === 0){
                        seen = 1;
                        count++;
                        if(count === 8){
                            return true;
                        }
                    }
                }
            }


            return false;
        }
    };

    function getRandomInt(min, max) {
        return Math.floor( Math.random() * ( max + 1 ) ) + min;
    }

    function getMirrorCell(row, col){
        return {y:(row-8)*-1, x:(col-8)*-1}
    }

    return {
        getInstance: function( config ) {
            if ( !_instance ) {
                _instance = init( config );
            }
            return _instance;
        }
    };

} )( jQuery );