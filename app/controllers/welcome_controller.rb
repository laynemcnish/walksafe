class WelcomeController < ApplicationController
  skip_before_action :ensure_current_user

def index
@user = current_user
end
end