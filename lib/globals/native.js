/**
 *  Global exports
 */
if (typeof Function.prototype.partial != "function"){

  Function.prototype.partial = function(){

    var fn = this, args = Array.prototype.slice.call(arguments);
    return function(){
      var idx = 0, new_args = [];
      for(var i = 0, len = args.length; i < len ; i++){

        new_args[i] = args[i] === undefined ? arguments[idx++] : args[i];
      }
      return fn.apply(this, new_args);
    }
  };
}


if (typeof RegExp.quote != "function"){
  RegExp.quote = function(string){
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
  };
}