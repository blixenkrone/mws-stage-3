/*
 After you have changed the settings at "Your code goes here",
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = (grunt) => {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            size: 'small',
            width: 540,
            quality: 80
          }]
        },
        files: [{
          expand: true,
          src: ['imgs/*.{gif,jpg,png}'],
          custom_dest: 'dist/imgs'
          // cwd: '/src/assets/images_src',
        }]
      }
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['/img']
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', ['mkdir', 'copy', 'responsive_images']);

};