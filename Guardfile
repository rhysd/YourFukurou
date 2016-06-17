ignore /^node_modules/, /^build/, /^typings/

def timestamp(file)
  puts "\033[93m#{Time.now}: #{file}\033[0m"
end

def npm_run(task)
  cmd = "npm run #{task}"
  puts cmd
  success = system cmd
  puts (
    if success
      "\033[92mOK\033[0m\n\n"
    else
      "\033[91mFAIL\033[0m\n\n"
    end
  )
  success
end

guard :shell do
  watch %r[^main/.+\.ts$] do |m|
    timestamp m[0]
    npm_run 'build-main'
  end

  watch %r[^renderer/.+\.tsx?$] do |m|
    timestamp m[0]
    npm_run 'build-renderer'
  end

  watch %r[^test/e2e/.+\.ts$] do |m|
    timestamp m[0]
    npm_run 'build-e2e-test'
  end

  watch %r[^test/unit/renderer/.+\.tsx?$] do |m|
    f = m[0]
    timestamp f
    return unless npm_run 'build-unit-test'
    t = "test/unit/renderer/js/#{File.dirname f}/#{File.basename(f, File.extname(f))}.js"
    if File.exist? t
      puts "ava #{t}"
      system "./node_modules/.bin/ava", t
    else
      puts "Not found, ava skipped: #{t}"
    end
  end
end
