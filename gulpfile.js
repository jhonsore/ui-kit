var gulp = require('gulp');
var less = require('gulp-less');
var browsersync = require('browser-sync').create();
const spritesmith = require('gulp.spritesmith');

//https://scotch.io/tutorials/how-to-use-browsersync-for-faster-development

var PATHS = {
  styles: {
    src: 'assets/styles/less/**/*.less',
    dest: 'assets/styles/css/',
    less: 'assets/styles/less/'
  },
  images: {
    folder: 'assets/images/',
    sprites: 'assets/images/sprites/'
  }
};


var date = new Date();
var timestamp = date.getTime();

function createSprites() {
  var spriteData =
      gulp.src(PATHS.images.sprites+'*.{png,jpg}')
          .pipe(
          spritesmith(
              {
                  imgName: 'sprite.png',
                  imgPath: '../../images/sprite.png?v='+timestamp,
                  padding: 5,
                  cssName: 'sprite.less',
                  cssFormat: 'css',
                  cssOpts: {
                      cssSelector: function (item) {
                          return '.' + item.name;
                      }
                  },
                  cssVarMap: function(sprite)
                  {
                    var regexPattern, regexFind, regexSizePattern, regexSizeFind, addClass, parentAddClass;
                    var name = sprite.name;
                    sprite.bgsize = '';

                    regexSizePattern = /@([0-9]*)x/gmi;
                    regexSizeFind = regexSizePattern.exec(name);

                    if(regexSizeFind)
                    {
                        var size = regexSizeFind[1];
                        var pctSize = parseInt(regexSizeFind[1]);

                        name = String(name).replace('@'+size+'x','');
                        sprite.x = sprite.x/pctSize;
                        sprite.y = sprite.y/pctSize;
                        sprite.width = sprite.width/pctSize;
                        sprite.height = sprite.height/pctSize;
                        sprite.bgsize = 'background-size: '+(sprite.total_width/pctSize)+'px '+(sprite.total_height/pctSize)+'px';
                    }

                    if(name.indexOf("-parent_hover") > -1)
                    {
                        name = String(name).replace('-parent_hover','');
                        sprite.parent_hover = true;
                    }

                    if(name.indexOf("-hover") > -1)
                    {
                        name = String(name).replace('-hover','');
                        sprite.hover = true;
                    }

                    if(name.indexOf("-parent_add") > -1)
                    {
                        regexPattern = /-parent_add\((.*)\)/gmi;
                        regexFind = regexPattern.exec(name);
                        parentAddClass = regexFind[1];

                        if(parentAddClass)
                        {
                            name = String(name).replace('-parent_add('+parentAddClass+')','');
                            sprite.parentAdd = true;
                            sprite.parentAddClass = parentAddClass;
                        }
                    }

                    if(name.indexOf("-add") > -1)
                    {
                        regexPattern = /-add\((.*)\)/gmi;
                        regexFind = regexPattern.exec(name);
                        addClass = regexFind[1];

                        if(addClass)
                        {
                            name = String(name).replace('-add('+addClass+')','');
                            sprite.add = true;
                            sprite.addClass = addClass;
                        }
                    }

                    sprite.name = 'spt-' + name;
                  },
                  cssTemplate: PATHS.images.sprites+'css.template.handlebars'
              }
          )
      );

      spriteData.img.pipe(gulp.dest(PATHS.images.folder)); // Move a imagem gerada para o caminho especificado
      spriteData.css.pipe(gulp.dest(PATHS.styles.less)); // Move o estilo gerado para o caminho especificado

      return spriteData;
}

// tasks
gulp.task('sprite', createSprites);

function lessCompiler(){
  return gulp
  .src(PATHS.styles.src)
  .pipe(less())
  .pipe(gulp.dest(PATHS.styles.dest))
  .pipe(browsersync.reload({stream: true}));;
}

function watch(){
  gulp
    .watch(PATHS.styles.src, lessCompiler);
}

function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch([
              '!./assets/styles/less/**/*',
              './index.html'
             ])
      .on('change', browsersync.reload);
}

gulp.task('less-compiler', lessCompiler);


function watchFiles(done)
{
    gulp.watch("./assets/styles/less/**/*", lessCompiler);
    gulp.watch("./assets/images/sprites/**/*", createSprites);
    done();
}

////////////////////////////////////////////////////

gulp.task("server", gulp.parallel(watchFiles, browserSync));
