require 'fileutils'
include FileUtils

ROOT = __dir__.freeze
BIN = "#{ROOT}/node_modules/.bin".freeze

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

  sh "tsc -p #{ROOT}/browser"
end

task :build_renderer_src do
  directory 'build/renderer'
  sh "#{BIN}/browserify -g babelify -o #{ROOT}/build/renderer/index.js #{ROOT}/renderer/index.jsx"
end

task :build_plugin_src do
  Dir['plugin/*'].each do |d|
    if File.exists?("#{d}/src/sink.jsx")
      sh "#{BIN}/browserify -g babelify -o #{d}/sink.js #{d}/src/sink.jsx"
    end
    if File.exists?("#{d}/src/source.js")
      sh "#{BIN}/babel -o #{d}/source.js #{d}/src/source.js"
    end
    if File.exists?("#{d}/src/tsconfig.json")
      ensure_cmd 'tsc'
      sh "tsc -p #{d}/src"
    end
  end
  # TODO: Currently nothing to do
end

task :build => %i(dep build_browser_src build_renderer_src build_plugin_src)

