/**
 * maelstrom-icons | lib/streams/font.js
 */
'use strict';

const _               = require('lodash');
const FileSystem      = require('fs');
const Glob            = require('glob');
const GulpConsolidate = require('gulp-consolidate');
const GulpIconFont    = require('gulp-iconfont');
const GulpRename      = require('gulp-rename');
const Maelstrom       = require('maelstrom');
const Path            = require('path');

// // // // // // // // // // // // // // // // // // // // // // // // // // //

const TIMESTAMP = Math.round(Date.now() / 1000);

// -----------------------------------------------------------------------------

/**
 * Rename all icon svgs by uppercasing the filenames' unicode glyph u character.
 *
 * @return {undefined}
 */
function applyUnicodeFix($iconsSrc)
{
    let $prependedFiles = Glob.sync($iconsSrc + '/uE*.svg');

    for (let $i = 0, $iL = $prependedFiles.length; $i < $iL; $i++)
    {
        let $prependedFile = $prependedFiles[$i];
        let $dirName       = Path.dirname($prependedFile);
        let $fileName      = Path.basename($prependedFile);

        if ($fileName[0] === 'u')
        {
            FileSystem.renameSync($prependedFile,
                                  $dirName + '/U' + $fileName.substr(1))
        }
    }
}

// create config object
function createConfig($iconFontConfig)
{
    let $cwd    = process.cwd();
    let $config = $iconFontConfig.templateConfig;

    let $src    = Maelstrom.config.icons.templateFile;
    let $dest   = Path.resolve($cwd, Maelstrom.config.src.sass + '/maelstrom/');
    let $import = Maelstrom.config.icons.importFile;

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
        $destFile = '_icons_' + Maelstrom.config.icons.outputName + '.scss';
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
    let $map     = {};
    let $list    = [];
    let $flatMap = [];

    for (let $i = 0, $iL = $glyphs.length; $i < $iL; $i++)
    {
        let $glyph = $glyphs[$i];

        // convert unicode to \E001 etc.
        let $unicode = $glyph.unicode[0].charCodeAt();
        $unicode = $unicode.toString(16).toUpperCase();

        $glyph.content         = $unicode;
        // $glyph.classNamePrefix = $config.className + '-';
        $glyph.className       = $glyph.name;

        $map[$glyph.className] = $glyph;
        $list.push($glyph);
        $flatMap.push($glyph.className + ': ' + $glyph.content);
    }

    return {
        'map':     $map,
        'list':    $list,
        'flatMap': $flatMap
    };
}

// -----------------------------------------------------------------------------

module.exports = function($templateConfig)
{
    let $config = _.assignIn({}, Maelstrom.config.icons.iconfont,
    {
        'fontName':       Maelstrom.config.icons.outputName,
        'templateConfig': $templateConfig,
        'timestamp':      TIMESTAMP
    });

    if (Maelstrom.config.icons.applyUnicodeFix)
    {
        applyUnicodeFix(Maelstrom.config.src.icons);
    }

    return GulpIconFont($config).on('glyphs', function($glyphs, $iconFontConfig)
    {
        let $config  = createConfig($iconFontConfig);
        let $dest    = seperateDest($config);

        $config.dest   = $dest.path;
        $config.glyphs = prepareGlyphs($config, $glyphs);

        // template -> sass import file
        return Maelstrom.gulp.src($config.src)
            .pipe( Maelstrom.stream('plumber') )
            .pipe( GulpConsolidate('lodash', $config) )
            .pipe( GulpRename($dest.file) )
            .pipe( Maelstrom.stream('size') )
            .pipe( Maelstrom.gulp.dest($dest.dir) );
    });
};
