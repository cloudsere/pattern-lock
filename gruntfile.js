/*
* @Author: heqingqiu
* @Date:   2017-03-29 14:48:34
* @Last Modified by:   cloudseer
* @Last Modified time: 2017-03-29 14:57:40
*/

'use strict';
module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		uglify:{
			dist:{
				files:{
					'js/mainmin.js':['js/main.js']
				}
			}
		},
		cssmin:{
			target:{
				files:{
					'css/mainmin.css':['css/main.css']
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default',['cssmin','uglify']);
}