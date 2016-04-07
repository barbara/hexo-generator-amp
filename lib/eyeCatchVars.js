
'use strict';
var cheerio = require('cheerio');

module.exports = function(data){

  //------------------
  // get eye catch image
  //------------------
  var excludeTest = /^\_posts\//;
  var imgWidth;
  var imgHeight;
  var isIncompleteProperty = false;
  var config = this.config;
  var $ = cheerio.load(data.content);
  data.eyeCatchImage = "";

  if( excludeTest.test( data.source ) ){

    // debug
    // console.log("[hexo-generator-amp eyeCatchVars.js] " + data.layout + " " + data.source);

    $("img").each(function(i){
      if(i == 0){
        var imgsrc = $(this).attr("src");
        data.eyeCatchImage = imgsrc;

        if( $(this).attr("width") ){
          imgWidth = $(this).attr("width");
        }
        if($(this).attr("height")){
          imgHeight = $(this).attr("height");
        }else if($(this).attr("data-height")){
          imgHeight = $(this).attr("data-height");
        }

        if(imgHeight && imgWidth){
          data.eyeCatchImageProperty = { "width":imgWidth , "height":imgHeight };
        }

      }
    });

    if(data.eyeCatchImage == "" || !data.eyeCatchImageProperty){
      //console.log("\u001b[31m[hexo-generator-amp] .md should contain image file and width height element. path: "+ "\u001b[0m" +data.source);
      isIncompleteProperty = true;
    }
    //if( Number(imgWidth) < 630 ){
    //  console.log("\u001b[31m[hexo-generator-amp] Images should be at least 696 pixels wide. path: "+"\u001b[0m"+data.source);
    //  isIncompleteProperty = true;
    //}

    if(isIncompleteProperty){
      if( config.generator_amp && config.generator_amp.substituteTitleImage && config.generator_amp.substituteTitleImage.path && config.generator_amp.substituteTitleImage.width  && config.generator_amp.substituteTitleImage.height ){
        data.eyeCatchImage = config.generator_amp.substituteTitleImage.path;
        data.eyeCatchImageProperty = { "width": config.generator_amp.substituteTitleImage.width , "height": config.generator_amp.substituteTitleImage.height };
      }
    }
  }

  return data;

};
