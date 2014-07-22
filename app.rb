require "sinatra"
require "active_record"
require "rack-flash"
require "gschool_database_connection"
require './lib/users_table'

class App < Sinatra::Application
  enable :sessions
  use Rack::Flash

  def initialize
    super
    @users_table = UsersTable.new(GschoolDatabaseConnection::DatabaseConnection.establish(ENV["RACK_ENV"]))
  end

  get "/" do
    if session[:user]
      redirect "/home"
    end
      erb :loggedout
  end

  get "/home" do
    @users = @users_table.user_setter
    erb :loggedin, :locals => {:users => @users}
  end

  get "/signup" do
    erb :signup
  end

  post "/signup" do
    @users = @users_table.add_user(params[:username], params[:first_name], params[:last_name], params[:email_address], params[:password])
    redirect "/login"
  end

  get "/login" do
    erb :login
  end

  post "/login" do
    user = @users_table.find_user(params[:username], params[:password])

    if user != nil
      session[:user] = user
      redirect "/signup"

    elsif params[:username] == "" && params[:password] == ""
      flash[:error] = "Username and password required."
      redirect "/signup"

    elsif params[:username] == ""
      flash[:error] = "Username required."
      redirect "/signup"

    elsif params[:password] == ""
      flash[:error] = "Password required."
      redirect "/signup"
    end
    session[:user]
    redirect "/home"
  end

  post "/logout" do
    session.delete(:user)
    redirect "/"
  end
end

