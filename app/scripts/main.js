'use strict';

console.log('App starting...');

$('document').ready(function(){

    var template = _.template(
        $("script.template[name='board']").html()
    );

    var np = _.template(
        $("script.template[name='numberpad']").html()
    );

    for(var i = 0; i < 9; i++){
        $( template({id:i})).appendTo('.center-board');
    }

    $( np() ).appendTo('.center-board');

    function group(){
        var group = 0;
        for(var i = 0; i < 9; i+=3){
            for(var j = 0; j < 9; j+=3){
                makeGroup(i, j, 3, group);
                group++;
            }
        }

        function makeGroup(x, y, range, group){
            for(var i = y; i < y + range; i++){
                for(var j = x; j < x + range; j++){
                    $('.row'+i).find('.col'+j).addClass('group'+group).data('group', group);
                }
            }

        }
    }

    group();

    Array.prototype.binSearch = function(key, min, max){

        //sort array
        this.sort(function(a, b) {
            return a - b;
        });

        // test if array is empty
        if (min > max){
            // set is empty, so return value showing not found
            console.log('not found', key);
            return 1;
        } else {
            // calculate midpoint to cut set in half
            var mid = Math.floor((min + max) / 2);

            // three-way comparison
            if (this[mid] > key){
                // key is in lower subset
                return this.binSearch(key, min, mid - 1);
            }
            else if (this[mid] < key){
                // key is in upper subset
                return this.binSearch(key, mid+1, max);
            }
            else{
                // key has been found
                console.log('found: ', this[mid], 'at pos', mid);
                return 0;
            }
        }
    };

    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;
            }
            else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };

    function validate(q, x, y, g){

        var col = [],
            row = [],
            group = [];

        $('.col'+x).each(function(i, e){
            col.push($(e).data('value'));
        });

        $('.row'+y).find('.col').each(function(i, e){
            row.push($(e).data('value'));
        });

        $('.group'+g).each(function(i, e){
            group.push($(e).data('value'));
        });

        return col.binSearch(q, 0, col.length -1) * row.binSearch(q, 0, row.length -1) * group.binSearch(q, 0, group.length -1);

    };


    //Click events
    $('body').on('click', '.cell', function(e){
        var numberPad = $('.number-pad');
        var cell = $('.cell');
        var npMid = (numberPad.width() / 2) - (cell.width() / 2);

        if($(e.target).hasClass('active-cell')){
            $(e.target).removeClass('active-cell');
            numberPad.toggle();
        }else{

            $('.cell').each(function(i, e){
               $(e).removeClass('active-cell');
            });
            $(e.target).addClass('active-cell');

            if(numberPad.is(':visible')){
                numberPad.css({
                    'top' :  e.currentTarget.offsetTop - numberPad.height(),
                    'left': e.currentTarget.offsetLeft - npMid
                });
            }else{
                numberPad.css({
                    'top' :  e.currentTarget.offsetTop - numberPad.height(),
                    'left': e.currentTarget.offsetLeft - npMid
                });
                numberPad.toggle();
            }
        }

    });

    $('body').on('click', '.np-cell', function(e){
        var verity = validate($(this).data('value'), $('.active-cell').data('col'), $('.active-cell').closest('.row').data('row'), $('.active-cell').data('group'));
        if(verity != 0){
            $('.active-cell')
                .html($(this).data('value'))
                .removeClass('active-cell')
                .data('value', $(this).data('value'));
            $('.number-pad').toggle();
        }
    });

    var game = Sudoku.getInstance({difficulty: 'medium'});
    game.newGame();

    $('body').on('click', '.reset-board', function(e){
        console.log('reset');
        e.preventDefault();
        $('.cell').data('value', 0).html('');
        game.reset();
    });

    $('body').on('click', '.solve-board', function(e){
        e.preventDefault();
        game.solve();
    });

});


