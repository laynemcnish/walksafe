class UsersController < ApplicationController
  skip_before_action :ensure_current_user

  def new
    @user = User.new
  end

  def create
    @user = User.new(allowed_parameters)
    if @user.save
      redirect_to login_path
    else
      render 'users/new'
    end
  end

  private
  def allowed_parameters
    params.require(:user).permit(:username, :password, :email_address, :first_name, :last_name)
  end
end