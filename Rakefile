require 'fileutils'
include FileUtils

def cmd_exists?(cmd)
  File.exists?(cmd) && File.executable?(cmd)
end

def ensure_cmd(cmd)
  $cmd_cache ||= []
  return true if $cmd_cache.include? cmd

  paths = ENV['PATH'].split(':').uniq
  unless paths.any?{|p| cmd_exists? "#{p}/#{cmd}" }
    raise "'#{cmd}' command doesn't exist"
  else
    $cmd_cache << cmd
  end
end

file "node_modules" do
  ensure_cmd 'npm'
  sh 'npm install --dev'
end

task :dep => %i(node_modules)

file "typings" do
  ensure_cmd 'tsd'
  sh 'tsd install'
end

task :build_browser_src => %i(typings) do
  ensure_cmd 'tsc'

  sh 'tsc -p browser'
end

task :build_renderer_src do
  directory 'build/renderer'
  sh './node_modules/.bin/browserify -g babelify -o build/renderer/index.js renderer/index.jsx'
end

task :build_plugin_src do
  # TODO: Currently nothing to do
end

task :build => %i(dep build_browser_src build_renderer_src build_plugin_src)

