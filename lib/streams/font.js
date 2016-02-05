/**
 * maelstrom-icons | lib/streams/font.js
 */
'use strict';

const _               = require('underscore');
const GulpConsolidate = require('gulp-consolidate');
const GulpIconFont    = require('gulp-iconfont');
const GulpRename      = require('gulp-rename');
const Path            = require('path');

// // // // // // // // // // // // // // // // // // // // // // // // // // //

module.exports = function()
{
    const Maelstrom = this.maelstrom;
    const Config    = Maelstrom.config;
    const Gulp      = Maelstrom.gulp;
    const Utils     = Maelstrom.utils;

    // -------------------------------------------------------------------------

    // create config object
    function createConfig($iconFontConfig)
    {
        let $cwd    = process.cwd();
        let $config = $iconFontConfig.templateConfig;

        let $src    = Config.icons.templateFile;
        let $dest   = Path.resolve($cwd, Config.src.sass + '/maelstrom/');
        let $import = Config.icons.importFile;

        $src = (Path.isAbsolute($src) ?
                Path.normalize($src) :
                Path.resolve($cwd, $src));

        let $defaultConfig = {
            'src':        $src,
            'dest':       $dest,
            'fontName':   $iconFontConfig.fontName,
            'fontPath':   '/fonts/',
            'className':  'icon'
        };

        if (!$config || !_.isObject($config))
        {
            $config = $defaultConfig;
        }
        else
        {
            if (!_.isUndefined($config.dest))
            {
                $config.dest = Path.resolve($cwd, $config.dest);
            }

            // make sure all default config options are set
            $config = _.extendOwn($defaultConfig, $config);
        }

        if ($import)
        {
            if (!Path.isAbsolute($import))
            {
                $import = Path.resolve($cwd, $import);
            }

            $import = Path.relative($config.dest, $import);
        }

        $config.importFile = $import.replace(/\\/g, '/');
        return $config;
    }

    // seperate dest file from dir
    function seperateDest($config)
    {
        let $destFile = Path.basename($config.dest);
        let $destDir  = Path.dirname($config.dest);

        // when no filename is set in the dest path, the basename is the last dir
        // in the path. check if this is the case and add the dir back to the
        // dest path. set dest file as empty so we can set the default one.
        if (Path.extname($destFile) === '')
        {
            $destDir += Path.sep + $destFile;
            $destFile = '';
        }

        // check file name and set a default one if needed
        if (_.isEmpty($destFile))
        {
            $destFile = '_icons_' + Config.icons.outputName + '.scss';
        }
        else
        {
            // add underscore in front of filename to indicate it's a sass import
            // file
            if ($destFile.substr(0, 1) !== '_')
            {
                $destFile = '_' + $destFile;
            }
            // add scss file extension when not defined
            if (Path.extname($destFile) !== '.scss' &&
                Path.extname($destFile) !== '.sass')
            {
                $destFile += '.scss';
            }
        }

        return {
            'file': $destFile,
            'dir':  $destDir,
            'path': $destDir + Path.sep + $destFile
        };
    }

    // create a valid value to be placed in the css content property
    function prepareGlyphs($config, $glyphs)
    {
        for (let $i = 0, $iL = $glyphs.length; $i < $iL; $i++)
        {
            let $glyph = $glyphs[$i];

            // convert unicode to \E001 etc.
            let $unicode = $glyph.unicode[0].charCodeAt();
            $unicode = $unicode.toString(16).toUpperCase();

            $glyph.content   = $unicode;
            $glyph.className = $config.className +'-'+ $glyph.name;

            $glyphs[$i] = $glyph;
        }

        return $glyphs;
    }

    // -------------------------------------------------------------------------

    /**
     * Create iconfonts from seperate SVG icon files. The names and glyphs of
     * the SVGs are written to a Sass import file.
     */
    this.addStream('font', function($templateConfig)
    {
        let $config = _.extendOwn({}, Config.icons.iconfont,
        {
            'fontName':       Config.icons.outputName,
            'templateConfig': $templateConfig,
            // 'timestamp':      Math.round(Date.now()/1000),
        });

        return GulpIconFont($config)
            .on('glyphs', function iconfontOnGlyphs($glyphs, $iconFontConfig)
            {
                let $config = createConfig($iconFontConfig);
                let $dest   = seperateDest($config);

                $config.dest   = $dest.path;
                $config.glyphs = prepareGlyphs($config, $glyphs);

                // template -> sass import file
                return Gulp.src($config.src)
                    .pipe( Maelstrom.stream('plumber') )
                    .pipe( GulpConsolidate('lodash', $config) )
                    .pipe( GulpRename($dest.file) )
                    .pipe( Maelstrom.stream('size') )
                    .pipe( Gulp.dest($dest.dir) );
            });
    });
};
