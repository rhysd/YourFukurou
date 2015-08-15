ignore /^node_modules/, /^build/, /^typings/, /^bower_components/

guard :shell do
  watch /^browser\/.+\.ts$/ do |m|
    system 'rake build_browser_src'
  end

  watch /^renderer\/.+\.jsx$/ do |m|
    system 'rake build_renderer_src'
  end
end
