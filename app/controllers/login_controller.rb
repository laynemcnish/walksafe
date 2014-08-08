class LoginController < ApplicationController
  skip_before_action :ensure_current_user

  def new
    @user = User.new
  end

  def create
    @user = User.find_by(username: params[:user][:username])
    if  @user && @user.password == params[:user][:password]
      session[:user_id] = @user.id
      redirect_to maps_path
    else
      @user = User.new(username: params[:user][:username])
      @user.errors[:base] << "Username / password is invalid"
      render :new
    end
  end

  def show

  end

  def destroy
    session.destroy
    redirect_to signin_path
  end

  private
  def allowed_parameters
    params.require(:user).permit(:username, :password)
  end
end