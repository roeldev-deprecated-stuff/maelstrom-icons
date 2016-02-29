/**
* maelstrom-icons | lib/applyUnicodeFix.js
*/
'use strict';

const FileSystem = require('fs');
const Glob       = require('glob');
const Maelstrom  = require('maelstrom');
const Path       = require('path');

// // // // // // // // // // // // // // // // // // // // // // // // // // //

/**
 * Rename all icon svgs by uppercasing the filenames' unicode glyph u character.
 *
 * @return {undefined}
 */
module.exports = function applyUnicodeFix()
{
    let $prependedFiles = Glob.sync(Maelstrom.config.src.icons + '/uE*.svg');

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
