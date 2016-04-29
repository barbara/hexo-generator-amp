
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

    var foundImage = false;

    $("img").each(function(i){
      if (!foundImage) {
        var imgsrc = $(this).attr("src");

        if ($(this).css("max-width")) {
          imgWidth = $(this).css("max-width");
          // remove 'px'
          imgWidth = imgWidth.substring(0, imgWidth.length-2);
        }
        if ($(this).css("max-height")) {
          imgHeight = $(this).css("max-height");
          // remove 'px'
          imgHeight = imgHeight.substring(0, imgHeight.length-2);
        }

        if (imgHeight && imgWidth && Number(imgWidth) > 696) {
          data.eyeCatchImage = imgsrc;
          data.eyeCatchImageProperty = {
            width: imgWidth,
            height: imgHeight
          };
          foundImage = true;
        }
      }
    });

    if (data.eyeCatchImage == "" || !data.eyeCatchImageProperty) {
      if( config.generator_amp && config.generator_amp.substituteTitleImage && config.generator_amp.substituteTitleImage.path && config.generator_amp.substituteTitleImage.width  && config.generator_amp.substituteTitleImage.height ){
        data.eyeCatchImage = config.generator_amp.substituteTitleImage.path;
        data.eyeCatchImageProperty = { "width": config.generator_amp.substituteTitleImage.width , "height": config.generator_amp.substituteTitleImage.height };
      } else {
      console.log("\u001b[31m[hexo-generator-amp] Images should be at least 696 pixels wide. path: "+"\u001b[0m"+data.source);
      }
    }
  }
  return data;
};
