/**
 * maelstrom-icons | lib/tasks/icons.js
 */
'use strict';

module.exports = function()
{
    const self      = this; // plugin object
    const Maelstrom = this.maelstrom;
    const Config    = Maelstrom.config;
    const Gulp      = Maelstrom.gulp;

    /**
     * Create iconfonts or a sprite from seperate SVG icon files.
     */
    this.addTask('icons', function()
    {
        var $type = Config.icons.type;

        // force iconfont for now
        $type = 'font';

        return Gulp.src( self.src() )
            .pipe( Maelstrom.stream('plumber') )
            .pipe( self.stream($type) )
            // .pipe( GulpSize(Config.main.size) )
            .pipe( Maelstrom.stream('size') )
            .pipe( Gulp.dest(self.dest()) );
    });
};
