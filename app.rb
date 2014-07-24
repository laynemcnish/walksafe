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
    @users = @users_table.user_setter

    erb :home, :locals => {:users => @users}
  end

  # get "/home" do
  #   @users = @users_table.user_setter
  #
  #   erb :home, :locals => {:users => @users}
  # end

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

  post "/sessions" do
    user = @users_table.find_user(params[:username], params[:password])

    if user != nil
      session[:user] = user
      redirect "/"

    elsif params[:username] == "" && params[:password] == ""
      flash[:error] = "Username and password required."
      redirect "/login"

    elsif params[:username] == ""
      flash[:error] = "Username required."
      redirect "/login"

    elsif params[:password] == ""
      flash[:error] = "Password required."
      redirect "/login"

    elsif user == nil
      flash[:error] = "Login Info is incorrect"
      redirect "/login"

    end
    session[:user]
    redirect "/"

  end

  get "/logout" do
    session.delete(:user)
    redirect "/"
  end
end