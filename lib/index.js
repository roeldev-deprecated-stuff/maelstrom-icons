/**
 * maelstrom-icons | lib/index.js
 *
 * Streams:
 * ✓ font
 * - sprite*
 *
 * Tasks:
 * ✓ icons
 */
'use strict';

const _ = require('underscore');

// // // // // // // // // // // // // // // // // // // // // // // // // // //

module.exports = function()
{
    const self = this; // maelstrom object

    this.plugin('icons',
    {
        'file': __filename,

        /**
         * Return the location of the SVGs wich should be used to create the
         * icon font/sprite.
         */
        src: function($src)
        {
            let $defaultSrc = self.config.src.icons + '/*.svg';
            return self.utils.extendArgs($src, $defaultSrc);
        },

        /**
         * Return the location of either the fonts or the images output folder.
         */
        dest: function($type)
        {
            if (_.isEmpty($type))
            {
                $type = self.config.icons.type;
            }

            return (($type === 'sprite') ?
                    self.config.dest.images :
                    self.config.dest.fonts);
        }
    });
};
