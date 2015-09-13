//<![CDATA[ 
$(window).scroll(function(){
        $("#floatbar").css({position:'fixed',left:'0',top:'0',width:'100%'});
});
//]]> 
var quote_data = null;
var markov_starter = {};
var markov_data = {};
var inv_m = true;

var max_iters = 100;

var word_valid = "[a-zA-Z0-9]";

var makeMarkovData = function (){
    for (quote in quote_data){
        var quote_table = quote.split(" ");
        var last_word = null;
        var ended_sentence = false;
        for (word_index in quote_table){
            word = quote_table[word_index].toLowerCase();
            var last_char = word[word.length-1];
            if (!last_char.match(word_valid)){
                word = word.substring(0,word.length-1);
                ended_sentence = true;
            }
            // First edit mat for last word
            if (last_word==null){
                var t = markov_starter[word];
                if (t == null){
                    markov_starter[word] = 1;
                } else {
                    markov_starter[word] ++;
                }
            } else { 
                // Else
                var t = markov_data[last_word];
                if (t==null){
                    markov_data[last_word] = {};
                }
                var t = markov_data[last_word][word];
                if (t==null){
                    markov_data[last_word][word] = 1;
                } else {
                    markov_data[last_word][word] ++;
                }
            }
            last_word = word;
            if (ended_sentence){
                last_word = null;
                var t = markov_data[word];
                if (t==null){
                    markov_data[word] = {};
                }
                var t = markov_data[word][last_char];
                if (t==null){
                    markov_data[word][last_char] = 1;
                } else {
                    markov_data[word][last_char]++;
                }
            }
        }
        // If it ended without punctuation
        if (last_word != null){
            t = markov_data[null]
            if (t==null){
                markov_data[null] = 1;
            } else {
                markov_data[null]++;
            }
        }
    }
}

var makeMarkovQuote = function (){
    var m = 50;
    var starter = false;
    var word = randomProperty(markov_starter);
    var s = word;
    var next_word = null
    while (word != null){
        m--;
        if (m==0){return s;}
        var arr = null;
        if (starter){
            arr = markov_starter;
            starter = false;
        } else {
            arr = markov_data[word];
        }
        next_word = randomProperty(arr);
        if (next_word != null){
            if (!next_word.match(word_valid)){
                s += next_word;
                starter = true;
            } else {
                s += " " + next_word;
            }
        }
        word = next_word;
    }
    return s;
}

var randomProperty = function (obj) {
    if (obj==null){return null;}
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
};

$(document).ready( function() {
    var myElem = document.getElementById('quotes');
    if (myElem != null){
        var list = document.createElement("ul");
        list.setAttribute("id","quote_list");
        myElem.appendChild(list);
        $.getJSON('quotes.json', function (data){
            inv_m = (quote_data != data);
            quote_data = data;
            $.each(quote_data, function(key, val){
                var l_item = document.createElement("li");
                list.appendChild(l_item);

                var quote_content = document.createElement("p");
                quote_content.setAttribute("id","quote_content");
                quote_content.innerHTML = key;
                l_item.appendChild(quote_content);

                var quote_name = document.createElement("p");
                quote_name.setAttribute("id","quote_name");
                quote_name.innerHTML = val;
                l_item.appendChild(quote_name);
            });
            // Rebuild markov chain
            if (inv_m){makeMarkovData();}
        });
    }

    // Make markov chain
    var myElem = document.getElementById('makequotes');
    if (myElem != null){
        var list = document.createElement("ul");
        list.setAttribute("id","quote_list");
        myElem.appendChild(list);
        if (inv_m) {
            $.getJSON('quotes.json', function (data){
                inv_m = (quote_data != data);
                quote_data = data;
                if (inv_m) {makeMarkovData();}
                for (i = 0; i < max_iters;i++){
                    var l_item = document.createElement("li");
                    list.appendChild(l_item);


                    var quote_content = document.createElement("p");
                    quote_content.setAttribute("id","quote_content");
                    quote_content.innerHTML = makeMarkovQuote();
                    l_item.appendChild(quote_content);

                    var quote_name = document.createElement("p");
                    quote_name.setAttribute("id","quote_name");
                    quote_name.innerHTML = "- Graeme Bailey";
                    l_item.appendChild(quote_name);
                }
            });
        } else {
            for (i = 0; i < max_iters;i++){
                var l_item = document.createElement("li");
                list.appendChild(l_item);

                var quote_content = document.createElement("p");
                quote_content.setAttribute("id","quote_content");
                quote_content.innerHTML = makeMarkovQuote();
                l_item.appendChild(quote_content);

                var quote_name = document.createElement("p");
                quote_name.setAttribute("id","quote_name");
                quote_name.innerHTML = "- Graeme Bailey";
                l_item.appendChild(quote_name);
            }
        }
    }
});
