require 'rubygems'
require 'sinatra'

configure do
  DIRECTORY_INDEXES = ["index.html","index.xhtml","index.htm"]
end


helpers do

  def directory_index(path_info)
    content = nil
    
    DIRECTORY_INDEXES.each do |index_file|
      
      dir_index = File.join("public",path_info,index_file)
      
      if File.exists? dir_index
        content_type 'application/xhtml+xml' if index_file.include? ".xhtml"
        content = File.read(dir_index)
        break
      end    
    end    

    return content
  end
  
end


not_found do
  has_content = directory_index(env['PATH_INFO'])
  
  halt 200, has_content if has_content  
end


get '/' do
  directory_index('')
end
