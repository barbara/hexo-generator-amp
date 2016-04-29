'use strict';

var ejs        = require('ejs');
var pathFn     = require('path');
var fs         = require('fs');
var ampTmplSrc = pathFn.join(__dirname, '../amp.ejs');
var template   = ejs.compile(fs.readFileSync(ampTmplSrc, 'utf8'), {filename:__dirname});

module.exports = function(locals){

  var config = this.config;
  var cssTxt = "";

  if(config.generator_amp && config.generator_amp.cssFilePath){
    var cssFilePath = pathFn.join(process.env.PWD ,config.generator_amp.cssFilePath);
    var cssTxt      = fs.readFileSync(cssFilePath, 'utf8');
    cssTxt          = cssTxt.replace(/\@charset\s\"(UTF\-8|utf\-8)\"\;/g,"").replace(/\!important/g,"").replace(/((?!\s|\;|\{).)*?zoom\:.*?;/g,"");
  }
  return locals.posts.map(function(post){

    // debug
    // console.log("[hexo-generator-amp generator.js] " + data.layout + " " + data.source);

    var i                   = 0;
    var replaceStr          = post.content;
    var isYoutubeContain    = false;
    var isSimplecastContain = false;
    var isVimeoContain      = false;

    //------------------------------------
    // escape
    //------------------------------------
    // figure tag
    var figureEscArr = [];
    var figureMatch  = replaceStr.match(/\<figure\s.*?\<\/figure\>/g);
    if(figureMatch){
      for(i=0; i<figureMatch.length; i++){
        replaceStr = replaceStr.replace(figureMatch[i],"<!--figure"+i+"-->");
        figureEscArr.push(figureMatch[i]);
      }
    }

    //------------------------------------
    // Sanitize tag
    //------------------------------------
    replaceStr = replaceStr.replace(/\<style\>.*?\<\/style\>/g, "");
    replaceStr = replaceStr.replace(/\<script\>.*?\<\/script\>/g, "");
    replaceStr = replaceStr.replace(/\<div\s.*?\>/g, "");
    replaceStr = replaceStr.replace(/\<\/div\>/g, "");
    replaceStr = replaceStr.replace(/\<span\s.*?\>/g, "");
    replaceStr = replaceStr.replace(/\<\/span\>/g, "");

    //delete a tag
    replaceStr = replaceStr.replace(/\<a\s((?!>).)*?\>\<\/a\>/g, "");



    //------------------------------------
    // figure return
    //------------------------------------
    var figureMatch  = replaceStr.match(/\<\!\-\-figure[0-9]+\-\-\>/g);
    if(figureMatch){
      for(i=0; i<figureMatch.length; i++){
        var figureID = figureMatch[i].match(/[0-9]+/);
        replaceStr = replaceStr.replace( figureMatch[i] , figureEscArr[Number(figureID[0])] );
      }
    }

    //------------------------------------
    // img
    //------------------------------------
    var imgSrc    = "";
    var imgWidth  = "";
    var imgHeight = "";
    var imgMatch  = replaceStr.match(/\<img\s.*?\>/g);

    if(imgMatch){
      for(i=0; i<imgMatch.length; i++){

        var imgDataMatch = imgMatch[i].match(/data\-original\=\".*?\"/g);
        if(imgDataMatch && imgDataMatch.length > 0){
          imgSrc = imgDataMatch[0].replace("data-original=","src=");
        }else{
          imgDataMatch = imgMatch[i].match(/src\=\".*?\"/g);
          if(imgDataMatch){
            imgSrc = imgDataMatch[0];
          }
        }


        imgDataMatch = imgMatch[i].match(/max\-width\:\s?([0-9]+)px/);
        imgWidth = imgDataMatch[1];

        imgDataMatch = imgMatch[i].match(/max\-height\:\s?([0-9]+)px/);
        imgHeight = imgDataMatch[1];

        if(imgSrc == "" || imgWidth == "" || imgHeight == ""){
          console.log("\u001b[31m[hexo-generator-amp] .md should contain image file and width height element. path: "+"\u001b[0m"+post.source);
        }
        replaceStr = replaceStr.replace(imgMatch[i], '<div class="minsh-img"><amp-img '+ imgSrc +' width="'+ imgWidth +'" height="'+ imgHeight +'" layout="responsive"></amp-img></div>');

      }
    }


    //------------------------------------
    // youtube (1920 x 1080)
    //------------------------------------
    var youtubeMatch  = replaceStr.match(/\<iframe\swidth="500"\sheight="281"\sid="youtube_iframe"\ssrc\=\"https\:\/\/www\.youtube\.com\/embed\/[0-9a-zA-Z]+\?feature\=oembed\&amp\;enablejsapi\=1\&amp\;wmode\=opaque\"\sframeborder\=\"0\"\sallowfullscreen\>\<\/iframe\>/g);
    if(youtubeMatch){
      for(i=0; i<youtubeMatch.length; i++){
        var youtube_id = youtubeMatch[i].match(/\/embed\/([0-9a-zA-Z]+)\?/);
        replaceStr = replaceStr.replace(youtubeMatch[i],'<amp-youtube data-videoid="'+youtube_id[1]+'" width="500" height="281" layout="responsive"></amp-youtube>');
        isYoutubeContain = true;
      }
    }

    //------------------------------------
    // vimeo (1920 x 1080)
    //------------------------------------
    var vimeoMatch  = replaceStr.match(/\<iframe\ssrc\=\"\/\/player\.vimeo\.com\/video\/[0-9a-zA-Z]+\"\sframeborder\=\"0\"\sallowfullscreen\>\<\/iframe\>/g);
    if(vimeoMatch){
      for(i=0; i<vimeoMatch.length; i++){
        var vimeo_id = vimeoMatch[i].match(/\/video\/([0-9a-zA-Z]+)\"/);
        replaceStr     = replaceStr.replace(vimeoMatch[i],'<amp-vimeo data-videoid="'+vimeo_id[1]+'" width="1920" height="1080" layout="responsive"></amp-vimeo>');
        isVimeoContain = true;

      }
    }

    //------------------------------------
    // simplecast iframe (1920 x 1080)
    //------------------------------------
    var simplecastMatch = replaceStr.match(/\<iframe\sframeborder\=\"0\"\sheight\=\"36px\"\swidth\=\"100\%\"\ssandbox\=\"allow-scripts\sallow-same-origin\sallow-popups\sallow-popups-to-escape-sandbox\"\slayout\=\"responsive\"\sscrolling\=\"no\"\sseamless\ssrc\=\"https\:\/\/simplecast\.fm\/e\/[0-9]+\?style\=light\"\splaceholder\=\"[0-9a-zA-Z\/\-\.]+\"\>\<\/iframe\>/g);
    if(simplecastMatch) {
      for(i=0; i<simplecastMatch.length; i++){

        var simplecast_id = simplecastMatch[i].match(/\/e\/([0-9]+)\?/);
        var simplecast_placeholder = simplecastMatch[i].match(/placeholder\=\"([0-9a-zA-Z\/\-\.]+)\"/);
        replaceStr = replaceStr.replace(simplecastMatch[i], '<amp-iframe width=600 height=36 sandbox="allow-scripts allow-same-origin" layout="responsive" frameborder="0" src="https://simplecast.fm/e/' + simplecast_id[1] +'?style=light"><amp-img layout="fill" src="'+ simplecast_placeholder[1] +'" placeholder></amp-img></amp-iframe>');

        isSimplecastContain = true;
      }
    }

    // get year
    var nowD = new Date();
    var yy   = nowD.getFullYear();

    //datePublished
    var pd    = new Date(post.date);
    var pdStr = pd.getFullYear() + "-"+ (pd.getMonth() + 1) + "-" + pd.getDate()
    var xml   = template({
      config          : config ,
      post            : post ,
      content         : replaceStr ,
      cssTxt          : cssTxt ,
      copyrightDate   : yy ,
      datePublished   : pdStr ,
      isYoutubeContain: isYoutubeContain ,
      isSimplecastContain: isSimplecastContain ,
      isVimeoContain  : isVimeoContain

    });

    return {
      path: post.path+"index.amp.html",
      data: xml
    };
  });
};
